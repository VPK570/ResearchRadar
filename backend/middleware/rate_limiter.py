import time
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import structlog
from collections import defaultdict
from typing import Dict, Tuple

logger = structlog.get_logger()

class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_hour: int = 10):
        super().__init__(app)
        self.requests_per_hour = requests_per_hour
        # In-memory storage: {ip: [timestamps]}
        self.history: Dict[str, list] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Only rate limit search and export endpoints
        if not (request.url.path.startswith("/api/search") or request.url.path.startswith("/api/export")):
            return await call_next(request)

        # GET status polling shouldn't be rate limited as strictly
        if request.method == "GET" and "status" in request.url.path:
            return await call_next(request)

        client_ip = request.client.host
        now = time.time()
        
        # Clean up old timestamps (older than 1 hour)
        self.history[client_ip] = [t for t in self.history[client_ip] if now - t < 3600]
        
        if len(self.history[client_ip]) >= self.requests_per_hour:
            logger.warning("rate_limit_exceeded", ip=client_ip, path=request.url.path)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again in an hour."
            )
            
        self.history[client_ip].append(now)
        return await call_next(request)
