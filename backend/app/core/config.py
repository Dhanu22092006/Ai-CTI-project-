import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, extra="allow")
    
    PROJECT_NAME: str = "AI-Powered Cyber Threat Intelligence Correlation Platform"
    TAGLINE: str = "Smarter Intelligence. Safer Tomorrow."
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cti-super-secret-jwt-key-for-hackathon-2024-change-in-prod-xyz")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for hackathon convenience
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cti_platform.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # External APIs (optional credentials with mock fallbacks)
    NVD_API_KEY: str = os.getenv("NVD_API_KEY", "")
    OTX_API_KEY: str = os.getenv("OTX_API_KEY", "")
    MISP_URL: str = os.getenv("MISP_URL", "")
    MISP_API_KEY: str = os.getenv("MISP_API_KEY", "")
    
    # Demo flag
    DEMO_MODE_ENABLED: bool = True

settings = Settings()

