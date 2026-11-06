from app.models.restaurant import RestaurantAddress, Restaurants, MenuItems
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.schemas import CreateRestaurant, UpdateRestaurant
from sqlalchemy.exc import IntegrityError


async def _load_owner_restaurant(db : AsyncSession, owner_id : str):
    result = await db.execute(select(Restaurants).options(selectinload(Restaurants.address)).where(Restaurants.owner_id == owner_id))
    restaurant = result.scalar_one_or_none()
    if restaurant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found") 
    return restaurant

async def _reload_restaurnt(db : AsyncSession, restaurant_id : str):
    result = await db.execute(select(Restaurants).options(selectinload(Restaurants.address)).where(Restaurants.id == restaurant_id).execution_options(populate_existing=True))
    return result.scalar_one()

async def get_restraunt_info(db : AsyncSession, owner_id : str):
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
    restaurant = await _reload_restaurnt(db , new_restaurant.id)
    return restaurant

async def update_restaurant(payload : dict, db :AsyncSession, owner_id : str):
    restaurant = await _load_owner_restaurant(db=db, owner_id=owner_id)
    restaurant_id = restaurant.id

    if "country_code" or "phone_number" in payload:
        country_code = payload.get("country_code", restaurant.country_code) 
        phone_number = payload.get("phone_number", restaurant.phone_number)
        phone_e164 = f"{country_code}{phone_number}"

        payload.update(
            country_code = country_code,
            phone_number = phone_number,
            phone_e164 = phone_e164
        )

    for key, value in payload.items():
        setattr(restaurant, key, value)

    try:
        await db.commit()
    except:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="DB Error")

    updated_restaurant = await _reload_restaurnt(db =db, restaurant_id=restaurant_id)

    return updated_restaurant

async def update_restaurant_address(payload : dict, db : AsyncSession, owner_id : str):
    restaurant = await _load_owner_restaurant(db=db, owner_id=owner_id)
    restaurant_id = restaurant.id

    restaurant_address_result = await db.execute(select(RestaurantAddress).where(RestaurantAddress.restaurant_id == restaurant_id))
    restaurant_address_info =  restaurant_address_result.scalar_one()

    if "country_code" or "phone_number" in payload:
        country_code = payload.get("country_code", restaurant_address_info.country_code)
        phone_number = payload.get("phone_number", restaurant_address_info.phone_number)
        phone_e164 = f"{country_code}{phone_number}"

        if phone_e164 != restaurant_address_info.phone_e164:
            check = await db.execute(select(RestaurantAddress).where(RestaurantAddress.phone_e164== phone_e164))
            check_result = check.scalar_one_or_none()
            if check_result is not None:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number already assigned to another Restaurant")

        payload.update(country_code  = country_code, phone_number = phone_number, phone_e164 = phone_e164)

    for key, value in payload.items():
        setattr(restaurant_address_info, key, value)

    try:
        await db.commit()
    except:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="DB Error")

    updated_restaurant = await _reload_restaurnt(db=db, restaurant_id=restaurant_id)

    return updated_restaurant
