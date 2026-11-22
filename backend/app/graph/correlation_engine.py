import networkx as nx
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.entities import ThreatIndicator, ThreatRelationship, Vulnerability, MITRETechnique, ThreatActor, MalwareFamily

# Visual styling presets for Cytoscape.js
NODE_STYLES = {
    "ip": {"color": "#00d2ff", "shape": "diamond", "icon": "server"},
    "domain": {"color": "#38bdf8", "shape": "ellipse", "icon": "globe"},
    "url": {"color": "#60a5fa", "shape": "round-rectangle", "icon": "link"},
    "sha256": {"color": "#ef4444", "shape": "hexagon", "icon": "file-code"},
    "sha1": {"color": "#f87171", "shape": "hexagon", "icon": "file-code"},
    "md5": {"color": "#fca5a5", "shape": "hexagon", "icon": "file-code"},
    "cve": {"color": "#f59e0b", "shape": "triangle", "icon": "shield-alert"},
    "malware": {"color": "#dc2626", "shape": "octagon", "icon": "bug"},
    "threat_actor": {"color": "#8b5cf6", "shape": "star", "icon": "user-x"},
    "campaign": {"color": "#a855f7", "shape": "pentagon", "icon": "target"},
    "mitre_technique": {"color": "#10b981", "shape": "rectangle", "icon": "crosshair"},
    "source": {"color": "#64748b", "shape": "round-diamond", "icon": "database"}
}

