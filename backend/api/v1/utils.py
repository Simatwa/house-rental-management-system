"""Utilities fuctions for v1
"""

import os
from rental_ms.utils import send_email as django_send_email
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone


def get_value(optional, default):
    return optional if optional is not None else default


def get_template_path(template_name: str) -> str:
    return os.path.join(
        "api/v1/",
        template_name if template_name.endswith(".html") else template_name + ".html",
    )


def send_email(subject: str, recipient: str, template_name: str, context: dict):
    context.update(
        {
            "site_name": settings.SITE_NAME,
            "year": timezone.now().year,
            "date": timezone.now().date(),
        }
    )
    email_body = render_to_string(
        get_template_path(template_name),
        context=context,
    )
    return django_send_email(
        subject=subject, message="", recipient=recipient, html_message=email_body
    )
