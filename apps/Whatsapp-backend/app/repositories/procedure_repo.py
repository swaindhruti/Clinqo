from typing import Optional, List
from uuid import UUID
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload
from app.models import ProcedureBooking, Patient


class ProcedureRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, payload: dict) -> ProcedureBooking:
        booking = ProcedureBooking(**payload)
        self.db.add(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        loaded = await self.get_by_id(booking.id)
        return loaded or booking

    async def list_bookings(
        self,
        clinic_id: Optional[UUID] = None,
        preferred_date: Optional[date] = None,
        status: Optional[str] = None,
        patient_id: Optional[UUID] = None,
        patient_phone: Optional[str] = None,
    ) -> List[ProcedureBooking]:
        query = select(ProcedureBooking).options(
            joinedload(ProcedureBooking.patient),
            joinedload(ProcedureBooking.clinic),
        )

        if clinic_id:
            query = query.where(ProcedureBooking.clinic_id == clinic_id)
        if preferred_date:
            query = query.where(ProcedureBooking.preferred_date == preferred_date)
        if status:
            query = query.where(ProcedureBooking.status == status)
        if patient_id:
            query = query.where(ProcedureBooking.patient_id == patient_id)
        if patient_phone:
            import re
            digits = re.sub(r'\D', '', patient_phone)
            if digits:
                query = query.join(Patient, ProcedureBooking.patient_id == Patient.id).where(
                    func.regexp_replace(Patient.phone, '[^0-9]', '', 'g') == digits
                )

        result = await self.db.execute(
            query.order_by(ProcedureBooking.preferred_date.desc(), ProcedureBooking.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, booking_id: UUID) -> Optional[ProcedureBooking]:
        result = await self.db.execute(
            select(ProcedureBooking).options(
                joinedload(ProcedureBooking.patient),
                joinedload(ProcedureBooking.clinic),
            ).where(ProcedureBooking.id == booking_id)
        )
        return result.scalar_one_or_none()

    async def delete_booking(self, booking_id: UUID) -> bool:
        booking = await self.get_by_id(booking_id)
        if not booking:
            return False

        await self.db.delete(booking)
        await self.db.commit()
        return True
