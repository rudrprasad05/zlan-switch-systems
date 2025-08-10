import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from app.db import MeterReadingDB, SessionLocal

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
from datetime import datetime, time
from fastapi import Query

@app.get("/api/readings", response_model=List[MeterReading])
def get_readings(date: str = Query(None, description="Date in YYYY-MM-DD format")):
    db = SessionLocal()
    query = db.query(MeterReadingDB)

    if date:
        # Parse the input date string
        try:
            day = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            db.close()
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
        
        start_dt = datetime.combine(day, time.min)  # 00:00:00
        end_dt = datetime.combine(day, time.max)    # 23:59:59.999999

        # Assuming timestamp is stored as a float UNIX timestamp (seconds)
        start_ts = start_dt.timestamp()
        end_ts = end_dt.timestamp()

        query = query.filter(MeterReadingDB.timestamp >= start_ts, MeterReadingDB.timestamp <= end_ts)

    readings = query.order_by(MeterReadingDB.timestamp.desc()).limit(1000).all()
    db.close()
    return readings
