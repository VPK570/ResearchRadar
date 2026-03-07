import json, numpy as np, networkx as nx
from sklearn.metrics.pairwise import cosine_similarity

# Load data
with open("papers.json") as f:
    papers = json.load(f)
embeddings = np.load("embeddings.npy")

# Index papers by ID
paper_map = {p["paperId"]: (p, emb) for p, emb in zip(papers, embeddings)}
ids = [p["paperId"] for p in papers]

# Build graph
G = nx.DiGraph()
for p in papers:
    G.add_node(p["paperId"], title=p["title"], year=p.get("year", 0))

# Add citation edges
for p in papers:
    for ref in p.get("references") or []:
        rid = ref.get("paperId")
        if rid and rid in paper_map:
            G.add_edge(p["paperId"], rid)

# Add semantic similarity edges (cosine > 0.72)
sim_matrix = cosine_similarity(embeddings)
for i in range(len(ids)):
    for j in range(i+1, len(ids)):
        if sim_matrix[i][j] > 0.72:
            G.add_edge(ids[i], ids[j], weight=float(sim_matrix[i][j]))

print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

# Gap detection
def find_gaps(top_k=10):
    G_undirected = G.to_undirected()
    candidates = []
    node_list = list(G.nodes())

    for i in range(len(node_list)):
        for j in range(i+1, len(node_list)):
            a, b = node_list[i], node_list[j]
            if G_undirected.has_edge(a, b):
                continue
            shared = len(list(nx.common_neighbors(G_undirected, a, b)))
            if shared < 2:
                continue
            idx_a = ids.index(a)
            idx_b = ids.index(b)
            sim = sim_matrix[idx_a][idx_b]
            score = (shared * 0.5) + (float(sim) * 0.5)
            candidates.append({
                "paper_a": paper_map[a][0],
                "paper_b": paper_map[b][0],
                "shared_neighbors": shared,
                "similarity": float(sim),
                "gap_score": round(score, 3)
            })

    return sorted(candidates, key=lambda x: -x["gap_score"])[:top_k]

gaps = find_gaps()
import json
with open("gaps.json", "w") as f:
    json.dump(gaps, f, indent=2)
print(f"Found {len(gaps)} gaps")
for g in gaps[:3]:
    print(f"  [{g['gap_score']}] {g['paper_a']['title'][:50]} ↔ {g['paper_b']['title'][:50]}")