from sqlalchemy.ext.asyncio import AsyncSession
from app.oauth2 import CurrentOwner
from app.models.restaurant import Restaurants
from sqlalchemy import select

async def get_owner_orders_service(owner : CurrentOwner, db : AsyncSession):
    restaurant_id = await db.scalar(select(Restaurants.id).where(Restaurants.owner_id == owner.id))
    
