from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.entities import ThreatIndicator, RiskScoringConfig, IntelligenceSource

class RiskScoringEngine:
    SEVERITY_SCORES = {
        "CRITICAL": 95.0,
        "HIGH": 75.0,
        "MEDIUM": 50.0,
        "LOW": 25.0
    }

    @staticmethod
    def get_config(db: Session) -> RiskScoringConfig:
        config = db.query(RiskScoringConfig).first()
        if not config:
            config = RiskScoringConfig(
                severity_weight=0.30,
                confidence_weight=0.25,
                source_reliability_weight=0.15,
                vuln_impact_weight=0.15,
                correlation_strength_weight=0.15
            )
            db.add(config)
            db.commit()
            db.refresh(config)
        return config

    @classmethod
    def calculate_indicator_risk(
        cls,
        indicator: ThreatIndicator,
        db: Session,
        correlation_edges_count: int = 0
    ) -> Dict[str, Any]:
        config = cls.get_config(db)

        # 1. Severity Factor (0-100)
        sev_score = cls.SEVERITY_SCORES.get(indicator.severity.upper(), 50.0)

        # 2. Confidence Factor (0-100)
        conf_score = max(0.0, min(100.0, float(indicator.confidence)))

        # 3. Source Reliability Factor (0-100)
        source_scores = []
        for src_name in (indicator.sources or []):
            src_obj = db.query(IntelligenceSource).filter(IntelligenceSource.name == src_name).first()
            if src_obj:
                source_scores.append(src_obj.reliability_score)
            else:
                source_scores.append(80.0)
        source_rel_score = sum(source_scores) / len(source_scores) if source_scores else 75.0

        # Multi-source confirmation bonus
        if len(indicator.sources or []) > 1:
            source_rel_score = min(100.0, source_rel_score + (len(indicator.sources) - 1) * 5.0)

        # 4. Vulnerability Impact Factor (0-100)
        vuln_score = 0.0
        if indicator.cve_references and len(indicator.cve_references) > 0:
            # Active CVE linkage has high severity impact
            vuln_score = min(100.0, 70.0 + len(indicator.cve_references) * 10.0)
        else:
            vuln_score = 30.0 if indicator.type in ["sha256", "ip"] else 15.0

        # 5. Correlation Strength Factor (0-100)
        # Based on how interconnected this node is in the attack graph
        corr_score = min(100.0, max(20.0, correlation_edges_count * 20.0))

        # Weighted calculation
        final_score = (
            (sev_score * config.severity_weight) +
            (conf_score * config.confidence_weight) +
            (source_rel_score * config.source_reliability_weight) +
            (vuln_score * config.vuln_impact_weight) +
            (corr_score * config.correlation_strength_weight)
        )
        final_score = round(max(0.0, min(100.0, final_score)), 1)

        # Determine Category
        if final_score >= config.threshold_critical:
            category = "CRITICAL"
        elif final_score >= config.threshold_high:
            category = "HIGH"
        elif final_score >= config.threshold_medium:
            category = "MEDIUM"
        else:
            category = "LOW"

        # Evidence explanation
        reasons = []
        if sev_score >= 80:
            reasons.append(f"Classified with {indicator.severity} severity due to malicious function.")
        if len(indicator.sources or []) > 1:
            reasons.append(f"Confirmed independently by {len(indicator.sources)} distinct threat intelligence sources.")
        if indicator.cve_references:
            reasons.append(f"Directly associated with {len(indicator.cve_references)} high-impact vulnerabilities ({', '.join(indicator.cve_references)}).")
        if correlation_edges_count >= 2:
            reasons.append(f"Actively interconnected into attack chain across {correlation_edges_count} correlated graph relationships.")

        explanation = " ".join(reasons) if reasons else f"Baseline evaluation based on {indicator.threat_category} telemetry."

        return {
            "score": final_score,
            "category": category,
            "factors": {
                "severity_score": sev_score,
                "confidence_score": conf_score,
                "source_reliability_score": round(source_rel_score, 1),
                "vulnerability_impact_score": vuln_score,
                "correlation_strength_score": corr_score
            },
            "weights": {
                "severity": config.severity_weight,
                "confidence": config.confidence_weight,
                "source_reliability": config.source_reliability_weight,
                "vulnerability_impact": config.vuln_impact_weight,
                "correlation_strength": config.correlation_strength_weight
            },
            "explanation": explanation
        }

risk_engine = RiskScoringEngine()

