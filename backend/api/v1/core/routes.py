"""User routes"""

from fastapi import (
    APIRouter,
    status,
    HTTPException,
    Depends,
    Query,
    Path,
)
from fastapi.encoders import jsonable_encoder

router = APIRouter(prefix="/user", tags=["Core"])
