from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Alert, AnalystFeedback, InvestigationNote, AuditLog
from app.schemas.schemas import AlertResponse, AlertStatusUpdate, AnalystFeedbackCreate

router = APIRouter(prefix="/alerts", tags=["Alerts & Incidents"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity and severity != "ALL":
        query = query.filter(Alert.severity == severity.upper())
    if status and status != "ALL":
        query = query.filter(Alert.status == status)
    return query.order_by(Alert.risk_score.desc()).all()

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert_detail(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert_status(alert_id: str, update: AlertStatusUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    old_status = alert.status
    alert.status = update.status
    alert.updated_at = datetime.utcnow()

    if update.notes:
        note = InvestigationNote(
            alert_id=alert.id,
            user_id="analyst-1",
            author_name="Security Analyst",
            note=f"Status changed from {old_status} to {update.status}: {update.notes}"
        )
        db.add(note)

    audit = AuditLog(
        action="ALERT_STATUS_UPDATE",
        entity_type="ALERT",
        entity_id=alert.id,
        details={"from": old_status, "to": update.status}
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/feedback")
def submit_feedback(alert_id: str, feedback: AnalystFeedbackCreate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    fb = AnalystFeedback(
        alert_id=alert.id,
        user_id="analyst-1",
        user_name="Security Analyst",
        verdict=feedback.verdict,
        notes=feedback.notes
    )
    db.add(fb)

    # Adjust alert status if verdict is False Positive
    if feedback.verdict == "False Positive":
        alert.status = "False Positive"

    db.commit()
    return {"message": "Analyst feedback recorded successfully", "verdict": feedback.verdict}

@router.post("/{alert_id}/notes")
def add_note(alert_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    note_text = payload.get("note", "").strip()
    if not note_text:
        raise HTTPException(status_code=400, detail="Note cannot be empty")
    
    note = InvestigationNote(
        alert_id=alert_id,
        user_id="analyst-1",
        author_name=payload.get("author", "Security Analyst"),
        note=note_text
    )
    db.add(note)
    db.commit()
    return {"message": "Note added", "note": note_text}

@router.get("/{alert_id}/notes")
def get_notes(alert_id: str, db: Session = Depends(get_db)):
    notes = db.query(InvestigationNote).filter(InvestigationNote.alert_id == alert_id).order_by(InvestigationNote.timestamp.desc()).all()
    return notes

