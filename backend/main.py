from routes import auth, search, export, history, hypotheses
from middleware.rate_limiter import RateLimiterMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimiterMiddleware, requests_per_hour=20)


app.include_router(auth.router)
app.include_router(search.router)
app.include_router(export.router)
app.include_router(history.router)
app.include_router(hypotheses.router)




@app.get("/health")
async def health_check():
    logger.info("health_check_hit")
    return {"status": "ok"}


