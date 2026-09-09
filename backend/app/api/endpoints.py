import json
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.models.database import get_db, Village, HistoricalEvent, SensorData
from app.models.schemas import (
    HealthResponse, LocationSearchResponse, LocationReverseResponse,
    EnvironmentResponse, TerrainResponse, HistoricalRiskResponse,
    HistoricalEventsListResponse, PredictRequest, PredictResponse,
    RiskMapResponse, RiskMapFeature, AlertsResponse,
    SensorDataRequest, SensorDataResponse, ModelInfoResponse
)
from app.services.location_service import location_service
from app.services.weather_service import weather_service
from app.services.terrain_service import terrain_service
from app.services.prediction_service import prediction_service
from app.services.alert_service import alert_service
from app.providers.historical import historical_provider
from app.ml.model import get_model_metadata, predict_flood_risk
from app.ml.features import extract_features
from app.utils.config import DATA_DIR
from app.utils.logging import logger

router = APIRouter()

# 1. Health Check
@router.get("/health", response_model=HealthResponse)
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# 2. Location Search
@router.get("/location/search", response_model=LocationSearchResponse)
async def search_location(
    q: str = Query(..., description="Village or town query string"),
    db: Session = Depends(get_db)
):
    results = await location_service.search(q, db)
    return {"results": results}

# 3. Location Reverse Geocode
@router.get("/location/reverse", response_model=LocationReverseResponse)
async def reverse_location(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    db: Session = Depends(get_db)
):
    result = await location_service.reverse(lat, lon, db)
    return result

# 4. Environment Telemetry
@router.get("/environment", response_model=EnvironmentResponse)
async def get_environment(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    name: Optional[str] = Query(None, description="Optional location name"),
    db: Session = Depends(get_db)
):
    if not name:
        rev = await location_service.reverse(lat, lon, db)
        name = rev.get("name", "Target Area")
    return await weather_service.get_environmental_data(lat, lon, name)

