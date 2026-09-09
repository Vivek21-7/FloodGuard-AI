from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.database import Alert
from app.alerts.alert_engine import generate_warning_and_actions

class AlertService:
    def get_active_alerts(self, db: Session) -> List[Dict[str, Any]]:
        alerts = db.query(Alert).all()
        results = []
        for a in alerts:
            _, recs = generate_warning_and_actions(a.risk_level, a.location_name)
            results.append({
                "alert_id": a.alert_id,
                "location": a.location_name,
                "risk_level": a.risk_level,
                "issued_at": a.issued_at.isoformat() if a.issued_at else datetime.now(timezone.utc).isoformat(),
                "expires_at": a.expires_at.isoformat() if a.expires_at else datetime.now(timezone.utc).isoformat(),
                "message": a.message,
                "recommended_actions": recs
            })
        return results

alert_service = AlertService()
