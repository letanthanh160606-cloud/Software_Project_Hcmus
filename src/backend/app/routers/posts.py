import uuid
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Post, User
from app.r2 import generate_presigned_url, upload_file_to_r2
from app.config import get_settings
from app.schemas import (
    AIContentGenerateRequest,
    AIContentGenerateResponse,
    PostCreate,
    PostResponse,
    PostUpdateRequest,
    PostMediaUploadResponse,
    SEOSuggestRequest,
    SEOSuggestResponse,
)
from app.services.ai_content_service import ai_content_service
from app.services.seo_service import seo_suggest_service


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
    ws_id = payload.workspace_id
    if ws_id is None:
        user_ws = crud.get_workspace_for_user(db, current_user)
        if user_ws:
            ws_id = user_ws.workspace_uuid
        elif current_user.account_type == "business":
            from app.models import WorkspaceMember
            pending_membership = db.scalar(
                select(WorkspaceMember).where(
                    WorkspaceMember.user_id == current_user.users_uuid,
                )
            )
            if pending_membership:
                ws_id = pending_membership.workspace_id

    is_manager = False
    if ws_id is not None:
        workspace = crud.get_workspace_by_id(
            db,
            ws_id,
        )

        if workspace is not None:
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
    elif current_user.account_type == "business" or ws_id is not None:
        # Business member submitting to workspace -> pending_review
        post_status = "draft" if payload.status == "draft" else "pending_review"
    else:
        # Individual account
        post_status = "draft" if payload.status == "draft" else "ready_for_distribution"

    try:
        post = crud.create_post(
            db,
            author=current_user,
            workspace_id=ws_id,
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
            post_id=payload.id,
        )

        # Link media attachment if an image was pre-uploaded
        if payload.image_url:
            crud.create_post_media(db, post_id=post.id, image_url=payload.image_url)
            db.refresh(post)

        return post

    except IntegrityError as exc:
        db.rollback()
        logger.error(f"Post creation IntegrityError: {exc}")
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
    """
    Generate compelling post content using Gemini AI based on:
    - prompt_template: content from selected PromptTemplate
    - manual_prompt: user's freeform prompt input
    - knowledge_base_context: concatenated text from checked KnowledgeBase items
    - existing_title / existing_content: draft text already in the form
    - target_platforms: platforms targeted (affects tone/formatting)
    """
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
            detail=f"AI content generation failed: {exc}",
        ) from exc


@router.post(
    "/upload-media",
    response_model=PostMediaUploadResponse,
    status_code=status.HTTP_200_OK,
)
def upload_media(
    file_name: str = Query(..., description="Original name of the image file"),
    content_type: str = Query(..., description="MIME type of the image"),
    post_id: str | None = Query(default=None, description="Post ID used as directory name"),
    current_user: User = Depends(get_current_user),
) -> PostMediaUploadResponse:
    """
    Generate a presigned PUT URL so the frontend can upload an image directly to
    Cloudflare R2. Returns the upload URL and the public URL that will be stored
    in the database once the upload completes.
    """
    import uuid as _uuid
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{content_type}'. Allowed: JPEG, PNG, WebP, GIF.",
        )

    settings = get_settings()
    folder_id = post_id.strip() if (post_id and post_id.strip()) else str(_uuid.uuid4())
    ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "jpg"
    object_key = f"posts/{folder_id}/{_uuid.uuid4()}.{ext}"

    try:
        upload_url = generate_presigned_url(object_key, content_type, expires_in=900)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not generate upload URL: {exc}",
        ) from exc

    public_url = f"{(settings.R2_PUBLIC_BASE_URL or '').rstrip('/')}/{object_key}"

    return PostMediaUploadResponse(
        upload_url=upload_url,
        object_key=object_key,
        public_url=public_url,
    )


@router.post(
    "/upload-media-direct",
    summary="Upload image directly through backend to Cloudflare R2 into post folder",
)
async def upload_media_direct(
    file: UploadFile = File(...),
    post_id: str | None = Query(default=None, description="Post ID used as directory name"),
    current_user: User = Depends(get_current_user),
):
    import uuid as _uuid
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    content_type = file.content_type or "image/jpeg"
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{content_type}'. Allowed: JPEG, PNG, WebP, GIF.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large (max 50MB)")

    folder_id = post_id.strip() if (post_id and post_id.strip()) else str(_uuid.uuid4())
    file_name = file.filename or "image.jpg"
    ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "jpg"
    object_key = f"posts/{folder_id}/{_uuid.uuid4()}.{ext}"

    try:
        public_url = upload_file_to_r2(file_bytes, object_key, content_type)
        return {"public_url": public_url, "object_key": object_key, "post_id": folder_id}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file to storage: {exc}"
        ) from exc



@router.post(
    "/seo-suggest",
    response_model=SEOSuggestResponse,
    status_code=status.HTTP_200_OK,
)
async def seo_suggest(
    payload: SEOSuggestRequest,
    current_user: User = Depends(get_current_user),
) -> SEOSuggestResponse:
    """
    Analyze post content with Gemini AI and return SEO keywords, hashtags,
    and a GEO (Generative Engine Optimization) tip.
    """
    try:
        result = await seo_suggest_service.suggest(
            title=payload.title,
            content=payload.content,
            target_platforms=payload.target_platforms,
        )
        return SEOSuggestResponse(
            seo_keywords=result.get("seo_keywords", []),
            hashtags=result.get("hashtags", []),
            geo_tip=result.get("geo_tip", ""),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SEO analysis failed: {exc}",
        ) from exc


@router.patch(
    "/{post_id}",
    response_model=PostResponse,
    status_code=status.HTTP_200_OK,
)
def update_post_endpoint(
    post_id: uuid.UUID,
    payload: PostUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Post:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    user_ws = crud.get_workspace_for_user(db, current_user)
    is_manager = bool(user_ws and user_ws.manager_id == current_user.users_uuid)
    if post.author_id != current_user.users_uuid and not is_manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this post")

    updates = payload.model_dump(exclude_unset=True)
    updated_post = crud.update_post(db, post, updates)
    return updated_post