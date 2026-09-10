import asyncio
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.services.weather_service import weather_service
from app.services.terrain_service import terrain_service
from app.providers.historical import historical_provider
from app.ml.features import extract_features
from app.ml.model import predict_flood_risk
from app.ml.explainability import get_contributing_factors
from app.alerts.alert_engine import generate_warning_and_actions
from app.models.database import Prediction
from app.models.schemas import PredictRequest

class PredictionService:
    async def predict(self, req: PredictRequest, db: Session) -> Dict[str, Any]:
        lat = req.latitude
        lon = req.longitude
        loc_name = req.location_name or f"Area ({round(lat, 3)}°N, {round(lon, 3)}°E)"

        # 1. Fetch environmental telemetry and terrain concurrently
        env, terrain = await asyncio.gather(
            weather_service.get_environmental_data(lat, lon, loc_name),
            terrain_service.get_terrain_data(lat, lon)
        )
        historical = historical_provider.get_nearby_events(db, lat, lon)

        weather = env["weather"]
        soil = env["soil"]
        water = env["water"]

        # Apply simulation overrides if provided (Demo / IoT Simulator)
        if req.rainfall_1h_mm is not None:
            weather["rainfall_1h_mm"] = req.rainfall_1h_mm
        if req.rainfall_3h_mm is not None:
            weather["rainfall_3h_mm"] = req.rainfall_3h_mm
        if req.rainfall_6h_mm is not None:
            weather["rainfall_6h_mm"] = req.rainfall_6h_mm
        if req.soil_moisture_percent is not None:
            soil["soil_moisture_0_10cm_percent"] = req.soil_moisture_percent
            soil["soil_moisture_10_35cm_percent"] = req.soil_moisture_percent
        if req.water_level_m is not None:
            water["water_level_m"] = req.water_level_m
        if req.temperature_c is not None:
            weather["temperature_c"] = req.temperature_c

        # 2. Extract feature vector
        features = extract_features(weather, soil, terrain, water, historical)

        # 3. Model inference
        prob, risk_level, confidence = predict_flood_risk(features)

        # 4. Explainability & Contributing Factors
        factors = get_contributing_factors(features, prob)

        # 5. Alert & Lead Time Computation
        warning, recommendations = generate_warning_and_actions(risk_level, loc_name)

        # 6. Record prediction in database
        try:
            p_record = Prediction(
                latitude=lat,
                longitude=lon,
                location_name=loc_name,
                flood_probability=prob,
                risk_level=risk_level,
                rainfall_1h=features.get("rainfall_1h_mm", 0.0),
                rainfall_3h=features.get("rainfall_3h_mm", 0.0),
                soil_moisture=features.get("soil_moisture_0_10cm_percent", 50.0),
                water_level=features.get("water_level_m", 1.5),
                temperature=features.get("temperature_c", 20.0),
                slope=features.get("slope_degrees", 25.0),
                elevation=features.get("elevation_m", 1200.0)
            )
            db.add(p_record)
            db.commit()
        except Exception:
            db.rollback()

        return {
            "location": {
                "name": loc_name,
                "latitude": lat,
                "longitude": lon
            },
            "prediction": {
                "flood_probability": prob,
                "flood_probability_percent": int(round(prob * 100)),
                "risk_level": risk_level,
                "confidence_score": confidence
            },
            "contributing_factors": factors,
            "warning": warning,
            "recommendations": recommendations
        }

prediction_service = PredictionService()
