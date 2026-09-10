import httpx
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.database import Village
from app.utils.config import settings
from app.utils.logging import logger

# In-memory search cache for sub-millisecond response
_SEARCH_CACHE: Dict[str, List[Dict[str, Any]]] = {}

# Comprehensive Pan-India Settlement & District Index
PAN_INDIA_SETTLEMENTS: List[Dict[str, Any]] = [
    # National Overview
    {"name": "Pan-India (National Live Overview)", "latitude": 22.9734, "longitude": 78.6569, "type": "national"},
    {"name": "Hyderabad, Telangana", "latitude": 17.3850, "longitude": 78.4867, "type": "city"},
    {"name": "Vikarabad, Telangana", "latitude": 17.3364, "longitude": 77.9048, "type": "town"},
    {"name": "Ananthagiri Hills, Vikarabad, Telangana", "latitude": 17.3117, "longitude": 77.8631, "type": "village"},
    {"name": "Mahabubnagar, Telangana", "latitude": 16.7488, "longitude": 77.9942, "type": "city"},
    {"name": "Khammam, Telangana", "latitude": 17.2473, "longitude": 80.1514, "type": "city"},
    {"name": "Suryapet, Telangana", "latitude": 17.1439, "longitude": 79.6239, "type": "town"},
    {"name": "Warangal, Telangana", "latitude": 17.9689, "longitude": 79.5941, "type": "city"},
    {"name": "Karimnagar, Telangana", "latitude": 18.4386, "longitude": 79.1288, "type": "city"},
    {"name": "Nizamabad, Telangana", "latitude": 18.6725, "longitude": 78.0941, "type": "city"},
    {"name": "Nalgonda, Telangana", "latitude": 17.0575, "longitude": 79.2689, "type": "town"},
    {"name": "Medchal, Telangana", "latitude": 17.6297, "longitude": 78.4814, "type": "town"},
    {"name": "Bhadrachalam (Godavari Basin), Telangana", "latitude": 17.6689, "longitude": 80.8936, "type": "town"},
    {"name": "Vijayawada (Krishna Basin), Andhra Pradesh", "latitude": 16.5062, "longitude": 80.6480, "type": "city"},
    {"name": "Visakhapatnam, Andhra Pradesh", "latitude": 17.6868, "longitude": 83.2185, "type": "city"},
    {"name": "Tirupati, Andhra Pradesh", "latitude": 13.6288, "longitude": 79.4192, "type": "city"},
    {"name": "Rajahmundry (Godavari Delta), Andhra Pradesh", "latitude": 17.0005, "longitude": 81.8040, "type": "city"},
    {"name": "Kurnool, Andhra Pradesh", "latitude": 15.8281, "longitude": 78.0373, "type": "city"},

    # Western Himalayas & Northern India
    {"name": "Kullu, Himachal Pradesh", "latitude": 31.9579, "longitude": 77.1095, "type": "town"},
    {"name": "Mandi, Himachal Pradesh", "latitude": 31.7087, "longitude": 76.9320, "type": "town"},
    {"name": "Manali, Himachal Pradesh", "latitude": 32.2432, "longitude": 77.1892, "type": "town"},
    {"name": "Shimla, Himachal Pradesh", "latitude": 31.1048, "longitude": 77.1734, "type": "city"},
    {"name": "Dharamshala, Himachal Pradesh", "latitude": 32.2190, "longitude": 76.3234, "type": "city"},
    {"name": "Solan, Himachal Pradesh", "latitude": 30.9084, "longitude": 77.0999, "type": "town"},
    {"name": "Chamba, Himachal Pradesh", "latitude": 32.5534, "longitude": 76.1258, "type": "town"},
    {"name": "Kinnaur (Reckong Peo), Himachal Pradesh", "latitude": 31.5393, "longitude": 78.2759, "type": "village"},
    {"name": "Spiti Valley (Kaza), Himachal Pradesh", "latitude": 32.2276, "longitude": 78.0710, "type": "village"},
    {"name": "Kedarnath, Uttarakhand", "latitude": 30.7346, "longitude": 79.0669, "type": "village"},
    {"name": "Rudraprayag, Uttarakhand", "latitude": 30.2844, "longitude": 78.9811, "type": "town"},
    {"name": "Chamoli (Gopeshwar), Uttarakhand", "latitude": 30.4124, "longitude": 79.3197, "type": "town"},
    {"name": "Joshimath, Uttarakhand", "latitude": 30.5564, "longitude": 79.5658, "type": "town"},
    {"name": "Uttarkashi, Uttarakhand", "latitude": 30.7268, "longitude": 78.4354, "type": "town"},
    {"name": "Haridwar, Uttarakhand", "latitude": 29.9457, "longitude": 78.1642, "type": "city"},
    {"name": "Rishikesh, Uttarakhand", "latitude": 30.0869, "longitude": 78.2676, "type": "city"},
    {"name": "Nainital, Uttarakhand", "latitude": 29.3919, "longitude": 79.4542, "type": "town"},
    {"name": "Dehradun, Uttarakhand", "latitude": 30.3165, "longitude": 78.0322, "type": "city"},
    {"name": "Srinagar, Jammu & Kashmir", "latitude": 34.0837, "longitude": 74.7973, "type": "city"},
    {"name": "Jammu, Jammu & Kashmir", "latitude": 32.7266, "longitude": 74.8570, "type": "city"},
    {"name": "Leh, Ladakh", "latitude": 34.1526, "longitude": 77.5771, "type": "town"},
    {"name": "Kargil, Ladakh", "latitude": 34.5539, "longitude": 76.1349, "type": "town"},

    # Western Ghats & Southern / Western India
    {"name": "Wayanad (Meppadi - Chooralmala), Kerala", "latitude": 11.5510, "longitude": 76.1260, "type": "village"},
    {"name": "Munnar (Idukki), Kerala", "latitude": 10.0889, "longitude": 77.0595, "type": "town"},
    {"name": "Idukki Gorge, Kerala", "latitude": 9.8494, "longitude": 76.9723, "type": "village"},
    {"name": "Kochi, Kerala", "latitude": 9.9312, "longitude": 76.2673, "type": "city"},
    {"name": "Thiruvananthapuram, Kerala", "latitude": 8.5241, "longitude": 76.9366, "type": "city"},
    {"name": "Bengaluru, Karnataka", "latitude": 12.9716, "longitude": 77.5946, "type": "city"},
    {"name": "Madikeri (Coorg), Karnataka", "latitude": 12.4244, "longitude": 75.7382, "type": "town"},
    {"name": "Mangaluru, Karnataka", "latitude": 12.9141, "longitude": 74.8560, "type": "city"},
    {"name": "Chennai, Tamil Nadu", "latitude": 13.0827, "longitude": 80.2707, "type": "city"},
    {"name": "Ooty (Nilgiris), Tamil Nadu", "latitude": 11.4102, "longitude": 76.6950, "type": "town"},
    {"name": "Coimbatore, Tamil Nadu", "latitude": 11.0168, "longitude": 76.9558, "type": "city"},
    {"name": "Mumbai, Maharashtra", "latitude": 19.0760, "longitude": 72.8777, "type": "city"},
    {"name": "Pune, Maharashtra", "latitude": 18.5204, "longitude": 73.8567, "type": "city"},
    {"name": "Chiplun (Vashishti Basin), Maharashtra", "latitude": 17.5323, "longitude": 73.5186, "type": "town"},
    {"name": "Mahad (Savitri Basin), Maharashtra", "latitude": 18.0833, "longitude": 73.4167, "type": "town"},
    {"name": "Sangli (Krishna Basin), Maharashtra", "latitude": 16.8524, "longitude": 74.5815, "type": "city"},
    {"name": "Kolhapur (Panchganga Basin), Maharashtra", "latitude": 16.7050, "longitude": 74.2433, "type": "city"},

    # Northeast & Eastern India
    {"name": "Cherrapunji (Sohra), Meghalaya", "latitude": 25.2702, "longitude": 91.7323, "type": "town"},
    {"name": "Mawsynram, Meghalaya", "latitude": 25.2974, "longitude": 91.5828, "type": "village"},
    {"name": "Shillong, Meghalaya", "latitude": 25.5788, "longitude": 91.8933, "type": "city"},
    {"name": "Chungthang (Teesta Basin), Sikkim", "latitude": 27.6039, "longitude": 88.6464, "type": "village"},
    {"name": "Gangtok, Sikkim", "latitude": 27.3389, "longitude": 88.6065, "type": "city"},
    {"name": "Guwahati (Brahmaputra), Assam", "latitude": 26.1445, "longitude": 91.7362, "type": "city"},
    {"name": "Dhemaji (Jiadhal Basin), Assam", "latitude": 27.4815, "longitude": 94.5828, "type": "town"},
    {"name": "Majuli Island, Assam", "latitude": 26.9536, "longitude": 94.2037, "type": "town"},
    {"name": "Silchar, Assam", "latitude": 24.8333, "longitude": 92.7789, "type": "city"},
    {"name": "Itanagar, Arunachal Pradesh", "latitude": 27.0844, "longitude": 93.6053, "type": "city"},
    {"name": "Darjeeling, West Bengal", "latitude": 27.0410, "longitude": 88.2663, "type": "town"},
    {"name": "Kolkata, West Bengal", "latitude": 22.5726, "longitude": 88.3639, "type": "city"},
    {"name": "Bhubaneswar, Odisha", "latitude": 20.2961, "longitude": 85.8245, "type": "city"},
    {"name": "Cuttack (Mahanadi Basin), Odisha", "latitude": 20.4625, "longitude": 85.8828, "type": "city"},
    {"name": "Patna (Ganga Basin), Bihar", "latitude": 25.5941, "longitude": 85.1376, "type": "city"},
    {"name": "Ranchi, Jharkhand", "latitude": 23.3441, "longitude": 85.3096, "type": "city"},

    # Central & Western India
    {"name": "Delhi NCR", "latitude": 28.6139, "longitude": 77.2090, "type": "city"},
    {"name": "Jaipur, Rajasthan", "latitude": 26.9124, "longitude": 75.7873, "type": "city"},
    {"name": "Ahmedabad, Gujarat", "latitude": 23.0225, "longitude": 72.5714, "type": "city"},
    {"name": "Bhopal, Madhya Pradesh", "latitude": 23.2599, "longitude": 77.4126, "type": "city"},
    {"name": "Indore, Madhya Pradesh", "latitude": 22.7196, "longitude": 75.8577, "type": "city"},
    {"name": "Hoshangabad (Narmada Basin), MP", "latitude": 22.7519, "longitude": 77.7289, "type": "town"}
]

