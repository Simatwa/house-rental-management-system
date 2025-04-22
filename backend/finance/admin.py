from django.contrib import admin

# Register your models here.
from finance.models import Account, UserAccount, Transaction, ExtraFee
from finance.forms import TransactionForm
from django.utils.translation import gettext_lazy as _
from rental_ms.utils.admin import DevelopmentImportExportModelAdmin


@admin.register(Account)
class AccountAdmin(DevelopmentImportExportModelAdmin):
    list_display = (
        "name",
        "paybill_number",
        "account_number",
        "is_active",
        "created_at",
        "updated_at",
    )
    search_fields = ("name", "paybill_number")
    list_filter = ("is_active", "created_at", "updated_at")


@admin.register(UserAccount)
class UserAccountAdmin(DevelopmentImportExportModelAdmin):
    list_display = ("user", "balance", "created_at", "updated_at")
    search_fields = (
        "user",
        "balance",
    )
    list_filter = ("user", "updated_at", "created_at")
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=...):
        return False

    def has_change_permission(self, request, obj=...):
        return False


@admin.register(Transaction)
class TransactionAdmin(DevelopmentImportExportModelAdmin):
    form = TransactionForm
    list_display = (
        "user",
        "type",
        "amount",
        "means",
        "reference",
        "created_at",
    )
    search_fields = ("user__username", "reference", "type")
    list_filter = ("type", "means", "created_at")
    ordering = ("-created_at",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "user",
                    "type",
                ),
            },
        ),
        (
            _("Details"),
            {
                "fields": (
                    "amount",
                    "means",
                    "reference",
                )
            },
        ),
        (
            _("Notes"),
            {
                "fields": ("notes",),
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("created_at",),
            },
        ),
    )

    readonly_fields = ("created_at",)

    def has_delete_permission(self, request, obj=...):
        return False

    def has_change_permission(self, request, obj=...):
        return True


@admin.register(ExtraFee)
class ExtraFeeAdmin(DevelopmentImportExportModelAdmin):
    def total_tenants_charged(self, obj: ExtraFee) -> int:
        return obj.tenants.count()

    total_tenants_charged.short_description = _("Total tenants charged")

    list_display = (
        "name",
        "amount",
        "total_tenants_charged",
        "updated_at",
        "created_at",
    )
    search_fields = ("name",)
    list_filter = ("updated_at", "created_at")
