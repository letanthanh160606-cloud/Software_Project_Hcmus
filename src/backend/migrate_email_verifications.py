import sys
from sqlalchemy import text
from app.database import SessionLocal

def run_migration():
    db = SessionLocal()
    try:
        print("Running email verification migration...")
        db.execute(text('ALTER TABLE "Users".users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT FALSE;'))
        
        db.execute(text('''
            CREATE TABLE IF NOT EXISTS public.email_verifications (
                id UUID DEFAULT uuidv7() PRIMARY KEY,
                email TEXT NOT NULL,
                otp_hash TEXT NOT NULL,
                salt VARCHAR(32) NOT NULL,
                verification_token TEXT NULL,
                verification_token_expires_at TIMESTAMPTZ NULL,
                is_verified BOOLEAN NOT NULL DEFAULT FALSE,
                attempt_count SMALLINT NOT NULL DEFAULT 0,
                expires_at TIMESTAMPTZ NOT NULL,
                last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                used_at TIMESTAMPTZ NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        '''))
        
        db.execute(text('CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON public.email_verifications (email);'))
        db.execute(text('CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON public.email_verifications (verification_token) WHERE verification_token IS NOT NULL;'))
        
        db.commit()
        print("Migration completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Migration error: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
