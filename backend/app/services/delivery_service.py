from app.oauth2 import CurrentDeliveryPartner
from sqlalchemy.ext.asyncio import AsyncSession
from app.enums.orderEnum import OrderStatus
from app.models.orders import Orders
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload, selectinload
from app.schemas import UpdateDeliveryStatus
import math
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


async def get_all_delivery_orders_service(
    dpartner : CurrentDeliveryPartner,
    db : AsyncSession,
    page : int,
    page_size : int,
    order_status : OrderStatus
):
    filters = [Orders.delivery_partner_id == dpartner.id]

    if order_status:
        if order_status in (OrderStatus.ASSIGNED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED):
            filters.append(
                Orders.status == order_status
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only ASSIGNED, OUT_FOR_DELIVERY and DELIVERED status order can be accessed"
            )

    total = await db.scalar(select(
        func.count(Orders.id)
        ).where(
            *filters
        )
    ) or 0

    total_page = math.ceil(total/page_size)

    orders_details = (await db.scalars(
        select(Orders).options(
            joinedload(Orders.restaurant),
            joinedload(Orders.customer),
            selectinload(Orders.order_items)
        ).where(
            *filters
        ).order_by(
            Orders.created_at.desc(),
            Orders.id.desc()
        ).limit(
            page_size
        ).offset(
            (page - 1) * page_size
        )
    )).all()


    items = [
        {
            "id" : order.id,
            "status" : order.status,
            "payment_status" : order.payment_status,
            "bill_amount" : f"{order.bill_amount:.2f}",
            "created_at" : order.created_at,
            "delivered_at" : order.delivered_at,
            "delivery_address" : order.delivery_address_text,
            "contact_phone" : order.contact_phone,
            "restaurant" : {
                "id" : order.restaurant.id,
                "name" : order.restaurant.name,
                "phone" : order.restaurant.phone_e164
            },
            "items" : [
                {
                    "id" : oi.id,
                    "item_name" : oi.item_name,
                    "quantity" : oi.quantity
                }for oi in order.order_items
            ],
            "customer" : {
                "id" : order.customer.id,
                "name" : order.customer.name,
                "phone" : order.customer.phone_e164
            }
        }for order in orders_details
    ]


    return {
        "items" : items,
        "page" : page,
        "total" : total,
        "page_size" : page_size,
        "total_pages" : total_page
    }


async def update_delivery_order_status_service(
        dpartner : CurrentDeliveryPartner,
        payload : UpdateDeliveryStatus,
        order_id : str,
        db : AsyncSession
):
    filters = [
        Orders.delivery_partner_id == dpartner.id,
        Orders.id == order_id
        ]

    order_details = await db.scalar(
        select(Orders).where(
            *filters
        )
    )

    if not order_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order not found"
        )

    allowed_status = [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED]

    if payload.status in allowed_status:
        if order_details.status == OrderStatus.ASSIGNED and payload.status == OrderStatus.OUT_FOR_DELIVERY:
            order_details.status = payload.status
        elif order_details.status == OrderStatus.OUT_FOR_DELIVERY and payload.status == OrderStatus.DELIVERED:
            order_details.status = payload.status
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail = "Invalid status update"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail = f"Only {OrderStatus.OUT_FOR_DELIVERY} and {OrderStatus.DELIVERED}"
        )


    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update the status. Please try again later"
        )
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate response. Please refresh the page"
        )

    order = await db.scalar(
        select(Orders).options(
            joinedload(Orders.restaurant),
            joinedload(Orders.customer),
            selectinload(Orders.order_items)
        ).where(
            *filters
        )
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= "Order not found"
        )

    return {
        "id" : order.id,
        "status" : order.status,
        "payment_status" : order.payment_status,
        "bill_amount" : f"{order.bill_amount:.2f}",
        "created_at" : order.created_at,
        "delivered_at" : order.delivered_at,
        "delivery_address" : order.delivery_address_text,
        "contact_phone" : order.contact_phone,
        "restaurant" : {
            "id" : order.restaurant.id,
            "name" : order.restaurant.name,
            "phone" : order.restaurant.phone_e164
        },
        "items" : [
            {
                "id" : oi.id,
                "item_name" : oi.item_name,
                "quantity" : oi.quantity
            }for oi in order.order_items
        ],
        "customer" : {
            "id" : order.customer.id,
            "name" : order.customer.name,
            "phone" : order.customer.phone_e164
    }
    }

        
