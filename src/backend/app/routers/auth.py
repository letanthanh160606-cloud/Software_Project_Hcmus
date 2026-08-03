from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    SendOTPRequest,
    TokenResponse,
    UserResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
    WorkspaceInfo,
)
from app.security import create_access_token, verify_password, verify_pin
from app.services.email_service import send_otp_email
from app.services.otp_service import (
    consume_verification_session,
    create_otp_record,
    get_latest_otp_record,
    validate_verification_session,
    verify_otp_code,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/send-otp")
def send_otp(
    payload: SendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    settings = get_settings()

    # 1. Check if email is already registered
    if crud.get_user_by_email(db, payload.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # 2. Check resend cooldown
    latest_record = get_latest_otp_record(db, payload.email)
    if latest_record is not None and latest_record.last_sent_at is not None:
        now_tz = datetime.now(timezone.utc)
        elapsed_seconds = (now_tz - latest_record.last_sent_at).total_seconds()
        if elapsed_seconds < settings.otp_resend_interval:
            remaining = int(settings.otp_resend_interval - elapsed_seconds)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting a new code",
            )

    # 3. Generate and save new OTP record
    record, otp_code = create_otp_record(db, payload.email)

    # 4. Trigger email sending in background
    background_tasks.add_task(send_otp_email, payload.email, otp_code)

    return {
        "message": "Verification code sent to your email",
        "expires_in": settings.otp_expire_minutes * 60,
    }


@router.post("/verify-otp", response_model=VerifyOTPResponse)
def verify_otp(
    payload: VerifyOTPRequest,
    db: Session = Depends(get_db),
) -> VerifyOTPResponse:
    settings = get_settings()

    is_success, error_msg, verification_token = verify_otp_code(
        db, payload.email, payload.otp
    )

    if not is_success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )

    return VerifyOTPResponse(
        message="Email verified successfully",
        verification_token=verification_token,
        expires_in=settings.verification_token_expire_minutes * 60,
    )


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> RegisterResponse:

    # 1. Validate email and username availability
    if crud.get_user_by_email(db, payload.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if crud.get_user_by_username(db, payload.username) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    # 2. Validate email verification session token
    is_valid_token, token_err, verification_record = validate_verification_session(
        db, payload.email, payload.verification_token
    )
    if not is_valid_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=token_err,
        )

    # 3. Create User & Workspace
    if payload.account_type == "individual":
        user = crud.create_individual_user(
            db, username=payload.username, email=payload.email, password=payload.password
        )
        response = RegisterResponse(user=UserResponse.model_validate(user))

    elif payload.business_role == "manager":
        user, workspace = crud.create_manager_with_workspace(
            db,
            username=payload.username,
            email=payload.email,
            password=payload.password,
            workspace_name=payload.workspace_name,
            workspace_pin=payload.workspace_pin,
        )
        response = RegisterResponse(
            user=UserResponse.model_validate(user),
            workspace=WorkspaceInfo.model_validate(workspace),
        )

    else:  # business_role == "member"
        workspace = crud.get_workspace_by_id(db, payload.workspace_id)
        if workspace is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

        if not verify_pin(payload.workspace_pin, workspace.pin_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid workspace PIN")

        user = crud.create_member_for_workspace(
            db,
            username=payload.username,
            email=payload.email,
            password=payload.password,
            workspace=workspace,
        )
        response = RegisterResponse(
            user=UserResponse.model_validate(user),
            workspace=WorkspaceInfo.model_validate(workspace),
        )

    # 4. Consume verification session token
    consume_verification_session(db, verification_record)

    return response


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:

    user = crud.get_user_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    role = crud.derive_role(db, user)
    access_token, expires_in = create_access_token(
        subject=str(user.users_uuid),
        extra_claims={"role": role, "account_type": user.account_type},
    )
    user_response = UserResponse.model_validate(user)
    user_response.role = role

    return TokenResponse(access_token=access_token, expires_in=expires_in, user=user_response)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
