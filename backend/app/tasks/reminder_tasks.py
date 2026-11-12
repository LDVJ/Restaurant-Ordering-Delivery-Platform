import logging
from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import AsyncSessionLocal

from app.models.reminder import AdminReminderLogs
from app.models.orders import Orders
from app.enums.orderEnum import OrderStatus

from app.utilities import generate_id

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)


STUCK_MINUTES = 15
CHECK_EVERY_SECONDS = 60
STUCK_STATES = (OrderStatus.PLACED, OrderStatus.ACCEPTED)

scheduler = AsyncIOScheduler(timezone="UTC")

async def create_reminder(
        db : AsyncSession
)-> int:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=STUCK_MINUTES)

    stmt = select(
        Orders.id, Orders.restaurant_id, Orders.status
    ).outerjoin(
        AdminReminderLogs,
        and_(
            AdminReminderLogs.order_id == Orders.id,
            AdminReminderLogs.order_status == Orders.status
        )
    ).where(
        Orders.status.in_(STUCK_STATES),
        Orders.status_updated_at < cutoff,
        AdminReminderLogs.id.is_(None)
    )

    rows = (await db.execute(stmt)).all()

    if not rows:
        return 0

    db.add_all(
        [
            AdminReminderLogs(
                id = generate_id(),
                restaurant_id = row.restaurant_id,
                order_id = row.id,
                order_status = row.status,
                message = f"Order {row.id[-6:]} has been in {row.status} for over {STUCK_MINUTES} minutes",
                is_read = False
            )for row in rows
        ]
    )

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        # print(repr(e.orig))
        logger.warning("Reminder insert conflict, will retry on next run")
        return 0

    return len(rows)

async def run_reminder_check() -> None:
    try:
        async with AsyncSessionLocal() as db:
            created = await create_reminder(db=db)
            if created:
                logger.info("Created %s reminder(s)", created)
    except Exception:
        logger.exception("Reminder check failed")


def start_scheduler():
    scheduler.add_job(
        run_reminder_check,
        "interval",
        seconds=CHECK_EVERY_SECONDS,
        id="order_reminders",
        max_instances=1,
        coalesce=True,
        replace_existing=True
    )

    scheduler.start()

def end_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
