import os
import json
import shutil
from uuid import uuid4

import redis
from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from .tasks import process_csv_task

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.from_url(REDIS_URL)

@app.get("/latest-order-summary")
def latest_order_summary():
    data = r.get("latest_order_summary")
    if data:
        return {"status": "Completed", **json.loads(data)}
    return {"status": "Processing"}

