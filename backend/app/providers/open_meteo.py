import httpx
from datetime import datetime, timezone
from typing import Dict, Any
from app.providers.base import BaseWeatherProvider, BaseSoilProvider, BaseTerrainProvider
from app.providers.mock_provider import mock_provider
from app.utils.config import settings
from app.utils.logging import logger

class OpenMeteoProvider(BaseWeatherProvider, BaseSoilProvider, BaseTerrainProvider):
    def __init__(self):
        self.weather_url = settings.OPEN_METEO_API_URL
        self.elevation_url = settings.OPEN_METEO_ELEVATION_URL

    async def get_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        try:
            url = f"{self.weather_url}/forecast"
            params = {
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
                "hourly": "precipitation",
                "forecast_hours": 6,
                "past_hours": 6,
                "timezone": "UTC"
            }
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    current = data.get("current", {})
                    hourly = data.get("hourly", {})
                    precip_list = hourly.get("precipitation", [])

                    # Compute 1h, 3h, 6h past accumulations and next 3h forecast
                    r1h = float(current.get("precipitation", 15.0))
                    r3h = sum(precip_list[3:6]) if len(precip_list) >= 6 else r1h * 2.2
                    r6h = sum(precip_list[0:6]) if len(precip_list) >= 6 else r1h * 3.8
                    f3h = sum(precip_list[6:9]) if len(precip_list) >= 9 else r1h * 1.5

                    return {
                        "rainfall_1h_mm": round(max(r1h, 0.0), 1),
                        "rainfall_3h_mm": round(max(r3h, r1h), 1),
                        "rainfall_6h_mm": round(max(r6h, r3h), 1),
                        "forecast_rainfall_next_3h": round(max(f3h, 0.0), 1),
                        "temperature_c": round(float(current.get("temperature_2m", 22.0)), 1),
                        "humidity_percent": round(float(current.get("relative_humidity_2m", 75.0)), 1),
                        "wind_speed_kmh": round(float(current.get("wind_speed_10m", 10.0)), 1),
                        "source": "Open-Meteo Live API",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
        except Exception as e:
            logger.warning(f"Open-Meteo weather API call failed: {e}. Falling back to mock provider.")
        
        return await mock_provider.get_weather(lat, lon)

    async def get_soil_moisture(self, lat: float, lon: float) -> Dict[str, Any]:
        try:
            url = f"{self.weather_url}/forecast"
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": "soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm",
                "forecast_hours": 1,
                "timezone": "UTC"
            }
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    hourly = data.get("hourly", {})
                    sm0 = hourly.get("soil_moisture_0_to_1cm", [0.45])[0] * 100
                    sm1 = hourly.get("soil_moisture_9_to_27cm", [0.55])[0] * 100
                    return {
                        "soil_moisture_0_10cm_percent": round(float(sm0), 1),
                        "soil_moisture_10_35cm_percent": round(float(sm1), 1),
                        "source": "Open-Meteo Live ECMWF Soil Model",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
        except Exception as e:
            logger.warning(f"Open-Meteo soil moisture API failed: {e}. Falling back to mock provider.")
        
        return await mock_provider.get_soil_moisture(lat, lon)

    async def get_terrain(self, lat: float, lon: float) -> Dict[str, Any]:
        try:
            # Multi-point sample to calculate slope
            delta = 0.01  # approx 1.1 km
            lats = f"{lat},{lat+delta},{lat-delta},{lat}"
            lons = f"{lon},{lon},{lon},{lon+delta}"
            url = f"{self.elevation_url}?latitude={lats}&longitude={lons}"
            
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    elevations = data.get("elevation", [])
                    if len(elevations) >= 4:
                        e_center = elevations[0]
                        e_north = elevations[1]
                        e_south = elevations[2]
                        e_east = elevations[3]

                        dz_dy = abs(e_north - e_south) / (2 * delta * 111000)
                        dz_dx = abs(e_east - e_center) / (delta * 111000 * 0.85)
                        slope_rad = (dz_dx**2 + dz_dy**2)**0.5
                        import math
                        slope_deg = min(round(math.degrees(math.atan(slope_rad)), 1), 60.0)

                        terrain_type = "steep_hillside" if slope_deg > 25 else "undulating_valley"
                        return {
                            "elevation_m": round(float(e_center), 1),
                            "slope_degrees": max(slope_deg, 5.0),
                            "terrain_type": terrain_type,
                            "drainage_pattern": "convergent" if slope_deg > 20 else "dendritic",
                            "source": "Open-Meteo DEM Elevation Calculation"
                        }
        except Exception as e:
            logger.warning(f"Open-Meteo elevation API failed: {e}. Falling back to mock provider.")

        return await mock_provider.get_terrain(lat, lon)

open_meteo_provider = OpenMeteoProvider()
