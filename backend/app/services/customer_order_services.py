from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.schemas import CreateOrder, CreateReturnRequest, CreateReview
from app.oauth2 import CurrentCustomer
from app.enums.orderEnum import PaymentStatus, OrderStatus, LedgerEntryType, ReturnRequestStatus
from fastapi import HTTPException, status
from app.models.orders import Orders, OrderItems, Review
from app.models.restaurant import MenuItems, Restaurants
from app.models.payment import ReturnRequest, PaymentLedger
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload, selectinload
from app.utilities import generate_id
from datetime import datetime, time, timezone, timedelta
import math
import secrets



async def _get_rating(order : Orders, restaurant : Restaurants, customer : CurrentCustomer, db : AsyncSession):
    return await db.scalar(select(Review.rating).where(
        Review.order_id == order.id,
        Review.restaurant_id == restaurant.id,
        Review.customer_id == customer.id
    ))

async def _get_return_request_status(order : Orders, customer : CurrentCustomer, db : AsyncSession):
    return await db.scalar(select(ReturnRequest.status).where(
        ReturnRequest.order_id == order.id,
        ReturnRequest.customer_id == customer.id,
    ))
    

async def _create_response(
        order : Orders, 
        restaurant: Restaurants, 
        order_items : list[OrderItems], 
        db : AsyncSession, 
        customer : CurrentCustomer
    ):

    rating = await _get_rating(
        restaurant=restaurant,
        order=order,
        customer=customer,
        db = db
    )

    return_request_status = await _get_return_request_status(
        order=order,
        customer=customer,
        db = db
    )
    
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
                "delivery_partner": {
                    "id" : order.delivery_partner.id,
                    "name" : order.delivery_partner.name,
                    "phone" : order.delivery_partner.phone_e164
                } if order.delivery_partner_id else None,
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

    new_payment_ledger = PaymentLedger(
        order_id = new_order.id,
        entry_type = LedgerEntryType.PAYMENT,
        amount = new_order.bill_amount,
        transaction_ref = f"TR-{secrets.token_hex(4).upper()}",
    )
    db.add(new_payment_ledger)

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
            selectinload(Orders.order_items), joinedload(Orders.delivery_partner)
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
        status : OrderStatus | None,
        date_from : datetime,
        date_to : datetime
):
    filters = [Orders.customer_id == customer.id]
    if status:
        filters.append(Orders.status == status)
    if date_from:
        start = datetime.combine(date_from, time.min, tzinfo=timezone.utc)
        filters.append(Orders.created_at >= start)
    if date_to:
        end = datetime.combine(date_to + timedelta(days=1), time.min, tzinfo=timezone.utc)
        filters.append(Orders.created_at < end)

    total = await db.scalar(select(func.count(Orders.id)).where(*filters)) or 0
    total_page = math.ceil(total/page_size)

    all_orders = (await db.execute(
        select(
            Orders
        ).options(
            joinedload(Orders.restaurant).joinedload(Restaurants.address),
            selectinload(Orders.order_items)
        ).where(
            *filters
        ).order_by(
            Orders.created_at.desc()
        ).limit(page_size).offset((page - 1) * page_size)
    )).scalars().all()

    order_ids = [o.id for o in all_orders]


    if order_ids:
        rows = await db.execute(select(
            ReturnRequest.order_id,
            ReturnRequest.status,
            ).where(
                ReturnRequest.order_id.in_(order_ids),
                ReturnRequest.customer_id == customer.id
            )
        )
        return_status = {r.order_id : r.status for r in rows}

        rows = await db.execute(select(
            Review.order_id, Review.rating
        ).where(
            Review.order_id.in_(order_ids),
            Review.customer_id == customer.id
        ))

        review_rating = {r.order_id : r.rating for r in rows}

        rows = await db.execute(
                select(OrderItems.id, OrderItems.order_id, OrderItems.item_name, OrderItems.quantity).where(
                    OrderItems.order_id.in_(order_ids),
                )
            )
        order_items : dict[str, list] = {}
        for r in rows:
            if r.order_id in order_items:
                order_items.get(r.order_id).append({
                    "id" : r.id,
                    "item_name" : r.item_name,
                    "quantity" : r.quantity
                    }
                )
            else:
                order_items[r.order_id] = [{
                    "id" : r.id,
                    "item_name" : r.item_name,
                    "quantity" : r.quantity
                }]

    items = [{   
            "id" : order.id,
            "status" : order.status,
            "payment_status" : order.payment_status,
            "bill_amount" : f"{order.bill_amount:.2f}",
            "created_at" : order.created_at,
            "restaurant" : {
                "id" : order.restaurant_id,
                "name" : order.restaurant.name,
                "address": f"{order.restaurant.address.house} {order.restaurant.address.city} "
                            f"{order.restaurant.address.state} {order.restaurant.address.country}",
                "phone": order.restaurant.address.phone_e164,
            },
            "items" : order_items.get(order.id),
            "return_status" : return_status.get(order.id),
            "has_review" : review_rating.get(order.id),
        }for order in all_orders]

    return {
        "items" : items,
        "total" : total,
        "page" : page,
        "page_size" : page_size,
        "total_page" : total_page
    }

