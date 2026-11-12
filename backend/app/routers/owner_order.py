from fastapi import APIRouter, Depends, status, Query
from app.oauth2 import owner_only, CurrentOwner
from app.schemas import(
    OwnerOrderResponse,
    AllOwnerOrderResponse,
    AssignDeliveryPartnerID,
    UpdateStatus
    )
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.enums.orderEnum import OrderStatus
from app.services.owner_order_services import (
    get_all_owner_orders_service,
    get_owner_order_service,
    update_order_status_service,
    assign_delivery_partner_service
    )


router = APIRouter(
    tags=["Restaurant_Owner_Orders"],
    dependencies=[Depends(owner_only)],
    prefix="/owner/orders"
)

@router.get("",response_model=AllOwnerOrderResponse, status_code =  status.HTTP_200_OK)
async def get_all_owner_orders(
    owner : CurrentOwner, 
    status : OrderStatus | None = None,
    db : AsyncSession = Depends(get_db), 
    page : int | None= Query(1, ge=1),
    page_size : int | None = Query(20, le=50)

):
    return await get_all_owner_orders_service(
        owner = owner,
        db = db,
        page = page,
        page_size = page_size,
        order_status = status
    )

@router.get("/{order_id}", response_model=OwnerOrderResponse)
async def get_owner_order(
    owner : CurrentOwner,
    order_id : str,
    db : AsyncSession = Depends(get_db)
):
    return await get_owner_order_service(
        owner = owner,
        order_id = order_id,
        db = db
    )
@router.post("/{order_id}/assign", response_model=OwnerOrderResponse)
async def assign_delivery_partner(
    order_id : str,
    owner : CurrentOwner,
    payload : AssignDeliveryPartnerID,
    db : AsyncSession = Depends(get_db)
):
    return await assign_delivery_partner_service(
        order_id = order_id,
        owner= owner,
        payload = payload,
        db = db
    )


@router.post("/{order_id}/status", response_model=OwnerOrderResponse, status_code= status.HTTP_200_OK)
async def update_order_status(
    owner : CurrentOwner,
    order_id : str,
    payload : UpdateStatus,
    db : AsyncSession = Depends(get_db),
):
    return await update_order_status_service(
        owner = owner,
        order_id = order_id,
        order_status = payload.status,
        db = db
    )

