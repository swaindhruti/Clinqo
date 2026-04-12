from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentCompletionResponse,
    DayAvailabilityResponse,
    ErrorResponse,
)
from app.services.appointment_service import AppointmentService
from app.api.v1.deps import get_appointment_service, require_any_auth
from app.db.session import get_db
from app.core.logging import get_logger

router = APIRouter(prefix="/appointments", tags=["appointments"])
logger = get_logger(__name__)


@router.post(
    "",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
        422: {"model": ErrorResponse}
    }
)
async def book_appointment(
    appointment_data: AppointmentCreate,
    service: AppointmentService = Depends(get_appointment_service),
    db: AsyncSession = Depends(get_db)
):
    """
    Book an appointment. 
    Enforces max 10 appointments per doctor per day.
    Supports idempotent booking via idempotency_key.
    """
    try:
        # Generate idempotency key if not provided
        idempotency_key = appointment_data.idempotency_key
        if not idempotency_key:
            timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
            idempotency_key = f"{appointment_data.patient_id}_{appointment_data.doctor_id}_{appointment_data.date}_{timestamp}"
        
        appointment = await service.book_appointment(
            patient_id=appointment_data.patient_id,
            doctor_id=appointment_data.doctor_id,
            appointment_date=appointment_data.date,
            time_slot=appointment_data.time_slot,
            slot_label=appointment_data.slot_label,
            visit_type=appointment_data.visit_type,
            idempotency_key=idempotency_key,
            intake_data=appointment_data.intake_data,
        )
        
        # Send real-time notification (non-blocking to booking success)
        try:
            from app.api.v1.routers.websockets import notify_queue_update
            await notify_queue_update(appointment.doctor_id, appointment.date, db)
        except Exception as notify_error:
            logger.warning(
                "Queue notification failed after successful booking",
                appointment_id=str(appointment.id),
                doctor_id=str(appointment.doctor_id),
                date=str(appointment.date),
                error=str(notify_error),
            )
        
        return appointment
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "NotFound", "message": error_msg}
            )
        elif "not available" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail={"error": "DoctorUnavailable", "message": error_msg}
            )
        elif "no available slots" in error_msg.lower() or "capacity full" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "CapacityFull", "message": error_msg}
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "BookingConflict", "message": error_msg}
            )
    except Exception as e:
        logger.error("Booking failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "InternalError", "message": "Booking failed"}
        )


@router.get(
    "/{appointment_id}",
    response_model=AppointmentResponse,
    responses={404: {"model": ErrorResponse}}
)
async def get_appointment(
    appointment_id: UUID,
    service: AppointmentService = Depends(get_appointment_service)
):
    """Get appointment by ID"""
    appointment = await service.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": f"Appointment {appointment_id} not found"}
        )
    return appointment


@router.get(
    "",
    response_model=List[AppointmentResponse],
)
async def list_all_appointments(
    service: AppointmentService = Depends(get_appointment_service),
    date: Optional[date] = Query(None, description="Date in YYYY-MM-DD format"),
    from_date: Optional[date] = Query(None, description="Start date (inclusive) in YYYY-MM-DD format"),
    patient_id: Optional[UUID] = Query(None, description="Filter by patient ID"),
    patient_phone: Optional[str] = Query(None, description="Filter by patient phone number"),
    clinic_id: Optional[UUID] = Query(None, description="Filter by clinic ID"),
    visit_type: Optional[str] = Query(None, description="consultation or procedure"),
    upcoming_only: bool = Query(False, description="When true, excludes completed/cancelled and sorts ascending"),
    limit: Optional[int] = Query(None, description="Max number of results to return"),
):
    """List all appointments across all doctors, optionally filtered by date, patient, or limited"""
    try:
        appointments = await service.list_all_appointments(
            date,
            from_date,
            patient_id,
            patient_phone,
            visit_type,
            clinic_id,
            upcoming_only,
        )

        result = []
        for app in appointments:
            app_dict = {
                "id": app.id,
                "patient_id": app.patient_id,
                "doctor_id": app.doctor_id,
                "date": app.date,
                "slot": app.slot,
                "time_slot": app.time_slot,
                "slot_label": app.slot_label,
                "visit_type": app.visit_type.value if hasattr(app.visit_type, "value") else app.visit_type,
                "status": app.status.value if hasattr(app.status, "value") else app.status,
                "check_in_code": app.check_in_code,
                "created_at": app.created_at,
                "updated_at": app.updated_at,
                "patient": app.patient,
                "doctor": app.doctor,
                "patient_name": app.patient.name if app.patient else None,
                "doctor_name": app.doctor.name if getattr(app, "doctor", None) else None,
            }
            result.append(app_dict)

        if limit and limit > 0:
            result = result[:limit]

        return result
    except Exception as e:
        logger.error("Failed to list appointments", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "InternalError", "message": "Failed to list appointments"}
        )


@router.get(
    "/doctors/{doctor_id}/appointments",
    response_model=List[AppointmentResponse],
)
async def list_doctor_appointments(
    doctor_id: UUID,
    service: AppointmentService = Depends(get_appointment_service),
    date: Optional[date] = Query(None, description="Date in YYYY-MM-DD format"),
    visit_type: Optional[str] = Query(None, description="consultation or procedure"),
):
    """List all appointments for a doctor, optionally filtered by date"""
    try:
        appointments = await service.list_appointments_by_doctor_date(doctor_id, date, visit_type)

        result = []
        for app in appointments:
            app_dict = {
                "id": app.id,
                "patient_id": app.patient_id,
                "doctor_id": app.doctor_id,
                "date": app.date,
                "slot": app.slot,
                "time_slot": app.time_slot,
                "slot_label": app.slot_label,
                "visit_type": app.visit_type.value if hasattr(app.visit_type, "value") else app.visit_type,
                "status": app.status.value if hasattr(app.status, "value") else app.status,
                "check_in_code": app.check_in_code,
                "created_at": app.created_at,
                "updated_at": app.updated_at,
                "patient": app.patient,
                "doctor": app.doctor,
                "patient_name": app.patient.name if app.patient else None,
                "doctor_name": app.doctor.name if getattr(app, "doctor", None) else None,
            }
            result.append(app_dict)

        return result
    except Exception as e:
        logger.error("Failed to list doctor appointments", doctor_id=str(doctor_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "InternalError", "message": "Failed to list doctor appointments"}
        )


@router.post(
    "/{appointment_id}/complete",
    response_model=AppointmentCompletionResponse,
    responses={404: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
async def complete_appointment(
    appointment_id: UUID,
    service: AppointmentService = Depends(get_appointment_service),
    _auth=Depends(require_any_auth),
):
    """Mark an appointment as completed and return the next checked-in appointment."""
    try:
        result = await service.complete_appointment(appointment_id)
        return result
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "NotFound", "message": error_msg},
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "Conflict", "message": error_msg},
        )


@router.get(
    "/doctors/{doctor_id}/availability",
    response_model=List[DayAvailabilityResponse],
)
async def get_doctor_slot_availability(
    doctor_id: UUID,
    service: AppointmentService = Depends(get_appointment_service),
    visit_type: str = Query("consultation", description="consultation or procedure"),
    days: int = Query(14, ge=1, le=60, description="How many upcoming days to evaluate"),
    from_date: Optional[date] = Query(None, description="Start date (inclusive) in YYYY-MM-DD format"),
):
    """Return free days and non-full slot windows for booking."""
    return await service.get_slot_availability(
        doctor_id=doctor_id,
        visit_type=visit_type,
        days=days,
        from_date=from_date,
    )
