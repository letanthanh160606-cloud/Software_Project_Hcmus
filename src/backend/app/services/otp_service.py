import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import EmailVerification


def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP code."""
    return str(secrets.randbelow(1000000)).zfill(6)


def generate_salt() -> str:
    """Generate a random 16-byte hex salt."""
    return secrets.token_hex(16)


def hash_otp(otp: str, salt: str) -> str:
    """Compute SHA-256 hash of (otp + salt)."""
    return hashlib.sha256(f"{otp}{salt}".encode("utf-8")).hexdigest()


def generate_verification_token() -> str:
    """Generate a 256-bit URL-safe random verification token."""
    return secrets.token_urlsafe(32)


def get_latest_otp_record(db: Session, email: str) -> EmailVerification | None:
    """Get the latest non-used EmailVerification record for an email."""
    stmt = (
        select(EmailVerification)
        .where(
            EmailVerification.email == email,
            EmailVerification.used_at.is_(None),
        )
        .order_by(EmailVerification.created_at.desc())
        .limit(1)
    )
    return db.scalar(stmt)


def invalidate_previous_otps(db: Session, email: str) -> None:
    """Invalidate all previous active OTP records for an email."""
    now_tz = datetime.now(timezone.utc)
    stmt = (
        update(EmailVerification)
        .where(
            EmailVerification.email == email,
            EmailVerification.used_at.is_(None),
        )
        .values(expires_at=now_tz)
    )
    db.execute(stmt)
    db.commit()


def create_otp_record(db: Session, email: str) -> tuple[EmailVerification, str]:
    """
    Invalidates existing active OTPs for the email, generates a new OTP,
    hashes it, and saves a new EmailVerification record.
    Returns (record, raw_otp_code).
    """
    settings = get_settings()

    invalidate_previous_otps(db, email)

    otp_code = generate_otp()
    salt = generate_salt()
    otp_hash_val = hash_otp(otp_code, salt)

    now_tz = datetime.now(timezone.utc)
    expires_at = now_tz + timedelta(minutes=settings.otp_expire_minutes)

    record = EmailVerification(
        email=email,
        otp_hash=otp_hash_val,
        salt=salt,
        attempt_count=0,
        is_verified=False,
        expires_at=expires_at,
        last_sent_at=now_tz,
        created_at=now_tz,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return record, otp_code


def verify_otp_code(db: Session, email: str, submitted_otp: str) -> tuple[bool, str, str | None]:
    """
    Validates a submitted OTP code against the latest record.
    Returns (is_success, error_message, verification_token).
    """
    settings = get_settings()
    record = get_latest_otp_record(db, email)

    if record is None:
        return False, "No active verification code found for this email", None

    now_tz = datetime.now(timezone.utc)

    if record.expires_at < now_tz:
        return False, "Verification code has expired. Please request a new one", None

    if record.attempt_count >= settings.otp_max_attempts:
        return False, "Too many failed attempts. Please request a new verification code", None

    computed_hash = hash_otp(submitted_otp, record.salt)

    if not secrets.compare_digest(computed_hash, record.otp_hash):
        record.attempt_count += 1
        db.commit()
        remaining = settings.otp_max_attempts - record.attempt_count
        if remaining > 0:
            return False, f"Invalid verification code. {remaining} attempt(s) remaining", None
        return False, "Invalid verification code. Maximum attempts reached", None

    token = generate_verification_token()
    token_expires_at = now_tz + timedelta(minutes=settings.verification_token_expire_minutes)

    record.is_verified = True
    record.verification_token = token
    record.verification_token_expires_at = token_expires_at
    db.commit()

    return True, "", token


def validate_verification_session(db: Session, email: str, token: str) -> tuple[bool, str, EmailVerification | None]:
    """
    Validates that a verification_token is valid, unexpired, unused, and belongs to the given email.
    """
    stmt = (
        select(EmailVerification)
        .where(
            EmailVerification.verification_token == token,
            EmailVerification.email == email,
        )
        .limit(1)
    )
    record = db.scalar(stmt)

    if record is None:
        return False, "Invalid verification token", None

    if not record.is_verified:
        return False, "Email has not been verified yet", None

    if record.used_at is not None:
        return False, "Verification token has already been used", None

    now_tz = datetime.now(timezone.utc)
    if record.verification_token_expires_at is None or record.verification_token_expires_at < now_tz:
        return False, "Verification session has expired. Please verify your email again", None

    return True, "", record


def consume_verification_session(db: Session, record: EmailVerification) -> None:
    """Marks a verification session as consumed (used)."""
    now_tz = datetime.now(timezone.utc)
    record.used_at = now_tz
    db.commit()


def cleanup_expired_records(db: Session) -> int:
    """Deletes old used or expired email_verifications records."""
    now_tz = datetime.now(timezone.utc)
    cutoff = now_tz - timedelta(hours=24)

    stmt = (
        select(EmailVerification)
        .where(
            (EmailVerification.used_at.is_not(None)) | (EmailVerification.expires_at < cutoff)
        )
    )
    records = db.scalars(stmt).all()
    count = len(records)
    for rec in records:
        db.delete(rec)
    if count > 0:
        db.commit()
    return count
