from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Tuple

ALERT_TEMPLATES = {
    "CRITICAL": {
        "lead_time_minutes": 25,
        "message": "CRITICAL FLASH FLOOD WARNING: Rapid torrent surge imminent. Immediate evacuation to high ground required.",
        "recommendations": [
            "Initiate emergency evacuation of low-lying river wards and valley floors immediately",
            "Sound village civil defense sirens and broadcast local VHF emergency alerts",
            "Move cattle and essentials to pre-designated higher elevation relief camps",
            "Suspend all vehicular traffic across bridges, fords, and river-hugging highways",
            "De-energize transformer sub-stations in inundation zones to mitigate electrocution risk"
        ]
    },
    "HIGH": {
        "lead_time_minutes": 45,
        "message": "HIGH RISK FLASH FLOOD ALARM: Extreme runoff convergence detected in upper catchment. Prepare for evacuation.",
        "recommendations": [
            "Alert district disaster management teams (DDMA) and quick-response NDRF units",
            "Move residents residing within 100m of riverbanks and drainage channels to safe shelters",
            "Keep emergency rescue kits, solar torches, and first-aid supplies ready",
            "Continuously monitor water gauge stage and upstream cloudburst radar feeds",
            "Stay strictly clear of steep, undercut hill slopes susceptible to debris flows"
        ]
    },
    "MODERATE": {
        "lead_time_minutes": 90,
        "message": "MODERATE FLASH FLOOD WATCH: Heavy localized precipitation may cause rapid runoff in mountain gullies.",
        "recommendations": [
            "Inspect and clear culverts, drains, and road sluices of obstructive rocks and debris",
            "Advise tourists and pilgrims to avoid riverbeds, streams, and camping on sandbars",
            "Maintain close radio contact with district emergency operations center (DEOC)",
            "Prepare backup generators, portable pumps, and satellite communications"
        ]
    },
    "LOW": {
        "lead_time_minutes": 180,
        "message": "LOW RISK FLOOD ADVISORY: Environmental parameters within sustainable catchment absorption limits.",
        "recommendations": [
            "Maintain routine meteorological vigilance and hydrometric telemetry checks",
            "Conduct seasonal community awareness drills on mountain flash flood safety",
            "Verify unobstructed discharge pathways along natural drainage lines"
        ]
    }
}

def generate_warning_and_actions(
    risk_level: str,
    location_name: str = "Target Area"
) -> Tuple[Dict[str, Any], List[str]]:
    """
    Generates actionable early warning alerts and disaster response recommendations.
    """
    template = ALERT_TEMPLATES.get(risk_level, ALERT_TEMPLATES["LOW"])
    lead_mins = template["lead_time_minutes"]

    peak_time = (datetime.now(timezone.utc) + timedelta(minutes=lead_mins)).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    warning_info = {
        "alert_level": risk_level,
        "lead_time_minutes": lead_mins,
        "estimated_peak_time": peak_time,
        "message": template["message"].replace("Target Area", location_name)
    }

    return warning_info, template["recommendations"]
