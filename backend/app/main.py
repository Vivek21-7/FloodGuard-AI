import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Add parent directory to sys.path so app can be imported cleanly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.utils.config import settings
from app.utils.logging import logger
from app.models.database import init_db
from app.api.routes import router as main_router
from app.ml.model import get_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FloodGuard AI database & seed data...")
    init_db()
    logger.info("Pre-loading Random Forest Flood Prediction model...")
    get_model()
    logger.info(f"FloodGuard AI ready. Running in {settings.APP_MODE} mode.")
    yield
    logger.info("FloodGuard AI shutting down.")

app = FastAPI(
    title="FloodGuard AI API",
    description="Multi-Source Flash Flood Early Warning and Risk Prediction Engine for Hilly Regions (SIH 26192)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon testing & demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(main_router)

@app.get("/")
def root():
    return {
        "message": "FloodGuard AI — Flash Flood Prediction Engine is operational.",
        "mode": settings.APP_MODE,
        "docs": "/docs",
        "api_health": "/api/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
