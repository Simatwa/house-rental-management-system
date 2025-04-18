"""Models for v1"""

from pydantic import BaseModel, Field
from typing import Any


class ProcessFeedback(BaseModel):
    detail: Any = Field(description="Feedback in details")

    class Config:
        json_schema_extra = {
            "example": {"detail": "This is a detailed feedback message."}
        }
