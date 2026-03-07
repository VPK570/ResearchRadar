from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.database import get_db
from models.models import SavedHypothesis, User
from middleware.auth_middleware import get_current_user
from typing import List
from pydantic import BaseModel
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/hypotheses", tags=["hypotheses"])

class HypothesisSaveRequest(BaseModel):
    content: dict

@router.post("/save")
async def save_hypothesis(
    req: HypothesisSaveRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    logger.info("save_hypothesis_request", user_id=user.id)
    new_save = SavedHypothesis(
        user_id=user.id,
        content=req.content
    )
    db.add(new_save)
    await db.commit()
    return {"status": "saved"}

@router.get("/saved")
async def get_saved_hypotheses(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    logger.info("get_saved_hypotheses_request", user_id=user.id)
    result = await db.execute(
        select(SavedHypothesis).where(SavedHypothesis.user_id == user.id).order_by(SavedHypothesis.created_at.desc())
    )
    return result.scalars().all()

@router.delete("/saved/{save_id}")
async def delete_saved_hypothesis(
    save_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    save = await db.get(SavedHypothesis, save_id)
    if not save or save.user_id != user.id:
        raise HTTPException(status_code=404, detail="Saved hypothesis not found")
        
    await db.delete(save)
    await db.commit()
    return {"status": "deleted"}
