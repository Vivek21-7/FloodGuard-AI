import math

def calculate_slope(elevation_center: float, elevation_surroundings: list) -> float:
    """Calculates topographic slope in degrees from focal elevation matrix."""
    if not elevation_surroundings:
        return 20.0
    avg_diff = sum(abs(elevation_center - e) for e in elevation_surroundings) / len(elevation_surroundings)
    # Approx 1 km distance run
    run = 1000.0
    slope_rad = math.atan(avg_diff / run)
    slope_deg = math.degrees(slope_rad)
    return round(min(slope_deg, 65.0), 1)

def classify_terrain(slope_deg: float, elevation_m: float) -> str:
    """Classifies mountainous terrain structure."""
    if slope_deg >= 30:
        return "steep_hillside"
    elif slope_deg >= 20:
        return "high_mountain_ridge" if elevation_m > 1800 else "valley_confluence"
    elif slope_deg >= 10:
        return "undulating_hills"
    else:
        return "reservoir_basin"
