import asyncio
import json
import os
import sys
import httpx
import argparse
from pathlib import Path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

async def download_papers(query: str, limit: int = 100):
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "limit": limit,
        "fields": "paperId,title,abstract,year,references"
    }
    print(f"Fetching papers for '{query}'...")
    headers = {"User-Agent": "ResearchRadar/1.0 (mailto:developer@example.com)"}
    async with httpx.AsyncClient(headers=headers) as client:
        for attempt in range(5):
            response = await client.get(url, params=params, timeout=30.0)
            if response.status_code == 200:
                data = response.json()
                papers = data.get("data") or []
                # Filter for papers with abstracts
                filtered = [p for p in papers if p.get("abstract")]
                print(f"Found {len(papers)} papers, {len(filtered)} with abstracts.")
                return filtered
            elif response.status_code == 429:
                delay = 2 ** attempt
                print(f"Rate limited (429). Retrying in {delay} seconds...")
                await asyncio.sleep(delay)
            else:
                print(f"Error: {response.status_code}")
                return None
        print("Error: 429 - Failed to fetch data after multiple retries. Semantic Scholar might be heavily throttling your IP.")
        return None

def save_mock_data(query: str, papers: list):
    # Sanitize query for filename
    filename = query.lower().replace(" ", "_").replace("/", "_") + ".json"
    target_dir = Path(__file__).parent.parent / "backend" / "mock_data"
    target_dir.mkdir(exist_ok=True)
    
    file_path = target_dir / filename
    with open(file_path, "w") as f:
        json.dump(papers, f, indent=2)
    print(f"Saved {len(papers)} papers to {file_path}")

async def main():
    parser = argparse.ArgumentParser(description="Download mock papers for a topic")
    parser.add_argument("--topic", type=str, required=True, help="Topic to search for")
    parser.add_argument("--limit", type=int, default=100, help="Max papers to fetch")
    args = parser.parse_args()
    
    papers = await download_papers(args.topic, args.limit)
    if papers:
        save_mock_data(args.topic, papers)
    else:
        print("No papers found or error occurred.")

if __name__ == "__main__":
    asyncio.run(main())