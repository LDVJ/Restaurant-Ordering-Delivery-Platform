from fastapi import APIRouter, Depends, Query, status
from app.oauth2 import CurrentOwner, owner_only
from app.schemas import (
    OwnerOrderReturn,
    AllOwnerOrderReturnsResponse,
    UpdateReturnStatus
)
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.owner_order_return_services import(
    get_all_return_orders_service,
    update_return_status_service
)
from app.enums.orderEnum import ReturnRequestStatus


router = APIRouter(
    tags=["Owner-Order-Return"],
    dependencies=[Depends(owner_only)],
    prefix="/owner/returns"
)


@router.get("",response_model=AllOwnerOrderReturnsResponse, status_code=status.HTTP_200_OK)
async def get_all_return_orders(
    owner : CurrentOwner,
    status : ReturnRequestStatus = Query(None),
    db : AsyncSession = Depends(get_db),
    page : int = Query(1, ge=1),
    page_size : int = Query(20, ge=1, le=50)
):
    return await get_all_return_orders_service(
        owner = owner,
        db = db,
        page = page,
        page_size = page_size,
        request_status = status
    )

@router.post("/{return_id}/status", response_model=OwnerOrderReturn, status_code=status.HTTP_200_OK)
async def update_return_status(
    return_id : str,
    owner : CurrentOwner,
    payload : UpdateReturnStatus,
    db : AsyncSession = Depends(get_db)
):
    return await update_return_status_service(
        return_id = return_id,
        owner = owner,
        payload = payload,
        db = db
    )