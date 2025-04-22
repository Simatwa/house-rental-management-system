from django.db import models

# Create your models here.
from django.utils.translation import gettext_lazy as _
from rental_ms.utils import EnumWithChoices
from ckeditor.fields import RichTextField
from rental_ms.settings import CURRENCY


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


class Transaction(models.Model):
    class TransactionMeans(EnumWithChoices):
        CASH = "Cash"
        MPESA = "M-PESA"
        BANK = "Bank"
        OTHER = "Other"

    class TransactionType(EnumWithChoices):
        DEPOSIT = "Deposit"
        WITHDRAWAL = "Withdrawal"
        RENT_PAYMENT = "Rent Payment"
        FEE_PAYMENT = "Fee Payment"

    user = models.ForeignKey(
        "users.CustomUser",
        verbose_name=_("User"),
        on_delete=models.CASCADE,
        help_text=_("User account to deposit to."),
        related_name="transactions",
    )
    type = models.CharField(
        max_length=30,
        verbose_name=_("Type"),
        help_text=_("Transaction type"),
        choices=TransactionType.choices(),
        null=False,
        blank=False,
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_(f"Transaction amount in {CURRENCY}"),
    )
    means = models.CharField(
        max_length=20,
        choices=TransactionMeans.choices(),
        default=TransactionMeans.MPESA.value,
        help_text=_("Select means of transaxtion"),
    )
    reference = models.CharField(
        max_length=100, help_text=_("Transaction ID or -- for cash."), default="--"
    )
    notes = RichTextField(
        verbose_name="Notes",
        null=True,
        blank=True,
        help_text=_("Further transaction details"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("created at"),
        help_text=_("Date and time when the entry was created"),
    )

    def __str__(self):
        return (
            f"Amount {CURRENCY}. {self.amount} via {self.means} (Ref: {self.reference})"
        )

    def save(self, *args, **kwargs):
        # if self.id:
        #    raise Exception("Transaction cannot be edited")
        # import traceback
        # traceback.print_stack()
        # print(self.amount)
        # Race condition here
        if self.type == self.TransactionType.DEPOSIT.value:
            self.user.account.balance += self.amount
        else:
            self.user.account.balance -= self.amount
        self.user.account.save()
        super().save(*args, **kwargs)


class ExtraFee(models.Model):
    name = models.CharField(max_length=100, help_text=_("Fee name"), unique=True)
    details = models.TextField(help_text=_("What is this fee for?"))
    amount = models.DecimalField(
        max_digits=8, decimal_places=2, help_text=_(f"Fee amount in {CURRENCY}")
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
        return f"{self.name} ({CURRENCY}.{self.amount})"

    def model_dump(self):
        return dict(
            name=self.name,
            details=self.details,
            amount=self.amount,
            updated_at=self.updated_at,
            created_at=self.created_at,
        )
