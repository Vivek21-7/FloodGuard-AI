import json
from datetime import datetime
from pathlib import Path
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, DateTime, Text, Numeric
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.utils.config import settings, DATA_DIR
from app.utils.logging import logger

Base = declarative_base()

class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    district = Column(String(100))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population = Column(Integer, default=0)
    altitude_m = Column(Integer, default=1000)
    geojson = Column(Text, nullable=True)

class HistoricalEvent(Base):
    __tablename__ = "historical_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(50), unique=True, index=True)
    event_type = Column(String(50))  # flood, landslide, flash_flood
    date = Column(String(30))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(String(20))  # LOW, MODERATE, HIGH, CRITICAL
    affected_area = Column(String(150))
    description = Column(Text)
    casualties = Column(Integer, default=0)
    property_loss = Column(Numeric, default=0)
    rainfall_recorded_mm = Column(Float, default=0.0)
    soil_moisture_peak = Column(Float, default=0.0)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    flood_probability = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    rainfall_1h = Column(Float, default=0.0)
    rainfall_3h = Column(Float, default=0.0)
    soil_moisture = Column(Float, default=0.0)
    water_level = Column(Float, default=0.0)
    temperature = Column(Float, default=0.0)
    slope = Column(Float, default=0.0)
    elevation = Column(Float, default=0.0)

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    soil_moisture_percent = Column(Float, nullable=False)
    water_level_m = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True)
    location_name = Column(String(100))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    risk_level = Column(String(20))
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    message = Column(Text)

from sqlalchemy.pool import NullPool

engine = create_engine(
    settings.DATABASE_URL, 
    poolclass=NullPool,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables and populates demo seed data if empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed villages (refresh if fewer than 20)
        if db.query(Village).count() < 20:
            db.query(Village).delete()
            villages_file = DATA_DIR / "demo" / "villages.json"
            if villages_file.exists():
                with open(villages_file, "r", encoding="utf-8") as f:
                    villages_data = json.load(f)
                    for item in villages_data:
                        v = Village(
                            name=item.get("name"),
                            district=f"{item.get('district', '')}, {item.get('state', '')}",
                            latitude=item.get("latitude"),
                            longitude=item.get("longitude"),
                            population=item.get("population", 5000),
                            altitude_m=int(item.get("altitude_m", 1000)),
                            geojson=json.dumps(item)
                        )
                        db.add(v)
                    db.commit()
                    logger.info("Successfully seeded 28 Pan-India settlements into database.")

        # Seed historical events (refresh if fewer than 10)
        if db.query(HistoricalEvent).count() < 10:
            db.query(HistoricalEvent).delete()
            events_file = DATA_DIR / "demo" / "historical_events.json"
            if events_file.exists():
                with open(events_file, "r", encoding="utf-8") as f:
                    events_data = json.load(f)
                    for item in events_data:
                        ev = HistoricalEvent(
                            event_id=item.get("event_id", f"EV-{item.get('id')}"),
                            event_type=item.get("event_type", "flash_flood"),
                            date=item.get("date"),
                            latitude=item.get("latitude"),
                            longitude=item.get("longitude"),
                            severity=item.get("severity", "MODERATE"),
                            affected_area=item.get("affected_area", ""),
                            description=item.get("description", ""),
                            casualties=item.get("casualties", 0),
                            property_loss=item.get("property_loss", 0),
                            rainfall_recorded_mm=item.get("rainfall_recorded_mm", 0.0),
                            soil_moisture_peak=item.get("soil_moisture_peak", 0.0)
                        )
                        db.add(ev)
                    db.commit()
                    logger.info("Successfully seeded Pan-India historical disasters into database.")

        # Seed initial active demo alerts if empty
        if db.query(Alert).count() == 0:
            alerts_seed = [
                Alert(
                    alert_id="ALERT-2026-001",
                    location_name="Kullu Valley Catchment",
                    latitude=31.9579,
                    longitude=77.1095,
                    risk_level="HIGH",
                    issued_at=datetime.utcnow(),
                    expires_at=datetime.utcnow(),
                    message="High flash flood probability detected. Runoff converging in Beas gorge."
                ),
                Alert(
                    alert_id="ALERT-2026-002",
                    location_name="Mandi - Suketi Basin",
                    latitude=32.2396,
                    longitude=76.9227,
                    risk_level="CRITICAL",
                    issued_at=datetime.utcnow(),
                    expires_at=datetime.utcnow(),
                    message="Critical inundation warning: River stage approaching peak danger elevation."
                )
            ]
            for a in alerts_seed:
                db.add(a)
            db.commit()
            logger.info("Successfully seeded demo active alerts.")

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()
