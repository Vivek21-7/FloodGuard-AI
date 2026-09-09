from typing import Dict, Any, List

FEATURE_COLUMNS = [
    "rainfall_1h_mm",
    "rainfall_3h_mm",
    "rainfall_6h_mm",
    "forecast_rainfall_next_3h_mm",
    "soil_moisture_0_10cm_percent",
    "soil_moisture_10_35cm_percent",
    "elevation_m",
    "slope_degrees",
    "water_level_m",
    "temperature_c",
    "humidity_percent",
    "wind_speed_kmh",
    "historical_event_density_nearby",
    "drainage_convergence_score"
]

def extract_features(
    weather: Dict[str, Any],
    soil: Dict[str, Any],
    terrain: Dict[str, Any],
    water: Dict[str, Any],
    historical: Dict[str, Any]
) -> Dict[str, float]:
    """Extracts and normalizes the 14 hydrological & topographical features for ML inference."""
    # Convergence score based on drainage pattern & slope
    dp = terrain.get("drainage_pattern", "convergent")
    slope = float(terrain.get("slope_degrees", 25.0))
    conv_mult = 1.0 if dp == "convergent" else (0.8 if dp == "trellis" else 0.6)
    drainage_convergence_score = round(min((slope / 45.0) * conv_mult, 1.0), 3)

    return {
        "rainfall_1h_mm": float(weather.get("rainfall_1h_mm", 0.0)),
        "rainfall_3h_mm": float(weather.get("rainfall_3h_mm", 0.0)),
        "rainfall_6h_mm": float(weather.get("rainfall_6h_mm", 0.0)),
        "forecast_rainfall_next_3h_mm": float(weather.get("forecast_rainfall_next_3h", 0.0)),
        "soil_moisture_0_10cm_percent": float(soil.get("soil_moisture_0_10cm_percent", 50.0)),
        "soil_moisture_10_35cm_percent": float(soil.get("soil_moisture_10_35cm_percent", 55.0)),
        "elevation_m": float(terrain.get("elevation_m", 1200.0)),
        "slope_degrees": slope,
        "water_level_m": float(water.get("water_level_m", 1.5)),
        "temperature_c": float(weather.get("temperature_c", 20.0)),
        "humidity_percent": float(weather.get("humidity_percent", 70.0)),
        "wind_speed_kmh": float(weather.get("wind_speed_kmh", 10.0)),
        "historical_event_density_nearby": float(historical.get("event_density", 0.2)),
        "drainage_convergence_score": drainage_convergence_score
    }
