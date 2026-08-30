import logging
from sqlalchemy import text
from app.database import engine, Base

# Import all models to register with Base.metadata
from app.models import (
    User,
    Workspace,
    WorkspaceMember,
    SocialAccount,
    Post,
    PostMedia,
    PostDistribution,
    PostReviews,
    Task,
    TaskAttachment,
    Notifications,
)
from app.analytics.models import (
    IngestionRun,
    IngestionEvent,
    EngagementMetric,
    AnalyticsSnapshot,
    Report,
    ReportExport,
    WorkspaceKpiGoal,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("init_db")


def sync_database():
    """
    Ensures all PostgreSQL schemas, extensions, and tables are created and up to date.
    Safe to run multiple times (idempotent).
    """
    logger.info("Connecting to database...")

    with engine.connect() as conn:
        # 1. Create required schemas
        logger.info("Creating required database schemas...")
        conn.execute(text('CREATE SCHEMA IF NOT EXISTS "Users";'))
        conn.execute(text('CREATE SCHEMA IF NOT EXISTS workspaces;'))
        conn.execute(text('CREATE SCHEMA IF NOT EXISTS analytics;'))

        # 2. Enable UUID extension
        logger.info("Enabling pgcrypto / uuid extensions...")
        conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto";'))
        conn.commit()

    # 3. Create all tables defined in SQLAlchemy models
    logger.info("Creating / syncing all model tables...")
    Base.metadata.create_all(bind=engine)

    # 4. Ensure new columns are added if older tables exist
    with engine.connect() as conn:
        logger.info("Checking and patching missing columns on existing tables...")
        patches = [
            # Post table updates
            'ALTER TABLE workspaces.posts ADD COLUMN IF NOT EXISTS target_platforms jsonb;',
            'ALTER TABLE workspaces.posts ADD COLUMN IF NOT EXISTS target_account_ids jsonb;',
            'ALTER TABLE workspaces.posts ADD COLUMN IF NOT EXISTS target_accounts_mode text DEFAULT \'ALL_SELECTED_PLATFORMS\';',
            'ALTER TABLE workspaces.posts ADD COLUMN IF NOT EXISTS reject_reason text;',
            'ALTER TABLE workspaces.posts ADD COLUMN IF NOT EXISTS reviewed_by uuid;',
            'ALTER TABLE workspaces.posts ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;',
            'ALTER TABLE workspaces.posts ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;',
            # Post distribution table updates
            'ALTER TABLE workspaces.post_distributions ADD COLUMN IF NOT EXISTS published_url text;',
            'ALTER TABLE workspaces.post_distributions ADD COLUMN IF NOT EXISTS external_post_id text;',
            # Social accounts updates
            'ALTER TABLE workspaces.social_accounts ADD COLUMN IF NOT EXISTS platform_account_id text;',
            'ALTER TABLE workspaces.social_accounts ADD COLUMN IF NOT EXISTS access_token text;',
            # Task updates
            'ALTER TABLE workspaces.tasks ADD COLUMN IF NOT EXISTS upload_url text;',
            # Workspace pin updates
            'ALTER TABLE workspaces.workspaces DROP CONSTRAINT IF EXISTS workspaces_pin_hash_key;',
            # Notification updates
            'ALTER TABLE workspaces.notifications ALTER COLUMN task_id DROP NOT NULL;',
        ]
        for patch in patches:
            try:
                conn.execute(text(patch))
            except Exception as e:
                logger.warning(f"Patch notice: {e}")
        conn.commit()

    logger.info("✅ Database is 100% synchronized and ready to use!")


if __name__ == "__main__":
    sync_database()
