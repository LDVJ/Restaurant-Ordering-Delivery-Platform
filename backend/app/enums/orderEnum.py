from enum import Enum

class OrderStatus(str, Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT" 
    PLACED = "PLACED"
    ACCEPTED = "ACCEPTED"
    PREPARING = "PREPARING"
    READY = "READY"
    ASSIGNED = "ASSIGNED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    MOCK_PAID = "MOCK_PAID"
    REFUNDED = "REFUNDED"

class LedgerEntryType(str, Enum):
    PAYMENT = "PAYMENT"
    REFUND = "REFUND"

class ReturnRequestStatus(str, Enum):
   REQUESTED =  "REQUESTED"
   APPROVED = "APPROVED"
   REJECTED = "REJECTED"