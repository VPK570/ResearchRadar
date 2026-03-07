from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from services.paper_service import fetch_papers
from services.embedding_service import generate_embeddings
from services.graph_service import build_graph, detect_gaps
from services.hypothesis_service import generate_hypotheses
import os
import asyncio

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static')
CORS(app)

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("query", "federated learning")
    try:
        # STEP 1: FETCH PAPERS
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        papers = loop.run_until_complete(fetch_papers(query))
        loop.close()

        if len(papers) < 5:
            return jsonify({
                "error": "Not enough papers found. Try a broader query.",
                "nodes": [], "edges": [], "hypotheses": []
            })

        # STEP 2: EMBEDDINGS
        embeddings, ids, paper_map = generate_embeddings(papers)

        # STEP 3: BUILD GRAPH
        G, sim_matrix = build_graph(papers, embeddings, ids, paper_map)

        # STEP 4: GAP DETECTION
        gaps = detect_gaps(G, ids, paper_map, sim_matrix)

        # STEP 5: GENERATE HYPOTHESES
        hypotheses = generate_hypotheses(gaps[:2], paper_map)

        # STEP 6: BUILD RESPONSE
        all_nodes = list(G.nodes(data=True))
        graph_nodes = [{"id": n[0], "title": n[1]["title"], "year": n[1]["year"]} for n in all_nodes[:40]]
        
        graph_edges = []
        for u, v, d in G.edges(data=True):
            graph_edges.append({"source": u, "target": v})
        graph_edges = graph_edges[:80]

        gap_edges = [{"source": g["a"], "target": g["b"], "gap": True} for g in gaps]

        return jsonify({
            "nodes": graph_nodes,
            "edges": graph_edges + gap_edges,
            "hypotheses": hypotheses
        })
    except Exception as e:
        print(f"Error in search: {str(e)}")
        return jsonify({"detail": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8000, debug=True)

