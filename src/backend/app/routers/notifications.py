from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import NotificationResponse, NotificationCountUnreadResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
def get_notifications(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.list_notifications_for_user(db, current_user.users_uuid, limit=limit)


@router.get("/unread-count", response_model=NotificationCountUnreadResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = crud.count_unread_notifications(db, current_user.users_uuid)
    return NotificationCountUnreadResponse(unread_count=count)


@router.patch("/mark-all-read")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = crud.mark_all_notifications_read(db, current_user.users_uuid)
    return {"marked_count": count}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = crud.mark_notification_read(db, notification_id, current_user.users_uuid)
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return notification
