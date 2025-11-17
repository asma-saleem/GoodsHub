import os
import json
import shutil
from uuid import uuid4

import redis
from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from .tasks import calculate_order_summary_task, process_csv_task

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

@app.post("/orders/summary/update")
async def update_order_summary():
    calculate_order_summary_task.apply_async()
    return {"status": "summary update triggered"}

UPLOAD_DIR = "public/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    unique_id = str(uuid4())
    filename = f"{unique_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    task = process_csv_task.delay(file_path, unique_id)

    return {
        "status": "Processing started",
        "file_id": unique_id,
        "task_id": task.id
    }
