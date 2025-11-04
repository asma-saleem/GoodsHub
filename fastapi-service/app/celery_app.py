from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks"]
)

celery_app.conf.task_routes = {
    "app.tasks.calculate_order_summary_task": {"queue": "orders"},
    "app.tasks.process_csv_task": {"queue": "uploads"},
}

celery_app.conf.beat_schedule = {
    "calculate-orders-every-1-minute": {
        "task": "app.tasks.calculate_order_summary_task",
        "schedule": 120.0, 
        "options": {"queue": "orders"}
    }
}
celery_app.conf.timezone = 'UTC'

