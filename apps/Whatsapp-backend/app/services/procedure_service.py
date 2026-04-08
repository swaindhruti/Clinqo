from typing import Optional, List
from uuid import UUID
from datetime import date
from app.repositories.procedure_repo import ProcedureRepository
from app.repositories.clinic_repo import ClinicRepository
from app.repositories.patient_repo import PatientRepository
from app.models import ProcedureBooking


class ProcedureService:
    def __init__(
        self,
        repo: ProcedureRepository,
        clinic_repo: ClinicRepository,
        patient_repo: PatientRepository,
    ):
        self.repo = repo
        self.clinic_repo = clinic_repo
        self.patient_repo = patient_repo

    async def create_booking(self, payload: dict) -> ProcedureBooking:
        clinic = await self.clinic_repo.get_by_id(payload["clinic_id"])
        if not clinic:
            raise ValueError(f"Clinic {payload['clinic_id']} not found")

        patient = await self.patient_repo.get_by_id(payload["patient_id"])
        if not patient:
            raise ValueError(f"Patient {payload['patient_id']} not found")

        return await self.repo.create(payload)

    async def list_bookings(
        self,
        clinic_id: Optional[UUID] = None,
        preferred_date: Optional[date] = None,
        status: Optional[str] = None,
        patient_id: Optional[UUID] = None,
        patient_phone: Optional[str] = None,
    ) -> List[ProcedureBooking]:
        return await self.repo.list_bookings(
            clinic_id=clinic_id,
            preferred_date=preferred_date,
            status=status,
            patient_id=patient_id,
            patient_phone=patient_phone,
        )

    async def delete_booking(self, booking_id: UUID) -> bool:
        return await self.repo.delete_booking(booking_id)
