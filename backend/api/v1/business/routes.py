from fastapi import APIRouter, Path, Query
from fastapi.encoders import jsonable_encoder
from external.models import About, Message, FAQ, ServiceFeedback, Gallery
from rental.models import House, UnitGroup
from management.models import AppUtility

from api.v1.utils import send_email

from api.v1.models import ProcessFeedback
from api.v1.business.models import (
    BusinessAbout,
    NewVisitorMessage,
    BusinessGallery,
    FAQDetails,
    ShallowUserInfo,
    UserFeedback,
    HouseInfo,
    UnitGroupInfo,
    AppUtilityInfo,
)
from typing import Annotated


router = APIRouter(prefix="/business", tags=["Business"])


@router.get("/about", name="Business information")
def get_hospital_details() -> BusinessAbout:
    return jsonable_encoder(About.objects.all().first())


# HOUSES INFO
@router.get("/houses", name="Get houses available")
def get_houses_available() -> list[HouseInfo]:
    return [house.model_dump() for house in House.objects.order_by("-created_at").all()]


@router.get("/unit-goup/{id}", name="Get house unit-group")
def get_house_unit_groups(
    id: Annotated[int, Path(description="House ID")]
) -> list[UnitGroupInfo]:
    """Get unit groups info of a particular house"""
    unit_groups = UnitGroup.objects.filter(house__id=id).order_by("-created_at").all()
    return [unit_group.model_dump() for unit_group in unit_groups]


@router.post("/visitor-message", name="New visitor message")
def new_visitor_message(message: NewVisitorMessage) -> ProcessFeedback:
    new_message = Message.objects.create(**message.model_dump())
    new_message.save()
    send_email(
        "Message Received Confirmation",
        recipient=new_message.email,
        template_name="email/message_received_confirmation",
        context=dict(message=new_message),
    )
    return ProcessFeedback(detail="Message received succesfully.")


@router.get("/galleries", name="Business galleries")
def get_business_galleries() -> list[BusinessGallery]:
    return [
        jsonable_encoder(gallery)
        for gallery in Gallery.objects.filter(show_in_index=True)
        .all()
        .order_by("created_at")[:12]
    ]


@router.get("/feedbacks", name="Customers' feedback")
def get_client_feedbacks() -> list[UserFeedback]:
    """Get customers' feedback"""
    feedbacks = (
        ServiceFeedback.objects.filter(show_in_index=True)
        .order_by("-created_at")
        .all()[:6]
    )
    feedback_list = []
    for feedback in feedbacks:
        feedback_dict = jsonable_encoder(feedback)
        feedback_dict["user"] = ShallowUserInfo(**feedback.sender.model_dump())
        feedback_list.append(UserFeedback(**feedback_dict))
    return feedback_list


@router.get("/faqs", name="Frequently asked questions")
def get_faqs() -> list[FAQDetails]:
    """Get frequently asked question"""
    return [
        FAQDetails(**jsonable_encoder(faq))
        for faq in FAQ.objects.filter(is_shown=True).order_by("created_at").all()[:10]
    ]


@router.get("/app/utilities", name="App utilities")
def get_app_utilities(
    name: Annotated[AppUtility.UtilityName, Query(description="Name filter")] = None
) -> list[AppUtilityInfo]:
    """Get app utilities such as currency etc"""
    search_filter = dict()
    if name is not None:
        search_filter["name"] = name.value
    return [
        jsonable_encoder(utility)
        for utility in AppUtility.objects.filter(**search_filter).all()
    ]
