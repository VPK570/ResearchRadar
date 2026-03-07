import requests
import time

async def fetch_papers(query: str):
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "limit": 60,
        "fields": "paperId,title,abstract,year,references"
    }
    
    response = requests.get(url, params=params)
    time.sleep(1) # Rate limit respect
    
    if response.status_code != 200:
        return []
        
    data = response.json()
    papers = data.get("data") or []
    
    # Filter: keep only papers where abstract is not None or empty
    filtered_papers = [p for p in papers if p.get("abstract")]
    
    # Slice: keep first 50 papers
    return filtered_papers[:50]
