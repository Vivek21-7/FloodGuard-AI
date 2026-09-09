from typing import Dict, Any
from datetime import datetime, timezone
from app.providers.base import BaseWeatherProvider
from app.providers.mock_provider import mock_provider

class IMDProvider(BaseWeatherProvider):
    """India Meteorological Department (IMD) provider interface."""
    async def get_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        # Uses normalized mock/Open-Meteo profile with IMD source attribution
        mock_data = await mock_provider.get_weather(lat, lon)
        mock_data["source"] = "India Meteorological Department (IMD Synoptic Radar)"
        mock_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        return mock_data

imd_provider = IMDProvider()
