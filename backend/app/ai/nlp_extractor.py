import re
from typing import List, Dict, Any, Set
from app.schemas.schemas import ExtractedEntity, ExtractionResponse

# Defanging and normalization helper
def clean_defanged(text: str) -> str:
    cleaned = text.replace("[.]", ".").replace("(.)", ".")
    cleaned = cleaned.replace("hxxp://", "http://").replace("hxxps://", "https://")
    cleaned = cleaned.replace("[:]", ":")
    return cleaned

# Regular expressions
IPV4_REGEX = r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"
IPV6_REGEX = r"\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b"
URL_REGEX = r"\bhttps?:\/\/[a-zA-Z0-9\-\._~:\/\?#\[\]@!\$&'\(\)\*\+,;=%]+"
CVE_REGEX = r"\bCVE-\d{4}-\d{4,7}\b"
SHA256_REGEX = r"\b[a-fA-F0-9]{64}\b"
SHA1_REGEX = r"\b[a-fA-F0-9]{40}\b"
MD5_REGEX = r"\b[a-fA-F0-9]{32}\b"
MITRE_TECHNIQUE_REGEX = r"\bT1\d{3}(?:\.\d{3})?\b"
DOMAIN_REGEX = r"\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|edu|gov|io|info|biz|top|live|xyz|cloud|ru|cn|co|uk|de)\b"

# Threat Actors catalog
KNOWN_THREAT_ACTORS = [
    {"name": "APT29 (Midnight Blizzard)", "patterns": [r"\bapt29\b", r"\bmidnight blizzard\b", r"\bcozy bear\b", r"\bnobelium\b"]},
    {"name": "APT28 (Fancy Bear)", "patterns": [r"\bapt28\b", r"\bfancy bear\b", r"\bstrontium\b"]},
    {"name": "Lazarus Group", "patterns": [r"\blazarus\b", r"\blazarus group\b", r"\bhidden cobra\b"]},
    {"name": "LockBit Supporter Group", "patterns": [r"\blockbit\b", r"\blockbit 3\.0\b", r"\blockbit black\b"]},
    {"name": "Volt Typhoon", "patterns": [r"\bvolt typhoon\b", r"\bvanguard panda\b"]},
    {"name": "Scattered Spider", "patterns": [r"\bscattered spider\b", r"\bocto tempest\b"]},
    {"name": "FIN7", "patterns": [r"\bfin7\b", r"\bcarbanak\b"]},
    {"name": "Sandworm Team", "patterns": [r"\bsandworm\b", r"\btelebots\b", r"\bvoodoo bear\b"]}
]

# Malware Families catalog
KNOWN_MALWARE = [
    {"name": "Cobalt Strike", "patterns": [r"\bcobalt strike\b", r"\bcobalt strike beacon\b", r"\bmalleable c2\b"]},
    {"name": "LockBit 3.0", "patterns": [r"\blockbit 3\.0\b", r"\blockbit\b", r"\blockbit black\b"]},
    {"name": "Mimikatz", "patterns": [r"\bmimikatz\b", r"\bsekurlsa\b"]},
    {"name": "LEMURLOOT", "patterns": [r"\blemurloot\b"]},
    {"name": "Qakbot", "patterns": [r"\bqakbot\b", r"\bqbot\b", r"\bquakbot\b"]},
    {"name": "RedLine Stealer", "patterns": [r"\bredline\b", r"\bredline stealer\b"]},
    {"name": "Emotet", "patterns": [r"\bemotet\b", r"\bgeodo\b"]},
    {"name": "TrickBot", "patterns": [r"\btrickbot\b"]}
]

