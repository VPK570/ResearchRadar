import networkx as nx
import structlog
import asyncio

logger = structlog.get_logger()

def _detect_gaps_sync(graph_data: dict, num_gaps: int):
    nodes = graph_data.get("nodes", [])
    edges = graph_data.get("edges", [])
    paper_map = graph_data.get("paper_map", {})
    
    if not nodes or not edges:
        return []

    # Reconstruct graph for analysis
    G = nx.Graph()
    for n in nodes:
        G.add_node(n["id"])
    for e in edges:
        G.add_edge(e["source"], e["target"], weight=e.get("weight", 0), type=e.get("type"))

    # Feature 4: Research Gap Confidence Meter
    gaps = []
    nodes_list = list(G.nodes())
    
    # Pre-calculate node degrees for density
    degrees = dict(G.degree())
    
    for i in range(len(nodes_list)):
        for j in range(i + 1, len(nodes_list)):
            u = nodes_list[i]
            v = nodes_list[j]
            
            if not G.has_edge(u, v):
                shared = list(nx.common_neighbors(G, u, v))
                if not shared:
                    continue
                    
                p1 = paper_map.get(u)
                p2 = paper_map.get(v)
                
                if p1 and p2 and p1.get('embedding') is not None and p2.get('embedding') is not None:
                    # 1. Cluster Density Proxy (using node degrees relative to max)
                    # For this scope, we use neighbor count as a density local proxy
                    density_u = degrees[u] / len(nodes_list)
                    density_v = degrees[v] / len(nodes_list)
                    density_diff = abs(density_u - density_v)
                    
                    # 2. Citation Absence (No direct link + shared neighbors but no cross-citations in neighborhood)
                    # Since they aren't connected, citation_absence is naturally high
                    citation_absence = 1.0 # Standard for a topological gap
                    
                    # 3. Semantic Distance
                    from sklearn.metrics.pairwise import cosine_similarity
                    import numpy as np
                    
                    emb1 = np.array(p1['embedding']).reshape(1, -1)
                    emb2 = np.array(p2['embedding']).reshape(1, -1)
                    sim = cosine_similarity(emb1, emb2)[0][0]
                    semantic_dist = 1 - sim
                    
                    # Combined gap confidence
                    gap_confidence = (0.35 * density_diff + 0.40 * citation_absence + 0.25 * semantic_dist)
                    
                    # Recency weight (from original logic)
                    year1 = p1.get("year") or 2000
                    year2 = p2.get("year") or 2000
                    recency = max(0, (year1 + year2) / 2 - 2010) / 15.0
                    
                    final_score = (gap_confidence * 0.7) + (recency * 0.3)
                    
                    gaps.append({
                        "source": u,
                        "target": v,
                        "shared_neighbors": len(shared),
                        "confidence": round(gap_confidence, 2),
                        "score": round(final_score, 3),
                        "separation": "High" if semantic_dist > 0.4 else "Medium",
                        "paper_a": p1,
                        "paper_b": p2
                    })

    gaps.sort(key=lambda x: x["score"], reverse=True)
    return gaps[:num_gaps]

async def detect_gaps_async(graph_data: dict, num_gaps: int = 5):
    logger.info("detecting_gaps", requested_gaps=num_gaps)
    
    loop = asyncio.get_running_loop()
    gaps = await loop.run_in_executor(None, _detect_gaps_sync, graph_data, num_gaps)
    
    logger.info("gaps_detected", count=len(gaps))
    return gaps
