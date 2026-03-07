from sentence_transformers import SentenceTransformer
import structlog
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = structlog.get_logger()
_executor = ThreadPoolExecutor(max_workers=2)

# Load model lazily
_model = None

def get_model():
    global _model
    if _model is None:
        logger.info("loading_sentence_transformer_model", model_name="all-MiniLM-L6-v2")
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def _generate_embeddings_sync(texts):
    model = get_model()
    # model.encode returns a numpy array, we convert to list
    return model.encode(texts).tolist()

async def generate_embeddings_async(papers: list[dict]):
    if not papers:
        return papers
        
    logger.info("generating_embeddings", count=len(papers))
    
    # Create the text to embed (Title + Abstract)
    texts_to_embed = [
        f"{p.get('title', '')} {p.get('abstract', '')}".strip()
        for p in papers
    ]
    
    # Run embedding in a thread pool to avoid blocking the async event loop
    loop = asyncio.get_running_loop()
    embeddings = await loop.run_in_executor(
        None, 
        _generate_embeddings_sync, 
        texts_to_embed
    )
    
    # Attach embeddings to the paper dicts
    for i, paper in enumerate(papers):
        paper['embedding'] = embeddings[i]
        
    logger.info("embeddings_generated_successfully")
    return papers
