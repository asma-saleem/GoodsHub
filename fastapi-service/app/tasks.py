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
    """
    Calculate daily order summary and update Redis.
    """
    now = datetime.now(timezone.utc)
    print(f"Running summary update at {now}")
