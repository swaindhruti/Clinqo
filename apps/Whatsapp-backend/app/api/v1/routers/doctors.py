from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID
from datetime import date
from typing import List, Optional
from sqlalchemy.exc import ProgrammingError
from app.schemas import (
    DoctorCreate, DoctorResponse, AvailabilityUpsert, 
    AvailabilityResponse, DoctorWeeklySlotCreate, DoctorWeeklySlotResponse, ErrorResponse
)
from app.services.doctor_service import DoctorService
from app.api.v1.deps import get_doctor_service, require_clinic_or_admin
from app.core.logging import get_logger

router = APIRouter(prefix="/doctors", tags=["doctors"])
logger = get_logger(__name__)


@router.post(
    "",
    response_model=DoctorResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}}
)
async def create_doctor(
    doctor_data: DoctorCreate,
    service: DoctorService = Depends(get_doctor_service),
    _auth=Depends(require_clinic_or_admin)
):
    """Create a new doctor"""
    try:
        doctor = await service.create_doctor(doctor_data.model_dump())
        return doctor
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "ValidationError", "message": str(e)}
        )
    except Exception as e:
        logger.error("Failed to create doctor", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "InternalError", "message": "Failed to create doctor"}
        )


@router.get(
    "",
    response_model=List[DoctorResponse],
)
async def list_doctors(
    date: date = Query(None, description="Include availability for this date"),
    specialty: str = Query(None, description="Filter by doctor specialty"),
    clinic_id: UUID = Query(None, description="Filter by clinic ID"),
    service: DoctorService = Depends(get_doctor_service)
):
    """List all doctors, optionally filtered by date, specialty, or clinic."""
    try:
        if date:
            doctors_with_availability = await service.list_doctors_with_availability(date)
            result = []
            for doctor in doctors_with_availability:
                doc = doctor["doctor"]
                if specialty and doc.specialty != specialty:
                    continue
                if clinic_id and doc.clinic_id != clinic_id:
                    continue
                result.append(doc)
            return result

        doctors = await service.list_doctors(specialty=specialty, clinic_id=clinic_id)
        return doctors
    except ProgrammingError as e:
        error_text = str(getattr(e, "orig", e)).lower()
        if "doctor_masters.clinic_id" in error_text and "does not exist" in error_text:
            logger.warning(
                "doctor_masters.clinic_id missing; returning empty doctor list until migrations are applied"
            )
            return []
        logger.error("Failed to list doctors", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "InternalError", "message": "Failed to list doctors"}
        )
    except Exception as e:
        logger.error("Failed to list doctors", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "InternalError", "message": "Failed to list doctors"}
        )


@router.get(
    "/{doctor_id}",
    response_model=DoctorResponse,
    responses={404: {"model": ErrorResponse}}
)
async def get_doctor(
    doctor_id: UUID,
    service: DoctorService = Depends(get_doctor_service)
):
    """Get doctor by ID"""
    doctor = await service.get_doctor(doctor_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": f"Doctor {doctor_id} not found"}
        )
    return doctor


@router.delete(
    "/{doctor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
async def delete_doctor(
    doctor_id: UUID,
    service: DoctorService = Depends(get_doctor_service),
    _auth=Depends(require_clinic_or_admin),
):
    """Delete a doctor if it has no blocking linked records."""
    try:
        deleted = await service.delete_doctor(doctor_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "NotFound", "message": f"Doctor {doctor_id} not found"},
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "Conflict", "message": str(e)},
        )


@router.put(
    "/{doctor_id}/clinic/{clinic_id}",
    response_model=DoctorResponse,
    responses={404: {"model": ErrorResponse}},
)
async def assign_doctor_to_clinic(
    doctor_id: UUID,
    clinic_id: UUID,
    service: DoctorService = Depends(get_doctor_service),
    _auth=Depends(require_clinic_or_admin),
):
    """Assign a doctor to a clinic."""
    try:
        doctor = await service.assign_doctor_clinic(doctor_id, clinic_id)
        return doctor
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": str(e)}
        )


@router.post(
    "/{doctor_id}/availability",
    response_model=AvailabilityResponse,
    status_code=status.HTTP_200_OK,
    responses={404: {"model": ErrorResponse}}
)
async def set_availability(
    doctor_id: UUID,
    availability_data: AvailabilityUpsert,
    service: DoctorService = Depends(get_doctor_service)
):
    """Set or update doctor availability for a specific date"""
    try:
        availability = await service.upsert_availability(
            doctor_id,
            availability_data.date,
            availability_data.is_present,
            availability_data.notes
        )
        return availability
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": str(e)}
        )


@router.get(
    "/{doctor_id}/availability",
    response_model=AvailabilityResponse,
    responses={404: {"model": ErrorResponse}}
)
async def get_availability(
    doctor_id: UUID,
    date: date = Query(..., description="Date in YYYY-MM-DD format"),
    service: DoctorService = Depends(get_doctor_service)
):
    """
    Get doctor availability for a specific date.
    Returns available by default if no record exists.
    """
    # First verify doctor exists
    doctor = await service.get_doctor(doctor_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "NotFound",
                "message": f"Doctor {doctor_id} not found"
            }
        )
    
    availability = await service.get_availability(doctor_id, date)
    
    # If no availability record exists, doctor is available by default
    if not availability:
        from datetime import datetime
        return {
            "id": None,
            "doctor_id": str(doctor_id),
            "date": date.isoformat(),
            "is_present": True,
            "notes": "Available (default)",
            "updated_by": None,
            "updated_at": None
        }
    
    return availability


@router.post(
    "/{doctor_id}/weekly-slots",
    response_model=DoctorWeeklySlotResponse,
    status_code=status.HTTP_201_CREATED,
    responses={404: {"model": ErrorResponse}},
)
async def create_weekly_slot(
    doctor_id: UUID,
    slot_data: DoctorWeeklySlotCreate,
    service: DoctorService = Depends(get_doctor_service),
    _auth=Depends(require_clinic_or_admin),
):
    try:
        slot = await service.create_weekly_slot(doctor_id, slot_data.model_dump())
        return slot
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": str(e)},
        )


@router.get(
    "/{doctor_id}/weekly-slots",
    response_model=List[DoctorWeeklySlotResponse],
)
async def list_weekly_slots(
    doctor_id: UUID,
    visit_type: Optional[str] = Query(None, description="consultation or procedure"),
    clinic_id: Optional[UUID] = Query(None, description="Filter by clinic ID"),
    weekday: Optional[int] = Query(None, ge=0, le=6, description="Monday=0 ... Sunday=6"),
    service: DoctorService = Depends(get_doctor_service),
):
    return await service.list_weekly_slots(
        doctor_id=doctor_id,
        visit_type=visit_type,
        clinic_id=clinic_id,
        weekday=weekday,
    )


@router.delete(
    "/{doctor_id}/weekly-slots/{slot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}},
)
async def delete_weekly_slot(
    doctor_id: UUID,
    slot_id: UUID,
    service: DoctorService = Depends(get_doctor_service),
    _auth=Depends(require_clinic_or_admin),
):
    deleted = await service.delete_weekly_slot(doctor_id, slot_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": "Weekly slot not found"},
        )
