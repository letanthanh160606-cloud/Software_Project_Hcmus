import uuid
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

PlatformType = Literal["facebook", "linkedin"]


class ChannelInitiateRequest(BaseModel):
    """Query parameters to initiate the OAuth 2.0 connection flow."""
    platform: PlatformType
    note: str | None = Field(default=None, max_length=500, description="Optional note for the channel")
    channel_name: str | None = Field(default=None, max_length=200, description="Optional display name for the channel")


class ChannelInitiateResponse(BaseModel):
    """Response containing OAuth authorization URL and CSRF state token."""
    authorization_url: str
    state: str
    expires_in_seconds: int = 300


class OAuthCallbackParams(BaseModel):
    """OAuth callback query parameters returned by social provider."""
    code: str
    state: str


class ChannelResponse(BaseModel):
    """
    Public representation of a connected SocialAccount channel.
    SECURITY NOTICE: NEVER include access_token or refresh_token (encrypted or decrypted) in response.
    """
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    platform: str
    platform_account_id: str
    display_name: str
    note: str | None = None
    owner_type: str
    owner_id: str
    connected_by: uuid.UUID
    status: str
    enabled_for_workspace: bool
    created_at: datetime


class ChannelListResponse(BaseModel):
    """List response wrapper for channels."""
    channels: list[ChannelResponse]
    total: int


class ChannelUpdateRequest(BaseModel):
    """Payload to update channel note or display name."""
    display_name: str | None = Field(default=None, min_length=1, max_length=200)
    note: str | None = Field(default=None, max_length=500)


class ChannelToggleWorkspaceResponse(BaseModel):
    """Response for toggling enabled_for_workspace flag."""
    id: uuid.UUID
    enabled_for_workspace: bool
    message: str
