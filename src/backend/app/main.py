from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, calendar, health, posts, workspaces, notifications
from app.distribution.router import router as distribution_router
from app.analytics.router import router as analytics_router
from app.analytics.ingest_router import router as internal_ingest_router

from apscheduler.schedulers.background import BackgroundScheduler
from app.jobs.notification_jobs import check_due_soon_tasks

settings = get_settings()

app = FastAPI(title="Omni Platforms")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(workspaces.router)
app.include_router(posts.router)
app.include_router(calendar.router)
app.include_router(notifications.router)
app.include_router(distribution_router)
app.include_router(analytics_router)
app.include_router(internal_ingest_router)

scheduler = BackgroundScheduler()


@app.on_event("startup")
def start_scheduler():
    scheduler.add_job(check_due_soon_tasks, "interval", hours=1, id="check_due_soon_tasks")
    scheduler.start()


@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()