import requests, json

def fetch_papers(query="federated learning", limit=100):
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "limit": limit,
        "fields": "paperId,title,abstract,year,references"
    }
    res = requests.get(url, params=params).json()
    papers = [p for p in res["data"] if p.get("abstract")]
    with open("papers.json", "w") as f:
        json.dump(papers, f)
    print(f"Saved {len(papers)} papers")
    return papers

fetch_papers()