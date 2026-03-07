from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from models.models import Search
from services.export_service import export_papers_csv, export_hypotheses_pdf
import structlog
import io

logger = structlog.get_logger()
router = APIRouter(prefix="/api/export", tags=["export"])

@router.get("/{search_id}/csv")
async def get_csv_export(search_id: int, db: AsyncSession = Depends(get_db)):
    search = await db.get(Search, search_id)
    if not search or not search.results:
        raise HTTPException(status_code=404, detail="Search results not found")
        
    csv_file = export_papers_csv(search.results)
    return Response(
        content=csv_file.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=researchradar_papers_{search_id}.csv"}
    )

@router.get("/{search_id}/pdf")
async def get_pdf_export(search_id: int, db: AsyncSession = Depends(get_db)):
    search = await db.get(Search, search_id)
    if not search or not search.results:
        raise HTTPException(status_code=404, detail="Search results not found")
        
    pdf_file = export_hypotheses_pdf(search.results)
    return Response(
        content=pdf_file.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=researchradar_hypotheses_{search_id}.pdf"}
    )

@router.get("/{search_id}/json")
async def get_json_export(search_id: int, db: AsyncSession = Depends(get_db)):
    search = await db.get(Search, search_id)
    if not search or not search.results:
        raise HTTPException(status_code=404, detail="Search results not found")
        
    # Standard JSON response is enough here for the raw data
    return search.results
