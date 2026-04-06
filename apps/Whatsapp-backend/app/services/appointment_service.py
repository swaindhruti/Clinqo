from typing import Optional, List
from uuid import UUID
from datetime import date, timedelta
from sqlalchemy.exc import IntegrityError
from app.repositories.appointment_repo import AppointmentRepository
from app.repositories.doctor_repo import DoctorRepository
from app.repositories.queue_repo import QueueRepository
from app.models import Appointment, AppointmentStatus, QueueStatus
from app.core.logging import get_logger
from app.core.config import get_settings

logger = get_logger(__name__)
settings = get_settings()


class AppointmentService:
    def __init__(self, appointment_repo: AppointmentRepository, doctor_repo: DoctorRepository, queue_repo: QueueRepository):
        self.appointment_repo = appointment_repo
        self.doctor_repo = doctor_repo
        self.queue_repo = queue_repo
    
    async def _generate_check_in_code(self) -> str:
        """Generate a random 6-character alphanumeric check-in code"""
        import random
        import string
        chars = string.ascii_uppercase + string.digits
        # Try to find a unique code
        for _ in range(5):
            code = ''.join(random.choices(chars, k=6))
            existing = await self.appointment_repo.get_by_check_in_code(code)
            if not existing:
                return code
        # Fallback to a longer code if collisions occur
        return ''.join(random.choices(chars, k=8))

    async def book_appointment(
        self,
        patient_id: UUID,
        doctor_id: UUID,
        appointment_date: date,
        time_slot: Optional[int] = None,
        slot_label: Optional[str] = None,
        visit_type: str = "consultation",
        idempotency_key: Optional[str] = None,
        intake_data: Optional[str] = None,
    ) -> Appointment:
        """
        Book an appointment with concurrency-safe slot allocation.
        Enforces max appointments per doctor per day and doctor availability.
        Supports idempotent booking via idempotency_key.
        """
        if idempotency_key:
            existing = await self.appointment_repo.get_by_idempotency_key(idempotency_key)
            if existing:
                logger.info(
                    "Idempotent booking - returning existing appointment",
                    appointment_id=str(existing.id),
                    idempotency_key=idempotency_key
                )
                return existing
        
        doctor = await self.doctor_repo.get_by_id(doctor_id)
        if not doctor:
            raise ValueError(f"Doctor {doctor_id} not found")
        
        # Check if doctor is explicitly marked as unavailable
        # If no availability record exists, doctor is available by default
        availability = await self.doctor_repo.get_availability(doctor_id, appointment_date)
        if availability and not availability.is_present:
            raise ValueError(f"Doctor is not available on {appointment_date}")

        await self.doctor_repo.get_or_create_capacity(
            doctor_id,
            appointment_date,
            settings.MAX_APPOINTMENTS_PER_DOCTOR_PER_DAY,
        )
        
        if slot_label:
            weekday = appointment_date.weekday()
            weekly_slot = await self.doctor_repo.get_weekly_slot_by_window(
                doctor_id=doctor_id,
                weekday=weekday,
                slot_label=slot_label,
                visit_type=visit_type,
            )
            if not weekly_slot:
                raise ValueError("Selected slot is not configured for this doctor")

            current_booked = await self.appointment_repo.count_booked_for_slot(
                doctor_id=doctor_id,
                appointment_date=appointment_date,
                slot_label=slot_label,
                visit_type=visit_type,
            )
            if current_booked >= weekly_slot.max_patients:
                raise ValueError("Selected slot is already full")
        
        # Generate check-in code
        check_in_code = await self._generate_check_in_code()
        
        try:
            appointment = await self.appointment_repo.atomic_book_slot(
                doctor_id=doctor_id,
                appointment_date=appointment_date,
                patient_id=patient_id,
                time_slot=time_slot,
                slot_label=slot_label,
                visit_type=visit_type,
                idempotency_key=idempotency_key,
                check_in_code=check_in_code,
                intake_data=intake_data,
            )
            
            logger.info(
                "Appointment booked",
                appointment_id=str(appointment.id),
                doctor_id=str(doctor_id),
                patient_id=str(patient_id),
                date=str(appointment_date),
                slot=appointment.slot,
                check_in_code=check_in_code
            )
            
            return appointment
            
        except ValueError as e:
            logger.warning(
                "Booking failed - capacity full",
                doctor_id=str(doctor_id),
                date=str(appointment_date)
            )
            raise ValueError("No available slots for this doctor on this date")
        except IntegrityError as e:
            logger.error("Booking failed - integrity error", error=str(e))
            raise ValueError("Slot conflict - please retry")
    
    async def get_appointment(self, appointment_id: UUID) -> Optional[Appointment]:
        """Get appointment by ID"""
        return await self.appointment_repo.get_by_id(appointment_id)
    
    async def list_appointments_by_doctor_date(
        self,
        doctor_id: UUID,
        appointment_date: Optional[date] = None,
        visit_type: Optional[str] = None,
    ) -> List[Appointment]:
        """List all appointments for a doctor, optionally filtered by date"""
        return await self.appointment_repo.list_by_doctor_date(doctor_id, appointment_date, visit_type)

    async def list_all_appointments(
        self,
        appointment_date: Optional[date] = None,
        patient_id: Optional[UUID] = None,
        visit_type: Optional[str] = None,
        clinic_id: Optional[UUID] = None,
    ) -> List[Appointment]:
        """List all appointments across all doctors, optionally filtered by date or patient"""
        return await self.appointment_repo.list_all(appointment_date, patient_id, visit_type, clinic_id)

    async def complete_appointment(self, appointment_id: UUID) -> dict:
        """Mark an appointment completed and return the next checked-in appointment if available."""
        appointment = await self.appointment_repo.get_by_id(appointment_id)
        if not appointment:
            raise ValueError(f"Appointment {appointment_id} not found")

        if appointment.status == AppointmentStatus.COMPLETED:
            completed = appointment
        else:
            completed = await self.appointment_repo.update_status(appointment_id, AppointmentStatus.COMPLETED)

        await self.queue_repo.update_status(appointment_id, QueueStatus.SERVED)

        queue_entries = await self.queue_repo.list_by_doctor_date(appointment.doctor_id, appointment.date)
        next_queue_entry = next(
            (
                entry
                for entry in queue_entries
                if entry.status == QueueStatus.WAITING and entry.appointment_id != appointment_id
            ),
            None,
        )

        next_appointment = None
        if next_queue_entry:
            next_appointment = await self.appointment_repo.get_by_id(next_queue_entry.appointment_id)

        return {
            "completed_appointment": completed,
            "next_appointment": next_appointment,
        }

    async def get_slot_availability(
        self,
        doctor_id: UUID,
        visit_type: str = "consultation",
        days: int = 14,
        from_date: Optional[date] = None,
    ) -> List[dict]:
        if days < 1:
            return []

        start_date = from_date or date.today()
        result: List[dict] = []

        for offset in range(days):
            current_date = start_date + timedelta(days=offset)
            weekday = current_date.weekday()

            day_availability = await self.doctor_repo.get_availability(doctor_id, current_date)
            if day_availability and not day_availability.is_present:
                continue

            weekly_slots = await self.doctor_repo.list_weekly_slots(
                doctor_id=doctor_id,
                visit_type=visit_type,
                weekday=weekday,
            )

            slots_payload = []
            for slot in weekly_slots:
                if not slot.is_active:
                    continue

                slot_label = f"{slot.start_time}-{slot.end_time}"
                booked = await self.appointment_repo.count_booked_for_slot(
                    doctor_id=doctor_id,
                    appointment_date=current_date,
                    slot_label=slot_label,
                    visit_type=visit_type,
                )
                remaining = max(slot.max_patients - booked, 0)
                if remaining <= 0:
                    continue

                slots_payload.append(
                    {
                        "slot_label": slot_label,
                        "max_patients": slot.max_patients,
                        "booked_patients": booked,
                        "remaining": remaining,
                        "visit_type": slot.visit_type.value,
                    }
                )

            if slots_payload:
                result.append(
                    {
                        "date": current_date,
                        "weekday": weekday,
                        "slots": slots_payload,
                    }
                )

        return result
