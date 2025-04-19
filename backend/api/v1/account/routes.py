"""Routes for account `/account`"""

from fastapi import (
    APIRouter,
    status,
    HTTPException,
    Depends,
    Query,
)
from fastapi.security.oauth2 import OAuth2PasswordRequestFormStrict
from typing import Annotated

from users.models import CustomUser, AuthToken
from finance.models import Account
from rental_ms.utils import get_expiry_datetime

from api.v1.utils import send_email, get_value
from api.v1.account.utils import get_user, generate_token, generate_password_reset_token

from rental_ms.utils import send_payment_push
from api.v1.account.models import (
    TokenAuth,
    ResetPassword,
    UserProfile,
    EditablePersonalData,
    PaymentAccountDetails,
    SendMPESAPopupTo,
)
from api.v1.models import ProcessFeedback
from django.db.models import Q

router = APIRouter(
    prefix="/account",
    tags=["Account"],
)


@router.post("/token", name="User account token")
def fetch_token(
    form_data: Annotated[OAuth2PasswordRequestFormStrict, Depends()]
) -> TokenAuth:
    """
    Get user account token
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


@router.patch("/token", name="Generate new user token")
def generate_new_token(user: Annotated[CustomUser, Depends(get_user)]) -> TokenAuth:
    """Generate new token"""
    user.token = generate_token()
    user.save()
    return TokenAuth(access_token=user.token)


@router.get("/profile", name="Get user profile")
def profile_information(user: Annotated[CustomUser, Depends(get_user)]) -> UserProfile:
    return user.model_dump()


@router.patch("/profile", name="Update user profile")
def update_personal_info(
    user: Annotated[CustomUser, Depends(get_user)],
    updated_personal_data: EditablePersonalData,
) -> EditablePersonalData:
    user.first_name = get_value(updated_personal_data.first_name, user.first_name)
    user.last_name = get_value(updated_personal_data.last_name, user.last_name)
    user.phone_number = get_value(updated_personal_data.phone_number, user.phone_number)
    user.emergency_contact_number = get_value(
        updated_personal_data.emergency_contact_number, user.emergency_contact_number
    )
    user.email = get_value(updated_personal_data.email, user.email)
    user.occupation = get_value(updated_personal_data.occupation, user.occupation)
    user.save()
    return user.model_dump()


@router.get("/exists", name="Check if username exists")
def check_if_username_exists(
    username: Annotated[str, Query(description="Username to check against")]
) -> ProcessFeedback:
    """Checks if account with a particular username exists
    - Useful when setting username at account creation
    """
    try:
        CustomUser.objects.get(username=username)
        return ProcessFeedback(detail=True)
    except CustomUser.DoesNotExist:
        return ProcessFeedback(detail=False)


@router.get("/transactions", name="Money transaction affecting user account")
@router.get("/mpesa-payment-account-details", name="Get mpesa payment account details")
def get_mpesa_payment_account_details(
    user: Annotated[CustomUser, Depends(get_user)]
) -> PaymentAccountDetails:
    """Get mpesa payment account details specifically for current user"""
    try:
        account = Account.objects.get(
            Q(name__icontains="m-pesa") | Q(name__icontains="mpesa")
        )
        return PaymentAccountDetails(
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
    except Account.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="M-PESA Payment account details is currently not available.",
        )


@router.get("/other-payment-account-details", name="Get other payment account details")
def get_payment_account_details(
    user: Annotated[CustomUser, Depends(get_user)]
) -> list[PaymentAccountDetails]:
    """Get other payment account details such as bank etc."""
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
        for account in Account.objects.filter(is_active=True)
        .exclude(Q(name__icontains="m-pesa") | Q(name__icontains="mpesa"))
        .all()
    ]


@router.post("/send-mpesa-payment-popup", name="Send mpesa payment popup")
def send_mpesa_popup_to(
    user: Annotated[CustomUser, Depends(get_user)], popup_to: SendMPESAPopupTo
) -> ProcessFeedback:
    """Send mpesa payment pop-up to user"""

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
    return ProcessFeedback(detail="M-pesa popup sent successfully.")


@router.get("/password/send-reset-token", name="Send password reset token")
def reset_password(
    identity: Annotated[str, Query(description="Username or email address")]
) -> ProcessFeedback:
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
    finally:
        return ProcessFeedback(
            detail=(
                "If an account with the provided identity exists, "
                "a password reset token has been sent to the associated email address."
            )
        )


@router.post("/password/reset", name="Set new account password")
def reset_password(info: ResetPassword) -> ProcessFeedback:
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
            user.token = generate_token()
            user.save()
            auth_token.delete()
            return ProcessFeedback(detail="Password reset successfully.")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username"
            )

    except AuthToken.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token.",
        )
