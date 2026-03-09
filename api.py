from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai as google_genai
import json, os
load_dotenv()

gemini_client = google_genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/search")
def search(query: str = "federated learning"):
    import requests, numpy as np
    from sentence_transformers import SentenceTransformer
    import networkx as nx
    from sklearn.metrics.pairwise import cosine_similarity

    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {"query": query, "limit": 60, "fields": "paperId,title,abstract,year,references"}
    res = requests.get(url, params=params)
    data = res.json()
    if "data" not in data:
        return {"error": data, "nodes": [], "edges": [], "hypotheses": []}
    papers = [p for p in data["data"] if p.get("abstract")][:50]

    model = SentenceTransformer("all-MiniLM-L6-v2")
    texts = [f"{p['title']}. {p.get('abstract','')[:150]}" for p in papers]
    embeddings = model.encode(texts)
    ids = [p["paperId"] for p in papers]
    paper_map = {p["paperId"]: p for p in papers}

    G = nx.Graph()
    for p in papers:
        G.add_node(p["paperId"], title=p["title"][:40], year=p.get("year", 0))
    for p in papers:
        for ref in (p.get("references") or []):  # fixed None bug
            rid = ref.get("paperId")
            if rid and rid in paper_map:
                G.add_edge(p["paperId"], rid)

    sim_matrix = cosine_similarity(embeddings)
    for i in range(len(ids)):
        for j in range(i+1, len(ids)):
            if sim_matrix[i][j] > 0.74 and not G.has_edge(ids[i], ids[j]):
                G.add_edge(ids[i], ids[j], semantic=True)

    # Find gaps
    gaps = []
    node_list = list(G.nodes())
    for i in range(len(node_list)):
        for j in range(i+1, len(node_list)):
            a, b = node_list[i], node_list[j]
            if G.has_edge(a, b): continue
            shared = len(list(nx.common_neighbors(G, a, b)))
            if shared < 2: continue
            idx_a, idx_b = ids.index(a), ids.index(b)
            sim = sim_matrix[idx_a][idx_b]
            gaps.append({"a": a, "b": b, "shared": shared, "sim": float(sim),
                         "score": round(shared*0.5 + sim*0.5, 3)})
    gaps = sorted(gaps, key=lambda x: -x["score"])[:3]

    # Generate hypotheses with Gemini
    hypotheses = []
    for gap in gaps[:2]:
        pa, pb = paper_map[gap["a"]], paper_map[gap["b"]]
        prompt = f"""Paper A: "{pa['title']}" — {str(pa.get('abstract',''))[:200]}
Paper B: "{pb['title']}" — {str(pb.get('abstract',''))[:200]}
These have never been combined. Give 1 research hypothesis as JSON:
{{"title":"...","hypothesis":"Combining X and Y may lead to...","method":"...","impact":"..."}}
JSON only. No extra text."""
        try:
            res = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            raw = res.text.strip().replace("```json","").replace("```","")
            h = json.loads(raw)
            hypotheses.append({"paper_a": pa["title"], "paper_b": pb["title"],
                                "novelty_score": min(99, int(gap["score"]*100)), **h})
        except Exception as e:
            print(f"Gemini error: {e}")

    # Graph data for D3
    graph_nodes = [{"id": n, "title": G.nodes[n]["title"], "year": G.nodes[n]["year"]}
                   for n in list(G.nodes())[:40]]
    graph_edges = [{"source": u, "target": v} for u, v in list(G.edges())[:80]]
    gap_edges = [{"source": g["a"], "target": g["b"], "gap": True} for g in gaps]

    return {"nodes": graph_nodes, "edges": graph_edges + gap_edges, "hypotheses": hypotheses}

@app.get("/health")
def health():
    return {"status": "ok"}