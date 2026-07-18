from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserResponse,
    WorkspaceInfo,
)
from app.security import create_access_token, verify_password, verify_pin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> RegisterResponse:

    if crud.get_user_by_email(db, payload.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if crud.get_user_by_username(db, payload.username) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    # ---------- Personal account ----------
    if payload.account_type == "individual":
        user = crud.create_individual_user(
            db, username=payload.username, email=payload.email, password=payload.password
        )
        return RegisterResponse(user=UserResponse.model_validate(user))

    # ---------- Business account ----------
    if payload.business_role == "manager":
        user, workspace = crud.create_manager_with_workspace(
            db,
            username=payload.username,
            email=payload.email,
            password=payload.password,
            workspace_name=payload.workspace_name,
            workspace_pin=payload.workspace_pin,
        )
        return RegisterResponse(
            user=UserResponse.model_validate(user),
            workspace=WorkspaceInfo.model_validate(workspace),
        )

    # business_role == "member": join an existing workspace
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
    return RegisterResponse(
        user=UserResponse.model_validate(user),
        workspace=WorkspaceInfo.model_validate(workspace),
    )


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

    return TokenResponse(access_token=access_token, expires_in=expires_in, user=user)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
