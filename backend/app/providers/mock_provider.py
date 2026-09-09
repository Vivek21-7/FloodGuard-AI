from datetime import datetime, timezone
import math
from typing import Dict, Any
from app.providers.base import (
    BaseWeatherProvider, BaseSoilProvider, BaseTerrainProvider, BaseHydrologyProvider
)

DEMO_LOCATION_PROFILES = {
    "kullu": {
        "name": "Kullu",
        "lat": 31.9579,
        "lon": 77.1095,
        "rainfall_1h_mm": 25.5,
        "rainfall_3h_mm": 68.3,
        "rainfall_6h_mm": 125.4,
        "forecast_rainfall_next_3h": 45.2,
        "temperature_c": 24.5,
        "humidity_percent": 78.0,
        "wind_speed_kmh": 12.3,
        "soil_moisture_0_10cm": 65.0,
        "soil_moisture_10_35cm": 72.0,
        "elevation_m": 1200.0,
        "slope_degrees": 31.0,
        "water_level_m": 2.8,
        "discharge_m3_s": 450.5,
        "terrain_type": "steep_hillside",
        "drainage_pattern": "convergent"
    },
    "shimla": {
        "name": "Shimla",
        "lat": 31.7724,
        "lon": 77.1706,
        "rainfall_1h_mm": 14.2,
        "rainfall_3h_mm": 32.8,
        "rainfall_6h_mm": 54.2,
        "forecast_rainfall_next_3h": 22.0,
        "temperature_c": 19.2,
        "humidity_percent": 71.0,
        "wind_speed_kmh": 14.5,
        "soil_moisture_0_10cm": 52.0,
        "soil_moisture_10_35cm": 58.0,
        "elevation_m": 2159.0,
        "slope_degrees": 28.0,
        "water_level_m": 1.4,
        "discharge_m3_s": 180.0,
        "terrain_type": "high_mountain_ridge",
        "drainage_pattern": "radial"
    },
    "mandi": {
        "name": "Mandi",
        "lat": 32.2396,
        "lon": 76.9227,
        "rainfall_1h_mm": 42.0,
        "rainfall_3h_mm": 98.5,
        "rainfall_6h_mm": 182.0,
        "forecast_rainfall_next_3h": 65.0,
        "temperature_c": 26.0,
        "humidity_percent": 88.0,
        "wind_speed_kmh": 18.0,
        "soil_moisture_0_10cm": 84.0,
        "soil_moisture_10_35cm": 89.0,
        "elevation_m": 900.0,
        "slope_degrees": 22.0,
        "water_level_m": 4.1,
        "discharge_m3_s": 790.0,
        "terrain_type": "valley_confluence",
        "drainage_pattern": "convergent"
    },
    "solan": {
        "name": "Solan",
        "lat": 30.9100,
        "lon": 77.1633,
        "rainfall_1h_mm": 2.5,
        "rainfall_3h_mm": 6.8,
        "rainfall_6h_mm": 12.0,
        "forecast_rainfall_next_3h": 4.0,
        "temperature_c": 23.0,
        "humidity_percent": 54.0,
        "wind_speed_kmh": 8.0,
        "soil_moisture_0_10cm": 35.0,
        "soil_moisture_10_35cm": 38.0,
        "elevation_m": 1445.0,
        "slope_degrees": 25.0,
        "water_level_m": 0.8,
        "discharge_m3_s": 45.0,
        "terrain_type": "undulating_hills",
        "drainage_pattern": "dendritic"
    },
    "bilaspur": {
        "name": "Bilaspur",
        "lat": 31.3175,
        "lon": 76.7581,
        "rainfall_1h_mm": 1.2,
        "rainfall_3h_mm": 4.5,
        "rainfall_6h_mm": 8.5,
        "forecast_rainfall_next_3h": 2.5,
        "temperature_c": 28.5,
        "humidity_percent": 48.0,
        "wind_speed_kmh": 7.2,
        "soil_moisture_0_10cm": 30.0,
        "soil_moisture_10_35cm": 34.0,
        "elevation_m": 640.0,
        "slope_degrees": 18.0,
        "water_level_m": 1.1,
        "discharge_m3_s": 95.0,
        "terrain_type": "reservoir_basin",
        "drainage_pattern": "trellis"
    }
}

def _find_nearest_profile(lat: float, lon: float) -> Dict[str, Any]:
    closest = None
    min_dist = float("inf")
    for key, p in DEMO_LOCATION_PROFILES.items():
        d = math.hypot(p["lat"] - lat, p["lon"] - lon)
        if d < min_dist:
            min_dist = d
            closest = p
    return closest or DEMO_LOCATION_PROFILES["kullu"]

class MockProvider(BaseWeatherProvider, BaseSoilProvider, BaseTerrainProvider, BaseHydrologyProvider):
    async def get_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        p = _find_nearest_profile(lat, lon)
        now_iso = datetime.now(timezone.utc).isoformat()
        return {
            "rainfall_1h_mm": p["rainfall_1h_mm"],
            "rainfall_3h_mm": p["rainfall_3h_mm"],
            "rainfall_6h_mm": p["rainfall_6h_mm"],
            "forecast_rainfall_next_3h": p["forecast_rainfall_next_3h"],
            "temperature_c": p["temperature_c"],
            "humidity_percent": p["humidity_percent"],
            "wind_speed_kmh": p["wind_speed_kmh"],
            "source": "Open-Meteo (Demo Mode)",
            "updated_at": now_iso
        }

    async def get_soil_moisture(self, lat: float, lon: float) -> Dict[str, Any]:
        p = _find_nearest_profile(lat, lon)
        now_iso = datetime.now(timezone.utc).isoformat()
        return {
            "soil_moisture_0_10cm_percent": p["soil_moisture_0_10cm"],
            "soil_moisture_10_35cm_percent": p["soil_moisture_10_35cm"],
            "source": "Open-Meteo (Demo Mode)",
            "updated_at": now_iso
        }

    async def get_terrain(self, lat: float, lon: float) -> Dict[str, Any]:
        p = _find_nearest_profile(lat, lon)
        return {
            "elevation_m": p["elevation_m"],
            "slope_degrees": p["slope_degrees"],
            "terrain_type": p["terrain_type"],
            "drainage_pattern": p["drainage_pattern"],
            "source": "Open-Meteo Elevation + DEM calculation (Demo Mode)"
        }

    async def get_water_level(self, lat: float, lon: float) -> Dict[str, Any]:
        p = _find_nearest_profile(lat, lon)
        now_iso = datetime.now(timezone.utc).isoformat()
        return {
            "water_level_m": p["water_level_m"],
            "discharge_m3_s": p["discharge_m3_s"],
            "source": "India-WRIS (Demo Mode)",
            "updated_at": now_iso
        }

mock_provider = MockProvider()
