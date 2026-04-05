from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.exc import IntegrityError
from app.repositories.queue_repo import QueueRepository
from app.repositories.appointment_repo import AppointmentRepository
from app.models import QueueEntry, AppointmentStatus, QueueStatus
from app.core.logging import get_logger

logger = get_logger(__name__)


class QueueService:
    def __init__(self, queue_repo: QueueRepository, appointment_repo: AppointmentRepository):
        self.queue_repo = queue_repo
        self.appointment_repo = appointment_repo
    
    async def check_in(self, appointment_id: Optional[UUID] = None, patient_id: Optional[UUID] = None, check_in_code: Optional[str] = None) -> QueueEntry:
        """
        Check in a patient for their appointment.
        Supports check-in by appointment_id + patient_id OR by check_in_code.
        Only allowed on appointment date. Atomically assigns queue position.
        """
        if check_in_code:
            appointment = await self.appointment_repo.get_by_check_in_code(check_in_code)
            if not appointment:
                raise ValueError(f"Invalid check-in code: {check_in_code}")
        elif appointment_id:
            appointment = await self.appointment_repo.get_by_id(appointment_id)
            if not appointment:
                raise ValueError(f"Appointment {appointment_id} not found")
            if patient_id and appointment.patient_id != patient_id:
                raise ValueError("Appointment does not belong to this patient")
        else:
            raise ValueError("Either check_in_code or appointment_id must be provided")
        
        appointment_id = appointment.id
        
        if appointment.status != AppointmentStatus.BOOKED:
            raise ValueError(f"Appointment is already {appointment.status.value}")
        
        # Use IST (UTC+5:30) for clinic's local "today"
        ist = timezone(timedelta(hours=5, minutes=30))
        today = datetime.now(ist).date()
        if appointment.date != today:
            raise ValueError(f"Check-in only allowed on appointment date. Appointment is for {appointment.date}")
        
        existing_queue = await self.queue_repo.get_by_appointment_id(appointment_id)
        if existing_queue:
            logger.warning("Duplicate check-in attempt", appointment_id=str(appointment_id))
            raise ValueError("Already checked in")
        
        next_position = await self.queue_repo.get_next_position(appointment.doctor_id, appointment.date)
        
        try:
            queue_entry = await self.queue_repo.create({
                "appointment_id": appointment_id,
                "doctor_id": appointment.doctor_id,
                "date": appointment.date,
                "position": next_position,
                "status": QueueStatus.WAITING
            })
            
            await self.appointment_repo.update_status(appointment_id, AppointmentStatus.CHECKED_IN)
            
            logger.info(
                "Patient checked in",
                appointment_id=str(appointment_id),
                queue_position=next_position,
                doctor_id=str(appointment.doctor_id)
            )
            
            return queue_entry
            
        except IntegrityError:
            logger.error("Check-in failed - constraint violation", appointment_id=str(appointment_id))
            raise ValueError("Check-in conflict - please retry")
    
    async def get_queue_for_doctor(self, doctor_id: UUID, queue_date: date) -> List[QueueEntry]:
        """Get ordered queue for a doctor on a specific date"""
        return await self.queue_repo.list_by_doctor_date(doctor_id, queue_date)

    async def mark_served(self, appointment_id: UUID) -> Optional[QueueEntry]:
        """Mark a queue entry as served after consultation completion."""
        return await self.queue_repo.update_status(appointment_id, QueueStatus.SERVED)
