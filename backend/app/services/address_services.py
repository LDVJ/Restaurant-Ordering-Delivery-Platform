from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select,update
from app.models.user import (
    Users,
    UserAddress
)
from app.schemas import (
    CreateUserAddress,
    )
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from fastapi import HTTPException, status


MAX_ADDRESSES =  10

async def _load_customer_info(customer_id : str, db : AsyncSession):
    customer = await db.scalar(select(Users).options(selectinload(Users.addresses)).where(Users.id == customer_id))
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer Not Found"
        )
    return customer

async def get_user_address_service(customer_id : str, db : AsyncSession, is_default=True) -> dict:
    filters = [UserAddress.user_id == customer_id]
    if is_default is not None:
        filters.append(UserAddress.is_default == is_default)
    user_address_details = (await db.scalars(select(UserAddress).where(*filters))).all()

    addresses = [{
        "house" : addr.house,
        "city" : addr.city,
        "state" : addr.state,
        "country" : addr.country,
        "country_code": addr.country_code,
        "is_default" : addr.is_default,
        "phone_number": addr.phone_number,
        "id" :  addr.id,
        "created_at" : addr.created_at,
        "updated_at" : addr.updated_at
    }for addr in user_address_details
    ]

    return addresses
    
 
async def create_user_address_service(
        payload : CreateUserAddress, 
        customer_id : str , 
        db : AsyncSession
) -> dict:
    customer = await _load_customer_info(customer_id = customer_id, db = db)

    customer_address = customer.addresses

    if len(customer_address) == MAX_ADDRESSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One user can have only 10 addresses"
        )

    make_default = payload.is_default or not any(a.is_default for a in customer_address)

    if make_default:
        for addr in customer_address:
            addr.is_default = False

    new_user_address = UserAddress(
        user_id = customer_id,
        is_default = make_default,
        house = payload.house,
        city = payload.city,
        state = payload.state,
        country = payload.country,
        country_code = payload.country_code,
        phone_number = payload.phone_number,
        phone_e164 = payload.phone_e164,
    )

    db.add(new_user_address)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Default address conflict, please try again",
        )
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Unable to create address, Please try again later"
            )
    
    
    await db.refresh(new_user_address)

    return new_user_address

async def update_user_address_service(
        payload : dict, 
        db : AsyncSession,
        customer_id : str,
        address_id : str
        ) -> dict:

    address = (await db.execute(select(UserAddress).where(
        UserAddress.id == address_id,
        UserAddress.user_id == customer_id
    ))).scalar_one_or_none()

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Requested Address not found"
        )
    

    country_code = payload.get("country_code", address.country_code)
    phone_number = payload.get("phone_number", address.phone_number)


    if country_code != address.country_code or phone_number != address.phone_number:
        phone_e164 = f"{country_code}{phone_number}"
        payload.update({"phone_e164": phone_e164})


    for key, value in payload.items():
        setattr(address, key, value)

    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update address. Please try again later."
        )
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Conflict while updating address")

    await db.refresh(address)

    return address


async def set_default_address_service(
        address_id : str, 
        customer_id : str, 
        db : AsyncSession
    ) -> dict:
    target_address = (await db.execute(
        select(UserAddress)
        .where(
            UserAddress.id == address_id,
            UserAddress.user_id == customer_id
    ))).scalar_one_or_none()

    if not target_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    try:
        await db.execute(update(UserAddress).where(
            UserAddress.user_id == customer_id,
            UserAddress.is_default.is_(True),
        ).values(
            is_default = False
        ))

        target_address.is_default = True
        await db.commit()
    except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Conflict while updating address")
    except SQLAlchemyError as e:
        await db.rollback()
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update address. Please try again later."
        )
    
    await db.refresh(target_address)

    return target_address


async def delete_address_service(
        address_id : str,
        customer_id : str,
        db : AsyncSession
):

    target_address = (await db.execute(select(UserAddress).where(
        UserAddress.id == address_id,
        UserAddress.user_id == customer_id,
    ))).scalar_one_or_none()

    if not target_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= "Address not found"
        )

    if target_address.is_default:
        recently_added_address = await db.scalar(select(
            UserAddress
            ).where(
                UserAddress.user_id == customer_id,
                UserAddress.id != address_id
                ).order_by(
                    UserAddress.created_at.desc()
                    ).limit(1))


    try:
        await db.delete(target_address)
        await db.flush()
        if recently_added_address:
            recently_added_address.is_default = True
        await db.commit()
    except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Conflict while updating address")
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update address. Please try again later."
        )
    

