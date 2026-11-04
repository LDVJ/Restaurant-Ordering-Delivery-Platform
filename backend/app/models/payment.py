from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Enum as SQLEnum, Numeric, func, DateTime, Text
from app.db import Base
from app.enum.orderEnum import LedgerEntryType, ReturnRequestStatus
from datetime import datetime
from app.utilities import generate_id
from decimal import Decimal


class PaymentLedger(Base):
    __tablename__  = "payment_ledger"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    order_id : Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False)
    entry_type : Mapped[LedgerEntryType] = mapped_column(SQLEnum(LedgerEntryType, name = "ledger_entry_type"),nullable=False)
    amount : Mapped[Decimal] = mapped_column(Numeric(10,2), nullable=False)
    transaction_ref : Mapped[str] = mapped_column(String, nullable=False, unique=True)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id : Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_id)
    order_id : Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, unique=True, index=True)
    customer_id : Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    reason : Mapped[str] = mapped_column(Text, nullable=False)
    status : Mapped[ReturnRequestStatus] = mapped_column(SQLEnum(ReturnRequestStatus, name="return_request_status"), nullable=False, default=ReturnRequestStatus.REQUESTED)
    resolved_by : Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=True, index=True)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    resolved_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    customer : Mapped["Users"] = relationship(foreign_keys=[customer_id])
    resolver : Mapped["Users"] = relationship(foreign_keys=[resolved_by])
    order :  Mapped["Orders"] = relationship(foreign_keys=[order_id])
