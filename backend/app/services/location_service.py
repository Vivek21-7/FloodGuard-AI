import httpx
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.database import Village
from app.utils.config import settings
from app.utils.logging import logger

DEMO_VILLAGES_LIST = [
    {"name": "Kullu, Himachal Pradesh", "latitude": 31.9579, "longitude": 77.1095, "type": "village"},
    {"name": "Shimla, Himachal Pradesh", "latitude": 31.7724, "longitude": 77.1706, "type": "city"},
    {"name": "Mandi, Himachal Pradesh", "latitude": 32.2396, "longitude": 76.9227, "type": "town"},
    {"name": "Solan, Himachal Pradesh", "latitude": 30.9100, "longitude": 77.1633, "type": "town"},
    {"name": "Bilaspur, Himachal Pradesh", "latitude": 31.3175, "longitude": 76.7581, "type": "town"},
    {"name": "Manali, Himachal Pradesh", "latitude": 32.2432, "longitude": 77.1892, "type": "town"},
    {"name": "Aut, Himachal Pradesh", "latitude": 31.7483, "longitude": 77.2081, "type": "village"},
    {"name": "Pandoh, Himachal Pradesh", "latitude": 31.6710, "longitude": 76.9930, "type": "village"},
    {"name": "Dharamshala, Himachal Pradesh", "latitude": 32.2190, "longitude": 76.3234, "type": "city"},
    {"name": "Rishikesh, Uttarakhand", "latitude": 30.0869, "longitude": 78.2676, "type": "city"},
    {"name": "Joshimath, Uttarakhand", "latitude": 30.5564, "longitude": 79.5658, "type": "town"},
    {"name": "Kedarnath Catchment, Uttarakhand", "latitude": 30.7346, "longitude": 79.0669, "type": "village"}
]

class LocationService:
    async def search(self, query: str, db: Session) -> List[Dict[str, Any]]:
        results = []
        q_lower = query.strip().lower()

        # 1. First check local database
        try:
            db_matches = db.query(Village).filter(Village.name.ilike(f"%{query}%")).all()
            for v in db_matches:
                results.append({
                    "name": f"{v.name}, {v.district}",
                    "latitude": v.latitude,
                    "longitude": v.longitude,
                    "type": "village"
                })
        except Exception as e:
            logger.warning(f"Database search failed: {e}")

        # 2. Check curated demo list
        for loc in DEMO_VILLAGES_LIST:
            if q_lower in loc["name"].lower() and not any(r["name"] == loc["name"] for r in results):
                results.append(loc)

        # 3. If in LIVE mode or no results found, query Nominatim OpenStreetMap API
        if len(results) == 0:
            try:
                url = f"{settings.NOMINATIM_BASE_URL}/search"
                params = {
                    "q": f"{query}, India",
                    "format": "json",
                    "limit": 5,
                    "countrycodes": "in"
                }
                headers = {"User-Agent": "FloodGuardAI-SIH2026"}
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.get(url, params=params, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        for item in data:
                            results.append({
                                "name": item.get("display_name", query),
                                "latitude": float(item.get("lat")),
                                "longitude": float(item.get("lon")),
                                "type": item.get("type", "village")
                            })
            except Exception as e:
                logger.warning(f"Nominatim search failed: {e}")

        # If still empty, return closest demo match
        if not results:
            results.append(DEMO_VILLAGES_LIST[0])

        return results

    async def reverse(self, lat: float, lon: float, db: Session) -> Dict[str, Any]:
        # 1. Check local database for closest village
        try:
            villages = db.query(Village).all()
            if villages:
                closest = min(villages, key=lambda v: (v.latitude - lat)**2 + (v.longitude - lon)**2)
                # If within ~10km (approx 0.1 degree)
                if (closest.latitude - lat)**2 + (closest.longitude - lon)**2 < 0.05:
                    return {
                        "name": f"{closest.name}, {closest.district}",
                        "latitude": closest.latitude,
                        "longitude": closest.longitude
                    }
        except Exception as e:
            logger.warning(f"DB reverse lookup failed: {e}")

        # 2. Attempt Nominatim reverse geocode
        try:
            url = f"{settings.NOMINATIM_BASE_URL}/reverse"
            params = {"lat": lat, "lon": lon, "format": "json"}
            headers = {"User-Agent": "FloodGuardAI-SIH2026"}
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    name = data.get("display_name")
                    if name:
                        return {"name": name, "latitude": lat, "longitude": lon}
        except Exception as e:
            logger.warning(f"Nominatim reverse failed: {e}")

        return {
            "name": f"Coordinates ({round(lat, 4)}°N, {round(lon, 4)}°E), Himachal Pradesh",
            "latitude": lat,
            "longitude": lon
        }

location_service = LocationService()
