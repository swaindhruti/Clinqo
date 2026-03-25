from typing import Optional, List, Any
from uuid import UUID
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct, and_
from sqlalchemy.orm import joinedload
from app.models import Clinic, DoctorMaster, Appointment

class ClinicRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_stats(self, clinic_id: UUID) -> dict[str, Any]:
        today = date.today()
        
        # 1. Total Patients (unique patients who visited this clinic)
        patients_query = select(func.count(distinct(Appointment.patient_id))).join(
            DoctorMaster, Appointment.doctor_id == DoctorMaster.id
        ).where(DoctorMaster.clinic_id == clinic_id)
        patients_res = await self.db.execute(patients_query)
        total_patients = patients_res.scalar() or 0
        
        # 2. Appointments Today
        apps_query = select(func.count(Appointment.id)).join(
            DoctorMaster, Appointment.doctor_id == DoctorMaster.id
        ).where(
            and_(DoctorMaster.clinic_id == clinic_id, Appointment.date == today)
        )
        apps_res = await self.db.execute(apps_query)
        appointments_today = apps_res.scalar() or 0
        
        # 3. Doctors (Total doctors assigned to this clinic)
        docs_query = select(func.count(DoctorMaster.id)).where(DoctorMaster.clinic_id == clinic_id)
        docs_res = await self.db.execute(docs_query)
        total_doctors = docs_res.scalar() or 0
        
        return {
            "total_patients": total_patients,
            "appointments_today": appointments_today,
            "doctors_available": total_doctors
        }

    async def get_by_id(self, clinic_id: UUID) -> Optional[Clinic]:
        result = await self.db.execute(
            select(Clinic).options(joinedload(Clinic.user)).where(Clinic.id == clinic_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: UUID) -> Optional[Clinic]:
        result = await self.db.execute(
            select(Clinic).where(Clinic.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> List[Clinic]:
        result = await self.db.execute(select(Clinic).options(joinedload(Clinic.user)))
        return list(result.scalars().all())

    async def create(self, clinic_data: dict) -> Clinic:
        clinic = Clinic(**clinic_data)
        self.db.add(clinic)
        await self.db.commit()
        await self.db.refresh(clinic)
        return clinic
