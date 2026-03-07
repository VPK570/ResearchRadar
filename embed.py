from sentence_transformers import SentenceTransformer
import json, numpy as np

with open("papers.json") as f:
    papers = json.load(f)

model = SentenceTransformer("all-MiniLM-L6-v2")  # fast, small model
texts = [f"{p['title']}. {p.get('abstract','')[:200]}" for p in papers]
embeddings = model.encode(texts, show_progress_bar=True)
np.save("embeddings.npy", embeddings)
print("Embeddings done:", embeddings.shape)