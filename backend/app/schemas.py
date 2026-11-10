import re
from decimal import Decimal
from datetime import datetime
from pydantic import (
    BaseModel, ConfigDict, EmailStr, Field,
    computed_field, field_validator, model_validator, StringConstraints
)
from typing import Annotated
from app.enums.userEnum import UsersRole
from app.enums.orderEnum import OrderStatus, PaymentStatus, ReturnRequestStatus
from string import capwords
from typing import Text

CountryCode = Annotated[str, StringConstraints(pattern=r"^\+\d{1,4}$")]
PhoenNumber = Annotated[str, StringConstraints(pattern=r"^\d{6,15}$")]


class TokenData(BaseModel):
    id: str


class RegisterRequest(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True
    )

    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UsersRole
    country_code: CountryCode
    phone_number: PhoenNumber
    
    @field_validator("name", mode="before")
    @classmethod
    def normalize_password(cls, value : EmailStr) -> EmailStr:
        return value.strip() if isinstance(value, str) else value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Password must contain at least one special character")
        return value

    @model_validator(mode="after")
    def validate_total_phone_length(self):
        if len(self.country_code) - 1 + len(self.phone_number) > 15:
            raise ValueError("Full phone number can have at most 15 digits (E.164)")
        return self

    @computed_field
    @property
    def phone_e164(self) -> str:
        return f"{self.country_code}{self.phone_number}"



class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UsersRole
    country_code: CountryCode
    phone_number: PhoenNumber
    phone_e164: str

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# class AuthenticateUser(BaseModel):
#     email : EmailStr
#     password : str

#     @field_validator("email", mode="before")
#     @classmethod
#     def normalize_email(cls, value : EmailStr) -> EmailStr:
#         return value.lower().strip() if isinstance(value, str) else value

#     @field_validator("password", mode="before")
#     @classmethod
#     def normalize_password(cls, value : EmailStr) -> EmailStr:
#         return value.strip() if isinstance(value, str) else value


class CreateRestaurantAddress(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True
    )

    house : str
    city : str
    state : str
    country : str
    country_code: CountryCode
    phone_number: PhoenNumber

    @computed_field
    @property
    def phone_e164(self) -> str:
        return f"{self.country_code}{self.phone_number}"

class CreateRestaurant(BaseModel):

    model_config = ConfigDict(
        str_strip_whitespace=True
    )

    name : str = Field(max_length=100)
    description : str = Field(max_length=250)
    cuisine : str
    country_code: CountryCode
    phone_number: PhoenNumber

    address : CreateRestaurantAddress


    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, value : str):
        return value.strip()


    @computed_field
    @property
    def phone_e164(self) -> str:
        return f"{self.country_code}{self.phone_number}"

    @field_validator("cuisine", mode="before")
    @classmethod
    def normalize_cuisine(cls, value):
        return capwords(value) if isinstance(value, str) else value

class CreateMenuItem(BaseModel):
    name : str
    description : str
    price : Decimal = Field(gt=0)
    is_available : bool

    model_config = ConfigDict(
        str_strip_whitespace=True
    )


class RestaurantAddResponse(BaseModel):
    id : str
    restaurant_id : str
    house : str
    city : str
    state : str
    country : str
    phone_e164 : str
    created_at : datetime
    updated_at : datetime | None = None


    model_config = ConfigDict(
            from_attributes=True
        )

class RestaurantResponse(BaseModel):
    id : str
    owner_id : str
    name : str = Field(max_length=100)
    description : str = Field(max_length=250)
    cuisine : str
    phone_e164 : str
    created_at : datetime
    updated_at : datetime | None = None

    address : RestaurantAddResponse

    model_config = ConfigDict(
        from_attributes=True
    )

class OwnerMenuItem(CreateMenuItem):
    id : str
    created_at : datetime
    updated_at : datetime | None= None

    model_config = ConfigDict(
            from_attributes=True
        )

class UpdateRestaurantAdress(BaseModel):

    model_config = ConfigDict(
        str_strip_whitespace=True
    )
    
    house : str 
    city : str 
    state : str
    country : str 
    country_code: CountryCode
    phone_number: PhoenNumber

    @computed_field
    @property
    def phone_e164(self) -> str:
        if self.phone_number and self.country_code:
            return f"{self.country_code}{self.phone_number}"
        return None

class UpdateRestaurant(BaseModel):

    model_config = ConfigDict(
        str_strip_whitespace=True
    )

    name : str = Field(min_length=2, max_length=100) 
    description : str = Field(min_length=2, max_length=250)
    cuisine : str = Field(min_length=2, max_length=250)
    country_code: CountryCode
    phone_number: PhoenNumber

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, value : str):
        if value is None:
            return value
        return value.strip()

    @computed_field
    @property
    def phone_e164(self) -> str:
        if self.phone_number and self.country_code:
            return f"{self.country_code}{self.phone_number}"
        return None


class CustomerRestaurantList(BaseModel):

    model_config =  ConfigDict(from_attributes=True)

    id : str
    name : str
    description : str 
    cuisine : str
    city : str
    avg_rating : float | None = Field(default=None, ge=0, le=5)
    review_count : int = 0

