from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Vulnerability, ThreatIndicator
from app.schemas.schemas import VulnerabilityResponse

router = APIRouter(prefix="/vulnerabilities", tags=["Vulnerability Intelligence"])

@router.get("", response_model=List[VulnerabilityResponse])
def get_vulnerabilities(
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Vulnerability)
    if severity and severity != "ALL":
        query = query.filter(Vulnerability.severity == severity.upper())
    if search:
        query = query.filter(
            (Vulnerability.cve_id.ilike(f"%{search}%")) |
            (Vulnerability.description.ilike(f"%{search}%")) |
            (Vulnerability.affected_products.ilike(f"%{search}%"))
        )
    return query.order_by(Vulnerability.cvss_score.desc()).all()

@router.get("/{cve_id}", response_model=VulnerabilityResponse)
def get_vulnerability_detail(cve_id: str, db: Session = Depends(get_db)):
    vuln = db.query(Vulnerability).filter(Vulnerability.cve_id == cve_id.upper()).first()
    if not vuln:
        raise HTTPException(status_code=404, detail=f"Vulnerability {cve_id} not found")
    
    # Enrich with real-time indicators linked to this CVE
    all_iocs = db.query(ThreatIndicator).all()
    vuln.related_iocs = [i.value for i in all_iocs if cve_id.upper() in [c.upper() for c in (i.cve_references or [])]]
    
    return vuln

