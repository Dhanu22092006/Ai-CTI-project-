import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst", nullable=False)  # admin, analyst, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class IntelligenceSource(Base):
    __tablename__ = "intelligence_sources"
    
    id = Column(String(50), primary_key=True, default=gen_uuid)
    name = Column(String(255), unique=True, nullable=False)
    type = Column(String(50), default="osint")  # osint, misp, cve, cert, internal, manual, demo
    url = Column(String(500), nullable=True)
    reliability_score = Column(Float, default=80.0)
    active = Column(Boolean, default=True)
    last_sync = Column(DateTime, default=datetime.utcnow)

class ThreatIndicator(Base):
    __tablename__ = "threat_indicators"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    type = Column(String(50), index=True, nullable=False)  # ip, domain, url, md5, sha1, sha256, cve
    value = Column(String(500), index=True, nullable=False)
    threat_category = Column(String(100), default="Suspicious Activity")
    confidence = Column(Float, default=70.0)
    severity = Column(String(50), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    risk_score = Column(Float, default=50.0)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    description = Column(Text, nullable=True)
    raw_data = Column(JSON, default=dict)
    sources = Column(JSON, default=list)  # list of source strings
    tags = Column(JSON, default=list)
    cve_references = Column(JSON, default=list)
    mitre_techniques = Column(JSON, default=list)
    related_campaign = Column(String(255), nullable=True)
    duplicate_count = Column(Integer, default=1)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    cve_id = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    cvss_score = Column(Float, default=0.0)
    severity = Column(String(50), default="MEDIUM")
    published_date = Column(DateTime, nullable=True)
    last_modified = Column(DateTime, nullable=True)
    affected_products = Column(Text, nullable=True)
    related_iocs = Column(JSON, default=list)
    related_techniques = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class ThreatActor(Base):
    __tablename__ = "threat_actors"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), unique=True, index=True, nullable=False)
    aliases = Column(JSON, default=list)
    origin = Column(String(100), nullable=True)
    motivation = Column(String(255), nullable=True)
    associated_malware = Column(JSON, default=list)
    associated_techniques = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class MalwareFamily(Base):
    __tablename__ = "malware_families"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), unique=True, index=True, nullable=False)
    type = Column(String(100), default="Trojan")  # Ransomware, C2 Beacon, Trojan, Stealer, Webshell
    description = Column(Text, nullable=True)
    associated_hashes = Column(JSON, default=list)
    associated_cves = Column(JSON, default=list)
    associated_techniques = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    target_sectors = Column(JSON, default=list)
    actors = Column(JSON, default=list)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class MITRETechnique(Base):
    __tablename__ = "mitre_techniques"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    technique_id = Column(String(50), unique=True, index=True, nullable=False)  # T1566
    name = Column(String(255), nullable=False)
    tactic = Column(String(100), index=True, nullable=False)  # Initial Access, Execution, etc.
    description = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)
    detection = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ThreatRelationship(Base):
    __tablename__ = "threat_relationships"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    source_val = Column(String(500), index=True, nullable=False)
    target_val = Column(String(500), index=True, nullable=False)
    relationship_type = Column(String(100), index=True, nullable=False)  # RESOLVES_TO, HOSTS, INDICATES, etc.
    confidence = Column(Float, default=85.0)
    evidence = Column(Text, nullable=True)
    source_ref = Column(String(255), default="System Correlation Engine")
    timestamp = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(50), index=True, default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    risk_score = Column(Float, default=75.0)
    status = Column(String(50), index=True, default="New")  # New, Investigating, Confirmed, False Positive, Resolved
    affected_indicators = Column(JSON, default=list)  # list of indicator values
    intelligence_sources = Column(JSON, default=list)
    mitre_techniques = Column(JSON, default=list)
    evidence_chain = Column(JSON, default=list)  # array of explanation step objects
    recommended_actions = Column(JSON, default=list)
    assigned_to = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AnalystFeedback(Base):
    __tablename__ = "analyst_feedback"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    alert_id = Column(String(36), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), nullable=False)
    user_name = Column(String(255), default="Analyst")
    verdict = Column(String(50), nullable=False)  # True Positive, False Positive, Needs Further Investigation
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class InvestigationNote(Base):
    __tablename__ = "investigation_notes"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    alert_id = Column(String(36), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), nullable=False)
    author_name = Column(String(255), default="Analyst")
    note = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class IngestionHistory(Base):
    __tablename__ = "ingestion_history"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    source_name = Column(String(255), nullable=False)
    import_type = Column(String(50), default="manual")  # file, api, manual, demo
    records_received = Column(Integer, default=0)
    valid_records = Column(Integer, default=0)
    duplicates_merged = Column(Integer, default=0)
    rejected_records = Column(Integer, default=0)
    status = Column(String(50), default="SUCCESS")  # SUCCESS, FAILED, PARTIAL
    log_message = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), nullable=True)
    user_email = Column(String(255), default="system")
    action = Column(String(100), nullable=False)  # LOGIN, DEMO_RUN, ALERT_UPDATE, FEEDBACK, INGESTION
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(100), nullable=True)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)

class RiskScoringConfig(Base):
    __tablename__ = "risk_scoring_config"
    
    id = Column(Integer, primary_key=True, default=1)
    severity_weight = Column(Float, default=0.30)
    confidence_weight = Column(Float, default=0.25)
    source_reliability_weight = Column(Float, default=0.15)
    vuln_impact_weight = Column(Float, default=0.15)
    correlation_strength_weight = Column(Float, default=0.15)
    threshold_critical = Column(Float, default=80.0)
    threshold_high = Column(Float, default=60.0)
    threshold_medium = Column(Float, default=40.0)
    threshold_low = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow)

