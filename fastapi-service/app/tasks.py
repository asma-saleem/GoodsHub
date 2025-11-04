import os
import csv
import json
import uuid
import redis
from datetime import datetime, timezone

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

    # 🔹 Step 1: Fetch existing summary (only one row)
    existing_summary = db.query(OrderSummary).first()

    # Agar koi summary nahi hai (first run)
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
        # 🔹 Step 2: Naye orders since last update
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

        # 🔹 Step 3: Count new data
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

        # 🔹 Step 4: Add to existing totals
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

    # 🔹 Step 5: Update Redis
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
def process_csv_task(file_path: str, file_uuid: str = None, start_index: int = 0):
    """
    Efficient chunked CSV processor using Celery async scheduling.
    """
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    db = SessionLocal()
    try:
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            products = {}

            for row in reader:
                title = row["title"].strip()
                products.setdefault(title, []).append(row)

            product_items = list(products.items())
            chunk_size = 5
            total_chunks = (len(product_items) + chunk_size - 1) // chunk_size

            chunk = product_items[start_index:start_index + chunk_size]

            for title, variants in chunk:

                product = db.query(Product).filter(Product.title == title).first()
                if not product:
                    product = Product(id=str(uuid.uuid4()), title=title)
                    db.add(product)
                    db.flush()  # get product.id quickly
                else:
                    print(f"✅ Product already exists: {title}")

                variant_objects = [
                    ProductVariant(
                        productId=product.id,
                        color=v.get("color"),
                        colorCode=v.get("colorCode"),
                        size=v.get("size"),
                        image=v.get("image"),
                        price=float(v.get("price", 0)),
                        stock=int(v.get("stock", 0)),
                    )
                    for v in variants
                ]
                db.add_all(variant_objects)

            db.commit()
            print(f"Processed chunk {start_index // chunk_size + 1}/{total_chunks}")

            r.set(
                f"csv_upload_status:{file_uuid}",
                json.dumps({
                    "status": "in-progress",
                    "processed_chunks": start_index // chunk_size + 1,
                    "total_chunks": total_chunks,
                })
            )

            next_index = start_index + chunk_size
            if next_index < len(product_items):
                process_csv_task.apply_async(
                    args=[file_path, file_uuid, next_index],
                    countdown=2 
                )
            else:
                r.set(
                    f"csv_upload_status:{file_uuid}",
                    json.dumps({
                        "status": "completed",
                        "total_products": len(products)
                    })
                )
                print("CSV import completed!")

    except Exception as e:
        db.rollback()
        r.set(f"csv_upload_status:{file_uuid}",
              json.dumps({"status": "failed", "error": str(e)}))
        raise
    finally:
        db.close()
