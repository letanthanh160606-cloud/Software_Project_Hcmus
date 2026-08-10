import uuid
from typing import Literal
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.distribution.schemas import (
    ChannelInitiateResponse,
    ChannelResponse,
    ChannelListResponse,
    ChannelUpdateRequest,
    ChannelToggleWorkspaceResponse,
)
from app.distribution.service import DistributionService

router = APIRouter(
    prefix="/api/v1/distribution/channels",
    tags=["distribution"],
)


@router.get(
    "",
    response_model=ChannelListResponse,
    summary="List connected distribution channels",
    description=(
        "Returns social accounts for the user/workspace. "
        "Managers see all workspace channels; Members see only enabled channels; Individual users see personal channels."
    ),
)
def list_channels(
    workspace_id: str | None = Query(default=None, description="Workspace ID for business users"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChannelListResponse:
    service = DistributionService(db)
    return service.list_channels(user=current_user, workspace_id=workspace_id)


@router.get(
    "/connect/initiate",
    response_model=ChannelInitiateResponse,
    summary="OAuth Step 1: Initiate channel connection",
    description=(
        "Generates a CSRF 'state' token and returns provider authorization URL to redirect user. "
        "Allowed platforms: 'facebook', 'linkedin'."
    ),
)
def initiate_channel_connection(
    platform: Literal["facebook", "linkedin"] = Query(..., description="Target platform"),
    note: str | None = Query(default=None, description="Optional note from Add Channel form"),
    channel_name: str | None = Query(default=None, description="Optional display name from Add Channel form"),
    workspace_id: str | None = Query(default=None, description="Workspace ID if connecting for workspace"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChannelInitiateResponse:
    service = DistributionService(db)
    return service.initiate_channel_connect(
        user=current_user,
        platform=platform,
        note=note,
        channel_name=channel_name,
        workspace_id=workspace_id,
    )


from fastapi.responses import RedirectResponse

@router.get(
    "/connect/callback",
    summary="OAuth Step 2: Callback after provider authorization",
    description=(
        "Exchanges authorization code for access tokens via server-to-server call. "
        "Encrypts tokens with Fernet AES, saves channel record, and redirects back to Frontend Web."
    ),
)
def handle_oauth_callback(
    code: str = Query(..., description="Authorization code from provider"),
    state: str = Query(..., description="CSRF state token issued in Step 1"),
    db: Session = Depends(get_db),
):
    service = DistributionService(db)
    service.handle_oauth_callback(code=code, state_token=state)
    return RedirectResponse(url="http://localhost:5173", status_code=status.HTTP_302_FOUND)


@router.patch(
    "/{channel_id}/toggle-workspace",
    response_model=ChannelToggleWorkspaceResponse,
    summary="Toggle channel visibility for Workspace members (Manager only)",
    description="Toggles 'enabled_for_workspace' flag. Only available to Workspace Manager on workspace channels.",
)
def toggle_workspace_enable(
    channel_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChannelToggleWorkspaceResponse:
    service = DistributionService(db)
    return service.toggle_workspace_enable(user=current_user, channel_id=channel_id)


@router.patch(
    "/{channel_id}",
    response_model=ChannelResponse,
    summary="Update channel note or display name",
    description="Updates channel metadata (note or channel_name). Requires resource ownership.",
)
def update_channel(
    channel_id: uuid.UUID,
    payload: ChannelUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChannelResponse:
    service = DistributionService(db)
    return service.update_channel(user=current_user, channel_id=channel_id, payload=payload)


@router.delete(
    "/{channel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Disconnect and delete a channel",
    description=(
        "Removes channel and encrypted tokens from CSDL. "
        "409 CONFLICT GUARD: Blocks deletion if channel has posts in 'Pending Review' or 'Ready for Distribution'."
    ),
)
def delete_channel(
    channel_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    service = DistributionService(db)
    service.delete_channel(user=current_user, channel_id=channel_id)


@router.post(
    "/publish/{post_id}",
    summary="Publish a post directly to connected Facebook/LinkedIn channel",
    description="Uses stored encrypted access token to post message directly to social platform Graph API.",
)
def publish_post(
    post_id: uuid.UUID,
    channel_id: uuid.UUID | None = Query(default=None, description="Optional channel ID to publish to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DistributionService(db)
    return service.publish_post_to_channel(user=current_user, post_id=post_id, channel_id=channel_id)
