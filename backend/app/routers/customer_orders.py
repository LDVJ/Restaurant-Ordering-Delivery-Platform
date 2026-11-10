from fastapi import APIRouter, HTTPException, status, Depends
from app.oauth2 import customer_only, CurrentCustomer
from app.schemas import (
    OrderResponse,
    CreateOrder
)
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.customer_order_services import create_order_service

router = APIRouter(
    tags=["Customer Orders"],
    dependencies=[Depends(customer_only)],
    prefix="/orders"
)

@router.post("",response_model=OrderResponse, status_code= status.HTTP_200_OK)
async def create_order(
    payload : CreateOrder,
    customer : CurrentCustomer,
    db : AsyncSession = Depends(get_db)
):
    return await create_order_service(payload = payload, customer = customer, db = db)