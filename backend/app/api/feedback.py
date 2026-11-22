from typing import Dict, Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import AnalystFeedback, RiskScoringConfig, AuditLog, Alert
from app.schemas.schemas import RiskConfigUpdate
from app.risk.scoring_engine import risk_engine

router = APIRouter(prefix="/feedback", tags=["Analyst Feedback & Tuning"])

@router.get("/summary")
def get_feedback_summary(db: Session = Depends(get_db)):
    feedbacks = db.query(AnalystFeedback).order_by(AnalystFeedback.timestamp.desc()).all()
    total = len(feedbacks)
    tp_count = sum(1 for f in feedbacks if f.verdict == "True Positive")
    fp_count = sum(1 for f in feedbacks if f.verdict == "False Positive")
    inv_count = sum(1 for f in feedbacks if f.verdict == "Needs Further Investigation")

    config = risk_engine.get_config(db)

    # Recent feedback submissions
    recent = [
        {
            "id": f.id,
            "alert_id": f.alert_id,
            "user_name": f.user_name,
            "verdict": f.verdict,
            "notes": f.notes,
            "timestamp": f.timestamp.isoformat() if f.timestamp else ""
        }
        for f in feedbacks[:15]
    ]

    return {
        "metrics": {
            "total_feedbacks": total,
            "true_positives": tp_count,
            "false_positives": fp_count,
            "investigating": inv_count,
            "accuracy_ratio": round((tp_count / total * 100.0), 1) if total > 0 else 100.0
        },
        "scoring_config": {
            "severity_weight": config.severity_weight,
            "confidence_weight": config.confidence_weight,
            "source_reliability_weight": config.source_reliability_weight,
            "vuln_impact_weight": config.vuln_impact_weight,
            "correlation_strength_weight": config.correlation_strength_weight
        },
        "recent_feedback": recent
    }

@router.get("/config")
def get_risk_config(db: Session = Depends(get_db)):
    config = risk_engine.get_config(db)
    return {
        "severity_weight": config.severity_weight,
        "confidence_weight": config.confidence_weight,
        "source_reliability_weight": config.source_reliability_weight,
        "vuln_impact_weight": config.vuln_impact_weight,
        "correlation_strength_weight": config.correlation_strength_weight,
        "threshold_critical": config.threshold_critical,
        "threshold_high": config.threshold_high,
        "threshold_medium": config.threshold_medium,
        "threshold_low": config.threshold_low
    }

@router.post("/config")
def update_risk_config(update: RiskConfigUpdate, db: Session = Depends(get_db)):
    total_weights = (
        update.severity_weight + update.confidence_weight +
        update.source_reliability_weight + update.vuln_impact_weight +
        update.correlation_strength_weight
    )
    if round(total_weights, 2) != 1.0:
        raise HTTPException(status_code=400, detail="The sum of all scoring weights must equal 1.0")

    config = risk_engine.get_config(db)
    config.severity_weight = update.severity_weight
    config.confidence_weight = update.confidence_weight
    config.source_reliability_weight = update.source_reliability_weight
    config.vuln_impact_weight = update.vuln_impact_weight
    config.correlation_strength_weight = update.correlation_strength_weight
    config.updated_at = datetime.utcnow()

    audit = AuditLog(
        user_email="admin@cti.platform",
        action="UPDATE_RISK_WEIGHTS",
        entity_type="CONFIG",
        details=update.dict()
    )
    db.add(audit)
    db.commit()

    return {"message": "Scoring model weights updated successfully", "config": update.dict()}

