from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import get_settings
from app.core.security import ALGORITHM
from app.models import User, UserRole
from app.repositories.patient_repo import PatientRepository
from app.repositories.doctor_repo import DoctorRepository
from app.repositories.appointment_repo import AppointmentRepository
from app.repositories.queue_repo import QueueRepository
from app.repositories.user_repo import UserRepository
from app.repositories.clinic_repo import ClinicRepository
from app.services.patient_service import PatientService
from app.services.doctor_service import DoctorService
from app.services.appointment_service import AppointmentService
from app.services.queue_service import QueueService
from app.schemas import TokenData

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/v1/auth/login")


def get_patient_repo(db: AsyncSession = Depends(get_db)) -> PatientRepository:
    return PatientRepository(db)


def get_doctor_repo(db: AsyncSession = Depends(get_db)) -> DoctorRepository:
    return DoctorRepository(db)


def get_appointment_repo(db: AsyncSession = Depends(get_db)) -> AppointmentRepository:
    return AppointmentRepository(db)


def get_queue_repo(db: AsyncSession = Depends(get_db)) -> QueueRepository:
    return QueueRepository(db)


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


def get_user_repo(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_clinic_repo(db: AsyncSession = Depends(get_db)) -> ClinicRepository:
    return ClinicRepository(db)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


class RoleChecker:
    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough permissions to access this resource"
            )
        return user
