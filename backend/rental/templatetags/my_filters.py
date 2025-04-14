from django import template
from django.conf import settings
from os import path

register = template.Library()


def format_money_value(value):
    return f"{value:,}" if value else 0


def endpoint_url(path_value):
    return path.join(settings.SITE_ADDRESS, path_value)


register.filter("format_money_value", format_money_value)

register.filter("endpoint_url", endpoint_url)
