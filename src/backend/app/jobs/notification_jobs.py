from app.database import SessionLocal
from app import crud


def check_due_soon_tasks():
    db = SessionLocal()
    try:
        tasks = crud.get_tasks_due_soon(db, hours=24)
        for task in tasks:
            crud.create_due_soon_notification(db, task)
    finally:
        db.close()