from fastapi import APIRouter, Depends, status, Query
from app.schemas import (
    RestaurantResponse, 
    CreateRestaurant, 
    UpdateRestaurant, 
    UpdateRestaurantAdress,
    OwnerMenuItemsResponse,
    OwnerMenuItem,
    CreateMenuItem
    )
from app.oauth2 import owner_only, CurrentOwner
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.owner_services import (
    get_restaurant_info, 
    create_new_restaurant, 
    update_restaurant, 
    update_restaurant_address,
    get_all_menu_items_services,
    create_new_menu_item_service
)


router = APIRouter(
    prefix="/owner",
    dependencies=[Depends(owner_only)],
    tags=["Restaurant-Owner"]
)


@router.get("/restaurant", response_model=RestaurantResponse, status_code=status.HTTP_200_OK)
async def get_restaurant(owner : CurrentOwner, db : AsyncSession = Depends(get_db)):
    restaurant_data = await get_restaurant_info(db = db, owner_id=owner.id)
    return restaurant_data

@router.post("/restaurant", response_model=RestaurantResponse, status_code= status.HTTP_201_CREATED)
async def create_restaurant(payload : CreateRestaurant, owner : CurrentOwner, db : AsyncSession = Depends(get_db)):
    new_restaurant = await create_new_restaurant(payload= payload, db= db, owner_id = owner.id)
    return new_restaurant

@router.put("/restaurant", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def put_restaurant(payload : UpdateRestaurant, owner : CurrentOwner, db : AsyncSession = Depends(get_db)):
    updated_restaurant = await update_restaurant(payload=payload, db=db, owner_id=owner.id)

    return updated_restaurant

@router.put("/restaurant/address", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def put_restaurant_address(payload : UpdateRestaurantAdress, owner : CurrentOwner, db : AsyncSession = Depends(get_db)):
    updated_restaurant = await update_restaurant_address(payload=payload, db=db, owner_id=owner.id)

    return updated_restaurant

@router.get("/menu", response_model=OwnerMenuItemsResponse, status_code=status.HTTP_200_OK)
async def get_all_menu_items(owner : CurrentOwner, db : AsyncSession = Depends(get_db), page : int = Query(1, ge=1), page_size : int = Query(9, ge=1, lt=50)):
    return await get_all_menu_items_services(owner_id = owner.id, db = db , page = page, page_size = page_size)

@router.post("/menu", response_model=OwnerMenuItem, status_code=status.HTTP_201_CREATED)
async def create_new_menu_item(payload : CreateMenuItem, owner : CurrentOwner, db : AsyncSession = Depends(get_db)):
    return await create_new_menu_item_service(payload=payload, owner_id = owner.id, db = db)
