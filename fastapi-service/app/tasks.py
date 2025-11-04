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
        return summary_data

