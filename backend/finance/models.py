from django.db import models

# Create your models here.
from django.utils.translation import gettext_lazy as _
from rental_ms.utils import EnumWithChoices


class Account(models.Model):
    name = models.CharField(max_length=50, help_text=_("Account name e.g M-PESA"))
    paybill_number = models.CharField(
        max_length=100, help_text=_("Paybill number e.g 247247")
    )
    account_number = models.CharField(
        max_length=100,
        default="%(username)s",
        help_text=_(
            "Any or combination of %(id)d, %(username)s,%(phone_number)s, %(email)s etc"
        ),
    )
    is_active = models.BooleanField(default=True, help_text=_("Account active status"))
    details = models.TextField(
        null=True, blank=True, help_text=_("Information related to this account.")
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
        return self.name

    class Meta:
        verbose_name_plural = _("Account Details")


class UserAccount(models.Model):
    balance = models.DecimalField(
        max_digits=8, decimal_places=2, help_text=_("Account balance"), default=0
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

    @property
    def debt_amount(self):
        return 0 if self.balance > 0 else abs(self.balance)

    def __str__(self):
        return str(self.balance)


class Payment(models.Model):
    class PaymentMethod(EnumWithChoices):
        CASH = "Cash"
        MPESA = "m-pesa"
        BANK = "Bank"
        OTHER = "Other"

    user = models.ForeignKey(
        "users.CustomUser",
        verbose_name=_("User"),
        on_delete=models.CASCADE,
        help_text=_("User account to deposit to."),
        related_name="payments",
    )

    amount = models.DecimalField(
        max_digits=10, decimal_places=2, help_text=_("Transaction amount in Ksh")
    )
    method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices(),
        default=PaymentMethod.MPESA.value,
        help_text=_("Select means of payment"),
    )
    reference = models.CharField(
        max_length=100, help_text=_("Transaction ID or -- for cash.")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("created at"),
        help_text=_("Date and time when the entry was created"),
    )

    def __str__(self):
        return f"Amount Ksh.{self.amount} via {self.method} (Ref: {self.reference})"

    def save(self, *args, **kwargs):
        if self.id:
            raise Exception("Payments cannot be edited")
        self.user.account.balance += self.amount
        self.user.account.save()
        super().save(*args, **kwargs)


class ExtraFee(models.Model):
    name = models.CharField(max_length=100, help_text=_("Fee name"), unique=True)
    details = models.TextField(help_text=_("What is this fee for?"))
    amount = models.DecimalField(
        max_digits=8, decimal_places=2, help_text=_("Fee amount in Ksh")
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
        return f"{self.name} (Ksh.{self.amount})"

    def model_dump(self):
        return dict(
            name=self.name,
            details=self.details,
            amount=self.amount,
            updated_at=self.updated_at,
            created_at=self.created_at,
        )
