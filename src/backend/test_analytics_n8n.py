import unittest
import uuid
from datetime import date, datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker
from cryptography.fernet import Fernet

from app.database import engine, Base, get_db
from app.main import app
from app.models import User, Workspace, SocialAccount, Post, PostDistribution
from app.analytics.models import IngestionRun, EngagementMetric
from app.security import create_access_token
from app.config import get_settings


class TestAnalyticsN8NIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.settings = get_settings()

        SessionLocal = sessionmaker(bind=engine)
        cls.db = SessionLocal()

        # 1. Create test user & workspace
        cls.test_user_id = uuid.uuid4()
        cls.test_manager = User(
            users_uuid=cls.test_user_id,
            username=f"n8n_mgr_{uuid.uuid4().hex[:6]}",
            email=f"n8n_mgr_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="fakehash",
            is_email_verified=True,
        )
        cls.db.add(cls.test_manager)
        cls.db.flush()

        cls.test_ws_id = uuid.uuid4().hex[:16]
        cls.test_ws = Workspace(
            workspace_uuid=cls.test_ws_id,
            workspacename="n8n Test Workspace",
            manager_id=cls.test_manager.users_uuid,
            pin_hash=f"pin_{uuid.uuid4().hex[:6]}",
        )
        cls.db.add(cls.test_ws)
        cls.db.flush()

        # 2. Create test Facebook & LinkedIn channels with Fernet tokens
        f = Fernet(cls.settings.fernet_secret_key.encode())
        fb_token = f.encrypt(b"EAAB_mock_fb_access_token_123").decode()
        li_token = f.encrypt(b"AQU_mock_li_access_token_456").decode()

        cls.fb_channel_id = uuid.uuid4()
        cls.fb_channel = SocialAccount(
            id=cls.fb_channel_id,
            platform="facebook",
            platform_account_id=f"fb_page_{uuid.uuid4().hex[:6]}",
            display_name="Test FB Page",
            owner_type="workspace",
            owner_id=cls.test_ws_id,
            connected_by=cls.test_manager.users_uuid,
            access_token_encrypted=fb_token,
            status="active",
        )
        cls.db.add(cls.fb_channel)

        cls.li_channel_id = uuid.uuid4()
        cls.li_channel = SocialAccount(
            id=cls.li_channel_id,
            platform="linkedin",
            platform_account_id=f"li_org_{uuid.uuid4().hex[:6]}",
            display_name="Test LinkedIn Page",
            owner_type="workspace",
            owner_id=cls.test_ws_id,
            connected_by=cls.test_manager.users_uuid,
            access_token_encrypted=li_token,
            status="active",
        )
        cls.db.add(cls.li_channel)
        cls.db.flush()

        # 3. Create published test posts
        cls.post_1 = Post(
            id=uuid.uuid4(),
            workspace_id=cls.test_ws_id,
            author_id=cls.test_manager.users_uuid,
            title="n8n Automated Sync Test Post 1",
            content="Testing automated metrics synchronization.",
            status="published",
            published_at=datetime.now(timezone.utc),
        )
        cls.db.add(cls.post_1)
        cls.db.flush()

        cls.dist_1 = PostDistribution(
            id=uuid.uuid4(),
            post_id=cls.post_1.id,
            channel_id=cls.fb_channel_id,
            status="published",
            published_url="https://www.facebook.com/12345/posts/67890",
            external_post_id="fb_ext_post_1001",
        )
        cls.db.add(cls.dist_1)
        cls.db.commit()

        # 4. Auth headers
        token_str, _ = create_access_token(str(cls.test_manager.users_uuid))
        cls.user_headers = {"Authorization": f"Bearer {token_str}"}
        cls.internal_headers = {"X-Internal-API-Key": cls.settings.internal_api_key}

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_tc1_internal_api_key_security_guard(self):
        """TC1: Internal API Key authentication guard verification"""
        # Missing key
        res_no_key = self.client.get(f"/api/v1/internal/tokens/{self.fb_channel_id}")
        self.assertEqual(res_no_key.status_code, 401)

        # Invalid key
        res_bad_key = self.client.get(
            f"/api/v1/internal/tokens/{self.fb_channel_id}",
            headers={"X-Internal-API-Key": "wrong-secret-key"}
        )
        self.assertEqual(res_bad_key.status_code, 401)

        # Valid key
        res_ok = self.client.get(
            f"/api/v1/internal/tokens/{self.fb_channel_id}",
            headers=self.internal_headers
        )
        self.assertEqual(res_ok.status_code, 200)

    def test_tc2_safe_token_decryption_for_n8n(self):
        """TC2: Safe Fernet token decryption for n8n worker"""
        res = self.client.get(
            f"/api/v1/internal/tokens/{self.fb_channel_id}",
            headers=self.internal_headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["channel_id"], str(self.fb_channel_id))
        self.assertEqual(data["platform"], "facebook")
        self.assertEqual(data["access_token"], "EAAB_mock_fb_access_token_123")

    def test_tc3_discovery_active_published_posts(self):
        """TC3: Discovery query for n8n to discover published posts"""
        res = self.client.get(
            f"/api/v1/internal/posts/active?workspace_id={self.test_ws_id}",
            headers=self.internal_headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["total_posts"], 1)
        found = any(p["external_post_id"] == "fb_ext_post_1001" for p in data["posts"])
        self.assertTrue(found)

    def test_tc4_batch_ingest_upsert_idempotency(self):
        """TC4: Batch Ingestion & UPSERT idempotency verification"""
        run_id = str(uuid.uuid4())
        payload = {
            "schema_version": "1.0",
            "platform": "facebook",
            "ingestion_run_id": run_id,
            "records": [
                {
                    "channel_id": str(self.fb_channel_id),
                    "external_post_id": "fb_ext_post_1001",
                    "metric_date": "2026-08-17",
                    "metrics": {
                        "impressions": 2000,
                        "reach": 1800,
                        "views": 1600,
                        "likes": 250,
                        "comments": 60,
                        "shares": 20,
                        "clicks": 40
                    }
                }
            ]
        }

        # 1st Ingestion
        res1 = self.client.post(
            "/api/v1/internal/ingest/metrics",
            json=payload,
            headers=self.internal_headers
        )
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res1.json()["success_count"], 1)

        # 2nd Ingestion (Updated metric values)
        payload["records"][0]["metrics"]["likes"] = 300
        res2 = self.client.post(
            "/api/v1/internal/ingest/metrics",
            json=payload,
            headers=self.internal_headers
        )
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json()["success_count"], 1)

    def test_tc5_failure_isolation_in_batch(self):
        """TC5: Failure isolation — an invalid channel does not crash valid records in batch"""
        run_id = str(uuid.uuid4())
        invalid_channel_id = str(uuid.uuid4())
        payload = {
            "schema_version": "1.0",
            "platform": "facebook",
            "ingestion_run_id": run_id,
            "records": [
                {
                    "channel_id": str(self.fb_channel_id),
                    "external_post_id": "fb_valid_post_1",
                    "metric_date": "2026-08-17",
                    "metrics": {"impressions": 100, "reach": 80, "views": 70, "likes": 10, "comments": 2, "shares": 1, "clicks": 5}
                },
                {
                    "channel_id": invalid_channel_id,
                    "external_post_id": "fb_invalid_channel_post",
                    "metric_date": "2026-08-17",
                    "metrics": {"impressions": 50, "reach": 40, "views": 30, "likes": 5, "comments": 1, "shares": 0, "clicks": 2}
                }
            ]
        }
        res = self.client.post(
            "/api/v1/internal/ingest/metrics",
            json=payload,
            headers=self.internal_headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_records"], 2)
        self.assertEqual(data["success_count"], 1)
        self.assertEqual(data["error_count"], 1)
        self.assertEqual(data["status"], "partial")

    def test_tc6_timeline_reflects_ingested_metrics(self):
        """TC6: Timeline analytics query reflects newly ingested metrics"""
        res = self.client.get(
            f"/api/v1/analytics/{self.test_ws_id}/timeline?timeframe=Weekly",
            headers=self.user_headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["timeframe"], "Weekly")
        self.assertIn("facebook", data["series"])
        self.assertIn("linkedin", data["series"])

    def test_tc7_overview_percentage_calculation(self):
        """TC7: Overview calculation returns 100% total platform distribution"""
        res = self.client.get(
            f"/api/v1/analytics/{self.test_ws_id}/overview",
            headers=self.user_headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        fb_pct = data["facebook"]["percentage"]
        li_pct = data["linkedin"]["percentage"]
        self.assertEqual(fb_pct + li_pct, 100)

    def test_tc8_manual_sync_trigger_endpoint(self):
        """TC8: Manual sync trigger endpoint returns 200 with dispatch status"""
        res = self.client.post(
            f"/api/v1/analytics/{self.test_ws_id}/sync",
            headers=self.user_headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["workspace_id"], self.test_ws_id)


if __name__ == "__main__":
    print("\n=======================================================")
    print(" RUNNING n8n & ANALYTICS INGESTION INTEGRATION TESTS")
    print("=======================================================\n")
    unittest.main(verbosity=2)
