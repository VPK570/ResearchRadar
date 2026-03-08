import structlog
import json
from pathlib import Path
from .paper_fetcher import fetch_from_semantic_scholar

logger = structlog.get_logger()

def get_freshness_metrics(papers: list[dict]):
    """
    Feature 7: Research Freshness Indicator
    Computes avg age and citation growth rate for a set of papers.
    """
    if not papers:
        return {"avg_age": 0, "freshness": "N/A", "growth": 0}
    
    current_year = 2024 # Fixed for demo consistency
    ages = [current_year - (p.get('year') or current_year) for p in papers]
    avg_age = sum(ages) / len(ages)
    
    # Growth Rate: Recent citations vs older
    recent_papers = [p for p in papers if (p.get('year') or 0) >= 2022]
    avg_recent_cites = sum(p.get('citationCount', 0) for p in recent_papers) / len(recent_papers) if recent_papers else 0
    all_avg_cites = sum(p.get('citationCount', 0) for p in papers) / len(papers)
    
    growth_rate = (avg_recent_cites / all_avg_cites) if all_avg_cites > 0 else 1.0
    
    freshness = "Very Recent" if avg_age < 2 else "Emerging" if avg_age < 5 else "Established" if avg_age < 10 else "Mature"
    
    return {
        "avg_age": round(avg_age, 1),
        "freshness": freshness,
        "growth": round(growth_rate * 100, 1)
    }

async def fetch_papers(query: str, num_papers: int = 50):
    """
    Orchestrator for paper fetching.
    1. Checks for local mock data (e.g. medical_nlp.json).
    2. Fallbacks to paper_fetcher.py for live API calls.
    """
    # 1. Check for local mock data first
    try:
        # Sanitize query for filename mapping
        mock_filename = query.lower().replace(" ", "_").replace("/", "_") + ".json"
        
        # Path to mock data directory
        mock_path = Path(__file__).parent.parent / "mock_data" / mock_filename
        
        if mock_path.exists():
            logger.info("loading_local_mock_data", query=query, path=str(mock_path))
            with open(mock_path, "r", encoding="utf-8") as f:
                papers = json.load(f)
                return papers[:num_papers]
    except Exception as e:
        logger.warning("mock_data_load_failed", error=str(e))

    # 2. Fallback to Deep API Fetching
    try:
        logger.info("falling_back_to_api_fetcher", query=query)
        papers = await fetch_from_semantic_scholar(query, limit=num_papers + 10)
        return papers[:num_papers]
    except Exception as e:
        logger.exception("papers_fetch_failed", error=str(e))
        return []
