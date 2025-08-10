from sqlalchemy import create_engine, Column, Integer, Float
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./data.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class MeterReadingDB(Base):
    __tablename__ = "meter_readings"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(Float)
    meter_id = Column(Integer)
    voltage = Column(Float, nullable=True)
    current = Column(Float, nullable=True)
    power = Column(Float, nullable=True)
    frequency = Column(Float, nullable=True)
    energy = Column(Float, nullable=True)

# Create table if it doesn't exist
Base.metadata.create_all(bind=engine)
