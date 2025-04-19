"""Core routes"""

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
from management.models import CommunityMessage, GroupMessage, PersonalMessage, Concern
from external.models import ServiceFeedback

from api.v1.models import ProcessFeedback
from api.v1.core.models import (
    UnitInfo,
    HouseInfoPrivate,
    PersonalMessageInfo,
    GroupMessageInfo,
    CommunityMessageInfo,
    ShallowConcernDetails,
    NewConcern,
    ConcernDetails,
    UpdateConcern,
    NewTenantFeedback,
    TenantFeedbackDetails,
)

from django.db.utils import IntegrityError

from typing import Annotated, List
from fastapi.encoders import jsonable_encoder
import asyncio

router = APIRouter(prefix="/core", tags=["Core"])


async def get_tenant(user: Annotated[CustomUser, Depends(get_user)]) -> Tenant:
    def tenant_finder(user: CustomUser) -> Tenant:
        try:
            tenant = Tenant.objects.select_related("unit").get(user=user)
            if tenant.unit is None:
                raise HTTPException(
                    detail="Currently you don't have any unit under your account.",
                    status_code=status.HTTP_412_PRECONDITION_FAILED,
                )
            return tenant
        except Tenant.DoesNotExist:
            raise HTTPException(
                detail="You're not yet enrolled as a tenant.",
                status_code=status.HTTP_412_PRECONDITION_FAILED,
            )

    return await asyncio.to_thread(tenant_finder, user)


@router.get("/house", name="Get house info")
def get_house_info(tenant: Annotated[Tenant, Depends(get_tenant)]) -> HouseInfoPrivate:
    """Get tenant's house information"""
    house = tenant.unit.unit_group.house
    house_info_dict = jsonable_encoder(house)
    house_info_dict["communities"] = [
        jsonable_encoder(house) for house in house.communities.all()
    ]
    house_info_dict["office"] = jsonable_encoder(tenant.unit.unit_group.house.office)
    return house_info_dict


@router.get("/unit", name="Get occupied unit info")
def get_occupied_unit(tenant: Annotated[Tenant, Depends(get_tenant)]) -> UnitInfo:
    """Get tenant's unit information"""
    unit = (
        Unit.objects.select_related("unit_group")
        .prefetch_related("unit_group__caretakers")
        .get(tenant=tenant)
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
        PersonalMessage.objects.filter(id=id, tenant=tenant).update(is_read=True)
        return ProcessFeedback(detail="Message marked as read successfully")
    except PersonalMessage.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with id {id} does not exist.",
        )


@router.get("/group/messages", name="Get group messages")
def get_group_messages(
    tenant: Annotated[Tenant, Depends(get_tenant)],
    is_read: Annotated[bool, Query(description="Is read filter")] = None,
) -> List[GroupMessageInfo]:
    """Messages from unit group that tenant is a member"""
    message_list = []
    search_filter = dict(groups__in=[tenant.unit.unit_group])
    if is_read is not None:
        if is_read:
            search_filter["read_by"] = tenant
        elif is_read is False:
            search_filter["read_by__isnull"] = True

    for message in (
        GroupMessage.objects.prefetch_related("read_by")
        .filter(**search_filter)
        .order_by("-created_at")
        .all()[:30]
    ):
        message_dict = message.model_dump()
        message_dict["is_read"] = message.read_by.contains(tenant)
        message_list.append(message_dict)
    return message_list


@router.patch("/group/message/mark-read/{id}", name="Mark group message as read")
def mark_group_message_read(
    id: Annotated[int, Path(description="Group message ID")],
    tenant: Annotated[Tenant, Depends(get_tenant)],
) -> ProcessFeedback:
    """Mark a particular group message as read"""
    try:
        GroupMessage.objects.prefetch_related("read_by").get(
            id=id, groups__in=[tenant.unit.unit_group]
        ).read_by.add(tenant)
        return ProcessFeedback(detail="Message marked as read successfully.")
    except GroupMessage.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community message with id {id} does not exist.",
        )


