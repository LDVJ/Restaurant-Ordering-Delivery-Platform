from fastapi import APIRouter, Depends, HTTPException, status
from app.oauth2 import customer_only, CurrentCustomer
from app.schemas import(
    UserAddressResponse,
    CreateUserAddress,
    UserAddress,
    UpdateUserAddress
)
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.address_services import(
    get_user_address_service,
    create_user_address_service,
    update_user_address_service,
    set_default_address_service,
    delete_address_service
)


router = APIRouter(
    tags=["User-Address"],
    dependencies=[Depends(customer_only)],
    prefix="/addresses"
)


@router.get("",response_model=UserAddressResponse, status_code=status.HTTP_200_OK)
async def get_user_address(customer : CurrentCustomer, db : AsyncSession = Depends(get_db)):
    user_info = await get_user_address_service(customer_id = customer.id, db = db)

    return {
        "user_id" : customer.id,
        "addresses" : user_info.addresses
    }

@router.post("",response_model=UserAddress, status_code = status.HTTP_201_CREATED)
async def create_user_address(payload : CreateUserAddress, customer : CurrentCustomer, db:AsyncSession = Depends(get_db)):
    return await create_user_address_service(payload = payload, customer_id = customer.id, db = db)

@router.put("/{address_id}", response_model=UserAddress, status_code = status.HTTP_200_OK)
async def update_user_address(address_id : str, payload : UpdateUserAddress, customer : CurrentCustomer, db : AsyncSession = Depends(get_db)):
    return await update_user_address_service(
        customer_id = customer.id, 
        address_id = address_id, 
        payload=payload.model_dump(exclude_unset=True),
        db=db
    )

@router.post("/{address_id}/default",response_model= UserAddress, status_code=status.HTTP_200_OK)
async def set_default_address(address_id : str, customer : CurrentCustomer, db : AsyncSession = Depends(get_db)):
    return await set_default_address_service(
        address_id = address_id,
        customer_id = customer.id,
        db = db
    )


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id : str, 
    customer : CurrentCustomer, 
    db : AsyncSession = Depends(get_db)
    ):
    await delete_address_service(
        address_id = address_id, 
        customer_id = customer.id, 
        db = db
        )