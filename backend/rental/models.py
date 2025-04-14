from django.db import models
from users.models import CustomUser
from rental_ms.utils import EnumWithChoices, generate_document_filepath
from django.utils.translation import gettext_lazy as _
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from finance.models import ExtraFee


# Create your models here.


class UnitGroup(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name"),
        help_text=_("Name of the unit group e.g Second Floor"),
        unique=True,
    )
    abbreviated_name = models.CharField(
        max_length=20,
        verbose_name=_("Abbreviated name"),
        help_text=_("Short name of the unitgroup e.g SF"),
    )
    description = models.TextField(
        verbose_name=_("Description"),
        help_text=_("Description of the unit group"),
        blank=True,
        null=True,
    )
    number_of_rooms = models.IntegerField(
        verbose_name=_("Number of Rooms"),
        help_text=_("Total number of rooms"),
        null=False,
        blank=False,
    )
    picture = models.ImageField(
        verbose_name=_("Picture"),
        help_text=_("Photo of the units"),
        upload_to=generate_document_filepath,
        default="default/house-7124141_1920.jpg",
        blank=False,
    )
    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_("Monthly Rent"),
        help_text=_("Monthly rent amount for the units"),
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
        verbose_name = _("Unit Group")
        verbose_name_plural = _("Unit Groups")

    def __str__(self):
        return self.name

    def save(self):
        # TODO: When saving the instance, auto-generate units based on
        # 1. number_of_rooms and unit group name
        # e.g SFR2
        pass


class Unit(models.Model):

    class OccupiedStatus(EnumWithChoices):
        OCCUPIED = "occupied", _("Occupied")
        VACANT = "vacant", _("Vacant")

    name = models.CharField(
        max_length=100,
        verbose_name=_("Name"),
        help_text=_("Name of the unit e.g Second Floor Room 2"),
        unique=True,
    )
    abbreviated_name = models.CharField(
        max_length=20,
        verbose_name=_("Abbreviated name"),
        help_text=_("Short name of the unit e.g SFR2"),
    )
    occupied_status = models.BooleanField(
        default=False,
        verbose_name=_("Is Occupied"),
        help_text=_("Whether the unit is currently occupied"),
    )

    occupied_status = models.CharField(
        max_length=20,
        choices=OccupiedStatus.choices(),
        default=OccupiedStatus.VACANT.value,
        verbose_name=_("Occupied Status"),
        help_text=_("Whether the unit is currently occupied"),
    )
    unit_group = models.ForeignKey(
        UnitGroup,
        on_delete=models.CASCADE,
        verbose_name=_("unit group"),
        help_text=_("UnitGroup which the unit belongs to."),
        null=False,
        blank=False,
    )

    class Meta:
        verbose_name = _("Unit")
        verbose_name_plural = _("Units")


class House(models.Model):
    address = models.CharField(
        max_length=200,
        verbose_name=_("Address"),
        help_text=_("Physical address of the house"),
        unique=True,
    )
    picture = models.ImageField(
        verbose_name=_("Picture"),
        help_text=_("Photo of the house"),
        upload_to=generate_document_filepath,
        default="default/apartment-2138949_1920.jpg",
        null=False,
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
        verbose_name = _("House")
        verbose_name_plural = _("Houses")

    def __str__(self):
        return f"{self.address} - {'Occupied' if self.is_occupied else 'Vacant'}"

    def model_dump(self):
        return dict(
            id=self.id,
            address=self.address,
            is_occupied=self.is_occupied,
            picture=self.picture.name,
            updated_at=self.updated_at,
            created_at=self.created_at,
        )


class Tenant(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        verbose_name=_("User"),
        help_text=_("User associated with the tenant"),
    )
    house = models.OneToOneField(
        House,
        on_delete=models.SET_NULL,
        verbose_name=_("House"),
        help_text=_("House rented by the tenant"),
        null=True,
        blank=True,
    )
    lease_start_date = models.DateField(
        verbose_name=_("Lease Start Date"),
        help_text=_("Start date of the lease agreement"),
    )
    lease_end_date = models.DateField(
        verbose_name=_("Lease End Date"),
        help_text=_("End date of the lease agreement"),
        null=True,
        blank=True,
    )
    contact_number = models.CharField(
        max_length=20,
        verbose_name=_("Contact Number"),
        help_text=_("Phone number of the tenant"),
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
        verbose_name = _("Tenant")
        verbose_name_plural = _("Tenants")

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.house.address if self.house else 'No House Assigned'}"

    def model_dump(self):
        return dict(
            id=self.id,
            user_id=self.user.id,
            house_id=self.house.id if self.house else None,
            lease_start_date=self.lease_start_date,
            lease_end_date=self.lease_end_date,
            contact_number=self.contact_number,
            updated_at=self.updated_at,
            created_at=self.created_at,
        )
