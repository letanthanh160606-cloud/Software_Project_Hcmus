from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Post, User
from app.schemas import (
    AIContentGenerateRequest,
    AIContentGenerateResponse,
    PostCreate,
    PostResponse,
)
from app.services.ai_content_service import ai_content_service


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
    is_manager = False
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
        is_manager = (workspace.manager_id == current_user.users_uuid)

    # Cross-validation between target_platforms and target_account_ids
    if payload.target_account_ids and len(payload.target_account_ids) > 0:
        from app.models import SocialAccount
        from sqlalchemy import select
        selected_platforms = set(p.lower().strip() for p in (payload.target_platforms or []))
        accounts = db.scalars(
            select(SocialAccount).where(SocialAccount.id.in_(payload.target_account_ids))
        ).all()
        for acc in accounts:
            if acc.platform.lower().strip() not in selected_platforms:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid target account: '{acc.display_name}' ({acc.platform}) does not belong to selected target platforms {list(selected_platforms)}."
                )

    if is_manager:
        post_status = "draft" if payload.status == "draft" else "ready_for_distribution"
    elif payload.workspace_id is not None:
        # Member submitting to workspace
        post_status = "draft" if payload.status == "draft" else "pending_review"
    else:
        # Individual account
        post_status = "draft" if payload.status == "draft" else "ready_for_distribution"

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
            target_platforms=payload.target_platforms,
            target_account_ids=payload.target_account_ids,
            target_accounts_mode=payload.target_accounts_mode or "ALL_SELECTED_PLATFORMS",
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
) -> list[PostResponse]:
    posts = crud.list_posts_for_user(db, current_user.users_uuid)
    return crud.attach_engagements_to_posts(db, posts)


@router.post(
    "/generate-ai",
    response_model=AIContentGenerateResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_ai_content(
    payload: AIContentGenerateRequest,
    current_user: User = Depends(get_current_user),
) -> AIContentGenerateResponse:
    try:
        result = await ai_content_service.generate_content(
            prompt_template=payload.prompt_template,
            manual_prompt=payload.manual_prompt,
            knowledge_base_context=payload.knowledge_base_context,
            existing_title=payload.existing_title,
            existing_content=payload.existing_content,
            target_platforms=payload.target_platforms,
        )
        return AIContentGenerateResponse(
            title=result.get("title", ""),
            content=result.get("content", ""),
            suggested_hashtags=result.get("suggested_hashtags", []),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {exc}",
        ) from exc