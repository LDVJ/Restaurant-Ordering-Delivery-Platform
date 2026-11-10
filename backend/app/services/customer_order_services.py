from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.schemas import CreateOrder
from app.oauth2 import CurrentCustomer
from app.enums.orderEnum import PaymentStatus, OrderStatus
from fastapi import HTTPException, status
from app.models.orders import Orders, OrderItems, Review
from app.models.restaurant import MenuItems, Restaurants
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.utilities import generate_id


async def create_order_service(payload: CreateOrder, customer: CurrentCustomer, db: AsyncSession):

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

    bill_amount = str(sum(menu[item.menu_item_id].price * item.quantity for item in payload.items))

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
        response = {
            "id": new_order.id,
            "status": new_order.status,
            "payment_status": new_order.payment_status,
            "created_at": new_order.created_at,
            "bill_amount" : bill_amount,
            "status_updated_at": new_order.status_updated_at,
            "delivered_at": new_order.delivered_at,
            "delivery_address": new_order.delivery_address_text,
            "contact_phone": new_order.contact_phone,
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
            "delivery_partner": None,
            "review": None,
            "return_request": None,
        }

        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        print(repr(e.orig))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order could not be created due to a data conflict")
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to create order, please try again later")

    return response