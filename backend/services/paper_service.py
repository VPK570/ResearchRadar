import httpx
import asyncio
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
import structlog
import os
import json
from pathlib import Path

logger = structlog.get_logger()

class APIError(Exception):
    pass

@retry(
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type((httpx.RequestError, APIError)),
    reraise=True
)
async def fetch_papers_from_api(query: str, limit: int = 60, client: httpx.AsyncClient = None):
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "limit": limit,
        "fields": "paperId,title,abstract,year,references"
    }
    
    logger.info("fetching_papers", query=query, limit=limit)
    response = await client.get(url, params=params, timeout=15.0)
    
    if response.status_code == 429:
        logger.warning("api_rate_limit_hit")
        raise APIError("Rate Limit")
        
    if response.status_code != 200:
        logger.error("api_failure", status=response.status_code)
        raise APIError(f"Status Code {response.status_code}")
        
    return response.json()

async def fetch_papers(query: str, num_papers: int = 50):
    # 1. Check for local mock data first
    try:
        mock_filename = query.lower().replace(" ", "_").replace("/", "_") + ".json"
        # Since this service runs inside backend/services, we look up one level to backend/mock_data
        mock_path = Path(__file__).parent.parent / "mock_data" / mock_filename
        
        if mock_path.exists():
            logger.info("loading_local_mock_data", query=query, path=str(mock_path))
            with open(mock_path, "r") as f:
                papers = json.load(f)
                return papers[:num_papers]
    except Exception as e:
        logger.warning("mock_data_load_failed", error=str(e))

    # 2. Fallback to API
    async with httpx.AsyncClient() as client:
        try:
            data = await fetch_papers_from_api(query, limit=num_papers + 10, client=client)
            papers = data.get("data") or []
            
            # Filter: keep only papers where abstract is not None or empty
            filtered_papers = [p for p in papers if p.get("abstract")]
            
            logger.info("papers_fetched_successfully", raw_count=len(papers), filtered_count=len(filtered_papers))
            return filtered_papers[:num_papers]
            
        except Exception as e:
            logger.exception("papers_fetch_failed", error=str(e))
            return []
