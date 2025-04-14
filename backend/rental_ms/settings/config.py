from pydantic import BaseModel, HttpUrl
from typing import Literal, Optional, Annotated  #
from envist import Envist


class EnvSettings(BaseModel):
    """App's config parsed from .env file"""

    DATABASE_ENGINE: Literal[
        "django.db.backends.mysql",
        "django.db.backends.postgresql",
        "django.db.backends.sqlite3",
        "django.db.backends.oracle",
    ] = "django.db.backends.sqlite3"
    DATABASE_NAME: Optional[str] = "db.sqlite3"
    DATABASE_USER: str = "developer"
    DATABASE_PASSWORD: str = "development"
    DATABASE_HOST: Optional[str] = "localhost"
    DATABASE_PORT: Optional[int] = 3306

    # APPLICATION
    SECRET_KEY: Optional[str] = (
        "django-insecure-%sx#6ax4gpycp&ixq9ejj*wwtdk&#g)5@nnmp)4)_9h)h!$@kj"
    )
    DEBUG: Optional[bool] = True
    ALLOWED_HOSTS: Optional[list[str]] = ["*"]
    LANGUAGE_CODE: Optional[str] = "en-us"
    TIME_ZONE: Optional[str] = "Africa/Nairobi"
    SITE_NAME: Optional[str] = "Rental MS"
    SITE_ADDRESS: Annotated[str, HttpUrl] = "http://localhost:8000"
    FRONTEND_DIR: Optional[str] = None

    # E-MAIL
    EMAIL_BACKEND: Optional[str] = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST: Optional[str] = "smtp.gmail.com"
    EMAIL_PORT: Optional[int] = 587
    EMAIL_USE_TLS: Optional[bool] = True
    EMAIL_HOST_USER: str
    EMAIL_HOST_PASSWORD: str  # Your email password or app-specific password
    DEFAULT_FROM_EMAIL: str = None  # Optional: default sender email

    # CORS
    CORS_ALLOWED_ORIGINS: list[str] = []
    CORS_ALLOWED_ORIGIN_REGEXES: list[str] = []
    CORS_ALLOW_ALL_ORIGINS: Optional[bool] = False

    # M-PESA
    MPESA_TOKEN: Optional[str] = None
    MPESA_AUTHORIZATION: Optional[str] = None
    MPESA_PASSWORD: Optional[str] = None


env_setting = EnvSettings(**Envist().get_all())
