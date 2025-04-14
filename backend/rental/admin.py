from django.contrib import admin
from rental.models import House, UnitGroup, Unit, Tenant
from django.utils.translation import gettext_lazy as _
from rental_ms.utils.admin import (
    DevelopmentImportExportModelAdmin,
)


# Register your models here.
@admin.register(House)
class HouseAdmin(DevelopmentImportExportModelAdmin):
    def total_unit_groups(cls, obj: House):
        return obj.unit_groups.count()

    total_unit_groups.description = _("Total unit groups")
    list_display = (
        "name",
        "total_unit_groups",
        "office",
        "address",
        "created_at",
        "updated_at",
    )
    search_fields = ("name", "address", "office__name")
    list_filter = ("created_at", "updated_at", "communities")
    fieldsets = (
        (
            None,
            {
                "fields": ("name", "office", "address", "description"),
                "classes": ["tab"],
            },
        ),
        (
            _("Media"),
            {"fields": ("picture",), "classes": ["tab"]},
        ),
        (
            _("Communities"),
            {"fields": ("communities",), "classes": ["tab"]},
        ),
        (
            _("Timestamps"),
            {"fields": ("created_at", "updated_at"), "classes": ["tab"]},
        ),
    )
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(UnitGroup)
class UnitGroupAdmin(DevelopmentImportExportModelAdmin):
    list_display = (
        "name",
        "house",
        "number_of_units",
        "monthly_rent",
        "created_at",
        "updated_at",
    )
    search_fields = ("name", "house__name", "caretakers__username")
    list_filter = ("created_at", "updated_at", "house")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "house",
                    "name",
                    "abbreviated_name",
                    "description",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Units, Rent & Media"),
            {
                "fields": ("number_of_units", "monthly_rent", "picture"),
                "classes": ["tab"],
            },
        ),
        (
            _("Caretakers"),
            {"fields": ("caretakers",), "classes": ["tab"]},
        ),
        (
            _("Unit Name Formats"),
            {
                "fields": (
                    "unit_name_format",
                    "unit_abbreviated_name_format",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Timestamps"),
            {"fields": ("created_at", "updated_at"), "classes": ["tab"]},
        ),
    )
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(Unit)
class UnitAdmin(DevelopmentImportExportModelAdmin):
    list_display = (
        "name",
        "abbreviated_name",
        "unit_group",
        "tenant",
        "occupied_status",
        "created_at",
        "updated_at",
    )
    search_fields = ("name", "abbreviated_name", "unit_group__name", "tenant__username")
    list_filter = ("occupied_status", "created_at", "updated_at", "unit_group")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "unit_group",
                    "name",
                    "abbreviated_name",
                ),
                "classes": ["tab"],
            },
        ),
        (
            "Tenant & Occupied Status",
            {
                "fields": (
                    "tenant",
                    "occupied_status",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Timestamps"),
            {"fields": ("created_at", "updated_at"), "classes": ["tab"]},
        ),
    )
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(Tenant)
class TenantAdmin(DevelopmentImportExportModelAdmin):

    def debt_amount(self, obj: Tenant) -> int:
        return obj.user.account.debt_amount

    debt_amount.short_description = _("Debt Amount")
    list_display = (
        "user",
        "unit",
        "debt_amount",
        "lease_start_date",
        "lease_end_date",
        "created_at",
        "updated_at",
    )
    search_fields = ("user__username", "user__email")
    list_filter = ("lease_start_date", "lease_end_date", "created_at", "updated_at")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "user",
                    "unit",
                    "lease_start_date",
                    "lease_end_date",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Extra fees"),
            {
                "fields": ("extra_fees",),
                "classes": ["tab"],
            },
        ),
        (
            _("Timestamps"),
            {"fields": ("created_at", "updated_at"), "classes": ["tab"]},
        ),
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )
    ordering = ("-created_at",)
