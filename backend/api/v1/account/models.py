from pydantic import BaseModel, field_validator
from typing import Optional
from users.models import CustomUser
from rental_ms import settings
from datetime import datetime
import re
import os


class TokenAuth(BaseModel):

    access_token: str
    token_type: Optional[str] = "bearer"

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "rms_27b9d79erc245r44b9rba2crd2273b5cbb71",
                "token_type": "bearer",
            }
        }


class ResetPassword(BaseModel):
    username: str
    new_password: str
    token: str

    @field_validator("new_password")
    def validate_new_password(new_password):
        if not re.match(
            r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,}$",
            new_password,
        ):
            raise ValueError(
                "Password must be at least 8 characters long, include an uppercase letter, "
                "a lowercase letter, a number, and a special character."
            )
        return new_password

    @field_validator("token")
    def validate_token(token):
        if not re.match(r"[A-Z\d]{6,}", token):
            raise ValueError("Invalid token")
        return token

    class Config:
        json_schema_extra = {
            "example": {
                "username": "Smartwa",
                "new_password": "_Cljsuw376j$",
                "token": "0IJ4826L",
            }
        }


class EditablePersonalData(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    occupation: Optional[str] = None
    phone_number: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    email: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "occupation": "Doctor",
                "phone_number": "+1234567890",
                "emergency_contact_number": "+1234567890",
                "email": "john.doe@example.com",
            }
        }


class UserProfile(EditablePersonalData):
    username: str
    gender: CustomUser.UserGender
    account_balance: float
    profile: Optional[str] = None
    is_staff: Optional[bool] = False
    date_joined: datetime

    @field_validator("profile")
    def validate_file(value):
        if value:
            return os.path.join(settings.MEDIA_URL, value)
        return value

    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "gender": "M",
                "occupation": "Doctor",
                "phone_number": "+1234567890",
                "emergency_contact_number": "+1234567890",
                "email": "john.doe@example.com",
                "username": "johndoe",
                "account_balance": 1244,
                "profile": "/media/custom_user/profile.jpg",
                "is_staff": False,
                "date_joined": "2023-01-01T00:00:00",
            }
        }


class PaymentAccountDetails(BaseModel):
    name: str
    paybill_number: str
    account_number: str
    details: Optional[str]

    class Config:
        json_schema_extra = {
            "example": {
                "name": "M-PESA",
                "paybill_number": "123456",
                "account_number": "78901234",
                "details": "Main business account",
            }
        }


class SendMPESAPopupTo(BaseModel):
    phone_number: str
    amount: int

    class Config:
        json_schema_extra = {
            "example": {"phone_number": "+1234567890", "amount": 100.0}
        }
