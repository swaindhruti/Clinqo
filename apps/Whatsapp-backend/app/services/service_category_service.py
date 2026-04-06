from app.repositories.service_category_repo import ServiceCategoryRepository
from uuid import UUID
from typing import Optional


class ServiceCategoryService:
    def __init__(self, repo: ServiceCategoryRepository):
        self.repo = repo

    async def create_category(self, data: dict):
        return await self.repo.create(data)

    async def list_by_clinic(self, clinic_id: UUID, visit_type: Optional[str] = None):
        return await self.repo.list_by_clinic(clinic_id, visit_type)

    async def get_category(self, category_id: UUID):
        return await self.repo.get_by_id(category_id)

    async def delete_category(self, category_id: UUID) -> bool:
        return await self.repo.delete(category_id)
