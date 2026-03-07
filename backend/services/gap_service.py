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

    # Reconstruct lightweight graph for topology analysis
    G = nx.Graph()
    for n in nodes:
        G.add_node(n["id"])
    for e in edges:
        G.add_edge(e["source"], e["target"], weight=e.get("weight", 0), type=e.get("type"))

    gaps = []
    nodes_list = list(G.nodes())
    
    # Check all non-connected pairs
    for i in range(len(nodes_list)):
        for j in range(i + 1, len(nodes_list)):
            u = nodes_list[i]
            v = nodes_list[j]
            
            if not G.has_edge(u, v):
                # Calculate shared neighbors
                shared = list(nx.common_neighbors(G, u, v))
                if not shared:
                    continue
                    
                # To be a gap, they must share neighbors but have no direct edge.
                # Let's get their semantic similarity if they have embeddings
                p1 = paper_map.get(u)
                p2 = paper_map.get(v)
                
                if p1 and p2 and p1.get('embedding') is not None and p2.get('embedding') is not None:
                    # We can use cosine similarity from embeddings, or just rely on the topology + year
                    # For performance, we'll just score based on topology and recency
                    shared_score = len(shared)
                    
                    year1 = p1.get("year") or 2000
                    year2 = p2.get("year") or 2000
                    recency_score = max(0, (year1 + year2) / 2 - 2010) / 15.0 # Normalize roughly
                    
                    total_score = (shared_score * 0.7) + (recency_score * 0.3)
                    
                    gaps.append({
                        "source": u,
                        "target": v,
                        "shared_neighbors": len(shared),
                        "score": round(total_score, 3),
                        "paper_a": p1,
                        "paper_b": p2
                    })

    # Sort by score descending
    gaps.sort(key=lambda x: x["score"], reverse=True)
    
    return gaps[:num_gaps]

async def detect_gaps_async(graph_data: dict, num_gaps: int = 5):
    logger.info("detecting_gaps", requested_gaps=num_gaps)
    
    loop = asyncio.get_running_loop()
    gaps = await loop.run_in_executor(None, _detect_gaps_sync, graph_data, num_gaps)
    
    logger.info("gaps_detected", count=len(gaps))
    return gaps
