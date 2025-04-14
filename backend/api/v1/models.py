from pydantic import BaseModel, Field, field_validator, Field, EmailStr, HttpUrl
from typing import Optional, Any
from datetime import datetime, date
from rental_ms.settings import MEDIA_URL
from external.models import ServiceFeedback
from rental.models import Service, Appointment, Branch
from users.models import CustomUser
from os import path
import re


class TokenAuth(BaseModel):
    """
    - `access_token` : Token value.
    - `token_type` : bearer
    """

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
                "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
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
    email: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "occupation": "Doctor",
                "phone_number": "+1234567890",
                "email": "john.doe@example.com",
            }
        }


class Profile(EditablePersonalData):
    username: str
    gender: CustomUser.UserGender
    account_balance: float
    profile: Optional[str] = None
    is_staff: Optional[bool] = False
    date_joined: datetime

    @field_validator("profile")
    def validate_file(value):
        if value:
            return path.join(MEDIA_URL, value)
        return value

    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "gender": "M",
                "occupation": "Doctor",
                "phone_number": "+1234567890",
                "email": "john.doe@example.com",
                "username": "johndoe",
                "account_balance": 1244,
                "profile": "/media/custom_user/profile.jpg",
                "is_staff": False,
                "date_joined": "2023-01-01T00:00:00",
            }
        }


class Feedback(BaseModel):
    detail: Any = Field(description="Feedback in details")

    class Config:
        json_schema_extra = {
            "example": {"detail": "This is a detailed feedback message."}
        }


class NewFeedbackInfo(BaseModel):
    message: str
    rate: ServiceFeedback.FeedbackRate

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Great service!",
                "rate": "Excellent",
            }
        }


class UpdateFeedbackInfo(BaseModel):
    message: Optional[str] = None
    rate: Optional[ServiceFeedback.FeedbackRate] = None

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Good service.",
                "rate": "Good",
            }
        }


class CompleteFeedbackInfo(NewFeedbackInfo):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "message": "Great service!",
                "rate": "Excellent",
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-02T00:00:00",
            }
        }


class UserFeedback(CompleteFeedbackInfo):
    class UserInfo(BaseModel):
        first_name: Optional[str] = None
        last_name: Optional[str] = None
        role: ServiceFeedback.SenderRole
        profile: Optional[str]

        @field_validator("profile")
        def validate_cover_photo(value):
            if value and not value.startswith("/"):
                return path.join(MEDIA_URL, value)
            return value

        class Config:
            json_schema_extra = {
                "example": {
                    "first_name": "John",
                    "last_name": "Doe",
                    "role": "Regular Customer",
                    "profile": "/media/custom_user/profile.jpg",
                }
            }

    user: UserInfo

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "message": "Great service!",
                "rate": "Excellent",
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-02T00:00:00",
                "user": {
                    "username": "johndoe",
                    "first_name": "John",
                    "last_name": "Doe",
                    "role": "Regular Customer",
                    "profile": "/media/custom_user/profile.jpg",
                },
            }
        }


class BusinessAbout(BaseModel):
    name: str
    short_name: str
    details: str
    slogan: str
    address: str
    founded_in: date
    email: Optional[str] = None
    phone_number: Optional[str] = None
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    tiktok: Optional[str] = None
    youtube: Optional[str] = None
    logo: Optional[str] = None
    wallpaper: Optional[str] = None

    @field_validator("logo", "wallpaper")
    def validate_cover_photo(value):
        if value and not value.startswith("/"):
            return path.join(MEDIA_URL, value)
        return value

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Carwash MS",
                "short_name": "CMS",
                "details": "Welcome to Carwash MS. We are committed to providing the best car-wash services.",
                "slogan": "Your car deserves the best care.",
                "address": "123 Carwash Avenue, Nairobi - Kenya",
                "founded_in": "2023-01-01",
                "email": "admin@carwashms.com",
                "phone_number": "+254711111111",
                "facebook": "https://www.facebook.com/carwashms",
                "twitter": "https://www.x.com/carwashms",
                "linkedin": "https://www.linkedin.com/company/carwashms",
                "instagram": "https://www.instagram.com/carwashms",
                "tiktok": "https://www.tiktok.com/@carwashms",
                "youtube": "https://www.youtube.com/carwashms",
                "logo": "/media/default/carwash_logo.png",
                "wallpaper": "/media/default/carwash_wallpaper.jpg",
            }
        }


class NewVisitorMessage(BaseModel):
    sender: str
    email: EmailStr
    body: str

    class Config:
        json_schema_extra = {
            "example": {
                "sender": "Jane Doe",
                "email": "jane.doe@example.com",
                "body": "I would like to inquire about your carwash services.",
            }
        }


