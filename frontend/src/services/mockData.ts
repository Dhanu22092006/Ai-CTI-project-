export const MOCK_USER = {
  id: "usr-admin-01",
  email: "admin@cti.platform",
  full_name: "Senior SOC Director",
  role: "admin" as const
};

export const MOCK_DASHBOARD_SUMMARY = {
  kpi: {
    total_indicators: 52,
    critical_threats: 14,
    high_threats: 22,
    active_alerts: 3,
    unique_cves: 10,
    correlated_attack_chains: 3,
    total_sources: 6,
    duplicates_removed: 8,
    total_relationships: 20
  },
  severity_distribution: [
    { name: "Critical", value: 14, color: "#ef4444" },
    { name: "High", value: 22, color: "#f97316" },
    { name: "Medium", value: 12, color: "#eab308" },
    { name: "Low", value: 4, color: "#22c55e" }
  ],
  ioc_type_distribution: [
    { name: "IP", value: 20 },
    { name: "DOMAIN", value: 15 },
    { name: "SHA256", value: 8 },
    { name: "URL", value: 5 },
    { name: "CVE", value: 10 }
  ],
  source_distribution: [
    { name: "AlienVault OTX", count: 18 },
    { name: "MISP Threat Sharing", count: 14 },
    { name: "CERT-In Advisory", count: 12 },
    { name: "Internal EDR Telemetry", count: 8 },
    { name: "DarkWeb Intelligence", count: 7 },
    { name: "NVD Database", count: 10 }
  ],
  timeline: [
    { date: "May 04", critical: 2, high: 4, medium: 3 },
    { date: "May 05", critical: 3, high: 5, medium: 4 },
    { date: "May 06", critical: 4, high: 7, medium: 5 },
    { date: "May 07", critical: 6, high: 8, medium: 6 },
    { date: "May 08", critical: 8, high: 11, medium: 7 },
    { date: "May 09", critical: 11, high: 16, medium: 9 },
    { date: "May 10", critical: 14, high: 22, medium: 12 }
  ],
  recent_alerts: [
    {
      id: "alt-001",
      title: "CRITICAL CORRELATION: Multi-Stage Intrusion Chain - Operation Arctic Eclipse (APT29)",
      severity: "CRITICAL",
      risk_score: 94.5,
      status: "New",
      created_at: new Date().toISOString(),
      affected_count: 8
    },
    {
      id: "alt-002",
      title: "CRITICAL ALERT: Imminent LockBit 3.0 Ransomware Staging Detected",
      severity: "CRITICAL",
      risk_score: 96.0,
      status: "Investigating",
      created_at: new Date().toISOString(),
      affected_count: 5
    },
    {
      id: "alt-003",
      title: "HIGH ALERT: Mass Perimeter Probing for Citrix Bleed (CVE-2023-4966)",
      severity: "HIGH",
      risk_score: 84.0,
      status: "New",
      created_at: new Date().toISOString(),
      affected_count: 3
    }
  ],
  top_techniques: [
    { technique_id: "T1071", count: 16 },
    { technique_id: "T1190", count: 12 },
    { technique_id: "T1059", count: 10 },
    { technique_id: "T1566", count: 8 },
    { technique_id: "T1055", count: 7 }
  ]
};

