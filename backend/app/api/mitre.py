from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import MITRETechnique, ThreatIndicator

router = APIRouter(prefix="/mitre", tags=["MITRE ATT&CK Framework"])

@router.get("/techniques")
def get_mitre_techniques(
    tactic: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(MITRETechnique)
    if tactic and tactic != "ALL":
        query = query.filter(MITRETechnique.tactic.ilike(f"%{tactic}%"))
    
    techniques = query.all()
    all_indicators = db.query(ThreatIndicator).all()
    # Enrich with linked indicator count
    results = []
    for tech in techniques:
        linked_count = sum(1 for ioc in all_indicators if tech.technique_id in (ioc.mitre_techniques or []))
        results.append({
            "id": tech.id,
            "technique_id": tech.technique_id,
            "name": tech.name,
            "tactic": tech.tactic,
            "description": tech.description,
            "url": tech.url,
            "detection": tech.detection,
            "associated_iocs_count": linked_count
        })
    return results

@router.get("/tactics")
def get_mitre_tactics(db: Session = Depends(get_db)):
    techniques = db.query(MITRETechnique).all()
    tactics_map: Dict[str, List[Dict[str, Any]]] = {}
    for tech in techniques:
        if tech.tactic not in tactics_map:
            tactics_map[tech.tactic] = []
        tactics_map[tech.tactic].append({
            "technique_id": tech.technique_id,
            "name": tech.name,
            "description": tech.description
        })
    return [{"tactic": k, "techniques": v, "count": len(v)} for k, v in tactics_map.items()]

