import re
from datetime import datetime
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from app.models.entities import ThreatIndicator, IngestionHistory, IntelligenceSource

def detect_ioc_type(value: str) -> str:
    val = value.strip()
    if re.match(r"^CVE-\d{4}-\d{4,7}$", val, re.IGNORECASE):
        return "cve"
    if re.match(r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$", val):
        return "ip"
    if re.match(r"^[a-fA-F0-9]{64}$", val):
        return "sha256"
    if re.match(r"^[a-fA-F0-9]{40}$", val):
        return "sha1"
    if re.match(r"^[a-fA-F0-9]{32}$", val):
        return "md5"
    if val.startswith("http://") or val.startswith("https://"):
        return "url"
    if re.match(r"^[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$", val):
        return "domain"
    return "unknown"

class NormalizationEngine:
    @staticmethod
    def normalize_and_deduplicate(
        records: List[Dict[str, Any]],
        source_name: str,
        db: Session,
        is_demo: bool = False
    ) -> Dict[str, Any]:
        """
        Normalizes incoming threat records into STIX 2.1 inspired schema,
        detects existing indicators, merges sources & provenance, and returns audit stats.
        """
        received = len(records)
        valid_count = 0
        duplicate_count = 0
        rejected_count = 0
        created_indicators = []

        for rec in records:
            raw_val = str(rec.get("value", "")).strip()
            if not raw_val:
                rejected_count += 1
                continue

            raw_type = str(rec.get("type", "")).strip().lower()
            detected_type = detect_ioc_type(raw_val)
            ioc_type = raw_type if raw_type in ["ip", "domain", "url", "md5", "sha1", "sha256", "cve"] else detected_type

            if ioc_type == "unknown":
                rejected_count += 1
                continue

            valid_count += 1
            severity = str(rec.get("severity", "MEDIUM")).upper()
            if severity not in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
                severity = "MEDIUM"

            confidence = float(rec.get("confidence", 75.0))
            category = rec.get("threat_category") or "Suspicious Activity"
            desc = rec.get("description") or f"Indicator {raw_val} observed in {source_name}"
            tags = list(rec.get("tags") or [])
            cve_refs = list(rec.get("cve_references") or [])
            mitre_techs = list(rec.get("mitre_techniques") or [])
            campaign = rec.get("related_campaign") or "Unclassified Campaign"

            # Check if this indicator already exists in the database
            existing = db.query(ThreatIndicator).filter(
                ThreatIndicator.type == ioc_type,
                ThreatIndicator.value == raw_val
            ).first()

            if existing:
                # Merge duplicate record
                duplicate_count += 1
                existing.duplicate_count += 1
                existing.last_seen = datetime.utcnow()
                
                # Merge sources
                current_sources = list(existing.sources or [])
                if source_name not in current_sources:
                    current_sources.append(source_name)
                existing.sources = current_sources

                # Merge tags
                current_tags = set(existing.tags or [])
                current_tags.update(tags)
                existing.tags = list(current_tags)

                # Merge CVE references
                current_cves = set(existing.cve_references or [])
                current_cves.update(cve_refs)
                existing.cve_references = list(current_cves)

                # Merge MITRE techniques
                current_techs = set(existing.mitre_techniques or [])
                current_techs.update(mitre_techs)
                existing.mitre_techniques = list(current_techs)

                # Escalate confidence if confirmed by multiple sources
                existing.confidence = min(99.0, max(existing.confidence, confidence) + 2.0)
                
                # Escalate severity if critical
                if severity == "CRITICAL" or existing.severity == "CRITICAL":
                    existing.severity = "CRITICAL"
                elif severity == "HIGH" or existing.severity == "HIGH":
                    existing.severity = "HIGH"

                # Update raw data provenance
                raw_history = existing.raw_data.get("history", []) if isinstance(existing.raw_data, dict) else []
                raw_history.append({
                    "source": source_name,
                    "ingested_at": datetime.utcnow().isoformat(),
                    "raw": rec
                })
                existing.raw_data = {"history": raw_history}
                created_indicators.append(existing)
            else:
                # Create new indicator
                indicator = ThreatIndicator(
                    type=ioc_type,
                    value=raw_val,
                    threat_category=category,
                    confidence=confidence,
                    severity=severity,
                    risk_score=70.0 if severity == "CRITICAL" else (55.0 if severity == "HIGH" else 35.0),
                    first_seen=datetime.utcnow(),
                    last_seen=datetime.utcnow(),
                    description=desc,
                    raw_data={"initial_source": source_name, "raw": rec},
                    sources=[source_name],
                    tags=tags,
                    cve_references=cve_refs,
                    mitre_techniques=mitre_techs,
                    related_campaign=campaign,
                    duplicate_count=1,
                    is_demo=is_demo
                )
                db.add(indicator)
                created_indicators.append(indicator)

        db.commit()

        # Record Ingestion History
        history = IngestionHistory(
            source_name=source_name,
            import_type="demo" if is_demo else "ingestion",
            records_received=received,
            valid_records=valid_count,
            duplicates_merged=duplicate_count,
            rejected_records=rejected_count,
            status="SUCCESS" if rejected_count == 0 else "PARTIAL",
            log_message=f"Normalized {valid_count} records. Merged {duplicate_count} duplicate indicators with source attribution retention."
        )
        db.add(history)
        db.commit()

        return {
            "source_name": source_name,
            "records_received": received,
            "valid_records": valid_count,
            "duplicates_merged": duplicate_count,
            "rejected_records": rejected_count,
            "status": history.status,
            "message": history.log_message,
            "indicators": created_indicators
        }

normalizer = NormalizationEngine()