export const MOCK_INDICATORS = [
  {
    id: "ioc-001",
    type: "ip",
    value: "185.220.101.5",
    threat_category: "Command and Control",
    confidence: 96,
    severity: "CRITICAL",
    risk_score: 95.0,
    first_seen: new Date(Date.now() - 86400000 * 4).toISOString(),
    last_seen: new Date().toISOString(),
    description: "Active Cobalt Strike 4.9 Team Server detected communicating with enterprise endpoints.",
    sources: ["AlienVault OTX", "MISP Threat Sharing", "Internal SOC EDR"],
    tags: ["c2", "cobalt-strike", "apt29", "tor-exit"],
    cve_references: ["CVE-2023-34362", "CVE-2023-4966"],
    mitre_techniques: ["T1071", "T1059"],
    related_campaign: "Operation Arctic Eclipse",
    duplicate_count: 3,
    is_demo: true
  },
  {
    id: "ioc-002",
    type: "ip",
    value: "194.26.29.112",
    threat_category: "Scanning & Exploitation",
    confidence: 88,
    severity: "HIGH",
    risk_score: 84.0,
    first_seen: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_seen: new Date().toISOString(),
    description: "Automated vulnerability scanner probing perimeter for Citrix Bleed session disclosure.",
    sources: ["CERT-In Advisory Feed"],
    tags: ["scanner", "citrix-bleed", "recon"],
    cve_references: ["CVE-2023-4966"],
    mitre_techniques: ["T1190"],
    related_campaign: "Operation Arctic Eclipse",
    duplicate_count: 1,
    is_demo: true
  },
  {
    id: "ioc-003",
    type: "domain",
    value: "update-microsoft-auth.com",
    threat_category: "Phishing & C2",
    confidence: 95,
    severity: "CRITICAL",
    risk_score: 92.5,
    first_seen: new Date(Date.now() - 86400000 * 3).toISOString(),
    last_seen: new Date().toISOString(),
    description: "Spoofed Microsoft authentication domain used for AitM OAuth token harvesting.",
    sources: ["AlienVault OTX", "MISP Threat Sharing"],
    tags: ["spoofed-domain", "aitm", "apt29"],
    cve_references: ["CVE-2024-21412"],
    mitre_techniques: ["T1566", "T1078"],
    related_campaign: "Operation Arctic Eclipse",
    duplicate_count: 2,
    is_demo: true
  },
  {
    id: "ioc-004",
    type: "domain",
    value: "cdn-azure-edge.net",
    threat_category: "C2 Infrastructure",
    confidence: 92,
    severity: "CRITICAL",
    risk_score: 91.0,
    first_seen: new Date(Date.now() - 86400000 * 5).toISOString(),
    last_seen: new Date().toISOString(),
    description: "Lookalike Azure CDN domain distributing second-stage Cobalt Strike beacon payloads.",
    sources: ["Internal SOC EDR Telemetry"],
    tags: ["typosquat", "c2-domain", "apt29"],
    cve_references: ["CVE-2023-34362"],
    mitre_techniques: ["T1071"],
    related_campaign: "Operation Arctic Eclipse",
    duplicate_count: 1,
    is_demo: true
  },
  {
    id: "ioc-005",
    type: "sha256",
    value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    threat_category: "Malware Hash",
    confidence: 98,
    severity: "CRITICAL",
    risk_score: 97.0,
    first_seen: new Date(Date.now() - 86400000 * 4).toISOString(),
    last_seen: new Date().toISOString(),
    description: "Cobalt Strike 4.9 reflective DLL beacon injected into svchost.exe memory.",
    sources: ["AlienVault OTX", "MISP Threat Sharing", "Internal SOC EDR"],
    tags: ["cobalt-strike", "beacon", "dll-injection"],
    cve_references: ["CVE-2023-34362"],
    mitre_techniques: ["T1055", "T1071"],
    related_campaign: "Operation Arctic Eclipse",
    duplicate_count: 3,
    is_demo: true
  },
  {
    id: "ioc-006",
    type: "sha256",
    value: "7b52009b64fd0a2a49e6d8a939753077792b0554cac5245bb5640f8b09c6ac56",
    threat_category: "Ransomware Hash",
    confidence: 97,
    severity: "CRITICAL",
    risk_score: 96.0,
    first_seen: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_seen: new Date().toISOString(),
    description: "LockBit 3.0 (Black) encryptor executable with randomized file extension append.",
    sources: ["DarkWeb Intelligence Feed"],
    tags: ["lockbit", "encryptor", "ransomware"],
    cve_references: ["CVE-2024-1709"],
    mitre_techniques: ["T1486", "T1059"],
    related_campaign: "LockBit Campaign 2024",
    duplicate_count: 1,
    is_demo: true
  },
  {
    id: "ioc-007",
    type: "url",
    value: "https://update-microsoft-auth.com/oauth2/v2.0/authorize",
    threat_category: "Credential Theft",
    confidence: 95,
    severity: "CRITICAL",
    risk_score: 93.0,
    first_seen: new Date(Date.now() - 86400000 * 3).toISOString(),
    last_seen: new Date().toISOString(),
    description: "Direct phishing lure URL harvesting M365 authentication tokens.",
    sources: ["AlienVault OTX"],
    tags: ["url", "phishing", "aitm"],
    cve_references: ["CVE-2024-21412"],
    mitre_techniques: ["T1566", "T1078"],
    related_campaign: "Operation Arctic Eclipse",
    duplicate_count: 1,
    is_demo: true
  },
  {
    id: "ioc-008",
    type: "ip",
    value: "45.154.255.89",
    threat_category: "Exfiltration Gateway",
    confidence: 91,
    severity: "CRITICAL",
    risk_score: 89.5,
    first_seen: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_seen: new Date().toISOString(),
    description: "High volume encrypted outbound staging gateway observed during off-hours.",
    sources: ["Internal SOC EDR Telemetry", "AlienVault OTX"],
    tags: ["exfiltration", "c2-proxy"],
    cve_references: ["CVE-2023-34362"],
    mitre_techniques: ["T1041", "T1071"],
    related_campaign: "Operation Arctic Eclipse",
    duplicate_count: 2,
    is_demo: true
  }
];

