from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
from uuid import UUID
import re


class PatientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[str] = Field(None, max_length=20)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    blood_group: Optional[str] = Field(None, max_length=10)
    
    @field_validator('phone')
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        cleaned = re.sub(r'[^\d+]', '', v)
        if not cleaned:
            raise ValueError('Phone must contain digits')
        return cleaned


class PatientResponse(BaseModel):
    id: UUID
    name: str
    age: Optional[int]
    gender: Optional[str]
    phone: str
    email: Optional[str]
    blood_group: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ClinicCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    address: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, max_length=20)
    specialty: Optional[str] = Field(None, max_length=100)


class ClinicResponse(BaseModel):
    id: UUID
    name: str
    address: Optional[str]
    phone: Optional[str]
    specialty: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ServiceCategoryCreate(BaseModel):
    clinic_id: UUID
    visit_type: str = Field(..., pattern='^(consultation|procedure)$')
    name: str = Field(..., min_length=1, max_length=200)
    price: Optional[str] = Field(None, max_length=50)
    emoji: Optional[str] = Field(None, max_length=10)
    sort_order: int = 0
    detail_questions: Optional[str] = None


class ServiceCategoryResponse(BaseModel):
    id: UUID
    clinic_id: UUID
    visit_type: str
    name: str
    price: Optional[str] = None
    emoji: Optional[str] = None
    sort_order: int = 0
    detail_questions: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DoctorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=50)
    specialty: Optional[str] = Field(None, max_length=100)
    clinic_id: Optional[UUID] = None


class DoctorResponse(BaseModel):
    id: UUID
    name: str
    code: str
    specialty: Optional[str]
    clinic_id: Optional[UUID] = None
    clinic: Optional[ClinicResponse] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DoctorWeeklySlotCreate(BaseModel):
    clinic_id: Optional[UUID] = None
    weekday: int = Field(..., ge=0, le=6)
    start_time: str = Field(..., pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    end_time: str = Field(..., pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    max_patients: int = Field(..., ge=1, le=500)
    visit_type: str = Field(default="consultation", pattern='^(consultation|procedure)$')
    is_active: bool = True


class DoctorWeeklySlotResponse(BaseModel):
    id: UUID
    doctor_id: UUID
    clinic_id: Optional[UUID] = None
    weekday: int
    start_time: str
    end_time: str
    max_patients: int
    visit_type: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AvailabilityUpsert(BaseModel):
    date: date
    is_present: bool
    notes: Optional[str] = None


class AvailabilityResponse(BaseModel):
    id: Optional[UUID] = None
    doctor_id: UUID
    date: date
    is_present: bool
    notes: Optional[str] = None
    updated_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AppointmentCreate(BaseModel):
    patient_id: UUID
    doctor_id: UUID
    date: date
    time_slot: Optional[int] = Field(None, ge=0, le=23, description="Time slot 0-23 (each representing 1 hour)")
    slot_label: Optional[str] = Field(None, max_length=30, description="Slot window label e.g. 09:00-10:00")
    visit_type: str = Field(default="consultation", pattern='^(consultation|procedure)$')
    idempotency_key: Optional[str] = Field(None, max_length=255)
    intake_data: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    date: date
    slot: int
    time_slot: Optional[int] = None
    slot_label: Optional[str] = None
    visit_type: str
    status: str
    patient: Optional[PatientResponse] = None
    doctor: Optional[DoctorResponse] = None
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    check_in_code: Optional[str] = None
    intake_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AppointmentCompletionResponse(BaseModel):
    completed_appointment: AppointmentResponse
    next_appointment: Optional[AppointmentResponse] = None

    class Config:
        from_attributes = True


class SlotAvailabilityResponse(BaseModel):
    slot_label: str
    max_patients: int
    booked_patients: int
    remaining: int
    visit_type: str


class DayAvailabilityResponse(BaseModel):
    date: date
    weekday: int
    slots: list[SlotAvailabilityResponse]


class CheckInRequest(BaseModel):
    appointment_id: Optional[UUID] = None
    patient_id: Optional[UUID] = None
    check_in_code: Optional[str] = None


class CheckInResponse(BaseModel):
    queue_position: int
    checked_in_at: datetime
    appointment_id: UUID
    
    class Config:
        from_attributes = True


class QueueEntryResponse(BaseModel):
    id: UUID
    appointment_id: UUID
    doctor_id: UUID
    date: date
    position: int
    checked_in_at: datetime
    status: str
    patient_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[dict] = None


class QueryCreate(BaseModel):
    clinic_id: UUID
    patient_id: Optional[UUID] = None
    patient_phone: str = Field(..., min_length=10, max_length=20)
    patient_name: str = Field(..., min_length=1, max_length=200)
    query_text: str
    status: Optional[str] = "pending"


class QueryStatusUpdate(BaseModel):
    status: str = Field(..., pattern='^(pending|resolved|closed|in_progress)$')


class QueryResponse(BaseModel):
    id: UUID
    clinic_id: UUID
    patient_id: Optional[UUID] = None
    patient_phone: str
    patient_name: str
    query_text: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProcedureBookingCreate(BaseModel):
    clinic_id: UUID
    patient_id: UUID
    sub_category: Optional[str] = Field(None, max_length=200)
    preferred_date: date
    preferred_slot: Optional[str] = Field(None, max_length=30)
    intake_data: Optional[str] = None


class ProcedureBookingResponse(BaseModel):
    id: UUID
    clinic_id: UUID
    patient_id: UUID
    sub_category: Optional[str] = None
    preferred_date: date
    preferred_slot: Optional[str] = None
    intake_data: Optional[str] = None
    status: str
    patient: Optional[PatientResponse] = None
    clinic: Optional[ClinicResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Auth Schemas ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field(..., pattern='^(admin|clinic|doctor)$')
    clinic_id: Optional[UUID] = None
    doctor_id: Optional[UUID] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class EmergencyCredentialUpdate(BaseModel):
    role: str = Field(..., pattern='^(clinic|doctor)$')
    clinic_id: Optional[UUID] = None
    doctor_id: Optional[UUID] = None
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    id: UUID
    email: str
    role: str
    clinic_id: Optional[UUID] = None
    doctor_id: Optional[UUID] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str

