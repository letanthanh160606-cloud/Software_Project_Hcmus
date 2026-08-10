import sys
from sqlalchemy import text
from app.database import SessionLocal, engine, Base
from app.models import *

def migrate():
    print("Running migration for Distribution module...")
    db = SessionLocal()
    try:
        # 1. Update workspaces.social_accounts table structure
        db.execute(text("""
            DO $$
            BEGIN
                -- Drop legacy check constraint owner_exclusive if exists
                ALTER TABLE workspaces.social_accounts DROP CONSTRAINT IF EXISTS owner_exclusive;
                ALTER TABLE workspaces.social_accounts DROP CONSTRAINT IF EXISTS check_social_accounts_owner;
                -- Rename social_acc_id to id if old column exists
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='social_acc_id'
                ) THEN
                    ALTER TABLE workspaces.social_accounts RENAME COLUMN social_acc_id TO id;
                END IF;

                -- Rename platform_account_name to display_name if old column exists
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='platform_account_name'
                ) THEN
                    ALTER TABLE workspaces.social_accounts RENAME COLUMN platform_account_name TO display_name;
                END IF;

                -- Rename connected_at to created_at if old column exists
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='connected_at'
                ) THEN
                    ALTER TABLE workspaces.social_accounts RENAME COLUMN connected_at TO created_at;
                END IF;

                -- Add created_at if neither existed
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='created_at'
                ) THEN
                    ALTER TABLE workspaces.social_accounts ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
                END IF;

                -- Add note column
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='note'
                ) THEN
                    ALTER TABLE workspaces.social_accounts ADD COLUMN note TEXT NULL;
                END IF;

                -- Add owner_type column
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='owner_type'
                ) THEN
                    ALTER TABLE workspaces.social_accounts ADD COLUMN owner_type VARCHAR(20) NOT NULL DEFAULT 'workspace';
                END IF;

                -- Add owner_id column
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='owner_id'
                ) THEN
                    ALTER TABLE workspaces.social_accounts ADD COLUMN owner_id VARCHAR NOT NULL DEFAULT '';
                END IF;

                -- Add access_token_encrypted column
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='access_token_encrypted'
                ) THEN
                    ALTER TABLE workspaces.social_accounts ADD COLUMN access_token_encrypted TEXT NULL;
                END IF;

                -- Add refresh_token_encrypted column
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='refresh_token_encrypted'
                ) THEN
                    ALTER TABLE workspaces.social_accounts ADD COLUMN refresh_token_encrypted TEXT NULL;
                END IF;

                -- Add token_expires_at column
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='token_expires_at'
                ) THEN
                    ALTER TABLE workspaces.social_accounts ADD COLUMN token_expires_at TIMESTAMPTZ NULL;
                END IF;

                -- Add enabled_for_workspace column
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema='workspaces' AND table_name='social_accounts' AND column_name='enabled_for_workspace'
                ) THEN
                    ALTER TABLE workspaces.social_accounts ADD COLUMN enabled_for_workspace BOOLEAN NOT NULL DEFAULT true;
                END IF;
            END $$;
        """))
        db.commit()

        # 2. Create missing tables (oauth_states, post_distributions)
        Base.metadata.create_all(bind=engine)
        print("Distribution tables migration finished successfully!")
    except Exception as e:
        db.rollback()
        print(f"Migration error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
