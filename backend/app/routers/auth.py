from fastapi import APIRouter, Depends, status
from app.schemas import RegisterRequest, UserResponse, TokenResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.auth_service import register_user, authenticate_user
from fastapi.security import OAuth2PasswordRequestForm
from app.oauth2 import get_user_with_token
from app.models.user import Users


router = APIRouter(
    tags=["Auth"],
    prefix="/auth"
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(payload : RegisterRequest, db : AsyncSession = Depends(get_db)):
    create_new_user = await register_user(payload=payload, db = db)
    return create_new_user

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login_user(payload: OAuth2PasswordRequestForm = Depends(), db : AsyncSession = Depends(get_db)):
    token = await authenticate_user(payload=payload, db=db)
    return token

@router.get("/me", response_model=UserResponse, status_code= status.HTTP_200_OK)
async def get_user(user : Users = Depends(get_user_with_token)):
    return user
