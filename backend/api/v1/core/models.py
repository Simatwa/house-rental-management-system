from pydantic import BaseModel, field_validator, HttpUrl
from typing import Optional, List
from management.models import CommunityMessage, Concern
from rental.models import Unit
from api.v1.utils import get_document_path
from datetime import datetime


class Caretaker(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    profile: str

    @field_validator("profile")
    def validate_profile(value):
        return get_document_path(value)


class UnitGroupInfoPrivate(BaseModel):
    id: int
    name: str
    abbreviated_name: str
    description: str
    deposit_amount: float
    monthly_rent: float
    picture: str
    caretakers: List[Caretaker]

    @field_validator("picture")
    def validate_picture(value):
        return get_document_path(value)


class UnitInfo(BaseModel):
    id: int
    name: str
    abbreviated_name: str
    occupied_status: Unit.OccupiedStatus
    unit_group: UnitGroupInfoPrivate

    class Config:
        json_schema_extra = {
            "example": {
                "id": 37,
                "name": "Attic Room 4",
                "abbreviated_name": "ATTICR4",
                "occupied_status": "Occupied",
                "unit_group": {
                    "id": 7,
                    "name": "Attic",
                    "abbreviated_name": "ATTIC",
                    "description": "",
                    "deposit_amount": 0,
                    "monthly_rent": 4500,
                    "picture": "/media/default/house-7124141_1920.jpg",
                    "caretakers": [
                        {
                            "first_name": "Isaac",
                            "last_name": "Thomas",
                            "email": "isaac.thomas@example.com",
                            "phone_number": "+16444455555",
                            "profile": "/media/default/user.png",
                        },
                        {
                            "first_name": "Julia",
                            "last_name": "Wilson",
                            "email": "julia.wilson@example.com",
                            "phone_number": "+16555566666",
                            "profile": "/media/default/user.png",
                        },
                    ],
                },
            }
        }


class CommunityInfo(BaseModel):
    name: str
    description: str
    social_media_link: HttpUrl
    created_at: datetime


class HouseOffice(BaseModel):
    name: str
    description: str
    address: str
    contact_number: Optional[str]
    email: Optional[str]


class HouseInfoPrivate(BaseModel):
    id: int
    name: str
    address: str
    description: str
    picture: str
    communities: List[CommunityInfo]
    office: Optional[HouseOffice] = None

    @field_validator("picture")
    def validate_picture(value):
        return get_document_path(value)

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Green House",
                "address": "123 Main St, Ebony-Meru, Kenya",
                "description": "<p>Some house description here</p>",
                "picture": "/media/default/apartment-2138949_1920.jpg",
                "communities": [
                    {
                        "name": "Telegram Community",
                        "description": "<div><p>A dedicated space for developers and tech enthusiasts to discuss various programming languages, frameworks, and share resources.</p></div>",
                        "social_media_link": "https://t.me/",
                        "created_at": "2025-04-14T22:29:00.651853Z",
                    },
                    {
                        "name": "WhatsApp Community",
                        "description": "<div><p>A private group for quick discussions and problem-solving among team members and colleagues.</p></div>",
                        "social_media_link": "https://wa.me/text=ajhaaa",
                        "created_at": "2025-04-14T22:29:00.657732Z",
                    },
                    {
                        "name": "Discord Server",
                        "description": "<div><p>A collaborative environment for developers and designers to work together, share resources, and participate in coding challenges and hackathons.</p></div>",
                        "social_media_link": "https://discord.gg/invitecode",
                        "created_at": "2025-04-14T22:29:00.674595Z",
                    },
                ],
                "office": {
                    "name": "Central",
                    "description": "",
                    "address": "456 Central Ave, Nanyuki, Kenya",
                    "contact_number": "0711111111",
                    "email": "central@rentalms.com",
                },
            }
        }


class PersonalMessageInfo(BaseModel):
    id: int
    category: CommunityMessage.MessageCategory
    subject: str
    content: str
    created_at: datetime
    is_read: bool

    class Config:
        json_schema_extra = {
            "example": {
                "id": 26,
                "category": "General",
                "subject": "Welcome Package Update",
                "content": (
                    "We've updated our welcome package with new amenities and services."
                    " Please review the attached document."
                ),
                "created_at": "2025-04-18T22:21:43.609831Z",
                "is_read": False,
            },
        }


class CommunityMessageInfo(PersonalMessageInfo):
    community_names: List[str]

    class Config:
        json_schema_extra = {
            "example": {
                "id": 40,
                "category": "Maintenance",
                "subject": "Planned Water Outage",
                "content": (
                    "<p>Dear tenants, there will be a planned water outage on Thursday, "
                    "April 30th, from 9 AM to 3 PM. This is necessary for maintenance work. "
                    "Please make arrangements for alternative water sources during this time.</p>"
                ),
                "created_at": "2025-04-18T22:21:08.714097Z",
                "is_read": False,
                "community_names": ["Telegram Community", "WhatsApp Community"],
            }
        }


class NewConcern(BaseModel):
    about: str
    details: str


class ShallowConcernDetails(BaseModel):
    id: int
    about: str
    status: Concern.ConcernStatus
    created_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "about": "Electricity",
                "status": "Open",
                "created_at": "2025-04-14T22:18:09.524519Z",
            }
        }


class ConcernDetails(ShallowConcernDetails):
    details: str
    response: Optional[str] = None
    updated_at: datetime


class UpdateConcern(BaseModel):
    about: Optional[str] = None
    details: Optional[str] = None
