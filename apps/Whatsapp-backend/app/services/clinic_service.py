from typing import Optional, List
from uuid import UUID
from app.repositories.clinic_repo import ClinicRepository
from app.models import Clinic
from app.core.logging import get_logger

logger = get_logger(__name__)


class ClinicService:
    def __init__(self, repo: ClinicRepository):
        self.repo = repo
    
    async def create_clinic(self, clinic_data: dict) -> Clinic:
        """Create a new clinic."""
        clinic = await self.repo.create(clinic_data)
        logger.info("Clinic created", clinic_id=str(clinic.id), name=clinic.name)
        return clinic
    
    async def get_clinic(self, clinic_id: UUID) -> Optional[Clinic]:
        """Get clinic by ID."""
        return await self.repo.get_by_id(clinic_id)
    
    async def list_clinics(self, specialty: Optional[str] = None) -> List[Clinic]:
        """List clinics, optionally filtered by specialty."""
        if specialty:
            return await self.repo.list_by_specialty(specialty)
        return await self.repo.list_all()
