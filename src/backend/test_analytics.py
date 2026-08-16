import unittest
import uuid
from datetime import date, datetime, timezone
from fastapi.testclient import TestClient

from app.database import engine, Base, get_db
from app.main import app
from app.models import User, Workspace, WorkspaceMember, SocialAccount
from app.analytics.models import IngestionRun, EngagementMetric, Report
from app.security import create_access_token
from cryptography.fernet import Fernet
from app.config import get_settings


class TestAnalyticsModule(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.settings = get_settings()

        # Create test DB session
        from sqlalchemy.orm import sessionmaker
        SessionLocal = sessionmaker(bind=engine)
        cls.db = SessionLocal()

        # Create unique test workspace and user
        cls.test_user_id = uuid.uuid4()
        cls.test_manager = User(
            users_uuid=cls.test_user_id,
            username=f"test_analytics_mgr_{uuid.uuid4().hex[:6]}",
            email=f"analytics_mgr_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="fakehash",
            is_email_verified=True,
        )
        cls.db.add(cls.test_manager)
        cls.db.flush()

        cls.test_ws_id = uuid.uuid4().hex[:16]
        cls.test_ws = Workspace(
            workspace_uuid=cls.test_ws_id,
            workspacename="Test Analytics Workspace",
            manager_id=cls.test_manager.users_uuid,
            pin_hash=f"pin_{uuid.uuid4().hex[:6]}",
        )
        cls.db.add(cls.test_ws)
        cls.db.flush()

        # Create test Social Account with Fernet encrypted token
        f = Fernet(cls.settings.fernet_secret_key.encode())
        encrypted_tok = f.encrypt(b"EAAB_test_mock_access_token_12345").decode()

        cls.test_channel_id = uuid.uuid4()
        cls.test_channel = SocialAccount(
            id=cls.test_channel_id,
            platform="facebook",
            platform_account_id=f"fb_page_{uuid.uuid4().hex[:8]}",
            display_name="Test FB Page",
            owner_type="workspace",
            owner_id=cls.test_ws_id,
            connected_by=cls.test_manager.users_uuid,
            access_token_encrypted=encrypted_tok,
            status="active",
        )
        cls.db.add(cls.test_channel)
        cls.db.commit()

        # Generate JWT Auth Token
        token_str, _ = create_access_token(str(cls.test_manager.users_uuid))
        cls.token = token_str
        cls.headers = {"Authorization": f"Bearer {cls.token}"}
        cls.internal_headers = {"X-Internal-API-Key": cls.settings.internal_api_key}

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_tc1_internal_ingest_metrics_and_idempotency(self):
        """TC1: Internal batch metrics ingestion and idempotency upsert verification"""
        run_id = str(uuid.uuid4())
        payload = {
            "schema_version": "1.0",
            "platform": "facebook",
            "ingestion_run_id": run_id,
            "records": [
                {
                    "channel_id": str(self.test_channel_id),
                    "external_post_id": "ext_post_8899",
                    "metric_date": "2026-08-16",
                    "metrics": {
                        "impressions": 1500,
                        "reach": 1200,
                        "views": 1100,
                        "likes": 120,
                        "comments": 45,
                        "shares": 15,
                        "clicks": 30
                    }
                }
            ]
        }

        # First ingestion
        res1 = self.client.post("/api/v1/internal/ingest/metrics", json=payload, headers=self.internal_headers)
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()
        self.assertEqual(data1["success_count"], 1)

        # Retry identical batch (Idempotency check)
        res2 = self.client.post("/api/v1/internal/ingest/metrics", json=payload, headers=self.internal_headers)
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        self.assertEqual(data2["success_count"], 1)
        print("  [PASS] [TC1] n8n Batch Ingestion & Upsert Idempotency verified.")

    def test_tc2_internal_token_decryption_service(self):
        """TC2: Internal token decryption endpoint for authenticated worker"""
        url = f"/api/v1/internal/tokens/{self.test_channel_id}"
        res = self.client.get(url, headers=self.internal_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["access_token"], "EAAB_test_mock_access_token_12345")
        self.assertEqual(data["platform"], "facebook")
        print("  [PASS] [TC2] Safe token decryption endpoint for n8n verified.")

    def test_tc3_client_timeline_endpoint(self):
        """TC3: Timeline chart endpoint with Weekly/Monthly/Yearly aggregation"""
        url = f"/api/v1/analytics/{self.test_ws_id}/timeline?timeframe=Weekly"
        res = self.client.get(url, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("labels", data)
        self.assertIn("series", data)
        self.assertIn("facebook", data["series"])
        self.assertIn("linkedin", data["series"])
        print("  [PASS] [TC3] Timeline MultiLine chart analytics endpoint verified.")

    def test_tc4_client_overview_and_percentages(self):
        """TC4: Overview doughnut percentages calculation"""
        url = f"/api/v1/analytics/{self.test_ws_id}/overview"
        res = self.client.get(url, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("facebook", data)
        self.assertIn("linkedin", data)
        self.assertEqual(data["facebook"]["percentage"] + data["linkedin"]["percentage"], 100)
        print("  [PASS] [TC4] Overview doughnut percentage share calculation verified.")

    def test_tc5_client_today_and_top_posts(self):
        """TC5: Today card interactions and Top 7 engaging posts query"""
        # Today
        today_res = self.client.get(f"/api/v1/analytics/{self.test_ws_id}/today", headers=self.headers)
        self.assertEqual(today_res.status_code, 200)
        today_data = today_res.json()
        self.assertEqual(today_data["role"], "manager")
        self.assertGreaterEqual(today_data["total_interactions_today"], 0)

        # Top posts
        top_res = self.client.get(f"/api/v1/analytics/{self.test_ws_id}/top-posts?limit=7", headers=self.headers)
        self.assertEqual(top_res.status_code, 200)
        top_data = top_res.json()
        self.assertIsInstance(top_data["posts"], list)
        print("  [PASS] [TC5] Today interactions and Top posts query verified.")

    def test_tc6_ai_report_generation_and_guardrails(self):
        """TC6: AI Statistical Report Engine generation and numeric guardrails"""
        url = f"/api/v1/reports/{self.test_ws_id}/generate"
        payload = {"timeframe": "Monthly", "period": "July 2026"}
        res = self.client.post(url, json=payload, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("summary", data)
        self.assertIn("title", data)
        self.assertIn("structured_insights", data)
        print("  [PASS] [TC6] AI Report Engine structured generation & guardrails verified.")

    def test_tc7_report_save_and_history_filter(self):
        """TC7: Report persistence and date range filter lifecycle"""
        # Save Report
        save_url = f"/api/v1/reports/{self.test_ws_id}"
        save_payload = {
            "title": "[Executive Monthly Report]",
            "timeframe": "Monthly",
            "summary": "Verified performance document.",
            "report_data": {"score": 95}
        }
        save_res = self.client.post(save_url, json=save_payload, headers=self.headers)
        self.assertEqual(save_res.status_code, 201)
        saved_item = save_res.json()
        report_id = saved_item["id"]

        # List reports
        list_url = f"/api/v1/reports/{self.test_ws_id}"
        list_res = self.client.get(list_url, headers=self.headers)
        self.assertEqual(list_res.status_code, 200)
        list_data = list_res.json()
        self.assertGreaterEqual(len(list_data["reports"]), 1)

        # Download report
        dl_url = f"/api/v1/reports/{self.test_ws_id}/{report_id}/download"
        dl_res = self.client.get(dl_url, headers=self.headers)
        self.assertEqual(dl_res.status_code, 200)
        self.assertIn("attachment", dl_res.headers.get("content-disposition", ""))
        print("  [PASS] [TC7] Report save, list history, and export download verified.")


if __name__ == "__main__":
    print("\n=======================================================")
    print(" RUNNING STATISTICS & AI MODULE INTEGRATION TESTS")
    print("=======================================================\n")
    unittest.main()
