from sqlalchemy.ext.asyncio import AsyncSession
import math
from sqlalchemy import select, func, or_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.restaurant import (
    Restaurants, 
    RestaurantAddress,
    MenuItems
)
from app.models.orders import Review
from decimal import Decimal

async def _load_restaurant(db : AsyncSession, restaurant_id : str):
    check_restaurant = await db.execute(select(Restaurants).options(joinedload(Restaurants.address)).where(Restaurants.id == restaurant_id))
    restaurant = check_restaurant.scalar_one_or_none()
    if ((restaurant is None) or (not restaurant.is_active) or (restaurant.address is None)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    return restaurant

def escape_like(text: str) -> str:
    """Make %, _ and backslash in user text match literally inside LIKE."""
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

async def get_restaurant_list_service(db : AsyncSession, page : int, page_size : int, search : str = None, cuisine : str = None) -> dict:
    filters = [Restaurants.is_active.is_(True)]

    search = (search or "").strip()
    if search:
        pattern = f"%{escape_like(search)}%"
        filters.append(
            or_(
                Restaurants.name.ilike(pattern, escape="\\"),
                Restaurants.cuisine.ilike(pattern, escape="\\")
            )
        )


    cuisine = (cuisine or "").strip()
    if cuisine:
        filters.append(func.lower(Restaurants.cuisine) == cuisine.lower())

    total = (await db.scalar(select(func.count(Restaurants.id)).join(RestaurantAddress, Restaurants.id == RestaurantAddress.restaurant_id).where(*filters))) or 0
    total_pages = math.ceil(total/page_size)

    stmt = select(
        Restaurants.id,
        Restaurants.name,
        Restaurants.description,
        Restaurants.cuisine,
        RestaurantAddress.city,
        func.round(func.avg(Review.rating), 1).label("avg_rating"),
        func.count(Review.id).label("review_count")
    ).join(
        RestaurantAddress, RestaurantAddress.restaurant_id == Restaurants.id
    ).outerjoin(
        Review, Review.restaurant_id == Restaurants.id
    ).where(
        *filters
    ).group_by(
        Restaurants.id, RestaurantAddress.city
    ).order_by(
        func.lower(Restaurants.name), Restaurants.id
    ).limit(page_size).offset((page - 1) * page_size)

    rows = (await db.execute(stmt)).all()

    items =  [
        {
            "id" : row.id,
            "name" : row.name,
            "description" : row.description,
            "cuisine" : row.cuisine,
            "city" : row.city,
            "avg_rating" : row.avg_rating,
            "review_count" : row.review_count
        }for row in rows
    ]

    return {
        "items" : items,
        "total" : total,
        "page" : page,
        "page_size" : page_size,
        "total_pages" : total_pages
    }

async def get_restaurant_info_service(db : AsyncSession, restaurant_id : str) -> dict:
    restaurant = await _load_restaurant(db=db, restaurant_id=restaurant_id)

    address = f"{restaurant.address.house}, {restaurant.address.city}, {restaurant.address.state}, {restaurant.address.country}"

    stmt = select(
        func.round(func.avg(Review.rating), 1).label("avg_rating"),
        func.count(Review.id).label("review_count")
    ).where(
        Review.restaurant_id == restaurant.id
    )

    result = (await db.execute(stmt)).one()

    return {
        "id" : restaurant.id,
        "name" : restaurant.name,
        "description" : restaurant.description,
        "cuisine" : restaurant.cuisine,
        "city" : restaurant.address.city,
        "address" : address,
        "avg_rating" : float(result.avg_rating) if result.avg_rating is not None else None,
        "review_count" : result.review_count
    }

async def get_menu_items_service(db : AsyncSession, restaurant_id : str, min_price : Decimal, max_price : Decimal, page : int, page_size : int, search : str) -> dict:
    restaurant = await _load_restaurant(db=db, restaurant_id=restaurant_id)

    filters = [MenuItems.restaurant_id == restaurant.id]
    sr = (search or "").strip()
    if sr:
        filters.append(MenuItems.name.ilike(f"{escape_like(sr)}", escape="\\"))
    if min_price is not None:
        filters.append(MenuItems.price >= min_price)
    if max_price is not None:
        filters.append(MenuItems.price <= max_price)

    total = (await db.execute(select(func.count(MenuItems.id)).where(*filters))) or 0
    total_pages = math.ceil(total/page_size)

    stmt = select(
        MenuItems
    ).where(
        *filters
    ).order_by(
        MenuItems.is_available.desc(), func.lower(MenuItems.name) ,MenuItems.id
    ).limit(page_size).offset((page-1)*page_size)

    result = (await db.execute(stmt)).scalars().all()

    items = [
        {
            "id" : item.id,
            "name" : item.name,
            "description" : item.description,
            "price" : item.price,
            "is_available" : item.is_available
        } for item in result
    ]

    return {
        "items" : items,
        "total" : total,
        "page" : page,
        "page_size" : page_size,
        "total_pages" : total_pages
    }

    