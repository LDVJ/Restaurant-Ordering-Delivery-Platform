from fastapi import APIRouter, Depends, status
from app.schemas import RestaurantResponse, CreateRestaurant, UpdateRestaurant, UpdateRestaurantAdress
from app.oauth2 import owner_only, CurrentOwner
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.owner_services import get_restraunt_info, create_new_restaurant, update_restaurant, update_restaurant_address

router = APIRouter(
    prefix="/owner",
    dependencies=[Depends(owner_only)],
    tags=["Restaurant-Owner"]
)


@router.get("/restaurant", response_model=RestaurantResponse, status_code=status.HTTP_200_OK)
async def get_restaurant(owner : CurrentOwner, db : AsyncSession = Depends(get_db)):
    restaurant_data = await get_restraunt_info(db = db, owner_id=owner.id)
    return restaurant_data

@router.post("/restaurant", response_model=RestaurantResponse, status_code= status.HTTP_201_CREATED)
async def create_restaurant(payload : CreateRestaurant, owner : CurrentOwner, db : AsyncSession = Depends(get_db)):
    new_restaurant = await create_new_restaurant(payload= payload, db= db, owner_id = owner.id)
    return new_restaurant

@router.put("/restaurant", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def put_restaurant(payload : UpdateRestaurant, owner : CurrentOwner, db : AsyncSession = Depends(get_db)):
    data_to_update = payload.model_dump(exclude_unset=True)
    updated_restaurant = await update_restaurant(payload=data_to_update, db=db, owner_id=owner.id)

    return updated_restaurant

@router.put("/restaurant/address", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def put_restaurant_address(payload : UpdateRestaurantAdress, owner : CurrentOwner, db : AsyncSession = Depends(get_db)):
    data_to_update = payload.model_dump(exclude_unset=True)
    updated_restaurant = await update_restaurant_address(payload=data_to_update, db=db, owner_id=owner.id)

    return updated_restaurant

