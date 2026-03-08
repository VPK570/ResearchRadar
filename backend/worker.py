import asyncio
import structlog
import json
from datetime import datetime

from db.database import AsyncSessionLocal
from models.models import Search, User
from services.paper_service import fetch_papers
from services.embedding_service import generate_embeddings_async
from services.graph_service import build_knowledge_graph_async
from services.gap_service import detect_gaps_async
from services.hypothesis_service import generate_hypotheses_async

logger = structlog.get_logger()

async def run_search_pipeline(search_id: int):
    logger.info("pipeline_started", search_id=search_id)
    
    async with AsyncSessionLocal() as db:
        try:
            # 1. Fetching
            search = await db.get(Search, search_id)
            if not search:
                return
                
            search.status = "fetching"
            await db.commit()
            
            logger.info("pipeline_step", search_id=search_id, step="fetching")
            papers = await fetch_papers(search.query, num_papers=search.config_num_papers)
            
            search.paper_count = len(papers)
            await db.commit()
            
            if not papers:
                search.status = "failed"
                search.completed_at = datetime.utcnow()
                await db.commit()
                logger.error("pipeline_failed_no_papers", search_id=search_id)
                return
            
            # 2. Building Graph (Status = building)
            search.status = "building"
            await db.commit()
            
            papers_with_embs = await generate_embeddings_async(papers)
            graph_data = await build_knowledge_graph_async(papers_with_embs, sim_threshold=search.config_sim_threshold)
            
            # 3. Detecting Gaps (Status = gaps)
            search.status = "gaps"
            await db.commit()
            
            gaps = await detect_gaps_async(graph_data, num_gaps=search.config_num_gaps)
            
            # 4. Generating Hypotheses (Status = hypotheses)
            search.status = "hypotheses"
            await db.commit()
            
            # Pass all embeddings for Novelty Scoring (Feature 1)
            all_embeddings = [p['embedding'] for p in papers_with_embs if p.get('embedding')]
            hypotheses = await generate_hypotheses_async(gaps, corpus_embeddings=all_embeddings)
            
            # Feature 7: Freshness Metrics
            from services.paper_service import get_freshness_metrics
            freshness = get_freshness_metrics(papers_with_embs)
            
            # Merge gaps into edges for visualization
            all_edges = graph_data['edges'][:]
            for gap in gaps:
                all_edges.append({
                    "source": gap["source"],
                    "target": gap["target"],
                    "gap": True,
                    "score": gap["score"],
                    "confidence": gap.get("confidence", 0.5),
                    "separation": gap.get("separation", "Medium")
                })
            
            # 5. Completed
            search.status = "completed"
            search.completed_at = datetime.utcnow()
            
            # Store final results in JSON column with Intelligence Layer data
            search.results = {
                "nodes": graph_data['nodes'],
                "edges": all_edges,
                "hypotheses": hypotheses,
                "intelligence": {
                    "freshness": freshness,
                    "gap_count": len(gaps),
                    "queries": search.query
                }
            }
            
            await db.commit()
            logger.info("pipeline_completed_with_intelligence", search_id=search_id)
            
        except Exception as e:
            logger.exception("pipeline_error", search_id=search_id, error=str(e))
            search = await db.get(Search, search_id)
            if search:
                search.status = "failed"
                search.completed_at = datetime.utcnow()
                await db.commit()


