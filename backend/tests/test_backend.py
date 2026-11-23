import pytest
from fastapi.testclient import TestClient
from app.main import app, init_demo_state
from app.ai.nlp_extractor import nlp_engine, clean_defanged
from app.ingestion.normalizer import detect_ioc_type

# Initialize database schema and demo data
init_demo_state()
client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Cyber Threat Intelligence" in data["platform"]
    assert data["status"] == "OPERATIONAL"

def test_nlp_extraction():
    sample_text = """
    Observed suspicious beaconing from IP 185.220.101.5 to update-microsoft-auth.com.
    Payload hash identified as e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.
    Threat actor APT29 utilized Cobalt Strike beacon to exploit CVE-2023-34362 using T1071.
    """
    res = nlp_engine.extract_from_text(sample_text)
    assert res.extracted_counts.get("ip", 0) >= 1
    assert res.extracted_counts.get("cve", 0) >= 1
    assert "APT29 (Midnight Blizzard)" in res.detected_threat_actors
    assert "Cobalt Strike" in res.detected_malware

def test_defanging_helper():
    defanged = "hxxps://malicious[.]domain[.]com/payload"
    cleaned = clean_defanged(defanged)
    assert cleaned == "https://malicious.domain.com/payload"

def test_ioc_type_detection():
    assert detect_ioc_type("192.168.1.1") == "ip"
    assert detect_ioc_type("CVE-2023-34362") == "cve"
    assert detect_ioc_type("https://evil.com/payload") == "url"
    assert detect_ioc_type("c2-server.evil.org") == "domain"
    assert detect_ioc_type("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855") == "sha256"

def test_auth_login():
    response = client.post("/api/auth/login", json={
        "email": "admin@cti.platform",
        "password": "Admin123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_passwordless_demo_login_endpoint_is_gone():
    assert client.post("/api/auth/demo-login?role=admin").status_code in (404, 405)

def test_wrong_password_rejected():
    r = client.post("/api/auth/login", json={"email": "admin@cti.platform", "password": "nope-nope"})
    assert r.status_code == 400

def test_me_requires_authentication():
    # previously an anonymous request was silently treated as the admin user
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401

def test_me_with_valid_token():
    tok = client.post("/api/auth/login", json={"email": "analyst@cti.platform", "password": "Analyst123!"}).json()["access_token"]
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200 and r.json()["role"] == "analyst"

def test_register_is_admin_only():
    body = {"email": "new.user@example.com", "password": "Str0ng-Passw0rd!", "full_name": "N", "role": "admin"}
    assert client.post("/api/auth/register", json=body).status_code == 401
    analyst = client.post("/api/auth/login", json={"email": "analyst@cti.platform", "password": "Analyst123!"}).json()["access_token"]
    assert client.post("/api/auth/register", json=body, headers={"Authorization": f"Bearer {analyst}"}).status_code == 403
    admin = client.post("/api/auth/login", json={"email": "admin@cti.platform", "password": "Admin123!"}).json()["access_token"]
    import uuid
    r = client.post("/api/auth/register", json={**body, "email": f"created.{uuid.uuid4().hex[:8]}@example.com"}, headers={"Authorization": f"Bearer {admin}"})
    assert r.status_code == 200

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "kpi" in data
    assert data["kpi"]["total_indicators"] > 0
    assert "severity_distribution" in data

def test_intelligence_list():
    response = client.get("/api/intelligence?limit=10")
    assert response.status_code == 200
    indicators = response.json()
    assert len(indicators) > 0
    assert "value" in indicators[0]

def test_graph_endpoint():
    response = client.get("/api/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0

def test_alerts_endpoint():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0
    # Check evidence chain
    first_alert = alerts[0]
    assert len(first_alert["evidence_chain"]) > 0

def test_vulnerabilities_endpoint():
    response = client.get("/api/vulnerabilities")
    assert response.status_code == 200
    vulns = response.json()
    assert len(vulns) > 0

def test_mitre_techniques():
    response = client.get("/api/mitre/techniques")
    assert response.status_code == 200
    techs = response.json()
    assert len(techs) > 0

def test_reports_summary():
    response = client.get("/api/reports/summary")
    assert response.status_code == 200
    summary = response.json()
    assert "metrics" in summary

def test_feedback_submission():
    alerts = client.get("/api/alerts").json()
    if alerts:
        alert_id = alerts[0]["id"]
        response = client.post(f"/api/alerts/{alert_id}/feedback", json={
            "verdict": "True Positive",
            "notes": "Automated verification test"
        })
        assert response.status_code == 200

