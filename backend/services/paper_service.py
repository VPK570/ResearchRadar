import structlog
import json
from pathlib import Path
from .paper_fetcher import fetch_from_semantic_scholar

logger = structlog.get_logger()

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
