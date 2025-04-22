"""Utility functions for user fastapi-app"""

from fastapi import Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordBearer
from typing import Annotated
from users.models import CustomUser
from rental_ms.utils import generate_random_token
import uuid
import random
from string import ascii_lowercase
import asyncio

token_id = "rms_"
"""First characters of every user auth-token"""

v1_auth_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/account/token",
    description="Generated API authentication token",
)


async def get_user(token: Annotated[str, Depends(v1_auth_scheme)]) -> CustomUser:
    """Ensures token passed match the one set"""
    if token:
        try:
            if token.startswith(token_id):

                def fetch_user(token) -> CustomUser:
                    return CustomUser.objects.select_related("account").get(token=token)

                return await asyncio.to_thread(fetch_user, token)

        except CustomUser.DoesNotExist:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def generate_token() -> str:
    """Generates api token"""
    return token_id + str(uuid.uuid4()).replace("-", random.choice(ascii_lowercase))


def generate_password_reset_token(length: int = 8) -> str:
    return generate_random_token(length)
