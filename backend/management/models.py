from django.db import models
from users.models import CustomUser
from django.core.validators import RegexValidator
from ckeditor.fields import RichTextField
from django.utils.translation import gettext_lazy as _
from rental_ms.utils import EnumWithChoices
from ckeditor.fields import RichTextField


# Create your models here.


class Office(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name"),
        help_text=_("Identity name of the office"),
        default="Main",
        unique=True,
    )
    manager = models.ForeignKey(
        CustomUser,
        on_delete=models.RESTRICT,
        verbose_name=_("Manager"),
        help_text=_("Person in charge of the office"),
    )
    description = RichTextField(
        verbose_name=_("Description"),
        help_text=_("Details of the office"),
    )
    address = models.CharField(
        max_length=200,
        verbose_name=_("Address"),
        help_text=_("Physical address of the office"),
        null=True,
        blank=True,
    )
    contact_number = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r"^\+?\d{9,15}$",
                message=_(
                    "Phone number must be entered in the format: '+254...' or '07...'. "
                    "Up to 15 digits allowed."
                ),
            )
        ],
        help_text=_("Official contact number"),
        blank=True,
        null=True,
    )
    email = models.EmailField(
        max_length=100,
        verbose_name=_("Email"),
        help_text=_("Official email address"),
        blank=True,
        null=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At"),
        help_text=_("Date and time when the entry was last updated"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At"),
        help_text=_("Date and time when the entry was created"),
    )

    class Meta:
        verbose_name = _("House Office")
        verbose_name_plural = _("House Offices")

    def __str__(self):
        return self.name

    def model_dump(self):
        return dict(
            name=self.name,
            manager_id=self.manager.id,
            description=self.description,
            address=self.address,
            contact_number=self.contact_number,
            email=self.email,
        )


class Concern(models.Model):
    class ConcernStatus(EnumWithChoices):
        OPEN = "Open"
        IN_PROGRESS = "In Progress"
        RESOLVED = "Resolved"
        CLOSED = "Closed"

    tenant = models.ForeignKey(
        "rental.Tenant",
        on_delete=models.CASCADE,
        verbose_name=_("Tenant"),
        help_text=_("Tenant raising this concern"),
        related_name="concerns",
    )
    about = models.CharField(
        max_length=200, verbose_name=_("About"), help_text=_("Main issue being raised.")
    )
    details = models.TextField(
        verbose_name=_("Details"), help_text=_("Concern in details")
    )
    response = RichTextField(
        verbose_name=_("Response"),
        help_text=_("Feedback from the concerned body"),
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=ConcernStatus.choices(),
        default=ConcernStatus.OPEN.value,
        verbose_name=_("Status"),
        help_text=_("Current status of the concern"),
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At"),
        help_text=_("Date and time when the entry was last updated"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At"),
        help_text=_("Date and time when the entry was created"),
    )

    class Meta:
        verbose_name = _("Tenant Concern")
        verbose_name_plural = _("Tenant Concerns")

    def __str__(self):
        return f"{self.about} - {self.tenant} - {self.status}"

    # TODO: Mail user about changes on status


class Community(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name"),
        help_text=_("Name of the community"),
        unique=True,
    )
    description = RichTextField(
        verbose_name=_("Description"),
        help_text=_("Description of the community"),
        blank=True,
        null=True,
    )
    social_media_link = models.URLField(
        max_length=200,
        verbose_name=_("Social media link"),
        help_text=_("Link to social media group such as WhatsApp, Telegram etc"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At"),
        help_text=_("Date and time when the community was created"),
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At"),
        help_text=_("Date and time when the community was last updated"),
    )

    class Meta:
        verbose_name = _("Community")
        verbose_name_plural = _("Communities")

    def __str__(self):
        return self.name


class CommunityMessage(models.Model):
    class MessageCategory(EnumWithChoices):
        GENERAL = "General"
        PAYMENT = "Payment"
        MAINTENANCE = "Maintenance"
        WARNING = "Warning"
        OTHER = "Other"

    communities = models.ManyToManyField(
        Community,
        verbose_name=_("Communities"),
        help_text=_("Communities that receive this message"),
        related_name="messages",
    )

    category = models.CharField(
        max_length=20,
        choices=MessageCategory.choices(),
        default=MessageCategory.GENERAL.value,
        verbose_name=_("Category"),
        help_text=_("Category of the message"),
        null=False,
        blank=False,
    )
    subject = models.CharField(
        max_length=200,
        verbose_name=_("Subject"),
        help_text=_("Message subject"),
        null=False,
        blank=False,
    )
    content = RichTextField(
        verbose_name=_("Content"),
        help_text=_("Message in details"),
        null=False,
        blank=False,
    )
    read_by = models.ManyToManyField(
        "rental.Tenant",
        null=True,
        blank=True,
        verbose_name=_("Read by"),
        help_text=_("Tenants who have read this message"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At"),
        help_text=_("Date and time when the message was created"),
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At"),
        help_text=_("Date and time when the message was last updated"),
    )

    def model_dump(self):
        return dict(
            id=self.id,
            community_names=[community.name for community in self.communities.all()],
            category=self.category,
            subject=self.subject,
            content=self.content,
            created_at=self.created_at,
        )

    class Meta:
        verbose_name = _("Community Message")
        verbose_name_plural = _("Community Messages")

    def __str__(self):
        return f"{self.subject} ({self.category})"


class PersonalMessage(models.Model):

    tenant = models.ForeignKey(
        "rental.Tenant",
        on_delete=models.CASCADE,
        verbose_name=_("Tenant"),
        help_text=_("Receiver of the message"),
        related_name="messages",
    )
    category = models.CharField(
        max_length=20,
        choices=CommunityMessage.MessageCategory.choices(),
        default=CommunityMessage.MessageCategory.GENERAL.value,
        verbose_name=_("Category"),
        help_text=_("Category of the message"),
    )
    subject = models.CharField(
        max_length=200,
        verbose_name=_("Subject"),
        help_text=_("Message subject"),
        null=False,
        blank=False,
    )
    content = RichTextField(
        verbose_name=_("Content"),
        help_text=_("Message in details"),
        null=False,
        blank=False,
    )
    is_read = models.BooleanField(
        verbose_name=_("Is read"), default=False, help_text=_("Message read status")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At"),
        help_text=_("Date and time when the entry was created"),
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At"),
        help_text=_("Date and time when the entry was last updated"),
    )

    class Meta:
        verbose_name = _("Personal Message")
        verbose_name_plural = _("Personal Messages")

    def __str__(self):
        return f"{self.subject} ({self.category}) - {self.tenant}"


class AppUtility(models.Model):
    """Utility data for the application such currency"""

    class UtilityName(EnumWithChoices):
        CURRENCY = "Currency"
        RENT_PAYMENT_START_DATE = "Rent Payment Start Date"
        RENT_PAYMENT_END_DATE = "Rent Payment End Date"
        RENT_PAYMENT_DATE_REMINDER = "Rent Payment Date Reminder"

    name = models.CharField(
        max_length=30,
        verbose_name=_("Name"),
        choices=UtilityName.choices(),
        help_text=_("Name of this utility"),
        null=False,
        blank=False,
    )
    description = RichTextField(
        verbose_name=_("Description"),
        help_text=_("Description of this app utility"),
        null=False,
        blank=False,
    )
    value = models.CharField(
        max_length=100,
        null=False,
        blank=False,
        verbose_name=_("Value"),
        help_text=_("Value for this utility"),
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("updated at"),
        help_text=_("Date and time when the entry was updated"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("created at"),
        help_text=_("Date and time when the entry was created"),
    )

    def __str__(self):
        return f"{self.name} - {self.value}"

    class Meta:
        verbose_name = _("App Utility")
        verbose_name_plural = _("App Utilities")
