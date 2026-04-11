from uuid import UUID
from typing import List, Optional
from app.repositories.query_repo import QueryRepository
from app.models import GeneralQuery

class QueryService:
    def __init__(self, repo: QueryRepository):
        self.repo = repo

    async def log_query(self, query_data: dict) -> GeneralQuery:
        return await self.repo.create(query_data)

    async def list_clinic_queries(self, clinic_id: UUID) -> List[GeneralQuery]:
        return await self.repo.get_by_clinic(clinic_id)

    async def list_all_queries(self) -> List[GeneralQuery]:
        return await self.repo.list_all()

    async def get_query(self, query_id: UUID) -> Optional[GeneralQuery]:
        return await self.repo.get_by_id(query_id)

    async def update_query_status(self, query_id: UUID, status: str) -> GeneralQuery:
        query = await self.repo.get_by_id(query_id)
        if not query:
            raise ValueError(f"Query {query_id} not found")
        return await self.repo.update_status(query, status)
