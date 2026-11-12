from sqlalchemy.ext.asyncio import AsyncSession
from app.oauth2 import CurrentOwner
from app.models.payment import ReturnRequest, PaymentLedger
from app.models.orders import Orders
from app.models.restaurant import Restaurants
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
import math
from app.enums.orderEnum import ReturnRequestStatus, OrderStatus, LedgerEntryType
from app.schemas import UpdateReturnStatus
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


async def get_all_return_orders_service(
        owner : CurrentOwner,
        db : AsyncSession,
        page : int,
        page_size : int,
        request_status : ReturnRequestStatus | None
):
    restaurant = await db.scalar(select(
        Restaurants
    ).where(
        Restaurants.owner_id == owner.id
    ))

    if not restaurant:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )

    filters= [Orders.restaurant_id == restaurant.id]
    if request_status:
        filters.append(ReturnRequest.status == request_status)

    stmt = select(
        func.count(ReturnRequest.id)
    ).select_from(ReturnRequest).join(
        Orders, Orders.id == ReturnRequest.order_id
    ).where(
        *filters
    )

    total = await db.scalar(stmt) or 0

    total_pages = math.ceil(total/page_size) 

    all_return_requests = (await db.execute(
        select(ReturnRequest, Orders.bill_amount).options(
            joinedload(ReturnRequest.customer)
        ).join(
            Orders, Orders.id == ReturnRequest.order_id
        ).where(
            *filters
        ).order_by(ReturnRequest.created_at.desc(), ReturnRequest.id.desc()
                   ).limit(page_size).offset((page - 1)*page_size)
    )).all()


    items = [{
        "id" : request.id,
        "order_id" : request.order_id,
        "customer_name" : request.customer.name,
        "reason" : request.reason,
        "status" : request.status,
        "created_at" : request.created_at,
        "resolved_at" : request.resolved_at,
        "bill_amount" : f"{bill_amount:.2f}"
    }for request, bill_amount in all_return_requests
    ]

    return {
        "items" : items,
        "page" : page,
        "page_size" : page_size,
        "total" : total,
        "total_pages" : total_pages
    }

async def update_return_status_service(
        owner : CurrentOwner,
        return_id : str,
        payload : UpdateReturnStatus,
        db : AsyncSession
):

    if payload.status not in (ReturnRequestStatus.APPROVED, ReturnRequestStatus.REJECTED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="status must be APPROVED AND REJECTED"
        )
    
    return_record = await db.scalar(select(
        ReturnRequest
    ).where(
        ReturnRequest.id == return_id
    ))

    if not return_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Return record not found"
        )

    owner_order = await db.scalar(
        select(Orders).join(
            Restaurants, Restaurants.id == Orders.restaurant_id
        ).where(
            Orders.id == return_record.order_id,
            Restaurants.owner_id == owner.id
        )
    )

    if not owner_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found for this request"
        )

    ledger_detail = await db.scalar(select(PaymentLedger).where(
        PaymentLedger.order_id == owner_order.id,
        PaymentLedger.entry_type == LedgerEntryType.PAYMENT
    ))

    if not ledger_detail:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "Ledger record not found for this order"
        )


    if return_record.status == ReturnRequestStatus.REQUESTED and owner_order.status == OrderStatus.DELIVERED:
        return_record.resolved_at = datetime.now(timezone.utc)
        if payload.status == ReturnRequestStatus.APPROVED:
            return_record.status = ReturnRequestStatus.APPROVED
            ledger_detail.entry_type = LedgerEntryType.REFUND
        elif payload.status == ReturnRequestStatus.REJECTED:
            return_record.status = ReturnRequestStatus.REJECTED

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Return request status is not Requested"
        )

    try:
        await db.commit()
        await db.refresh(owner_order)

    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail= "Unable to update status. Please try again later"
        )
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Unable to send response. Please refresh the page"
        )

    request_info = await db.scalar(select(
        ReturnRequest
        ).options(
            joinedload(ReturnRequest.customer),
            joinedload(ReturnRequest.order)
            ).where(
                ReturnRequest.order_id == owner_order.id
            )
    )

    response = {
        "id" : request_info.id,
        "order_id" : request_info.order_id,
        "customer_name" : request_info.customer.name,
        "reason" : request_info.reason,
        "status" : request_info.status,
        "created_at" : request_info.created_at,
        "resolved_at" : request_info.resolved_at,
        "bill_amount" : f"{request_info.order.bill_amount:.2f}"
    }
    
    return response