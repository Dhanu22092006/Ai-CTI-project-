# REST API Documentation

## AI-Powered Cyber Threat Intelligence Correlation Platform

Interactive Swagger UI is accessible at: `http://localhost:8000/docs`

---

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in with email & password, returns JWT bearer token | No |
| `POST` | `/api/auth/demo-login` | Instant 1-click login for demo roles (`admin`, `analyst`, `viewer`) | No |
| `GET` | `/api/auth/me` | Fetch active authenticated user profile | Bearer Token |

---

### Dashboard Endpoints (`/api/dashboard`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Aggregate KPI statistics, timeline distribution, source contributions, severity breakdowns, and top MITRE techniques |

---

### Threat Intelligence Endpoints (`/api/intelligence`)

| Method | Endpoint | Parameters | Description |
|---|---|---|---|
| `GET` | `/api/intelligence` | `type`, `severity`, `search`, `limit`, `offset` | List normalized STIX 2.1 indicators with multi-source attribution |
| `POST` | `/api/intelligence` | Request body | Manually create a threat indicator |
| `GET` | `/api/intelligence/{id}` | `id` | Get comprehensive details of a single indicator |
| `DELETE` | `/api/intelligence/{id}` | `id` | Remove an indicator |

---

### Data Ingestion Endpoints (`/api/ingestion`)

| Method | Endpoint | Payload | Description |
|---|---|---|---|
| `POST` | `/api/ingestion/upload` | Multipart File (`.json`, `.csv`, `.txt`, `.log`), `source_name` | Parse and normalize uploaded bundle or text advisory |
| `POST` | `/api/ingestion/manual` | JSON schema | Ingest a single IOC via manual entry |
| `GET` | `/api/ingestion/history` | None | Fetch historical ingestion audit records |

---

### AI & NLP Threat Extraction Endpoints (`/api/ai`)

| Method | Endpoint | Payload | Description |
|---|---|---|---|
| `POST` | `/api/ai/extract` | `{"text": "..."}` | Run regex & NLP extraction on unstructured text report |
| `POST` | `/api/ai/approve` | `{"entities": [...], "source_name": "..."}` | Commit approved extracted entities into database |

---

### Knowledge Graph Endpoints (`/api/graph`)

| Method | Endpoint | Parameters | Description |
|---|---|---|---|
| `GET` | `/api/graph` | `type`, `severity` | Returns Cytoscape.js compatible JSON with nodes, edges, and density summary |
| `GET` | `/api/graph/attack-chains` | None | Discovers multi-hop weakly connected attack clusters |
| `GET` | `/api/graph/node/{node_val}` | `node_val` | Returns neighborhood subgraph, degree, and edge evidence |

---

### Alerts & Incidents Endpoints (`/api/alerts`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alerts` | List prioritized alerts with evidence chains |
| `GET` | `/api/alerts/{id}` | Retrieve single alert detail, timeline, and mitigation actions |
| `PATCH` | `/api/alerts/{id}` | Update alert status (`New`, `Investigating`, `Confirmed`, `False Positive`, `Resolved`) |
| `POST` | `/api/alerts/{id}/feedback` | Submit analyst verdict (`True Positive`, `False Positive`) |
| `POST` | `/api/alerts/{id}/notes` | Append investigation note |

---

### Vulnerability & MITRE Endpoints (`/api/vulnerabilities`, `/api/mitre`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vulnerabilities` | List tracked CVE vulnerabilities with CVSS scores |
| `GET` | `/api/vulnerabilities/{cve_id}` | Retrieve specific CVE with connected threat indicators |
| `GET` | `/api/mitre/techniques` | List ATT&CK techniques with associated IOC counts |
| `GET` | `/api/mitre/tactics` | Group techniques by 12 enterprise tactics |

---

### Analyst Feedback & Model Tuning (`/api/feedback`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/feedback/summary` | Classification metrics, accuracy ratio, and recent verdicts |
| `GET` | `/api/feedback/config` | Get current risk scoring formula weights |
| `POST` | `/api/feedback/config` | Update mathematical scoring weights (must sum to 1.0) |

---

### Demo Pipeline Execution (`/api/demo`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/demo/run` | Triggers the autonomous 8-stage CTI correlation pipeline and returns stage execution audit |

