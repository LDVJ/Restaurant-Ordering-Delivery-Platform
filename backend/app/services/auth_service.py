from fastapi import HTTPException, status
from app.schemas import RegisterRequest, UpdateUser
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, update
from app.models.user import Users
from app.security import create_hash_password, verify_hash_password
from app.oauth2 import create_jwt_token
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.oauth2 import get_user_with_token


async def register_user(payload : RegisterRequest, db : AsyncSession):
    email = payload.email.lower().strip()
    check_user = await db.execute(select(Users).where(Users.email == email))
    if check_user.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already Registered")

    hashed_password = await create_hash_password(payload.password)

    new_user = Users(
        name = payload.name.strip(),
        email = email,
        hashed_password = hashed_password,
        role = payload.role,
        country_code = payload.country_code,
        phone_number = payload.phone_number,
        phone_e164 = payload.phone_e164
    )

    db.add(new_user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")
    await db.refresh(new_user)

    return new_user

async def authenticate_user(payload : OAuth2PasswordRequestForm, db : AsyncSession):
    check_user = await db.execute(select(Users).where(Users.email == payload.username.strip()))
    result = check_user.scalar_one_or_none()
    if (result is None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    verify_password = await verify_hash_password(original= payload.password, hashed_password=result.hashed_password)
    if not verify_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user_data = {
        "id" : result.id
    }

    token = create_jwt_token(user_data)

    token.update({"user":result})

    return token

async def update_user_service(user_id : str, payload : UpdateUser, db : AsyncSession):
    to_update = await db.execute(update(
        Users
        ).where(
            Users.id == user_id
            ).values(
                name = payload.name,
                country_code = payload.country_code,
                phone_number = payload.phone_number,
                phone_e164 = payload.phone_e164
            ))

    try:
        await db.commit()
    except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Conflict while updating address")
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update User. Please try again later."
        )

    user_info = await db.scalar(select(Users).where(Users.id == user_id))

    return user_info