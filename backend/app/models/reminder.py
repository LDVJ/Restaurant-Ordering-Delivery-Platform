from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, ForeignKey, Text, Boolean, text, func, String, Enum as SQLEnum, UniqueConstraint
from datetime import  datetime
from app.utilities import generate_id
from app.enums.orderEnum import OrderStatus

class AdminReminderLogs(Base):
    __tablename__  = "admin_reminder_logs"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    restaurant_id : Mapped[str] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id : Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    order_status : Mapped[OrderStatus] = mapped_column(SQLEnum(OrderStatus, name= "order_status"), nullable=False, default=OrderStatus.ACCEPTED)
    message : Mapped[str] =  mapped_column(Text, nullable=False)
    is_read : Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"))
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    

    __table_args__ = (
        UniqueConstraint(
            "order_id",
            "order_status",
            name="unique_reminder_status_and_order_based"
        ),
    )
