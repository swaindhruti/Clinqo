from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import ServiceCategory
from uuid import UUID
from typing import Optional


class ServiceCategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: dict) -> ServiceCategory:
        category = ServiceCategory(**data)
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def list_by_clinic(self, clinic_id: UUID, visit_type: Optional[str] = None) -> list[ServiceCategory]:
        query = select(ServiceCategory).where(ServiceCategory.clinic_id == clinic_id)
        if visit_type:
            query = query.where(ServiceCategory.visit_type == visit_type)
        query = query.order_by(ServiceCategory.sort_order, ServiceCategory.name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, category_id: UUID) -> Optional[ServiceCategory]:
        result = await self.db.execute(
            select(ServiceCategory).where(ServiceCategory.id == category_id)
        )
        return result.scalar_one_or_none()
