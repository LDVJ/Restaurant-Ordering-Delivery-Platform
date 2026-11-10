from app.config import settings
from fastapi.security import oauth2
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import get_db
import jwt
from jwt.exceptions import InvalidTokenError
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from app.models import user
from app.schemas import TokenData
from pydantic import ValidationError
from app.enums.userEnum import UsersRole
from typing import Annotated

oauth2_schema = oauth2.OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = settings.JWT_SECRET
ALGORITHM = settings.JWT_ALGORITHM
TIME_IN_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def create_jwt_token(data : dict) -> dict:
    copy_data = deepcopy(data)
    exp_time = datetime.now(timezone.utc) + timedelta(minutes=TIME_IN_MINUTES)
    copy_data.update({"exp":exp_time})
    token = jwt.encode(copy_data, algorithm=ALGORITHM, key=SECRET_KEY)

    return {
        "access_token": token,
        "token_type": "bearer"
    }

def verify_jwt_token(token : str, credential_exception):
    try:
        payload = jwt.decode(token, algorithms=[ALGORITHM], key=SECRET_KEY, options={"require":["exp","id"]})
        user_data = TokenData.model_validate(payload)
        return user_data
    except (InvalidTokenError, ValidationError):
        raise credential_exception


async def get_user_with_token(bearer_token : str = Depends(oauth2_schema), db : AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized Access",
        headers={"WWW-Authenticate":"Bearer"}
    )

    token_data = verify_jwt_token(bearer_token,credential_exception=credentials_exception)

    result = await db.execute(select(user.Users).where(user.Users.id == token_data.id))

    user_info = result.scalar_one_or_none()

    if user_info is None:
        raise credentials_exception

    return user_info

def required_roles(*roles : UsersRole):
    async def role_checker(current_user : user.Users = Depends(get_user_with_token)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="You do not have permission for this action"
                )
        return current_user
    return role_checker

owner_only = required_roles(UsersRole.RESTAURANT_OWNER)
customer_only = required_roles(UsersRole.CUSTOMER)
delivery_only = required_roles(UsersRole.DELIVERY_PARTNER)

CurrentOwner = Annotated[user.Users, Depends(owner_only)]
CurrentCustomer = Annotated[user.Users, Depends(customer_only)]
CurrentDeliveryPartner = Annotated[user.Users, Depends(delivery_only)]

        