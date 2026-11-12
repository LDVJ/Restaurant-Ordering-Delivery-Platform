from fastapi import APIRouter, Depends, status, Query
from app.oauth2 import owner_only, CurrentOwner
from app.schemas import ReminderPage, ReminderOut
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.owner_reminder_services import (
    list_reminder_service,
    mark__reminder_read_service
)


router = APIRouter(
    tags=["Owner-Reminder"],
    dependencies=[Depends(owner_only)],
    prefix="/owner/reminders"
)

@router.get("", response_model=ReminderPage,status_code = status.HTTP_200_OK)
async def list_reminders(
    owner: CurrentOwner,
    db : AsyncSession = Depends(get_db),
    page : int = Query(1, ge=1),
    unread_only : bool = Query(False),
    page_size : int = Query(20,ge=1, le=50)
):
    return await list_reminder_service(
        owner = owner,
        db = db,
        page = page,
        unread_only = unread_only,
        page_size = page_size
    )


@router.post("/{reminder_id}/read", response_model=ReminderOut)
async def mark_reminder_read(
    reminder_id : str,
    owner : CurrentOwner,
    db : AsyncSession = Depends(get_db)
):
    return await mark__reminder_read_service(
        reminder_id = reminder_id,
        owner = owner,
        db = db
    )