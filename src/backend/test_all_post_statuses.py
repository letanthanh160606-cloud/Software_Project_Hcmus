import sys
from datetime import datetime, timezone
import uuid

sys.path.insert(0, ".")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from sqlalchemy import select, delete
from app.main import app
from app.database import SessionLocal
from app.models import User, Workspace, Post, PostReviews, PostMedia
from app import crud


def test_and_seed_all_statuses():
    client = TestClient(app)
    db = SessionLocal()

    try:
        print("=== 1. Logging in as Manager, Member, and Individual ===")
        res_mgr = client.post("/auth/login", json={"email": "manager@test.com", "password": "Password123!"})
        res_mem = client.post("/auth/login", json={"email": "member@test.com", "password": "Password123!"})
        res_ind = client.post("/auth/login", json={"email": "individual@test.com", "password": "Password123!"})

        assert res_mgr.status_code == 200, f"Manager login failed: {res_mgr.text}"
        assert res_mem.status_code == 200, f"Member login failed: {res_mem.text}"
        assert res_ind.status_code == 200, f"Individual login failed: {res_ind.text}"

        tok_mgr = res_mgr.json()["access_token"]
        tok_mem = res_mem.json()["access_token"]
        tok_ind = res_ind.json()["access_token"]

        headers_mgr = {"Authorization": f"Bearer {tok_mgr}"}
        headers_mem = {"Authorization": f"Bearer {tok_mem}"}
        headers_ind = {"Authorization": f"Bearer {tok_ind}"}

        ws_id = res_mgr.json()["workspace"]["workspace_id"]
        print(f"-> Workspace ID: {ws_id}")

        # Clean existing posts for these users first to have a clean showcase
        users = db.scalars(select(User).where(User.email.in_(["manager@test.com", "member@test.com", "individual@test.com"]))).all()
        u_ids = [u.users_uuid for u in users]
        posts = db.scalars(select(Post).where(Post.author_id.in_(u_ids))).all()
        p_ids = [p.id for p in posts]
        if p_ids:
            db.execute(delete(PostReviews).where(PostReviews.post_id.in_(p_ids)))
            from app.models import PostDistribution
            db.execute(delete(PostDistribution).where(PostDistribution.post_id.in_(p_ids)))
            db.execute(delete(PostMedia).where(PostMedia.post_id.in_(p_ids)))
        for p in posts:
            db.delete(p)
        db.commit()
        print("-> Cleaned old posts for test accounts.")

        print("\n=== 2. Testing Status: 'draft' ===")
        # Member creates a draft
        res_draft = client.post(
            "/posts",
            headers=headers_mem,
            json={
                "title": "[Draft] Xu hướng Tiếp thị Nội dung với AI 2026",
                "content": "Bản nháp đang viết dở: Khám phá cách các doanh nghiệp ứng dụng Generative AI để tối ưu hóa quy trình sáng tạo bài viết đa kênh.",
                "target_platforms": ["linkedin", "facebook"],
                "status": "draft",
                "workspace_id": ws_id,
            },
        )
        assert res_draft.status_code == 201, f"Create draft failed: {res_draft.text}"
        draft_post = res_draft.json()
        assert draft_post["status"] == "draft"
        print(f"  [PASS] Created Draft post ID: {draft_post['id']} (Status: {draft_post['status']})")

        print("\n=== 3. Testing Status: 'pending_review' ===")
        # Member submits a post for review
        res_pending = client.post(
            "/posts",
            headers=headers_mem,
            json={
                "title": "[Pending] Ra mắt Tính năng Workspace Analytics Q3",
                "content": "Đề xuất bài viết thông báo ra mắt Dashboard theo dõi chỉ số tương tác thời gian thực cho khách hàng doanh nghiệp.",
                "target_platforms": ["linkedin"],
                "status": "pending_review",
                "workspace_id": ws_id,
            },
        )
        assert res_pending.status_code == 201, f"Create pending post failed: {res_pending.text}"
        pending_post = res_pending.json()
        assert pending_post["status"] == "pending_review"
        print(f"  [PASS] Created Pending post ID: {pending_post['id']} (Status: {pending_post['status']})")

        print("\n=== 4. Testing Status: 'rejected' ===")
        # Member submits another post that Manager will reject
        res_to_reject = client.post(
            "/posts",
            headers=headers_mem,
            json={
                "title": "[Rejected] Chia sẻ Tip Tăng Tương Tác Mạng Xã Hội",
                "content": "Bài viết chưa có hashtag thương hiệu, chưa có CTA và cần thêm dữ liệu dẫn chứng thực tế.",
                "target_platforms": ["facebook"],
                "status": "pending_review",
                "workspace_id": ws_id,
            },
        )
        assert res_to_reject.status_code == 201
        to_reject_id = res_to_reject.json()["id"]

        # Manager reviews and REJECTS this post
        reject_reason = "Vui lòng bổ sung thêm hashtag thương hiệu #DemoWorkspace, lời kêu gọi hành động (CTA) và hình ảnh banner chất lượng cao trước khi duyệt lại."
        res_reject = client.patch(
            f"/workspaces/{ws_id}/posts/{to_reject_id}",
            headers=headers_mgr,
            json={
                "status": "rejected",
                "reject_reason": reject_reason,
            },
        )
        assert res_reject.status_code == 200, f"Manager reject failed: {res_reject.text}"
        rejected_post = res_reject.json()
        assert rejected_post["status"] == "rejected"
        print(f"  [PASS] Manager rejected post ID: {to_reject_id} (Status: {rejected_post['status']})")
        print(f"         Reject Reason: '{rejected_post.get('reject_reason')}'")

        print("\n=== 5. Testing Status: 'published' / 'ready_for_distribution' ===")
        # Manager creates a post directly -> becomes ready_for_distribution/published
        res_pub = client.post(
            "/posts",
            headers=headers_mgr,
            json={
                "title": "[Published] Thông báo Tuyển dụng Senior Fullstack Engineer",
                "content": "Đội ngũ chúng tôi đang mở rộng và tìm kiếm các kỹ sư đam mê công nghệ phần mềm hiện đại gia nhập team!",
                "target_platforms": ["linkedin"],
                "status": "ready_for_distribution",
                "workspace_id": ws_id,
            },
        )
        assert res_pub.status_code == 201
        pub_post = res_pub.json()
        assert pub_post["status"] in ("ready_for_distribution", "published")
        # Update published_at in DB to simulate a fully published post with timestamp and engagements
        db_pub = db.get(Post, uuid.UUID(pub_post["id"]))
        if db_pub:
            db_pub.status = "published"
            db_pub.published_at = datetime.now(timezone.utc)
            db_pub.total_engagements = 142
            db.commit()
        print(f"  [PASS] Created Published post ID: {pub_post['id']} (Status: published, Engagements: 142)")

        print("\n=== 6. Testing Status: 'failed' ===")
        # Create a post with status 'failed' to represent a distribution failure
        res_failed = client.post(
            "/posts",
            headers=headers_mgr,
            json={
                "title": "[Failed] Thông báo Lịch Bảo trì Hệ thống",
                "content": "Bài viết đăng tải thất bại do token trang đích đã hết hạn hoặc bị thu hồi quyền truy cập (OAuth Token Expired).",
                "target_platforms": ["facebook"],
                "status": "draft",
                "workspace_id": ws_id,
            },
        )
        assert res_failed.status_code == 201
        failed_id = res_failed.json()["id"]
        # Set status = 'failed' in DB
        db_failed = db.get(Post, uuid.UUID(failed_id))
        if db_failed:
            db_failed.status = "failed"
            db.commit()
        print(f"  [PASS] Created Failed post ID: {failed_id} (Status: failed)")

        print("\n=== 7. Creating Individual Posts (Drafts, Published, Failed) ===")
        res_ind_draft = client.post(
            "/posts",
            headers=headers_ind,
            json={
                "title": "[Individual Draft] Ghi chú Cá nhân về Cấu trúc Hệ thống",
                "content": "Tổng hợp các ghi chép kiến trúc microservices và message queue.",
                "target_platforms": ["linkedin"],
                "status": "draft",
            },
        )
        assert res_ind_draft.status_code == 201

        res_ind_pub = client.post(
            "/posts",
            headers=headers_ind,
            json={
                "title": "[Individual Published] Chia sẻ Kinh nghiệm Lập trình Python & FastAPI",
                "content": "10 bí quyết viết mã nguồn Backend sạch và mở rộng tốt.",
                "target_platforms": ["linkedin"],
                "status": "ready_for_distribution",
            },
        )
        assert res_ind_pub.status_code == 201
        db_ind_pub = db.get(Post, uuid.UUID(res_ind_pub.json()["id"]))
        if db_ind_pub:
            db_ind_pub.status = "published"
            db_ind_pub.published_at = datetime.now(timezone.utc)
            db_ind_pub.total_engagements = 58
            db.commit()

        res_ind_fail = client.post(
            "/posts",
            headers=headers_ind,
            json={
                "title": "[Individual Failed] Cập nhật Trạng thái Kết nối Mạng xã hội",
                "content": "Đăng tải thất bại do tài khoản chưa liên kết.",
                "target_platforms": ["facebook"],
                "status": "draft",
            },
        )
        assert res_ind_fail.status_code == 201
        db_ind_fail = db.get(Post, uuid.UUID(res_ind_fail.json()["id"]))
        if db_ind_fail:
            db_ind_fail.status = "failed"
            db.commit()
        print("  [PASS] Created Individual Draft, Published, and Failed posts.")

        print("\n=== 8. Verifying API listing for Manager/Member & Individual ===")
        res_ws_posts = client.get(f"/workspaces/{ws_id}/posts", headers=headers_mgr)
        assert res_ws_posts.status_code == 200
        ws_post_statuses = [p["status"] for p in res_ws_posts.json()]
        print(f"Workspace Posts Statuses: {ws_post_statuses}")
        assert "draft" in ws_post_statuses
        assert "pending_review" in ws_post_statuses
        assert "rejected" in ws_post_statuses
        assert "published" in ws_post_statuses
        assert "failed" in ws_post_statuses

        res_ind_posts = client.get("/posts", headers=headers_ind)
        assert res_ind_posts.status_code == 200
        ind_post_statuses = [p["status"] for p in res_ind_posts.json()]
        print(f"Individual Posts Statuses: {ind_post_statuses}")
        assert "draft" in ind_post_statuses
        assert "published" in ind_post_statuses
        assert "failed" in ind_post_statuses
        assert "pending_review" not in ind_post_statuses
        assert "rejected" not in ind_post_statuses

        print("\nALL STATUSES TESTED AND VERIFIED SUCCESSFULLY IN BOTH BACKEND AND API!")

    except Exception as e:
        print(f"ERROR: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    test_and_seed_all_statuses()
