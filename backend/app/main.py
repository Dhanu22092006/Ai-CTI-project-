import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.models.entities import User
from app.core.security import hash_password
from app.services.demo_pipeline import demo_service

# Routers
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.intelligence import router as intelligence_router
from app.api.ingestion import router as ingestion_router
from app.api.ai import router as ai_router
from app.api.graph import router as graph_router
from app.api.alerts import router as alerts_router
from app.api.vulnerabilities import router as vuln_router
from app.api.mitre import router as mitre_router
from app.api.feedback import router as feedback_router
from app.api.reports import router as reports_router
from app.api.demo import router as demo_router

# Ensure tables are created immediately
Base.metadata.create_all(bind=engine)

def init_demo_state():
    db = SessionLocal()
    try:
        users = [
            ("admin@cti.platform", "Admin123!", "Senior SOC Director", "admin"),
            ("analyst@cti.platform", "Analyst123!", "Threat Intel Analyst", "analyst"),
            ("viewer@cti.platform", "Viewer123!", "Executive Observer", "viewer")
        ]
        for email, pwd, name, role in users:
            existing = db.query(User).filter(User.email == email).first()
            if not existing:
                db.add(User(
                    email=email,
                    hashed_password=hash_password(pwd),
                    full_name=name,
                    role=role
                ))
        db.commit()

        # Seed initial dataset if empty
        existing_alerts = db.query(User).count()
        demo_service.load_demo_data(db)
        print("Database initialized and demo threat correlation dataset populated.")
    except Exception as e:
        print(f"Startup initialization notice: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_demo_state()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the AI-Powered Cyber Threat Intelligence Correlation Platform. Implements STIX 2.1 normalization, NLP entity extraction, NetworkX threat graph correlation, MITRE ATT&CK mapping, and explainable risk scoring.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(intelligence_router, prefix=settings.API_V1_STR)
app.include_router(ingestion_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(graph_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(vuln_router, prefix=settings.API_V1_STR)
app.include_router(mitre_router, prefix=settings.API_V1_STR)
app.include_router(feedback_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(demo_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": "1.0.0",
        "documentation": "/docs",
        "status": "OPERATIONAL"
    }

