from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
from app.models import Patient


class PatientRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, patient_data: dict) -> Patient:
        patient = Patient(**patient_data)
        self.db.add(patient)
        await self.db.commit()
        await self.db.refresh(patient)
        return patient
    
    async def get_by_id(self, patient_id: UUID) -> Optional[Patient]:
        result = await self.db.execute(
            select(Patient).where(Patient.id == patient_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_phone(self, phone: str) -> Optional[Patient]:
        result = await self.db.execute(
            select(Patient).where(Patient.phone == phone)
        )
        return result.scalar_one_or_none()

    async def get_by_phone_flexible(self, phone: str) -> Optional[Patient]:
        import re

        normalized_digits = re.sub(r'\D', '', phone or '')
        if not normalized_digits:
            return None

        candidates = {phone, normalized_digits, f'+{normalized_digits}'}
        if normalized_digits.startswith('91') and len(normalized_digits) > 10:
            local_number = normalized_digits[2:]
            candidates.add(local_number)
            candidates.add(f'+{local_number}')

        result = await self.db.execute(
            select(Patient)
            .where(
                or_(
                    Patient.phone.in_(list(candidates)),
                    func.regexp_replace(Patient.phone, '[^0-9]', '', 'g') == normalized_digits,
                )
            )
            .order_by(desc(Patient.created_at))
        )
        return result.scalars().first()
    
    async def get_by_phone_and_name(self, phone: str, name: str) -> Optional[Patient]:
        result = await self.db.execute(
            select(Patient).where(
                and_(
                    Patient.phone == phone,
                    Patient.name == name
                )
            )
        )
        return result.scalar_one_or_none()
