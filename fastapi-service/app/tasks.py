# app/tasks.py
import os
import json
import redis
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from .database import SessionLocal
from .celery_app import celery_app
from .models import Order, OrderItem, OrderSummary

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.from_url(REDIS_URL)

def calculate_order_summary(db: Session):
    now = datetime.now(timezone.utc)

    # 🔹 Fetch existing summary (only one row)
    existing_summary = db.query(OrderSummary).first()
    if not existing_summary:
        print("No summary record found yet.")
        return {}
