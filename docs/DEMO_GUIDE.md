# Hackathon 3-Minute Demonstration Guide

## AI-Powered Cyber Threat Intelligence Correlation Platform

This guide outlines the optimal presentation sequence to showcase the unique innovations of the platform to hackathon judges.

---

### Step 1: Login & The Problem (30 seconds)
1. Open the platform at `http://localhost:5173`.
2. Click **ADMIN** under **Instant Hackathon Demo Login** to log in instantly.
3. **Judge Pitch**:
   > *"Modern SOC teams are overwhelmed with isolated indicators and false positives from disconnected feeds. Our platform replaces fragmented alerts with a unified STIX 2.1 pipeline and explainable attack-chain correlation."*

---

### Step 2: Autonomous Correlation Demo (45 seconds)
1. Look at the top navigation bar and click the glowing button: **RUN THREAT CORRELATION DEMO**.
2. Explain the real-time modal as stages execute:
   - Aggregating feeds (OTX, MISP, CERT-In, NVD).
   - Normalizing to STIX 2.1 schema.
   - Merging duplicate indicators across feeds without losing provenance.
   - Constructing the NetworkX knowledge graph.
   - Mapping MITRE ATT&CK techniques.
   - Calculating contextual risk scores.
3. Click **Explore Results**.

---

### Step 3: Interactive Attack Graph & Relationship Evidence (60 seconds)
1. Navigate to **Attack Graph** in the sidebar.
2. Demonstrate graph interactivity:
   - Zoom in/out, pan, and drag nodes.
   - Click on node `185.220.101.5` (Diamond IP node).
   - In the right-hand **Inspection Drawer**, show that the graph automatically highlights connected domains (`update-microsoft-auth.com`, `cdn-azure-edge.net`), malware hash (`e3b0c44...`), and actor `APT29`.
   - Click the edge between the IP and domain to show the empirical evidence: *"Passive DNS resolution logs confirm update-microsoft-auth.com resolved to 185.220.101.5"*.

---

### Step 4: The Core USP — Explainable Evidence Chain (45 seconds)
1. Go to **Alerts & Incidents** in the sidebar.
2. Click **Investigate Evidence Chain** on the Critical alert: *Operation Arctic Eclipse*.
3. Walk the judges through the 5 chronological steps:
   - **Step 1**: Perimeter exploitation via Citrix Bleed (CVE-2023-4966) / MOVEit.
   - **Step 2**: Credential phishing via AitM portal.
   - **Step 3**: Resolution to C2 team server infrastructure.
   - **Step 4**: Memory process injection of Cobalt Strike beacon.
   - **Step 5**: Exfiltration over C2 channel.
4. Highlight that each step includes the specific indicator, confidence, source, and ATT&CK technique.

---

### Step 5: AI Threat Extraction & Analyst Feedback Loop (30 seconds)
1. Switch to **AI Threat Analysis**:
   - Click **Load Sample Incident Advisory**.
   - Click **Extract & Analyze Threat Entities**.
   - Point out how regex and NLP simultaneously extract IPv4, CVEs, malware families, and ATT&CK techniques with snippet contexts and confidence ratings.
2. Switch to **Analyst Feedback**:
   - Show how analyst classifications (True/False Positives) dynamically tune the contextual risk equation sliders.

