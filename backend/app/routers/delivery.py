from fastapi import APIRouter, Depends
from app.oauth2 import delivery_only, CurrentDeliveryPartner


router = APIRouter(
    prefix="/delivery",
    dependencies=[Depends(delivery_only)],
    tags=["Delivery_Partner"]
)

@router.get("", response_model=)