from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID
from typing import List, Optional
from app.schemas import (
    ClinicCreate, ClinicResponse, ServiceCategoryCreate, ServiceCategoryResponse, 
    ErrorResponse, DoctorResponse, DoctorWeeklySlotResponse
)
from app.services.clinic_service import ClinicService
from app.services.service_category_service import ServiceCategoryService
from app.services.doctor_service import DoctorService
from app.api.v1.deps import (
    get_clinic_service, get_service_category_service, require_admin, 
    require_clinic_or_admin, get_doctor_service
)
from app.core.logging import get_logger

router = APIRouter(prefix="/clinics", tags=["clinics"])
logger = get_logger(__name__)


@router.post(
    "",
    response_model=ClinicResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}}
)
async def create_clinic(
    clinic_data: ClinicCreate,
    service: ClinicService = Depends(get_clinic_service),
    _admin=Depends(require_admin)
):
    """Create a new clinic."""
    try:
        clinic = await service.create_clinic(clinic_data.model_dump())
        return clinic
    except Exception as e:
        logger.error("Failed to create clinic", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "ValidationError", "message": str(e)}
        )


@router.get(
    "",
    response_model=List[ClinicResponse],
)
async def list_clinics(
    specialty: Optional[str] = Query(None, description="Filter clinics by doctor specialty"),
    service: ClinicService = Depends(get_clinic_service)
):
    """List all clinics, optionally filtered by specialty."""
    clinics = await service.list_clinics(specialty)
    return clinics


@router.get(
    "/{clinic_id}",
    response_model=ClinicResponse,
    responses={404: {"model": ErrorResponse}}
)
async def get_clinic(
    clinic_id: UUID,
    service: ClinicService = Depends(get_clinic_service)
):
    """Get clinic by ID."""
    clinic = await service.get_clinic(clinic_id)
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": f"Clinic {clinic_id} not found"}
        )
    return clinic


@router.delete(
    "/{clinic_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
async def delete_clinic(
    clinic_id: UUID,
    service: ClinicService = Depends(get_clinic_service),
    _admin=Depends(require_admin),
):
    """Delete a clinic if it has no blocking linked records."""
    try:
        deleted = await service.delete_clinic(clinic_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "NotFound", "message": f"Clinic {clinic_id} not found"},
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "Conflict", "message": str(e)},
        )


@router.get(
    "/{clinic_id}/services",
    response_model=List[ServiceCategoryResponse],
)
async def list_clinic_services(
    clinic_id: UUID,
    visit_type: Optional[str] = Query(None, description="Filter by visit_type: consultation or procedure"),
    clinic_service: ClinicService = Depends(get_clinic_service),
    sc_service: ServiceCategoryService = Depends(get_service_category_service)
):
    """List service categories for a clinic, optionally filtered by visit type."""
    clinic = await clinic_service.get_clinic(clinic_id)
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": f"Clinic {clinic_id} not found"}
        )
    categories = await sc_service.list_by_clinic(clinic_id, visit_type)
    return categories


@router.post(
    "/{clinic_id}/services",
    response_model=ServiceCategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_clinic_service(
    clinic_id: UUID,
    category_data: ServiceCategoryCreate,
    clinic_service: ClinicService = Depends(get_clinic_service),
    sc_service: ServiceCategoryService = Depends(get_service_category_service),
    _auth=Depends(require_clinic_or_admin)
):
    """Create a service category for a clinic."""
    clinic = await clinic_service.get_clinic(clinic_id)
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": f"Clinic {clinic_id} not found"}
        )
    data = category_data.model_dump()
    data["clinic_id"] = clinic_id
    category = await sc_service.create_category(data)
    return category


@router.delete(
    "/{clinic_id}/services/{service_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}}
)
async def delete_clinic_service(
    clinic_id: UUID,
    service_id: UUID,
    clinic_service: ClinicService = Depends(get_clinic_service),
    sc_service: ServiceCategoryService = Depends(get_service_category_service),
    _auth=Depends(require_clinic_or_admin)
):
    """Delete a service category from a clinic."""
    clinic = await clinic_service.get_clinic(clinic_id)
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": f"Clinic {clinic_id} not found"}
        )
    deleted = await sc_service.delete_category(service_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": "Service not found"}
        )


@router.get(
    "/{clinic_id}/doctors",
    response_model=List[DoctorResponse],
)
async def list_clinic_doctors(
    clinic_id: UUID,
    clinic_service: ClinicService = Depends(get_clinic_service),
    doctor_service: DoctorService = Depends(get_doctor_service)
):
    """List all doctors assigned to a clinic."""
    clinic = await clinic_service.get_clinic(clinic_id)
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": f"Clinic {clinic_id} not found"}
        )
    doctors = await doctor_service.list_doctors(clinic_id=clinic_id)
    return doctors


@router.get(
    "/{clinic_id}/doctor-weekly-slots",
    response_model=List[DoctorWeeklySlotResponse],
)
async def list_clinic_doctor_weekly_slots(
    clinic_id: UUID,
    visit_type: Optional[str] = Query(None, description="consultation or procedure"),
    clinic_service: ClinicService = Depends(get_clinic_service),
    doctor_service: DoctorService = Depends(get_doctor_service)
):
    """List all weekly slots for doctors in a clinic."""
    clinic = await clinic_service.get_clinic(clinic_id)
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NotFound", "message": f"Clinic {clinic_id} not found"}
        )
    
    # Get all doctors in this clinic
    doctors = await doctor_service.list_doctors(clinic_id=clinic_id)
    
    # Collect all weekly slots from all doctors
    all_slots = []
    for doctor in doctors:
        slots = await doctor_service.list_weekly_slots(
            doctor_id=doctor.id,
            clinic_id=clinic_id,
            visit_type=visit_type
        )
        all_slots.extend(slots)
    
    return all_slots