class LocationService:
    async def search(self, query: str, db: Session) -> List[Dict[str, Any]]:
        q_clean = query.strip().lower()
        if len(q_clean) < 2:
            return []

        # 1. Check in-memory cache for instant <1ms response
        if q_clean in _SEARCH_CACHE:
            return _SEARCH_CACHE[q_clean]

        results: List[Dict[str, Any]] = []

        # 2. Local Index Search (Instant matching across Pan-India settlements)
        query_words = [w for w in re.split(r'[\s,]+', q_clean) if len(w) > 1]
        for loc in PAN_INDIA_SETTLEMENTS:
            loc_name_lower = loc["name"].lower()
            if any(w in loc_name_lower for w in query_words) or q_clean in loc_name_lower:
                results.append(loc)
                if len(results) >= 6:
                    break

        # If we found local matches, cache and return immediately!
        if len(results) >= 1:
            _SEARCH_CACHE[q_clean] = results
            return results

        # 3. Fast Nominatim lookup (with strict 1.5s timeout) for very specific obscure villages
        try:
            url = f"{settings.NOMINATIM_BASE_URL}/search"
            params = {
                "q": f"{query}, India",
                "format": "json",
                "limit": 5,
                "countrycodes": "in"
            }
            headers = {"User-Agent": "FloodGuardAI-SIH2026-DisasterControl/1.0"}
            async with httpx.AsyncClient(timeout=1.5) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data:
                        display = item.get("display_name", query)
                        short_name = ", ".join([part.strip() for part in display.split(",")[:3]])
                        if not any(r["name"] == short_name for r in results):
                            results.append({
                                "name": short_name,
                                "latitude": float(item.get("lat")),
                                "longitude": float(item.get("lon")),
                                "type": item.get("type", "village")
                            })
        except Exception as e:
            logger.debug(f"Nominatim lookup skipped or timed out: {e}")

        # Fallback to default if nothing found
        if not results:
            results.append(PAN_INDIA_SETTLEMENTS[0])

        _SEARCH_CACHE[q_clean] = results
        return results

    async def reverse(self, lat: float, lon: float, db: Session) -> Dict[str, Any]:
        # 1. Check local settlements for closest point within ~20km
        closest = min(
            PAN_INDIA_SETTLEMENTS,
            key=lambda p: (p["latitude"] - lat)**2 + (p["longitude"] - lon)**2
        )
        dist_sq = (closest["latitude"] - lat)**2 + (closest["longitude"] - lon)**2
        if dist_sq < 0.06:  # within ~20km
            return {
                "name": closest["name"],
                "latitude": closest["latitude"],
                "longitude": closest["longitude"]
            }

        # 2. Fast Nominatim reverse
        try:
            url = f"{settings.NOMINATIM_BASE_URL}/reverse"
            params = {"lat": lat, "lon": lon, "format": "json"}
            headers = {"User-Agent": "FloodGuardAI-SIH2026-DisasterControl/1.0"}
            async with httpx.AsyncClient(timeout=1.5) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    name = data.get("display_name")
                    if name:
                        short_name = ", ".join([part.strip() for part in name.split(",")[:3]])
                        return {"name": short_name, "latitude": lat, "longitude": lon}
        except Exception:
            pass

        return {
            "name": f"Area ({round(lat, 3)}°N, {round(lon, 3)}°E)",
            "latitude": lat,
            "longitude": lon
        }

location_service = LocationService()
