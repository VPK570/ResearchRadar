import structlog
import os
from dotenv import load_dotenv

# Load environment variables from .env in project root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

# Configure structlog
structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger()

# We need these imports after load_dotenv potentially
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, search, export, history, hypotheses
from middleware.rate_limiter import RateLimiterMiddleware

app = FastAPI(title="ResearchRadar API")

# Simplified CORS for dev - no credentials needed for Header-based auth
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporarily disabled rate limiter for debugging
# app.add_middleware(RateLimiterMiddleware, requests_per_hour=20)

app.include_router(auth.router)
app.include_router(search.router)
app.include_router(export.router)
app.include_router(history.router)
app.include_router(hypotheses.router)




@app.get("/")
async def root():
    return {"message": "Welcome to ResearchRadar API"}

@app.get("/health")
async def health_check():
    logger.info("health_check_hit")
    return {"status": "ok"}


