from sqlalchemy.ext.asyncio import AsyncSession
from app.oauth2 import CurrentOwner
from fastapi import HTTPException, status
import math
from app.models.restaurant import Restaurants
from sqlalchemy import select, func
from app.models.reminder import AdminReminderLogs
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


async def _get_owner_restaurant_id(owner : CurrentOwner, db : AsyncSession):
        restaurant_id = await db.scalar(
        select(Restaurants.id).where(Restaurants.owner_id == owner.id)
        )
        if not restaurant_id:
                raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant Not found"
                )

        return restaurant_id


async def list_reminder_service(
        owner: CurrentOwner,
        db : AsyncSession,
        page : int,
        page_size : int,
        unread_only : bool
):
        restaurant_id = await _get_owner_restaurant_id(owner = owner, db = db)

        filters = [AdminReminderLogs.restaurant_id == restaurant_id]
        if unread_only:
               filters.append(AdminReminderLogs.is_read.is_(False))
        
        total = await db.scalar(
               select(func.count()).select_from(AdminReminderLogs).where(*filters)
        ) or 0

        total_pages = math.ceil(total/page_size)

        rows = (await db.execute(select(
               AdminReminderLogs
        ).where(
               *filters
               ).order_by(
                      AdminReminderLogs.created_at.desc(),
                      AdminReminderLogs.id.desc()
                      ).limit(page_size).offset((page -1) * page_size)
                )).scalars().all()

        return {
               "items" : rows,
                "page" : page,
                "total" : total,
                "page_size" : page_size,
                "total_pages" : total_pages
        }


async def mark__reminder_read_service(
        owner : CurrentOwner,
        reminder_id : str,
        db : AsyncSession
):
        restaurant_id = await _get_owner_restaurant_id(owner=owner, db = db)

        reminder = await db.scalar(select(
                AdminReminderLogs
        ).where(
                AdminReminderLogs.id == reminder_id,
                AdminReminderLogs.restaurant_id == restaurant_id
        ))

        if not reminder:
                raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reminder not found"
                )

        if not reminder.is_read:
                reminder.is_read = True
        try: 
                await db.commit()
                await db.refresh(reminder)
        except IntegrityError:
                await db.rollback()
                raise HTTPException(
                        status_code= status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Unable to mark reminder as read"
                )
        except SQLAlchemyError:
                await db.rollback()
                raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Unable to send reponse"
                )

        return reminder


