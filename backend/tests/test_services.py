import pytest
import asyncio
from services.graph_service import _build_graph_sync
from services.gap_service import _detect_gaps_sync

def test_graph_building():
    # Mock papers
    papers = [
        {"paperId": "p1", "title": "Paper 1", "year": 2020, "embedding": [1, 0, 0], "references": [{"paperId": "p2"}]},
        {"paperId": "p2", "title": "Paper 2", "year": 2021, "embedding": [0.9, 0.1, 0], "references": []},
        {"paperId": "p3", "title": "Paper 3", "year": 2022, "embedding": [0, 1, 0], "references": []}
    ]
    
    # p1 and p2 should have a citation edge
    # p1 and p2 should have a semantic edge (sim ~1.0)
    # p1 and p3 should NOT have a semantic edge (sim 0.0)
    
    graph_data = _build_graph_sync(papers, sim_threshold=0.8)
    
    assert len(graph_data['nodes']) == 3
    # Edges: 1 citation (p1->p2), 1 semantic (p1-p2 already has citation, so it might skip or add depending on logic)
    # Actually _build_graph_sync skips semantic if direct edge exists.
    assert len(graph_data['edges']) == 1 
    assert graph_data['edges'][0]['type'] == 'citation'

def test_gap_detection():
    # Gap: unconnected nodes that share a neighbor
    # p1 connected to p2
    # p3 connected to p2
    # p1 and p3 not connected -> Gap
    
    mock_graph = {
        "nodes": [
            {"id": "p1", "title": "Paper 1", "year": 2020},
            {"id": "p2", "title": "Paper 2", "year": 2021},
            {"id": "p3", "title": "Paper 3", "year": 2022}
        ],
        "edges": [
            {"source": "p1", "target": "p2", "type": "citation"},
            {"source": "p3", "target": "p2", "type": "citation"}
        ],
        "paper_map": {
            "p1": {"paperId": "p1", "year": 2020, "embedding": [1, 0]},
            "p2": {"paperId": "p2", "year": 2021, "embedding": [1, 1]},
            "p3": {"paperId": "p3", "year": 2022, "embedding": [0, 1]}
        }
    }
    
    gaps = _detect_gaps_sync(mock_graph, num_gaps=1)
    
    assert len(gaps) == 1
    assert (gaps[0]['source'] == 'p1' and gaps[0]['target'] == 'p3') or \
           (gaps[0]['source'] == 'p3' and gaps[0]['target'] == 'p1')
