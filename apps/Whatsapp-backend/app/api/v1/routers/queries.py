from fastapi import APIRouter, Depends, HTTPException, status, Query as FastAPIQuery
from uuid import UUID
from typing import List, Optional
from app.schemas import QueryCreate, QueryResponse, ErrorResponse, QueryStatusUpdate
from app.services.query_service import QueryService
from app.api.v1.deps import get_query_service, get_current_user, require_any_auth
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
    clinic_id: Optional[UUID] = FastAPIQuery(None, description="Filter queries by clinic ID"),
    service: QueryService = Depends(get_query_service)
):
    """List queries for a specific clinic or all queries for admin dashboards."""
    try:
        if clinic_id:
            queries = await service.list_clinic_queries(clinic_id)
        else:
            queries = await service.list_all_queries()
        return queries
    except Exception as e:
        logger.error("Failed to list queries", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "InternalError", "message": "Failed to list queries"}
        )


@router.put(
    "/{query_id}/status",
    response_model=QueryResponse,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 403: {"model": ErrorResponse}},
)
async def update_query_status(
    query_id: UUID,
    payload: QueryStatusUpdate,
    service: QueryService = Depends(get_query_service),
    current_user=Depends(require_any_auth),
):
    """Update a query status; clinic users can only update their own clinic queries."""
    try:
        query = await service.get_query(query_id)
        if not query:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "NotFound", "message": f"Query {query_id} not found"}
            )

        if current_user.role.value == "clinic" and current_user.clinic_id != query.clinic_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "Forbidden", "message": "You can only update queries for your clinic"}
            )

        updated = await service.update_query_status(query_id, payload.status)
        return updated
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "ValidationError", "message": str(e)}
        )
