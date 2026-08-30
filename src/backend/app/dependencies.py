import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.security import JWTError, decode_access_token

from dataclasses import dataclass
from app.models import Workspace, WorkspaceMember

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)



def get_current_user(
    access_token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if access_token is None:
        raise credentials_error

    try:
        payload = decode_access_token(access_token)
    except JWTError as exc:
        raise credentials_error from exc

    raw_user_id = payload.get("sub")
    if raw_user_id is None:
        raise credentials_error

    try:
        user_id = uuid.UUID(raw_user_id)
    except (ValueError, TypeError) as exc:
        raise credentials_error from exc

    user = db.get(User, user_id)
    if user is None:
        raise credentials_error

    return user

@dataclass
class WorkspaceContext:
    workspace: Workspace
    role: str

def get_workspace_context(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkspaceContext:
    workspace = db.get(Workspace, workspace_id)
    if workspace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    if workspace.manager_id == current_user.users_uuid:
        return WorkspaceContext(workspace=workspace, role="manager")

    membership = db.scalar(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == current_user.users_uuid,
            WorkspaceMember.status == "active",
        )
    )
    if membership is not None:
        return WorkspaceContext(workspace=workspace, role="member")

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                        detail="You do not have permission to access this workspace."
                        )

