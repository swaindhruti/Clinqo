from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from app.models import Clinic, DoctorMaster, ProcedureBooking, User, ServiceCategory, GeneralQuery


class ClinicRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, clinic_data: dict) -> Clinic:
        clinic = Clinic(**clinic_data)
        self.db.add(clinic)
        await self.db.commit()
        await self.db.refresh(clinic)
        return clinic
    
    async def get_by_id(self, clinic_id: UUID) -> Optional[Clinic]:
        result = await self.db.execute(
            select(Clinic).where(Clinic.id == clinic_id)
        )
        return result.scalar_one_or_none()
    
    async def list_all(self) -> List[Clinic]:
        result = await self.db.execute(select(Clinic))
        return list(result.scalars().all())
    
    async def list_by_specialty(self, specialty: str) -> List[Clinic]:
        """List clinics with the given specialty."""
        result = await self.db.execute(
            select(Clinic).where(Clinic.specialty == specialty)
        )
        return list(result.scalars().all())

    async def get_delete_dependencies(self, clinic_id: UUID) -> dict:
        doctors_count = await self.db.scalar(
            select(func.count(DoctorMaster.id)).where(DoctorMaster.clinic_id == clinic_id)
        )
        procedures_count = await self.db.scalar(
            select(func.count(ProcedureBooking.id)).where(ProcedureBooking.clinic_id == clinic_id)
        )
        users_count = await self.db.scalar(
            select(func.count(User.id)).where(User.clinic_id == clinic_id)
        )
        queries_count = await self.db.scalar(
            select(func.count(GeneralQuery.id)).where(GeneralQuery.clinic_id == clinic_id)
        )

        return {
            "doctors": int(doctors_count or 0),
            "procedures": int(procedures_count or 0),
            "users": int(users_count or 0),
            "queries": int(queries_count or 0),
        }

    async def delete_by_id(self, clinic_id: UUID) -> bool:
        clinic = await self.get_by_id(clinic_id)
        if not clinic:
            return False

        await self.db.execute(
            delete(ServiceCategory).where(ServiceCategory.clinic_id == clinic_id)
        )
        await self.db.delete(clinic)
        await self.db.commit()
        return True
