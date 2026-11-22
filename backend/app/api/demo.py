from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.demo_pipeline import demo_service

router = APIRouter(prefix="/demo", tags=["Hackathon Demo Mode"])

@router.post("/run")
def run_demo_pipeline(db: Session = Depends(get_db)):
    try:
        result = demo_service.load_demo_data(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute demo pipeline: {str(e)}")

