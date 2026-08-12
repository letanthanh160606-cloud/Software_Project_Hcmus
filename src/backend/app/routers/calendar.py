from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
 
from app import crud
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import CalendarSummaryResponse, CalendarTaskResponse, PersonalTaskCreateRequest, TaskResponse
 
router = APIRouter(prefix="/calendar", tags=["calendar"])

def _to_calendar_response(db: Session, task, user_id) -> CalendarTaskResponse:   # SỬA: thêm tham số db
    assignee = crud.get_user_by_id(db, task.assigned_to) if task.assigned_to else None
    base = TaskResponse(
        id=task.id,
        workspace_id=task.workspace_id,
        title=task.title,
        status=task.status,
        priority=task.priority,
        assigned_to=assignee.username if assignee else None,
        attachment=task.attachment,
        due_date=task.due_date,
        created_at=task.created_at,
        updated_at=task.updated_at,
        created_by=task.created_by,
    )
    return CalendarTaskResponse(
        **base.model_dump(),
        source="personal" if task.workspace_id is None else "workspace",
        is_created_by_me=task.created_by == user_id,
        is_assigned_to_me=task.assigned_to == user_id,
    )

@router.get("/tasks", response_model=CalendarSummaryResponse)
def get_calendar_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CalendarSummaryResponse:
    tasks = crud.list_calendar_tasks(db, user_id=current_user.users_uuid)
 
    return CalendarSummaryResponse(
        tasks=[_to_calendar_response(db, t, current_user.users_uuid) for t in tasks],
        todo_count=crud.count_todo_tasks_for_user(db, current_user.users_uuid),
        assigned_to_others_count=crud.count_tasks_assigned_to_others(db, current_user.users_uuid),
    )

@router.post("/tasks", response_model=CalendarTaskResponse, status_code=201)
def create_personal_task(
    payload: PersonalTaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CalendarTaskResponse:
    task = crud.create_personal_task(
        db,
        title=payload.title,
        content=payload.content,
        priority=payload.priority,
        created_by=current_user.users_uuid,
        due_date=payload.due_date,
    )
    return _to_calendar_response(db, task, current_user.users_uuid)