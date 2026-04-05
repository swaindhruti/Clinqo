from fastapi import APIRouter, Depends, HTTPException, status, Query as FastAPIQuery
from uuid import UUID
from typing import List, Optional
from app.schemas import QueryCreate, QueryResponse, ErrorResponse
from app.services.query_service import QueryService
from app.api.v1.deps import get_query_service
from app.core.logging import get_logger

router = APIRouter(prefix="/queries", tags=["queries"])
logger = get_logger(__name__)

@router.post(
    "",
    response_model=QueryResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}}
)
async def create_query(
    query_data: QueryCreate,
    service: QueryService = Depends(get_query_service)
):
    """Log a general query from the WhatsApp bot."""
    try:
        query = await service.log_query(query_data.model_dump())
        return query
    except Exception as e:
        logger.error("Failed to log query", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "ValidationError", "message": str(e)}
        )

@router.get(
    "",
    response_model=List[QueryResponse],
)
async def list_queries(
    clinic_id: UUID = FastAPIQuery(..., description="Filter queries by clinic ID"),
    service: QueryService = Depends(get_query_service)
):
    """List all queries for a specific clinic (for dashboard)."""
    try:
        queries = await service.list_clinic_queries(clinic_id)
        return queries
    except Exception as e:
        logger.error("Failed to list queries", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "InternalError", "message": "Failed to list queries"}
        )
