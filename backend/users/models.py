from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext as _
from uuid import uuid4
from os import path
from django.core.validators import FileExtensionValidator
from django.core.validators import RegexValidator
from django.utils import timezone
from rental_ms.utils import get_expiry_datetime
from finance.models import UserAccount
from rental_ms.utils import EnumWithChoices

# Create your models here.


def generate_profile_filepath(instance: "CustomUser", filename: str) -> str:
    custom_filename = str(uuid4()) + path.splitext(filename)[1]
    return f"user_profile/{instance.id}{custom_filename}"


class CustomUser(AbstractUser):

    class UserGender(EnumWithChoices):
        MALE = "M"
        FEMALE = "F"
        OTHER = "O"

    gender = models.CharField(
        verbose_name=_("gender"),
        max_length=10,
        help_text=_("Select one"),
        choices=UserGender.choices(),
        default=UserGender.OTHER.value,
    )
    identity_number = models.IntegerField(
        verbose_name=_("Identity number"),
        null=False,
        blank=False,
        help_text=_("National ID/Birth Certificate number"),
        unique=True,
    )
    occupation = models.CharField(
        max_length=40,
        verbose_name=_("Occupation"),
        help_text=_("What user does for a living."),
    )

    phone_number = models.CharField(
        max_length=15,
        verbose_name=_("Phone number"),
        validators=[
            RegexValidator(
                regex=r"^\+?1?\d{9,15}$",
                message=_(
                    "Phone number must be entered in the format: '+254...' or '07...'. Up to 15 digits allowed."
                ),
            )
        ],
        help_text=_("Contact phone number"),
        blank=False,
        null=False,
    )
    emergency_contact_number = models.CharField(
        max_length=15,
        verbose_name=_("Emergency contact number"),
        validators=[
            RegexValidator(
                regex=r"^\+?1?\d{9,15}$",
                message=_(
                    "Phone number must be entered in the format: '+254...' or '07...'. Up to 15 digits allowed."
                ),
            )
        ],
        help_text=_("Emergency contact number"),
        blank=True,
        null=True,
    )

    profile = models.ImageField(
        _("Profile Picture"),
        default="default/user.png",
        upload_to=generate_profile_filepath,
        validators=[FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png"])],
        blank=True,
        null=True,
    )
    account = models.OneToOneField(
        UserAccount,
        on_delete=models.RESTRICT,
        help_text=_("Finance account"),
        related_name="user",
    )

    token = models.CharField(
        _("token"),
        help_text=_("Token for validation"),
        null=True,
        blank=True,
        max_length=40,
        unique=True,
    )

    REQUIRED_FIELDS = (
        "email",
        "identity_number",
    )

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")

    def save(self, *args, **kwargs):
        if not self.id:  # new entry
            if len(self.password) < 20:
                self.set_password(self.password)
            new_account = UserAccount.objects.create()
            new_account.save()
            self.account = new_account
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

    def model_dump(self):
        return dict(
            first_name=self.first_name,
            last_name=self.last_name,
            gender=self.gender,
            identity_number=self.identity_number,
            occupation=self.occupation,
            phone_number=self.phone_number,
            emergency_contact_number=self.emergency_contact_number,
            email=self.email,
            username=self.username,
            account_balance=self.account.balance,
            profile=self.profile.name,
            is_staff=self.is_staff,
            date_joined=self.date_joined,
        )


class AuthToken(models.Model):

    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="auth_token"
    )
    token = models.CharField(help_text=_("auth token value"), max_length=80, null=False)
    expiry_datetime = models.DateTimeField(
        help_text=_("Expiry datetime"), null=False, default=get_expiry_datetime
    )

    def is_expired(self):
        return timezone.now() > self.expiry_datetime
