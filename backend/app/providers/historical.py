import math
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.database import HistoricalEvent

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class HistoricalProvider:
    def get_nearby_events(
        self, db: Session, lat: float, lon: float, radius_km: float = 25.0
    ) -> Dict[str, Any]:
        events = db.query(HistoricalEvent).all()
        matched = []

        for ev in events:
            dist = haversine_distance_km(lat, lon, ev.latitude, ev.longitude)
            if dist <= radius_km:
                matched.append({
                    "event_id": ev.event_id,
                    "type": ev.event_type,
                    "date": ev.date,
                    "latitude": ev.latitude,
                    "longitude": ev.longitude,
                    "distance_km": dist,
                    "severity": ev.severity,
                    "affected_area": ev.affected_area,
                    "description": ev.description,
                    "rainfall_recorded_mm": ev.rainfall_recorded_mm,
                    "casualties": ev.casualties
                })

        # Sort by distance
        matched.sort(key=lambda x: x["distance_km"])

        # Calculate event density and historical risk score
        count = len(matched)
        event_density = min(round(count / 5.0, 2), 1.0)
        
        # Severity weights
        severity_weights = {"CRITICAL": 1.0, "HIGH": 0.8, "MODERATE": 0.5, "LOW": 0.2}
        score = sum(severity_weights.get(e["severity"], 0.4) / max(e["distance_km"], 1.0) for e in matched)
        historical_risk_score = min(round(score / 3.0, 2), 1.0)

        return {
            "location": {"latitude": lat, "longitude": lon},
            "nearby_events": matched,
            "event_density": event_density if count > 0 else 0.15,
            "historical_risk_score": historical_risk_score if count > 0 else 0.10
        }

historical_provider = HistoricalProvider()
