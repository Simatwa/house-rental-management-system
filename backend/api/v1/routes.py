from fastapi import (
    APIRouter,
    status,
    HTTPException,
    Depends,
    Query,
    Path,
)
from fastapi.encoders import jsonable_encoder
from fastapi.security.oauth2 import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from users.models import CustomUser, AuthToken
from finance.models import Account
from rental_ms.utils import send_payment_push
from external.models import About, Message, FAQ, ServiceFeedback, Gallery
from rental.models import Service, Appointment, Branch
from rental_ms.utils import get_expiry_datetime

# from django.contrib.auth.hashers import check_password
from api.v1.utils import (
    token_id,
    generate_token,
    get_value,
    generate_password_reset_token,
    send_email,
)
from api.v1.models import (
    TokenAuth,
    ResetPassword,
    Profile,
    EditablePersonalData,
    Feedback,
    BusinessAbout,
    NewVisitorMessage,
    ServiceOffered,
    ShallowServiceOffered,
    BusinessGallery,
    FAQDetails,
    UserFeedback,
    ShallowBranchInfo,
    FullBranchInfo,
    NewAppointment,
    AppointmentDetails,
    UpdateAppointment,
    FullAppointmentDetails,
    PaymentAccountDetails,
    SendMPESAPopupTo,
)

import asyncio
from typing import Annotated, Union, Optional
from django.db.models import Q

router = APIRouter(prefix="/v1", tags=["v1"])


v1_auth_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/token",
    description="Generated API authentication token",
)


async def get_user(token: Annotated[str, Depends(v1_auth_scheme)]) -> CustomUser:
    """Ensures token passed match the one set"""
    if token:
        try:
            if token.startswith(token_id):

                def fetch_user(token) -> CustomUser:
                    return CustomUser.objects.get(token=token)

                return await asyncio.to_thread(fetch_user, token)

        except CustomUser.DoesNotExist:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing token",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/token", name="token")
def fetch_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> TokenAuth:
    """
    Get  User token

     - `username` : User username
     - `password` : User password.
    """
    try:
        user = CustomUser.objects.get(username=form_data.username)
        if user.check_password(form_data.password):
            if user.token is None:
                user.token = generate_token()
                user.save()
            return TokenAuth(
                access_token=user.token,
                token_type="bearer",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password."
            )
    except CustomUser.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User does not exist.",
        )


@router.patch("/token", name="patch token")
def generate_new_token(user: Annotated[CustomUser, Depends(get_user)]) -> TokenAuth:
    """Generate new token"""
    user.token = generate_token()
    user.save()
    return TokenAuth(access_token=user.token)


@router.get("/password/send-reset-token", name="Send password reset token")
def reset_password(
    identity: Annotated[str, Query(description="Username or email address")]
) -> Feedback:
    """Emails password reset token to user"""
    try:
        target_user = CustomUser.objects.filter(
            Q(username=identity) | Q(email=identity)
        ).get()
        auth_token = AuthToken.objects.filter(user=target_user).first()
        if auth_token is not None:
            auth_token.token = generate_password_reset_token()
            auth_token.expiry_datetime = get_expiry_datetime()
        else:
            auth_token = AuthToken.objects.create(
                user=target_user,
                token=generate_password_reset_token(),
            )
        auth_token.save()
        send_email(
            subject="Password Reset Token",
            recipient=auth_token.user.email,
            template_name="email/password_reset_token",
            context=dict(auth_token=auth_token),
        )

    except CustomUser.DoesNotExist:
        # Let's not diclose about this for security reasons
        pass
    except Exception as e:
        print(e)
    finally:
        return Feedback(
            detail=(
                "If an account with the provided identity exists, "
                "a password reset token has been sent to the associated email address."
            )
        )


@router.post("/password/reset", name="Set new password")
def reset_password(info: ResetPassword) -> Feedback:
    """Resets user password"""
    try:
        auth_token = AuthToken.objects.get(token=info.token)
        if auth_token.is_expired():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token has expired.",
            )
        user = auth_token.user
        if user.username == info.username:
            user.set_password(info.new_password)
            user.save()
            auth_token.delete()
            return Feedback(detail="Password reset successfully.")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username"
            )

    except AuthToken.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token.",
        )


@router.get("/profile", name="Profile information")
def profile_information(user: Annotated[CustomUser, Depends(get_user)]) -> Profile:
    return user.model_dump()


@router.patch("/profile", name="Update profile")
def update_personal_info(
    user: Annotated[CustomUser, Depends(get_user)],
    updated_personal_data: EditablePersonalData,
) -> EditablePersonalData:
    user.first_name = get_value(updated_personal_data.first_name, user.first_name)
    user.last_name = get_value(updated_personal_data.last_name, user.last_name)
    user.phone_number = get_value(updated_personal_data.phone_number, user.phone_number)
    user.email = get_value(updated_personal_data.email, user.email)
    user.location = get_value(updated_personal_data.location, user.location)
    user.save()
    return user.model_dump()


