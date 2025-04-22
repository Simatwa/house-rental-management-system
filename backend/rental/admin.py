from django.contrib import admin
from rental.models import House, UnitGroup, Unit, Tenant
from django.utils.translation import gettext_lazy as _
from rental_ms.utils.admin import (
    DevelopmentImportExportModelAdmin,
)
from datetime import timedelta
from django.utils import timezone


# Register your models here.
@admin.register(House)
class HouseAdmin(DevelopmentImportExportModelAdmin):
    def total_unit_groups(cls, obj: House):
        return obj.unit_groups.count()

    total_unit_groups.short_description = _("No. of unit groups")

    def total_units(cls, obj: House):
        return Unit.objects.filter(unit_group__house=obj).count()

    total_units.short_description = _("No. of units")

    def total_vacant_units(cls, obj: House):
        return Unit.objects.filter(
            unit_group__house=obj, occupied_status=Unit.OccupiedStatus.VACANT.value
        ).count()

    total_vacant_units.short_description = _("No. of vacant units")

    def total_occupied_units(cls, obj: House):
        return Unit.objects.filter(
            unit_group__house=obj, occupied_status=Unit.OccupiedStatus.OCCUPIED.value
        ).count()

    total_occupied_units.short_description = _("No. of occcupied units")

    def monthly_income(cl, obj: House):
        net_income = sum(
            unit_group.monthly_rent
            * Unit.objects.filter(
                unit_group=unit_group,
                occupied_status=Unit.OccupiedStatus.OCCUPIED.value,
            ).count()
            for unit_group in obj.unit_groups.all()
        )
        return f"Ksh. {net_income:,}"

    monthly_income.short_description = _("Monthly income")

    list_display = (
        "name",
        "office",
        "address",
        "total_unit_groups",
        "total_units",
        "total_occupied_units",
        "total_vacant_units",
        "monthly_income",
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
    def pay_rent_action(modeladmin, request, queryset: list[UnitGroup]):
        for unit_group in queryset:
            unit_group.process_rent_payments()
        modeladmin.message_user(
            request, _("Rent payment processed for selected unit groups.")
        )

    pay_rent_action.short_description = "Process monthly rent payment"

    def total_occupied_units(cls, obj: Unit):
        return obj.units.filter(
            occupied_status=Unit.OccupiedStatus.OCCUPIED.value
        ).count()

    total_occupied_units.short_description = _("No. of occupied units")

    def total_vacant_units(cls, obj: Unit):
        return obj.units.filter(
            occupied_status=Unit.OccupiedStatus.VACANT.value
        ).count()

    total_vacant_units.short_description = _("No. of vacant units")

    def total_closed_units(cls, obj: Unit):
        return obj.units.filter(
            occupied_status=Unit.OccupiedStatus.CLOSED.value
        ).count()

    total_closed_units.short_description = _("No. of closed units")

    def monthly_income(cl, obj: House):
        net_income = (
            obj.monthly_rent
            * Unit.objects.filter(
                unit_group=obj, occupied_status=Unit.OccupiedStatus.OCCUPIED.value
            ).count()
        )
        return f"Ksh. {net_income:,}"

    monthly_income.short_description = _("Monthly income")

    actions = ["delete_selected", "pay_rent_action"]

    list_display = (
        "name",
        "house",
        "monthly_rent",
        "last_rent_payment_date",
        "number_of_units",
        "total_occupied_units",
        "total_vacant_units",
        "total_closed_units",
        "monthly_income",
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
            _("Units & Payments"),
            {
                "fields": (
                    "number_of_units",
                    "monthly_rent",
                    "deposit_amount",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Caretakers & Media"),
            {"fields": ("caretakers", "picture"), "classes": ["tab"]},
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
            {
                "fields": ("last_rent_payment_date", "created_at", "updated_at"),
                "classes": ["tab"],
            },
        ),
    )
    readonly_fields = ("last_rent_payment_date", "created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(Unit)
class UnitAdmin(DevelopmentImportExportModelAdmin):
    list_display = (
        "name",
        "abbreviated_name",
        "unit_group__name",
        "unit_group__house__name",
        "tenant",
        "occupied_status",
        "updated_at",
    )
    search_fields = (
        "name",
        "abbreviated_name",
        "unit_group__name",
        "tenant__user__username",
    )
    list_filter = (
        "occupied_status",
        "unit_group",
        "unit_group__house",
        "updated_at",
        "created_at",
    )
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
            {
                "fields": ("last_rent_payment_date", "created_at", "updated_at"),
                "classes": ["tab"],
            },
        ),
    )
    readonly_fields = ("tenant", "last_rent_payment_date", "created_at", "updated_at")
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
