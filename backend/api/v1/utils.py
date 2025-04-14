"""Utilities fuctions for v1
"""

import uuid
import random
import os
from string import ascii_lowercase, ascii_uppercase, digits
from rental_ms.utils import send_email as django_send_email
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone

token_id = "rms_"


def generate_token() -> str:
    """Generates api token"""
    return token_id + str(uuid.uuid4()).replace("-", random.choice(ascii_lowercase))


def generate_password_reset_token(length: int = 8) -> str:
    population = list(ascii_uppercase + digits)
    return "".join(random.sample(population, length))


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
