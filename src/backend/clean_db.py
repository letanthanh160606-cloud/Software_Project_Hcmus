from app.database import engine
from sqlalchemy import text

statements = [
    # 1. Analytics schema
    'TRUNCATE TABLE analytics.report_exports CASCADE;',
    'TRUNCATE TABLE analytics.reports CASCADE;',
    'TRUNCATE TABLE analytics.engagement_metrics CASCADE;',
    'TRUNCATE TABLE analytics.analytics_snapshots CASCADE;',
    'TRUNCATE TABLE analytics.workspace_kpi_goals CASCADE;',
    'TRUNCATE TABLE analytics.ingestion_events CASCADE;',
    'TRUNCATE TABLE analytics.ingestion_runs CASCADE;',

    # 2. Workspaces schema
    'TRUNCATE TABLE workspaces.post_distributions CASCADE;',
    'TRUNCATE TABLE workspaces.post_media CASCADE;',
    'TRUNCATE TABLE workspaces.post_reviews CASCADE;',
    'TRUNCATE TABLE workspaces.posts CASCADE;',
    'TRUNCATE TABLE workspaces.task_attachments CASCADE;',
    'TRUNCATE TABLE workspaces.tasks CASCADE;',
    'TRUNCATE TABLE workspaces.notifications CASCADE;',
    'TRUNCATE TABLE workspaces.knowledge_base_documents CASCADE;',
    'TRUNCATE TABLE workspaces.prompt_templates CASCADE;',
    'TRUNCATE TABLE workspaces.social_accounts CASCADE;',
    'TRUNCATE TABLE workspaces.workspace_members CASCADE;',
    'TRUNCATE TABLE workspaces.workspaces CASCADE;',

    # 3. Public & Users schema
    'TRUNCATE TABLE public.oauth_states CASCADE;',
    'TRUNCATE TABLE public.email_verifications CASCADE;',
    'TRUNCATE TABLE "Users".users CASCADE;',
]

def clean_database():
    with engine.connect() as conn:
        for stmt in statements:
            try:
                conn.execute(text(stmt))
                print(f"Executed: {stmt}")
            except Exception as e:
                print(f"Notice on {stmt}: {e}")
        conn.commit()
    print("[SUCCESS] All User, Post, Workspace, and related data have been completely deleted!")

    tables = [
        ('Users', 'users'),
        ('workspaces', 'workspaces'),
        ('workspaces', 'workspace_members'),
        ('workspaces', 'social_accounts'),
        ('workspaces', 'posts'),
        ('workspaces', 'post_media'),
        ('workspaces', 'post_distributions'),
        ('workspaces', 'post_reviews'),
        ('workspaces', 'tasks'),
        ('workspaces', 'notifications'),
        ('analytics', 'engagement_metrics'),
        ('analytics', 'reports'),
        ('analytics', 'workspace_kpi_goals'),
        ('public', 'email_verifications'),
    ]
    with engine.connect() as conn:
        for schema, table in tables:
            count = conn.execute(text(f'SELECT count(*) FROM "{schema}"."{table}";')).scalar()
            print(f"  {schema}.{table}: {count}")

if __name__ == "__main__":
    clean_database()