export const MOCK_GRAPH = {
  nodes: [
    { data: { id: "185.220.101.5", label: "185.220.101.5", type: "ip", severity: "CRITICAL", risk_score: 95, color: "#00d2ff", shape: "diamond", category: "Command and Control", sources: ["AlienVault OTX", "MISP"] } },
    { data: { id: "194.26.29.112", label: "194.26.29.112", type: "ip", severity: "HIGH", risk_score: 84, color: "#00d2ff", shape: "diamond", category: "Reconnaissance Scanner", sources: ["CERT-In"] } },
    { data: { id: "45.154.255.89", label: "45.154.255.89", type: "ip", severity: "CRITICAL", risk_score: 89, color: "#00d2ff", shape: "diamond", category: "Exfiltration Gateway", sources: ["EDR Telemetry"] } },
    { data: { id: "update-microsoft-auth.com", label: "update-microsoft-auth.com", type: "domain", severity: "CRITICAL", risk_score: 93, color: "#38bdf8", shape: "ellipse", category: "AitM Phishing", sources: ["OTX", "MISP"] } },
    { data: { id: "cdn-azure-edge.net", label: "cdn-azure-edge.net", type: "domain", severity: "CRITICAL", risk_score: 91, color: "#38bdf8", shape: "ellipse", category: "C2 CDN Spoof", sources: ["EDR Telemetry"] } },
    { data: { id: "telemetry-sync-service.info", label: "telemetry-sync-service.info", type: "domain", severity: "CRITICAL", risk_score: 90, color: "#38bdf8", shape: "ellipse", category: "Exfiltration Target", sources: ["OTX"] } },
    { data: { id: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", label: "Cobalt Strike Beacon (e3b0c4...)", type: "sha256", severity: "CRITICAL", risk_score: 97, color: "#ef4444", shape: "hexagon", category: "Payload Hash", sources: ["AlienVault OTX"] } },
    { data: { id: "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9", label: "LEMURLOOT Webshell (fcde2b...)", type: "sha256", severity: "CRITICAL", risk_score: 94, color: "#ef4444", shape: "hexagon", category: "Webshell", sources: ["CERT-In"] } },
    { data: { id: "CVE-2023-34362", label: "CVE-2023-34362 (MOVEit)", type: "cve", severity: "CRITICAL", risk_score: 98, color: "#f59e0b", shape: "triangle", category: "SQL Injection RCE" } },
    { data: { id: "CVE-2023-4966", label: "CVE-2023-4966 (Citrix Bleed)", type: "cve", severity: "CRITICAL", risk_score: 94, color: "#f59e0b", shape: "triangle", category: "Session Hijack" } },
    { data: { id: "APT29 (Midnight Blizzard)", label: "APT29 (Midnight Blizzard)", type: "threat_actor", severity: "CRITICAL", risk_score: 95, color: "#8b5cf6", shape: "star", category: "State-Sponsored Actor" } },
    { data: { id: "Cobalt Strike", label: "Cobalt Strike 4.9", type: "malware", severity: "CRITICAL", risk_score: 96, color: "#dc2626", shape: "octagon", category: "Adversary Simulation Framework" } },
    { data: { id: "T1190", label: "T1190: Exploit Public App", type: "mitre_technique", severity: "MEDIUM", risk_score: 75, color: "#10b981", shape: "rectangle" } },
    { data: { id: "T1071", label: "T1071: App Layer Protocol", type: "mitre_technique", severity: "MEDIUM", risk_score: 70, color: "#10b981", shape: "rectangle" } },
    { data: { id: "T1566", label: "T1566: Phishing", type: "mitre_technique", severity: "MEDIUM", risk_score: 70, color: "#10b981", shape: "rectangle" } },
    { data: { id: "T1041", label: "T1041: Exfiltration Over C2", type: "mitre_technique", severity: "MEDIUM", risk_score: 75, color: "#10b981", shape: "rectangle" } }
  ],
  edges: [
    { data: { id: "e1", source: "185.220.101.5", target: "update-microsoft-auth.com", label: "RESOLVES_TO", relationship_type: "RESOLVES_TO", confidence: 95, evidence: "Passive DNS resolution confirms update-microsoft-auth.com resolved to 185.220.101.5.", source_ref: "AlienVault OTX" } },
    { data: { id: "e2", source: "185.220.101.5", target: "cdn-azure-edge.net", label: "RESOLVES_TO", relationship_type: "RESOLVES_TO", confidence: 92, evidence: "Shared TLS certificate and JA3/JA3S fingerprint match.", source_ref: "Internal EDR" } },
    { data: { id: "e3", source: "cdn-azure-edge.net", target: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", label: "HOSTS", relationship_type: "HOSTS", confidence: 96, evidence: "EDR memory forensic analysis confirmed beacon payload downloaded from cdn-azure-edge.net.", source_ref: "Internal EDR" } },
    { data: { id: "e4", source: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", target: "Cobalt Strike", label: "INDICATES", relationship_type: "INDICATES", confidence: 98, evidence: "YARA signature and static configuration watermark match Cobalt Strike Beacon v4.9.", source_ref: "OTX & MISP" } },
    { data: { id: "e5", source: "Cobalt Strike", target: "APT29 (Midnight Blizzard)", label: "ATTRIBUTED_TO", relationship_type: "ATTRIBUTED_TO", confidence: 92, evidence: "Tactics, C2 watermarks, and staging behavior match known APT29 playbooks.", source_ref: "CERT-In Advisory" } },
    { data: { id: "e6", source: "194.26.29.112", target: "CVE-2023-4966", label: "EXPLOITS", relationship_type: "EXPLOITS", confidence: 94, evidence: "WAF captured repeated exploitation requests targeting NetScaler /oauth/idp endpoints.", source_ref: "CERT-In Advisory" } },
    { data: { id: "e7", source: "CVE-2023-4966", target: "T1190", label: "USES_TECHNIQUE", relationship_type: "USES_TECHNIQUE", confidence: 95, evidence: "Direct exploitation of public-facing application boundary.", source_ref: "NVD" } },
    { data: { id: "e8", source: "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9", target: "CVE-2023-34362", label: "EXPLOITS", relationship_type: "EXPLOITS", confidence: 96, evidence: "LEMURLOOT webshell dropped during unauthenticated MOVEit SQL injection.", source_ref: "CERT-In" } },
    { data: { id: "e9", source: "Cobalt Strike", target: "T1071", label: "USES_TECHNIQUE", relationship_type: "USES_TECHNIQUE", confidence: 96, evidence: "HTTPS beaconing traffic with custom Malleable C2 profile.", source_ref: "AlienVault OTX" } },
    { data: { id: "e10", source: "45.154.255.89", target: "telemetry-sync-service.info", label: "RESOLVES_TO", relationship_type: "RESOLVES_TO", confidence: 91, evidence: "DNS records correlate telemetry-sync-service.info to exfiltration gateway 45.154.255.89.", source_ref: "OTX" } },
    { data: { id: "e11", source: "telemetry-sync-service.info", target: "T1041", label: "USES_TECHNIQUE", relationship_type: "USES_TECHNIQUE", confidence: 93, evidence: "Encrypted archive exfiltrated over adversary controlled HTTP C2 endpoint.", source_ref: "Internal EDR" } }
  ],
  summary: {
    total_nodes: 16,
    total_edges: 11,
    connected_components: 2,
    density: 0.083
  }
};

export const MOCK_ALERTS = [
  {
    id: "alt-001",
    title: "CRITICAL CORRELATION: Multi-Stage Intrusion Chain - Operation Arctic Eclipse (APT29)",
    description: "AI correlation engine detected a 5-step unified attack chain connecting external scanning, AitM credential phishing, Cobalt Strike C2 beaconing, and encrypted data exfiltration across 6 distinct intelligence feeds.",
    severity: "CRITICAL",
    risk_score: 94.5,
    status: "New",
    affected_indicators: ["185.220.101.5", "194.26.29.112", "update-microsoft-auth.com", "cdn-azure-edge.net", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "CVE-2023-4966", "CVE-2023-34362", "45.154.255.89"],
    intelligence_sources: ["AlienVault OTX", "MISP Threat Sharing", "CERT-In Advisory Feed", "Internal SOC EDR Telemetry"],
    mitre_techniques: ["T1190", "T1566", "T1078", "T1071", "T1055", "T1041"],
    evidence_chain: [
      {
        step: 1,
        stage: "Perimeter Exploitation",
        indicator: "194.26.29.112",
        finding: "Scanner host delivered weaponized exploits targeting NetScaler ADC (CVE-2023-4966).",
        technique: "T1190 - Exploit Public-Facing Application",
        source: "CERT-In Advisory Feed",
        confidence: 94
      },
      {
        step: 2,
        stage: "Phishing & Credential Access",
        indicator: "update-microsoft-auth.com",
        finding: "Adversary-in-the-Middle portal captured enterprise M365 session tokens, bypassing MFA.",
        technique: "T1566 - Phishing / T1078 - Valid Accounts",
        source: "AlienVault OTX & MISP",
        confidence: 95
      },
      {
        step: 3,
        stage: "C2 Infrastructure Resolution",
        indicator: "185.220.101.5",
        finding: "Passive DNS and SSL certificate pivot confirmed 185.220.101.5 hosts Cobalt Strike C2 server resolving to update-microsoft-auth.com and cdn-azure-edge.net.",
        technique: "T1071 - Application Layer Protocol",
        source: "Internal SOC EDR & OTX",
        confidence: 96
      },
      {
        step: 4,
        stage: "In-Memory Payload Execution",
        indicator: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        finding: "Cobalt Strike beacon reflective DLL injected into svchost.exe memory; Mimikatz invoked sekurlsa::logonpasswords.",
        technique: "T1055 - Process Injection / T1003 - OS Credential Dumping",
        source: "Internal SOC EDR Telemetry",
        confidence: 98
      },
      {
        step: 5,
        stage: "Exfiltration & Staging",
        indicator: "45.154.255.89 / telemetry-sync-service.info",
        finding: "Confidential archive uploaded over encrypted C2 channel to adversary gateway.",
        technique: "T1041 - Exfiltration Over C2 Channel",
        source: "AlienVault OTX",
        confidence: 92
      }
    ],
    recommended_actions: [
      "Immediately isolate host endpoints communicating with 185.220.101.5 and 45.154.255.89.",
      "Revoke all active Azure AD / M365 user session tokens and enforce re-authentication with FIDO2 MFA.",
      "Apply emergency security update for Citrix NetScaler (CVE-2023-4966) and MOVEit (CVE-2023-34362).",
      "Block DNS resolution for *.update-microsoft-auth.com and *.cdn-azure-edge.net on perimeter resolvers.",
      "Initiate memory forensic dump on hosts where svchost.exe spawned unauthorized network threads."
    ],
    assigned_to: "Senior Incident Responder",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "alt-002",
    title: "CRITICAL ALERT: Imminent LockBit 3.0 Ransomware Staging Detected",
    description: "Correlated intelligence connects ScreenConnect auth bypass exploit to active LockBit 3.0 payload distribution host and extortion C2 server.",
    severity: "CRITICAL",
    risk_score: 96.0,
    status: "Investigating",
    affected_indicators: ["91.215.85.17", "lockbit-support-decrypt.top", "7b52009b64fd0a2a49e6d8a939753077792b0554cac5245bb5640f8b09c6ac56", "CVE-2024-1709"],
    intelligence_sources: ["DarkWeb Intelligence Feed", "CERT-In Advisory"],
    mitre_techniques: ["T1190", "T1059", "T1486", "T1021"],
    evidence_chain: [
      {
        step: 1,
        stage: "Remote Access Exploitation",
        indicator: "screenconnect-cloud-relay.com",
        finding: "Rogue ScreenConnect server exploiting authentication bypass CVE-2024-1709.",
        technique: "T1190 - Exploit Public-Facing Application",
        source: "DarkWeb Intelligence Feed",
        confidence: 93
      },
      {
        step: 2,
        stage: "Ransomware Payload Distribution",
        indicator: "91.215.85.17 / lockbit-support-decrypt.top",
        finding: "Extortion site mirror hosting LockBit 3.0 Black payload.",
        technique: "T1059 - Command and Scripting Interpreter",
        source: "DarkWeb Intelligence Feed",
        confidence: 96
      },
      {
        step: 3,
        stage: "Impact: Mass Encryption Risk",
        indicator: "7b52009b64fd0a2a49e6d8a939753077792b0554cac5245bb5640f8b09c6ac56",
        finding: "Identified cryptographic routine matching LockBit 3.0 encryptor preparing for bulk file locking.",
        technique: "T1486 - Data Encrypted for Impact",
        source: "DarkWeb Intelligence Feed",
        confidence: 98
      }
    ],
    recommended_actions: [
      "Block ingress connections from 91.215.85.17 and 194.87.147.135 at firewall border.",
      "Immediately terminate external ScreenConnect remote administration sessions.",
      "Verify immutable offline backup integrity across core datastores."
    ],
    assigned_to: "SOC Tier-2 Lead",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "alt-003",
    title: "HIGH ALERT: Mass Perimeter Probing for Citrix Bleed (CVE-2023-4966)",
    description: "Source IP 194.26.29.112 observed actively sending anomalous payload buffers to exploit sensitive session memory in NetScaler ADC.",
    severity: "HIGH",
    risk_score: 84.0,
    status: "New",
    affected_indicators: ["194.26.29.112", "CVE-2023-4966"],
    intelligence_sources: ["CERT-In Advisory Feed"],
    mitre_techniques: ["T1190"],
    evidence_chain: [
      {
        step: 1,
        stage: "Exploitation Probe",
        indicator: "194.26.29.112",
        finding: "High-frequency probe targeting /oauth/idp endpoints.",
        technique: "T1190",
        source: "CERT-In Advisory Feed",
        confidence: 88
      }
    ],
    recommended_actions: [
      "Drop all inbound traffic from 194.26.29.112.",
      "Inspect NetScaler session logs for abnormally long authentication cookies."
    ],
    assigned_to: "Network Security Team",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const MOCK_VULNERABILITIES = [
  {
    id: "v-01",
    cve_id: "CVE-2023-34362",
    description: "Progress Software MOVEit Transfer SQL Injection Vulnerability leading to unauthenticated remote code execution.",
    cvss_score: 9.8,
    severity: "CRITICAL",
    published_date: "2023-06-02T00:00:00Z",
    affected_products: "Progress MOVEit Transfer before 2021.0.6",
    related_iocs: ["185.220.101.5", "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9"],
    related_techniques: ["T1190", "T1059"]
  },
  {
    id: "v-02",
    cve_id: "CVE-2023-4966",
    description: "Citrix Bleed: NetScaler ADC and NetScaler Gateway sensitive information disclosure vulnerability allowing session hijack.",
    cvss_score: 9.4,
    severity: "CRITICAL",
    published_date: "2023-10-10T00:00:00Z",
    affected_products: "NetScaler ADC and NetScaler Gateway 13.0, 13.1, 14.1",
    related_iocs: ["194.26.29.112", "185.220.101.5"],
    related_techniques: ["T1190", "T1078"]
  },
  {
    id: "v-03",
    cve_id: "CVE-2024-21412",
    description: "Microsoft Windows Defender SmartScreen Prompt Security Feature Bypass Vulnerability.",
    cvss_score: 8.1,
    severity: "HIGH",
    published_date: "2024-02-13T00:00:00Z",
    affected_products: "Microsoft Windows 10, Windows 11, Windows Server 2022",
    related_iocs: ["update-microsoft-auth.com"],
    related_techniques: ["T1566", "T1027"]
  },
  {
    id: "v-04",
    cve_id: "CVE-2024-1709",
    description: "ConnectWise ScreenConnect authentication bypass vulnerability leading to unauthenticated admin setup.",
    cvss_score: 10.0,
    severity: "CRITICAL",
    published_date: "2024-02-19T00:00:00Z",
    affected_products: "ConnectWise ScreenConnect 23.9.7 and prior",
    related_iocs: ["91.215.85.17", "7b52009b64fd0a2a49e6d8a939753077792b0554cac5245bb5640f8b09c6ac56"],
    related_techniques: ["T1190", "T1078"]
  }
];

export const MOCK_TACTICS = [
  {
    tactic: "Initial Access",
    count: 2,
    techniques: [
      { technique_id: "T1566", name: "Phishing", description: "Adversaries may send phishing messages to gain access to victim systems." },
      { technique_id: "T1190", name: "Exploit Public-Facing Application", description: "Exploiting vulnerabilities like CVE-2023-4966 or CVE-2023-34362." }
    ]
  },
  {
    tactic: "Execution",
    count: 1,
    techniques: [
      { technique_id: "T1059", name: "Command and Scripting Interpreter", description: "Abusing PowerShell, Python, or command line." }
    ]
  },
  {
    tactic: "Defense Evasion",
    count: 2,
    techniques: [
      { technique_id: "T1055", name: "Process Injection", description: "Injecting reflective DLLs into svchost.exe memory." },
      { technique_id: "T1078", name: "Valid Accounts", description: "Abusing legitimate stolen user credentials." }
    ]
  },
  {
    tactic: "Command and Control",
    count: 1,
    techniques: [
      { technique_id: "T1071", name: "Application Layer Protocol", description: "Using HTTPS beaconing on port 8443." }
    ]
  },
  {
    tactic: "Exfiltration",
    count: 1,
    techniques: [
      { technique_id: "T1041", name: "Exfiltration Over C2 Channel", description: "Stealing data through established C2 channels." }
    ]
  },
  {
    tactic: "Impact",
    count: 1,
    techniques: [
      { technique_id: "T1486", name: "Data Encrypted for Impact", description: "LockBit encryptor executing bulk file encryption." }
    ]
  }
];
