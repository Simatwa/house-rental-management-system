"""User routes"""

from fastapi import (
    APIRouter,
    status,
    HTTPException,
    Depends,
    Query,
    Path,
)
from api.v1.utils import get_value
from api.v1.account.utils import get_user

from users.models import CustomUser
from rental.models import Tenant, Unit
from management.models import CommunityMessage, PersonalMessage, Concern

from api.v1.models import ProcessFeedback
from api.v1.core.models import (
    UnitInfo,
    UnitGroupInfoPrivate,
    HouseInfoPrivate,
    PersonalMessageInfo,
    CommunityMessageInfo,
    ShallowConcernDetails,
    NewConcern,
    ConcernDetails,
    UpdateConcern,
)
from typing import Annotated, List
from fastapi.encoders import jsonable_encoder
import asyncio

router = APIRouter(prefix="/user", tags=["Core"])


async def get_tenant(user: Annotated[CustomUser, get_user]) -> Tenant:
    def tenant_finder(user: CustomUser) -> Tenant:
        try:
            return Tenant.objects.select_related("unit").get(user=user)
        except Tenant.DoesNotExist:
            raise HTTPException(
                detail="Currently you don't have any unit under your account.",
                status_code=status.HTTP_412_PRECONDITION_FAILED,
            )

    return await asyncio.to_thread(tenant_finder, user)


@router.house("/house", name="Get house info")
def get_house_info(tenant: Annotated[Tenant, Depends(get_tenant)]) -> HouseInfoPrivate:
    house = tenant.unit.unit_group.house
    house_info_dict = jsonable_encoder(house)
    house_info_dict["communities"] = [
        jsonable_encoder(house) for house in house.communities.all()
    ]
    return house_info_dict


@router.get("/unit", name="Get occupied unit info")
def get_occupied_unit(tenant: Annotated[Tenant, Depends(get_tenant)]) -> UnitInfo:
    """Get tenant's unit information"""
    unit = Unit.objects.select_related("unit_group", "unit_group__caretakers").get(
        tenant=tenant
    )
    unit_info_dict = unit.model_dump()
    unit_group_dict = unit.unit_group.model_dump()
    unit_group_dict["caretakers"] = [
        caretaker.model_dump() for caretaker in tenant.unit.unit_group.caretakers.all()
    ]
    unit_info_dict["unit_group"] = unit_group_dict
    return unit_info_dict


@router.get("/personal/messages", name="Get personal messages")
def get_personal_messages(
    tenant: Annotated[Tenant, Depends(get_tenant)],
    is_read: Annotated[bool, Query(description="Is read filter")] = None,
) -> List[PersonalMessageInfo]:
    """Messages that targets one tenant"""
    search_filter = dict(tenant=tenant)
    if is_read is not None:
        search_filter["is_read"] = is_read
    return [
        jsonable_encoder(message)
        for message in PersonalMessage.objects.filter(**search_filter)
        .order_by("-created_at")
        .all()[:30]
    ]


@router.patch("/personal/message/mark-read/{id}", name="Mark personal message as read")
def mark_personal_message_read(
    id: Annotated[int, Path(description="Personal message ID")],
    tenant: Annotated[Tenant, Depends(get_tenant)],
) -> ProcessFeedback:
    """Mark a personal message as read"""
    try:
        message = PersonalMessage.objects.get(id=id, tenant=tenant)
        message.is_read = True
        message.save()
        return ProcessFeedback(detail="Message marked as read successfully")
    except PersonalMessage.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with id {id} does not exist.",
        )


@router.get("/community/messages", name="Get community messages")
def get_community_messages(
    tenant: Annotated[Tenant, Depends(get_tenant)]
) -> List[CommunityMessageInfo]:
    """Messages from communities that tenant is a member"""
    message_list = []

    for message in (
        CommunityMessage.objects.prefetch_related("communities")
        .filter(communities__in=tenant.unit.unit_group.house.communities)
        .order_by("-created_at")
        .all()
    ):
        message_dict = message.model_dump()
        message_dict["is_read"] = message.read_by.contains(tenant)
        message_list.append(message_dict)
    return message_list


@router.patch(
    "/community/message/mark-read/{id}", name="Mark community message as read"
)
def mark_community_message_read(
    id: Annotated[int, Path(description="Community message ID")],
    tenant: Annotated[Tenant, Depends(get_tenant)],
) -> ProcessFeedback:
    """Mark a particular community message as read"""
    try:
        message = CommunityMessage.objects.prefetch_related("communities").get(
            id=id, communities__in=tenant.unit.unit_group.house.communities
        )
        message.read_by.add(tenant)
        message.save()
        return ProcessFeedback(detail="Message marked as read successfully.")
    except CommunityMessage.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community message with id {id} does not exist.",
        )


@router.get("/concerns", name="Get concerns")
def get_concerns(
    tenant: Annotated[Tenant, Depends(get_tenant)],
    status: Annotated[
        Concern.ConcernStatus, Query(description="Concern status")
    ] = None,
) -> List[ShallowConcernDetails]:
    """Ger concerns ever sent"""
    search_filter = dict(tenant=tenant)
    if status is not None:
        search_filter["status"] = status.value
    return [
        jsonable_encoder(concern)
        for concern in Concern.objects.filter(**search_filter)
        .order_by("-created_at")
        .all()[:30]
    ]


@router.post("/concern/new", name="Add new concern")
def add_new_concern(
    concern: NewConcern, tenant: Annotated[Tenant, Depends(get_tenant)]
) -> ConcernDetails:
    """Add new concern"""
    new_concern = Concern.objects.create(**concern.model_dump())
    new_concern.tenant = tenant
    new_concern.save()
    new_concern.refresh_from_db()
    return jsonable_encoder(new_concern)


@router.patch("/concern/{id}", name="Update existing concern")
def update_existing_concern(
    id: Annotated[int, Path(description="Concern ID")],
    concern: UpdateConcern,
    tenant: Annotated[Tenant, Depends(get_tenant)],
) -> ConcernDetails:
    """Update existing concern"""
    try:
        target_concern = Concern.objects.get(id=id, tenant=tenant)
        target_concern.about = get_value(concern.about, target_concern.about)
        target_concern.details = get_value(concern.details, target_concern.details)
        target_concern.save()
        return jsonable_encoder(target_concern)
    except Concern.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Concern with id {id} does not exist.",
        )


@router.get("/concern/{id}", name="Get concern details")
def get_concern_details(
    id: Annotated[int, Path(description="Concern ID")],
    tenant: Annotated[Tenant, Depends(get_tenant)],
) -> ConcernDetails:
    """Get particular concern details"""
    try:
        target_concern = Concern.objects.get(id=id, tenant=tenant)
        return jsonable_encoder(target_concern)
    except Concern.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Concern with id {id} does not exist.",
        )


@router.delete("/concern/{id}", name="Delete concern")
def get_concern_details(
    id: Annotated[int, Path(description="Concern ID")],
    tenant: Annotated[Tenant, Depends(get_tenant)],
) -> ProcessFeedback:
    """Delete a particular concern"""
    try:
        target_concern = Concern.objects.get(id=id, tenant=tenant)
        target_concern.delete()
        return ProcessFeedback(detail="Concern deleted successfully.")
    except Concern.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Concern with id {id} does not exist.",
        )
