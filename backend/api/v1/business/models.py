from pydantic import BaseModel, Field, field_validator, Field, EmailStr, HttpUrl
from external.models import ServiceFeedback
from management.models import AppUtility
from typing import Optional
from datetime import date, datetime
from api.v1.utils import get_document_path


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
        return get_document_path(value)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Rental MS",
                "short_name": "Rental MS",
                "details": "Welcome to our House Rental MS. We are dedicated to providing quality rental properties and ensuring tenant satisfaction",
                "slogan": "Your comfort is our priority.",
                "address": "123 Estate Avenue, Nairobi - Kenya",
                "founded_in": "2023-01-01",
                "email": "admin@rentalms.com",
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
                "body": "I would like to inquire about your rental services.",
            }
        }


class ShallowUserInfo(BaseModel):
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile: Optional[str]

    @field_validator("profile")
    def validate_cover_photo(value):
        return get_document_path(value)

    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "first_name": "John",
                "last_name": "Doe",
                "profile": "/media/custom_user/profile.jpg",
            }
        }


class UserFeedback(BaseModel):
    user: ShallowUserInfo
    sender_role: ServiceFeedback.SenderRole
    message: str
    rate: ServiceFeedback.FeedbackRate
    created_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "sender_role": "Regular Customer",
                "message": "Great service!",
                "rate": "Excellent",
                "created_at": "2023-01-01T00:00:00",
                "user": {
                    "username": "johndoe",
                    "first_name": "John",
                    "last_name": "Doe",
                    "profile": "/media/custom_user/profile.jpg",
                },
            }
        }


class BusinessGallery(BaseModel):
    title: str
    details: str
    location_name: str
    youtube_video_link: Optional[HttpUrl] = Field(
        None, description="Youtube video link"
    )
    picture: Optional[str] = None
    date: date

    @field_validator("picture")
    def validate_file(value):
        return get_document_path(value)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Rentals Unit Tour",
                "details": "A virtual tour of of our Kileleshwa house units.",
                "location_name": "Kileleshwa",
                "youtube_video_link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "picture": "/media/gallery/kileleshwa-house-units.jpg",
                "date": "2024-01-01",
            }
        }


class FAQDetails(BaseModel):
    question: str
    answer: str

    class Config:
        json_schema_extra = {
            "example": {
                "question": "Do you allow owning multiple units?",
                "answer": "No. Tenant can only rent one unit.",
            }
        }


class HouseInfo(BaseModel):
    id: int
    name: str
    address: str
    description: str
    picture: str

    @field_validator("picture")
    def validate_picture(value):
        return get_document_path(value)


class UnitGroupInfo(BaseModel):
    id: int
    name: str
    abbreviated_name: str
    description: str
    number_of_units: int
    number_of_vacant_units: int
    deposit_amount: float
    monthly_rent: float
    picture: str

    @field_validator("picture")
    def validate_picture(value):
        return get_document_path(value)


class DocumentInfo(BaseModel):
    name: str
    content: str
    updated_at: datetime


class AppUtilityInfo(BaseModel):
    name: AppUtility.UtilityName
    description: str
    value: str

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Currency",
                "description": "<p>Transaction Currency</p>",
                "value": "$",
            }
        }
