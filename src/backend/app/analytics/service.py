import logging
import uuid
from datetime import date, datetime, timedelta, timezone
from sqlalchemy import desc, func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session, selectinload
from cryptography.fernet import Fernet

from app.analytics.ai_engine import ai_report_engine
from app.analytics.models import (
    AnalyticsSnapshot,
    EngagementMetric,
    IngestionEvent,
    IngestionRun,
    Report,
    ReportExport,
)
from app.analytics.schemas import (
    BatchIngestRequest,
    BatchIngestResponse,
    GenerateReportResponse,
    OverviewResponse,
    PlatformOverview,
    ReportItemResponse,
    ReportListResponse,
    SaveReportRequest,
    TimelineResponse,
    TodayStatsResponse,
    TopPostItem,
    TopPostsResponse,
)
from app.config import get_settings
from app.models import Post, PostDistribution, PostMedia, SocialAccount, User

logger = logging.getLogger("analytics.service")


def get_timeline(db: Session, workspace_id: str, timeframe: str = "Weekly") -> TimelineResponse:
    """
    Computes real time-series interaction metrics for Facebook and LinkedIn.
    """
    timeframe_clean = timeframe.capitalize()
    labels_map = {
        "Weekly": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        "Monthly": ["Week 1", "Week 2", "Week 3", "Week 4"],
        "Yearly": ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
    }
    labels = labels_map.get(timeframe_clean, labels_map["Weekly"])

    # Query metrics from DB
    now = datetime.now(timezone.utc)
    days_back = 7 if timeframe_clean == "Weekly" else 30 if timeframe_clean == "Monthly" else 365
    start_date = (now - timedelta(days=days_back)).date()

    rows = db.scalars(
        select(EngagementMetric).where(
            EngagementMetric.workspace_id == workspace_id,
            EngagementMetric.metric_date >= start_date,
        )
    ).all()

    fb_metrics = [r for r in rows if r.platform.lower() == "facebook"]
    li_metrics = [r for r in rows if r.platform.lower() == "linkedin"]

    if fb_metrics or li_metrics:
        # Aggregate real DB points per bucket
        if timeframe_clean == "Weekly":
            # Map by weekday (0=Mon, 6=Sun)
            fb_buckets = [0] * 7
            li_buckets = [0] * 7
            for r in fb_metrics:
                idx = r.metric_date.weekday()
                if 0 <= idx < 7:
                    fb_buckets[idx] += r.engagements
            for r in li_metrics:
                idx = r.metric_date.weekday()
                if 0 <= idx < 7:
                    li_buckets[idx] += r.engagements
            fb_series = fb_buckets
            li_series = li_buckets
        else:
            fb_series = [sum(r.engagements for r in fb_metrics) // len(labels)] * len(labels)
            li_series = [sum(r.engagements for r in li_metrics) // len(labels)] * len(labels)
    else:
        fb_series = [0] * len(labels)
        li_series = [0] * len(labels)

    return TimelineResponse(
        timeframe=timeframe_clean,
        labels=labels,
        series={"facebook": fb_series, "linkedin": li_series},
    )


def get_overview(db: Session, workspace_id: str) -> OverviewResponse:
    """
    Computes overall platform attraction (impressions) and percentage share from real database records.
    """
    metrics = db.scalars(
        select(EngagementMetric).where(EngagementMetric.workspace_id == workspace_id)
    ).all()

    fb_records = [m for m in metrics if m.platform.lower() == "facebook"]
    li_records = [m for m in metrics if m.platform.lower() == "linkedin"]

    fb_attraction = sum((m.impressions or m.views) for m in fb_records)
    fb_engagements = sum(m.engagements for m in fb_records)

    li_attraction = sum((m.impressions or m.views) for m in li_records)
    li_engagements = sum(m.engagements for m in li_records)

    total_attraction = fb_attraction + li_attraction
    fb_pct = round((fb_attraction / total_attraction) * 100) if total_attraction > 0 else 0
    li_pct = round((li_attraction / total_attraction) * 100) if total_attraction > 0 else 0

    return OverviewResponse(
        facebook=PlatformOverview(
            total_attraction=fb_attraction,
            percentage=fb_pct,
            total_engagements=fb_engagements,
        ),
        linkedin=PlatformOverview(
            total_attraction=li_attraction,
            percentage=li_pct,
            total_engagements=li_engagements,
        ),
    )


def get_today_stats(db: Session, workspace_id: str, user: User, role: str) -> TodayStatsResponse:
    """
    Computes interactions recorded today filtered by RBAC workspace context.
    """
    today_date = datetime.now(timezone.utc).date()
    today_metrics = db.scalars(
        select(EngagementMetric).where(
            EngagementMetric.workspace_id == workspace_id,
            EngagementMetric.metric_date == today_date,
        )
    ).all()

    total_interactions = sum(m.engagements for m in today_metrics)
    user_contribution = total_interactions if role == "manager" else 0

    return TodayStatsResponse(
        role=role,
        total_interactions_today=total_interactions,
        user_contribution_today=user_contribution,
        date=today_date.strftime("%Y-%m-%d"),
    )


def get_top_posts(db: Session, workspace_id: str, limit: int = 7) -> TopPostsResponse:
    """
    Retrieves highest-engaging published posts for the workspace.
    """
    posts = db.scalars(
        select(Post)
        .where(
            Post.workspace_id == workspace_id,
            Post.status.in_(["published", "ready_for_distribution"]),
        )
        .options(selectinload(Post.attachment))
        .order_by(desc(Post.created_at))
        .limit(limit)
    ).all()

    items: list[TopPostItem] = []
    for p in posts:
        # Check distribution
        dist = db.scalar(select(PostDistribution).where(PostDistribution.post_id == p.id))
        pub_url = dist.published_url if dist else None

        # Check metrics
        metric = db.scalar(
            select(EngagementMetric).where(EngagementMetric.post_id == p.id)
        )
        engagements = metric.engagements if metric else 0
        eng_rate = metric.engagement_rate if metric else 0.0
        platform = metric.platform if metric else "facebook"

        thumb = p.attachment.image_url if p.attachment else None

        items.append(
            TopPostItem(
                id=p.id,
                title=p.title or p.content[:40] or "Untitled Post",
                platform=platform,
                published_url=pub_url,
                total_engagements=engagements,
                engagement_rate=eng_rate,
                thumbnail_url=thumb,
            )
        )

    # Sort by total_engagements descending
    items.sort(key=lambda x: x.total_engagements, reverse=True)
    return TopPostsResponse(posts=items[:limit])


async def generate_ai_report(
    db: Session, workspace_id: str, timeframe: str = "Monthly", period: str | None = None
) -> GenerateReportResponse:
    """
    Builds context from live DB metrics and calls AI Report Engine.
    """
    ov = get_overview(db, workspace_id)
    period_label = period or datetime.now(timezone.utc).strftime("%B %Y")

    context = {
        "workspace_id": workspace_id,
        "timeframe": timeframe,
        "period": period_label,
        "totals": {
            "total_impressions": ov.facebook.total_attraction + ov.linkedin.total_attraction,
            "total_engagements": ov.facebook.total_engagements + ov.linkedin.total_engagements,
        },
        "platforms": {
            "facebook": {
                "impressions": ov.facebook.total_attraction,
                "engagements": ov.facebook.total_engagements,
                "share_pct": ov.facebook.percentage,
            },
            "linkedin": {
                "impressions": ov.linkedin.total_attraction,
                "engagements": ov.linkedin.total_engagements,
                "share_pct": ov.linkedin.percentage,
            },
        },
    }

    result = await ai_report_engine.generate_report(context)
    return GenerateReportResponse(
        timeframe=result.get("timeframe", timeframe),
        title=result.get("title", f"[{timeframe} report for {period_label}]"),
        summary=result.get("summary", ""),
        structured_insights=result.get("structured_insights", {}),
    )


def save_report(
    db: Session, workspace_id: str, user_id: uuid.UUID | None, req: SaveReportRequest
) -> ReportItemResponse:
    """
    Persists a generated or edited report into analytics.reports.
    """
    today_str = datetime.now(timezone.utc).strftime("%b %d, %Y")
    report = Report(
        workspace_id=workspace_id,
        created_by=user_id,
        timeframe=req.timeframe,
        title=req.title,
        summary=req.summary,
        report_data=req.report_data,
        saved_date=today_str,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return ReportItemResponse(
        id=report.id,
        name=report.title,
        savedDate=report.saved_date,
        data="Document",
        timeframe=report.timeframe,
        download_url=f"/api/v1/reports/{workspace_id}/{report.id}/download",
    )


def list_reports(
    db: Session, workspace_id: str, start_date: str | None = None, end_date: str | None = None
) -> ReportListResponse:
    """
    Lists saved reports for the workspace with optional date filtering.
    """
    query = select(Report).where(Report.workspace_id == workspace_id).order_by(desc(Report.created_at))

    reports = db.scalars(query).all()

    items = [
        ReportItemResponse(
            id=r.id,
            name=r.title,
            savedDate=r.saved_date,
            data="Document",
            timeframe=r.timeframe,
            download_url=f"/api/v1/reports/{workspace_id}/{r.id}/download",
        )
        for r in reports
    ]
    return ReportListResponse(reports=items)


def handle_batch_ingestion(db: Session, req: BatchIngestRequest) -> BatchIngestResponse:
    """
    Processes batch ingestion payload from n8n with idempotent upserts.
    """
    run = db.get(IngestionRun, req.ingestion_run_id)
    if not run:
        run = IngestionRun(
            id=req.ingestion_run_id,
            platform=req.platform,
            status="running",
            total_records=len(req.records),
        )
        db.add(run)
        db.flush()
    else:
        run.status = "running"
        run.total_records = len(req.records)

    success_cnt = 0
    error_cnt = 0

    for rec in req.records:
        try:
            # Find associated workspace from channel
            channel = db.get(SocialAccount, rec.channel_id)
            if not channel:
                raise ValueError(f"Channel {rec.channel_id} not found")

            workspace_id = (
                channel.owner_id if channel.owner_type == "workspace" else "default_ws"
            )

            # Match post_id if external_post_id corresponds to a post distribution
            matched_post_id = rec.post_id
            if not matched_post_id:
                dist = db.scalar(
                    select(PostDistribution).where(
                        PostDistribution.channel_id == rec.channel_id
                    )
                )
                if dist:
                    matched_post_id = dist.post_id

            engagements = (
                rec.metrics.likes
                + rec.metrics.comments
                + rec.metrics.shares
                + rec.metrics.clicks
            )
            eng_rate = (
                round((engagements / max(rec.metrics.impressions, 1)) * 100, 2)
                if rec.metrics.impressions > 0
                else 0.0
            )

            # Upsert into analytics.engagement_metrics
            stmt = insert(EngagementMetric).values(
                id=uuid.uuid4(),
                workspace_id=workspace_id,
                post_id=matched_post_id,
                channel_id=rec.channel_id,
                platform=req.platform,
                external_post_id=rec.external_post_id,
                metric_date=rec.metric_date,
                impressions=rec.metrics.impressions,
                reach=rec.metrics.reach,
                views=rec.metrics.views,
                likes=rec.metrics.likes,
                comments=rec.metrics.comments,
                shares=rec.metrics.shares,
                clicks=rec.metrics.clicks,
                engagements=engagements,
                engagement_rate=eng_rate,
                snapshot_time=datetime.now(timezone.utc),
            )
            stmt = stmt.on_conflict_do_update(
                constraint="uq_metric_channel_post_date",
                set_={
                    "impressions": stmt.excluded.impressions,
                    "reach": stmt.excluded.reach,
                    "views": stmt.excluded.views,
                    "likes": stmt.excluded.likes,
                    "comments": stmt.excluded.comments,
                    "shares": stmt.excluded.shares,
                    "clicks": stmt.excluded.clicks,
                    "engagements": stmt.excluded.engagements,
                    "engagement_rate": stmt.excluded.engagement_rate,
                    "snapshot_time": stmt.excluded.snapshot_time,
                },
            )
            db.execute(stmt)
            success_cnt += 1

            # Log success event
            event = IngestionEvent(
                run_id=run.id,
                external_post_id=rec.external_post_id,
                status="success",
            )
            db.add(event)

        except Exception as e:
            error_cnt += 1
            logger.error(f"Error ingesting record {rec.external_post_id}: {e}")
            event = IngestionEvent(
                run_id=run.id,
                external_post_id=rec.external_post_id,
                status="error",
                error_message=str(e),
            )
            db.add(event)

    run.status = "success" if error_cnt == 0 else "partial" if success_cnt > 0 else "failed"
    run.success_count = success_cnt
    run.error_count = error_cnt
    run.finished_at = datetime.now(timezone.utc)

    db.commit()

    return BatchIngestResponse(
        run_id=run.id,
        status=run.status,
        total_records=len(req.records),
        success_count=success_cnt,
        error_count=error_cnt,
    )


def get_decrypted_token(db: Session, channel_id: uuid.UUID) -> dict[str, str]:
    """
    Safely decrypts access token from workspaces.social_accounts for authenticated n8n worker.
    """
    channel = db.get(SocialAccount, channel_id)
    if not channel:
        raise ValueError("Channel not found")

    settings = get_settings()
    fernet_key = settings.fernet_secret_key
    if not fernet_key or not channel.access_token_encrypted:
        raise ValueError("Decryption key or token is missing")

    f = Fernet(fernet_key.encode())
    decrypted_token = f.decrypt(channel.access_token_encrypted.encode()).decode()

    return {
        "channel_id": str(channel.id),
        "platform": channel.platform,
        "platform_account_id": channel.platform_account_id,
        "access_token": decrypted_token,
    }


def get_active_posts_for_sync(
    db: Session,
    platform: str | None = None,
    workspace_id: str | None = None,
    limit: int = 100,
) -> dict:
    """
    Discovery query for n8n: returns published posts with their target distribution channels.
    """
    query = (
        select(Post, PostDistribution, SocialAccount)
        .join(PostDistribution, Post.id == PostDistribution.post_id)
        .join(SocialAccount, PostDistribution.channel_id == SocialAccount.id)
        .where(
            Post.status.in_(["published", "ready_for_distribution"]),
            PostDistribution.status == "published",
            SocialAccount.status == "active",
        )
    )

    if platform:
        query = query.where(SocialAccount.platform == platform.lower())
    if workspace_id:
        query = query.where(Post.workspace_id == workspace_id)

    query = query.order_by(Post.created_at.desc()).limit(limit)
    rows = db.execute(query).all()

    items = []
    for post, dist, channel in rows:
        ext_id = dist.external_post_id or ""
        if not ext_id and dist.published_url:
            if "urn:li:share:" in dist.published_url:
                ext_id = "urn:li:share:" + dist.published_url.split("urn:li:share:")[1].split("/")[0]
            elif "story_fbid=" in dist.published_url:
                import urllib.parse
                parsed = urllib.parse.urlparse(dist.published_url)
                params = urllib.parse.parse_qs(parsed.query)
                story_fbid = params.get("story_fbid", [""])[0]
                page_id = params.get("id", [""])[0]
                ext_id = f"{page_id}_{story_fbid}" if page_id and story_fbid else story_fbid

        items.append({
            "post_id": post.id,
            "workspace_id": post.workspace_id,
            "channel_id": channel.id,
            "platform": channel.platform,
            "platform_account_id": channel.platform_account_id,
            "external_post_id": ext_id,
            "published_url": dist.published_url,
            "published_at": post.published_at or post.created_at,
        })

    return {
        "total_posts": len(items),
        "posts": items,
    }

