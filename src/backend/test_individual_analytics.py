import unittest
import uuid
from datetime import date, datetime, timezone
from fastapi.testclient import TestClient

from app.database import engine
from app.main import app
from app.models import Post, SocialAccount, User
from app.analytics.models import EngagementMetric, Report, WorkspaceKpiGoal
from app.security import create_access_token
from app.config import get_settings


class TestIndividualAnalytics(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.settings = get_settings()

        from sqlalchemy.orm import sessionmaker
        SessionLocal = sessionmaker(bind=engine)
        cls.db = SessionLocal()

        # Create unique individual test user
        cls.user_id = uuid.uuid4()
        cls.indiv_user = User(
            users_uuid=cls.user_id,
            username=f"indiv_anal_{uuid.uuid4().hex[:6]}",
            email=f"indiv_anal_{uuid.uuid4().hex[:6]}@test.com",
            password_hash="fakehash",
            account_type="individual",
            is_email_verified=True,
        )
        cls.db.add(cls.indiv_user)
        cls.db.flush()

        # Connect personal channel
        cls.channel_id = uuid.uuid4()
        cls.channel = SocialAccount(
            id=cls.channel_id,
            platform="linkedin",
            platform_account_id=f"li_{uuid.uuid4().hex[:8]}",
            display_name="Indiv LinkedIn",
            owner_type="individual",
            owner_id=str(cls.user_id),
            connected_by=cls.user_id,
            status="active",
        )
        cls.db.add(cls.channel)
        cls.db.flush()

        # Create published post
        cls.post_id = uuid.uuid4()
        cls.post = Post(
            id=cls.post_id,
            author_id=cls.user_id,
            title="Individual Post for Analytics",
            content="Testing personal analytics in Omni Platforms",
            status="published",
            target_platforms=["linkedin"],
            published_at=datetime.now(timezone.utc),
        )
        cls.db.add(cls.post)
        cls.db.flush()

        # Create EngagementMetric for this post
        cls.metric = EngagementMetric(
            id=uuid.uuid4(),
            workspace_id="CZDXWRYPDEQCBBA9",
            post_id=cls.post_id,
            channel_id=cls.channel_id,
            platform="linkedin",
            external_post_id=f"urn:li:share:{uuid.uuid4().hex[:10]}",
            metric_date=datetime.now(timezone.utc).date(),
            impressions=500,
            views=500,
            likes=40,
            comments=10,
            engagements=50,
            engagement_rate=10.0,
            snapshot_time=datetime.now(timezone.utc),
        )
        cls.db.add(cls.metric)
        cls.db.commit()

        # Generate JWT Auth Token
        token_str, _ = create_access_token(str(cls.user_id))
        cls.token = token_str
        cls.headers = {"Authorization": f"Bearer {cls.token}"}

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_individual_timeline(self):
        res = self.client.get("/api/v1/analytics/individual/timeline?timeframe=Weekly", headers=self.headers)
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertIn("series", data)
        self.assertIn("linkedin", data["series"])
        self.assertIn("facebook", data["series"])
        self.assertGreaterEqual(sum(data["series"]["linkedin"]), 50)

    def test_02_individual_overview(self):
        res = self.client.get("/api/v1/analytics/individual/overview", headers=self.headers)
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertIn("linkedin", data)
        self.assertIn("facebook", data)
        self.assertGreaterEqual(data["linkedin"]["total_engagements"], 50)
        self.assertIn("monthly_gain", data)

    def test_03_individual_today(self):
        res = self.client.get("/api/v1/analytics/individual/today", headers=self.headers)
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertEqual(data["role"], "individual")
        self.assertGreaterEqual(data["total_interactions_today"], 50)

    def test_04_individual_top_posts(self):
        res = self.client.get("/api/v1/analytics/individual/top-posts?limit=7", headers=self.headers)
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertIn("posts", data)
        self.assertGreaterEqual(len(data["posts"]), 1)
        self.assertEqual(data["posts"][0]["title"], "Individual Post for Analytics")
        self.assertGreaterEqual(data["posts"][0]["total_engagements"], 50)

    def test_05_individual_kpi_get_and_update(self):
        # GET default
        res = self.client.get("/api/v1/analytics/individual/kpi", headers=self.headers)
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertGreaterEqual(data["current_interactions"], 50)

        # PUT update target
        put_res = self.client.put(
            "/api/v1/analytics/individual/kpi",
            json={"target_interactions": 200},
            headers=self.headers,
        )
        self.assertEqual(put_res.status_code, 200, put_res.text)
        put_data = put_res.json()
        self.assertEqual(put_data["target_interactions"], 200)

    def test_06_individual_ai_report_generate_save_and_download(self):
        # Generate
        gen_res = self.client.post(
            "/api/v1/reports/individual/generate",
            json={"timeframe": "Monthly"},
            headers=self.headers,
        )
        self.assertEqual(gen_res.status_code, 200, gen_res.text)
        gen_data = gen_res.json()
        self.assertIn("title", gen_data)
        self.assertIn("summary", gen_data)

        # Save
        save_res = self.client.post(
            "/api/v1/reports/individual",
            json={
                "title": gen_data["title"],
                "timeframe": gen_data["timeframe"],
                "summary": gen_data["summary"],
            },
            headers=self.headers,
        )
        self.assertEqual(save_res.status_code, 201, save_res.text)
        save_data = save_res.json()
        report_id = save_data["id"]

        # List
        list_res = self.client.get("/api/v1/reports/individual", headers=self.headers)
        self.assertEqual(list_res.status_code, 200, list_res.text)
        list_data = list_res.json()
        self.assertGreaterEqual(len(list_data["reports"]), 1)

        # Download
        dl_res = self.client.get(f"/api/v1/reports/individual/{report_id}/download", headers=self.headers)
        self.assertEqual(dl_res.status_code, 200, dl_res.text)
        self.assertIn("Executive Summary", dl_res.text)
