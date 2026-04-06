from typing import Optional, List
from uuid import UUID
from datetime import date
from app.repositories.doctor_repo import DoctorRepository
from app.models import DoctorMaster, DoctorDailyAvailability, DoctorWeeklySlot
from app.core.logging import get_logger

logger = get_logger(__name__)


class DoctorService:
    def __init__(self, repo: DoctorRepository):
        self.repo = repo
    
    async def create_doctor(self, doctor_data: dict) -> DoctorMaster:
        """Create a new doctor"""
        existing = await self.repo.get_by_code(doctor_data["code"])
        if existing:
            raise ValueError(f"Doctor with code {doctor_data['code']} already exists")
        
        doctor = await self.repo.create(doctor_data)
        logger.info("Doctor created", doctor_id=str(doctor.id), code=doctor.code)
        return doctor
    
    async def get_doctor(self, doctor_id: UUID) -> Optional[DoctorMaster]:
        """Get doctor by ID"""
        return await self.repo.get_by_id(doctor_id)
    
    async def list_doctors(self, specialty: Optional[str] = None, clinic_id: Optional[UUID] = None) -> List[DoctorMaster]:
        """List all doctors, optionally filtered by specialty and/or clinic."""
        return await self.repo.list_all(specialty=specialty, clinic_id=clinic_id)
    
    async def upsert_availability(
        self, doctor_id: UUID, availability_date: date, is_present: bool, notes: Optional[str] = None
    ) -> DoctorDailyAvailability:
        """Set or update doctor availability for a date"""
        doctor = await self.repo.get_by_id(doctor_id)
        if not doctor:
            raise ValueError(f"Doctor {doctor_id} not found")
        
        availability = await self.repo.upsert_availability(
            doctor_id, availability_date, is_present, notes
        )
        logger.info(
            "Doctor availability updated",
            doctor_id=str(doctor_id),
            date=str(availability_date),
            is_present=is_present
        )
        return availability
    
    async def get_availability(
        self, doctor_id: UUID, availability_date: date
    ) -> Optional[DoctorDailyAvailability]:
        """Get doctor availability for a specific date"""
        return await self.repo.get_availability(doctor_id, availability_date)
    
    async def list_doctors_with_availability(self, availability_date: date) -> List[dict]:
        """List all doctors with their availability for a specific date"""
        doctors = await self.repo.list_all()
        result = []
        
        for doctor in doctors:
            availability = await self.repo.get_availability(doctor.id, availability_date)
            result.append({
                "doctor": doctor,
                "availability": availability,
                "is_available": availability.is_present if availability else True
            })
        
        return result

    async def create_weekly_slot(self, doctor_id: UUID, slot_data: dict) -> DoctorWeeklySlot:
        doctor = await self.repo.get_by_id(doctor_id)
        if not doctor:
            raise ValueError(f"Doctor {doctor_id} not found")

        if slot_data["start_time"] >= slot_data["end_time"]:
            raise ValueError("start_time must be earlier than end_time")

        clinic_id = slot_data.get("clinic_id")
        if clinic_id and doctor.clinic_id != clinic_id:
            await self.repo.assign_clinic(doctor_id, clinic_id)

        slot_data["doctor_id"] = doctor_id
        slot = await self.repo.create_weekly_slot(slot_data)
        return slot

    async def assign_doctor_clinic(self, doctor_id: UUID, clinic_id: UUID) -> DoctorMaster:
        doctor = await self.repo.get_by_id(doctor_id)
        if not doctor:
            raise ValueError(f"Doctor {doctor_id} not found")

        updated = await self.repo.assign_clinic(doctor_id, clinic_id)
        if not updated:
            raise ValueError(f"Doctor {doctor_id} not found")
        return updated

    async def list_weekly_slots(
        self,
        doctor_id: UUID,
        visit_type: Optional[str] = None,
        clinic_id: Optional[UUID] = None,
        weekday: Optional[int] = None,
    ) -> List[DoctorWeeklySlot]:
        return await self.repo.list_weekly_slots(
            doctor_id=doctor_id,
            visit_type=visit_type,
            clinic_id=clinic_id,
            weekday=weekday,
        )

    async def delete_weekly_slot(self, doctor_id: UUID, slot_id: UUID) -> bool:
        return await self.repo.delete_weekly_slot(doctor_id, slot_id)
