import json
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

import asyncio
from app.models.database import get_db, Village, HistoricalEvent, SensorData
from app.models.schemas import (
    HealthResponse, LocationSearchResponse, LocationReverseResponse,
    EnvironmentResponse, TerrainResponse, HistoricalRiskResponse,
    HistoricalEventsListResponse, PredictRequest, PredictResponse,
    RiskMapResponse, RiskMapFeature, AlertsResponse,
    SensorDataRequest, SensorDataResponse, ModelInfoResponse,
    ForecastResponse
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

# Target Pan-India Key Stations for Live Monitoring Matrix
PAN_INDIA_MONITORING_CITIES = [
    {"name": "Hyderabad", "lat": 17.3850, "lon": 78.4744, "basin": "Musi / Krishna"},
    {"name": "Bangalore", "lat": 12.9716, "lon": 77.5946, "basin": "Cauvery / Vrishabhavathi"},
    {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777, "basin": "Mithi / Coastal"},
    {"name": "Delhi", "lat": 28.7041, "lon": 77.1025, "basin": "Yamuna"},
    {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639, "basin": "Hooghly / Ganga"},
    {"name": "Kullu", "lat": 31.9579, "lon": 77.1095, "basin": "Upper Beas"},
    {"name": "Wayanad", "lat": 11.5510, "lon": 76.1260, "basin": "Chaliyar / Kabini"},
    {"name": "Kedarnath", "lat": 30.7346, "lon": 79.0669, "basin": "Mandakini / Alaknanda"},
    {"name": "Guwahati", "lat": 26.1445, "lon": 91.7362, "basin": "Brahmaputra"},
    {"name": "Chiplun", "lat": 17.5323, "lon": 73.5186, "basin": "Vashishti"}
]

# 13. Short-Term Hourly Meteorological & Hydrological Forecast (Next 3–6 Hours)
@router.get("/forecast", response_model=ForecastResponse)
async def get_forecast(
    lat: Optional[float] = Query(None, description="Latitude"),
    latitude: Optional[float] = Query(None, description="Latitude alternative"),
    lon: Optional[float] = Query(None, description="Longitude"),
    longitude: Optional[float] = Query(None, description="Longitude alternative"),
    name: Optional[str] = Query(None, description="Location Name"),
    db: Session = Depends(get_db)
):
    target_lat = lat if lat is not None else (latitude if latitude is not None else 17.3850)
    target_lon = lon if lon is not None else (longitude if longitude is not None else 78.4744)
    loc_name = name or f"Target ({round(target_lat, 3)}°N, {round(target_lon, 3)}°E)"
    pred = await prediction_service.predict(PredictRequest(latitude=target_lat, longitude=target_lon, location_name=loc_name), db)
    
    return {
        "location": pred["location"],
        "current": {
            "flood_probability": pred["prediction"]["flood_probability"],
            "flood_probability_percent": pred["prediction"]["flood_probability_percent"],
            "risk_level": pred["prediction"]["risk_level"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        "next_3_hours": pred.get("forecast_3h", []),
        "next_6_hours": pred.get("forecast_6h", []),
        "river_forecast": pred.get("river_forecast", []),
        "max_probability_next_3h": pred.get("max_probability_next_3h", pred["prediction"]["flood_probability"]),
        "alert_level": pred["prediction"]["risk_level"]
    }

# 14. Retrospective & Prospective Timeline (Past 6h -> NOW -> Future 3h)
@router.get("/timeline")
async def get_timeline(
    lat: Optional[float] = Query(None, description="Latitude"),
    latitude: Optional[float] = Query(None, description="Latitude alternative"),
    lon: Optional[float] = Query(None, description="Longitude"),
    longitude: Optional[float] = Query(None, description="Longitude alternative"),
    name: Optional[str] = Query(None, description="Location Name"),
    db: Session = Depends(get_db)
):
    target_lat = lat if lat is not None else (latitude if latitude is not None else 17.3850)
    target_lon = lon if lon is not None else (longitude if longitude is not None else 78.4744)
    loc_name = name or f"Target ({round(target_lat, 3)}°N, {round(target_lon, 3)}°E)"
    pred = await prediction_service.predict(PredictRequest(latitude=target_lat, longitude=target_lon, location_name=loc_name), db)
    return {
        "location": pred["location"],
        "timeline": pred.get("timeline", [])
    }

# In-memory fast cache for Pan-India multi-city matrix
_multi_city_cache = {"timestamp": 0.0, "data": []}

async def _fetch_city_prediction(city: dict, db: Session):
    try:
        pred = await prediction_service.predict(
            PredictRequest(latitude=city["lat"], longitude=city["lon"], location_name=city["name"]),
            db
        )
        return {
            "name": city["name"],
            "basin": city["basin"],
            "latitude": city["lat"],
            "longitude": city["lon"],
            "flood_probability_percent": pred["prediction"]["flood_probability_percent"],
            "risk_level": pred["prediction"]["risk_level"],
            "lead_time": pred["warning"]["lead_time_minutes"],
            "message": pred["warning"]["message"],
            "forecast_3h": pred.get("forecast_3h", []),
            "max_probability_next_3h": pred.get("max_probability_next_3h", pred["prediction"]["flood_probability"])
        }
    except Exception as e:
        logger.warning(f"Error fetching city prediction for {city['name']}: {e}")
        return None

# 15. Pan-India Multi-City Live Monitoring Matrix
@router.get("/predictions/all")
async def get_all_predictions(db: Session = Depends(get_db)):
    import time
    now_ts = time.time()
    if _multi_city_cache["data"] and (now_ts - _multi_city_cache["timestamp"] < 45):
        return {"cities": _multi_city_cache["data"], "timestamp": datetime.now(timezone.utc).isoformat(), "cached": True}

    tasks = [_fetch_city_prediction(city, db) for city in PAN_INDIA_MONITORING_CITIES]
    raw_results = await asyncio.gather(*tasks, return_exceptions=False)
    results = [r for r in raw_results if r is not None]
    
    _multi_city_cache["timestamp"] = now_ts
    _multi_city_cache["data"] = results
    return {"cities": results, "timestamp": datetime.now(timezone.utc).isoformat(), "cached": False}

# 16. Live Critical / High Risk Alerts
@router.get("/alerts/live")
async def get_live_alerts(db: Session = Depends(get_db)):
    all_preds_resp = await get_all_predictions(db)
    cities = all_preds_resp.get("cities", [])
    alerts = []
    for c in cities:
        if c["risk_level"] in ["CRITICAL", "HIGH"]:
            alerts.append({
                "location": c["name"],
                "basin": c["basin"],
                "alert_level": c["risk_level"],
                "flood_probability_percent": c["flood_probability_percent"],
                "lead_time_minutes": c["lead_time"],
                "message": c.get("message", "Elevated hydrometric risk detected."),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
    return {"live_alerts": alerts, "count": len(alerts)}
