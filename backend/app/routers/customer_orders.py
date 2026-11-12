from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.oauth2 import customer_only, CurrentCustomer
from app.schemas import (
    CustomerOrderResponse,
    CreateOrder,
    CustomerAllOrdersResponse,
    CreateReturnRequest,
    CreateReview,
    ReviewResponse
)
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.customer_order_services import (
    create_order_service,
    get_order_info_services,
    get_all_orders_services,
    cancel_order_service,
    return_request_service,
    customer_review_service
)
from app.enums.orderEnum import OrderStatus
from datetime import datetime


router = APIRouter(
    tags=["Customer Orders"],
    dependencies=[Depends(customer_only)],
    prefix="/orders"
)

@router.post("",response_model=CustomerOrderResponse, status_code= status.HTTP_200_OK)
async def create_order(
    payload : CreateOrder,
    customer : CurrentCustomer,
    db : AsyncSession = Depends(get_db)
):
    return await create_order_service(payload = payload, customer = customer, db = db)

@router.get("", response_model=CustomerAllOrdersResponse, status_code=status.HTTP_200_OK)
async def get_all_orders(
    customer : CurrentCustomer, 
    db : AsyncSession = Depends(get_db), 
    page : int = Query(1, ge=1),
    page_size : int = Query(20, le=50),
    status : OrderStatus | None = None,
    date_from : datetime | None = None,
    date_to : datetime | None = None
):
    return await get_all_orders_services(
        customer = customer,
        db = db,
        page = page,
        page_size = page_size,
        status = status,
        date_from = date_from,
        date_to = date_to
    )

@router.get("/{order_id}",response_model=CustomerOrderResponse, status_code=status.HTTP_200_OK)
async def get_order_info(
    customer : CurrentCustomer,
    order_id : str,
    db : AsyncSession = Depends(get_db)
):
    return await get_order_info_services(
        customer = customer,
        order_id = order_id,
        db = db
    )

@router.post("/{order_id}/cancel", response_model= CustomerOrderResponse, status_code = status.HTTP_200_OK)
async def cancel_order(
    order_id : str,
    customer : CurrentCustomer,
    db : AsyncSession = Depends(get_db),
):
    return await cancel_order_service(
        order_id = order_id,
        customer = customer,
        db = db
    )

@router.post("/{order_id}/return", response_model=CustomerOrderResponse, status_code=status.HTTP_200_OK)
async def return_request(
    order_id : str,
    customer : CurrentCustomer,
    payload : CreateReturnRequest,
    db : AsyncSession = Depends(get_db)
):
    return await return_request_service(
        order_id = order_id,
        customer = customer,
        payload = payload,
        db =  db
    )

@router.post("/{order_id}/review", response_model=ReviewResponse, status_code=status.HTTP_200_OK)
async def customer_review(
    order_id : str,
    customer : CurrentCustomer,
    payload : CreateReview,
    db : AsyncSession = Depends(get_db)
):
    return await customer_review_service(
        order_id = order_id,
        customer = customer,
        payload = payload,
        db = db
    )