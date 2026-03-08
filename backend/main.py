from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog
import os
from dotenv import load_dotenv

from routes import auth, search, export, history, hypotheses
from middleware.rate_limiter import RateLimiterMiddleware

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

app = FastAPI(title="ResearchRadar API")

# Order of middleware: LAST added is FIRST to run on request.
# CORS should be the outermost (last added) to catch all responses.
app.add_middleware(RateLimiterMiddleware, requests_per_hour=50)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
