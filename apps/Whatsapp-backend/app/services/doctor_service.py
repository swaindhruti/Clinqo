from typing import Optional, List
from uuid import UUID
from datetime import date
import re
import random
import string
from sqlalchemy.exc import IntegrityError
from app.repositories.doctor_repo import DoctorRepository
from app.models import DoctorMaster, DoctorDailyAvailability, DoctorWeeklySlot
from app.core.logging import get_logger

logger = get_logger(__name__)


class DoctorService:
    def __init__(self, repo: DoctorRepository):
        self.repo = repo

    async def _generate_unique_code(self, name: str) -> str:
        words = [w for w in re.split(r"\s+", name.strip()) if w]
        initials = "".join(word[0] for word in words[:3]).upper() if words else "DOC"
        initials = initials or "DOC"

        for _ in range(20):
            suffix = "".join(random.choices(string.digits, k=4))
            candidate = f"{initials}{suffix}"
            existing = await self.repo.get_by_code(candidate)
            if not existing:
                return candidate

        fallback = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        return f"DOC{fallback}"
    
    async def create_doctor(self, doctor_data: dict) -> DoctorMaster:
        """Create a new doctor"""
        code = (doctor_data.get("code") or "").strip().upper()
        if code:
            existing = await self.repo.get_by_code(code)
            if existing:
                raise ValueError(f"Doctor with code {code} already exists")
            doctor_data["code"] = code
        else:
            doctor_data["code"] = await self._generate_unique_code(doctor_data.get("name", "DOC"))

        attempts = 0
        while True:
            try:
                doctor = await self.repo.create(doctor_data)
                logger.info("Doctor created", doctor_id=str(doctor.id), code=doctor.code)
                return doctor
            except IntegrityError as exc:
                attempts += 1
                error_text = str(getattr(exc, "orig", exc)).lower()
                if "doctor_masters_code_key" in error_text or "unique" in error_text:
                    if code and attempts == 1:
                        # Re-try once with a fresh auto-generated code in case of a race.
                        doctor_data["code"] = await self._generate_unique_code(doctor_data.get("name", "DOC"))
                        code = doctor_data["code"]
                        continue
                    raise ValueError("Doctor code already exists")
                raise ValueError("Failed to create doctor")
    
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

    async def delete_doctor(self, doctor_id: UUID) -> bool:
        doctor = await self.repo.get_by_id(doctor_id)
        if not doctor:
            return False

        deps = await self.repo.get_delete_dependencies(doctor_id)
        blocking = {k: v for k, v in deps.items() if v > 0}
        if blocking:
            details = ", ".join([f"{key}: {count}" for key, count in blocking.items()])
            raise ValueError(f"Cannot delete doctor with linked records ({details}).")

        deleted = await self.repo.delete_doctor(doctor_id)
        if deleted:
            logger.info("Doctor deleted", doctor_id=str(doctor_id))
        return deleted
