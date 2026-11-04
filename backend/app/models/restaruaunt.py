from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, func, Boolean, text, Numeric, CheckConstraint
from datetime import datetime
from app.utilities import generate_id
from decimal import Decimal

class Restaurants(Base):
    __tablename__="restaurants"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    owner_id : Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    name : Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    description : Mapped[str] = mapped_column(String(300), nullable=False)
    cuisine : Mapped[str] = mapped_column(String(100), nullable=False)
    country_code : Mapped[str] = mapped_column(String(5), nullable=False)
    phone_number : Mapped[str] = mapped_column(String(20), nullable=False)
    phone_e164 : Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    is_active : Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("true"))    
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True,onupdate=func.now())

    address : Mapped["RestaurantAddress"] = relationship(back_populates="restaurant",uselist=False)
    menu_items : Mapped[list["MenuItems"]] = relationship(back_populates="restaurant")
    owner : Mapped["Users"] = relationship()

class RestaurantAddress(Base):
    __tablename__ = "restaurant_address"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    restaurant_id : Mapped[str] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    house : Mapped[str] = mapped_column(String(100), nullable=False)
    city : Mapped[str] = mapped_column(String(100), nullable=False)
    state : Mapped[str] = mapped_column(String(100), nullable=False)
    country : Mapped[str] = mapped_column(String(100), nullable=False)
    country_code : Mapped[str] = mapped_column(String(5), nullable=False)
    phone_number : Mapped[str] = mapped_column(String(20), nullable=False)
    phone_e164 : Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    restaurant : Mapped["Restaurants"] = relationship(back_populates="address")

class MenuItems(Base):
    __tablename__ = "menu_items"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    restaurant_id : Mapped[str] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    name : Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    description : Mapped[str] = mapped_column(String(200), nullable=False)
    price : Mapped[Decimal] = mapped_column(Numeric(10,2), nullable=False)
    is_available : Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    restaurant : Mapped["Restaurants"] = relationship(back_populates="menu_items")

    __table_args__ = (
        CheckConstraint(
            "price > 0", name="validate_menu_item"
        ),
    )

