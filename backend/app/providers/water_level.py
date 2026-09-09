from typing import Dict, Any
from datetime import datetime, timezone
from app.providers.base import BaseHydrologyProvider
from app.providers.mock_provider import mock_provider

class IndiaWRISProvider(BaseHydrologyProvider):
    """India Water Resources Information System (India-WRIS / CWC) provider."""
    async def get_water_level(self, lat: float, lon: float) -> Dict[str, Any]:
        data = await mock_provider.get_water_level(lat, lon)
        data["source"] = "India-WRIS / Central Water Commission (CWC)"
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        return data

water_level_provider = IndiaWRISProvider()
