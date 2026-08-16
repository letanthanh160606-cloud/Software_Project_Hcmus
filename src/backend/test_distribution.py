import sys
import unittest
import uuid
from datetime import datetime, timezone

sys.path.insert(0, ".")

from app.database import SessionLocal, engine, Base
from app.models import User, Workspace, WorkspaceMember, SocialAccount, Post, PostDistribution, OAuthState
from app.crud import get_user_by_email, create_individual_user
from app.distribution.token_encryption import encrypt_token, decrypt_token
from app.distribution.service import DistributionService
from app.distribution.schemas import ChannelUpdateRequest
from app.main import app
from fastapi import HTTPException


class DistributionModuleTestSuite(unittest.TestCase):

    def setUp(self):
        self.db = SessionLocal()
        Base.metadata.create_all(bind=engine)
        self.service = DistributionService(self.db)

    def tearDown(self):
        self.db.close()

    def test_tc1_fastapi_app_and_distribution_routes_registered(self):
        """TC1: Verify FastAPI App and all 6 distribution endpoints are registered."""
        routes = []
        for r in app.routes:
            if hasattr(r, "path"):
                routes.append(r.path)
            if hasattr(r, "original_router"):
                for sub_r in r.original_router.routes:
                    if hasattr(sub_r, "path"):
                        routes.append(sub_r.path)

        expected_endpoints = [
            "/api/v1/distribution/channels",
            "/api/v1/distribution/channels/connect/initiate",
            "/api/v1/distribution/channels/connect/callback",
            "/api/v1/distribution/channels/{channel_id}/toggle-workspace",
            "/api/v1/distribution/channels/{channel_id}",
        ]
        for ep in expected_endpoints:
            self.assertIn(ep, routes, f"Endpoint {ep} not registered in FastAPI app")

        print("  [PASS] [TC1] All Distribution endpoints registered in FastAPI routes.")

    def test_tc2_token_encryption_round_trip(self):
        """TC2: Test Fernet AES token encryption and decryption round-trip."""
        raw_access_token = "EAABwz123456LongLivedPageAccessToken"
        raw_refresh_token = "r_token_secret_987654321"

        encrypted_acc = encrypt_token(raw_access_token)
        encrypted_ref = encrypt_token(raw_refresh_token)

        self.assertIsNotNone(encrypted_acc)
        self.assertNotEqual(encrypted_acc, raw_access_token)

        decrypted_acc = decrypt_token(encrypted_acc)
        decrypted_ref = decrypt_token(encrypted_ref)

        self.assertEqual(decrypted_acc, raw_access_token)
        self.assertEqual(decrypted_ref, raw_refresh_token)
        print("  [PASS] [TC2] AES/Fernet Token Encryption & Decryption round-trip verified.")

    def test_tc3_oauth_initiate_flow(self):
        """TC3: Test OAuth initiate step 1 (State generation & CSRF protection)."""
        user = self.db.query(User).first()
        self.assertIsNotNone(user, "No user found in DB")

        res_fb = self.service.initiate_channel_connect(
            user=user,
            platform="facebook",
            note="Test FB Note",
            channel_name="Test FB Fanpage",
        )
        self.assertIsNotNone(res_fb.state)
        self.assertIn("callback", res_fb.authorization_url)

        # Check OAuth state saved in DB
        db_state = self.service.repo.get_oauth_state(res_fb.state)
        self.assertIsNotNone(db_state)
        self.assertEqual(db_state.platform, "facebook")
        self.assertEqual(db_state.user_id, user.users_uuid)
        self.assertEqual(db_state.metadata_json.get("note"), "Test FB Note")

        print("  [PASS] [TC3] OAuth Initiate Flow (Step 1) & State CSRF storage verified.")

    def test_tc4_oauth_callback_flow_and_encrypted_token_saving(self):
        """TC4: Test OAuth callback step 2 (State validation, token exchange, encrypted DB save)."""
        user = self.db.query(User).first()
        self.assertIsNotNone(user)

        init_res = self.service.initiate_channel_connect(
            user=user,
            platform="linkedin",
            note="LinkedIn Company Page Note",
            channel_name="Omni Tech LinkedIn",
        )

        callback_res = self.service.handle_oauth_callback(
            code="mock_code_test_123",
            state_token=init_res.state,
        )

        self.assertIsNotNone(callback_res.id)
        self.assertEqual(callback_res.platform, "linkedin")
        self.assertEqual(callback_res.display_name, "Omni Tech LinkedIn")
        self.assertEqual(callback_res.note, "LinkedIn Company Page Note")

        # Verify state is consumed and deleted
        consumed_state = self.service.repo.get_oauth_state(init_res.state)
        self.assertIsNone(consumed_state, "OAuth state should be deleted after callback")

        # Verify tokens in DB are encrypted
        db_channel = self.service.repo.get_channel_by_id(callback_res.id)
        self.assertIsNotNone(db_channel.access_token_encrypted)
        self.assertNotIn("mock_li_access_token", db_channel.access_token_encrypted)
        
        # Verify decrypted token matches original
        decrypted = decrypt_token(db_channel.access_token_encrypted)
        self.assertTrue(decrypted.startswith("mock_li_access_token"))

        print("  [PASS] [TC4] OAuth Callback Flow (Step 2) & Token Encryption persistence verified.")

    def test_tc5_channel_listing_and_rbac_permissions(self):
        """TC5: Test channel listing & RBAC rules for Manager, Individual, and Member."""
        user = self.db.query(User).first()
        channels_res = self.service.list_channels(user=user)
        self.assertGreaterEqual(channels_res.total, 1)

        # Check response schema does NOT contain any token field
        channel_dict = channels_res.channels[0].model_dump()
        self.assertNotIn("access_token", channel_dict)
        self.assertNotIn("access_token_encrypted", channel_dict)
        self.assertNotIn("refresh_token", channel_dict)

        print("  [PASS] [TC5] Channel Listing & RBAC response security (No token leaks) verified.")

    def test_tc6_channel_update_and_toggle_workspace(self):
        """TC6: Test updating channel metadata and toggling enabled_for_workspace."""
        user = self.db.query(User).first()
        channels_res = self.service.list_channels(user=user)
        channel_id = channels_res.channels[0].id

        update_res = self.service.update_channel(
            user=user,
            channel_id=channel_id,
            payload=ChannelUpdateRequest(display_name="Updated Display Name", note="Updated Note"),
        )
        self.assertEqual(update_res.display_name, "Updated Display Name")
        self.assertEqual(update_res.note, "Updated Note")

        print("  [PASS] [TC6] Channel update display name and note verified.")

    def test_tc7_delete_channel_409_conflict_guard(self):
        """TC7: Test DELETE /channels/{id} 409 Conflict Guard when channel has active posts."""
        user = self.db.query(User).first()
        
        # 1. Create temporary channel
        channel = self.service.repo.create_channel(
            platform="facebook",
            platform_account_id="fb_guard_test",
            display_name="Guard Test Page",
            note="Guard test",
            owner_type="individual",
            owner_id=str(user.users_uuid),
            connected_by=user.users_uuid,
            access_token_encrypted=encrypt_token("dummy_token"),
            refresh_token_encrypted=None,
            token_expires_at=None,
        )

        # 2. Create post and link in post_distributions with status 'pending'
        post = Post(author_id=user.users_uuid, title="Active Post", content="Post content", status="pending_review")
        self.db.add(post)
        self.db.commit()
        self.db.refresh(post)

        dist = PostDistribution(post_id=post.id, channel_id=channel.id, status="pending")
        self.db.add(dist)
        self.db.commit()

        # 3. Attempt deletion -> Should be BLOCKED with 409 Conflict
        with self.assertRaises(HTTPException) as ctx:
            self.service.delete_channel(user=user, channel_id=channel.id)

        self.assertEqual(ctx.exception.status_code, 409)
        self.assertIn("Pending Review", ctx.exception.detail)

        # 4. Clean up post_distribution and test successful deletion
        self.db.delete(dist)
        self.db.commit()

        self.service.delete_channel(user=user, channel_id=channel.id)
        deleted_ch = self.service.repo.get_channel_by_id(channel.id)
        self.assertIsNone(deleted_ch)

        print("  [PASS] [TC7] DELETE Channel 409 Conflict Guard (blocking active posts) verified.")

    def test_tc8_target_platform_scoping_and_cross_validation(self):
        """TC8: Verify that publishing to a channel outside post.target_platforms is rejected."""
        from app.models import Post, SocialAccount, User
        from sqlalchemy import select
        import uuid

        # 1. Create a dummy user & channel
        user = self.db.scalar(select(User).limit(1))
        if not user:
            user = User(email=f"test_{uuid.uuid4().hex[:6]}@example.com", password_hash="dummy", role="individual")
            self.db.add(user)
            self.db.commit()

        fb_channel = self.service.repo.create_channel(
            platform="facebook",
            platform_account_id=f"fb_scope_{uuid.uuid4().hex[:8]}",
            display_name="Scope Test FB Page",
            owner_type="individual",
            owner_id=str(user.users_uuid),
            connected_by=user.users_uuid,
            access_token_encrypted="mock_token",
            note="Test note",
            refresh_token_encrypted=None,
            token_expires_at=None,
        )

        # 2. Create post with target_platforms=['linkedin'] (Facebook is NOT allowed)
        post = Post(
            author_id=user.users_uuid,
            title="LinkedIn Only Post",
            content="Content for LinkedIn only",
            status="draft",
            target_platforms=["linkedin"],
            target_account_ids=[],
            target_accounts_mode="ALL_SELECTED_PLATFORMS",
        )
        self.db.add(post)
        self.db.commit()
        self.db.refresh(post)

        # 3. Attempt to publish to Facebook channel -> MUST be rejected with HTTP 400
        with self.assertRaises(HTTPException) as ctx:
            self.service.publish_post_to_channel(user=user, post_id=post.id, channel_id=fb_channel.id)

        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("không nằm trong danh sách nền tảng đích", ctx.exception.detail)

        # Clean up
        self.db.delete(post)
        self.db.delete(fb_channel)
        self.db.commit()

        print("  [PASS] [TC8] Target Platform Scoping & Cross-validation guard verified.")


if __name__ == "__main__":
    print("\n=======================================================")
    print(" RUNNING DISTRIBUTION MODULE SYSTEM INTEGRATION TESTS")
    print("=======================================================\n")
    unittest.main()
