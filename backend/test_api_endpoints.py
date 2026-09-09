import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.main import app
from app.models.database import init_db

# Initialize database first
init_db()

client = TestClient(app)

def test_all():
    print("--- 1. Testing GET /api/health ---")
    r1 = client.get("/api/health")
    assert r1.status_code == 200, f"Failed: {r1.text}"
    print("Status:", r1.json())

    print("\n--- 2. Testing GET /api/location/search?q=Kullu ---")
    r2 = client.get("/api/location/search?q=Kullu")
    assert r2.status_code == 200
    print("Search Results:", r2.json()["results"][:2])

    print("\n--- 3. Testing GET /api/location/reverse?lat=31.9579&lon=77.1095 ---")
    r3 = client.get("/api/location/reverse?lat=31.9579&lon=77.1095")
    assert r3.status_code == 200
    print("Reverse Geocode:", r3.json())

    print("\n--- 4. Testing GET /api/environment?lat=31.9579&lon=77.1095 ---")
    r4 = client.get("/api/environment?lat=31.9579&lon=77.1095")
    assert r4.status_code == 200
    data4 = r4.json()
    print("Weather:", data4["weather"])
    print("Soil:", data4["soil"])
    print("Water:", data4["water"])

    print("\n--- 5. Testing GET /api/terrain?lat=31.9579&lon=77.1095 ---")
    r5 = client.get("/api/terrain?lat=31.9579&lon=77.1095")
    assert r5.status_code == 200
    print("Terrain:", r5.json())

    print("\n--- 6. Testing GET /api/historical-risk?lat=31.9579&lon=77.1095&radius_km=15 ---")
    r6 = client.get("/api/historical-risk?lat=31.9579&lon=77.1095&radius_km=15")
    assert r6.status_code == 200
    print("Nearby Events:", len(r6.json()["nearby_events"]), "Risk Score:", r6.json()["historical_risk_score"])

    print("\n--- 7. Testing POST /api/predict (Kullu High/Critical Scenario) ---")
    payload = {
        "latitude": 31.9579,
        "longitude": 77.1095,
        "location_name": "Kullu",
        "rainfall_6h_mm": 130.0,
        "soil_moisture_percent": 82.0,
        "water_level_m": 3.4
    }
    r7 = client.post("/api/predict", json=payload)
    assert r7.status_code == 200
    p = r7.json()
    print("Prediction:", p["prediction"])
    print("Top Contributing Factor:", p["contributing_factors"][0])
    print("Warning Lead Time:", p["warning"]["lead_time_minutes"], "minutes")
    print("Recommendations count:", len(p["recommendations"]))

    print("\n--- 8. Testing GET /api/risk-map ---")
    r8 = client.get("/api/risk-map?bounds=31.0,76.5,33.0,78.0&resolution=village")
    assert r8.status_code == 200
    print("Risk Map Features:", len(r8.json()["features"]))

    print("\n--- 9. Testing GET /api/alerts ---")
    r9 = client.get("/api/alerts")
    assert r9.status_code == 200
    print("Active Alerts:", len(r9.json()["active_alerts"]))

    print("\n--- 10. Testing POST /api/sensor-data ---")
    sensor_payload = {
        "sensor_id": "SENSOR-HP-001",
        "latitude": 31.9579,
        "longitude": 77.1095,
        "rainfall_mm": 95.0,
        "soil_moisture_percent": 88.0,
        "water_level_m": 4.2,
        "timestamp": "2026-09-09T18:30:00Z"
    }
    r10 = client.post("/api/sensor-data", json=sensor_payload)
    assert r10.status_code == 200
    print("Sensor Response:", r10.json())

    print("\n--- 11. Testing GET /api/historical-events ---")
    r11 = client.get("/api/historical-events?lat=31.9579&lon=77.1095&type=flood&years=5")
    assert r11.status_code == 200
    print("Historical Flood Events:", len(r11.json()["events"]))

    print("\n--- 12. Testing GET /api/model/info ---")
    r12 = client.get("/api/model/info")
    assert r12.status_code == 200
    print("Model Info:", r12.json())

    print("\n==========================================")
    print("ALL 12 BACKEND APIS VERIFIED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    test_all()
