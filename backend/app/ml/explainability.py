from typing import Dict, List, Any

def get_contributing_factors(
    feature_dict: Dict[str, float],
    probability: float
) -> List[Dict[str, Any]]:
    """
    Computes explainable contributing factors to the predicted flood risk,
    ranked by dynamic impact and hydrological weights.
    """
    factors = []

    # 1. Rainfall Impact
    r6h = feature_dict.get("rainfall_6h_mm", 0.0)
    r_impact = "CRITICAL" if r6h > 150 else ("HIGH" if r6h > 80 else ("MODERATE" if r6h > 35 else "LOW"))
    factors.append({
        "factor": "Heavy Rainfall (6h Accumulation)",
        "importance": 0.35,
        "current_value": round(r6h, 1),
        "impact": r_impact,
        "unit": "mm"
    })

    # 2. Soil Saturation Impact
    sm = (feature_dict.get("soil_moisture_0_10cm_percent", 50) + feature_dict.get("soil_moisture_10_35cm_percent", 50)) / 2.0
    sm_impact = "CRITICAL" if sm > 85 else ("HIGH" if sm > 70 else ("MODERATE" if sm > 50 else "LOW"))
    factors.append({
        "factor": "High Soil Saturation (Root Zone)",
        "importance": 0.28,
        "current_value": round(sm, 1),
        "impact": sm_impact,
        "unit": "%"
    })

    # 3. Slope Gradient Impact
    slope = feature_dict.get("slope_degrees", 25.0)
    slope_impact = "HIGH" if slope > 30 else ("MODERATE" if slope > 20 else "LOW")
    factors.append({
        "factor": "Steep Slope Gradient",
        "importance": 0.22,
        "current_value": round(slope, 1),
        "impact": slope_impact,
        "unit": "°"
    })

    # 4. River Water Level
    wl = feature_dict.get("water_level_m", 1.5)
    wl_impact = "CRITICAL" if wl > 3.8 else ("HIGH" if wl > 2.5 else ("MODERATE" if wl > 1.8 else "LOW"))
    factors.append({
        "factor": "Rising River Stage / Water Level",
        "importance": 0.15,
        "current_value": round(wl, 1),
        "impact": wl_impact,
        "unit": "m"
    })

    # Sort factors by impact severity and importance
    order = {"CRITICAL": 4, "HIGH": 3, "MODERATE": 2, "LOW": 1}
    factors.sort(key=lambda x: (order.get(x["impact"], 0), x["importance"]), reverse=True)

    return factors
