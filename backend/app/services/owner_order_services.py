from sqlalchemy.ext.asyncio import AsyncSession
from app.oauth2 import CurrentOwner
from app.models.restaurant import Restaurants
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload, joinedload
from app.enums.orderEnum import OrderStatus, PaymentStatus
from app.models.orders import Orders, OrderItems, Review
from app.models.payment import ReturnRequest
from fastapi import HTTPException, status
import math
from app.models.payment import ReturnRequest
from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.schemas import AssignDeliveryPartnerID


async def get_all_owner_orders_service(
        owner : CurrentOwner, 
        db : AsyncSession, 
        page : int , 
        page_size : int, 
        order_status : OrderStatus | None,
        date_from : datetime,
        date_to : datetime
        ):
    restaurant = await db.scalar(select(Restaurants).where(Restaurants.owner_id == owner.id))

    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )

    filters = [Orders.restaurant_id == restaurant.id]

    if order_status:
        filters.append(Orders.status == order_status)
    if date_from:
        filters.append(Orders.created_at >= date_from)
    if date_to:
        filters.append(Orders.created_at < date_to)

    total = await db.scalar(select(func.count(Orders.id)).where(*filters)) or 0
    total_page = math.ceil(total/page_size)

    items = []
    if total > 0:
        all_orders = (await db.scalars(
            select(Orders)
            .options(
                joinedload(Orders.customer),
                selectinload(Orders.order_items),
                joinedload(Orders.delivery_partner)
            )
            .where(*filters)
            .order_by(Orders.created_at.desc(), Orders.id.desc())
            .limit(page_size)
            .offset((page - 1) * page_size)
        )).all()

        all_ids= [r.id for r in all_orders]
        review_result = await db.execute(select(
            Review.rating, Review.order_id
            ).where(
                Review.order_id.in_(all_ids)
            )
        )

        review_info = {rr.order_id : rr.rating for rr in review_result}
        return_request_result = await db.execute(select(
            ReturnRequest.order_id,
            ReturnRequest.status
        ).where(ReturnRequest.order_id.in_(all_ids)))

        return_request_info = {req.order_id : req.status for req in return_request_result}   

        items = [
            {
            "id" : order.id,
            "status" : order.status,
            "payment_status" : order.payment_status,
            "bill_amount" : f"{order.bill_amount:.2f}",
            "created_at" : order.created_at,
            "status_updated_at" : order.status_updated_at,
            "delivered_at" : order.delivered_at,
            "delivery_address" : order.delivery_address_text,
            "contact_phone" : order.contact_phone,
            "customer" : {
                "id" : order.customer.id,
                "name" : order.customer.name,
                "phone" : order.customer.phone_e164
            },
            "items" : [{
                "id" : oi.id,
                "item_name" : oi.item_name,
                "quantity" : oi.quantity

            }for oi in order.order_items],
            "delivery_partner" : {
                "id" : order.delivery_partner.id,
                "name" : order.delivery_partner.name,
                "phone" : order.delivery_partner.phone_e164
                } if order.delivery_partner_id else None,
            "review" : review_info.get(order.id),
            "return_request" : return_request_info.get(order.id)

        }for order in all_orders
        ]

    return {
        "items" : items,
        "page" : page,
        "total" : total,
        "page_size" : page_size,
        "total_page" : total_page
    }
    

