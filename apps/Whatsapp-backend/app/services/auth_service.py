"""
services/auth_service.py - Authentication business logic
"""
from typing import Optional
from uuid import UUID
from app.repositories.user_repo import UserRepository
from app.core.security import hash_password, verify_password, create_access_token
from app.core.logging import get_logger

logger = get_logger(__name__)


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register(self, email: str, password: str, role: str,
                       clinic_id: Optional[UUID] = None,
                       doctor_id: Optional[UUID] = None):
        """Register a new user."""
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise ValueError("Email already registered")
        
        user = await self.user_repo.create({
            "email": email,
            "hashed_password": hash_password(password),
            "role": role,
            "clinic_id": clinic_id,
            "doctor_id": doctor_id,
        })
        logger.info("User registered", user_id=str(user.id), email=email, role=role)
        return user

    async def login(self, email: str, password: str):
        """Authenticate user and return JWT token."""
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise ValueError("Invalid email or password")
        if not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")
        if not user.is_active:
            raise ValueError("Account is deactivated")
        
        token = create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "clinic_id": str(user.clinic_id) if user.clinic_id else None,
            "doctor_id": str(user.doctor_id) if user.doctor_id else None,
        })
        logger.info("User logged in", user_id=str(user.id), email=email)
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user.role.value,
            "user_id": str(user.id),
        }

    async def get_user_by_id(self, user_id: UUID):
        return await self.user_repo.get_by_id(user_id)
