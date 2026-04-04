"""
api/v1/routers/auth.py - Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import UserRegister, UserLogin, UserResponse, TokenResponse, ErrorResponse
from app.services.auth_service import AuthService
from app.api.v1.deps import get_auth_service, get_current_user
from app.core.logging import get_logger

router = APIRouter(prefix="/auth", tags=["auth"])
logger = get_logger(__name__)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}}
)
async def register(
    user_data: UserRegister,
    service: AuthService = Depends(get_auth_service)
):
    """Register a new user (admin/clinic/doctor)."""
    try:
        user = await service.register(
            email=user_data.email,
            password=user_data.password,
            role=user_data.role,
            clinic_id=user_data.clinic_id,
            doctor_id=user_data.doctor_id,
        )
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "RegistrationError", "message": str(e)}
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    responses={401: {"model": ErrorResponse}}
)
async def login(
    credentials: UserLogin,
    service: AuthService = Depends(get_auth_service)
):
    """Login and receive a JWT token."""
    try:
        result = await service.login(credentials.email, credentials.password)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "AuthError", "message": str(e)},
            headers={"WWW-Authenticate": "Bearer"}
        )


@router.get(
    "/me",
    response_model=UserResponse,
    responses={401: {"model": ErrorResponse}}
)
async def get_me(current_user=Depends(get_current_user)):
    """Get current authenticated user."""
    return current_user
