import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import asyncio
import structlog

logger = structlog.get_logger()

def _build_graph_sync(papers: list[dict], sim_threshold: float):
    if not papers:
        return {"nodes": [], "edges": []}

    G = nx.Graph()
    paper_map = {}
    
    # 1. Add nodes
    for p in papers:
        paper_id = p.get('paperId')
        paper_map[paper_id] = p
        G.add_node(paper_id, title=p.get('title'), year=p.get('year', 0))

    # 2. Add explicit citation edges
    for p in papers:
        paper_id = p.get('paperId')
        for ref in (p.get('references') or []):
            ref_id = ref.get('paperId')
            if ref_id in paper_map:
                G.add_edge(paper_id, ref_id, type="citation", weight=1.0)

    # 3. Add semantic edges
    embeddings = [p.get('embedding') for p in papers]
    # Filter out papers without embeddings
    valid_indices = [i for i, emb in enumerate(embeddings) if emb is not None]
    
    if len(valid_indices) > 1:
        valid_embeddings = np.array([embeddings[i] for i in valid_indices])
        sim_matrix = cosine_similarity(valid_embeddings)
        
        for i in range(len(valid_indices)):
            for j in range(i + 1, len(valid_indices)):
                sim = float(sim_matrix[i][j])
                if sim >= sim_threshold:
                    p1_id = papers[valid_indices[i]]['paperId']
                    p2_id = papers[valid_indices[j]]['paperId']
                    if not G.has_edge(p1_id, p2_id):
                        G.add_edge(p1_id, p2_id, type="semantic", weight=sim)

    # Note: Isolated component handling
    # If a node has degree 0, it means it's totally disconnected.
    # While that's fine for visualizing, it usually means it's not a strong part of the query cluster.
    # For now, we leave them in as visual indicators of scattered research.

    nodes_formatted = [{"id": n, **d} for n, d in G.nodes(data=True)]
    edges_formatted = [{"source": u, "target": v, **d} for u, v, d in G.edges(data=True)]
    
    return {"nodes": nodes_formatted, "edges": edges_formatted, "paper_map": paper_map}

async def build_knowledge_graph_async(papers: list[dict], sim_threshold: float = 0.55):
    logger.info("building_knowledge_graph", num_papers=len(papers), threshold=sim_threshold)
    
    loop = asyncio.get_running_loop()
    graph_data = await loop.run_in_executor(None, _build_graph_sync, papers, sim_threshold)
    
    logger.info("knowledge_graph_built", nodes=len(graph_data['nodes']), edges=len(graph_data['edges']))
    return graph_data
