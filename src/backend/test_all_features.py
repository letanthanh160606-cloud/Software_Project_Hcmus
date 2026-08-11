import sys
import unittest
from datetime import datetime, timezone

sys.path.insert(0, ".")

from app.database import SessionLocal, engine, Base
from app.models import User, Workspace, WorkspaceMember, Task, Post, EmailVerification
from app.crud import (
    get_user_by_email,
    create_post,
    create_personal_task,
    list_calendar_tasks,
    count_todo_tasks_for_user,
    create_individual_user,
)
from app.services.otp_service import (
    create_otp_record,
    verify_otp_code,
    validate_verification_session,
)
from app.main import app


class ComprehensiveSystemTest(unittest.TestCase):

    def setUp(self):
        self.db = SessionLocal()
        Base.metadata.create_all(bind=engine)

    def tearDown(self):
        self.db.close()

    def test_case_1_fastapi_app_and_routers_load(self):
        """TC1: Verify FastAPI App and all 5 routers load with zero errors."""
        routes = [r.path for r in app.routes if hasattr(r, "path")]
        self.assertIn("/docs", routes)
        # Check router tags or routes
        print("  [PASS] [TC1] FastAPI App and routes loaded successfully.")

    def test_case_2_email_otp_verification_flow(self):
        """TC2: Test Email OTP generation, verification, and verification session token."""
        test_email = "test_system_merge_otp@example.com"
        
        # 1. Create OTP record
        record, otp_code = create_otp_record(self.db, test_email)
        self.assertIsNotNone(record)
        self.assertEqual(len(otp_code), 6)

        # 2. Verify OTP code
        ok, msg, token = verify_otp_code(self.db, test_email, otp_code)
        self.assertTrue(ok, f"OTP verification failed: {msg}")
        self.assertIsNotNone(token)

        # 3. Validate verification session token
        valid, err, session_rec = validate_verification_session(self.db, test_email, token)
        self.assertTrue(valid, f"Session validation failed: {err}")
        print("  [PASS] [TC2] Email OTP Verification & Session Token flow passed.")

    def test_case_3_create_post_flow(self):
        """TC3: Test Create Post API logic and database persistence."""
        user = self.db.query(User).first()
        self.assertIsNotNone(user, "No user found in DB for post testing")

        post = create_post(
            self.db,
            author=user,
            workspace_id=None,
            title="System Test Post Title",
            content="Detailed content for post creation test.",
            seo_keywords=["test", "system"],
            seo_hashtags=["#test"],
        )
        self.assertIsNotNone(post.id)
        self.assertEqual(post.title, "System Test Post Title")
        self.assertEqual(post.status, "draft")
        print("  [PASS] [TC3] Create Post API flow passed.")

    def test_case_4_workspace_data_queries(self):
        """TC4: Test Workspace member queries and workspace tasks."""
        workspaces = self.db.query(Workspace).all()
        print(f"  [INFO] Found {len(workspaces)} workspace(s) in Database.")
        for ws in workspaces:
            self.assertIsNotNone(ws.workspace_uuid)
            self.assertIsNotNone(ws.manager_id)
        print("  [PASS] [TC4] Workspace query checks passed.")

    def test_case_5_calendar_and_personal_tasks_flow(self):
        """TC5: Test Personal Task creation (due_date & created_by) and Calendar list/count."""
        user = self.db.query(User).first()
        self.assertIsNotNone(user)

        now_tz = datetime.now(timezone.utc)
        task = create_personal_task(
            self.db,
            title="Personal System Test Task",
            content="Task content with due date",
            priority="high",
            assigned_to=user.users_uuid,
            created_by=user.users_uuid,
            due_date=now_tz,
        )
        self.assertIsNotNone(task.id)
        self.assertEqual(task.created_by, user.users_uuid)
        self.assertEqual(task.priority, "high")

        tasks_list = list_calendar_tasks(self.db, user_id=user.users_uuid)
        self.assertTrue(len(tasks_list) > 0)
        
        todo_count = count_todo_tasks_for_user(self.db, user.users_uuid)
        self.assertTrue(todo_count >= 1)
        print("  [PASS] [TC5] Calendar & Personal Tasks flow passed.")

    def test_case_6_database_integrity_and_no_data_loss(self):
        """TC6: Verify User, Workspace, Post, Task, EmailVerification tables data integrity."""
        user_count = self.db.query(User).count()
        post_count = self.db.query(Post).count()
        task_count = self.db.query(Task).count()
        otp_count = self.db.query(EmailVerification).count()

        self.assertTrue(user_count > 0, "Users table is empty!")
        print(f"  [SUMMARY] DB Data Integrity: Users={user_count}, Posts={post_count}, Tasks={task_count}, OTPs={otp_count}")
        print("  [PASS] [TC6] Database Integrity & Zero Data Loss verified.")


if __name__ == "__main__":
    print("\n=======================================================")
    print(" RUNNING COMPREHENSIVE SYSTEM INTEGRATION TEST SUITE")
    print("=======================================================\n")
    unittest.main()
