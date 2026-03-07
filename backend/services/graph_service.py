import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def build_graph(papers, embeddings, ids, paper_map):
    G = nx.Graph()
    
    # Add nodes
    for p in papers:
        G.add_node(
            p["paperId"], 
            title=p["title"][:40], 
            year=p.get("year", 0)
        )
        
    # Add citation edges
    for p in papers:
        # CRITICAL: use (p.get("references") or [])
        refs = p.get("references") or []
        for ref in refs:
            ref_id = ref.get("paperId")
            if ref_id in paper_map:
                G.add_edge(p["paperId"], ref_id)
                
    # Semantic edges
    sim_matrix = cosine_similarity(embeddings)
    n = len(ids)
    for i in range(n):
        for j in range(i + 1, n):
            if sim_matrix[i][j] > 0.74:
                if not G.has_edge(ids[i], ids[j]):
                    G.add_edge(ids[i], ids[j], weight=float(sim_matrix[i][j]))
                    
    return G, sim_matrix

def detect_gaps(G, ids, paper_map, sim_matrix):
    gaps = []
    n = len(ids)
    
    for i in range(n):
        for j in range(i + 1, n):
            a, b = ids[i], ids[j]
            
            # Skip if edge already exists
            if G.has_edge(a, b):
                continue
                
            # Shared neighbors
            shared_neighbors = list(nx.common_neighbors(G, a, b))
            shared_count = len(shared_neighbors)
            
            if shared_count < 2:
                continue
                
            sim = sim_matrix[i][j]
            
            # Recency
            year_a = paper_map[a].get("year") or 2000
            year_b = paper_map[b].get("year") or 2000
            recency = (min(year_a, year_b) - 2000) / 25
            
            # Score
            score = round(shared_count * 0.35 + float(sim) * 0.5 + recency * 0.15, 3)
            
            gaps.append({
                "a": a,
                "b": b,
                "shared": shared_count,
                "sim": float(sim),
                "score": score
            })
            
    # Sort by score descending
    gaps.sort(key=lambda x: x["score"], reverse=True)
    return gaps[:3]
