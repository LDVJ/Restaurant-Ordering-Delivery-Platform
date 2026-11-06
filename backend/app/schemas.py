import re
from decimal import Decimal
from datetime import datetime
from pydantic import (
    BaseModel, ConfigDict, EmailStr, Field,
    computed_field, field_validator, model_validator, StringConstraints
)
from typing import Annotated
from app.enums.userEnum import UsersRole

CountryCode = Annotated[str, StringConstraints(pattern=r"\+\d{1,4}$")]
PhoenNumber = Annotated[str, StringConstraints(pattern=r"\d{6,15}$")]


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

class MenuItemResponse(CreateMenuItem):
    id : str
    restaurant_id : str
    created_at : datetime
    updated_at : datetime

    model_config = ConfigDict(
            from_attributes=True
        )

class UpdateRestaurantAdress(BaseModel):

    model_config = ConfigDict(
        str_strip_whitespace=True
    )
    
    house : str | None
    city : str | None
    state : str | None
    country : str | None
    country_code: CountryCode | None
    phone_number: PhoenNumber | None

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

    id : str
    name : str | None = Field(max_length=100) 
    description : str | None = Field(max_length=250)
    cuisine : str | None = None
    country_code: CountryCode | None = None
    phone_number: PhoenNumber | None = None

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