async def get_owner_order_service(owner : CurrentOwner, order_id : str, db : AsyncSession):
    order = await db.scalar(
        select(Orders)
        .join(Restaurants, Restaurants.id == Orders.restaurant_id)   # used only for the owner check
        .options(
            selectinload(Orders.order_items),
            joinedload(Orders.customer),
            joinedload(Orders.delivery_partner),
        )
        .where(
            Orders.id == order_id,
            Restaurants.owner_id == owner.id,
        )
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    review_rating = await db.scalar(select(Review.rating).where(
        Review.order_id == order.id
    ))

    return_request_status = await db.scalar(select(
        ReturnRequest.status
    ).where(ReturnRequest.order_id == order.id).order_by(ReturnRequest.created_at.desc()).limit(1))

    order = await db.scalar(select(Orders).options(
        selectinload(Orders.order_items),
        joinedload(Orders.customer),
        joinedload(Orders.delivery_partner)
    ).where(
        Orders.id == order.id
    ))

    response = {
                "id" : order.id,
                "status" : order.status,
                "payment_status" : order.payment_status,
                "bill_amount" : f"{order.bill_amount:.2f}",
                "created_at" : order.created_at,
                "status_updated_at" : order.status_updated_at,
                "delivered_at" : order.delivered_at,
                "delivery_address" : order.delivery_address_text,
                "contact_phone" : order.contact_phone,
                "customer" : {
                    "id" : order.customer.id,
                    "name" : order.customer.name,
                    "phone" : order.customer.phone_e164
                },
                "items" : [{
                    "id" : oi.id,
                    "item_name" : oi.item_name,
                    "quantity" : oi.quantity
    
                }for oi in order.order_items],
                "delivery_partner" : {
                    "id" : order.delivery_partner.id,
                    "name" : order.delivery_partner.name,
                    "phone" : order.delivery_partner.phone_e164
                    } if order.delivery_partner_id else None,
                "review" : review_rating,
                "return_request" : return_request_status
    }


    return response

async def update_order_status_service(
        owner : CurrentOwner,
        order_id : str,
        order_status : OrderStatus,
        db : AsyncSession
):
    order = await db.scalar(select(
        Orders
        ).options(
            joinedload(Orders.restaurant), 
            selectinload(Orders.order_items),
            joinedload(Orders.customer)
        ).join(Restaurants, Restaurants.id == Orders.restaurant_id).where(Orders.id ==  order_id, Restaurants.owner_id == owner.id))

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    IST = ZoneInfo("Asia/Kolkata")
    now_ist = datetime.now(IST)

    if order_status == OrderStatus.ACCEPTED and order.status == OrderStatus.PLACED and order.payment_status == PaymentStatus.MOCK_PAID:
        order.status = order_status
        order.status_updated_at = now_ist
    elif order_status == OrderStatus.PREPARING and order.status == OrderStatus.ACCEPTED:
        order.status = order_status
        order.status_updated_at = now_ist
    elif order_status == OrderStatus.READY and order.status == OrderStatus.PREPARING:
        order.status = order_status
        order.status_updated_at = now_ist
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status update request"
        )

    try:
        await db.commit()
        await db.refresh(order)
        response = {
            "id" : order.id,
            "status" : order.status,
            "payment_status" : order.payment_status,
            "bill_amount" : f"{order.bill_amount:.2f}",
            "created_at" : order.created_at,
            "status_updated_at" : order.status_updated_at,
            "delivered_at" : order.delivered_at,
            "delivery_address" : order.delivery_address_text,
            "contact_phone" : order.contact_phone,
            "customer" : {
                "id" : order.customer.id,
                "name" : order.customer.name,
                "phone" : order.customer.phone_e164
            },
            "items" : [{
                "id" : oi.id,
                "item_name" : oi.item_name,
                "quantity" : oi.quantity

            }for oi in order.order_items],
            "delivery_partner" : None,
            "review" : None,
            "return_request" : None
        }
    except IntegrityError as e:
        await db.rollback()
        print(repr(e.orig))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to update the status")
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to update the order")

    return response

async def assign_delivery_partner_service(
        order_id : str,
        owner : CurrentOwner,
        payload : AssignDeliveryPartnerID,
        db : AsyncSession,
):
    order = await db.scalar(
    select(Orders)
    .options(
        joinedload(Orders.restaurant),
        selectinload(Orders.order_items),
        joinedload(Orders.customer),
        joinedload(Orders.delivery_partner),   # this was missing
    )
    .join(Restaurants, Restaurants.id == Orders.restaurant_id)
    .where(
        Orders.id == order_id,
        Restaurants.owner_id == owner.id,
    )
    .execution_options(populate_existing=True)
)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    current_assigned_delivery = await db.scalar(select(
        func.count(Orders.id)
    ).where(
        Orders.delivery_partner_id == payload.delivery_partner_id,
        Orders.status != OrderStatus.DELIVERED
    ))

    if current_assigned_delivery > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many delivery Assigned"
        )

    order.delivery_partner_id = payload.delivery_partner_id
    order.status = OrderStatus.ASSIGNED

    try:
        await db.commit()
        await db.refresh(order)
        
    except IntegrityError as e:
        await db.rollback()
        print(repr(e.orig))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to assign delivery partner")
    except SQLAlchemyError as e:
        await db.rollback()
        print(f"Error : {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to assign delivery partner")

    order = await db.scalar(
        select(Orders)
        .options(
            joinedload(Orders.restaurant),
            selectinload(Orders.order_items),
            joinedload(Orders.customer),
            joinedload(Orders.delivery_partner),   # this was missing
        )
        .join(Restaurants, Restaurants.id == Orders.restaurant_id)
        .where(
            Orders.id == order_id,
            Restaurants.owner_id == owner.id,
        )
        .execution_options(populate_existing=True)
)

    response = {
                    "id" : order.id,
                    "status" : order.status,
                    "payment_status" : order.payment_status,
                    "bill_amount" : f"{order.bill_amount:.2f}",
                    "created_at" : order.created_at,
                    "status_updated_at" : order.status_updated_at,
                    "delivered_at" : order.delivered_at,
                    "delivery_address" : order.delivery_address_text,
                    "contact_phone" : order.contact_phone,
                    "customer" : {
                        "id" : order.customer.id,
                        "name" : order.customer.name,
                        "phone" : order.customer.phone_e164
                    },
                    "items" : [{
                        "id" : oi.id,
                        "item_name" : oi.item_name,
                        "quantity" : oi.quantity
    
                    }for oi in order.order_items],
                    "delivery_partner" : {
                        "id" : order.delivery_partner.id,
                        "name" : order.delivery_partner.name,
                        "phone" : order.delivery_partner.phone_e164
                        } if order.delivery_partner else None,
                    "review" : None,
                    "return_request" : None
            }
    return response