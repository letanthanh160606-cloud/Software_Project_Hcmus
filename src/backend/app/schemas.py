import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=2, max_length=100, description="Full name / display name")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    account_type: Literal["individual", "business"] = "individual"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    users_uuid: uuid.UUID
    username: str
    email: EmailStr
    account_type: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
