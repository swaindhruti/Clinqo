from typing import Optional, List
from uuid import UUID
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, delete
from sqlalchemy.orm import joinedload
from app.models import DoctorMaster, DoctorDailyAvailability, DoctorDailyCapacity, DoctorWeeklySlot, Appointment, QueueEntry, User


class DoctorRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, doctor_data: dict) -> DoctorMaster:
        doctor = DoctorMaster(**doctor_data)
        self.db.add(doctor)
        await self.db.commit()
        await self.db.refresh(doctor)
        return await self.get_by_id(doctor.id) or doctor
    
    async def get_by_id(self, doctor_id: UUID) -> Optional[DoctorMaster]:
        result = await self.db.execute(
            select(DoctorMaster).options(joinedload(DoctorMaster.clinic)).where(DoctorMaster.id == doctor_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_code(self, code: str) -> Optional[DoctorMaster]:
        result = await self.db.execute(
            select(DoctorMaster).where(DoctorMaster.code == code)
        )
        return result.scalar_one_or_none()
    
    async def list_all(self, specialty: Optional[str] = None, clinic_id: Optional[UUID] = None) -> List[DoctorMaster]:
        query = select(DoctorMaster).options(joinedload(DoctorMaster.clinic))
        if specialty:
            query = query.where(DoctorMaster.specialty == specialty)
        if clinic_id:
            query = query.where(DoctorMaster.clinic_id == clinic_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def upsert_availability(
        self, doctor_id: UUID, availability_date: date, is_present: bool, notes: Optional[str] = None
    ) -> DoctorDailyAvailability:
        result = await self.db.execute(
            select(DoctorDailyAvailability).where(
                and_(
                    DoctorDailyAvailability.doctor_id == doctor_id,
                    DoctorDailyAvailability.date == availability_date
                )
            )
        )
        availability = result.scalar_one_or_none()
        
        if availability:
            availability.is_present = is_present
            availability.notes = notes
        else:
            availability = DoctorDailyAvailability(
                doctor_id=doctor_id,
                date=availability_date,
                is_present=is_present,
                notes=notes
            )
            self.db.add(availability)
        
        await self.db.commit()
        await self.db.refresh(availability)
        return availability
    
    async def get_availability(self, doctor_id: UUID, availability_date: date) -> Optional[DoctorDailyAvailability]:
        result = await self.db.execute(
            select(DoctorDailyAvailability).where(
                and_(
                    DoctorDailyAvailability.doctor_id == doctor_id,
                    DoctorDailyAvailability.date == availability_date
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_or_create_capacity(
        self, doctor_id: UUID, capacity_date: date, default_capacity: int = 10
    ) -> DoctorDailyCapacity:
        result = await self.db.execute(
            select(DoctorDailyCapacity).where(
                and_(
                    DoctorDailyCapacity.doctor_id == doctor_id,
                    DoctorDailyCapacity.date == capacity_date
                )
            )
        )
        capacity = result.scalar_one_or_none()
        
        if not capacity:
            capacity = DoctorDailyCapacity(
                doctor_id=doctor_id,
                date=capacity_date,
                capacity=default_capacity,
                remaining=default_capacity
            )
            self.db.add(capacity)
            await self.db.commit()
            await self.db.refresh(capacity)
        
        return capacity
    
    async def get_capacity(self, doctor_id: UUID, capacity_date: date) -> Optional[DoctorDailyCapacity]:
        result = await self.db.execute(
            select(DoctorDailyCapacity).where(
                and_(
                    DoctorDailyCapacity.doctor_id == doctor_id,
                    DoctorDailyCapacity.date == capacity_date
                )
            )
        )
        return result.scalar_one_or_none()

    async def create_weekly_slot(self, slot_data: dict) -> DoctorWeeklySlot:
        slot = DoctorWeeklySlot(**slot_data)
        self.db.add(slot)
        await self.db.commit()
        await self.db.refresh(slot)
        return slot

    async def assign_clinic(self, doctor_id: UUID, clinic_id: UUID) -> Optional[DoctorMaster]:
        doctor = await self.get_by_id(doctor_id)
        if not doctor:
            return None

        doctor.clinic_id = clinic_id
        await self.db.commit()
        await self.db.refresh(doctor)
        return doctor

    async def list_weekly_slots(
        self,
        doctor_id: UUID,
        visit_type: Optional[str] = None,
        clinic_id: Optional[UUID] = None,
        weekday: Optional[int] = None,
    ) -> List[DoctorWeeklySlot]:
        query = select(DoctorWeeklySlot).where(DoctorWeeklySlot.doctor_id == doctor_id)

        if visit_type:
            query = query.where(DoctorWeeklySlot.visit_type == visit_type)
        if clinic_id:
            query = query.where(DoctorWeeklySlot.clinic_id == clinic_id)
        if weekday is not None:
            query = query.where(DoctorWeeklySlot.weekday == weekday)

        result = await self.db.execute(
            query.order_by(DoctorWeeklySlot.weekday, DoctorWeeklySlot.start_time)
        )
        return list(result.scalars().all())

    async def get_weekly_slot_by_window(
        self,
        doctor_id: UUID,
        weekday: int,
        slot_label: str,
        visit_type: str,
    ) -> Optional[DoctorWeeklySlot]:
        if "-" not in slot_label:
            return None

        start_time, end_time = [part.strip() for part in slot_label.split("-", 1)]

        result = await self.db.execute(
            select(DoctorWeeklySlot).where(
                and_(
                    DoctorWeeklySlot.doctor_id == doctor_id,
                    DoctorWeeklySlot.weekday == weekday,
                    DoctorWeeklySlot.start_time == start_time,
                    DoctorWeeklySlot.end_time == end_time,
                    DoctorWeeklySlot.visit_type == visit_type,
                    DoctorWeeklySlot.is_active.is_(True),
                )
            )
        )
        return result.scalar_one_or_none()

    async def delete_weekly_slot(self, doctor_id: UUID, slot_id: UUID) -> bool:
        result = await self.db.execute(
            select(DoctorWeeklySlot).where(
                and_(
                    DoctorWeeklySlot.id == slot_id,
                    DoctorWeeklySlot.doctor_id == doctor_id,
                )
            )
        )
        slot = result.scalar_one_or_none()
        if not slot:
            return False

        await self.db.delete(slot)
        await self.db.commit()
        return True

    async def get_delete_dependencies(self, doctor_id: UUID) -> dict:
        appointments_count = await self.db.scalar(
            select(func.count(Appointment.id)).where(Appointment.doctor_id == doctor_id)
        )
        queue_entries_count = await self.db.scalar(
            select(func.count(QueueEntry.id)).where(QueueEntry.doctor_id == doctor_id)
        )

        return {
            "appointments": int(appointments_count or 0),
            "queue_entries": int(queue_entries_count or 0),
        }

    async def delete_doctor(self, doctor_id: UUID) -> bool:
        doctor = await self.get_by_id(doctor_id)
        if not doctor:
            return False

        await self.db.execute(
            delete(User).where(User.doctor_id == doctor_id)
        )
        await self.db.execute(
            delete(DoctorDailyAvailability).where(DoctorDailyAvailability.doctor_id == doctor_id)
        )
        await self.db.execute(
            delete(DoctorDailyCapacity).where(DoctorDailyCapacity.doctor_id == doctor_id)
        )
        await self.db.execute(
            delete(DoctorWeeklySlot).where(DoctorWeeklySlot.doctor_id == doctor_id)
        )
        await self.db.delete(doctor)
        await self.db.commit()
        return True
