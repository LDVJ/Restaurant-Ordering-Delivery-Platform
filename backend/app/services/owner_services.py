from app.models.restaurant import (
    RestaurantAddress, 
    Restaurants, 
    MenuItems
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from fastapi import HTTPException, status
from app.schemas import (
    CreateRestaurant,
    UpdateRestaurant,
    UpdateRestaurantAdress,
    CreateMenuItem
)
import math
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


async def _load_owner_restaurant(db : AsyncSession, owner_id : str):
    result = await db.execute(select(Restaurants).options(joinedload(Restaurants.address)).where(Restaurants.owner_id == owner_id))
    restaurant = result.scalar_one_or_none()
    if restaurant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found") 
    return restaurant

async def _reload_restaurant(db : AsyncSession, restaurant_id : str):
    result = await db.execute(select(Restaurants).options(joinedload(Restaurants.address)).where(Restaurants.id == restaurant_id).execution_options(populate_existing=True))
    return result.scalar_one()

async def get_restaurant_info(db : AsyncSession, owner_id : str):
    restaurant_info = await _load_owner_restaurant(db, owner_id)
    return restaurant_info

async def create_new_restaurant(payload : CreateRestaurant, db : AsyncSession, owner_id : str):
    check_restaurant = await db.execute(select(Restaurants).where(Restaurants.owner_id == owner_id))
    restaurant_info = check_restaurant.first()
    if (restaurant_info is not None):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Restaurant already exist")
    phone_e164 = payload.address.country_code + payload.address.phone_number
    check_phone = await db.execute(select(RestaurantAddress).where(RestaurantAddress.phone_e164 == phone_e164))
    if (check_phone.first() is not None):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Restaurant With this phonenumber already exists"
        )

    new_restaurant = Restaurants(
        owner_id = owner_id,
        name = payload.name,
        description = payload.description,
        cuisine = payload.cuisine,
        country_code = payload.country_code,
        phone_number = payload.phone_number,
        phone_e164 = payload.phone_e164,
    )

    try :
        db.add(new_restaurant)
        await db.flush()

        new_restaurant_address = RestaurantAddress(
            restaurant_id = new_restaurant.id,   
            house = payload.address.house,
            city = payload.address.city,
            state = payload.address.state,
            country = payload.address.country,
            country_code = payload.address.country_code,
            phone_number = payload.address.phone_number,
            phone_e164 = payload.address.phone_e164
        )

        db.add(new_restaurant_address)
        await db.commit()
    except IntegrityError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This restaurant could not be created because of a duplicate. Check the phone number and try again.")
    restaurant = await _reload_restaurant(db , new_restaurant.id)
    return restaurant

async def update_restaurant(payload : UpdateRestaurant, db :AsyncSession, owner_id : str):
    restaurant = await _load_owner_restaurant(db=db, owner_id=owner_id)
    restaurant_id = restaurant.id

    phone_e164 = f"{payload.country_code}{payload.phone_number}"

    restaurant.name = payload.name
    restaurant.description = payload.description
    restaurant.cuisine = payload.cuisine
    restaurant.country_code = payload.country_code
    restaurant.phone_number = payload.phone_number
    restaurant.phone_e164 = phone_e164
    
    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="DB Error")

    updated_restaurant = await _reload_restaurant(db =db, restaurant_id=restaurant_id)

    return updated_restaurant

async def update_restaurant_address(payload : UpdateRestaurantAdress, db : AsyncSession, owner_id : str):
    restaurant = await _load_owner_restaurant(db=db, owner_id=owner_id)
    restaurant_id = restaurant.id

    restaurant_address_result = await db.execute(select(RestaurantAddress).where(RestaurantAddress.restaurant_id == restaurant_id))
    restaurant_address_info =  restaurant_address_result.scalar_one()

    phone_e164 = f"{payload.country_code}{payload.phone_number}"

    if phone_e164 != restaurant_address_info.phone_e164:
        check = await db.execute(select(RestaurantAddress).where(RestaurantAddress.phone_e164== phone_e164))
        check_result = check.scalar_one_or_none()
        if check_result is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number already assigned to another Restaurant")

    restaurant_address_info.house = payload.house
    restaurant_address_info.city =  payload.city
    restaurant_address_info.state = payload.state
    restaurant_address_info.country = payload.country
    restaurant_address_info.country_code = payload.country_code
    restaurant_address_info.phone_number = payload.phone_number
    restaurant_address_info.phone_e164 = phone_e164

    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="DB Error")

    updated_restaurant = await _reload_restaurant(db=db, restaurant_id=restaurant_id)

    return updated_restaurant

async def get_all_menu_items_services(owner_id : str, db : AsyncSession, page : int, page_size : int):
    restaurant = await _load_owner_restaurant(db= db, owner_id=owner_id)
    restaurant_id = restaurant.id

    if not restaurant.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant is not Active")

    total = (await db.scalar(select(func.count(MenuItems.id)).where(MenuItems.restaurant_id == restaurant_id))) or 0
    total_pages = math.ceil(total / page_size)

    stmt = select(
        MenuItems
    ).where(
        MenuItems.restaurant_id == restaurant_id
    ).order_by(
        MenuItems.created_at, MenuItems.id
    ).limit(
        page_size
    ).offset((page - 1) * page_size)

    result = (await db.execute(stmt)).scalars().all()

    items = [
        {
            "id" : row.id,
            "name" : row.name,
            "description" : row.description,
            "price" : row.price,
            "is_available" : row.is_available,
            "created_at" : row.created_at,
            "updated_at" : row.updated_at
        }for row in result
    ]

    return {
        "items" : items,
        "total" : total,
        "page" : page,
        "page_size" : page_size,
        "total_pages" : total_pages
    }

async def create_new_menu_item_service(payload : CreateMenuItem, owner_id : str, db : AsyncSession):
    restaurant = await _load_owner_restaurant(db = db, owner_id= owner_id)
    restaurant_id = restaurant.id

    check_item = (await db.execute(select(MenuItems).where(MenuItems.name == payload.name, MenuItems.restaurant_id == restaurant_id))).scalar_one_or_none()

    if check_item:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Another Item have the same name for this restaurant")

    new_item = MenuItems(
        restaurant_id = restaurant_id,
        name = payload.name.strip(),
        description = payload.description.strip(),
        price = payload.price
    )

    db.add(new_item)

    try:
        await db.commit()
    except:
        await db.rollback()

    await db.refresh(new_item)

    return new_item