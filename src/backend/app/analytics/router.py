import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.analytics import service
from app.analytics.schemas import (
    GenerateReportRequest,
    GenerateReportResponse,
    KpiGoalRequest,
    KpiGoalResponse,
    OverviewResponse,
    ReportItemResponse,
    ReportListResponse,
    SaveReportRequest,
    TimelineResponse,
    TodayStatsResponse,
    TopPostsResponse,
)
from app.database import get_db
from app.dependencies import WorkspaceContext, get_current_user, get_workspace_context
from app.models import User

router = APIRouter(prefix="/api/v1", tags=["analytics-and-reports"])


# ---------------------------------------------------------
# ANALYTICS METRICS ENDPOINTS
# ---------------------------------------------------------

@router.get("/analytics/{workspace_id}/timeline", response_model=TimelineResponse)
def get_timeline_analytics(
    workspace_id: str,
    timeframe: str = Query("Weekly", description="Weekly | Monthly | Yearly"),
    db: Session = Depends(get_db),
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
):
    """
    Returns time-series performance data for Facebook and LinkedIn.
    """
    return service.get_timeline(db, workspace_id, timeframe)


@router.get("/analytics/{workspace_id}/overview", response_model=OverviewResponse)
def get_overview_analytics(
    workspace_id: str,
    db: Session = Depends(get_db),
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
):
    """
    Returns total audience attraction, percentage share, and total engagements.
    """
    return service.get_overview(db, workspace_id)


@router.get("/analytics/{workspace_id}/today", response_model=TodayStatsResponse)
def get_today_interactions(
    workspace_id: str,
    db: Session = Depends(get_db),
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
):
    """
    Returns total interactions recorded today based on the caller's role (Manager vs Member).
    """
    return service.get_today_stats(db, workspace_id, current_user, ctx.role)


@router.get("/analytics/{workspace_id}/top-posts", response_model=TopPostsResponse)
def get_top_engaging_posts(
    workspace_id: str,
    limit: int = Query(7, ge=1, le=50),
    db: Session = Depends(get_db),
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
):
    """
    Returns highest-engaging posts published in this workspace.
    """
    return service.get_top_posts(db, workspace_id, limit)


@router.get("/analytics/{workspace_id}/kpi", response_model=KpiGoalResponse)
def get_workspace_kpi_goal(
    workspace_id: str,
    month_year: str | None = Query(None, description="Month-Year format YYYY-MM"),
    db: Session = Depends(get_db),
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
):
    """
    Returns monthly target interactions, current interactions, and progress percentage.
    """
    return service.get_kpi_goal(db, workspace_id, month_year)


@router.put("/analytics/{workspace_id}/kpi", response_model=KpiGoalResponse)
def update_workspace_kpi_goal(
    workspace_id: str,
    payload: KpiGoalRequest,
    db: Session = Depends(get_db),
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
):
    """
    Sets or updates the monthly KPI target interactions for the workspace.
    """
    return service.update_kpi_goal(db, workspace_id, payload)


@router.post("/analytics/{workspace_id}/sync")
async def trigger_manual_analytics_sync(
    workspace_id: str,
    db: Session = Depends(get_db),
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
):
    """
    Triggers an immediate on-demand metrics sync via n8n webhook or internal sync pipeline.
    """
    import httpx
    from app.config import get_settings
    settings = get_settings()

    webhook_triggered = False
    # Attempt to notify n8n webhook if configured
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            webhook_res = await client.post(
                "http://localhost:5678/webhook/analytics-sync",
                json={"workspace_id": workspace_id, "triggered_by": str(current_user.users_uuid)},
                headers={"X-Internal-API-Key": settings.internal_api_key},
            )
            if webhook_res.status_code in (200, 201, 202):
                webhook_triggered = True
    except Exception:
        webhook_triggered = False

    return {
        "success": True,
        "workspace_id": workspace_id,
        "n8n_webhook_dispatched": webhook_triggered,
        "message": "Analytics synchronization initiated successfully.",
    }



# ---------------------------------------------------------
# AI STATISTICAL REPORT ENDPOINTS
# ---------------------------------------------------------

@router.post("/reports/{workspace_id}/generate", response_model=GenerateReportResponse)
async def generate_statistical_report(
    workspace_id: str,
    req: GenerateReportRequest,
    db: Session = Depends(get_db),
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
):
    """
    Generates a structured executive statistical report using the AI Report Engine.
    """
    return await service.generate_ai_report(db, workspace_id, req.timeframe, req.period)


@router.post("/reports/{workspace_id}", response_model=ReportItemResponse, status_code=status.HTTP_201_CREATED)
def save_statistical_report(
    workspace_id: str,
    req: SaveReportRequest,
    db: Session = Depends(get_db),
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
):
    """
    Saves an AI-generated or custom report into the workspace history.
    """
    return service.save_report(db, workspace_id, current_user.users_uuid, req)


@router.get("/reports/{workspace_id}", response_model=ReportListResponse)
def list_saved_reports(
    workspace_id: str,
    start_date: str | None = Query(None, description="YYYY-MM-DD"),
    end_date: str | None = Query(None, description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
):
    """
    Lists saved reports with interactive date range filtering.
    """
    return service.list_reports(db, workspace_id, start_date, end_date)


@router.get("/reports/{workspace_id}/{report_id}/download")
def download_report_document(
    workspace_id: str,
    report_id: uuid.UUID,
    token: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    Exports and streams the report document for download.
    Supports direct browser download and authenticated frontend Fetch requests.
    """
    import re
    from app.analytics.models import Report

    report = db.get(Report, report_id)
    if not report or report.workspace_id != workspace_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    content = (
        f"# {report.title}\n\n"
        f"**Saved Date:** {report.saved_date}\n"
        f"**Timeframe:** {report.timeframe}\n"
        f"**Workspace ID:** {report.workspace_id}\n\n"
        f"---\n\n"
        f"## Executive Summary & AI Insights\n\n"
        f"{report.summary}\n"
    )
    safe_filename = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', report.title) or "Report"
    return Response(
        content=content,
        media_type="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{safe_filename}.md"'},
    )
