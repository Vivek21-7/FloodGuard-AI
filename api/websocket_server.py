import sys
import os
import json
import threading
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

try:
    from flask_socketio import SocketIO, emit
    HAS_SOCKETIO = True
except ImportError:
    HAS_SOCKETIO = False

from realtime.flood_predictor import predict_flood_probability_now_and_3h
from api.alert_system import check_and_alert

app = Flask(__name__)
CORS(app)

if HAS_SOCKETIO:
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
else:
    socketio = None

# Store active predictions
current_predictions = {}

def load_config_locations():
    config_path = "config/locations.json"
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return [
        {'name': 'Hyderabad', 'lat': 17.3850, 'lon': 78.4744, 'gauge': 'gauge_001'},
        {'name': 'Bangalore', 'lat': 12.9716, 'lon': 77.5946, 'gauge': 'gauge_002'},
        {'name': 'Mumbai', 'lat': 19.0760, 'lon': 72.8777, 'gauge': 'gauge_003'},
        {'name': 'Delhi', 'lat': 28.7041, 'lon': 77.1025, 'gauge': 'gauge_004'},
        {'name': 'Kolkata', 'lat': 22.5726, 'lon': 88.3639, 'gauge': 'gauge_005'},
    ]

def load_alert_contacts():
    config_path = "config/alert_contacts.json"
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return [{"type": "email", "value": "alert@floodguard.ai", "name": "Control Room"}]

def update_all_predictions_task():
    locations = load_config_locations()
    contacts = load_alert_contacts()
    
    print(f"[RUNNING] Updating FloodGuard predictions for {len(locations)} monitoring centers...")
    for loc in locations:
        try:
            pred = predict_flood_probability_now_and_3h(loc['lat'], loc['lon'], loc['gauge'])
            current_predictions[loc['name']] = pred
            
            # Evaluate alert conditions
            check_and_alert(loc['name'], pred, contacts)
            
            if socketio and HAS_SOCKETIO:
                socketio.emit('prediction_update', {
                    'location': loc['name'],
                    'data': pred
                })
        except Exception as e:
            print(f"Error predicting for {loc['name']}: {e}")

def background_timer_loop():
    import time
    while True:
        update_all_predictions_task()
        time.sleep(900) # 15 minutes

# Initial setup run
update_all_predictions_task()

# Start background thread
thread = threading.Thread(target=background_timer_loop, daemon=True)
thread.start()

# --- REST ENDPOINTS ---

@app.route('/', methods=['GET'])
def index():
    dashboard_path = Path(__file__).resolve().parent.parent / "frontend" / "dashboard.html"
    return send_file(str(dashboard_path))

@app.route('/api/predictions', methods=['GET'])
def get_all_predictions():
    return jsonify(current_predictions)

@app.route('/api/predictions/<location>', methods=['GET'])
def get_location_prediction(location):
    if location in current_predictions:
        return jsonify(current_predictions[location])
    return jsonify({'error': 'Location not found'}), 404

@app.route('/api/current/<location>', methods=['GET'])
def get_current(location):
    if location in current_predictions:
        pred = current_predictions[location]
        return jsonify({
            'location': location,
            'timestamp': pred['current']['timestamp'],
            'flood_probability': pred['current']['flood_probability'],
            'rainfall_mm': pred['current']['rainfall_mm'],
            'river_level_m': pred['current']['river_level_m'],
            'alert_level': pred['alert_level']
        })
    return jsonify({'error': 'Location not found'}), 404

@app.route('/api/forecast/<location>', methods=['GET'])
def get_forecast(location):
    if location in current_predictions:
        pred = current_predictions[location]
        return jsonify({
            'location': location,
            'forecast': pred['next_3_hours'],
            'max_probability': pred['max_probability_next_3h']
        })
    return jsonify({'error': 'Location not found'}), 404

@app.route('/api/timeline/<location>', methods=['GET'])
def get_timeline(location):
    if location in current_predictions:
        pred = current_predictions[location]
        timeline = [
            {
                'time': 'NOW',
                'probability': pred['current']['flood_probability'],
                'alert': pred['alert_level'],
                'rainfall': pred['current']['rainfall_mm'],
                'river_level': pred['current']['river_level_m']
            }
        ]
        for f in pred['next_3_hours']:
            timeline.append({
                'time': f"In {f['hour']} hour(s)",
                'probability': f['flood_probability'],
                'alert': 'ALERT' if f['threshold_crossed'] else 'SAFE'
            })
        return jsonify(timeline)
    return jsonify({'error': 'Location not found'}), 404

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    alerts = []
    for location, pred in current_predictions.items():
        if pred['alert_level'] in ['CRITICAL', 'HIGH']:
            alerts.append({
                'location': location,
                'alert_level': pred['alert_level'],
                'flood_probability': pred['current']['flood_probability'],
                'timestamp': pred['current']['timestamp'],
                'next_3h_max': pred['max_probability_next_3h']
            })
    return jsonify(alerts)

# --- SOCKET.IO HANDLERS ---
if HAS_SOCKETIO:
    @socketio.on('connect')
    def handle_connect():
        print('[SOCKET] Client connected to FloodGuard Live WebSocket')
        emit('connection_response', {'data': 'Connected to FloodGuard Live Monitoring Server'})
        emit('initial_data', current_predictions)

    @socketio.on('request_location')
    def handle_location_request(data):
        loc_name = data.get('location')
        if loc_name in current_predictions:
            emit('location_data', current_predictions[loc_name])

if __name__ == '__main__':
    print("[SERVER] Starting FloodGuard WebSocket & API Server on port 5001...")
    if HAS_SOCKETIO:
        socketio.run(app, debug=False, host='0.0.0.0', port=5001, allow_unsafe_werkzeug=True)
    else:
        app.run(debug=False, host='0.0.0.0', port=5001)
