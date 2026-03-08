import httpx
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
import structlog
from typing import List, Optional

logger = structlog.get_logger()

class APIError(Exception):
    pass

import os

@retry(
    wait=wait_exponential(multiplier=2, min=1, max=10),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(httpx.RequestError),
    reraise=True
)
async def fetch_from_arxiv(query: str, limit: int = 50) -> List[dict]:
    """Fallback fetcher using ArXiv API"""
    logger.info("requesting_arxiv", query=query, limit=limit)
    import xml.etree.ElementTree as ET
    
    url = "https://export.arxiv.org/api/query"
    params = {
        "search_query": query, # Simpler query
        "start": 0,
        "max_results": limit
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=20.0)
        if response.status_code != 200:
            return []
            
        root = ET.fromstring(response.text)
        namespace = {'atom': 'http://www.w3.org/2005/Atom'}
        
        normalized = []
        for entry in root.findall('atom:entry', namespace):
            title = entry.find('atom:title', namespace).text.strip()
            abstract = entry.find('atom:summary', namespace).text.strip()
            year_str = entry.find('atom:published', namespace).text
            year = int(year_str[:4]) if year_str else 2024
            
            authors = [a.find('atom:name', namespace).text for a in entry.findall('atom:author', namespace)]
            
            normalized.append({
                "paperId": entry.find('atom:id', namespace).text,
                "title": title,
                "abstract": abstract,
                "year": year,
                "authors": authors,
                "citationCount": 0, # ArXiv doesn't provide this easily
                "doi": None,
                "references": []
            })
            
        return normalized

async def fetch_from_semantic_scholar(query: str, limit: int = 50) -> List[dict]:
    """
    Fetches papers with fallback to ArXiv.
    """
    api_key = os.getenv("S2_API_KEY")
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "limit": limit,
        "fields": "paperId,title,abstract,year,authors,citationCount,externalIds"
    }
    
    headers = {"User-Agent": "ResearchRadar/1.0"}
    if api_key and api_key != "your_semantic_scholar_key_here":
        headers["x-api-key"] = api_key

    try:
        async with httpx.AsyncClient(headers=headers) as client:
            logger.info("requesting_semantic_scholar", query=query)
            response = await client.get(url, params=params, timeout=15.0)
            
            if response.status_code == 200:
                data = response.json()
                papers = data.get("data") or []
                normalized = []
                for p in papers:
                    if not p.get("abstract"): continue
                    normalized.append({
                        "paperId": p.get("paperId"),
                        "title": p.get("title"),
                        "abstract": p.get("abstract"),
                        "year": p.get("year"),
                        "authors": [a.get("name") for a in p.get("authors", [])] if p.get("authors") else [],
                        "citationCount": p.get("citationCount", 0),
                        "doi": p.get("externalIds", {}).get("DOI") if p.get("externalIds") else None,
                        "references": []
                    })
                if normalized:
                    return normalized
            
            logger.warning("semantic_scholar_empty_or_failed", status=response.status_code)
    except Exception as e:
        logger.warning("semantic_scholar_error", error=str(e))

    # Fallback to ArXiv
    return await fetch_from_arxiv(query, limit)
