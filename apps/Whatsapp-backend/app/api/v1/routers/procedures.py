from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID
from datetime import date
from typing import List, Optional
from app.schemas import ProcedureBookingCreate, ProcedureBookingResponse, ErrorResponse
from app.services.procedure_service import ProcedureService
from app.api.v1.deps import get_procedure_service

router = APIRouter(prefix="/procedures", tags=["procedures"])


@router.post(
    "",
    response_model=ProcedureBookingResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
async def create_procedure_booking(
    payload: ProcedureBookingCreate,
    service: ProcedureService = Depends(get_procedure_service),
):
    try:
        return await service.create_booking(payload.model_dump())
    except ValueError as e:
        message = str(e)
        status_code = status.HTTP_404_NOT_FOUND if "not found" in message.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(
            status_code=status_code,
            detail={"error": "ValidationError", "message": message},
        )


@router.get(
    "",
    response_model=List[ProcedureBookingResponse],
)
async def list_procedure_bookings(
    service: ProcedureService = Depends(get_procedure_service),
    clinic_id: Optional[UUID] = Query(None, description="Filter by clinic ID"),
    date: Optional[date] = Query(None, description="Filter by preferred date"),
    status: Optional[str] = Query(None, description="Filter by status"),
    patient_id: Optional[UUID] = Query(None, description="Filter by patient ID"),
    patient_phone: Optional[str] = Query(None, description="Filter by patient phone number"),
):
    return await service.list_bookings(
        clinic_id=clinic_id,
        preferred_date=date,
        status=status,
        patient_id=patient_id,
        patient_phone=patient_phone,
    )


@router.delete(
    "/{procedure_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}},
)
async def delete_procedure_booking(
    procedure_id: UUID,
    service: ProcedureService = Depends(get_procedure_service),
):
    deleted = await service.delete_booking(procedure_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": f"Procedure booking {procedure_id} not found"},
        )
