from django.contrib import admin
from external.models import About, ServiceFeedback, Message, Gallery, FAQ, Document
from django.utils.translation import gettext_lazy as _

# from unfold.admin import ModelAdmin
from rental_ms.utils.admin import (
    DevelopmentImportExportModelAdmin,
    CustomImportExportModelAdmin,
)

# Register your models here.
# ModelAdmin =   # admin.ModelAdmin


@admin.register(About)
class AboutAdmin(DevelopmentImportExportModelAdmin):
    list_display = ("name", "short_name", "founded_in", "updated_at")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "short_name",
                    "slogan",
                    "details",
                )
            },
        ),
        (
            _("Address & History"),
            {
                "fields": (
                    "address",
                    "founded_in",
                )
            },
        ),
        (
            _("Contact"),
            {
                "fields": (
                    "phone_number",
                    "email",
                )
            },
        ),
        (
            _("Social Media"),
            {
                "fields": (
                    "facebook",
                    "twitter",
                    "linkedin",
                    "instagram",
                    "tiktok",
                    "youtube",
                )
            },
        ),
        (
            _("Media"),
            {"fields": ("logo", "wallpaper")},
        ),
        (_("Timestamps"), {"fields": ("updated_at", "created_at")}),
    )
    readonly_fields = ("updated_at", "created_at")


@admin.register(ServiceFeedback)
class ServiceFeedbackAdmin(DevelopmentImportExportModelAdmin):
    list_display = ("sender", "rate", "message","show_in_index", "sender_role", "created_at")
    search_fields = ("sender__username", "message")
    list_filter = ("rate", "sender_role", "show_in_index", "updated_at", "created_at")
    list_editable = ("show_in_index",)
    ordering = ("-created_at",)
    fieldsets = (
        (None, {"fields": ("sender", "message")}),
        (_("Details"), {"fields": ("sender_role", "rate"), "classes": ["tab"]}),
        (_("Timestamps"), {"fields": ("updated_at", "created_at"), "classes": ["tab"]}),
    )
    readonly_fields = ("updated_at", "created_at")


@admin.register(Message)
class MessageAdmin(DevelopmentImportExportModelAdmin):
    list_display = ("sender", "body", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("sender", "message")
    list_editable = ("is_read",)
    ordering = ("-created_at",)
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "sender",
                    "email",
                    "body",
                )
            },
        ),
        (_("Status & Date"), {"fields": ("is_read", "created_at")}),
    )
    readonly_fields = ("created_at",)  # "sender", "email", "body")


@admin.register(FAQ)
class FAQAdmin(CustomImportExportModelAdmin):
    list_display = ("question", "is_shown", "created_at")
    list_filter = ("is_shown", "created_at")
    search_fields = ("question", "answer")
    list_editable = ("is_shown",)
    ordering = ("-created_at",)

    fieldsets = (
        (None, {"fields": ("question", "answer")}),
        (_("Status & Date"), {"fields": ("is_shown", "created_at")}),
    )
    readonly_fields = ("created_at",)


@admin.register(Gallery)
class GalleryAdmin(DevelopmentImportExportModelAdmin):
    list_display = ("title", "location_name", "date", "show_in_index", "updated_at")
    list_filter = ("show_in_index", "date", "updated_at", "created_at")
    search_fields = ("title", "details", "location_name")
    list_editable = ("show_in_index",)
    ordering = ("-date", "-created_at")
    fieldsets = (
        (None, {"fields": ("title", "details", "location_name")}),
        (
            _("Media"),
            {"fields": ("picture", "youtube_video_link")},
        ),
        (
            _("Status & Date"),
            {"fields": ("show_in_index", "date", "updated_at", "created_at")},
        ),
    )
    readonly_fields = ("updated_at", "created_at")


@admin.register(Document)
class DocumentAdmin(DevelopmentImportExportModelAdmin):
    list_display = ("name", "updated_at", "created_at")
    list_filter = list_display
    search_fields = ("content",)
    ordering = ("-created_at",)
    fieldsets = (
        (
            None,
            {
                "fields": ("name", "content"),
            },
        ),
        (_("Timestamps"), {"fields": ("created_at", "updated_at")}),
    )
    readonly_fields = ("created_at", "updated_at")
