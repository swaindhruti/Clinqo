"""
services/auth_service.py - Authentication business logic
"""
from typing import Optional
from uuid import UUID
from app.repositories.user_repo import UserRepository
from app.repositories.clinic_repo import ClinicRepository
from app.repositories.doctor_repo import DoctorRepository
from app.core.security import hash_password, verify_password, create_access_token
from app.core.logging import get_logger

logger = get_logger(__name__)


class AuthService:
    def __init__(
        self,
        user_repo: UserRepository,
        clinic_repo: ClinicRepository,
        doctor_repo: DoctorRepository,
    ):
        self.user_repo = user_repo
        self.clinic_repo = clinic_repo
        self.doctor_repo = doctor_repo

    async def register(self, email: str, password: str, role: str,
                       clinic_id: Optional[UUID] = None,
                       doctor_id: Optional[UUID] = None):
        """Register a new user."""
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise ValueError("Email already registered")

        if role == "clinic":
            if not clinic_id:
                raise ValueError("clinic_id is required for clinic credentials")
            clinic = await self.clinic_repo.get_by_id(clinic_id)
            if not clinic:
                raise ValueError("Selected clinic does not exist")
            doctor_id = None

        elif role == "doctor":
            if not doctor_id:
                raise ValueError("doctor_id is required for doctor credentials")
            doctor = await self.doctor_repo.get_by_id(doctor_id)
            if not doctor:
                raise ValueError("Selected doctor does not exist")

            if clinic_id and doctor.clinic_id and doctor.clinic_id != clinic_id:
                raise ValueError("Doctor is assigned to a different clinic")

            if not clinic_id and doctor.clinic_id:
                clinic_id = doctor.clinic_id

        elif role == "admin":
            clinic_id = None
            doctor_id = None
        else:
            raise ValueError("Invalid role")
        
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

    async def emergency_update_credentials(
        self,
        role: str,
        email: str,
        password: str,
        clinic_id: Optional[UUID] = None,
        doctor_id: Optional[UUID] = None,
    ):
        if role == "clinic":
            if not clinic_id:
                raise ValueError("clinic_id is required for clinic credential updates")
            target_user = await self.user_repo.get_by_clinic_id(clinic_id)
            if not target_user:
                raise ValueError("No clinic credentials found for this clinic")
        elif role == "doctor":
            if not doctor_id:
                raise ValueError("doctor_id is required for doctor credential updates")
            target_user = await self.user_repo.get_by_doctor_id(doctor_id)
            if not target_user:
                raise ValueError("No doctor credentials found for this doctor")
        else:
            raise ValueError("Invalid role")

        existing_with_email = await self.user_repo.get_by_email(email)
        if existing_with_email and existing_with_email.id != target_user.id:
            raise ValueError("Email already registered")

        updated_user = await self.user_repo.update(
            target_user,
            {
                "email": email,
                "hashed_password": hash_password(password),
            },
        )
        logger.info("Emergency credentials updated", user_id=str(updated_user.id), role=role)
        return updated_user

    async def get_user_by_id(self, user_id: UUID):
        return await self.user_repo.get_by_id(user_id)
