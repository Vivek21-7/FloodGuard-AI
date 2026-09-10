import urllib.request
import json

test_coords = [
    ("Itanagar (Arunachal Pradesh)", 27.0844, 93.6053),
    ("Munnar (Kerala)", 10.0889, 77.0595),
    ("Joshimath (Uttarakhand)", 30.5564, 79.5658),
    ("Gangtok (Sikkim)", 27.3389, 88.6065),
    ("Mahabaleshwar (Maharashtra)", 17.9237, 73.6586),
    ("Kargil (Ladakh)", 34.5539, 76.1349),
]

print("=" * 70)
print("TESTING FULL PIPELINE (GEOCODE, TELEMETRY, PREDICTION) ACROSS INDIA")
print("=" * 70)

for name, lat, lon in test_coords:
    # 1. Reverse geocode
    rev_url = f"http://127.0.0.1:8000/api/location/reverse?lat={lat}&lon={lon}"
    req_rev = urllib.request.Request(rev_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_rev, timeout=5) as r:
        rev_data = json.loads(r.read().decode())
    
    # 2. Environment
    env_url = f"http://127.0.0.1:8000/api/environment?lat={lat}&lon={lon}"
    req_env = urllib.request.Request(env_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_env, timeout=5) as r:
        env_data = json.loads(r.read().decode())
    
    # 3. Terrain
    ter_url = f"http://127.0.0.1:8000/api/terrain?lat={lat}&lon={lon}"
    req_ter = urllib.request.Request(ter_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_ter, timeout=5) as r:
        ter_data = json.loads(r.read().decode())
    
    # 4. Predict
    pred_url = "http://127.0.0.1:8000/api/predict"
    pred_body = json.dumps({"latitude": lat, "longitude": lon, "location_name": rev_data["name"]}).encode()
    req_pred = urllib.request.Request(pred_url, data=pred_body, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_pred, timeout=5) as r:
        pred_data = json.loads(r.read().decode())
    
    p = pred_data["prediction"]
    w = env_data["weather"]
    s = env_data["soil"]
    print(f"[{p['risk_level']:<8}] {rev_data['name']}")
    print(f"         Elevation: {ter_data['elevation_m']}m | Slope: {ter_data['slope_degrees']}° | Rain 1h: {w['rainfall_1h_mm']}mm | Soil: {s['soil_moisture_0_10cm_percent']}%")
    print(f"         Flood Probability: {p['flood_probability_percent']}% | Confidence: {p['confidence_score']:.1%}")

print("=" * 70)
print("ALL PIPELINE QUERIES SUCCEEDED ACROSS INDIA")
