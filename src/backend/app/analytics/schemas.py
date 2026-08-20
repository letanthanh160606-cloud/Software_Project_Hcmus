import uuid
from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, Field


class MetricItem(BaseModel):
    impressions: int = Field(default=0, ge=0)
    reach: int = Field(default=0, ge=0)
    views: int = Field(default=0, ge=0)
    likes: int = Field(default=0, ge=0)
    comments: int = Field(default=0, ge=0)
    shares: int = Field(default=0, ge=0)
    clicks: int = Field(default=0, ge=0)


class BatchRecordItem(BaseModel):
    channel_id: uuid.UUID
    external_post_id: str
    metric_date: date
    post_id: uuid.UUID | None = None
    platform: str | None = None
    metrics: MetricItem


class BatchIngestRequest(BaseModel):
    schema_version: str = Field(default="1.0", description="Data contract schema version")
    platform: str = "multi-channel"
    ingestion_run_id: uuid.UUID
    records: list[BatchRecordItem]


class BatchIngestResponse(BaseModel):
    run_id: uuid.UUID
    status: str
    total_records: int
    success_count: int
    error_count: int
    message: str = "Ingestion completed"


class TimelineResponse(BaseModel):
    timeframe: str
    labels: list[str]
    series: dict[str, list[int]]


class PlatformOverview(BaseModel):
    total_attraction: int
    percentage: int
    total_engagements: int


class OverviewResponse(BaseModel):
    facebook: PlatformOverview
    linkedin: PlatformOverview


class TodayStatsResponse(BaseModel):
    role: str
    total_interactions_today: int
    user_contribution_today: int
    date: str


class TopPostItem(BaseModel):
    id: uuid.UUID | str
    title: str
    platform: str
    published_url: str | None = None
    total_engagements: int
    engagement_rate: float
    thumbnail_url: str | None = None


class TopPostsResponse(BaseModel):
    posts: list[TopPostItem]


class GenerateReportRequest(BaseModel):
    timeframe: Literal["Weekly", "Monthly", "Yearly"] = "Monthly"
    period: str | None = None


class GenerateReportResponse(BaseModel):
    timeframe: str
    title: str
    summary: str
    structured_insights: dict | None = None


class SaveReportRequest(BaseModel):
    title: str
    timeframe: str
    summary: str
    report_data: dict | None = None


class ReportItemResponse(BaseModel):
    id: uuid.UUID
    name: str
    savedDate: str
    data: str = "Document"
    timeframe: str
    download_url: str


class ReportListResponse(BaseModel):
    reports: list[ReportItemResponse]


class ActivePostSyncItem(BaseModel):
    post_id: uuid.UUID
    workspace_id: str | None = None
    channel_id: uuid.UUID
    platform: str
    platform_account_id: str
    external_post_id: str | None = None
    published_url: str | None = None
    published_at: datetime | None = None


class ActivePostsSyncResponse(BaseModel):
    total_posts: int
    posts: list[ActivePostSyncItem]


class KpiGoalRequest(BaseModel):
    target_interactions: int = Field(ge=1, description="Target interactions for the month")
    month_year: str | None = Field(default=None, description="Month-Year format YYYY-MM, e.g. 2026-08")


class KpiGoalResponse(BaseModel):
    workspace_id: str
    month_year: str
    target_interactions: int
    current_interactions: int
    progress_percentage: int
    message: str = "KPI Goal fetched successfully"

