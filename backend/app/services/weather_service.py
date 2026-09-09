from typing import Dict, Any
from app.providers.open_meteo import open_meteo_provider
from app.providers.mock_provider import mock_provider
from app.providers.water_level import water_level_provider
from app.utils.config import settings

class WeatherService:
    async def get_environmental_data(self, lat: float, lon: float, location_name: str = "Target Area") -> Dict[str, Any]:
        is_live = (settings.APP_MODE.upper() == "LIVE")
        provider = open_meteo_provider if is_live else mock_provider

        weather = await provider.get_weather(lat, lon)
        soil = await provider.get_soil_moisture(lat, lon)
        water = await water_level_provider.get_water_level(lat, lon)

        return {
            "location": {
                "name": location_name,
                "latitude": lat,
                "longitude": lon
            },
            "weather": weather,
            "soil": soil,
            "water": water
        }

weather_service = WeatherService()
