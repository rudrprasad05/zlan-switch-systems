import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import time

from app.db import MeterReadingDB, SessionLocal


DATA_FILE = "data.json"
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your frontend
    allow_methods=["*"],
    allow_headers=["*"]
)

# ---- In-Memory Storage ----
energy_data = []

class MeterReading(BaseModel):
    timestamp: float
    meter_id: int
    voltage: float | None
    current: float | None
    power: float | None
    frequency: float | None
    energy: float | None


@app.post("/api/readings")
def post_reading(reading: MeterReading):
    db = SessionLocal()
    db_reading = MeterReadingDB(**reading.dict())
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    db.close()
    return {"status": "ok"}

@app.get("/api/readings", response_model=List[MeterReading])
def get_readings():
    db = SessionLocal()
    readings = db.query(MeterReadingDB).order_by(MeterReadingDB.timestamp.desc()).limit(1000).all()
    db.close()
    return readings
