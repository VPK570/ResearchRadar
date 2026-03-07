from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.database import get_db
from models.models import Search, User
from middleware.auth_middleware import get_current_user
from typing import List
from pydantic import BaseModel
from datetime import datetime
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/search", tags=["search"])

class HistoryResponse(BaseModel):
    id: int
    query: str
    status: str
    paper_count: int
    created_at: datetime

@router.get("/history", response_model=List[HistoryResponse])
async def get_history(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    logger.info("get_history_request", user_id=user.id)
    result = await db.execute(
        select(Search).where(Search.user_id == user.id).order_by(Search.created_at.desc())
    )
    return result.scalars().all()
