from typing import Optional
from uuid import UUID
from app.repositories.patient_repo import PatientRepository
from app.models import Patient
from app.core.logging import get_logger

logger = get_logger(__name__)


class PatientService:
    def __init__(self, repo: PatientRepository):
        self.repo = repo
    
    async def create_patient(self, patient_data: dict) -> Patient:
        """Create a new patient or reuse existing one if phone and name match"""
        name = patient_data.get("name")
        phone = patient_data.get("phone")
        logger.info("Creating patient", phone=phone, name=name)
        
        # Check if patient exists with same phone AND name
        existing = await self.repo.get_by_phone_and_name(phone, name)
        if existing:
            logger.info("Patient already exists with phone and name", patient_id=str(existing.id))
            return existing
        
        # If not, create new patient record
        patient = await self.repo.create(patient_data)
        logger.info("Patient created", patient_id=str(patient.id))
        return patient
    
    async def get_patient(self, patient_id: UUID) -> Optional[Patient]:
        """Get patient by ID"""
        return await self.repo.get_by_id(patient_id)
    
    async def get_patient_by_phone(self, phone: str) -> Optional[Patient]:
        """Get patient by phone number"""
        return await self.repo.get_by_phone(phone)
