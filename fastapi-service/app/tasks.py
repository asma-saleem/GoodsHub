import os
import csv
import json
import uuid
import redis
from datetime import datetime, time, timezone
from collections import defaultdict

from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import SessionLocal
from .celery_app import celery_app
from .models import (
    Order, OrderItem, OrderSummary,
    Product, ProductVariant
)
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.from_url(REDIS_URL)

def calculate_order_summary(db: Session):
    buffer = timedelta(microseconds=1)
    now = datetime.now(timezone.utc)
    existing_summary = db.query(OrderSummary).first()

    if existing_summary:
        last_updated = existing_summary.updatedAt + buffer
        new_orders_query = db.query(Order).filter(Order.createdAt > last_updated)
        new_orders = new_orders_query.all()
        logger.info(f"Orders fetched for summary: {[{'id': o.id, 'createdAt': o.createdAt} for o in new_orders]}")

    else:
        last_updated = None
        new_orders_query = db.query(Order)  

    new_order_result = new_orders_query.with_entities(
        func.count(Order.id),
        func.coalesce(func.sum(Order.total), 0)
    ).one()
    new_total_orders, new_total_amount = new_order_result

    new_total_units = db.query(func.coalesce(func.sum(OrderItem.quantity), 0))\
        .join(Order, Order.id == OrderItem.order_id)\
        .filter(Order.createdAt > last_updated if last_updated else True)\
        .scalar() or 0

    if existing_summary:
        existing_summary.totalOrders += new_total_orders
        existing_summary.totalUnits += new_total_units
        existing_summary.totalAmount += new_total_amount
        existing_summary.updatedAt = now
    else:
        new_summary = OrderSummary(
            date=now,
            totalOrders=new_total_orders,
            totalUnits=new_total_units,
            totalAmount=new_total_amount,
            updatedAt=now
        )
        db.add(new_summary)

    db.commit()

    summary_data = {
        "totalOrders": existing_summary.totalOrders if existing_summary else new_total_orders,
        "totalUnits": existing_summary.totalUnits if existing_summary else new_total_units,
        "totalAmount": existing_summary.totalAmount if existing_summary else new_total_amount
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
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    db = SessionLocal()
    try:
        rows_chunk = []
        current_index = 0

        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            required_headers = {"title", "image", "price", "color", "colorCode", "stock", "size"}
            csv_headers = set(reader.fieldnames or [])
            missing = required_headers - csv_headers

            if missing:
                error_msg = f"Invalid CSV Format. Missing headers: {', '.join(missing)}"
                print(error_msg)

                r.set(
                    f"csv_upload_status:{file_uuid}",
                    json.dumps({"status": "failed", "error": error_msg})
                )
                return

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
        
        seen_variants = set()
        for row in rows_chunk:
            title = row["title"].strip()
            color = row.get("color")
            size = row.get("size")

            key = (title, color, size)
            if key in seen_variants:
                print(f"Skipping duplicate in CSV: {key}")
                continue

            seen_variants.add(key)

            product = db.query(Product).filter(Product.title == title).first()
            if not product:
                product = Product(id=str(uuid.uuid4()), title=title)
                db.add(product)
                db.flush()
                print(f"Created Product: {title}")

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
