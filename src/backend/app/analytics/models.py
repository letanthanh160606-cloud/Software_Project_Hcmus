import uuid
from datetime import date, datetime
from sqlalchemy import (
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"
    __table_args__ = {"schema": "analytics"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    platform: Mapped[str] = mapped_column(String(20), nullable=False)  # 'facebook' | 'linkedin'
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="running"
    )  # 'running' | 'success' | 'failed'
    total_records: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    success_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    events: Mapped[list["IngestionEvent"]] = relationship(
        back_populates="run", cascade="all, delete-orphan"
    )


class IngestionEvent(Base):
    __tablename__ = "ingestion_events"
    __table_args__ = {"schema": "analytics"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analytics.ingestion_runs.id", ondelete="CASCADE"),
        nullable=False,
    )
    external_post_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # 'success' | 'error'
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    run: Mapped["IngestionRun"] = relationship(back_populates="events")


class EngagementMetric(Base):
    __tablename__ = "engagement_metrics"
    __table_args__ = (
        UniqueConstraint(
            "channel_id",
            "external_post_id",
            "metric_date",
            name="uq_metric_channel_post_date",
        ),
        {"schema": "analytics"},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    workspace_id: Mapped[str] = mapped_column(
        String(16),
        ForeignKey("workspaces.workspaces.workspace_uuid", ondelete="CASCADE"),
        nullable=False,
    )
    post_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.posts.id", ondelete="SET NULL"),
        nullable=True,
    )
    channel_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.social_accounts.id", ondelete="CASCADE"),
        nullable=False,
    )
    platform: Mapped[str] = mapped_column(String(20), nullable=False)  # 'facebook' | 'linkedin'
    external_post_id: Mapped[str] = mapped_column(String(255), nullable=False)
    metric_date: Mapped[date] = mapped_column(Date, nullable=False)

    impressions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reach: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    views: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    likes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    comments: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    shares: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    clicks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    engagements: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    engagement_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    snapshot_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"
    __table_args__ = (
        UniqueConstraint(
            "workspace_id",
            "platform",
            "snapshot_date",
            name="uq_analytics_ws_platform_date",
        ),
        {"schema": "analytics"},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    workspace_id: Mapped[str] = mapped_column(
        String(16),
        ForeignKey("workspaces.workspaces.workspace_uuid", ondelete="CASCADE"),
        nullable=False,
    )
    platform: Mapped[str] = mapped_column(
        String(20), nullable=False, default="all"
    )  # 'facebook' | 'linkedin' | 'all'
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)

    total_reach: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_impressions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_engagements: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    active_posts_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = {"schema": "analytics"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    workspace_id: Mapped[str] = mapped_column(
        String(16),
        ForeignKey("workspaces.workspaces.workspace_uuid", ondelete="CASCADE"),
        nullable=False,
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("Users.users.users_uuid", ondelete="SET NULL"),
        nullable=True,
    )
    timeframe: Mapped[str] = mapped_column(
        String(20), nullable=False, default="Monthly"
    )  # 'Weekly' | 'Monthly' | 'Yearly'
    period_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    period_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    report_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    saved_date: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    exports: Mapped[list["ReportExport"]] = relationship(
        back_populates="report", cascade="all, delete-orphan"
    )


class ReportExport(Base):
    __tablename__ = "report_exports"
    __table_args__ = {"schema": "analytics"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analytics.reports.id", ondelete="CASCADE"),
        nullable=False,
    )
    export_format: Mapped[str] = mapped_column(
        String(10), nullable=False, default="pdf"
    )  # 'pdf' | 'json'
    file_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    report: Mapped["Report"] = relationship(back_populates="exports")


class WorkspaceKpiGoal(Base):
    __tablename__ = "workspace_kpi_goals"
    __table_args__ = (
        UniqueConstraint("workspace_id", "month_year", name="uq_workspace_kpi_month"),
        {"schema": "analytics"},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    workspace_id: Mapped[str] = mapped_column(String(16), nullable=False)
    month_year: Mapped[str] = mapped_column(String(7), nullable=False)  # e.g. '2026-08'
    target_interactions: Mapped[int] = mapped_column(Integer, nullable=False, default=500)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
