from django.contrib import admin
from management.models import (
    Office,
    Concern,
    Community,
    CommunityMessage,
    PersonalMessage,
)
from rental_ms.utils.admin import DevelopmentImportExportModelAdmin
from django.utils.translation import gettext_lazy as _

# Register your models here.


@admin.register(Office)
class OfficeAdmin(DevelopmentImportExportModelAdmin):
    list_display = (
        "name",
        "manager",
        "address",
        "contact_number",
        "email",
        "created_at",
    )
    search_fields = ("name", "address", "manager__username", "contact_number", "email")
    list_filter = ("manager", "created_at", "updated_at")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "manager",
                    "address",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Contacts"),
            {
                "fields": ("contact_number", "email"),
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


@admin.register(Concern)
class ConcernAdmin(DevelopmentImportExportModelAdmin):
    list_display = ("tenant", "about", "status", "updated_at", "created_at")
    list_editable_fields = ("status",)
    search_fields = ("tenant__username", "about", "details", "response", "status")
    list_filter = ("status", "updated_at", "created_at")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "tenant",
                    "about",
                    "details",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Status & Timestamps"),
            {"fields": ("status", "created_at", "updated_at"), "classes": ["tab"]},
        ),
    )
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-updated_at",)


@admin.register(Community)
class CommunityAdmin(DevelopmentImportExportModelAdmin):
    list_display = ("name", "social_media_link", "created_at", "updated_at")
    search_fields = ("name", "description", "social_media_link")
    list_filter = ("created_at", "updated_at")
    fieldsets = (
        (
            None,
            {
                "fields": ("name", "description", "social_media_link"),
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


@admin.register(PersonalMessage)
class PersonalMessageAdmin(DevelopmentImportExportModelAdmin):
    list_display = (
        "tenant",
        "category",
        "subject",
        "is_read",
        "created_at",
        "updated_at",
    )
    search_fields = ("tenant__username", "subject", "content", "category")
    list_filter = ("category", "is_read", "created_at", "updated_at")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "tenant",
                    "category",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Message"),
            {
                "fields": (
                    "subject",
                    "content",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Read Status & Timestamps"),
            {"fields": ("is_read", "created_at", "updated_at"), "classes": ["tab"]},
        ),
    )
    readonly_fields = ("created_at", "updated_at", "is_read")
    ordering = ("-created_at",)


@admin.register(CommunityMessage)
class CommunityMessageAdmin(DevelopmentImportExportModelAdmin):
    list_display = ("subject", "category", "created_at", "updated_at")
    search_fields = ("subject", "category", "communities__name")
    list_filter = ("category", "created_at", "updated_at")
    filter_horizontal = ("communities",)
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "category",
                    "communities",
                ),
                "classes": ["tab"],
            },
        ),
        (
            _("Message"),
            {
                "fields": ("subject", "content"),
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
