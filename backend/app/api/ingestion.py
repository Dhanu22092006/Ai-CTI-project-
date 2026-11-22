import json
import csv
import io
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import IngestionHistory
from app.schemas.schemas import ManualIOCInput, IngestionResult
from app.ingestion.normalizer import normalizer
from app.ai.nlp_extractor import nlp_engine

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion"])

@router.post("/manual", response_model=IngestionResult)
def ingest_manual(input_data: ManualIOCInput, db: Session = Depends(get_db)):
    record = {
        "type": input_data.type,
        "value": input_data.value,
        "threat_category": input_data.threat_category,
        "severity": input_data.severity,
        "confidence": input_data.confidence,
        "description": input_data.description,
        "cve_references": input_data.cve_references,
        "mitre_techniques": input_data.mitre_techniques
    }
    res = normalizer.normalize_and_deduplicate(
        records=[record],
        source_name=input_data.source_name or "Manual Form Input",
        db=db,
        is_demo=False
    )
    return IngestionResult(
        source_name=res["source_name"],
        records_received=res["records_received"],
        valid_records=res["valid_records"],
        duplicates_merged=res["duplicates_merged"],
        rejected_records=res["rejected_records"],
        status=res["status"],
        message=res["message"]
    )

@router.post("/upload", response_model=IngestionResult)
async def upload_file(
    file: UploadFile = File(...),
    source_name: str = Form("Uploaded Feed"),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    filename = file.filename.lower()
    records_to_normalize = []

    try:
        if filename.endswith(".json"):
            data = json.loads(contents.decode("utf-8", errors="ignore"))
            # Check if STIX 2.1 bundle
            if isinstance(data, dict) and data.get("type") == "bundle":
                for obj in data.get("objects", []):
                    if obj.get("type") == "indicator":
                        pattern = obj.get("pattern", "")
                        # Simple STIX pattern extraction
                        val = ""
                        ioc_type = "unknown"
                        if "ipv4-addr:value = '" in pattern:
                            val = pattern.split("ipv4-addr:value = '")[1].split("'")[0]
                            ioc_type = "ip"
                        elif "domain-name:value = '" in pattern:
                            val = pattern.split("domain-name:value = '")[1].split("'")[0]
                            ioc_type = "domain"
                        elif "file:hashes" in pattern:
                            val = pattern.split("= '")[1].split("'")[0]
                            ioc_type = "sha256"
                        
                        if val:
                            records_to_normalize.append({
                                "type": ioc_type,
                                "value": val,
                                "description": obj.get("description", "STIX 2.1 indicator"),
                                "confidence": obj.get("confidence", 85.0),
                                "threat_category": "STIX Malicious Activity"
                            })
            elif isinstance(data, list):
                records_to_normalize = data
            elif isinstance(data, dict) and "indicators" in data:
                records_to_normalize = data["indicators"]

        elif filename.endswith(".csv"):
            text = contents.decode("utf-8", errors="ignore")
            reader = csv.DictReader(io.StringIO(text))
            for row in reader:
                records_to_normalize.append(row)

        elif filename.endswith(".txt") or filename.endswith(".log"):
            # Unstructured text report: run AI/NLP extractor
            text = contents.decode("utf-8", errors="ignore")
            extracted = nlp_engine.extract_from_text(text)
            for ent in extracted.entities:
                if ent.type in ["ip", "domain", "url", "sha256", "sha1", "md5", "cve"]:
                    records_to_normalize.append({
                        "type": ent.type,
                        "value": ent.value,
                        "description": f"AI Extracted from {file.filename}: {ent.context or ''}",
                        "confidence": ent.confidence,
                        "threat_category": "Unstructured Intelligence"
                    })
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload JSON, CSV, STIX, or TXT.")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")

    if not records_to_normalize:
        raise HTTPException(status_code=400, detail="No threat indicators could be identified in the uploaded file.")

    res = normalizer.normalize_and_deduplicate(
        records=records_to_normalize,
        source_name=source_name,
        db=db,
        is_demo=False
    )

    return IngestionResult(
        source_name=res["source_name"],
        records_received=res["records_received"],
        valid_records=res["valid_records"],
        duplicates_merged=res["duplicates_merged"],
        rejected_records=res["rejected_records"],
        status=res["status"],
        message=res["message"]
    )

@router.get("/history")
def get_ingestion_history(db: Session = Depends(get_db)):
    history = db.query(IngestionHistory).order_by(IngestionHistory.timestamp.desc()).limit(20).all()
    return history

