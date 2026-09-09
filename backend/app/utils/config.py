import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR.parent / "data"

class Settings(BaseSettings):
    APP_NAME: str = "FloodGuard AI"
    APP_MODE: str = os.getenv("APP_MODE", "LIVE")  # "LIVE" or "DEMO"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'app' / 'floodguard.db'}"
    )

    # Live External APIs
    OPEN_METEO_API_URL: str = os.getenv("OPEN_METEO_API_URL", "https://api.open-meteo.com/v1")
    OPEN_METEO_ELEVATION_URL: str = os.getenv("OPEN_METEO_ELEVATION_URL", "https://api.open-meteo.com/v1/elevation")
    NOMINATIM_BASE_URL: str = os.getenv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")

    # Risk Thresholds
    ALERT_THRESHOLD_LOW: float = float(os.getenv("ALERT_THRESHOLD_LOW", "0.30"))
    ALERT_THRESHOLD_MODERATE: float = float(os.getenv("ALERT_THRESHOLD_MODERATE", "0.60"))
    ALERT_THRESHOLD_HIGH: float = float(os.getenv("ALERT_THRESHOLD_HIGH", "0.85"))

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
