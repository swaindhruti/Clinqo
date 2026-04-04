from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional

from app.db.session import get_db
from app.repositories.patient_repo import PatientRepository
from app.repositories.doctor_repo import DoctorRepository
from app.repositories.appointment_repo import AppointmentRepository
from app.repositories.queue_repo import QueueRepository
from app.repositories.clinic_repo import ClinicRepository
from app.repositories.service_category_repo import ServiceCategoryRepository
from app.repositories.user_repo import UserRepository
from app.services.patient_service import PatientService
from app.services.doctor_service import DoctorService
from app.services.appointment_service import AppointmentService
from app.services.queue_service import QueueService
from app.services.clinic_service import ClinicService
from app.services.service_category_service import ServiceCategoryService
from app.services.auth_service import AuthService
from app.core.security import decode_access_token


# ==================== Repo Dependencies ====================

def get_patient_repo(db: AsyncSession = Depends(get_db)) -> PatientRepository:
    return PatientRepository(db)


def get_doctor_repo(db: AsyncSession = Depends(get_db)) -> DoctorRepository:
    return DoctorRepository(db)


def get_appointment_repo(db: AsyncSession = Depends(get_db)) -> AppointmentRepository:
    return AppointmentRepository(db)


def get_queue_repo(db: AsyncSession = Depends(get_db)) -> QueueRepository:
    return QueueRepository(db)


def get_clinic_repo(db: AsyncSession = Depends(get_db)) -> ClinicRepository:
    return ClinicRepository(db)


def get_service_category_repo(db: AsyncSession = Depends(get_db)) -> ServiceCategoryRepository:
    return ServiceCategoryRepository(db)


def get_user_repo(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


# ==================== Service Dependencies ====================

def get_patient_service(
    repo: PatientRepository = Depends(get_patient_repo)
) -> PatientService:
    return PatientService(repo)


def get_doctor_service(
    repo: DoctorRepository = Depends(get_doctor_repo)
) -> DoctorService:
    return DoctorService(repo)


def get_appointment_service(
    appointment_repo: AppointmentRepository = Depends(get_appointment_repo),
    doctor_repo: DoctorRepository = Depends(get_doctor_repo),
) -> AppointmentService:
    return AppointmentService(appointment_repo, doctor_repo)


def get_queue_service(
    queue_repo: QueueRepository = Depends(get_queue_repo),
    appointment_repo: AppointmentRepository = Depends(get_appointment_repo),
) -> QueueService:
    return QueueService(queue_repo, appointment_repo)


def get_clinic_service(
    repo: ClinicRepository = Depends(get_clinic_repo)
) -> ClinicService:
    return ClinicService(repo)


def get_service_category_service(
    repo: ServiceCategoryRepository = Depends(get_service_category_repo)
) -> ServiceCategoryService:
    return ServiceCategoryService(repo)


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repo)
) -> AuthService:
    return AuthService(user_repo)


# ==================== Auth Dependencies ====================

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    user_repo: UserRepository = Depends(get_user_repo),
):
    """Extract and validate JWT from Authorization header. Returns User object."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "AuthError", "message": "Not authenticated"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "AuthError", "message": "Invalid or expired token"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "AuthError", "message": "Invalid token payload"},
        )
    user = await user_repo.get_by_id(UUID(user_id))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "AuthError", "message": "User not found or deactivated"},
        )
    return user


def require_role(*allowed_roles: str):
    """Dependency factory: require user to have one of the specified roles."""
    async def _check_role(current_user=Depends(get_current_user)):
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "Forbidden", "message": f"Role '{current_user.role.value}' not allowed. Required: {', '.join(allowed_roles)}"}
            )
        return current_user
    return _check_role


# Convenience shortcuts
require_admin = require_role("admin")
require_clinic_or_admin = require_role("admin", "clinic")
require_any_auth = require_role("admin", "clinic", "doctor")