async def cancel_order_service( 
        customer : CurrentCustomer, 
        db : AsyncSession, 
        order_id : str
        ):
    order = await db.scalar(select(Orders).options(
        joinedload(Orders.restaurant).joinedload(Restaurants.address), selectinload(Orders.order_items)).where(
        Orders.id == order_id,
        Orders.customer_id == customer.id
    ))

    if not order:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Order with id {order_id} not found"
        )

    if order.status != OrderStatus.PLACED or order.payment_status == PaymentStatus.REFUNDED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only orders in PLACED status can be cancelled"
        )

    order.status = OrderStatus.CANCELLED
    order.payment_status = PaymentStatus.REFUNDED

    new_payment_ledger = PaymentLedger(
        order_id = order_id,
        entry_type = LedgerEntryType.REFUND,
        amount = order.bill_amount,
        transaction_ref = f"TR-{secrets.token_hex(4).upper()}"
    )

    db.add(new_payment_ledger)


    try:
        await db.flush()
        await db.refresh(order)
        response = await _create_response(
            order = order,
            restaurant=order.restaurant,
            order_items=order.order_items,
            db = db,
            customer=customer
        )
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        print(repr(e.orig))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order can't be canceled. Please try again later")
    except SQLAlchemyError as e:
        await db.rollback()
        print(repr(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to cancel the order")

    

    return response
async def return_request_service(
    payload: CreateReturnRequest,
    customer: CurrentCustomer,
    order_id: str,
    db: AsyncSession,
):
    customer_id = customer.id


    order = await db.scalar(
        select(Orders).where(
            Orders.id == order_id,
            Orders.customer_id == customer_id,
        )
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested order not found for this user",
        )

    if order.status != OrderStatus.DELIVERED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only delivered orders can be returned",
        )

    check_return_table = await db.scalar(
        select(ReturnRequest.id).where(ReturnRequest.order_id == order.id)
    )
    if check_return_table:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A return request already exists for this order",
        )

    new_return_request = ReturnRequest(
        order_id=order.id,
        customer_id=customer_id,
        reason=payload.reason,
        status=ReturnRequestStatus.REQUESTED,
    )
    db.add(new_return_request)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        print(repr(e.orig))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to process return request",
        )
    except SQLAlchemyError as e:
        await db.rollback()
        print(f"Error : {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to return the order",
        )
    
    order = await db.scalar(
        select(Orders)
        .options(
            joinedload(Orders.restaurant).joinedload(Restaurants.address),
            joinedload(Orders.delivery_partner),
            joinedload(Orders.customer),
            selectinload(Orders.order_items),
        )
        .where(Orders.id == order_id)
        .execution_options(populate_existing=True)
    )

    response = await _create_response(
        order=order,
        restaurant=order.restaurant,
        order_items=order.order_items,
        db=db,
        customer=order.customer,
    )

    return response

async def customer_review_service(
        order_id : str,
        customer : CurrentCustomer,
        payload : CreateReview,
        db : AsyncSession
):
    order = await db.scalar(select(
            Orders
        ).options(
            joinedload(Orders.restaurant).joinedload(Restaurants.address),
            selectinload(Orders.order_items)
        ).where(
            Orders.id == order_id,
            Orders.customer_id == customer.id
        ))

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested order not found for this user"
        )

    if order.status != OrderStatus.DELIVERED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= "Only Delivered order can be Reviewed"
        )

    new_review = Review(
        order_id = order.id,
        customer_id = customer.id,
        restaurant_id = order.restaurant_id,
        rating = payload.rating,
        comment = payload.comment
    )

    db.add(new_review)

    try:
        await db.flush()
        await db.commit()
        response = {
            "id" : new_review.id,
            "order_id" : new_review.order_id,
            "rating" : new_review.rating,
            "comment" : new_review.comment,
            "created_at" : new_review.created_at
        }
    except IntegrityError as e:
        await db.rollback()
        print(repr(e.orig))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to add review")
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to review the order")
    
    return response