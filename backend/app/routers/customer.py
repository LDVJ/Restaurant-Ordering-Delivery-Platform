from fastapi import APIRouter, Depends, status, Query
from app.oauth2 import customer_only
from app.schemas import ( 
    CustomerRestaurantResponse, 
    CustomerRestaurantInfoResponse,
    CustomerMenuItemsResponse
    )
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.customer_services import (
    get_restaurant_list_service, 
    get_restaurant_info_service,
    get_menu_items_service,
    get_cuisines_service
    )
from decimal import Decimal

router = APIRouter(
    tags=["Customer"],
    dependencies=[Depends(customer_only)],
    prefix="/restaurants"
)

@router.get("", response_model=CustomerRestaurantResponse, status_code=status.HTTP_200_OK)
async def get_retaurant_list(
    db : AsyncSession = Depends(get_db), 
    page : int = Query(1, ge=1), 
    page_size : int =  Query(20, ge=1, le=50), 
    search : str = None, 
    cuisine : str = None
):
    return await get_restaurant_list_service(
        db=db, 
        page=page, 
        page_size=page_size, 
        search=search, 
        cuisine=cuisine
        )

@router.get("/cuisines", response_model=list[str], status_code = status.HTTP_200_OK)
async def get_cuisines(db : AsyncSession = Depends(get_db)):
    return await get_cuisines_service(db = db)


@router.get("/{restaurant_id}", response_model=CustomerRestaurantInfoResponse, status_code=status.HTTP_200_OK)
async def get_restaurant_info(restaurant_id : str, db : AsyncSession = Depends(get_db)):
    return await get_restaurant_info_service(restaurant_id = restaurant_id, db = db)

@router.get("/{restaurant_id}/menu", response_model=CustomerMenuItemsResponse, status_code=status.HTTP_200_OK)
async def get_menu_items(
    restaurant_id : str, 
    db : AsyncSession = Depends(get_db), 
    search : str = None, 
    min_price : Decimal | None = Query(None, ge=0), 
    max_price : Decimal | None = Query(None, ge=0), 
    page : int = Query(1, ge=1), 
    page_size : int = Query(20, ge=1, le=50)
):
    return await get_menu_items_service(
        db= db, 
        restaurant_id = restaurant_id, 
        search = search, 
        min_price =  min_price, 
        max_price = max_price, 
        page = page, 
        page_size= page_size
        )

