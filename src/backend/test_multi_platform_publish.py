import sys
import unittest
import uuid
from datetime import datetime, timezone

sys.path.insert(0, ".")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from sqlalchemy import select, delete

from app.main import app
from app.database import SessionLocal, engine, Base
from app.models import User, Workspace, WorkspaceMember, SocialAccount, Post, PostDistribution
from app.distribution.service import DistributionService
from app.distribution.token_encryption import encrypt_token


class MultiPlatformPublishTestSuite(unittest.TestCase):
    """
    Automated Test Suite for Social Publishing:
    1. 1 post published via LinkedIn only.
    2. 1 post published via Facebook only.
    3. 1 post published via Both platforms (Facebook + LinkedIn).
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()
        cls.service = DistributionService(cls.db)

        # 1. Login as manager
        login_res = cls.client.post("/auth/login", json={"email": "manager@test.com", "password": "Password123!"})
        if login_res.status_code != 200:
            # Fallback to any business user
            user = cls.db.query(User).filter(User.account_type == "business").first()
            cls.user = user
            cls.headers = {}
            cls.ws_id = cls.db.query(Workspace).filter(Workspace.manager_id == user.users_uuid).first().workspace_uuid
        else:
            token = login_res.json()["access_token"]
            cls.headers = {"Authorization": f"Bearer {token}"}
            cls.user = cls.db.query(User).filter(User.email == "manager@test.com").first()
            cls.ws_id = login_res.json()["workspace"]["workspace_id"]

        print(f"\n[SETUP] Active User: {cls.user.email} (ID: {cls.user.users_uuid})")
        print(f"[SETUP] Workspace ID: {cls.ws_id}")

        # 2. Ensure both Facebook and LinkedIn channels exist in this workspace
        cls.fb_channel = cls.db.query(SocialAccount).filter(
            SocialAccount.owner_id == cls.ws_id,
            SocialAccount.platform == "facebook"
        ).first()
        if not cls.fb_channel:
            cls.fb_channel = cls.service.repo.create_channel(
                platform="facebook",
                platform_account_id="61593303653577",
                display_name="OmniTech Official Fanpage",
                note="Facebook channel for automation tests",
                owner_type="workspace",
                owner_id=cls.ws_id,
                connected_by=cls.user.users_uuid,
                access_token_encrypted=encrypt_token("mock_facebook_access_token_publish_test"),
                refresh_token_encrypted=None,
                token_expires_at=None,
                status="active",
                enabled_for_workspace=True,
            )
            print(f"[SETUP] Created Facebook Channel: {cls.fb_channel.display_name} (ID: {cls.fb_channel.id})")
        else:
            print(f"[SETUP] Found Facebook Channel: {cls.fb_channel.display_name} (ID: {cls.fb_channel.id})")

        cls.li_channel = cls.db.query(SocialAccount).filter(
            SocialAccount.owner_id == cls.ws_id,
            SocialAccount.platform == "linkedin"
        ).first()
        if not cls.li_channel:
            cls.li_channel = cls.service.repo.create_channel(
                platform="linkedin",
                platform_account_id="urn:li:organization:12345678",
                display_name="OmniTech LinkedIn Organization",
                note="LinkedIn channel for automation tests",
                owner_type="workspace",
                owner_id=cls.ws_id,
                connected_by=cls.user.users_uuid,
                access_token_encrypted=encrypt_token("mock_li_access_token_publish_test"),
                refresh_token_encrypted=None,
                token_expires_at=None,
                status="active",
                enabled_for_workspace=True,
            )
            print(f"[SETUP] Created LinkedIn Channel: {cls.li_channel.display_name} (ID: {cls.li_channel.id})")
        else:
            print(f"[SETUP] Found LinkedIn Channel: {cls.li_channel.display_name} (ID: {cls.li_channel.id})")

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def setUp(self):
        self.created_post_ids = []

    def tearDown(self):
        # Clean up posts created during tests
        if self.created_post_ids:
            for pid in self.created_post_ids:
                p_uuid = uuid.UUID(str(pid))
                self.db.execute(delete(PostDistribution).where(PostDistribution.post_id == p_uuid))
                post = self.db.get(Post, p_uuid)
                if post:
                    self.db.delete(post)
            self.db.commit()

    def test_01_publish_post_via_linkedin_only(self):
        """
        Scenario 1:
        1 post targeting LinkedIn only (target_platforms=['linkedin']).
        Verify publish to LinkedIn succeeds, produces valid feed URL,
        updates post status, and rejects publishing to Facebook channel (scoping guard).
        """
        print("\n--- [TEST 1] ĐĂNG 1 BÀI QUA LINKEDIN DUY NHẤT ---")

        # 1. Create Post targeting LinkedIn only
        create_res = self.client.post(
            "/posts",
            headers=self.headers,
            json={
                "title": "[Automation Test] Xu hướng AI Agent trên LinkedIn 2026",
                "content": "Bài viết tự động kiểm thử quy trình đăng bài LinkedIn độc quyền cho mạng lưới chuyên nghiệp B2B.",
                "target_platforms": ["linkedin"],
                "status": "approved",
                "workspace_id": self.ws_id,
            },
        )
        self.assertEqual(create_res.status_code, 201, f"Failed to create post: {create_res.text}")
        post_id = create_res.json()["id"]
        self.created_post_ids.append(post_id)
        print(f"  [1.1] Đã tạo bài viết LinkedIn ID: {post_id}")

        # 2. Verify Scoping Guard: attempting to publish to Facebook channel MUST fail with 400
        fb_attempt = self.client.post(
            f"/api/v1/distribution/channels/publish/{post_id}?platform=facebook&channel_id={self.fb_channel.id}",
            headers=self.headers,
        )
        self.assertEqual(fb_attempt.status_code, 400)
        self.assertIn("không nằm trong danh sách nền tảng đích", fb_attempt.json()["detail"])
        print("  [1.2] Scoping Guard verified: Ngăn chặn thành công việc đăng bài LinkedIn lên Facebook.")

        # 3. Publish to LinkedIn
        pub_res = self.client.post(
            f"/api/v1/distribution/channels/publish/{post_id}?platform=linkedin&channel_id={self.li_channel.id}",
            headers=self.headers,
        )
        self.assertEqual(pub_res.status_code, 200, f"Publish to LinkedIn failed: {pub_res.text}")
        data = pub_res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["platform"], "linkedin")
        self.assertIsNotNone(data["linkedin_post_url"])
        self.assertTrue(data["linkedin_post_url"].startswith("https://www.linkedin.com/feed/update/"))
        print(f"  [1.3] Đăng bài thành công lên LinkedIn! URL: {data['linkedin_post_url']}")

        # 4. Check post status in database
        db_post = self.db.get(Post, uuid.UUID(post_id))
        self.assertEqual(db_post.status, "ready_for_distribution")
        self.assertIsNotNone(db_post.published_at)

        # 5. Check published-urls API
        urls_res = self.client.get(f"/api/v1/distribution/channels/published-urls/{post_id}", headers=self.headers)
        self.assertEqual(urls_res.status_code, 200)
        urls = urls_res.json()
        self.assertEqual(len(urls), 1)
        self.assertEqual(urls[0]["platform"], "linkedin")
        self.assertEqual(urls[0]["published_url"], data["linkedin_post_url"])
        print("  [1.4] Đã kiểm tra API published-urls: Trả về chính xác 1 URL LinkedIn.")
        print("  => [PASS] Test 1: Đăng 1 bài qua LinkedIn hoàn tất thành công!")

    def test_02_publish_post_via_facebook_only(self):
        """
        Scenario 2:
        1 post targeting Facebook only (target_platforms=['facebook']).
        Verify publish to Facebook succeeds, produces valid permalink URL,
        updates post status, and rejects publishing to LinkedIn channel (scoping guard).
        """
        print("\n--- [TEST 2] ĐĂNG 1 BÀI QUA FACEBOOK DUY NHẤT ---")

        # 1. Create Post targeting Facebook only
        create_res = self.client.post(
            "/posts",
            headers=self.headers,
            json={
                "title": "[Automation Test] Chiến dịch Tương tác Fanpage Facebook",
                "content": "Bài viết tự động kiểm thử quy trình đăng bài Facebook Fanpage nhằm tăng tương tác cộng đồng.",
                "target_platforms": ["facebook"],
                "status": "approved",
                "workspace_id": self.ws_id,
            },
        )
        self.assertEqual(create_res.status_code, 201, f"Failed to create post: {create_res.text}")
        post_id = create_res.json()["id"]
        self.created_post_ids.append(post_id)
        print(f"  [2.1] Đã tạo bài viết Facebook ID: {post_id}")

        # 2. Verify Scoping Guard: attempting to publish to LinkedIn channel MUST fail with 400
        li_attempt = self.client.post(
            f"/api/v1/distribution/channels/publish/{post_id}?platform=linkedin&channel_id={self.li_channel.id}",
            headers=self.headers,
        )
        self.assertEqual(li_attempt.status_code, 400)
        self.assertIn("không nằm trong danh sách nền tảng đích", li_attempt.json()["detail"])
        print("  [2.2] Scoping Guard verified: Ngăn chặn thành công việc đăng bài Facebook lên LinkedIn.")

        # 3. Publish to Facebook
        pub_res = self.client.post(
            f"/api/v1/distribution/channels/publish/{post_id}?platform=facebook&channel_id={self.fb_channel.id}",
            headers=self.headers,
        )
        self.assertEqual(pub_res.status_code, 200, f"Publish to Facebook failed: {pub_res.text}")
        data = pub_res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["platform"], "facebook")
        self.assertIsNotNone(data["facebook_post_url"])
        self.assertTrue("facebook.com" in data["facebook_post_url"])
        print(f"  [2.3] Đăng bài thành công lên Facebook! URL: {data['facebook_post_url']}")

        # 4. Check post status in database
        db_post = self.db.get(Post, uuid.UUID(post_id))
        self.assertEqual(db_post.status, "ready_for_distribution")
        self.assertIsNotNone(db_post.published_at)

        # 5. Check published-urls API
        urls_res = self.client.get(f"/api/v1/distribution/channels/published-urls/{post_id}", headers=self.headers)
        self.assertEqual(urls_res.status_code, 200)
        urls = urls_res.json()
        self.assertEqual(len(urls), 1)
        self.assertEqual(urls[0]["platform"], "facebook")
        self.assertEqual(urls[0]["published_url"], data["facebook_post_url"])
        print("  [2.4] Đã kiểm tra API published-urls: Trả về chính xác 1 URL Facebook.")
        print("  => [PASS] Test 2: Đăng 1 bài qua Facebook hoàn tất thành công!")

    def test_03_publish_post_via_both_platforms(self):
        """
        Scenario 3:
        1 post targeting both Facebook and LinkedIn (target_platforms=['facebook', 'linkedin']).
        Verify publish to Facebook and LinkedIn sequentially succeeds,
        both distribution records are saved, and published-urls endpoint returns both URLs.
        """
        print("\n--- [TEST 3] ĐĂNG 1 BÀI ĐỒNG THỜI QUA CẢ 2 NỀN TẢNG (FACEBOOK & LINKEDIN) ---")

        # 1. Create Post targeting BOTH platforms
        create_res = self.client.post(
            "/posts",
            headers=self.headers,
            json={
                "title": "[Automation Test] Công bố Ra mắt Tính năng Đa Nền tảng 2026",
                "content": "Thông cáo báo chí và bài viết tiếp thị được xuất bản đồng thời trên cả Facebook Fanpage và LinkedIn Company Page.",
                "target_platforms": ["facebook", "linkedin"],
                "status": "approved",
                "workspace_id": self.ws_id,
            },
        )
        self.assertEqual(create_res.status_code, 201, f"Failed to create post: {create_res.text}")
        post_id = create_res.json()["id"]
        self.created_post_ids.append(post_id)
        print(f"  [3.1] Đã tạo bài viết Đa nền tảng ID: {post_id} (Platforms: facebook, linkedin)")

        # 2. Publish to LinkedIn
        pub_li_res = self.client.post(
            f"/api/v1/distribution/channels/publish/{post_id}?platform=linkedin&channel_id={self.li_channel.id}",
            headers=self.headers,
        )
        self.assertEqual(pub_li_res.status_code, 200, f"Publish to LinkedIn failed: {pub_li_res.text}")
        li_data = pub_li_res.json()
        self.assertTrue(li_data["success"])
        self.assertEqual(li_data["platform"], "linkedin")
        print(f"  [3.2] Xuất bản (1/2) qua LinkedIn thành công: {li_data['linkedin_post_url']}")

        # 3. Publish to Facebook
        pub_fb_res = self.client.post(
            f"/api/v1/distribution/channels/publish/{post_id}?platform=facebook&channel_id={self.fb_channel.id}",
            headers=self.headers,
        )
        self.assertEqual(pub_fb_res.status_code, 200, f"Publish to Facebook failed: {pub_fb_res.text}")
        fb_data = pub_fb_res.json()
        self.assertTrue(fb_data["success"])
        self.assertEqual(fb_data["platform"], "facebook")
        print(f"  [3.3] Xuất bản (2/2) qua Facebook thành công: {fb_data['facebook_post_url']}")

        # 4. Check post status in database
        db_post = self.db.get(Post, uuid.UUID(post_id))
        self.assertEqual(db_post.status, "ready_for_distribution")
        self.assertIsNotNone(db_post.published_at)

        # 5. Check published-urls API - MUST return 2 distribution records
        urls_res = self.client.get(f"/api/v1/distribution/channels/published-urls/{post_id}", headers=self.headers)
        self.assertEqual(urls_res.status_code, 200)
        urls = urls_res.json()
        self.assertEqual(len(urls), 2, f"Expected 2 published URLs, got: {urls}")

        platforms_found = {u["platform"] for u in urls}
        self.assertEqual(platforms_found, {"facebook", "linkedin"})

        url_by_platform = {u["platform"]: u["published_url"] for u in urls}
        self.assertEqual(url_by_platform["linkedin"], li_data["linkedin_post_url"])
        self.assertEqual(url_by_platform["facebook"], fb_data["facebook_post_url"])

        print(f"  [3.4] API published-urls trả về đủ 2 nền tảng:")
        print(f"        - LinkedIn URL: {url_by_platform['linkedin']}")
        print(f"        - Facebook URL: {url_by_platform['facebook']}")
        print("  => [PASS] Test 3: Đăng bài đồng thời qua cả 2 nền tảng Facebook & LinkedIn hoàn tất thành công!")


if __name__ == "__main__":
    print("\n=======================================================")
    print(" AUTOMATION TEST: MULTI-PLATFORM DISTRIBUTION (FB & LI)")
    print("=======================================================\n")
    unittest.main()
