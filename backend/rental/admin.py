from django.contrib import admin
from rental.models import Service, Appointment, VehicleCategory, Branch
from django.utils.translation import gettext_lazy as _
from rental_ms.utils.admin import (
    DevelopmentImportExportModelAdmin,
)

# Register your models here.


@admin.register(Service)
class ServiceAdmin(DevelopmentImportExportModelAdmin):

    def pending_appointments(self, obj: Service) -> int:
        return obj.appointments.filter(
            status=Appointment.AppointmentStatus.PENDING.value
        ).count()

    def completed_appointments(self, obj: Service) -> int:
        return obj.appointments.filter(
            status=Appointment.AppointmentStatus.COMPLETED.value
        ).count()

    def confirmed_appointments(self, obj: Service) -> int:
        return obj.appointments.filter(
            status=Appointment.AppointmentStatus.CONFIRMED.value
        ).count()

    pending_appointments.short_description = _("Pending Appointments")
    completed_appointments.short_description = _("Completed Appointments")
    confirmed_appointments.short_description = _("Confirmed Appointments")
    list_display = (
        "name",
        "vehicle_category",
        "pending_appointments",
        "confirmed_appointments",
        "completed_appointments",
        "charges",
    )
    list_filter = ("created_at",)
    search_fields = ("name",)
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "vehicle_category",
                    "description",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Charges & Duration"),
            {"fields": ("charges", "period_in_minutes"), "classes": ["tab"]},
        ),
        (_("Media & Date"), {"fields": ("picture", "created_at"), "classes": ["tab"]}),
    )
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(VehicleCategory)
class VehicleCategoryAdmin(DevelopmentImportExportModelAdmin):
    list_display = ("name", "created_at", "updated_at")
    search_fields = ("name", "vehicles")
    list_filter = ("created_at", "updated_at")
    fieldsets = (
        (
            None,
            {
                "fields": ("name", "vehicles"),
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


@admin.register(Branch)
class BranchAdmin(DevelopmentImportExportModelAdmin):
    list_display = (
        "name",
        "branch_manager",
        "capacity",
        "operation_status",
        "created_at",
    )
    search_fields = ("name", "address", "branch_manager__username")
    list_filter = ("operation_status", "created_at", "updated_at")
    fieldsets = (
        (
            None,
            {
                "fields": ("name", "address", "branch_manager", "capacity"),
                "classes": ["tab"],
            },
        ),
        (
            _("Further Details"),
            {
                "fields": ("operation_status", "telephone_number", "picture"),
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


@admin.register(Appointment)
class AppointmentAdmin(DevelopmentImportExportModelAdmin):
    list_display = (
        "customer",
        "service",
        "branch",
        "vehicle_plate_number",
        "appointment_datetime",
        "status",
        "updated_at",
    )
    list_editable = ("status",)
    search_fields = (
        "customer__username",
        "service__name",
        "branch__name",
        "vehicle_plate_number",
        "status",
    )
    list_filter = ("status", "appointment_datetime", "created_at", "updated_at")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "customer",
                    "service",
                    "branch",
                    "vehicle_plate_number",
                    "appointment_datetime",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Status & Notes"),
            {"fields": ("status", "notes"), "classes": ["tab"]},
        ),
        (
            _("Extra fees"),
            {"fields": ("extra_fees",), "classes": ["tab"]},
        ),
        (
            _("Notification Flags"),
            {
                "fields": (
                    "user_is_notified_confirmed",
                    "user_is_notified_completed",
                    "user_is_notified_cancelled",
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
