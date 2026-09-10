import urllib.request
import json

test_locations = [
    ('Wayanad (Kerala - Western Ghats)', 11.551, 76.126),
    ('Cherrapunji (Meghalaya - Northeast)', 25.27, 91.73),
    ('Chiplun (Maharashtra - Konkan)', 17.53, 73.52),
    ('Kedarnath (Uttarakhand - Garhwal)', 30.73, 79.06),
    ('Chungthang (Sikkim - Teesta Basin)', 27.60, 88.65),
    ('Dhemaji (Assam - Brahmaputra Valley)', 27.48, 94.58),
    ('Srinagar (Jammu & Kashmir)', 34.08, 74.80),
]

print("=" * 70)
print("TESTING FLOODGUARD AI MULTI-SOURCE PREDICTION ACROSS INDIA")
print("=" * 70)

for name, lat, lon in test_locations:
    payload = json.dumps({'latitude': lat, 'longitude': lon, 'location_name': name}).encode('utf-8')
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/predict',
        data=payload,
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read())
        pred = res['prediction']
        loc = res['location']
        warn = res['warning']
        print(f"[{pred['risk_level']:<8}] {loc['name']}")
        print(f"         Prob: {pred['flood_probability']:.1%} | Conf: {pred['confidence_score']:.1%} | Alert: {warn['alert_level']}")
        print(f"         Lead Time: {warn['lead_time_minutes']} min | Message: {warn['message'][:65]}...")
print("=" * 70)
print("ALL PAN-INDIA PREDICTIONS EXECUTED SUCCESSFULLY")
