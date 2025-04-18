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


class PersonalMessageInfo(BaseModel):
    id: int
    category: CommunityMessage.MessageCategory
    subject: str
    content: str
    created_at: datetime
    is_read: bool


class CommunityMessageInfo(PersonalMessageInfo):
    community_names: List[str]


class NewConcern(BaseModel):
    about: str
    details: str


class ShallowConcernDetails(BaseModel):
    id: int
    about: str
    status: Concern.ConcernStatus
    created_at: datetime


class ConcernDetails(ShallowConcernDetails):
    details: str
    response: Optional[str] = None
    updated_at: datetime


class UpdateConcern(BaseModel):
    about: Optional[str] = None
    details: Optional[str] = None
