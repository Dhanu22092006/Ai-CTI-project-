from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

# User & Auth
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "analyst"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

# Threat Indicators
class ThreatIndicatorBase(BaseModel):
    type: str
    value: str
    threat_category: Optional[str] = "Suspicious Activity"
    confidence: Optional[float] = 70.0
    severity: Optional[str] = "MEDIUM"
    source: Optional[str] = "Manual Input"
    description: Optional[str] = None
    tags: Optional[List[str]] = []
    cve_references: Optional[List[str]] = []
    mitre_techniques: Optional[List[str]] = []
    related_campaign: Optional[str] = None

class ThreatIndicatorCreate(ThreatIndicatorBase):
    pass

class ThreatIndicatorResponse(BaseModel):
    id: str
    type: str
    value: str
    threat_category: Optional[str]
    confidence: float
    severity: str
    risk_score: float
    first_seen: datetime
    last_seen: datetime
    description: Optional[str]
    sources: List[str]
    tags: List[str]
    cve_references: List[str]
    mitre_techniques: List[str]
    related_campaign: Optional[str]
    duplicate_count: int
    is_demo: bool
    model_config = ConfigDict(from_attributes=True)

# Extracted Entity from AI/NLP
class ExtractedEntity(BaseModel):
    type: str  # ip, domain, url, md5, sha1, sha256, cve, threat_actor, malware, mitre_technique
    value: str
    confidence: float
    context: Optional[str] = None
    approved: bool = True

class ExtractionResponse(BaseModel):
    raw_text_length: int
    extracted_counts: Dict[str, int]
    entities: List[ExtractedEntity]
    mitre_matches: List[Dict[str, Any]]
    detected_malware: List[str]
    detected_threat_actors: List[str]

class ApproveExtractionRequest(BaseModel):
    entities: List[ExtractedEntity]
    source_name: str = "AI Threat Extraction"

# Graph Schemas
class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    severity: Optional[str] = "MEDIUM"
    risk_score: Optional[float] = 50.0
    category: Optional[str] = None
    sources: Optional[List[str]] = []
    details: Optional[Dict[str, Any]] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship_type: str
    confidence: float
    evidence: Optional[str] = None
    source_ref: Optional[str] = None

class CytoscapeGraph(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    summary: Dict[str, Any]

# Alert Schemas
class AlertResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    severity: str
    risk_score: float
    status: str
    affected_indicators: List[str]
    intelligence_sources: List[str]
    mitre_techniques: List[str]
    evidence_chain: List[Dict[str, Any]]
    recommended_actions: List[str]
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AlertStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class AnalystFeedbackCreate(BaseModel):
    verdict: str
    notes: Optional[str] = None

# Vulnerability Schemas
class VulnerabilityResponse(BaseModel):
    id: str
    cve_id: str
    description: Optional[str]
    cvss_score: float
    severity: str
    published_date: Optional[datetime]
    last_modified: Optional[datetime]
    affected_products: Optional[str]
    related_iocs: List[str]
    related_techniques: List[str]
    model_config = ConfigDict(from_attributes=True)

# Ingestion Schemas
class ManualIOCInput(BaseModel):
    type: str
    value: str
    threat_category: Optional[str] = "Suspicious Indicator"
    severity: Optional[str] = "HIGH"
    confidence: Optional[float] = 85.0
    source_name: Optional[str] = "Analyst Manual Entry"
    description: Optional[str] = None
    cve_references: Optional[List[str]] = []
    mitre_techniques: Optional[List[str]] = []

class IngestionResult(BaseModel):
    source_name: str
    records_received: int
    valid_records: int
    duplicates_merged: int
    rejected_records: int
    status: str
    message: str

# Risk Config
class RiskConfigUpdate(BaseModel):
    severity_weight: float
    confidence_weight: float
    source_reliability_weight: float
    vuln_impact_weight: float
    correlation_strength_weight: float

