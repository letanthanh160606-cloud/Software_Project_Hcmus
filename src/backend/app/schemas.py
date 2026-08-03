import re
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

PIN_PATTERN = re.compile(r"^\d{4,8}$")
WORKSPACE_ID_LENGTH = 16


class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6, description="6-digit OTP code")


class VerifyOTPResponse(BaseModel):
    message: str = "Email verified successfully"
    verification_token: str
    expires_in: int = 900  # 15 minutes in seconds


class RegisterRequest(BaseModel):
    """
    Registration payload covering three flows, selected via account_type /
    business_role:

    1. account_type="individual"
       -> only username/email/password are used, a personal account is created.

    2. account_type="business", business_role="manager"
       -> also requires workspace_name + workspace_pin.
          A brand new workspace is created and the user becomes its manager.

    3. account_type="business", business_role="member"
       -> also requires workspace_id + workspace_pin.
          The user joins the existing workspace identified by workspace_id,
          provided workspace_pin matches that workspace's PIN.
    """

    username: str = Field(min_length=2, max_length=100, description="Full name / display name")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    verification_token: str = Field(..., description="Issued verification_token after successful OTP verification")
    account_type: Literal["individual", "business"] = "individual"

    # Only relevant when account_type == "business"
    business_role: Literal["manager", "member"] | None = None

    # Only relevant when business_role == "manager"
    workspace_name: str | None = Field(default=None, min_length=2, max_length=150)

    # Only relevant when business_role == "member"
    workspace_id: str | None = Field(default=None, min_length=WORKSPACE_ID_LENGTH, max_length=WORKSPACE_ID_LENGTH)

    # Relevant for both manager (sets the PIN) and member (submits the PIN)
    workspace_pin: str | None = None

    @model_validator(mode="after")
    def validate_business_fields(self) -> "RegisterRequest":
        if self.account_type == "individual":
            return self

        # account_type == "business"
        if self.business_role is None:
            raise ValueError("business_role ('manager' or 'member') is required when account_type is 'business'")

        if self.workspace_pin is None or not PIN_PATTERN.match(self.workspace_pin):
            raise ValueError("workspace_pin must be 4 to 8 digits")

        if self.business_role == "manager":
            if not self.workspace_name or not self.workspace_name.strip():
                raise ValueError("workspace_name is required when business_role is 'manager'")
        else:  # member
            if not self.workspace_id or len(self.workspace_id) != WORKSPACE_ID_LENGTH:
                raise ValueError(f"workspace_id is required and must be {WORKSPACE_ID_LENGTH} characters")

        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    users_uuid: uuid.UUID
    username: str
    email: EmailStr
    account_type: str
    role: str = ""
    created_at: datetime


class WorkspaceInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    workspace_id: str = Field(validation_alias="workspace_uuid")
    workspace_name: str = Field(validation_alias="workspacename")


class RegisterResponse(BaseModel):
    user: UserResponse
    # Present only for business accounts (manager who just created a
    # workspace, or member who just joined one).
    workspace: WorkspaceInfo | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class WorkspaceDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    workspace_id: str = Field(validation_alias="workspace_uuid")
    workspace_name: str = Field(validation_alias="workspacename")
    manager_id: uuid.UUID
    created_at: datetime
    member_count: int = 0


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    username: str
    email: EmailStr
    status: str
    joined_at: datetime


class DistributorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    social_acc_id: uuid.UUID
    platform: str
    platform_account_name: str
    status: str
    connected_at: datetime


class PostCreate(BaseModel):
    workspace_id: str | None = Field(
        default=None,
        min_length=WORKSPACE_ID_LENGTH,
        max_length=WORKSPACE_ID_LENGTH,
    )

    title: str | None = Field(
        default=None,
        max_length=255,
    )

    content: str = ""

    prompt_template_id: uuid.UUID | None = None
    knowledge_base_id: uuid.UUID | None = None

    seo_keywords: list[str] | None = None
    seo_hashtags: list[str] | None = None


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: str | None
    author_id: uuid.UUID

    title: str | None
    content: str = ""
    status: str

    prompt_template_id: uuid.UUID | None = None
    knowledge_base_id: uuid.UUID | None = None

    ai_generated: bool = False
    seo_keywords: list[str] | None = None
    seo_hashtags: list[str] | None = None

    submitted_at: datetime | None = None
    reviewed_by: uuid.UUID | None = None
    reviewed_at: datetime | None = None
    reject_reason: str | None = None
    published_at: datetime | None = None

    created_at: datetime
    updated_at: datetime


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: str
    title: str
    status: str
    priority: str
    assigned_to: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class DistributorUpdateRequest(BaseModel):
    platform_account_name: str | None = None
    status: str | None = None


class PostUpdateRequest(BaseModel):
    title: str | None = None
    content: str | None = None
    status: Literal[
        "draft", "pending_review", "rejected", "ready_for_distribution", "published", "failed"
    ] | None = None


class TaskCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = ""
    priority: Literal["low", "medium", "high", "urgent"] = "medium"
    assigned_to: uuid.UUID | None = None


class TaskUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = None
    status: Literal["todo", "in_progress", "review", "completed", "cancelled"] | None = None
    priority: Literal["low", "medium", "high", "urgent"] | None = None
    assigned_to: uuid.UUID | None = None
