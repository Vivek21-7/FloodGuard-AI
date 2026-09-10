import urllib.request
import json

cities = ['Leh', 'Kochi', 'Dehradun', 'Shillong', 'Wayanad', 'Shimla', 'Darjeeling', 'Chiplun', 'Guwahati', 'Ooty']

print("=" * 65)
print("TESTING LOCATION SEARCH ACROSS ALL REGIONS OF INDIA")
print("=" * 65)

for q in cities:
    url = f"http://127.0.0.1:8000/api/location/search?q={urllib.parse.quote(q)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            res = data.get('results', [])
            if res:
                top = res[0]
                print(f"[{q:<12}] -> {top['name']} ({top['latitude']:.3f}°N, {top['longitude']:.3f}°E)")
            else:
                print(f"[{q:<12}] -> No results")
    except Exception as e:
        print(f"[{q:<12}] -> Error: {e}")

print("=" * 65)