@router.get("/user/exists", name="Check if username exists")
def check_if_username_exists(
    username: Annotated[str, Query(description="Username to check against")]
) -> Feedback:
    """Checks if account with a particular username exists
    - Useful when setting username at account creation
    """
    try:
        CustomUser.objects.get(username=username)
        return Feedback(detail=True)
    except CustomUser.DoesNotExist:
        return Feedback(detail=False)


@router.get("/about", name="Business information")
def get_hospital_details() -> BusinessAbout:
    return jsonable_encoder(About.objects.all().first())


@router.post("/message", name="New visitor message")
def new_visitor_message(message: NewVisitorMessage) -> Feedback:
    new_message = Message.objects.create(**message.model_dump())
    new_message.save()
    send_email(
        "Message Received Confirmation",
        recipient=new_message.email,
        template_name="email/message_received_confirmation",
        context=dict(message=new_message),
    )
    return Feedback(detail="Message received succesfully.")


@router.get("/service-names", name="Main services name")
def get_available_main_services_by_name() -> list[str]:
    """Get available main-services by name"""
    return [service.name for service in Service.objects.all().distinct("name")]


@router.get("/service/{name}", name="Service's sub-services")
def get_services_offered(
    name: Annotated[Service.ServiceName, Path(description="Service name")]
) -> list[ServiceOffered]:
    """Get sub-services offered under a particular service name"""
    service_offered_items = []
    for service in Service.objects.filter(name=name.value).all():
        service_offered_items.append(service.model_dump())
    return service_offered_items


@router.get("/service/{id}", name="Service details")
def get_particular_service_details(
    id: Annotated[int, Path(description="Service ID")],
) -> ServiceOffered:
    """Get particular service details"""
    try:
        service = Service.objects.get(pk=id)
        return service.model_dump()
    except Service.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service with id {id} does not exist.",
        )


@router.get("/services", name="all services")
def get_all_services() -> list[ShallowServiceOffered]:
    """Get all sub-services information disregarding categorization"""
    return [
        ShallowServiceOffered(id=service.id, name=str(service))
        for service in Service.objects.all().order_by("-created_at")
    ]


@router.get("/branches", name="Branches available")
def get_available_branches() -> list[ShallowBranchInfo]:
    """Branches that are currently `OPEN`"""
    return [
        jsonable_encoder(branch)
        for branch in Branch.objects.filter(
            operation_status=Branch.OperationStatus.OPEN.value
        )
        .all()
        .order_by("-created_at")
    ]


@router.get("/branch/{id}", name="Branch details")
def get_particular_branch_details(
    id: Annotated[int, Path(description="Branch ID")]
) -> FullBranchInfo:
    try:
        branch = Branch.objects.get(pk=id)
        return jsonable_encoder(branch)
    except Branch.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Branch with id {id} does not exist.",
        )


@router.get("/galleries", name="Business galleries")
def get_hospital_galleries() -> list[BusinessGallery]:
    return [
        jsonable_encoder(gallery)
        for gallery in Gallery.objects.filter(show_in_index=True)
        .all()
        .order_by("created_at")[:12]
    ]


@router.get("/feedbacks", name="Get client feedbacks")
def get_client_feedbacks() -> list[UserFeedback]:
    feedbacks = (
        ServiceFeedback.objects.filter(show_in_index=True)
        .order_by("-created_at")
        .all()[:6]
    )
    feedback_list = []
    for feedback in feedbacks:
        feedback_dict = jsonable_encoder(feedback)
        feedback_dict["user"] = UserFeedback.UserInfo(
            first_name=feedback.sender.first_name,
            last_name=feedback.sender.last_name,
            role=feedback.sender_role,
            profile=feedback.sender.profile.name,
        )
        feedback_list.append(UserFeedback(**feedback_dict))
    return feedback_list


@router.get("/faqs", name="Get frequently asked questions")
def get_faqs() -> list[FAQDetails]:
    return [
        FAQDetails(**jsonable_encoder(faq))
        for faq in FAQ.objects.filter(is_shown=True).order_by("created_at").all()[:10]
    ]


@router.get("/appointments", name="Get all appointments")
def get_all_appointments(
    user: Annotated[CustomUser, Depends(get_user)],
) -> list[AppointmentDetails]:
    """Retrieve all appointments for the authenticated user"""
    appointments = (
        Appointment.objects.filter(customer=user)
        .order_by("-appointment_datetime")
        .all()
    )
    return [appointment.model_dump() for appointment in appointments]


