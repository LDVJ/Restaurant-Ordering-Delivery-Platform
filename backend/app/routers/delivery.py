from fastapi import APIRouter, Depends, status, Query
from app.oauth2 import delivery_only, CurrentDeliveryPartner
from app.schemas import (
    AllDeliveryOrderResponse,
    DeliveryOrderResponse,
    UpdateDeliveryStatus
)
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.enums.orderEnum import OrderStatus
from app.services.delivery_service import (
    get_all_delivery_orders_service,
    update_delivery_order_status_service
)


router = APIRouter(
    prefix="/delivery/orders",
    dependencies=[Depends(delivery_only)],
    tags=["Delivery_Partner"]
)

@router.get("", response_model=AllDeliveryOrderResponse, status_code=status.HTTP_200_OK)
async def get_all_delivery_orders(
    dpartner : CurrentDeliveryPartner,
    db : AsyncSession = Depends(get_db),
    page : int = Query(1, ge=1),
    page_size : int = Query(20, ge=1, le=50),
    order_status : OrderStatus = Query(None)
):
    return await get_all_delivery_orders_service(
        dpartner = dpartner,
        db = db,
        page = page,
        page_size = page_size,
        order_status = order_status
    )

@router.post("/{order_id}/status", response_model=DeliveryOrderResponse)
async def update_delivery_order_status(
    dpartner : CurrentDeliveryPartner,
    payload : UpdateDeliveryStatus,
    order_id : str,
    db : AsyncSession = Depends(get_db)
):
    return await update_delivery_order_status_service(
        dpartner = dpartner,
        payload = payload,
        order_id = order_id,
        db  = db
    )