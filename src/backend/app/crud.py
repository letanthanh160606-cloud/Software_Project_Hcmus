from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User, Workspace, WorkspaceMember
from app.security import hash_password


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.scalar(select(User).where(User.username == username))


def create_user(db: Session, *, username: str, email: str, password: str, account_type: str) -> User:
    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        account_type=account_type,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def derive_role(db: Session, user: User) -> str:
    manages = db.scalar(select(Workspace.workspace_uuid).where(Workspace.manager_id == user.users_uuid))
    if manages is not None:
        return "manager"

    is_member = db.scalar(
        select(WorkspaceMember.workspace_id).where(
            WorkspaceMember.user_id == user.users_uuid,
            WorkspaceMember.status == "active",
        )
    )
    if is_member is not None:
        return "member"

    return "individual"