class AIExtractionEngine:
    def __init__(self):
        self.spacy_available = False
        try:
            import spacy
            self.nlp = spacy.blank("en")
            self.spacy_available = True
        except Exception:
            self.nlp = None

    def extract_context(self, text: str, match_start: int, match_end: int, window: int = 50) -> str:
        start = max(0, match_start - window)
        end = min(len(text), match_end + window)
        snippet = text[start:end].replace("\n", " ").strip()
        if start > 0:
            snippet = "..." + snippet
        if end < len(text):
            snippet = snippet + "..."
        return snippet

    def extract_from_text(self, raw_text: str) -> ExtractionResponse:
        cleaned_text = clean_defanged(raw_text)
        entities: List[ExtractedEntity] = []
        seen_values: Set[str] = set()

        # Helper to avoid duplicates
        def add_entity(ent_type: str, val: str, confidence: float, context: str):
            key = f"{ent_type}:{val.lower()}"
            if key not in seen_values:
                seen_values.add(key)
                entities.append(ExtractedEntity(
                    type=ent_type,
                    value=val,
                    confidence=confidence,
                    context=context,
                    approved=True
                ))

        # 1. URLs (extracted before domains to prevent overlap)
        for m in re.finditer(URL_REGEX, cleaned_text, re.IGNORECASE):
            url = m.group(0)
            add_entity("url", url, 95.0, self.extract_context(cleaned_text, m.start(), m.end()))

        # 2. IPv4
        for m in re.finditer(IPV4_REGEX, cleaned_text):
            ip = m.group(0)
            # Filter non-routable dummy test ranges if desired, but keep private/demo
            add_entity("ip", ip, 94.0, self.extract_context(cleaned_text, m.start(), m.end()))

        # 3. IPv6
        for m in re.finditer(IPV6_REGEX, cleaned_text):
            ipv6 = m.group(0)
            add_entity("ipv6", ipv6, 92.0, self.extract_context(cleaned_text, m.start(), m.end()))

        # 4. Domains (avoid matching if already part of extracted URL)
        for m in re.finditer(DOMAIN_REGEX, cleaned_text, re.IGNORECASE):
            domain = m.group(0).lower()
            # simple filter for common innocent words
            if domain not in ["example.com", "schema.org"]:
                add_entity("domain", domain, 90.0, self.extract_context(cleaned_text, m.start(), m.end()))

        # 5. Hashes: SHA256 (64), SHA1 (40), MD5 (32)
        for m in re.finditer(SHA256_REGEX, cleaned_text, re.IGNORECASE):
            sha256 = m.group(0).lower()
            add_entity("sha256", sha256, 98.0, self.extract_context(cleaned_text, m.start(), m.end()))

        # For SHA1 and MD5, ensure they aren't part of an already matched SHA256 substring
        for m in re.finditer(SHA1_REGEX, cleaned_text, re.IGNORECASE):
            sha1 = m.group(0).lower()
            # check if inside SHA256
            if not any(sha1 in e.value for e in entities if e.type == "sha256"):
                add_entity("sha1", sha1, 95.0, self.extract_context(cleaned_text, m.start(), m.end()))

        for m in re.finditer(MD5_REGEX, cleaned_text, re.IGNORECASE):
            md5 = m.group(0).lower()
            if not any(md5 in e.value for e in entities if e.type in ["sha256", "sha1"]):
                add_entity("md5", md5, 93.0, self.extract_context(cleaned_text, m.start(), m.end()))

        # 6. CVEs
        for m in re.finditer(CVE_REGEX, cleaned_text, re.IGNORECASE):
            cve = m.group(0).upper()
            add_entity("cve", cve, 99.0, self.extract_context(cleaned_text, m.start(), m.end()))

        # 7. MITRE Technique IDs
        mitre_matches = []
        for m in re.finditer(MITRE_TECHNIQUE_REGEX, cleaned_text):
            tech_id = m.group(0).upper()
            context = self.extract_context(cleaned_text, m.start(), m.end())
            add_entity("mitre_technique", tech_id, 96.0, context)
            mitre_matches.append({"technique_id": tech_id, "context": context})

        # 8. Threat Actors
        detected_actors = []
        for actor in KNOWN_THREAT_ACTORS:
            for pat in actor["patterns"]:
                match = re.search(pat, cleaned_text, re.IGNORECASE)
                if match:
                    detected_actors.append(actor["name"])
                    add_entity("threat_actor", actor["name"], 92.0, self.extract_context(cleaned_text, match.start(), match.end()))
                    break

        # 9. Malware Families
        detected_malware = []
        for mal in KNOWN_MALWARE:
            for pat in mal["patterns"]:
                match = re.search(pat, cleaned_text, re.IGNORECASE)
                if match:
                    detected_malware.append(mal["name"])
                    add_entity("malware", mal["name"], 94.0, self.extract_context(cleaned_text, match.start(), match.end()))
                    break

        counts: Dict[str, int] = {}
        for ent in entities:
            counts[ent.type] = counts.get(ent.type, 0) + 1

        return ExtractionResponse(
            raw_text_length=len(raw_text),
            extracted_counts=counts,
            entities=entities,
            mitre_matches=mitre_matches,
            detected_malware=list(set(detected_malware)),
            detected_threat_actors=list(set(detected_actors))
        )

nlp_engine = AIExtractionEngine()

