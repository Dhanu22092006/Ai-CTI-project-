from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reporting & Analytics"])

@router.get("/summary")
def get_report_summary(db: Session = Depends(get_db)):
    return report_service.generate_executive_summary_data(db)

@router.get("/export/csv")
def download_csv(db: Session = Depends(get_db)):
    csv_content = report_service.generate_csv_export(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=threat_indicators_report.csv"}
    )

