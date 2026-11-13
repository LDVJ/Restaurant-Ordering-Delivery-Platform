from app.models.restaurant import (
    RestaurantAddress, 
    Restaurants, 
    MenuItems,
    
)
from app.models.orders import Orders, Review
from app.models.payment import PaymentLedger, ReturnRequest
from app.models.user import Users
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import joinedload
from fastapi import HTTPException, status
from app.schemas import (
    CreateRestaurant,
    UpdateRestaurant,
    UpdateRestaurantAdress,
    CreateMenuItem,
)
from app.enums.orderEnum import OrderStatus, PaymentStatus, LedgerEntryType, ReturnRequestStatus
from app.enums.userEnum import UsersRole
import math
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.oauth2 import CurrentOwner
from datetime import datetime, time
from zoneinfo import ZoneInfo


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

async def get_all_menu_items_services(owner_id : str, db : AsyncSession, page : int, page_size : int, search : str , is_available : bool ):
    restaurant = await _load_owner_restaurant(db= db, owner_id=owner_id)
    restaurant_id = restaurant.id

    if not restaurant.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant is not Active")

    filters = [MenuItems.restaurant_id == restaurant_id]
    if search:
        filters.append(MenuItems.name.ilike(f"%{search}%"))
    if is_available is not None:
        filters.append(MenuItems.is_available == is_available)
    
    total = (await db.scalar(select(func.count(MenuItems.id)).where(*filters))) or 0
    total_pages = math.ceil(total / page_size)


    stmt = select(
        MenuItems
    ).where(
        *filters
    ).order_by(
        MenuItems.created_at.asc(), MenuItems.id.desc()
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

async def update_menu_item_service(id : str, payload : dict, db : AsyncSession, owner_id : str):
    restaurant = await _load_owner_restaurant(db = db, owner_id=owner_id)
    restaurant_id = restaurant.id

    menu_item = (await db.scalar(select(MenuItems).where(
        MenuItems.id == id,
        MenuItems.restaurant_id == restaurant_id
    )))

    if menu_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    new_name = payload.get("name")
    if new_name is not None and new_name.lower() != menu_item.name.lower():
        duplicate = await db.scalar(select(MenuItems.id).where(
            MenuItems.restaurant_id == restaurant.id,
            func.lower(MenuItems.name) == new_name.lower(),
            MenuItems.id != menu_item.id
        ))
        if duplicate:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="A dish with this name already exists")

    for key, value in payload.items():
        setattr(menu_item, key, value)

    try:
        await db.commit()
    
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                            detail="Couldn't update the dish. Please try again later")
    await db.refresh(menu_item)

    return menu_item

async def get_restaurant_dashboard_service(owner : CurrentOwner, db : AsyncSession):
    restaurant = await db.scalar(select(Restaurants).where(Restaurants.owner_id == owner.id))

    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )

    IST = ZoneInfo("Asia/Kolkata")

    now_ist = datetime.now(IST)
    start = datetime.combine(now_ist.date(), time.min, tzinfo=IST)
    end = now_ist

    todays_order = await db.scalar(select(
        func.count(Orders.id)
        ).where(
            Orders.restaurant_id == restaurant.id,
            Orders.created_at >= start,
            Orders.created_at <= end
        )
    ) or 0

    total_orders = await db.scalar(
        select(
            func.count(Orders.id)
        ).where(
            Orders.restaurant_id == restaurant.id
        )
    ) or 0


    active_return = (
        select(
            ReturnRequest
            ).where(
                ReturnRequest.order_id == Orders.id,
                ReturnRequest.status != ReturnRequestStatus.REJECTED
            ).exists()
    )

    total_revenue = await db.scalar(select(
        func.coalesce(func.sum(PaymentLedger.amount), 0)
    ).select_from(PaymentLedger).join(
        Orders, Orders.id == PaymentLedger.order_id
    ).where(
        Orders.restaurant_id == restaurant.id,
        Orders.status == OrderStatus.DELIVERED,
        PaymentLedger.entry_type == LedgerEntryType.PAYMENT,
        ~active_return
    )
    ) or 0


    avg_rating = await db.scalar(select(
        func.avg(Review.rating).label("total_review"),
    ).where(
        Review.restaurant_id == restaurant.id
    )) or 0

    avg_rating = round(float(avg_rating), 1)

    pending_returns = await db.scalar(select(
        func.count(ReturnRequest.id)
    ).join(
        Orders, Orders.id == ReturnRequest.order_id
    ).where(
        ReturnRequest.status == ReturnRequestStatus.REQUESTED,
        Orders.restaurant_id == restaurant.id
    )
    )

    return {
        "todays_order" : todays_order,
        "total_orders" : total_orders,
        "total_revenue" : f"{total_revenue:.2f}",
        "average_rating" : avg_rating,
        "pending_returns" : pending_returns
    }


async def get_all_delivery_partners_services(
        db : AsyncSession
):
    busy_partners = (select(
        Orders.delivery_partner_id
    ).where(
        Orders.status != OrderStatus.DELIVERED,
        Orders.delivery_partner_id.is_not(None)
    ).group_by(
        Orders.delivery_partner_id
    ).having(
        func.count(Orders.id) >=5
    ))

    stmt = select(Users).where(
        Users.role == UsersRole.DELIVERY_PARTNER,
        Users.id.not_in(busy_partners)
    )

    available_partners = (await db.execute(stmt)).scalars().all()

    items = [{
        "id" : partner.id,
        "name" : partner.name,
        "phone" : partner.phone_e164
    }for partner in available_partners
    ]

    return {
        "items" : items
    }
    
    