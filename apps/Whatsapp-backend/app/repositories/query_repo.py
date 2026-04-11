from uuid import UUID
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import GeneralQuery

class QueryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, query_data: dict) -> GeneralQuery:
        query = GeneralQuery(**query_data)
        self.db.add(query)
        await self.db.commit()
        await self.db.refresh(query)
        return query

    async def get_by_clinic(self, clinic_id: UUID) -> List[GeneralQuery]:
        stmt = select(GeneralQuery).where(GeneralQuery.clinic_id == clinic_id).order_by(GeneralQuery.created_at.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def list_all(self) -> List[GeneralQuery]:
        stmt = select(GeneralQuery).order_by(GeneralQuery.created_at.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, query_id: UUID) -> Optional[GeneralQuery]:
        stmt = select(GeneralQuery).where(GeneralQuery.id == query_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_status(self, query: GeneralQuery, status: str) -> GeneralQuery:
        query.status = status
        await self.db.commit()
        await self.db.refresh(query)
        return query
