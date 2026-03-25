from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.v1.deps import get_clinic_repo, get_user_repo, RoleChecker
from app.repositories.clinic_repo import ClinicRepository
from app.repositories.user_repo import UserRepository
from app.schemas import ClinicCreate, ClinicResponse
from app.models import UserRole, User

router = APIRouter(prefix="/clinics", tags=["clinics"])

# Admin only: Create a clinic and its user
@router.post("/", response_model=ClinicResponse, dependencies=[Depends(RoleChecker([UserRole.ADMIN]))])
async def create_clinic(
    clinic_in: ClinicCreate,
    clinic_repo: ClinicRepository = Depends(get_clinic_repo),
    user_repo: UserRepository = Depends(get_user_repo)
):
    existing_user = await user_repo.get_by_email(clinic_in.user_email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create the user first
    user = await user_repo.create({
        "email": clinic_in.user_email,
        "password": clinic_in.password,
        "role": UserRole.CLINIC
    })
    
    # Create the clinic
    clinic = await clinic_repo.create({
        "name": clinic_in.name,
        "address": clinic_in.address,
        "user_id": user.id
    })
    
    return clinic

# Get clinic by user ID
@router.get("/user/{user_id}", response_model=ClinicResponse)
async def get_clinic_by_user_id(
    user_id: UUID,
    clinic_repo: ClinicRepository = Depends(get_clinic_repo)
):
    clinic = await clinic_repo.get_by_user_id(user_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return clinic

# Admin or the clinic itself: Get clinic statistics
@router.get("/{clinic_id}/stats", dependencies=[Depends(RoleChecker([UserRole.ADMIN, UserRole.CLINIC]))])
async def get_clinic_stats(
    clinic_id: UUID,
    clinic_repo: ClinicRepository = Depends(get_clinic_repo)
):
    stats = await clinic_repo.get_stats(clinic_id)
    return stats
