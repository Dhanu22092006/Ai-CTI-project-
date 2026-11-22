from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.entities import (
    ThreatIndicator, Alert, Vulnerability, IntelligenceSource,
    IngestionHistory, MITRETechnique, ThreatRelationship
)
from app.graph.correlation_engine import correlation_engine

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    indicators = db.query(ThreatIndicator).all()
    alerts = db.query(Alert).all()
    sources = db.query(IntelligenceSource).all()
    vulns = db.query(Vulnerability).all()
    ingestion = db.query(IngestionHistory).all()
    relationships = db.query(ThreatRelationship).all()

    total_indicators = len(indicators)
    crit_threats = sum(1 for i in indicators if i.severity == "CRITICAL")
    high_threats = sum(1 for i in indicators if i.severity == "HIGH")
    med_threats = sum(1 for i in indicators if i.severity == "MEDIUM")
    low_threats = sum(1 for i in indicators if i.severity == "LOW")

    active_alerts = sum(1 for a in alerts if a.status in ["New", "Investigating", "Confirmed"])
    total_sources = len(sources)
    unique_cves = len(vulns)
    duplicates_removed = sum(h.duplicates_merged for h in ingestion)

    # Attack chains from correlation engine
    chains = correlation_engine.find_attack_chains() if len(correlation_engine.graph) > 0 else []

    # Severity distribution
    severity_distribution = [
        {"name": "Critical", "value": crit_threats, "color": "#ef4444"},
        {"name": "High", "value": high_threats, "color": "#f97316"},
        {"name": "Medium", "value": med_threats, "color": "#eab308"},
        {"name": "Low", "value": low_threats, "color": "#22c55e"}
    ]

    # IOC Type distribution
    type_counts = {}
    for i in indicators:
        type_counts[i.type.upper()] = type_counts.get(i.type.upper(), 0) + 1
    ioc_type_distribution = [{"name": k, "value": v} for k, v in type_counts.items()]

    # Source distribution
    source_counts = {}
    for i in indicators:
        for s in (i.sources or []):
            source_counts[s] = source_counts.get(s, 0) + 1
    source_distribution = [{"name": k, "count": v} for k, v in source_counts.items()]

    # Activity Timeline (synthetic distribution across recent days for demo visualization)
    now = datetime.utcnow()
    timeline = []
    for day_offset in range(6, -1, -1):
        target_date = now - timedelta(days=day_offset)
        day_str = target_date.strftime("%b %d")
        timeline.append({
            "date": day_str,
            "critical": max(1, crit_threats // (day_offset + 2)),
            "high": max(2, high_threats // (day_offset + 2)),
            "medium": max(3, med_threats // (day_offset + 2))
        })

    # Recent Alerts
    recent_alerts = [
        {
            "id": a.id,
            "title": a.title,
            "severity": a.severity,
            "risk_score": a.risk_score,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else "",
            "affected_count": len(a.affected_indicators or [])
        }
        for a in alerts[:6]
    ]

    # Top MITRE ATT&CK Techniques
    technique_counts = {}
    for i in indicators:
        for t in (i.mitre_techniques or []):
            technique_counts[t] = technique_counts.get(t, 0) + 1
    top_techniques = [
        {"technique_id": k, "count": v}
        for k, v in sorted(technique_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    return {
        "kpi": {
            "total_indicators": total_indicators,
            "critical_threats": crit_threats,
            "high_threats": high_threats,
            "active_alerts": active_alerts,
            "unique_cves": unique_cves,
            "correlated_attack_chains": len(chains),
            "total_sources": total_sources,
            "duplicates_removed": duplicates_removed,
            "total_relationships": len(relationships)
        },
        "severity_distribution": severity_distribution,
        "ioc_type_distribution": ioc_type_distribution,
        "source_distribution": source_distribution,
        "timeline": timeline,
        "recent_alerts": recent_alerts,
        "top_techniques": top_techniques
    }