@router.post("/appointment", name="Add appointment")
def add_new_appointment(
    user: Annotated[CustomUser, Depends(get_user)], appointment: NewAppointment
) -> AppointmentDetails:
    try:
        service = Service.objects.get(pk=appointment.service_id)
        branch = Branch.objects.get(pk=appointment.branch_id)
        if branch.operation_status != Branch.OperationStatus.OPEN.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="That branch is currently not open. Try other branches.",
            )
        new_appointment = Appointment.objects.create(
            customer=user,
            service=service,
            branch=branch,
            vehicle_plate_number=appointment.vehicle_plate_number,
            appointment_datetime=appointment.appointment_datetime,
            notes=appointment.notes,
        )
        new_appointment.save()
        return new_appointment.model_dump()
    except Service.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Service with id {appointment.service_id} does not exist.",
        )
    except Branch.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Branch with id {appointment.branch_id} does not exists.",
        )


@router.patch("/appointment/{id}", name="Update appointment")
def update_appointment(
    user: Annotated[CustomUser, Depends(get_user)],
    id: Annotated[int, Path(description="Appointment ID")],
    updated_appointment: UpdateAppointment,
) -> AppointmentDetails:
    try:
        appointment = Appointment.objects.get(pk=id, customer=user)
        if updated_appointment.service_id:
            service = Service.objects.get(pk=updated_appointment.service_id)
            appointment.service = service
        if updated_appointment.branch_id:
            branch = Branch.objects.get(pk=updated_appointment.branch_id)
            if branch.operation_status != Branch.OperationStatus.OPEN.value:
                raise HTTPException(
                    status_code=400,
                    detail="The selected branch is currently not open.",
                )
            appointment.branch = branch
        appointment.vehicle_plate_number = get_value(
            updated_appointment.vehicle_plate_number, appointment.vehicle_plate_number
        )
        appointment.appointment_datetime = get_value(
            updated_appointment.appointment_datetime, appointment.appointment_datetime
        )
        appointment.notes = get_value(updated_appointment.notes, appointment.notes)
        appointment.save()
        return appointment.model_dump()
    except Appointment.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with id {id} does not exist.",
        )
    except Service.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Service with id {updated_appointment.service_id} does not exist.",
        )
    except Branch.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Branch with id {updated_appointment.branch_id} does not exist.",
        )


@router.get("/appointment/{id}", name="Appointment details")
def get_full_appointment_details(
    user: Annotated[CustomUser, Depends(get_user)],
    id: Annotated[int, Path(description="Appointment ID")],
) -> FullAppointmentDetails:
    """Retrieve full details of a specific appointment"""
    try:
        appointment = Appointment.objects.get(pk=id, customer=user)
        return appointment.model_dump()
    except Appointment.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with id {id} does not exist.",
        )


@router.delete("/appointment/{id}", name="Delete appointment")
def delete_appointment(
    user: Annotated[CustomUser, Depends(get_user)],
    id: Annotated[int, Path(description="Appointment ID")],
) -> Feedback:
    try:
        appointment = Appointment.objects.get(pk=id, customer=user)
        appointment.delete()
        return Feedback(detail="Appointment deleted successfully.")
    except Appointment.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with id {id} does not exist.",
        )


@router.get("/payment-account-details", name="Payment account details")
def get_payment_account_details(
    user: Annotated[CustomUser, Depends(get_user)]
) -> list[PaymentAccountDetails]:
    return [
        PaymentAccountDetails(
            name=account.name,
            paybill_number=account.paybill_number,
            account_number=account.account_number
            % dict(
                id=user.id,
                username=user.username,
                phone_number=user.phone_number,
                email=user.email,
            ),
            details=account.details,
        )
        for account in Account.objects.filter(is_active=True).all()
    ]


@router.post("/send-mpesa-payment-popup", name="Send mpesa payment popup")
def send_mpesa_popup_to(
    user: Annotated[CustomUser, Depends(get_user)], popup_to: SendMPESAPopupTo
) -> Feedback:
    def send_popup(phone_number, amount):
        """TODO: Request payment using Daraja API"""
        mpesa_details = Account.objects.filter(name__icontains="m-pesa").first()
        assert mpesa_details is not None, "M-PESA account details not found"
        account_number = mpesa_details.account_number % dict(
            id=user.id,
            username=user.username,
            phone_number=user.phone_number,
            email=user.email,
        )
        send_payment_push(
            phone_number=phone_number,
            amount=amount,
            account_reference=account_number,
        )
        # Push send successfully let's SIMULATE account debitting
        # TODO: Implement a real account debition.
        user.account.balance += amount
        user.account.save()

    send_popup(popup_to.phone_number, popup_to.amount)
    return Feedback(detail="M-pesa popup sent successfully.")
