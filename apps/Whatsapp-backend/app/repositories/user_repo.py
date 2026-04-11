from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import User, UserRole
from uuid import UUID
from typing import Optional


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: dict) -> User:
        user = User(**data)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_clinic_id(self, clinic_id: UUID) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(
                User.role == UserRole.CLINIC,
                User.clinic_id == clinic_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_doctor_id(self, doctor_id: UUID) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(
                User.role == UserRole.DOCTOR,
                User.doctor_id == doctor_id,
            )
        )
        return result.scalar_one_or_none()

    async def update(self, user: User, data: dict) -> User:
        for key, value in data.items():
            setattr(user, key, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user
