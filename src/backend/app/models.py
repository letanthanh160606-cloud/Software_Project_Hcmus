import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

AccountType = Enum(
    "individual",
    "business",
    name="account_type_enum",
    schema="public",
    create_type=False,  
)

UserRole = Enum(
    "individual",
    "manager",
    "member",
    name="user_role_enum",
    schema="public",
    create_type=False,
)

class User(Base):

    __tablename__ = "users"
    __table_args__ = {"schema": "Users"}

    users_uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

    account_type: Mapped[str] = mapped_column(AccountType, nullable=False, server_default="individual")

    role: Mapped[str] = mapped_column(
        UserRole,
        nullable=False,
        server_default="individual",
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    workspaces_managed: Mapped[list["Workspace"]] = relationship(back_populates="manager")
    memberships: Mapped[list["WorkspaceMember"]] = relationship(back_populates="user")


class Workspace(Base):

    __tablename__ = "workspaces"
    __table_args__ = {"schema": "workspaces"}

    workspace_uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    invite_code: Mapped[str] = mapped_column(
        String(8),
        nullable=False,
        unique=True,
    )

    

    workspacename: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    manager_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("Users.users.users_uuid"))

    pin_hash: Mapped[str] = mapped_column(
        String,
        nullable=False,
        server_default="",
    )

    manager: Mapped["User"] = relationship(back_populates="workspaces_managed")


class WorkspaceMember(Base):

    __tablename__ = "workspace_members"
    __table_args__ = {"schema": "workspaces"}

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("Users.users.users_uuid"), primary_key=True)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.workspaces.workspace_uuid"), primary_key=True
    )
    status: Mapped[str] = mapped_column(String, nullable=False, server_default="active")

    user: Mapped["User"] = relationship(back_populates="memberships")
