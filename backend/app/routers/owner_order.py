from fastapi import APIRouter, Depends, status
from app.oauth2 import owner_only, CurrentOwner
from app.schemas import OwnerOrderResponse
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.owner_order_services import (
    get_owner_orders_service
    )


router = APIRouter(
    tags=["Restaurant_Owner_Orders"],
    dependencies=[Depends(owner_only)],
    prefix="/owner/order"
)

@router.get("",response_model=OwnerOrderResponse, status_code =  status.HTTP_200_OK)
async def get_owner_orders(owner : CurrentOwner, db : AsyncSession = Depends(get_db)):
    return await get_owner_orders_service(
        owner = owner,
        db = db
    )