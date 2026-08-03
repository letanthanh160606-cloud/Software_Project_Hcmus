import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.dependencies import WorkspaceContext, get_current_user, get_workspace_context
from app.models import SocialAccount, User
from app.schemas import (
    DistributorResponse,
    DistributorUpdateRequest,
    MemberResponse,
    PostResponse,
    PostUpdateRequest,
    TaskCreateRequest,
    TaskResponse,
    WorkspaceDetailResponse,
)

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get("/{workspace_id}", response_model=WorkspaceDetailResponse)
def get_workspace_detail(
    ctx: WorkspaceContext = Depends(get_workspace_context),
    db: Session = Depends(get_db),
) -> WorkspaceDetailResponse:
    resp = WorkspaceDetailResponse.model_validate(ctx.workspace)
    resp.member_count = crud.count_workspace_members(db, ctx.workspace.workspace_uuid)
    return resp


@router.get("/{workspace_id}/members", response_model=list[MemberResponse])
def get_workspace_members(
    ctx: WorkspaceContext = Depends(get_workspace_context),
    db: Session = Depends(get_db),
) -> list[MemberResponse]:
    memberships = crud.list_workspace_members(db, ctx.workspace.workspace_uuid)
    return [
        MemberResponse(
            user_id=m.user.users_uuid,
            username=m.user.username,
            email=m.user.email,
            status=m.status,
            joined_at=m.joined_at,
        )
        for m in memberships
    ]


@router.get("/{workspace_id}/distributors", response_model=list[DistributorResponse])
def get_distributors(
    ctx: WorkspaceContext = Depends(get_workspace_context),
    db: Session = Depends(get_db),
) -> list[DistributorResponse]:
    return crud.list_distributors(db, ctx.workspace.workspace_uuid)


@router.get("/{workspace_id}/posts", response_model=list[PostResponse])
def get_posts(
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[PostResponse]:
    return crud.list_posts_for_role(db, ctx.workspace.workspace_uuid, current_user.users_uuid, ctx.role)


@router.get("/{workspace_id}/tasks", response_model=list[TaskResponse])
def get_tasks(
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[TaskResponse]:
    return crud.list_tasks_for_role(db, ctx.workspace.workspace_uuid, current_user.users_uuid, ctx.role)

@router.patch("/{workspace_id}/distributors/{social_acc_id}", response_model=DistributorResponse)
def update_distributor(
    social_acc_id: uuid.UUID,
    payload: DistributorUpdateRequest,
    ctx: WorkspaceContext = Depends(get_workspace_context),
    db: Session = Depends(get_db),
) -> DistributorResponse:
    if ctx.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers are allowed to edit distributors.")

    account = db.scalar(
        select(SocialAccount).where(
            SocialAccount.social_acc_id == social_acc_id,
            SocialAccount.workspace_id == ctx.workspace.workspace_uuid,
        )
    )
    if account is None:
        raise HTTPException(status_code=404, detail="Distributor not found")

    return crud.update_distributor(db, account, payload.model_dump(exclude_unset=True))

@router.patch("/{workspace_id}/posts/{post_id}", response_model=PostResponse)
def update_post(
    post_id: uuid.UUID,
    payload: PostUpdateRequest,
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PostResponse:
    post = crud.get_post_by_id(db, post_id, ctx.workspace.workspace_uuid)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    updates = payload.model_dump(exclude_unset=True)

    if "status" in updates:
        if ctx.role == "manager":
            if updates["status"] not in ("rejected", "ready_for_distribution"):
                raise HTTPException(status_code=403, detail="Unauthorized status")
        else:  # member
            if updates["status"] != "rejected":
                raise HTTPException(status_code=403, detail="Members are only allowed to move posts to 'rejected'.")
            if post.author_id != current_user.users_uuid:
                raise HTTPException(status_code=403, detail="You are not the author of this post.")

    if ("title" in updates or "content" in updates) and post.author_id != current_user.users_uuid:
        raise HTTPException(status_code=403, detail="Only the author is allowed to edit the content of the post.")

    return crud.update_post(db, post, updates)

@router.post("/{workspace_id}/tasks", response_model=TaskResponse, status_code=201)
def create_task(
    payload: TaskCreateRequest,
    ctx: WorkspaceContext = Depends(get_workspace_context),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskResponse:
    if ctx.role != "manager":
        raise HTTPException(status_code=403, detail="Only Manager")
    return crud.create_task(
        db,
        workspace_id=ctx.workspace.workspace_uuid,
        title=payload.title,
        content=payload.content,
        priority=payload.priority,
        assigned_to=payload.assigned_to,
    )

@router.delete("/{workspace_id}/members/{user_id}", response_model=MemberResponse)
def remove_member(
    user_id: uuid.UUID,
    ctx: WorkspaceContext = Depends(get_workspace_context),
    db: Session = Depends(get_db),
) -> MemberResponse:
    if ctx.role != "manager":
        raise HTTPException(status_code=403, detail="Chỉ manager mới được xoá thành viên")
    membership = crud.soft_remove_member(db, ctx.workspace.workspace_uuid, user_id)
    if membership is None:
        raise HTTPException(status_code=404, detail="Member not found hoặc đã bị remove trước đó")
    return MemberResponse(
        user_id=membership.user.users_uuid,
        username=membership.user.username,
        email=membership.user.email,
        status=membership.status,
        joined_at=membership.joined_at,
    )