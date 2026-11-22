import io
import csv
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import ThreatIndicator, Alert, Vulnerability, IngestionHistory

class ReportService:
    @staticmethod
    def generate_executive_summary_data(db: Session) -> Dict[str, Any]:
        indicators = db.query(ThreatIndicator).all()
        alerts = db.query(Alert).all()
        vulns = db.query(Vulnerability).all()
        ingestions = db.query(IngestionHistory).all()

        crit_count = sum(1 for i in indicators if i.severity == "CRITICAL")
        high_count = sum(1 for i in indicators if i.severity == "HIGH")
        med_count = sum(1 for i in indicators if i.severity == "MEDIUM")
        low_count = sum(1 for i in indicators if i.severity == "LOW")
        dup_count = sum(i.duplicates_merged for i in ingestions)

        critical_iocs = [
            {
                "type": i.type,
                "value": i.value,
                "category": i.threat_category,
                "risk_score": i.risk_score,
                "sources": i.sources
            }
            for i in indicators if i.severity == "CRITICAL"
        ][:10]

        alert_summaries = [
            {
                "id": a.id,
                "title": a.title,
                "severity": a.severity,
                "risk_score": a.risk_score,
                "status": a.status,
                "evidence_chain_count": len(a.evidence_chain or []),
                "indicators": a.affected_indicators
            }
            for a in alerts
        ]

        return {
            "title": "Cyber Threat Intelligence Executive Assessment Report",
            "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "classification": "CONFIDENTIAL // TLP:AMBER",
            "metrics": {
                "total_indicators": len(indicators),
                "critical_indicators": crit_count,
                "high_indicators": high_count,
                "medium_indicators": med_count,
                "low_indicators": low_count,
                "active_alerts": len(alerts),
                "tracked_cves": len(vulns),
                "duplicates_prevented": dup_count
            },
            "top_critical_threats": critical_iocs,
            "correlated_alerts": alert_summaries,
            "strategic_recommendations": [
                "Prioritize perimeter boundary remediation for CVE-2023-4966 (Citrix Bleed) and CVE-2023-34362 (MOVEit).",
                "Deploy proactive DNS response policy zones (RPZ) sinkholing known C2 infrastructure (update-microsoft-auth.com, cdn-azure-edge.net).",
                "Enforce continuous behavioral EDR telemetry to detect in-memory Cobalt Strike beacon DLL injection and Mimikatz execution.",
                "Review identity provider authentication session logs for abnormal geographical velocity and AitM reverse proxy indicators."
            ]
        }

    @staticmethod
    def generate_csv_export(db: Session) -> str:
        indicators = db.query(ThreatIndicator).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "ID", "Type", "Value", "Category", "Confidence", "Severity", "Risk Score",
            "Sources", "CVE References", "MITRE Techniques", "Duplicate Count", "First Seen"
        ])
        for i in indicators:
            writer.writerow([
                i.id,
                i.type,
                i.value,
                i.threat_category,
                i.confidence,
                i.severity,
                i.risk_score,
                ";".join(i.sources or []),
                ";".join(i.cve_references or []),
                ";".join(i.mitre_techniques or []),
                i.duplicate_count,
                i.first_seen.isoformat() if i.first_seen else ""
            ])
        return output.getvalue()

report_service = ReportService()

