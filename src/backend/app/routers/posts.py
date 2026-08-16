from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Post, User
from app.schemas import PostCreate, PostResponse


router = APIRouter(
    prefix="/posts",
    tags=["posts"],
)


@router.post(
    "",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post(
    payload: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Post:
    if payload.workspace_id is not None:
        workspace = crud.get_workspace_by_id(
            db,
            payload.workspace_id,
        )

        if workspace is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )

        if not crud.user_can_access_workspace(
            db,
            user=current_user,
            workspace_id=payload.workspace_id,
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this workspace",
            )

    post_status = "pending_review" if payload.status in ("pending", "pending_review") else "draft"

    try:
        return crud.create_post(
            db,
            author=current_user,
            workspace_id=payload.workspace_id,
            title=payload.title,
            content=payload.content,
            prompt_template_id=payload.prompt_template_id,
            knowledge_base_id=payload.knowledge_base_id,
            seo_keywords=payload.seo_keywords,
            seo_hashtags=payload.seo_hashtags,
            status=post_status,
        )

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post could not be created because related data is invalid",
        ) from exc


@router.get(
    "",
    response_model=list[PostResponse],
)
def list_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Post]:
    return crud.list_posts_for_user(db, current_user.users_uuid)