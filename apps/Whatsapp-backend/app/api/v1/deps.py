from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.patient_repo import PatientRepository
from app.repositories.doctor_repo import DoctorRepository
from app.repositories.appointment_repo import AppointmentRepository
from app.repositories.queue_repo import QueueRepository
from app.repositories.clinic_repo import ClinicRepository
from app.repositories.service_category_repo import ServiceCategoryRepository
from app.services.patient_service import PatientService
from app.services.doctor_service import DoctorService
from app.services.appointment_service import AppointmentService
from app.services.queue_service import QueueService
from app.services.clinic_service import ClinicService
from app.services.service_category_service import ServiceCategoryService


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


