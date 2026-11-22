from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.graph.correlation_engine import correlation_engine
from app.models.entities import ThreatIndicator

router = APIRouter(prefix="/graph", tags=["Threat Knowledge Graph"])

@router.get("")
def get_graph(
    type: Optional[str] = Query("ALL", description="Filter by node type (ip, domain, sha256, cve, etc.)"),
    severity: Optional[str] = Query("ALL", description="Filter by severity (CRITICAL, HIGH, etc.)"),
    db: Session = Depends(get_db)
):
    # Ensure graph is in sync with database
    if len(correlation_engine.graph) == 0:
        correlation_engine.build_graph_from_db(db)
    
    return correlation_engine.get_cytoscape_data(filter_type=type, filter_severity=severity)

@router.get("/attack-chains")
def get_attack_chains(db: Session = Depends(get_db)):
    if len(correlation_engine.graph) == 0:
        correlation_engine.build_graph_from_db(db)
    return correlation_engine.find_attack_chains()

@router.get("/node/{node_val:path}")
def get_node_details(node_val: str, db: Session = Depends(get_db)):
    if len(correlation_engine.graph) == 0:
        correlation_engine.build_graph_from_db(db)
    
    if not correlation_engine.graph.has_node(node_val):
        raise HTTPException(status_code=404, detail=f"Entity '{node_val}' not found in graph")
    
    node_data = correlation_engine.graph.nodes[node_val]
    
    # Get immediate neighborhood
    neighbors = []
    edges = []
    for neighbor in correlation_engine.graph.neighbors(node_val):
        neighbor_data = correlation_engine.graph.nodes[neighbor]
        neighbors.append({
            "id": neighbor,
            "label": neighbor_data.get("label", neighbor),
            "type": neighbor_data.get("type", "generic"),
            "severity": neighbor_data.get("severity", "MEDIUM")
        })
        for k, edge_data in correlation_engine.graph.get_edge_data(node_val, neighbor).items():
            edges.append({
                "source": node_val,
                "target": neighbor,
                "relationship_type": edge_data.get("relationship_type", "RELATED_TO"),
                "evidence": edge_data.get("evidence", ""),
                "confidence": edge_data.get("confidence", 80.0)
            })

    # Incoming edges
    for predecessor in correlation_engine.graph.predecessors(node_val):
        pred_data = correlation_engine.graph.nodes[predecessor]
        neighbors.append({
            "id": predecessor,
            "label": pred_data.get("label", predecessor),
            "type": pred_data.get("type", "generic"),
            "severity": pred_data.get("severity", "MEDIUM")
        })
        for k, edge_data in correlation_engine.graph.get_edge_data(predecessor, node_val).items():
            edges.append({
                "source": predecessor,
                "target": node_val,
                "relationship_type": edge_data.get("relationship_type", "RELATED_TO"),
                "evidence": edge_data.get("evidence", ""),
                "confidence": edge_data.get("confidence", 80.0)
            })

    return {
        "node": {
            "id": node_val,
            "details": node_data
        },
        "degree": correlation_engine.graph.degree(node_val),
        "neighbors": neighbors,
        "edges": edges
    }

