from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Clinic


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
