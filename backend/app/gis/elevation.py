from typing import Dict, Any
from app.providers.open_meteo import open_meteo_provider
from app.providers.mock_provider import mock_provider
from app.utils.config import settings

async def get_elevation_data(lat: float, lon: float) -> Dict[str, Any]:
    """Retrieve elevation and topography profile."""
    if settings.APP_MODE.upper() == "LIVE":
        return await open_meteo_provider.get_terrain(lat, lon)
    return await mock_provider.get_terrain(lat, lon)
