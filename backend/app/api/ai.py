from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import ExtractionResponse, ApproveExtractionRequest, IngestionResult
from app.ai.nlp_extractor import nlp_engine
from app.ingestion.normalizer import normalizer

router = APIRouter(prefix="/ai", tags=["AI & NLP Threat Extraction"])

@router.post("/extract", response_model=ExtractionResponse)
def extract_threat_entities(payload: dict = Body(...)):
    text = payload.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    return nlp_engine.extract_from_text(text)

@router.post("/approve", response_model=IngestionResult)
def approve_and_ingest_entities(data: ApproveExtractionRequest, db: Session = Depends(get_db)):
    records = []
    for ent in data.entities:
        if ent.approved and ent.type in ["ip", "domain", "url", "sha256", "sha1", "md5", "cve"]:
            records.append({
                "type": ent.type,
                "value": ent.value,
                "confidence": ent.confidence,
                "threat_category": "AI Extracted Intelligence",
                "description": f"Extracted entity from report: {ent.context or ent.value}"
            })
    
    if not records:
        return IngestionResult(
            source_name=data.source_name,
            records_received=len(data.entities),
            valid_records=0,
            duplicates_merged=0,
            rejected_records=len(data.entities),
            status="SUCCESS",
            message="No indicators approved for ingestion."
        )

    res = normalizer.normalize_and_deduplicate(
        records=records,
        source_name=data.source_name,
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

