import httpx
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
import structlog
from typing import List, Optional

logger = structlog.get_logger()

class APIError(Exception):
    pass

@retry(
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type((httpx.RequestError, APIError)),
    reraise=True
)
async def fetch_from_semantic_scholar(query: str, limit: int = 50) -> List[dict]:
    """
    Fetches papers from Semantic Scholar API and normalizes the output.
    Fields extracted: title, abstract, authors, year, citationCount, paperId.
    """
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "limit": limit,
        "fields": "paperId,title,abstract,year,authors,citationCount,externalIds"
    }
    
    headers = {
        "User-Agent": "ResearchRadar/1.0"
    }
    
    async with httpx.AsyncClient(headers=headers) as client:
        logger.info("requesting_semantic_scholar", query=query, limit=limit)
        response = await client.get(url, params=params, timeout=20.0)
        
        if response.status_code == 429:
            logger.warning("semantic_scholar_rate_limit")
            raise APIError("Rate Limit")
            
        if response.status_code != 200:
            logger.error("semantic_scholar_failure", status=response.status_code)
            raise APIError(f"Status Code {response.status_code}")
            
        data = response.json()
        papers = data.get("data") or []
        
        normalized = []
        for p in papers:
            # Skip papers without abstracts as they are core to our synthesis
            if not p.get("abstract"):
                continue
                
            normalized.append({
                "paperId": p.get("paperId"),
                "title": p.get("title"),
                "abstract": p.get("abstract"),
                "year": p.get("year"),
                "authors": [a.get("name") for a in p.get("authors", [])] if p.get("authors") else [],
                "citationCount": p.get("citationCount", 0),
                "doi": p.get("externalIds", {}).get("DOI") if p.get("externalIds") else None,
                "references": [] # Will be populated if we do deep fetching, currently empty for search
            })
            
        logger.info("fetch_complete", count=len(normalized))
        return normalized
