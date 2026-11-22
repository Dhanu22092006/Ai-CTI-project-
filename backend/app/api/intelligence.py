from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.entities import ThreatIndicator
from app.schemas.schemas import ThreatIndicatorResponse, ThreatIndicatorCreate
from app.ingestion.normalizer import normalizer

router = APIRouter(prefix="/intelligence", tags=["Threat Intelligence"])

@router.get("", response_model=List[ThreatIndicatorResponse])
def get_indicators(
    type: Optional[str] = Query(None, description="Filter by type (ip, domain, url, etc.)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    search: Optional[str] = Query(None, description="Search term in value or description"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(ThreatIndicator)
    if type and type != "ALL":
        query = query.filter(ThreatIndicator.type == type.lower())
    if severity and severity != "ALL":
        query = query.filter(ThreatIndicator.severity == severity.upper())
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                ThreatIndicator.value.ilike(search_pattern),
                ThreatIndicator.description.ilike(search_pattern),
                ThreatIndicator.threat_category.ilike(search_pattern)
            )
        )
    return query.order_by(ThreatIndicator.risk_score.desc()).offset(offset).limit(limit).all()

@router.get("/{indicator_id}", response_model=ThreatIndicatorResponse)
def get_indicator_by_id(indicator_id: str, db: Session = Depends(get_db)):
    indicator = db.query(ThreatIndicator).filter(ThreatIndicator.id == indicator_id).first()
    if not indicator:
        raise HTTPException(status_code=404, detail="Indicator not found")
    return indicator

@router.post("", response_model=ThreatIndicatorResponse)
def create_indicator(data: ThreatIndicatorCreate, db: Session = Depends(get_db)):
    res = normalizer.normalize_and_deduplicate(
        records=[data.dict()],
        source_name=data.source or "Manual Entry",
        db=db,
        is_demo=False
    )
    if res["indicators"]:
        return res["indicators"][0]
    raise HTTPException(status_code=400, detail="Failed to ingest indicator")

@router.delete("/{indicator_id}")
def delete_indicator(indicator_id: str, db: Session = Depends(get_db)):
    indicator = db.query(ThreatIndicator).filter(ThreatIndicator.id == indicator_id).first()
    if not indicator:
        raise HTTPException(status_code=404, detail="Indicator not found")
    db.delete(indicator)
    db.commit()
    return {"message": f"Indicator {indicator.value} deleted"}

