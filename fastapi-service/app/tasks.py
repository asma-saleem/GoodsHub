import os
import csv
import json
import uuid
import redis
from datetime import datetime, timezone
from collections import defaultdict

from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import SessionLocal
from .celery_app import celery_app
from .models import (
    Order, OrderItem, OrderSummary,
    Product, ProductVariant
)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.from_url(REDIS_URL)

def calculate_order_summary(db: Session):
    """
    # Har 1 minute:
    #   - Orders, Units, Amount database se calculate karo
    #   - OrderSummary table me update/add karo (aaj ki date ka record)
    #   - Redis me cumulative total store karo
    # """

    now = datetime.now(timezone.utc)
    existing_summary = db.query(OrderSummary).first()
    if not existing_summary:
        total_orders = db.query(func.count(Order.id)).scalar() or 0
        total_amount = db.query(func.sum(Order.total)).scalar() or 0
        total_units = db.query(func.sum(OrderItem.quantity)).scalar() or 0

        new_summary = OrderSummary(
            date=now,
            totalOrders=total_orders,
            totalUnits=total_units,
            totalAmount=total_amount
        )
        db.add(new_summary)
        db.commit()

        summary_data = {
            "totalOrders": total_orders,
            "totalUnits": total_units,
            "totalAmount": total_amount
        }

    else:
        last_update_time = existing_summary.updatedAt

        new_orders = (
            db.query(Order)
            .filter(Order.createdAt > last_update_time)
            .all()
        )

        if not new_orders:
            print("No new orders since last update.")
            return {
                "totalOrders": existing_summary.totalOrders,
                "totalUnits": existing_summary.totalUnits,
                "totalAmount": existing_summary.totalAmount,
            }
        new_order_ids = [o.id for o in new_orders]

        new_units = (
            db.query(func.sum(OrderItem.quantity))
            .filter(OrderItem.id.in_(new_order_ids))
            .scalar()
            or 0
        )
        new_amount = (
            db.query(func.sum(Order.total))
            .filter(Order.id.in_(new_order_ids))
            .scalar()
            or 0
        )
        new_count = len(new_orders)

        existing_summary.totalOrders += new_count
        existing_summary.totalUnits += new_units
        existing_summary.totalAmount += new_amount
        existing_summary.updatedAt = now
        db.commit()

        summary_data = {
            "totalOrders": existing_summary.totalOrders,
            "totalUnits": existing_summary.totalUnits,
            "totalAmount": existing_summary.totalAmount
        }

    r.set("latest_order_summary", json.dumps(summary_data))
    r.set("last_summary_time", now.isoformat())

    print(f"Updated summary @ {now}: {summary_data}")
    return summary_data

@celery_app.task(bind=True, name="app.tasks.calculate_order_summary_task")
def calculate_order_summary_task(self):
    db = SessionLocal()
    try:
        return calculate_order_summary(db)
    finally:
        db.close()

@celery_app.task(name="app.tasks.process_csv_task")
def process_csv_task(file_path: str, file_uuid: str = None, start_index: int = 0, chunk_size: int = 5):
    """
    Simple CSV processor: reads chunk_size rows at a time and inserts into DB.
    Avoids inserting duplicate variants (same color + size for a product).
    Prints memory read and DB insert info.
    """
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    db = SessionLocal()
    try:
        rows_chunk = []
        current_index = 0

        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            for _ in range(start_index):
                next(reader, None)
                current_index += 1

            for row in reader:
                rows_chunk.append(row)
                current_index += 1
                if len(rows_chunk) >= chunk_size:
                    break

        if not rows_chunk:
            r.set(
                f"csv_upload_status:{file_uuid}",
                json.dumps({"status": "completed", "total_rows": start_index})
            )
            print(" CSV import completed!")
            return

        print(f" Loaded {len(rows_chunk)} rows into memory (start_index={start_index})")
        inserted_count = 0

        for row in rows_chunk:
            title = row["title"].strip()

            product = db.query(Product).filter(Product.title == title).first()
            if not product:
                product = Product(id=str(uuid.uuid4()), title=title)
                db.add(product)
                db.flush()
                print(f"🆕 Created Product: {title}")

            exists = db.query(ProductVariant).filter(
                ProductVariant.productId == product.id,
                ProductVariant.color == row.get("color"),
                ProductVariant.size == row.get("size")
            ).first()

            if exists:
                print(f" Variant already exists for {title} - Color: {row.get('color')}, Size: {row.get('size')}")
                continue

            variant = ProductVariant(
                productId=product.id,
                color=row.get("color"),
                colorCode=row.get("colorCode"),
                size=row.get("size"),
                image=row.get("image"),
                price=float(row.get("price", 0)),
                stock=int(row.get("stock", 0)),
            )
            db.add(variant)
            inserted_count += 1
            print(f" Added Variant for {title} - Color: {row.get('color')}, Size: {row.get('size')}")

        db.commit()
        if inserted_count > 0:
            print(f" Inserted {inserted_count} row/rows into DB (start_index={start_index})")

        r.set(
            f"csv_upload_status:{file_uuid}",
            json.dumps({
                "status": "in-progress",
                "processed_rows": current_index
            })
        )
        process_csv_task.apply_async(
            args=[file_path, file_uuid, current_index, chunk_size],
            countdown=1
        )

    except Exception as e:
        db.rollback()
        r.set(f"csv_upload_status:{file_uuid}",
              json.dumps({"status": "failed", "error": str(e)}))
        raise
    finally:
        db.close()
