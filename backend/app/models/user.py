from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime, ForeignKey, Boolean
from app.enums.userEnum import UsersRole
from sqlalchemy import Enum as SQLEnum, func, text, Index
from datetime import datetime
from app.utilities import generate_id

class Users(Base):
    __tablename__ = "users"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    name : Mapped[str] = mapped_column(String(100), nullable=False)
    email : Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    hashed_password : Mapped[str] = mapped_column(String, nullable=False)
    role : Mapped[UsersRole] = mapped_column(SQLEnum(UsersRole, name="users_role"), nullable=False)
    country_code : Mapped[str] = mapped_column(String(5), nullable=False)
    phone_number : Mapped[str] = mapped_column(String(20), nullable=False)
    phone_e164 : Mapped[str] = mapped_column(String(20), nullable=False)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at : Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    addresses : Mapped[list["UserAddress"]] = relationship(back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    orders : Mapped[list["Orders"]] = relationship(back_populates="customer", foreign_keys="Orders.customer_id")


class UserAddress(Base):
    __tablename__ = "user_address"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    user_id : Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    is_default : Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"), nullable=False)
    house : Mapped[str] = mapped_column(String(100), nullable=False)
    city : Mapped[str] = mapped_column(String(100), nullable=False)
    state : Mapped[str] = mapped_column(String(100), nullable=False)
    country : Mapped[str] = mapped_column(String(100), nullable=False)
    country_code : Mapped[str] = mapped_column(String(5), nullable=False)
    phone_number : Mapped[str] = mapped_column(String(20), nullable=False)
    phone_e164 : Mapped[str] = mapped_column(String(20), nullable=False)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at : Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    user : Mapped["Users"] = relationship(back_populates="addresses")

    __table_args__ = (
        Index(
            "unique_default_address",
            "user_id",
            unique=True,
            postgresql_where=text("is_default=true")
        ),
    )