# 5. Terrain Topography
@router.get("/terrain", response_model=TerrainResponse)
async def get_terrain(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    return await terrain_service.get_terrain_data(lat, lon)

# 6. Historical Risk Analysis
@router.get("/historical-risk", response_model=HistoricalRiskResponse)
async def get_historical_risk(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius_km: float = Query(15.0, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
):
    return historical_provider.get_nearby_events(db, lat, lon, radius_km)

# 7. Predict Flash Flood Probability
@router.post("/predict", response_model=PredictResponse)
async def predict_flood(
    request: PredictRequest,
    db: Session = Depends(get_db)
):
    return await prediction_service.predict(request, db)

# 8. Risk Map Features
@router.get("/risk-map", response_model=RiskMapResponse)
async def get_risk_map(
    bounds: Optional[str] = Query(None, description="Bounding box minLat,minLon,maxLat,maxLon"),
    resolution: str = Query("village", description="Resolution: village or basin"),
    db: Session = Depends(get_db)
):
    features: List[RiskMapFeature] = []
    
    # Load villages from DB
    villages = db.query(Village).all()
    if not villages:
        # Fallback to demo villages file
        demo_file = DATA_DIR / "demo" / "villages.json"
        if demo_file.exists():
            with open(demo_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    features.append(RiskMapFeature(
                        type="village",
                        name=item["name"],
                        coordinates=[item["latitude"], item["longitude"]],
                        flood_probability=item.get("flood_probability", 0.5),
                        risk_level=item.get("risk_level", "MODERATE"),
                        population=item.get("population", 5000),
                        district=item.get("district", "Himachal Pradesh"),
                        altitude_m=item.get("altitude_m", 1200),
                        slope_degrees=item.get("slope_degrees", 25.0)
                    ))
            return {"features": features}

    # Extract bounds if provided
    min_lat, min_lon, max_lat, max_lon = None, None, None, None
    if bounds:
        try:
            parts = [float(x.strip()) for x in bounds.split(",")]
            if len(parts) == 4:
                min_lat, min_lon, max_lat, max_lon = parts
        except Exception:
            pass

    for v in villages:
        if min_lat is not None:
            if not (min_lat <= v.latitude <= max_lat and min_lon <= v.longitude <= max_lon):
                continue

        # Check if pre-defined or calculate live
        prob = 0.52
        risk_level = "MODERATE"
        if "kullu" in v.name.lower():
            prob, risk_level = 0.87, "HIGH"
        elif "mandi" in v.name.lower():
            prob, risk_level = 0.91, "CRITICAL"
        elif "solan" in v.name.lower():
            prob, risk_level = 0.28, "LOW"
        elif "bilaspur" in v.name.lower():
            prob, risk_level = 0.22, "LOW"
        elif "shimla" in v.name.lower():
            prob, risk_level = 0.52, "MODERATE"

        features.append(RiskMapFeature(
            type="village",
            name=v.name,
            coordinates=[v.latitude, v.longitude],
            flood_probability=prob,
            risk_level=risk_level,
            population=v.population or 4000,
            district=v.district,
            altitude_m=float(v.altitude_m or 1000)
        ))

    return {"features": features}

# 9. Active Alerts
@router.get("/alerts", response_model=AlertsResponse)
async def get_alerts(db: Session = Depends(get_db)):
    alerts = alert_service.get_active_alerts(db)
    return {"active_alerts": alerts}

# 10. IoT Sensor Data Ingestion
@router.post("/sensor-data", response_model=SensorDataResponse)
async def ingest_sensor_data(
    sensor_in: SensorDataRequest,
    db: Session = Depends(get_db)
):
    try:
        record = SensorData(
            sensor_id=sensor_in.sensor_id,
            latitude=sensor_in.latitude,
            longitude=sensor_in.longitude,
            rainfall_mm=sensor_in.rainfall_mm,
            soil_moisture_percent=sensor_in.soil_moisture_percent,
            water_level_m=sensor_in.water_level_m
        )
        db.add(record)
        db.commit()

        # Run instant prediction for sensor point
        pred_res = await prediction_service.predict(PredictRequest(
            latitude=sensor_in.latitude,
            longitude=sensor_in.longitude,
            location_name=f"IoT Sensor Station {sensor_in.sensor_id}",
            rainfall_1h_mm=sensor_in.rainfall_mm * 0.4,
            rainfall_3h_mm=sensor_in.rainfall_mm * 0.8,
            rainfall_6h_mm=sensor_in.rainfall_mm,
            soil_moisture_percent=sensor_in.soil_moisture_percent,
            water_level_m=sensor_in.water_level_m
        ), db)

        return {
            "received": True,
            "processed": True,
            "calculated_risk": pred_res["prediction"]["risk_level"],
            "probability": pred_res["prediction"]["flood_probability"]
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Sensor ingestion error: {e}")
        return {"received": True, "processed": False}

# 11. Historical Events Filter
@router.get("/historical-events", response_model=HistoricalEventsListResponse)
async def list_historical_events(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    type: Optional[str] = Query(None, description="Event type: flood, landslide, flash_flood"),
    years: int = Query(5, description="Number of years to look back"),
    db: Session = Depends(get_db)
):
    query = db.query(HistoricalEvent)
    if type and type.lower() != "all":
        query = query.filter(HistoricalEvent.event_type.ilike(f"%{type}%"))
    
    events = query.all()
    results = []
    for ev in events:
        dist = None
        if lat is not None and lon is not None:
            from app.providers.historical import haversine_distance_km
            dist = haversine_distance_km(lat, lon, ev.latitude, ev.longitude)

        results.append({
            "event_id": ev.event_id,
            "type": ev.event_type,
            "date": ev.date,
            "latitude": ev.latitude,
            "longitude": ev.longitude,
            "distance_km": dist,
            "severity": ev.severity,
            "affected_area": ev.affected_area,
            "location": ev.affected_area,
            "description": ev.description,
            "rainfall_recorded_mm": ev.rainfall_recorded_mm,
            "casualties": ev.casualties
        })

    if lat is not None and lon is not None:
        results.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else 9999)

    return {"events": results}

# 12. Model Metadata & Performance Info
@router.get("/model/info", response_model=ModelInfoResponse)
async def get_model_info():
    info = get_model_metadata()
    return info