class CorrelationEngine:
    def __init__(self):
        self.graph = nx.MultiDiGraph()

    def build_graph_from_db(self, db: Session) -> nx.MultiDiGraph:
        """
        Loads all ThreatIndicators, Vulnerabilities, ThreatRelationships, MITRE techniques,
        and constructs a fully-attributed NetworkX directed multigraph.
        """
        self.graph.clear()

        # 1. Add Threat Indicators as nodes
        indicators = db.query(ThreatIndicator).all()
        for ioc in indicators:
            style = NODE_STYLES.get(ioc.type, {"color": "#94a3b8", "shape": "ellipse"})
            self.graph.add_node(
                ioc.value,
                id=ioc.id,
                label=ioc.value,
                type=ioc.type,
                severity=ioc.severity,
                risk_score=ioc.risk_score,
                category=ioc.threat_category,
                confidence=ioc.confidence,
                sources=ioc.sources or [],
                tags=ioc.tags or [],
                cve_references=ioc.cve_references or [],
                mitre_techniques=ioc.mitre_techniques or [],
                campaign=ioc.related_campaign,
                color=style["color"],
                shape=style["shape"]
            )

        # 2. Add Vulnerabilities as nodes
        vulns = db.query(Vulnerability).all()
        for v in vulns:
            self.graph.add_node(
                v.cve_id,
                id=v.id,
                label=v.cve_id,
                type="cve",
                severity=v.severity,
                risk_score=v.cvss_score * 10.0,
                cvss=v.cvss_score,
                description=v.description,
                color=NODE_STYLES["cve"]["color"],
                shape=NODE_STYLES["cve"]["shape"]
            )

        # 3. Add MITRE Techniques as nodes
        techniques = db.query(MITRETechnique).all()
        for t in techniques:
            self.graph.add_node(
                t.technique_id,
                id=t.id,
                label=f"{t.technique_id}: {t.name}",
                type="mitre_technique",
                name=t.name,
                tactic=t.tactic,
                severity="MEDIUM",
                risk_score=60.0,
                color=NODE_STYLES["mitre_technique"]["color"],
                shape=NODE_STYLES["mitre_technique"]["shape"]
            )

        # 4. Add Threat Actors as nodes
        actors = db.query(ThreatActor).all()
        for a in actors:
            self.graph.add_node(
                a.name,
                id=a.id,
                label=a.name,
                type="threat_actor",
                severity="CRITICAL",
                risk_score=95.0,
                origin=a.origin,
                color=NODE_STYLES["threat_actor"]["color"],
                shape=NODE_STYLES["threat_actor"]["shape"]
            )

        # 5. Add Explicit Database Relationships
        relationships = db.query(ThreatRelationship).all()
        for rel in relationships:
            # Ensure nodes exist even if only referenced in relationships
            if not self.graph.has_node(rel.source_val):
                self.graph.add_node(rel.source_val, label=rel.source_val, type="generic", color="#94a3b8", shape="ellipse")
            if not self.graph.has_node(rel.target_val):
                self.graph.add_node(rel.target_val, label=rel.target_val, type="generic", color="#94a3b8", shape="ellipse")

            self.graph.add_edge(
                rel.source_val,
                rel.target_val,
                key=rel.id,
                id=rel.id,
                relationship_type=rel.relationship_type,
                confidence=rel.confidence,
                evidence=rel.evidence,
                source_ref=rel.source_ref,
                timestamp=rel.timestamp.isoformat() if rel.timestamp else None
            )

        # 6. Synthesize Inferred Correlation Edges based on Indicator Attributes
        self._infer_correlations(indicators, db)

        return self.graph

    def _infer_correlations(self, indicators: List[ThreatIndicator], db: Session):
        """
        Dynamically infers edges from shared CVEs, MITRE Techniques, and campaigns.
        """
        for ioc in indicators:
            # Link to CVEs
            for cve in (ioc.cve_references or []):
                if self.graph.has_node(cve):
                    edge_id = f"inferred-cve-{ioc.value}-{cve}"
                    if not self.graph.has_edge(ioc.value, cve):
                        self.graph.add_edge(
                            ioc.value,
                            cve,
                            key=edge_id,
                            id=edge_id,
                            relationship_type="EXPLOITS" if ioc.type in ["sha256", "ip"] else "ASSOCIATED_WITH",
                            confidence=ioc.confidence * 0.95,
                            evidence=f"Threat intelligence reports link indicator {ioc.value} to vulnerability {cve}.",
                            source_ref="Automated CTI Correlation Engine"
                        )

            # Link to MITRE Techniques
            for tech in (ioc.mitre_techniques or []):
                if self.graph.has_node(tech):
                    edge_id = f"inferred-mitre-{ioc.value}-{tech}"
                    if not self.graph.has_edge(ioc.value, tech):
                        self.graph.add_edge(
                            ioc.value,
                            tech,
                            key=edge_id,
                            id=edge_id,
                            relationship_type="USES_TECHNIQUE",
                            confidence=ioc.confidence * 0.90,
                            evidence=f"Observed behavioral signature aligns with ATT&CK technique {tech}.",
                            source_ref="ATT&CK Mapper"
                        )

    def get_cytoscape_data(self, filter_type: Optional[str] = None, filter_severity: Optional[str] = None) -> Dict[str, Any]:
        """
        Converts the NetworkX graph into standard Cytoscape.js elements JSON format.
        """
        elements = {"nodes": [], "edges": []}
        active_node_ids = set()

        for node_id, data in self.graph.nodes(data=True):
            node_type = data.get("type", "generic")
            severity = data.get("severity", "MEDIUM")

            if filter_type and filter_type != "ALL" and node_type != filter_type.lower():
                continue
            if filter_severity and filter_severity != "ALL" and severity != filter_severity.upper():
                continue

            active_node_ids.add(node_id)
            elements["nodes"].append({
                "data": {
                    "id": str(node_id),
                    "label": data.get("label", str(node_id)),
                    "type": node_type,
                    "severity": severity,
                    "risk_score": data.get("risk_score", 50.0),
                    "confidence": data.get("confidence", 70.0),
                    "category": data.get("category", "General"),
                    "color": data.get("color", "#38bdf8"),
                    "shape": data.get("shape", "ellipse"),
                    "sources": data.get("sources", []),
                    "campaign": data.get("campaign")
                }
            })

        for u, v, key, data in self.graph.edges(keys=True, data=True):
            if u in active_node_ids and v in active_node_ids:
                elements["edges"].append({
                    "data": {
                        "id": f"edge-{u}-{v}-{key}",
                        "source": str(u),
                        "target": str(v),
                        "label": data.get("relationship_type", "RELATED_TO"),
                        "relationship_type": data.get("relationship_type", "RELATED_TO"),
                        "confidence": data.get("confidence", 80.0),
                        "evidence": data.get("evidence", "Correlated through shared campaign telemetry."),
                        "source_ref": data.get("source_ref", "System")
                    }
                })

        summary = {
            "total_nodes": len(elements["nodes"]),
            "total_edges": len(elements["edges"]),
            "connected_components": nx.number_weakly_connected_components(self.graph) if len(self.graph) > 0 else 0,
            "density": round(nx.density(self.graph), 4) if len(self.graph) > 1 else 0
        }

        return {
            "nodes": elements["nodes"],
            "edges": elements["edges"],
            "summary": summary
        }

    def find_attack_chains(self) -> List[Dict[str, Any]]:
        """
        Discovers end-to-end multi-hop attack chains connecting Initial Access / C2 -> Malware -> Vulnerabilities -> Impact.
        """
        chains = []
        # Find weakly connected components
        components = list(nx.weakly_connected_components(self.graph))
        for idx, comp in enumerate(components):
            if len(comp) < 3:
                continue

            subgraph = self.graph.subgraph(comp)
            # Find nodes with in_degree == 0 (potential entrypoints) and out_degree == 0 (potential impact)
            entrypoints = [n for n in subgraph.nodes() if subgraph.in_degree(n) == 0]
            endpoints = [n for n in subgraph.nodes() if subgraph.out_degree(n) == 0]

            sub_nodes = []
            for n in comp:
                d = self.graph.nodes[n]
                sub_nodes.append({
                    "id": n,
                    "label": d.get("label", n),
                    "type": d.get("type", "generic"),
                    "severity": d.get("severity", "MEDIUM")
                })

            sub_edges = []
            for u, v, k, d in subgraph.edges(keys=True, data=True):
                sub_edges.append({
                    "source": u,
                    "target": v,
                    "relationship_type": d.get("relationship_type", "CONNECTED_TO"),
                    "evidence": d.get("evidence", "")
                })

            chains.append({
                "chain_id": f"chain-{idx + 1}",
                "name": f"Correlated Attack Cluster #{idx + 1}",
                "node_count": len(comp),
                "edge_count": len(sub_edges),
                "nodes": sub_nodes,
                "edges": sub_edges,
                "entrypoints": entrypoints,
                "impact_nodes": endpoints
            })

        return sorted(chains, key=lambda x: x["node_count"], reverse=True)

correlation_engine = CorrelationEngine()