class ServiceOffered(BaseModel):

    class VehicleCategoryInfo(BaseModel):
        id: int
        name: str
        vehicles: list[str]

        @field_validator("vehicles", mode="before")
        def deserialize_vehicles(cls, v):
            if isinstance(v, str):
                return [item.strip() for item in v.split(",")]
            return v

    id: int
    name: Service.ServiceName
    description: str
    picture: str
    period_in_minutes: int
    charges: float
    vehicle_category: VehicleCategoryInfo

    @field_validator("picture")
    def validate_cover_photo(value):
        if value and not value.startswith("/"):
            return path.join(MEDIA_URL, value)
        return value

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Exterior Wash",
                "description": "A thorough exterior wash to make your car shine.",
                "picture": "/media/services/exterior_wash.jpg",
                "period_in_minutes": 30,
                "charges": 500.15,
                "vehicle_category": {
                    "id": 1,
                    "name": "Small",
                    "vehicles": ["Subaru", "Fielder", "Mark X"],
                },
            }
        }


class ShallowServiceOffered(BaseModel):
    id: int
    name: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Exterior Wash",
            }
        }


class ShallowBranchInfo(BaseModel):
    id: int
    name: str
    address: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Main",
                "address": "123 Main Street, Nairobi, Kenya",
            }
        }


class FullBranchInfo(ShallowBranchInfo):
    operation_status: Branch.OperationStatus
    picture: str
    telephone_number: Optional[str] = None

    @field_validator("picture")
    def validate_cover_photo(value):
        if value and not value.startswith("/"):
            return path.join(MEDIA_URL, value)
        return value

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Main",
                "address": "123 Main Street, Nairobi, Kenya",
                "operation_status": "Open",
                "picture": "/media/branch/main-0072.jpg",
                "telephon_number": "+254700000000",
            }
        }


class NewAppointment(BaseModel):
    service_id: int
    branch_id: int
    vehicle_plate_number: str
    appointment_datetime: datetime
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "service_id": 1,
                "branch_id": 1,
                "vehicle_plate_number": "KDL-235DX",
                "appointment_datetime": "2023-01-01T10:00:00",
                "notes": "Please ensure the car is cleaned thoroughly.",
            }
        }


class UpdateAppointment(NewAppointment):
    status: Appointment.AppointmentStatus

    class Config:
        json_schema_extra = {
            "example": {
                "service_id": 1,
                "branch_id": 1,
                "vehicle_plate_number": "KDL-235DX",
                "appointment_datetime": "2023-01-01T10:00:00",
                "notes": "Please ensure the car is cleaned thoroughly.",
                "status": "Pending",
            }
        }


class AppointmentDetails(UpdateAppointment):
    id: int
    total_charges: float

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "service_id": 1,
                "branch_id": 1,
                "vehicle_plate_number": "KDL-235DX",
                "appointment_datetime": "2023-01-01T10:00:00",
                "notes": "Please ensure the car is cleaned thoroughly.",
                "status": "Pending",
                "total_charges": 2500,
            }
        }


class FullAppointmentDetails(AppointmentDetails):
    class ExtraFees(BaseModel):
        name: str
        details: str
        amount: int

        class Config:
            json_schema_extra = {
                "example": [
                    {
                        "name": "Late Fee",
                        "details": "Additional charge for late arrival.",
                        "amount": 500,
                    },
                    {
                        "name": "Extra Cleaning",
                        "details": "Charge for cleaning heavily soiled vehicles.",
                        "amount": 1000,
                    },
                ]
            }

    updated_at: datetime
    created_at: datetime
    extra_fees: list[ExtraFees]

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "service_id": 1,
                "branch_id": 1,
                "vehicle_plate_number": "KDL-235DX",
                "appointment_datetime": "2023-01-01T10:00:00",
                "notes": "Please ensure the car is cleaned thoroughly.",
                "status": "Pending",
                "total_charges": 2500,
                "extra_fees": [
                    {
                        "name": "Late Fee",
                        "details": "Additional charge for late arrival.",
                        "amount": 500,
                    },
                    {
                        "name": "Extra Cleaning",
                        "details": "Charge for cleaning heavily soiled vehicles.",
                        "amount": 1000,
                    },
                ],
                "updated_at": "2023-01-02T00:00:00",
                "created_at": "2023-01-01T00:00:00",
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


class BusinessGallery(BaseModel):
    title: str
    details: str
    location_name: str
    video_link: Optional[HttpUrl] = Field(None, description="Youtube video link")
    picture: Optional[str] = None
    date: date

    @field_validator("picture")
    def validate_file(value):
        if value and not value.startswith("/"):
            return path.join(MEDIA_URL, value)
        return value

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Car Wash Tour",
                "details": "A virtual tour of our car wash facilities.",
                "location_name": "Main Car Wash Branch",
                "video_link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "picture": "/media/gallery/car-wash-tour.jpg",
                "date": "2023-01-01",
            }
        }


class FAQDetails(BaseModel):
    question: str
    answer: str

    class Config:
        json_schema_extra = {
            "example": {
                "question": "What is the turnaround time for a car wash?",
                "answer": "The turnaround time is typically 30-45 minutes.",
            }
        }
