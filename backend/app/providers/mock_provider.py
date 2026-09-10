from datetime import datetime, timezone
import math
from typing import Dict, Any
from app.providers.base import (
    BaseWeatherProvider, BaseSoilProvider, BaseTerrainProvider, BaseHydrologyProvider
)

DEMO_LOCATION_PROFILES = {
    # --- Western Himalayas ---
    "kullu": {
        "name": "Kullu, Himachal Pradesh",
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
    "mandi": {
        "name": "Mandi, Himachal Pradesh",
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
    "joshimath": {
        "name": "Joshimath, Uttarakhand",
        "lat": 30.5564,
        "lon": 79.5658,
        "rainfall_1h_mm": 38.5,
        "rainfall_3h_mm": 89.0,
        "rainfall_6h_mm": 165.0,
        "forecast_rainfall_next_3h": 58.0,
        "temperature_c": 16.5,
        "humidity_percent": 84.0,
        "wind_speed_kmh": 22.0,
        "soil_moisture_0_10cm": 86.0,
        "soil_moisture_10_35cm": 91.0,
        "elevation_m": 1890.0,
        "slope_degrees": 36.0,
        "water_level_m": 3.9,
        "discharge_m3_s": 650.0,
        "terrain_type": "perched_escarpment",
        "drainage_pattern": "convergent"
    },
    "kedarnath": {
        "name": "Kedarnath, Uttarakhand",
        "lat": 30.7346,
        "lon": 79.0669,
        "rainfall_1h_mm": 52.0,
        "rainfall_3h_mm": 120.0,
        "rainfall_6h_mm": 225.0,
        "forecast_rainfall_next_3h": 80.0,
        "temperature_c": 11.0,
        "humidity_percent": 94.0,
        "wind_speed_kmh": 26.0,
        "soil_moisture_0_10cm": 92.0,
        "soil_moisture_10_35cm": 96.0,
        "elevation_m": 3583.0,
        "slope_degrees": 42.0,
        "water_level_m": 4.5,
        "discharge_m3_s": 920.0,
        "terrain_type": "high_altitude_glacial_cirque",
        "drainage_pattern": "radial"
    },
    "shimla": {
        "name": "Shimla, Himachal Pradesh",
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
    "srinagar": {
        "name": "Srinagar, Jammu & Kashmir",
        "lat": 34.0837,
        "lon": 74.7973,
        "rainfall_1h_mm": 18.0,
        "rainfall_3h_mm": 45.0,
        "rainfall_6h_mm": 78.0,
        "forecast_rainfall_next_3h": 30.0,
        "temperature_c": 21.0,
        "humidity_percent": 76.0,
        "wind_speed_kmh": 11.0,
        "soil_moisture_0_10cm": 68.0,
        "soil_moisture_10_35cm": 74.0,
        "elevation_m": 1585.0,
        "slope_degrees": 15.0,
        "water_level_m": 3.2,
        "discharge_m3_s": 510.0,
        "terrain_type": "intermontane_valley",
        "drainage_pattern": "dendritic"
    },

    # --- Western Ghats (South & Western India) ---
    "wayanad": {
        "name": "Wayanad (Meppadi - Chooralmala), Kerala",
        "lat": 11.5510,
        "lon": 76.1260,
        "rainfall_1h_mm": 58.0,
        "rainfall_3h_mm": 135.0,
        "rainfall_6h_mm": 240.0,
        "forecast_rainfall_next_3h": 90.0,
        "temperature_c": 23.5,
        "humidity_percent": 96.0,
        "wind_speed_kmh": 24.0,
        "soil_moisture_0_10cm": 95.0,
        "soil_moisture_10_35cm": 98.0,
        "elevation_m": 780.0,
        "slope_degrees": 35.0,
        "water_level_m": 4.6,
        "discharge_m3_s": 1100.0,
        "terrain_type": "high_gradient_escarpment",
        "drainage_pattern": "convergent"
    },
    "munnar": {
        "name": "Munnar, Idukki, Kerala",
        "lat": 10.0889,
        "lon": 77.0595,
        "rainfall_1h_mm": 35.0,
        "rainfall_3h_mm": 82.0,
        "rainfall_6h_mm": 155.0,
        "forecast_rainfall_next_3h": 60.0,
        "temperature_c": 20.0,
        "humidity_percent": 92.0,
        "wind_speed_kmh": 16.0,
        "soil_moisture_0_10cm": 82.0,
        "soil_moisture_10_35cm": 88.0,
        "elevation_m": 1532.0,
        "slope_degrees": 32.0,
        "water_level_m": 3.6,
        "discharge_m3_s": 720.0,
        "terrain_type": "shola_grassland_hills",
        "drainage_pattern": "dendritic"
    },
    "chiplun": {
        "name": "Chiplun (Vashishti Basin), Maharashtra",
        "lat": 17.5323,
        "lon": 73.5186,
        "rainfall_1h_mm": 48.0,
        "rainfall_3h_mm": 110.0,
        "rainfall_6h_mm": 195.0,
        "forecast_rainfall_next_3h": 70.0,
        "temperature_c": 27.0,
        "humidity_percent": 94.0,
        "wind_speed_kmh": 22.0,
        "soil_moisture_0_10cm": 90.0,
        "soil_moisture_10_35cm": 94.0,
        "elevation_m": 45.0,
        "slope_degrees": 24.0,
        "water_level_m": 4.4,
        "discharge_m3_s": 1250.0,
        "terrain_type": "coastal_mountain_valley",
        "drainage_pattern": "convergent"
    },
    "coorg": {
        "name": "Madikeri (Coorg), Karnataka",
        "lat": 12.4244,
        "lon": 75.7382,
        "rainfall_1h_mm": 28.0,
        "rainfall_3h_mm": 65.0,
        "rainfall_6h_mm": 115.0,
        "forecast_rainfall_next_3h": 40.0,
        "temperature_c": 22.0,
        "humidity_percent": 88.0,
        "wind_speed_kmh": 14.0,
        "soil_moisture_0_10cm": 74.0,
        "soil_moisture_10_35cm": 80.0,
        "elevation_m": 1150.0,
        "slope_degrees": 26.0,
        "water_level_m": 2.6,
        "discharge_m3_s": 420.0,
        "terrain_type": "forested_ridgeline",
        "drainage_pattern": "dendritic"
    },

    # --- Northeast India (Cherrapunji, Sikkim, Assam) ---
    "cherrapunji": {
        "name": "Cherrapunji (Sohra), Meghalaya",
        "lat": 25.2702,
        "lon": 91.7323,
        "rainfall_1h_mm": 65.0,
        "rainfall_3h_mm": 160.0,
        "rainfall_6h_mm": 280.0,
        "forecast_rainfall_next_3h": 110.0,
        "temperature_c": 21.0,
        "humidity_percent": 98.0,
        "wind_speed_kmh": 28.0,
        "soil_moisture_0_10cm": 96.0,
        "soil_moisture_10_35cm": 99.0,
        "elevation_m": 1484.0,
        "slope_degrees": 34.0,
        "water_level_m": 4.8,
        "discharge_m3_s": 1450.0,
        "terrain_type": "plateau_canyon_escarpment",
        "drainage_pattern": "radial"
    },
    "chungthang": {
        "name": "Chungthang (Teesta Basin), Sikkim",
        "lat": 27.6039,
        "lon": 88.6464,
        "rainfall_1h_mm": 45.0,
        "rainfall_3h_mm": 115.0,
        "rainfall_6h_mm": 210.0,
        "forecast_rainfall_next_3h": 85.0,
        "temperature_c": 15.0,
        "humidity_percent": 95.0,
        "wind_speed_kmh": 25.0,
        "soil_moisture_0_10cm": 91.0,
        "soil_moisture_10_35cm": 95.0,
        "elevation_m": 1790.0,
        "slope_degrees": 38.0,
        "water_level_m": 4.7,
        "discharge_m3_s": 1380.0,
        "terrain_type": "steep_river_canyon",
        "drainage_pattern": "convergent"
    },
    "dhemaji": {
        "name": "Dhemaji, Assam",
        "lat": 27.4815,
        "lon": 94.5828,
        "rainfall_1h_mm": 36.0,
        "rainfall_3h_mm": 88.0,
        "rainfall_6h_mm": 160.0,
        "forecast_rainfall_next_3h": 65.0,
        "temperature_c": 28.0,
        "humidity_percent": 92.0,
        "wind_speed_kmh": 16.0,
        "soil_moisture_0_10cm": 88.0,
        "soil_moisture_10_35cm": 93.0,
        "elevation_m": 91.0,
        "slope_degrees": 10.0,
        "water_level_m": 4.2,
        "discharge_m3_s": 2200.0,
        "terrain_type": "sub_himalayan_alluvial_fan",
        "drainage_pattern": "braided"
    },
    "darjeeling": {
        "name": "Darjeeling, West Bengal",
        "lat": 27.0410,
        "lon": 88.2663,
        "rainfall_1h_mm": 32.0,
        "rainfall_3h_mm": 74.0,
        "rainfall_6h_mm": 138.0,
        "forecast_rainfall_next_3h": 50.0,
        "temperature_c": 17.0,
        "humidity_percent": 91.0,
        "wind_speed_kmh": 15.0,
        "soil_moisture_0_10cm": 80.0,
        "soil_moisture_10_35cm": 85.0,
        "elevation_m": 2042.0,
        "slope_degrees": 33.0,
        "water_level_m": 2.9,
        "discharge_m3_s": 580.0,
        "terrain_type": "steep_tea_slope_ridges",
        "drainage_pattern": "convergent"
    }
}

def _find_nearest_profile(lat: float, lon: float) -> Dict[str, Any]:
    """Finds the closest Pan-India regional profile using spatial distance."""
    closest = None
    min_dist = float("inf")
    for key, p in DEMO_LOCATION_PROFILES.items():
        # Euclidean approximate degrees (accurate for nearest neighbor in India)
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
            "source": f"Open-Meteo & IMD ({p['name'].split(',')[0]} Regional Profile)",
            "updated_at": now_iso
        }

    async def get_soil_moisture(self, lat: float, lon: float) -> Dict[str, Any]:
        p = _find_nearest_profile(lat, lon)
        now_iso = datetime.now(timezone.utc).isoformat()
        return {
            "soil_moisture_0_10cm_percent": p["soil_moisture_0_10cm"],
            "soil_moisture_10_35cm_percent": p["soil_moisture_10_35cm"],
            "source": "ECMWF Root-Zone Soil Model",
            "updated_at": now_iso
        }

    async def get_terrain(self, lat: float, lon: float) -> Dict[str, Any]:
        p = _find_nearest_profile(lat, lon)
        return {
            "elevation_m": p["elevation_m"],
            "slope_degrees": p["slope_degrees"],
            "terrain_type": p["terrain_type"],
            "drainage_pattern": p["drainage_pattern"],
            "source": "Open-Meteo Elevation + DEM calculation"
        }

    async def get_water_level(self, lat: float, lon: float) -> Dict[str, Any]:
        p = _find_nearest_profile(lat, lon)
        now_iso = datetime.now(timezone.utc).isoformat()
        return {
            "water_level_m": p["water_level_m"],
            "discharge_m3_s": p["discharge_m3_s"],
            "source": "India-WRIS / Central Water Commission (CWC)",
            "updated_at": now_iso
        }

mock_provider = MockProvider()
