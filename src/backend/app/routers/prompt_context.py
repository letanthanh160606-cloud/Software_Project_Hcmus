from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.dependencies import get_current_user, get_workspace_context

from app.models import PromptTemplate, User
from app.schemas import KnowledgeBaseCreateRequest, KnowledgeBaseCreateResponse, KnowledgeBaseResponse, PromptTemplateCreateRequest, PromptTemplateResponse


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
        try:
            prompt_template = crud.create_prompt_template(
                db,
                owner_workspace_id=None,
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
        prompt_templates = crud.get_list_prompt_templates(
            db,
            owner_workspace_id=None,
            owner_user_id=current_user.users_uuid,
        )
        return prompt_templates

@router.post("/knowledge-bases", response_model= KnowledgeBaseCreateResponse, status_code=201)
def create_knowledge_base(
    payload: KnowledgeBaseCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> KnowledgeBaseCreateResponse:
    try:
        knowledge_base, upload_url = crud.create_knowledge_base(
            db,
            owner_workspace_id=None,
            owner_user_id=current_user.users_uuid,
            title=payload.title,
            content=payload.content,
            file_size_bytes=payload.file_size_bytes,
            mime_type=payload.mime_type,
            created_by=current_user.users_uuid,
            file_path=payload.file_path,
            file_name=payload.file_name,
            tag=payload.tag
        )
        return KnowledgeBaseCreateResponse(
            knowledge_base=knowledge_base,
            upload_url=upload_url
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
        knowledge_bases = crud.get_list_knowledge_bases(
            db,
            owner_workspace_id=None,
            owner_user_id=current_user.users_uuid,
        )
        return knowledge_bases

@router.delete("/prompt-templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import uuid as _uuid
    try:
        t_uuid = _uuid.UUID(template_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid template ID")
    success = crud.delete_prompt_template(db, template_id=t_uuid, owner_user_id=current_user.users_uuid)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt template not found.")
    return None

@router.delete("/knowledge-bases/{kb_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_base(
    kb_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import uuid as _uuid
    try:
        k_uuid = _uuid.UUID(kb_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid knowledge base ID")
    success = crud.delete_knowledge_base(db, kb_id=k_uuid, owner_user_id=current_user.users_uuid)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge base not found.")
    return None


