import uuid
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import User, SocialAccount, Workspace, WorkspaceMember, Post
from app import crud
from app.distribution.schemas import (
    ChannelInitiateResponse,
    ChannelResponse,
    ChannelListResponse,
    ChannelUpdateRequest,
    ChannelToggleWorkspaceResponse,
)
from app.distribution.token_encryption import encrypt_token, decrypt_token
from app.distribution.oauth_providers import (
    FacebookOAuthProvider,
    LinkedInOAuthProvider,
    OAuthProviderError,
)
from app.distribution.repository import DistributionRepository
from sqlalchemy import select


class DistributionService:
    """
    Business Logic Layer for Distribution Module.
    Separates domain logic from routers and repositories.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = DistributionRepository(db)
        self.settings = get_settings()

    # --- Context & Authorization Helpers ---

    def _determine_owner_and_role(self, user: User, workspace_id: str | None = None) -> tuple[str, str, str]:
        """
        Determines (owner_type, owner_id, derived_role) based on user's account_type and workspace context.

        Returns:
        - owner_type: 'workspace' | 'individual'
        - owner_id: workspace_uuid | user_uuid_str
        - role: 'manager' | 'member' | 'individual'
        """
        user_role = crud.derive_role(self.db, user)

        if user.account_type == "individual" or user_role == "individual":
            return "individual", str(user.users_uuid), "individual"

        # Business user
        if not workspace_id:
            # Try to resolve user's primary workspace
            managed_ws = self.db.query(Workspace).filter(Workspace.manager_id == user.users_uuid).first()
            if managed_ws:
                return "workspace", managed_ws.workspace_uuid, "manager"

            membership = self.db.query(WorkspaceMember).filter(
                WorkspaceMember.user_id == user.users_uuid,
                WorkspaceMember.status == "active"
            ).first()
            if membership:
                return "workspace", membership.workspace_id, "member"

            # Fallback to individual
            return "individual", str(user.users_uuid), "individual"

        # Explicit workspace_id provided
        ws = crud.get_workspace_by_id(self.db, workspace_id)
        if not ws:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

        if ws.manager_id == user.users_uuid:
            return "workspace", ws.workspace_uuid, "manager"

        if crud.user_can_access_workspace(self.db, user=user, workspace_id=workspace_id):
            return "workspace", ws.workspace_uuid, "member"

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this workspace"
        )

    # --- 1. Initiate OAuth Connection ---

    def initiate_channel_connect(
        self,
        user: User,
        platform: str,
        note: str | None = None,
        channel_name: str | None = None,
        workspace_id: str | None = None,
    ) -> ChannelInitiateResponse:
        """
        OAuth Step 1: Generates a CSRF 'state' token, saves it temporarily with metadata,
        and returns the provider's authorization URL.
        """
        owner_type, owner_id, role = self._determine_owner_and_role(user, workspace_id)

        if role == "member":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Workspace Members are not authorized to connect new channels. Only Managers can add channels."
            )

        # Generate secure random state token
        state_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=self.settings.oauth_state_expire_seconds)

        metadata = {
            "note": note,
            "channel_name": channel_name,
            "owner_type": owner_type,
            "owner_id": owner_id,
        }

        # Save state to DB
        self.repo.create_oauth_state(
            state=state_token,
            user_id=user.users_uuid,
            platform=platform,
            metadata_json=metadata,
            expires_at=expires_at,
        )

        # Build Authorization URL
        if platform == "facebook":
            auth_url = FacebookOAuthProvider.get_authorization_url(state_token)
        elif platform == "linkedin":
            is_ws = (owner_type == "workspace")
            auth_url = LinkedInOAuthProvider.get_authorization_url(state_token, is_workspace=is_ws)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported platform '{platform}'. Allowed: facebook, linkedin"
            )

        return ChannelInitiateResponse(
            authorization_url=auth_url,
            state=state_token,
            expires_in_seconds=self.settings.oauth_state_expire_seconds,
        )

    # --- 2. OAuth Callback ---

    def handle_oauth_callback(self, code: str, state_token: str) -> ChannelResponse:
        """
        OAuth Step 2: Validates state token, exchanges code for long-lived tokens via server-to-server call,
        encrypts tokens with AES/Fernet, and saves the SocialAccount record.
        """
        # 1. Retrieve & validate state
        oauth_state = self.repo.get_oauth_state(state_token)
        if not oauth_state:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Invalid or expired OAuth state token (CSRF check failed)."
            )

        now_tz = datetime.now(timezone.utc)
        if oauth_state.expires_at < now_tz:
            self.repo.delete_oauth_state(state_token)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="OAuth state token has expired. Please initiate connection again."
            )

        metadata = oauth_state.metadata_json or {}
        platform = oauth_state.platform
        user_id = oauth_state.user_id
        owner_type = metadata.get("owner_type", "individual")
        owner_id = metadata.get("owner_id", str(user_id))
        note = metadata.get("note")
        channel_name_input = metadata.get("channel_name")

        # 2. Exchange code for access tokens via server-to-server provider call
        try:
            if platform == "facebook":
                token_result = FacebookOAuthProvider.exchange_code(code, state_token, channel_name_input)
            elif platform == "linkedin":
                token_result = LinkedInOAuthProvider.exchange_code(code, state_token, channel_name_input)
            else:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid platform in state")
        except OAuthProviderError as exc:
            self.repo.delete_oauth_state(state_token)
            raise HTTPException(status_code=exc.status_code, detail=str(exc))

        # 3. Encrypt access & refresh tokens before saving to database
        enc_access_token = encrypt_token(token_result.access_token)
        enc_refresh_token = encrypt_token(token_result.refresh_token)

        # 4. Create or update SocialAccount
        display_name = channel_name_input or token_result.display_name

        channel = self.repo.create_channel(
            platform=platform,
            platform_account_id=token_result.platform_account_id,
            display_name=display_name,
            note=note,
            owner_type=owner_type,
            owner_id=owner_id,
            connected_by=user_id,
            access_token_encrypted=enc_access_token,
            refresh_token_encrypted=enc_refresh_token,
            token_expires_at=token_result.token_expires_at,
            status="active",
            enabled_for_workspace=True,
        )

        # 5. Clean up consumed OAuth state token
        self.repo.delete_oauth_state(state_token)

        return ChannelResponse.model_validate(channel)

    # --- 3. List Channels ---

    def list_channels(self, user: User, workspace_id: str | None = None) -> ChannelListResponse:
        """
        Lists connected channels according to user role and workspace context.
        - Manager: sees all workspace channels (enabled or disabled).
        - Individual: sees own personal channels.
        - Member: read-only list of workspace channels WHERE enabled_for_workspace=True.
        """
        owner_type, owner_id, role = self._determine_owner_and_role(user, workspace_id)

        if role == "member":
            channels = self.repo.list_enabled_workspace_channels(owner_id)
        else:
            channels = self.repo.list_channels_by_owner(owner_type, owner_id)

        response_items = [ChannelResponse.model_validate(c) for c in channels]
        return ChannelListResponse(channels=response_items, total=len(response_items))

    # --- 4. Toggle Workspace Enable ---

    def toggle_workspace_enable(self, user: User, channel_id: uuid.UUID) -> ChannelToggleWorkspaceResponse:
        """
        Allows Manager to toggle 'enabled_for_workspace' flag for a workspace channel.
        Members and Individual users are forbidden from calling this.
        """
        channel = self.repo.get_channel_by_id(channel_id)
        if not channel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

        if channel.owner_type != "workspace":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Enable for Workspace toggle is only applicable to Workspace channels."
            )

        # Resource-level authorization: caller must be Manager of this workspace
        ws = crud.get_workspace_by_id(self.db, channel.owner_id)
        if not ws or ws.manager_id != user.users_uuid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the Workspace Manager can toggle channel availability for members."
            )

        # Toggle flag
        new_val = not channel.enabled_for_workspace
        self.repo.update_channel(channel, {"enabled_for_workspace": new_val})

        msg = "Channel enabled for Workspace members" if new_val else "Channel hidden from Workspace members"
        return ChannelToggleWorkspaceResponse(id=channel.id, enabled_for_workspace=new_val, message=msg)

    # --- 5. Update Channel ---

    def update_channel(self, user: User, channel_id: uuid.UUID, payload: ChannelUpdateRequest) -> ChannelResponse:
        """
        Updates display_name or note of a channel.
        Caller must be the owner (Manager for workspace, User for individual).
        """
        channel = self.repo.get_channel_by_id(channel_id)
        if not channel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

        # Resource-level authorization
        self._verify_channel_management_permission(user, channel)

        updates = {}
        if payload.display_name is not None:
            updates["display_name"] = payload.display_name
        if payload.note is not None:
            updates["note"] = payload.note

        updated_channel = self.repo.update_channel(channel, updates)
        return ChannelResponse.model_validate(updated_channel)

    # --- 6. Delete Channel (with 409 Guard) ---

    def delete_channel(self, user: User, channel_id: uuid.UUID) -> None:
        """
        Disconnects and deletes a channel.
        409 CONFLICT GUARD: Blocks deletion if channel has posts in 'pending_review' or 'ready_for_distribution'.
        """
        channel = self.repo.get_channel_by_id(channel_id)
        if not channel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

        # Resource-level authorization
        self._verify_channel_management_permission(user, channel)

        # 409 CONFLICT GUARD: check active posts linked to this channel
        active_posts_count = self.repo.count_active_posts_for_channel(channel_id)
        if active_posts_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Cannot disconnect channel '{channel.display_name}'. "
                    f"There are {active_posts_count} post(s) currently in 'Pending Review' or 'Ready for Distribution' "
                    "associated with this channel. Please review or cancel those posts first."
                )
            )

        self.repo.delete_channel(channel)

    # --- Helper: Verify Management Permission ---

    def _verify_channel_management_permission(self, user: User, channel: SocialAccount) -> None:
        """Verifies caller has write/delete rights on the specific channel resource."""
        if channel.owner_type == "individual":
            if channel.owner_id != str(user.users_uuid) and channel.connected_by != user.users_uuid:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to manage this personal channel."
                )
        elif channel.owner_type == "workspace":
            ws = crud.get_workspace_by_id(self.db, channel.owner_id)
            if not ws or ws.manager_id != user.users_uuid:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the Workspace Manager can edit or delete workspace channels."
                )

    # --- 7. Publish Post to Channel ---

    def publish_post_to_channel(self, user: User, post_id: uuid.UUID, channel_id: uuid.UUID | None = None) -> dict:
        """
        Publishes a post content to a connected Facebook/LinkedIn channel via Graph API.
        """
        # 1. Fetch Post
        post = self.db.scalar(select(Post).where(Post.id == post_id))
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # 2. Get Channel
        if channel_id:
            channel = self.repo.get_channel_by_id(channel_id)
        else:
            owner_type, owner_id, _ = self._determine_owner_and_role(user)
            channels = self.repo.list_channels_by_owner(owner_type, owner_id)
            channel = channels[0] if channels else None

        if not channel:
            raise HTTPException(status_code=400, detail="No connected active social channel found")

        # 3. Decrypt Access Token
        access_token = decrypt_token(channel.access_token_encrypted)
        if not access_token:
            raise HTTPException(status_code=400, detail="Invalid channel access token")

        # 4. Publish via Facebook Graph API
        if channel.platform == "facebook":
            post_text = f"{post.title}\n\n{post.content}" if post.content else post.title
            target_id = channel.platform_account_id
            url = f"https://graph.facebook.com/v19.0/{target_id}/feed"

            import httpx
            with httpx.Client(timeout=15.0) as client:
                res = client.post(
                    url,
                    data={
                        "message": post_text,
                        "access_token": access_token,
                    },
                )

                if res.status_code not in (200, 201):
                    # Try fallback to /me/feed
                    res_me = client.post(
                        "https://graph.facebook.com/v19.0/me/feed",
                        data={"message": post_text, "access_token": access_token},
                    )
                    if res_me.status_code not in (200, 201):
                        raise HTTPException(
                            status_code=400,
                            detail=f"Facebook Publish error: {res_me.text or res.text}",
                        )
                    fb_data = res_me.json()
                else:
                    fb_data = res.json()

                fb_post_id = fb_data.get("id")

                # Update Post status
                post.status = "ready_for_distribution"
                post.published_at = datetime.now(timezone.utc)
                self.db.commit()

                return {
                    "success": True,
                    "platform": "facebook",
                    "facebook_post_id": fb_post_id,
                    "channel_name": channel.display_name,
                    "message": "Post successfully published to Facebook!",
                }
        else:
            raise HTTPException(status_code=400, detail=f"Publishing to {channel.platform} is not supported yet.")
