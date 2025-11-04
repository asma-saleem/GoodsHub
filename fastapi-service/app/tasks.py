# app/tasks.py
import os
import json
import redis
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import SessionLocal
from .celery_app import celery_app
from .models import Order, OrderItem, OrderSummary

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.from_url(REDIS_URL)

def calculate_order_summary(db: Session):
    now = datetime.now(timezone.utc)

    existing_summary = db.query(OrderSummary).first()
    if not existing_summary:
        total_orders = db.query(Order.id).count()
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
        last_update = existing_summary.updatedAt
        new_orders = db.query(Order).filter(Order.createdAt > last_update).all()

        if not new_orders:
            print("No new orders since last update.")
            return {
                "totalOrders": existing_summary.totalOrders,
                "totalUnits": existing_summary.totalUnits,
                "totalAmount": existing_summary.totalAmount,
            }

        new_order_ids = [o.id for o in new_orders]
        new_units = db.query(func.sum(OrderItem.quantity)).filter(OrderItem.id.in_(new_order_ids)).scalar() or 0
        new_amount = db.query(func.sum(Order.total)).filter(Order.id.in_(new_order_ids)).scalar() or 0
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

