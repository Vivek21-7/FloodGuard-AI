from typing import Dict, Any
from app.gis.elevation import get_elevation_data
from app.gis.slope import classify_terrain

async def analyze_terrain(lat: float, lon: float) -> Dict[str, Any]:
    """Provides full terrain analysis for a given geo coordinate."""
    data = await get_elevation_data(lat, lon)
    elev = data.get("elevation_m", 1200.0)
    slope = data.get("slope_degrees", 25.0)
    
    terrain_type = data.get("terrain_type") or classify_terrain(slope, elev)
    drainage_pattern = data.get("drainage_pattern", "convergent")

    return {
        "elevation_m": elev,
        "slope_degrees": slope,
        "terrain_type": terrain_type,
        "drainage_pattern": drainage_pattern,
        "source": data.get("source", "Open-Meteo Elevation + DEM calculation")
    }
