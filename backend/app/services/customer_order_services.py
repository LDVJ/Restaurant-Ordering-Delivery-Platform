from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.schemas import CreateOrder
from app.oauth2 import CurrentCustomer
from app.enums.orderEnum import PaymentStatus, OrderStatus
from fastapi import HTTPException, status
from app.models.orders import Orders, OrderItems, Review
from app.models.restaurant import MenuItems, Restaurants
from app.models.payment import ReturnRequest
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload, selectinload
from app.utilities import generate_id
from datetime import datetime, timedelta
import math


async def _create_response(
        order : Orders, 
        restaurant: Restaurants, 
        order_items : list[OrderItems], 
        db : AsyncSession, 
        customer : CurrentCustomer
    ):

    rating = await db.scalar(select(Review.rating).where(
        Review.order_id == order.id,
        Review.restaurant_id == restaurant.id,
        Review.customer_id == customer.id
    ))

    return_request_status = await db.scalar(select(ReturnRequest.status).where(
        ReturnRequest.order_id == order.id,
        ReturnRequest.customer_id == customer.id,
    ))

    response = {
                "id": order.id,
                "status": order.status,
                "payment_status": order.payment_status,
                "created_at": order.created_at,
                "bill_amount" : order.bill_amount,
                "status_updated_at": order.status_updated_at,
                "delivered_at": order.delivered_at,
                "delivery_address": order.delivery_address_text,
                "contact_phone": order.contact_phone,
                "restaurant": {
                    "id": restaurant.id,
                    "name": restaurant.name,
                    "address": f"{restaurant.address.house} {restaurant.address.city} "
                               f"{restaurant.address.state} {restaurant.address.country}",
                    "phone": restaurant.address.phone_e164,
                },
                "items": [
                    {
                        "id": oi.id, 
                        "item_name": oi.item_name, 
                        "quantity": oi.quantity
                    }for oi in order_items
                ],
                # "customer": {"id": customer.id, "name": customer.name, "phone": customer.phone_e164},
                "delivery_partner": order.delivery_partner_id,
                "review": rating,
                "return_request": return_request_status,
            }

    return response


async def create_order_service(
        payload: CreateOrder, 
        customer: CurrentCustomer, db: AsyncSession):

    restaurant = await db.scalar(
        select(Restaurants)
        .options(joinedload(Restaurants.address))
        .where(Restaurants.id == payload.restaurant_id)
    )
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    item_ids = list({i.menu_item_id for i in payload.items})
    result = await db.execute(
        select(MenuItems.id, MenuItems.name, MenuItems.price, MenuItems.is_available).where(
            MenuItems.id.in_(item_ids),
            MenuItems.restaurant_id == payload.restaurant_id,
        )
    )
    menu = {row.id: row for row in result}

    missing = set(item_ids) - menu.keys()
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Items not found: {sorted(missing)}",
        )

    unavailable = [mid for mid in item_ids if not menu[mid].is_available]
    if unavailable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Items not available: {sorted(unavailable)}",
        )

    bill_amount = f"{sum(menu[item.menu_item_id].price * item.quantity for item in payload.items):.2f}"

    new_order = Orders(
        id = generate_id(),
        customer_id=customer.id,
        restaurant_id=payload.restaurant_id,
        status=OrderStatus.PLACED,
        payment_status=PaymentStatus.MOCK_PAID,
        bill_amount=bill_amount,
        contact_phone=payload.contact_phone,
        delivery_address_text=payload.delivery_address,
    )
    db.add(new_order)
    order_items = [
        OrderItems(
            id = generate_id(),
            order_id=new_order.id,
            menu_item_id=i.menu_item_id,
            item_name=menu[i.menu_item_id].name,
            unit_price=menu[i.menu_item_id].price,
            quantity=i.quantity,
        )
        for i in payload.items
    ]
    db.add_all(order_items)

    try:
        await db.flush()                
        await db.refresh(new_order)      
        
        response = await _create_response(
            order=new_order,
            restaurant=restaurant,
            order_items=order_items,
            db = db,
            customer=customer
        )

        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        print(repr(e.orig))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order could not be created due to a data conflict")
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to create order, please try again later")

    return response

async def get_order_info_services(order_id : str, customer : CurrentCustomer, db : AsyncSession):
    try:
        order = await db.scalar(select(Orders).options(
            selectinload(Orders.order_items)
        ).where(Orders.id == order_id, Orders.customer_id == customer.id))
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail= "Order not found"
            )
    except IntegrityError as e:
        print(repr(e.orig))

    restaurant = await db.scalar(
        select(
            Restaurants
        ).options(
            selectinload(Restaurants.address)
        ).where(
            Restaurants.id == order.restaurant_id
        )
    )

    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )

    order_items = order.order_items

    response = await _create_response(
        order=order, 
        restaurant=restaurant, 
        order_items=order_items, 
        customer=customer, 
        db = db
        )

    return response


async def get_all_orders_services(
        customer : CurrentCustomer,
        db : AsyncSession,
        page : int,
        page_size : int,
        status : OrderStatus,
        date_from : datetime,
        date_to : datetime
):
    filters = [Orders.customer_id == customer.id]
    if status:
        filters.append(Orders.status == status)
    if date_from:
        filters.append(Orders.created_at >= date_from)
    if date_to:
        filters.append(Orders.created_at < date_to + timedelta(days=1))

    total = await db.scalar(select(func.count(Orders.id)).where(filters)) or 0
    total_page = math.ceil(total/page_size)

    