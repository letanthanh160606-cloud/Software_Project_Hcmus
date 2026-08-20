import logging
import uuid
from datetime import date, datetime, timedelta, timezone
from sqlalchemy import and_, desc, func, select
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
    WorkspaceKpiGoal,
)
from app.analytics.schemas import (
    BatchIngestRequest,
    BatchIngestResponse,
    GenerateReportResponse,
    KpiGoalRequest,
    KpiGoalResponse,
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
from app.models import Post, PostDistribution, PostMedia, SocialAccount, User, Workspace

logger = logging.getLogger("analytics.service")


def get_timeline(db: Session, workspace_id: str, timeframe: str = "Weekly") -> TimelineResponse:
    """
    Computes real time-series interaction metrics for Facebook and LinkedIn.
    """
    timeframe_clean = timeframe.capitalize()
    labels_map = {
        "Weekly": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "Monthly": ["Week 1", "Week 2", "Week 3", "Week 4"],
        "Yearly": ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
    }
    labels = labels_map.get(timeframe_clean, labels_map["Weekly"])

    now = datetime.now(timezone.utc)
    if timeframe_clean == "Weekly":
        # Monday of current week to end of current week
        start_date = (now - timedelta(days=now.weekday())).date()
        end_date = start_date + timedelta(days=7)
    elif timeframe_clean == "Monthly":
        # First day of current month to first day of next month
        start_date = date(now.year, now.month, 1)
        end_date = date(now.year + 1, 1, 1) if now.month == 12 else date(now.year, now.month + 1, 1)
    else:
        # First day of current year to first day of next year
        start_date = date(now.year, 1, 1)
        end_date = date(now.year + 1, 1, 1)

    # Subquery to ensure we take latest metric snapshot per post & channel per date
    subq = (
        select(
            EngagementMetric.post_id,
            EngagementMetric.channel_id,
            EngagementMetric.metric_date,
            func.max(EngagementMetric.snapshot_time).label("max_snapshot"),
        )
        .where(
            EngagementMetric.workspace_id == workspace_id,
            EngagementMetric.metric_date >= start_date,
            EngagementMetric.metric_date < end_date,
        )
        .group_by(EngagementMetric.post_id, EngagementMetric.channel_id, EngagementMetric.metric_date)
        .subquery()
    )

    rows = db.scalars(
        select(EngagementMetric)
        .join(
            subq,
            and_(
                EngagementMetric.post_id == subq.c.post_id,
                EngagementMetric.channel_id == subq.c.channel_id,
                EngagementMetric.metric_date == subq.c.metric_date,
                EngagementMetric.snapshot_time == subq.c.max_snapshot,
            ),
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
        elif timeframe_clean == "Monthly":
            # Map by 4 weeks of the month (Days 1-7: Week 1, 8-14: Week 2, 15-21: Week 3, 22+: Week 4)
            fb_buckets = [0] * 4
            li_buckets = [0] * 4
            for r in fb_metrics:
                w_idx = min((r.metric_date.day - 1) // 7, 3)
                fb_buckets[w_idx] += r.engagements
            for r in li_metrics:
                w_idx = min((r.metric_date.day - 1) // 7, 3)
                li_buckets[w_idx] += r.engagements
            fb_series = fb_buckets
            li_series = li_buckets
        else:
            # Map across 6 bi-monthly buckets: Jan-Feb, Mar-Apr, May-Jun, Jul-Aug, Sep-Oct, Nov-Dec
            fb_buckets = [0] * 6
            li_buckets = [0] * 6
            for r in fb_metrics:
                m_idx = min((r.metric_date.month - 1) // 2, 5)
                fb_buckets[m_idx] += r.engagements
            for r in li_metrics:
                m_idx = min((r.metric_date.month - 1) // 2, 5)
                li_buckets[m_idx] += r.engagements
            fb_series = fb_buckets
            li_series = li_buckets
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
    Computes overall platform attraction (impressions) and percentage share from the latest database records per channel.
    """
    subq = (
        select(
            EngagementMetric.post_id,
            EngagementMetric.channel_id,
            func.max(EngagementMetric.metric_date).label("max_date"),
        )
        .where(EngagementMetric.workspace_id == workspace_id)
        .group_by(EngagementMetric.post_id, EngagementMetric.channel_id)
        .subquery()
    )
    metrics = db.scalars(
        select(EngagementMetric)
        .join(
            subq,
            and_(
                EngagementMetric.post_id == subq.c.post_id,
                EngagementMetric.channel_id == subq.c.channel_id,
                EngagementMetric.metric_date == subq.c.max_date,
            ),
        )
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

    total_engagements = fb_engagements + li_engagements
    fb_eng_pct = round((fb_engagements / total_engagements) * 100) if total_engagements > 0 else 0
    li_eng_pct = round((li_engagements / total_engagements) * 100) if total_engagements > 0 else 0

    # Calculate Month-over-Month Gain
    now = datetime.now(timezone.utc)
    current_month_str = now.strftime("%Y-%m")
    first_day_current = now.replace(day=1)
    prev_month_date = (first_day_current - timedelta(days=1))
    prev_month_str = prev_month_date.strftime("%Y-%m")

    cur_month_eng = get_monthly_interactions(db, workspace_id, current_month_str)
    prev_month_eng = get_monthly_interactions(db, workspace_id, prev_month_str)

    if prev_month_eng > 0:
        gain_percentage = round(((cur_month_eng - prev_month_eng) / prev_month_eng) * 100)
        is_increase = gain_percentage >= 0
    elif cur_month_eng > 0:
        gain_percentage = 100
        is_increase = True
    else:
        gain_percentage = 0
        is_increase = False

    from app.analytics.schemas import MonthlyGainOverview

    monthly_gain = MonthlyGainOverview(
        current_month=current_month_str,
        current_month_engagements=cur_month_eng,
        prev_month=prev_month_str,
        prev_month_engagements=prev_month_eng,
        gain_percentage=gain_percentage,
        is_increase=is_increase,
    )

    return OverviewResponse(
        facebook=PlatformOverview(
            total_attraction=fb_attraction,
            percentage=fb_pct,
            total_engagements=fb_engagements,
            engagement_percentage=fb_eng_pct,
        ),
        linkedin=PlatformOverview(
            total_attraction=li_attraction,
            percentage=li_pct,
            total_engagements=li_engagements,
            engagement_percentage=li_eng_pct,
        ),
        monthly_gain=monthly_gain,
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
    Retrieves highest-engaging published posts for the workspace using latest metrics.
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

    if not posts:
        return TopPostsResponse(posts=[])

    post_ids = [p.id for p in posts]
    subq = (
        select(
            EngagementMetric.post_id,
            EngagementMetric.channel_id,
            func.max(EngagementMetric.metric_date).label("max_date"),
        )
        .where(EngagementMetric.post_id.in_(post_ids))
        .group_by(EngagementMetric.post_id, EngagementMetric.channel_id)
        .subquery()
    )
    latest_metrics = db.scalars(
        select(EngagementMetric)
        .join(
            subq,
            and_(
                EngagementMetric.post_id == subq.c.post_id,
                EngagementMetric.channel_id == subq.c.channel_id,
                EngagementMetric.metric_date == subq.c.max_date,
            ),
        )
    ).all()

    metrics_by_post: dict[uuid.UUID, list[EngagementMetric]] = {}
    for m in latest_metrics:
        metrics_by_post.setdefault(m.post_id, []).append(m)

    items: list[TopPostItem] = []
    for p in posts:
        dist = db.scalar(select(PostDistribution).where(PostDistribution.post_id == p.id))
        pub_url = dist.published_url if dist else None

        post_m_list = metrics_by_post.get(p.id, [])
        total_eng = sum(m.engagements for m in post_m_list)
        total_imp = sum((m.impressions or m.views) for m in post_m_list)
        eng_rate = round((total_eng / total_imp) * 100, 2) if total_imp > 0 else 0.0
        platform = post_m_list[0].platform if post_m_list else "facebook"

        thumb = p.attachment.image_url if p.attachment else None

        items.append(
            TopPostItem(
                id=p.id,
                title=p.title or p.content[:40] or "Untitled Post",
                platform=platform,
                published_url=pub_url,
                total_engagements=total_eng,
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
            with db.begin_nested():
                # Find associated workspace from channel
                channel = db.get(SocialAccount, rec.channel_id)
                if not channel:
                    raise ValueError(f"Channel {rec.channel_id} not found")

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

                workspace_id = None
                if channel.owner_type == "workspace" and channel.owner_id:
                    ws_exists = db.scalar(
                        select(Workspace.workspace_uuid).where(
                            Workspace.workspace_uuid == channel.owner_id
                        )
                    )
                    if ws_exists:
                        workspace_id = channel.owner_id

                if not workspace_id and matched_post_id:
                    post_obj = db.get(Post, matched_post_id)
                    if post_obj and post_obj.workspace_id:
                        workspace_id = post_obj.workspace_id

                if not workspace_id:
                    first_ws = db.scalar(select(Workspace.workspace_uuid).limit(1))
                    workspace_id = first_ws or "38X7HD4924PRE3FG"

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
                    platform=rec.platform or channel.platform or req.platform,
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
            try:
                event = IngestionEvent(
                    run_id=run.id,
                    external_post_id=rec.external_post_id,
                    status="error",
                    error_message=str(e),
                )
                db.add(event)
            except Exception:
                pass

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

    query = query.order_by(Post.created_at.desc())
    rows = db.execute(query).all()

    seen_pairs = set()
    items = []
    for post, dist, channel in rows:
        pair_key = (post.id, channel.id)
        if pair_key in seen_pairs:
            continue
        seen_pairs.add(pair_key)

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
        if len(items) >= limit:
            break

    return {
        "total_posts": len(items),
        "posts": items,
    }


def get_monthly_interactions(db: Session, workspace_id: str, month_year: str) -> int:
    """
    Computes total engagements across all platforms for a given workspace in a specific month (YYYY-MM).
    Uses the latest metric snapshot per post/channel within the month.
    """
    try:
        year, month = map(int, month_year.split("-"))
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)
    except Exception:
        start_date = date.today().replace(day=1)
        end_date = date.today()

    subq = (
        select(
            EngagementMetric.post_id,
            EngagementMetric.channel_id,
            func.max(EngagementMetric.metric_date).label("max_date"),
        )
        .where(
            EngagementMetric.workspace_id == workspace_id,
            EngagementMetric.metric_date >= start_date,
            EngagementMetric.metric_date < end_date,
        )
        .group_by(EngagementMetric.post_id, EngagementMetric.channel_id)
        .subquery()
    )
    latest_metrics = db.scalars(
        select(EngagementMetric)
        .join(
            subq,
            and_(
                EngagementMetric.post_id == subq.c.post_id,
                EngagementMetric.channel_id == subq.c.channel_id,
                EngagementMetric.metric_date == subq.c.max_date,
            ),
        )
    ).all()
    return sum(m.engagements for m in latest_metrics)


def get_kpi_goal(db: Session, workspace_id: str, month_year: str | None = None) -> KpiGoalResponse:
    """
    Retrieves the KPI goal for a workspace for a specific month and calculates the progress percentage.
    """
    if not month_year:
        month_year = datetime.now(timezone.utc).strftime("%Y-%m")

    goal_record = db.scalar(
        select(WorkspaceKpiGoal).where(
            WorkspaceKpiGoal.workspace_id == workspace_id,
            WorkspaceKpiGoal.month_year == month_year,
        )
    )
    target = goal_record.target_interactions if goal_record else 500
    current_interactions = get_monthly_interactions(db, workspace_id, month_year)
    progress_percentage = (
        min(100, round((current_interactions / target) * 100)) if target > 0 else 0
    )

    return KpiGoalResponse(
        workspace_id=workspace_id,
        month_year=month_year,
        target_interactions=target,
        current_interactions=current_interactions,
        progress_percentage=progress_percentage,
    )


def update_kpi_goal(db: Session, workspace_id: str, payload: KpiGoalRequest) -> KpiGoalResponse:
    """
    Updates or inserts a target KPI goal for a workspace for the specified month.
    """
    month_year = payload.month_year or datetime.now(timezone.utc).strftime("%Y-%m")
    goal_record = db.scalar(
        select(WorkspaceKpiGoal).where(
            WorkspaceKpiGoal.workspace_id == workspace_id,
            WorkspaceKpiGoal.month_year == month_year,
        )
    )
    if goal_record:
        goal_record.target_interactions = payload.target_interactions
    else:
        goal_record = WorkspaceKpiGoal(
            workspace_id=workspace_id,
            month_year=month_year,
            target_interactions=payload.target_interactions,
        )
        db.add(goal_record)

    db.commit()
    db.refresh(goal_record)

    current_interactions = get_monthly_interactions(db, workspace_id, month_year)
    progress_percentage = (
        min(100, round((current_interactions / goal_record.target_interactions) * 100))
        if goal_record.target_interactions > 0
        else 0
    )

    return KpiGoalResponse(
        workspace_id=workspace_id,
        month_year=month_year,
        target_interactions=goal_record.target_interactions,
        current_interactions=current_interactions,
        progress_percentage=progress_percentage,
        message="KPI Goal updated successfully",
    )


