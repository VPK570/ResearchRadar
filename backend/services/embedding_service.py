from sentence_transformers import SentenceTransformer
import numpy as np

def generate_embeddings(papers):
    model = SentenceTransformer("all-MiniLM-L6-v2")
    
    texts = []
    ids = []
    paper_map = {}
    
    for p in papers:
        paper_id = p["paperId"]
        title = p["title"]
        abstract = p.get("abstract") or ""
        
        text = f"{title}. {abstract[:150]}"
        texts.append(text)
        ids.append(paper_id)
        paper_map[paper_id] = p
        
    embeddings = model.encode(texts)
    return embeddings, ids, paper_map
