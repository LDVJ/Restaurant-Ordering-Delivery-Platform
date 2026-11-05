import re
import uuid  # only if your ids are UUIDs

from pydantic import (
    BaseModel, ConfigDict, EmailStr, Field,
    computed_field, field_validator, model_validator,
)

from app.enums.userEnum import UsersRole


class TokenData(BaseModel):
    id: str


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UsersRole
    country_code: str
    phone_number: str

    @field_validator("country_code")
    @classmethod
    def validate_country_code(cls, value: str) -> str:
        if not re.fullmatch(r"\+\d{1,4}", value):
            raise ValueError("Country code must start with '+' followed by 1-4 digits")
        return value

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        if not re.fullmatch(r"\d{6,15}", value):
            raise ValueError("Phone number must contain only digits (6-15 digits)")
        return value

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
    country_code: str
    phone_number: str
    phone_e164: str

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AuthenticateUser(BaseModel):
    email : EmailStr
    password : str

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value : EmailStr) -> EmailStr:
        return value.lower().strip() if isinstance(value, str) else value

    @field_validator("password", mode="before")
    @classmethod
    def normalize_password(cls, value : EmailStr) -> EmailStr:
        return value.strip() if isinstance(value, str) else value
