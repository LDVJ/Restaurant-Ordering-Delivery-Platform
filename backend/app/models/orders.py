from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base
from sqlalchemy import String, Text, func, Enum as SQLEnum, ForeignKey,  Numeric, DateTime, Integer, CheckConstraint
from app.enum.orderEnum import OrderStatus, PaymentStatus
from datetime import datetime
from app.utilities import generate_id
from decimal import Decimal


class Orders(Base):
    __tablename__ = "orders"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    customer_id : Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    restaurant_id : Mapped[str] = mapped_column(ForeignKey("restaurants.id", ondelete="RESTRICT"), nullable=False, index=True)
    delivery_partner_id : Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=True, index=True)
    status : Mapped[OrderStatus] =  mapped_column(SQLEnum(OrderStatus, name="order_status"), default=OrderStatus.PENDING_PAYMENT)
    payment_status : Mapped[PaymentStatus] = mapped_column(SQLEnum(PaymentStatus, name="payment_status"), nullable=False, default=PaymentStatus.PENDING)
    bill_amount : Mapped[Decimal] = mapped_column(Numeric(10,2), nullable=False)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())
    delivered_at : Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    delivery_address_text: Mapped[str] = mapped_column(String(500), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    status_updated_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    order_items : Mapped[list["OrderItems"]] = relationship(back_populates="order_info")
    customer : Mapped["Users"] = relationship(back_populates="orders", foreign_keys=[customer_id])

class OrderItems(Base):
    __tablename__ = "order_items"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    order_id : Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True)
    menu_item_id : Mapped[str] = mapped_column(ForeignKey("menu_items.id", ondelete="RESTRICT"), nullable=False, index=True)
    item_name : Mapped[str] = mapped_column(String(100), nullable=False)
    unit_price : Mapped[Decimal] = mapped_column(Numeric(10,2), nullable=False)
    quantity : Mapped[int] = mapped_column(Integer, nullable=False)

    order_info : Mapped["Orders"] = relationship(back_populates="order_items")

class Review(Base):
    __tablename__ = "reviews"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    order_id : Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    customer_id : Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    restaurant_id : Mapped[str] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    rating : Mapped[int] = mapped_column(nullable=False)
    comment : Mapped[str] = mapped_column(Text, nullable=True)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    __table_args__ = (
        CheckConstraint(
            "rating BETWEEN 1 AND 5",
            name="validating_rating_constraint"
        ),
    )

