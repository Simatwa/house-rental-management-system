from django.db import models
from users.models import CustomUser
from management.models import Office
from finance.models import Transaction
from rental_ms.utils import (
    EnumWithChoices,
    generate_document_filepath,
    generate_random_token,
)
from management.models import Community
from django.utils.translation import gettext_lazy as _
from django.core.mail import send_mail
from django.core.validators import RegexValidator
from django.template.loader import render_to_string
from django.utils import timezone
from finance.models import ExtraFee
from ckeditor.fields import RichTextField
from dateutil.relativedelta import relativedelta
from management.models import PersonalMessage, CommunityMessage
from rental_ms import settings


# Create your models here
class House(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_("House name"),
        help_text=_("Identity name of the house"),
        unique=True,
    )
    office = models.ForeignKey(
        Office,
        on_delete=models.RESTRICT,
        verbose_name=_("Office"),
        help_text=_("Office in charge of managing the house"),
        related_name="houses",
        blank=True,
        null=True,
    )
    address = models.CharField(
        max_length=200,
        verbose_name=_("Address"),
        help_text=_("Physical address of the house"),
    )
    description = RichTextField(
        verbose_name=_("Description"),
        help_text=_("Description of the house"),
    )
    picture = models.ImageField(
        verbose_name=_("Picture"),
        help_text=_("Photo of the house"),
        upload_to=generate_document_filepath,
        default="default/apartment-2138949_1920.jpg",
        null=False,
        blank=True,
    )
    communities = models.ManyToManyField(
        Community,
        blank=True,
        verbose_name=_("Communities"),
        help_text=_("Social communities"),
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
        return f"{self.name} - {self.address}"

    def model_dump(self):
        return dict(
            id=self.id,
            name=self.name,
            office_id=self.office.id,
            address=self.address,
            description=self.description,
            picture=self.picture.name,
            communities_ids=[community.id for community in self.communities.all()],
        )


class UnitGroup(models.Model):
    house = models.ForeignKey(
        House,
        on_delete=models.CASCADE,
        verbose_name=_("House"),
        help_text=_("House which the unit-group belongs to."),
        related_name="unit_groups",
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name"),
        help_text=_("Name of the unit group e.g Second Floor"),
        unique=False,
    )
    abbreviated_name = models.CharField(
        max_length=20,
        verbose_name=_("Abbreviated name"),
        help_text=_("Short name of the unitgroup e.g SF"),
    )
    description = RichTextField(
        verbose_name=_("Description"),
        help_text=_("Description of the unit group"),
        blank=True,
        null=True,
    )
    number_of_units = models.IntegerField(
        verbose_name=_("Number of units"),
        help_text=_("Total number of units (rooms)"),
        null=False,
        blank=False,
    )
    picture = models.ImageField(
        verbose_name=_("Picture"),
        help_text=_("Photo of the units"),
        upload_to=generate_document_filepath,
        default="default/house-7124141_1920.jpg",
        null=False,
        blank=True,
    )
    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_("Monthly Rent"),
        help_text=_("Monthly rent amount for the units"),
        null=False,
        blank=False,
    )
    deposit_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name=_("Deposit amount"),
        help_text=_("Initial amount tenants have to pay."),
        default=0,
        null=False,
        blank=False,
    )
    caretakers = models.ManyToManyField(
        CustomUser,
        verbose_name=_("Caretaker"),
        help_text=_("Persons in charge of routine and minor tasks"),
        related_name="unit_groups",
        blank=True,
    )
    unit_name_format = models.CharField(
        max_length=200,
        verbose_name=_("Unit name format"),
        help_text=_(
            "Format for generating unit name. "
            "Use placeholders %(name)s and %(unit_number)s."
        ),
        default="%(name)s Room %(unit_number)s",
        validators=[
            RegexValidator(
                regex=r"^.*%\((name|unit_number)\)s.*$",
                message=_(
                    "Placeholders must only use 'name' or 'unit_number' with 's'."
                ),
                code="invalid_placeholder_format",
            )
        ],
    )
    unit_abbreviated_name_format = models.CharField(
        max_length=200,
        verbose_name=_("Unit abbreviated name format"),
        help_text=_(
            "Format for generating abbreviated unit name. "
            "Use placeholders %(abbreviated_name)s and %(unit_number)s ."
        ),
        default="%(abbreviated_name)sR%(unit_number)s",
        validators=[
            RegexValidator(
                regex=r"^.*%\((abbreviated_name|unit_number)\)s.*$",
                message=_(
                    "Placeholders must only use 'abbreviated_name' or 'unit_number' with 's'."
                ),
                code="invalid_placeholder_format",
            )
        ],
    )
    last_rent_payment_date = models.DateField(
        null=False,
        blank=True,
        auto_now=True,
        verbose_name=_("Last rent payment date"),
        help_text=_("Last rent payment date"),
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
        return f"{self.house.name} - {self.name} ({self.abbreviated_name})"

    def generate_unit_name(self, unit_number: int):
        return self.unit_name_format % dict(
            name=self.name, unit_number=str(unit_number)
        )

    def generate_abbr_unit_name(self, unit_number: int):
        return self.unit_abbreviated_name_format % dict(
            abbreviated_name=self.abbreviated_name, unit_number=str(unit_number)
        )

    def save(self, *args, **kwargs):
        if self.id is None:
            # Initial save
            super().save(*args, **kwargs)
            self.refresh_from_db()
        saved_units_query = Unit.objects.filter(unit_group=self).all()
        total_current_units = saved_units_query.count()
        if total_current_units < self.number_of_units:
            # add the units
            next_unit_no = total_current_units + 1
            for _ in range(self.number_of_units - total_current_units):
                new_unit = Unit.objects.create(
                    name=self.generate_unit_name(next_unit_no),
                    abbreviated_name=self.generate_abbr_unit_name(next_unit_no),
                    unit_group=self,
                )
                new_unit.save()
                next_unit_no += 1
        else:
            # Maybe others were occasionally added
            pass
        super().save(*args, **kwargs)

    def model_dump(self):
        return dict(
            id=self.id,
            house_id=self.house.id,
            name=self.name,
            abbreviated_name=self.abbreviated_name,
            description=self.description,
            number_of_units=self.number_of_units,
            number_of_vacant_units=self.units.filter(occupied_status="Vacant").count(),
            picture=self.picture.name,
            deposit_amount=self.deposit_amount,
            monthly_rent=self.monthly_rent,
            caretakers_ids=[caretaker.id for caretaker in self.caretakers.all()],
        )

    def process_rent_payments(self):
        search_filter = dict(
            occupied_status=Unit.OccupiedStatus.OCCUPIED.value,
        )
        if not settings.DEMO:
            # For demo we ensure it works
            search_filter["last_rent_payment_date__month"] = (
                timezone.now() - relativedelta(months=1)
            ).month

        for unit in self.units.filter(**search_filter).all():
            Transaction.objects.create(
                user=unit.tenant.user,
                type=Transaction.TransactionType.RENT_PAYMENT.value,
                means=Transaction.TransactionMeans.CASH.value,
                amount=self.monthly_rent,
                reference=generate_random_token(),
                notes="Monthly payment",
            ).save()
            unit.last_rent_payment_date = timezone.now().date()
            unit.save()
            PersonalMessage.objects.create(
                tenant=unit.tenant,
                category=CommunityMessage.MessageCategory.PAYMENT.value,
                subject="Monthly Rent",
                content="Your monthly rent has been processed successfully.",
            ).save()
        self.last_rent_payment_date = timezone.now().date()
        self.save()


class Unit(models.Model):

    class OccupiedStatus(EnumWithChoices):
        OCCUPIED = "Occupied"
        VACANT = "Vacant"
        CLOSED = "Closed"

    unit_group = models.ForeignKey(
        UnitGroup,
        on_delete=models.CASCADE,
        verbose_name=_("unit group"),
        help_text=_("UnitGroup which the unit belongs to."),
        related_name="units",
        null=False,
        blank=False,
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name"),
        help_text=_("Name of the unit e.g Second Floor Room 2"),
        unique=False,
    )
    abbreviated_name = models.CharField(
        max_length=20,
        verbose_name=_("Abbreviated name"),
        help_text=_("Short name of the unit e.g SFR2"),
    )

    occupied_status = models.CharField(
        max_length=20,
        choices=OccupiedStatus.choices(),
        default=OccupiedStatus.VACANT.value,
        verbose_name=_("Occupied Status"),
        help_text=_("Whether this unit is currently Vacant/Occupied/Closed"),
    )
    last_rent_payment_date = models.DateField(
        null=False, blank=True, auto_now=True, verbose_name=_("Last rent payment date")
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
        verbose_name = _("Unit")
        verbose_name_plural = _("Units")

    def __str__(self):
        return f"{self.name} ({self.abbreviated_name})"

    def model_dump(self):
        return dict(
            id=self.id,
            name=self.name,
            abbreviated_name=self.abbreviated_name,
            occupied_status=self.occupied_status,
            unit_group_id=self.unit_group.id,
            last_rent_payment_date=self.last_rent_payment_date,
        )


class Tenant(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        verbose_name=_("User"),
        help_text=_("User associated with the tenant"),
        related_name="tenant",
    )
    unit = models.OneToOneField(
        Unit,
        on_delete=models.CASCADE,
        verbose_name=_("Unit"),
        help_text=_("Person who occupies this unit."),
        related_name="tenant",
        blank=True,
        null=True,
    )
    lease_start_date = models.DateField(
        verbose_name=_("Lease Start Date"),
        help_text=_("Start date of the lease agreement"),
        default=timezone.now,
    )
    lease_end_date = models.DateField(
        verbose_name=_("Lease End Date"),
        help_text=_("End date of the lease agreement"),
        null=True,
        blank=True,
    )
    extra_fees = models.ManyToManyField(
        ExtraFee,
        verbose_name=_("Extra fees"),
        help_text=_("Extra fees other than unit rent."),
        blank=True,
        related_name="tenants",
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
        return f"{self.user} - {self.unit.abbreviated_name if self.unit else '[No Unit Assigned]'}"

    def _update_unit_status(self, status: Unit.OccupiedStatus):
        if self.unit is not None:
            self.unit.occupied_status = status
            self.unit.save()

    def save(self, *args, **kwargs):
        if self.id is None:
            # TODO: Welcome tenant via email
            self.unit.last_rent_payment_date = timezone.now().date()
            pass
        super().save(*args, **kwargs)
        self._update_unit_status("Occupied")

    def delete(self, *args, **kwargs):
        self._update_unit_status("Vacant")
        super().delete(*args, **kwargs)

    def model_dump(self):
        return dict(
            id=self.id,
            user_id=self.user.id,
            unit_id=self.unit.id,
            lease_start_date=self.lease_start_date,
            lease_end_date=self.lease_end_date,
            updated_at=self.updated_at,
            created_at=self.created_at,
        )
