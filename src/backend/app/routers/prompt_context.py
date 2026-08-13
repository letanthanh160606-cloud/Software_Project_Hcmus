import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(
    prefix="/prompt-context",
    tags=["Prompt & Context"],
)

@router.post(
    "/templates",
    response_model=schemas.PromptTemplateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_prompt_template(
    payload: schemas.PromptTemplateCreate,
    db: Session = Depends(get_db),
):
    return crud.create_prompt_template(
        db,
        title=payload.title,
        content=payload.content,
        tags=payload.tags,
    )


@router.get(
    "/templates",
    response_model=list[schemas.PromptTemplateResponse],
)
def list_prompt_templates(
    db: Session = Depends(get_db),
):
    return crud.list_prompt_templates(db)


@router.get(
    "/templates/{template_id}",
    response_model=schemas.PromptTemplateResponse,
)
def get_prompt_template(
    template_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    template = crud.get_prompt_template_by_id(db, template_id)

    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt template not found",
        )

    return template


@router.patch(
    "/templates/{template_id}",
    response_model=schemas.PromptTemplateResponse,
)
def update_prompt_template(
    template_id: uuid.UUID,
    payload: schemas.PromptTemplateUpdate,
    db: Session = Depends(get_db),
):
    template = crud.get_prompt_template_by_id(db, template_id)

    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt template not found",
        )

    updates = payload.model_dump(exclude_unset=True)

    return crud.update_prompt_template(
        db,
        template=template,
        updates=updates,
    )

@router.post(
    "/contexts",
    response_model=schemas.ContextResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_context(
    payload: schemas.ContextCreate,
    db: Session = Depends(get_db),
):
    return crud.create_context(
        db,
        title=payload.title,
        documents=payload.documents,
        tags=payload.tags,
    )


@router.get(
    "/contexts",
    response_model=list[schemas.ContextResponse],
)
def list_contexts(
    db: Session = Depends(get_db),
):
    return crud.list_contexts(db)


@router.get(
    "/contexts/{context_id}",
    response_model=schemas.ContextResponse,
)
def get_context(
    context_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    context = crud.get_context_by_id(db, context_id)

    if context is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Context not found",
        )

    return context


@router.patch(
    "/contexts/{context_id}",
    response_model=schemas.ContextResponse,
)
def update_context(
    context_id: uuid.UUID,
    payload: schemas.ContextUpdate,
    db: Session = Depends(get_db),
):
    context = crud.get_context_by_id(db, context_id)

    if context is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Context not found",
        )

    updates = payload.model_dump(exclude_unset=True)

    return crud.update_context(
        db,
        context=context,
        updates=updates,
    )