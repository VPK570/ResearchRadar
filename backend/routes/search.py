from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional

from db.database import get_db
from models.models import Search, User
from middleware.auth_middleware import get_current_user_optional, get_current_user
from worker import run_search_pipeline
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/search", tags=["search"])

class SearchRequest(BaseModel):
    query: str
    num_papers: int = 50
    num_gaps: int = 5
    sim_threshold: float = 0.55

class SearchStatusResponse(BaseModel):
    id: int
    query: str
    status: str
    paper_count: int
    results: Optional[dict] = None

@router.post("/", response_model=SearchStatusResponse)
async def create_search(
    req: SearchRequest, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    logger.info("create_search_request", query=req.query, user_id=user.id if user else None)
    
    new_search = Search(
        query=req.query,
        config_num_papers=req.num_papers,
        config_num_gaps=req.num_gaps,
        config_sim_threshold=req.sim_threshold,
        user_id=user.id if user else None
    )
    
    db.add(new_search)
    await db.commit()
    await db.refresh(new_search)
    
    # Kick off background job
    background_tasks.add_task(run_search_pipeline, new_search.id)
    
    return new_search

@router.get("/{search_id}/status", response_model=SearchStatusResponse)
async def get_search_status(
    search_id: int,
    db: AsyncSession = Depends(get_db)
):
    search = await db.get(Search, search_id)
    if not search:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Search not found"
        )
        
    return search