@router.get("/community/messages", name="Get community messages")
def get_community_messages(
    tenant: Annotated[Tenant, Depends(get_tenant)],
    is_read: Annotated[bool, Query(description="Is read filter")] = None,
) -> List[CommunityMessageInfo]:
    """Messages from communities that tenant is a member"""
    message_list = []
    search_filter = dict(
        communities__in=tenant.unit.unit_group.house.communities.all(),
    )
    if is_read is not None:
        if is_read:
            search_filter["read_by"] = tenant
        elif is_read is False:
            search_filter["read_by__isnull"] = True

    for message in (
        CommunityMessage.objects.prefetch_related("communities", "read_by")
        .filter(**search_filter)
        .order_by("-created_at")
        .distinct()
        .all()[:30]
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
        message = (
            CommunityMessage.objects.prefetch_related("communities")
            .filter(
                id=id, communities__in=tenant.unit.unit_group.house.communities.all()
            )
            .distinct()
            .first()
        )
        if not message:
            raise CommunityMessage.DoesNotExist()
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
    new_concern_dict = concern.model_dump()
    new_concern_dict["tenant"] = tenant
    new_concern = Concern.objects.create(**new_concern_dict)
    new_concern.save()
    # new_concern.refresh_from_db()
    return jsonable_encoder(new_concern)


@router.patch("/concern/{id}", name="Update existing concern")
def update_existing_concern(
    id: Annotated[int, Path(description="Concern ID")],
    concern: UpdateConcern,
    tenant: Annotated[Tenant, Depends(get_tenant)],
) -> ConcernDetails:
    """Update existing concern"""
    try:
        target_concern = Concern.objects.get(
            id=id,
            tenant=tenant,
            status__in=[
                Concern.ConcernStatus.OPEN.value,
                Concern.ConcernStatus.IN_PROGRESS.value,
            ],
        )
        target_concern.about = get_value(concern.about, target_concern.about)
        target_concern.details = get_value(concern.details, target_concern.details)
        target_concern.save()
        return jsonable_encoder(target_concern)
    except Concern.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Open or In-Progres concern with id {id} does not exist.",
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


@router.post("/feedback", name="New feedback")
def add_new_feedback(
    tenant: Annotated[Tenant, Depends(get_tenant)], feedback: NewTenantFeedback
) -> TenantFeedbackDetails:
    try:
        new_feedback = ServiceFeedback.objects.create(
            sender=tenant.user, message=feedback.message, rate=feedback.rate.value
        )
        new_feedback.save()
        return new_feedback.model_dump()
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You already have an existing feedback. Consider updating it instead.",
        )


@router.patch("/feedback", name="Update feedback")
def update_feedback(
    tenant: Annotated[Tenant, Depends(get_tenant)],
    feedback: NewTenantFeedback,
) -> TenantFeedbackDetails:
    """Update user service-feedback"""
    try:
        target_feedback = ServiceFeedback.objects.get(sender=tenant.user)
        target_feedback.message = get_value(feedback.message, target_feedback.message)
        target_feedback.rate = get_value(feedback.rate.value, target_feedback.rate)
        target_feedback.save()
        return target_feedback.model_dump()
    except ServiceFeedback.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"You have not send a feedback yet.",
        )


@router.get("/feedback", name="Get feedback details")
def get_feedback_details(
    tenant: Annotated[Tenant, Depends(get_tenant)],
) -> TenantFeedbackDetails:
    """Get user service-feedback"""
    try:
        target_feedback = ServiceFeedback.objects.get(sender=tenant.user)
        return target_feedback.model_dump()
    except ServiceFeedback.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"You have not send a feedback yet.",
        )


@router.delete("/feedback", name="Delete feedback")
def delete_feedback(
    tenant: Annotated[Tenant, Depends(get_tenant)],
) -> ProcessFeedback:
    """Delete user feedback"""
    try:
        target_feedback = ServiceFeedback.objects.get(sender=tenant.user)
        target_feedback.delete()
        return ProcessFeedback(detail="Feedback deleted successfully.")
    except ServiceFeedback.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"You have not send a feedback yet.",
        )
