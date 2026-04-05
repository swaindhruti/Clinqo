import uuid
from datetime import datetime, date as dt
from typing import Optional
from sqlalchemy import String, Integer, Boolean, Text, Date, DateTime, ForeignKey, UniqueConstraint, Index, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from sqlalchemy.dialects.postgresql import UUID
import enum


class Base(DeclarativeBase):
    pass


class AppointmentStatus(str, enum.Enum):
    BOOKED = "booked"
    CANCELLED = "cancelled"
    CHECKED_IN = "checked_in"
    COMPLETED = "completed"


class QueueStatus(str, enum.Enum):
    WAITING = "waiting"
    SERVED = "served"
    SKIPPED = "skipped"


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CLINIC = "clinic"
    DOCTOR = "doctor"


class VisitType(str, enum.Enum):
    CONSULTATION = "consultation"
    PROCEDURE = "procedure"


class Patient(Base):
    __tablename__ = "patients"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="patient")


class Clinic(Base):
    __tablename__ = "clinics"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    specialty: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    doctors: Mapped[list["DoctorMaster"]] = relationship("DoctorMaster", back_populates="clinic")
    service_categories: Mapped[list["ServiceCategory"]] = relationship("ServiceCategory", back_populates="clinic")


class ServiceCategory(Base):
    __tablename__ = "service_categories"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=False)
    visit_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'consultation' or 'procedure'
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # e.g., '₹500'
    emoji: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    detail_questions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    clinic: Mapped["Clinic"] = relationship("Clinic", back_populates="service_categories")


class DoctorMaster(Base):
    __tablename__ = "doctor_masters"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    specialty: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    clinic_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    clinic: Mapped[Optional["Clinic"]] = relationship("Clinic", back_populates="doctors")
    availabilities: Mapped[list["DoctorDailyAvailability"]] = relationship("DoctorDailyAvailability", back_populates="doctor")
    capacities: Mapped[list["DoctorDailyCapacity"]] = relationship("DoctorDailyCapacity", back_populates="doctor")
    weekly_slots: Mapped[list["DoctorWeeklySlot"]] = relationship("DoctorWeeklySlot", back_populates="doctor")
    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="doctor")
    queue_entries: Mapped[list["QueueEntry"]] = relationship("QueueEntry", back_populates="doctor")


class DoctorWeeklySlot(Base):
    __tablename__ = "doctor_weekly_slots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_masters.id"), nullable=False)
    clinic_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=True)
    weekday: Mapped[int] = mapped_column(Integer, nullable=False)  # Monday=0 ... Sunday=6
    start_time: Mapped[str] = mapped_column(String(5), nullable=False)  # HH:MM
    end_time: Mapped[str] = mapped_column(String(5), nullable=False)  # HH:MM
    max_patients: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    visit_type: Mapped[VisitType] = mapped_column(SQLEnum(VisitType), nullable=False, default=VisitType.CONSULTATION)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    doctor: Mapped["DoctorMaster"] = relationship("DoctorMaster", back_populates="weekly_slots")
    clinic: Mapped[Optional["Clinic"]] = relationship("Clinic")

    __table_args__ = (
        UniqueConstraint(
            "doctor_id",
            "clinic_id",
            "weekday",
            "start_time",
            "end_time",
            "visit_type",
            name="uq_doctor_weekly_slot",
        ),
        Index("ix_doctor_weekly_slots_lookup", "doctor_id", "weekday", "visit_type"),
    )


class DoctorDailyAvailability(Base):
    __tablename__ = "doctor_daily_availabilities"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_masters.id"), nullable=False)
    date: Mapped[dt] = mapped_column(Date, nullable=False)
    is_present: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    doctor: Mapped["DoctorMaster"] = relationship("DoctorMaster", back_populates="availabilities")
    
    __table_args__ = (
        UniqueConstraint("doctor_id", "date", name="uq_doctor_date_availability"),
        Index("ix_doctor_availability_date", "doctor_id", "date"),
    )


class DoctorDailyCapacity(Base):
    __tablename__ = "doctor_daily_capacities"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_masters.id"), nullable=False)
    date: Mapped[dt] = mapped_column(Date, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    remaining: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    
    doctor: Mapped["DoctorMaster"] = relationship("DoctorMaster", back_populates="capacities")
    
    __table_args__ = (
        UniqueConstraint("doctor_id", "date", name="uq_doctor_date_capacity"),
        Index("ix_doctor_capacity_date", "doctor_id", "date"),
    )


class Appointment(Base):
    __tablename__ = "appointments"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_masters.id"), nullable=False)
    date: Mapped[dt] = mapped_column(Date, nullable=False)
    slot: Mapped[int] = mapped_column(Integer, nullable=False)
    time_slot: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    slot_label: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    visit_type: Mapped[VisitType] = mapped_column(SQLEnum(VisitType), nullable=False, default=VisitType.CONSULTATION)
    status: Mapped[AppointmentStatus] = mapped_column(SQLEnum(AppointmentStatus), nullable=False, default=AppointmentStatus.BOOKED)
    check_in_code: Mapped[Optional[str]] = mapped_column(String(10), unique=True, index=True, nullable=True)
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    intake_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    patient: Mapped["Patient"] = relationship("Patient", back_populates="appointments")
    doctor: Mapped["DoctorMaster"] = relationship("DoctorMaster", back_populates="appointments")
    queue_entry: Mapped[Optional["QueueEntry"]] = relationship("QueueEntry", back_populates="appointment", uselist=False)
    
    __table_args__ = (
        UniqueConstraint("doctor_id", "date", "slot", name="uq_doctor_date_slot"),
        Index("ix_appointment_date", "doctor_id", "date"),
        Index("ix_appointment_slot_label", "doctor_id", "date", "slot_label", "visit_type"),
        Index("ix_appointment_idempotency", "idempotency_key"),
        Index("ix_appointment_check_in_code", "check_in_code"),
    )


class QueueEntry(Base):
    __tablename__ = "queue_entries"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=False, unique=True)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_masters.id"), nullable=False)
    date: Mapped[dt] = mapped_column(Date, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    checked_in_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    status: Mapped[QueueStatus] = mapped_column(SQLEnum(QueueStatus), nullable=False, default=QueueStatus.WAITING)
    
    appointment: Mapped["Appointment"] = relationship("Appointment", back_populates="queue_entry")
    doctor: Mapped["DoctorMaster"] = relationship("DoctorMaster", back_populates="queue_entries")
    
    __table_args__ = (
        UniqueConstraint("doctor_id", "date", "position", name="uq_doctor_date_position"),
        Index("ix_queue_date", "doctor_id", "date", "position"),
    )


class User(Base):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), nullable=False)
    clinic_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=True)
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_masters.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    clinic: Mapped[Optional["Clinic"]] = relationship("Clinic")
    doctor: Mapped[Optional["DoctorMaster"]] = relationship("DoctorMaster")


class GeneralQuery(Base):
    __tablename__ = "general_queries"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=False)
    patient_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=True)
    patient_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    patient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    query_text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    clinic: Mapped["Clinic"] = relationship("Clinic")
    patient: Mapped[Optional["Patient"]] = relationship("Patient")


class ProcedureBooking(Base):
    __tablename__ = "procedure_bookings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=False)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    sub_category: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    preferred_date: Mapped[dt] = mapped_column(Date, nullable=False)
    preferred_slot: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    intake_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="booked")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    clinic: Mapped["Clinic"] = relationship("Clinic")
    patient: Mapped["Patient"] = relationship("Patient")

    __table_args__ = (
        Index("ix_procedure_booking_clinic_date", "clinic_id", "preferred_date"),
    )