class CustomerRestaurantResponse(BaseModel):
    items : list[CustomerRestaurantList]
    total : int 
    page : int 
    page_size : int 
    total_pages : int 

    model_config = ConfigDict(from_attributes=True)

class CustomerRestaurantInfoResponse(BaseModel):
    id : str
    name : str
    description : str
    cuisine : str
    city : str
    address : str
    avg_rating : float | None = None
    review_count : int = 0

class MenuItems(CreateMenuItem):
    id : str

class CustomerMenuItemsResponse(BaseModel):
    items : list[MenuItems]
    total : int
    page : int
    page_size : int
    total_pages : int


class OwnerMenuItemsResponse(BaseModel):
    items : list[OwnerMenuItem]
    total : int
    page : int
    page_size : int
    total_pages : int    

class UpdateMenuitem(BaseModel):
    name : str | None = Field(default=None, min_length=1, max_length=100)
    description : str | None = Field(default=None, min_length=1, max_length=200)
    price : Decimal | None = Field(default= None, gt=0, max_digits=7, decimal_places=2)
    is_available : bool | None = None

    model_config = ConfigDict(str_strip_whitespace=True)

    @model_validator(mode="after")
    def reject_empty_or_null(self):
        sent = self.model_fields_set
        if not sent:
            raise ValueError("Send at least one field to update")
        for field in sent:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self

class CreateUserAddress(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    house : str = Field(min_length=5, max_length=100)
    city : str = Field(min_length=3, max_length=100)
    state : str = Field(min_length=3, max_length=100)
    country : str = Field(min_length=3, max_length=100)
    country_code: CountryCode
    phone_number: PhoenNumber

    @computed_field
    @property
    def phone_e164(self) -> str:
        return f"{self.country_code}{self.phone_number}"

class UserAddress(CreateUserAddress):

    id : str
    created_at : datetime
    updated_at : datetime | None = None
    is_default : bool

class UserAddressResponse(BaseModel):

    user_id : str
    addresses : list[UserAddress]

    model_config = ConfigDict(
        from_attributes=True
    )


class UpdateUserAddress(BaseModel):
    house : str | None = Field(default=None, min_length=5, max_length=100)
    city : str | None = Field(default=None, min_length=3, max_length=100)
    state : str | None = Field(default=None, min_length=3, max_length=100)
    country : str | None = Field(default=None, min_length=3, max_length=100)
    country_code: CountryCode | None = None
    phone_number: PhoenNumber | None = None

    @model_validator(mode="after")
    def reject_empty_or_null(self):
        sent = self.model_fields_set
        if not sent:
            raise ValueError("Send at least one field to update")
        for field in sent:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self
    

class UpdateUser(BaseModel):
    name : str 
    country_code : CountryCode
    phone_number : PhoenNumber

    @computed_field
    @property
    def phone_e164(self) -> str:
        return f"{self.country_code}{self.phone_number}"

# class OrderRestaurant(BaseModel):
#     id : str
#     name : str
#     address : str
#     phone : str

# class OrderItemResponse(BaseModel):
#     item_name : str
#     quantity : int

# class CreateOrderItems(BaseModel):
#     restaurant_id : str
#     status : OrderStatus = OrderStatus.PLACED
#     payment_status : PaymentStatus = PaymentStatus.MOCK_PAID
#     bill_amount : Decimal
#     delivery_address : str
#     contact_phone : str = Field(min_length=6, max_length=15)

# class CreateReview(BaseModel):
#     order_id : str
#     restaurant_id : str
#     rating : int = Field(ge=1, le=5)
#     commennt : Text


# class Orders(CreateOrderItems):
#     id : str
#     created_at : datetime
#     status_updated_at : datetime
#     customer_name : str
#     restaurant : OrderRestaurant
#     items : list[OrderItemResponse]

# # class DeliverPartnerResponse(BaseModel):

class CreateOrderItem(BaseModel):

    model_config = ConfigDict(
        from_attributes= True
    )

    menu_item_id : str
    quantity : int = Field(ge=1)

class CreateOrder(BaseModel):

    model_config = ConfigDict(
        from_attributes= True
    )

    restaurant_id : str
    delivery_address : str = Field(min_length=5, max_length=500)
    contact_phone : str = Field(min_length=6, max_length=15)
    items : list[CreateOrderItem]

class CustomerOrderItemResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id : str
    item_name :str 
    quantity : int

class OrderRestaurant(BaseModel):
    id : str
    name : str
    address : str 
    phone :  str 

    model_config = ConfigDict(
        from_attributes=True
    )

class OrderUserInfo(BaseModel):
    id : str
    name : str
    phone : str

class OrderResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id : str
    status : OrderStatus
    payment_status : PaymentStatus
    bill_amount : str
    created_at : datetime
    status_updated_at : datetime | None = None
    delivered_at : datetime | None = None
    delivery_address : str 
    contact_phone : str 
    restaurant : OrderRestaurant
    items : list[CustomerOrderItemResponse]
    # customer : OrderUserInfo 
    delivery_partner : UserResponse | None = None
    review : Decimal | None
    return_request : ReturnRequestStatus | None = None

