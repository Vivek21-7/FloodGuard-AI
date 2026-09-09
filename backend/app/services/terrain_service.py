from typing import Dict, Any
from app.gis.terrain import analyze_terrain

class TerrainService:
    async def get_terrain_data(self, lat: float, lon: float) -> Dict[str, Any]:
        return await analyze_terrain(lat, lon)

terrain_service = TerrainService()
