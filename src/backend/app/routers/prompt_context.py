import uuid as _uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.dependencies import get_current_user

from app.models import KnowledgeBase, PromptTemplate, User
from app.schemas import (
    KnowledgeBaseCreateRequest,
    KnowledgeBaseCreateResponse,
    KnowledgeBaseResponse,
    PromptTemplateCreateRequest,
    PromptTemplateResponse,
)


router = APIRouter(
    prefix="/prompt-context",
    tags=["prompt-context"],
)


@router.post("/prompt-templates", response_model=PromptTemplateResponse)
def create_prompt_template(
    payload: PromptTemplateCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PromptTemplateResponse:
    user_ws = crud.get_workspace_for_user(db, current_user)
    ws_id = user_ws.workspace_uuid if user_ws else None

    try:
        prompt_template = crud.create_prompt_template(
            db,
            owner_workspace_id=ws_id,
            owner_user_id=current_user.users_uuid,
            title=payload.title,
            content=payload.content,
            tag=payload.tag,
            created_by=current_user.users_uuid,
        )
        return prompt_template
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt template with the same title already exists.",
        )


@router.get("/prompt-templates", response_model=list[PromptTemplateResponse])
def get_list_prompt_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PromptTemplateResponse]:
    user_ws = crud.get_workspace_for_user(db, current_user)
    ws_id = user_ws.workspace_uuid if user_ws else None

    prompt_templates = crud.get_list_prompt_templates(
        db,
        owner_workspace_id=ws_id,
        owner_user_id=current_user.users_uuid,
    )
    return prompt_templates


@router.post("/knowledge-bases", response_model=KnowledgeBaseCreateResponse, status_code=201)
def create_knowledge_base(
    payload: KnowledgeBaseCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> KnowledgeBaseCreateResponse:
    user_ws = crud.get_workspace_for_user(db, current_user)
    ws_id = user_ws.workspace_uuid if user_ws else None

    try:
        knowledge_base, upload_url = crud.create_knowledge_base(
            db,
            owner_workspace_id=ws_id,
            owner_user_id=current_user.users_uuid,
            title=payload.title,
            content=payload.content,
            file_size_bytes=payload.file_size_bytes,
            mime_type=payload.mime_type,
            created_by=current_user.users_uuid,
            file_path=payload.file_path,
            file_name=payload.file_name,
            tag=payload.tag,
        )
        return KnowledgeBaseCreateResponse(
            knowledge_base=knowledge_base,
            upload_url=upload_url,
        )
    except Exception as e:
        if "file_path" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unexpected parameter 'file_path' passed. Please use 'file_name' instead.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("/knowledge-bases", response_model=list[KnowledgeBaseResponse])
def get_list_knowledge_bases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[KnowledgeBaseResponse]:
    user_ws = crud.get_workspace_for_user(db, current_user)
    ws_id = user_ws.workspace_uuid if user_ws else None

    knowledge_bases = crud.get_list_knowledge_bases(
        db,
        owner_workspace_id=ws_id,
        owner_user_id=current_user.users_uuid,
    )
    return knowledge_bases


@router.delete("/prompt-templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        t_uuid = _uuid.UUID(template_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid template ID")

    template = db.scalar(
        select(PromptTemplate).where(PromptTemplate.id == t_uuid, PromptTemplate.is_deleted == False)
    )
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt template not found.")

    user_ws = crud.get_workspace_for_user(db, current_user)
    is_ws_manager = bool(
        user_ws and template.owner_workspace_id == user_ws.workspace_uuid and user_ws.manager_id == current_user.users_uuid
    )
    is_creator_or_owner = (
        template.created_by == current_user.users_uuid or template.owner_user_id == current_user.users_uuid
    )

    if not (is_creator_or_owner or is_ws_manager):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this prompt template.",
        )

    crud.delete_prompt_template(db, template_id=t_uuid)
    return None


@router.delete("/knowledge-bases/{kb_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_base(
    kb_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        k_uuid = _uuid.UUID(kb_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid knowledge base ID")

    kb = db.scalar(
        select(KnowledgeBase).where(KnowledgeBase.id == k_uuid, KnowledgeBase.is_deleted == False)
    )
    if not kb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge base not found.")

    user_ws = crud.get_workspace_for_user(db, current_user)
    is_ws_manager = bool(
        user_ws and kb.owner_workspace_id == user_ws.workspace_uuid and user_ws.manager_id == current_user.users_uuid
    )
    is_creator_or_owner = (
        kb.created_by == current_user.users_uuid or kb.owner_user_id == current_user.users_uuid
    )

    if not (is_creator_or_owner or is_ws_manager):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this knowledge base document.",
        )

    crud.delete_knowledge_base(db, kb_id=k_uuid)
    return None
