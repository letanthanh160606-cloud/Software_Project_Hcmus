import uuid
from datetime import datetime, timezone
from typing import Sequence
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.models import SocialAccount, OAuthState, PostDistribution, Post


class DistributionRepository:
    """
    Data Access Layer (Repository) for Distribution module.
    Encapsulates all database queries and transactions.
    """

    def __init__(self, db: Session):
        self.db = db

    # --- OAuthState Operations ---

    def create_oauth_state(
        self,
        state: str,
        user_id: uuid.UUID,
        platform: str,
        metadata_json: dict | None,
        expires_at: datetime,
    ) -> OAuthState:
        oauth_state = OAuthState(
            state=state,
            user_id=user_id,
            platform=platform,
            metadata_json=metadata_json,
            expires_at=expires_at,
        )
        self.db.add(oauth_state)
        self.db.commit()
        self.db.refresh(oauth_state)
        return oauth_state

    def get_oauth_state(self, state: str) -> OAuthState | None:
        return self.db.get(OAuthState, state)

    def delete_oauth_state(self, state: str) -> None:
        oauth_state = self.get_oauth_state(state)
        if oauth_state:
            self.db.delete(oauth_state)
            self.db.commit()

    # --- SocialAccount Channel Operations ---

    def create_channel(
        self,
        *,
        platform: str,
        platform_account_id: str,
        display_name: str,
        note: str | None,
        owner_type: str,
        owner_id: str,
        connected_by: uuid.UUID,
        access_token_encrypted: str | None,
        refresh_token_encrypted: str | None,
        token_expires_at: datetime | None,
        status: str = "active",
        enabled_for_workspace: bool = True,
    ) -> SocialAccount:
        existing = self.db.scalar(
            select(SocialAccount).where(
                SocialAccount.platform == platform,
                SocialAccount.platform_account_id == platform_account_id,
            )
        )
        if existing:
            existing.display_name = display_name
            existing.note = note
            existing.owner_type = owner_type
            existing.owner_id = owner_id
            existing.connected_by = connected_by
            existing.access_token_encrypted = access_token_encrypted
            existing.refresh_token_encrypted = refresh_token_encrypted
            existing.token_expires_at = token_expires_at
            existing.status = status
            existing.enabled_for_workspace = enabled_for_workspace
            self.db.commit()
            self.db.refresh(existing)
            return existing

        channel = SocialAccount(
            platform=platform,
            platform_account_id=platform_account_id,
            display_name=display_name,
            note=note,
            owner_type=owner_type,
            owner_id=owner_id,
            connected_by=connected_by,
            access_token_encrypted=access_token_encrypted,
            refresh_token_encrypted=refresh_token_encrypted,
            token_expires_at=token_expires_at,
            status=status,
            enabled_for_workspace=enabled_for_workspace,
        )
        self.db.add(channel)
        self.db.commit()
        self.db.refresh(channel)
        return channel

    def get_channel_by_id(self, channel_id: uuid.UUID) -> SocialAccount | None:
        return self.db.get(SocialAccount, channel_id)

    def list_channels_by_owner(self, owner_type: str, owner_id: str) -> Sequence[SocialAccount]:
        query = (
            select(SocialAccount)
            .where(
                SocialAccount.owner_type == owner_type,
                SocialAccount.owner_id == owner_id,
            )
            .order_by(SocialAccount.created_at.desc())
        )
        return self.db.scalars(query).all()

    def list_enabled_workspace_channels(self, workspace_id: str) -> Sequence[SocialAccount]:
        """
        List channels for a workspace that have enabled_for_workspace=True (used by Members).
        """
        query = (
            select(SocialAccount)
            .where(
                SocialAccount.owner_type == "workspace",
                SocialAccount.owner_id == workspace_id,
                SocialAccount.enabled_for_workspace == True,
            )
            .order_by(SocialAccount.created_at.desc())
        )
        return self.db.scalars(query).all()

    def update_channel(self, channel: SocialAccount, updates: dict) -> SocialAccount:
        for field, value in updates.items():
            setattr(channel, field, value)
        self.db.commit()
        self.db.refresh(channel)
        return channel

    def delete_channel(self, channel: SocialAccount) -> None:
        self.db.delete(channel)
        self.db.commit()

    # --- 409 Delete Guard Checks ---

    def count_active_posts_for_channel(self, channel_id: uuid.UUID) -> int:
        """
        Checks if there are any posts associated with this channel that are in:
        - 'pending_review'
        - 'ready_for_distribution'
        - 'pending' (in PostDistribution)

        Returns active post count (>0 means block deletion with 409 Conflict).
        """
        # 1. Check junction table post_distributions with status 'pending'
        dist_count = self.db.scalar(
            select(func.count())
            .select_from(PostDistribution)
            .where(
                PostDistribution.channel_id == channel_id,
                PostDistribution.status.in_(["pending", "queued"]),
            )
        ) or 0

        # 2. Check if posts in pending_review or ready_for_distribution are linked via post_distributions
        linked_active_posts = self.db.scalar(
            select(func.count())
            .select_from(PostDistribution)
            .join(Post, PostDistribution.post_id == Post.id)
            .where(
                PostDistribution.channel_id == channel_id,
                Post.status.in_(["pending_review", "ready_for_distribution"]),
            )
        ) or 0

        return dist_count + linked_active_posts
