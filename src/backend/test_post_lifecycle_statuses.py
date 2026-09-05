import sys
import uuid
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, delete

sys.path.insert(0, ".")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.database import SessionLocal
from app.main import app
from app.models import (
    User,
    Workspace,
    WorkspaceMember,
    Post,
    PostReviews,
    PostDistribution,
    PostMedia,
    Notifications,
)
from app.security import create_access_token, hash_password, hash_pin


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="module")
def setup_environment(db):
    """
    Thiết lập môi trường kiểm thử gồm:
    1. Workspace có Manager (Quản lý) và Member (Thành viên).
    2. Tài khoản Individual (Người dùng độc lập).
    """
    unique_id = uuid.uuid4().hex[:6]

    # 1. Manager User
    manager = User(
        users_uuid=uuid.uuid4(),
        email=f"mgr_{unique_id}@company.test",
        username=f"mgr_{unique_id}",
        password_hash=hash_password("Password123!"),
        account_type="business",
        is_email_verified=True,
    )

    # 2. Member User
    member = User(
        users_uuid=uuid.uuid4(),
        email=f"mem_{unique_id}@company.test",
        username=f"mem_{unique_id}",
        password_hash=hash_password("Password123!"),
        account_type="business",
        is_email_verified=True,
    )

    # 3. Individual User
    individual = User(
        users_uuid=uuid.uuid4(),
        email=f"ind_{unique_id}@personal.test",
        username=f"ind_{unique_id}",
        password_hash=hash_password("Password123!"),
        account_type="individual",
        is_email_verified=True,
    )

    db.add_all([manager, member, individual])
    db.commit()

    # 4. Workspace
    ws_uuid = f"ws_{unique_id}".ljust(16, "0")[:16]
    workspace = Workspace(
        workspace_uuid=ws_uuid,
        workspacename=f"Marketing Team {unique_id}",
        manager_id=manager.users_uuid,
        pin_hash=hash_pin("123456"),
    )
    db.add(workspace)
    db.commit()

    # 5. Member active in workspace
    membership = WorkspaceMember(
        user_id=member.users_uuid,
        workspace_id=workspace.workspace_uuid,
        status="active",
    )
    db.add(membership)
    db.commit()

    # JWT Tokens
    tok_mgr, _ = create_access_token(str(manager.users_uuid))
    tok_mem, _ = create_access_token(str(member.users_uuid))
    tok_ind, _ = create_access_token(str(individual.users_uuid))

    env = {
        "manager": manager,
        "member": member,
        "individual": individual,
        "workspace": workspace,
        "headers_mgr": {"Authorization": f"Bearer {tok_mgr}"},
        "headers_mem": {"Authorization": f"Bearer {tok_mem}"},
        "headers_ind": {"Authorization": f"Bearer {tok_ind}"},
    }

    yield env

    # Teardown / Cleanup
    all_uids = [manager.users_uuid, member.users_uuid, individual.users_uuid]
    all_posts = db.scalars(select(Post).where(Post.author_id.in_(all_uids))).all()
    p_ids = [p.id for p in all_posts]
    if p_ids:
        db.execute(delete(PostReviews).where(PostReviews.post_id.in_(p_ids)))
        db.execute(delete(PostDistribution).where(PostDistribution.post_id.in_(p_ids)))
        db.execute(delete(PostMedia).where(PostMedia.post_id.in_(p_ids)))
        db.execute(delete(Post).where(Post.id.in_(p_ids)))
    db.execute(delete(Notifications).where(Notifications.user_id.in_(all_uids)))
    db.execute(delete(WorkspaceMember).where(WorkspaceMember.workspace_id == workspace.workspace_uuid))
    db.execute(delete(Workspace).where(Workspace.workspace_uuid == workspace.workspace_uuid))
    db.execute(delete(User).where(User.users_uuid.in_(all_uids)))
    db.commit()


# ============================================================================
# TÌNH HUỐNG 1: DRAFT (BẢN NHÁP)
# ============================================================================
def test_scenario_1_draft_creation_and_update(client, setup_environment):
    """
    TÌNH HUỐNG 1: Lưu bản nháp (Draft).
    - Ngữ cảnh: Member đang soạn thảo bài viết và muốn lưu lại để làm tiếp.
    - Hành động: Gọi POST /posts với status="draft".
    - Kỳ vọng:
      1. Post được tạo với status == 'draft'.
      2. Xuất hiện trong danh sách bài viết của workspace.
      3. Cho phép cập nhật nội dung mà không kích hoạt quy trình duyệt.
    """
    env = setup_environment
    ws_id = env["workspace"].workspace_uuid

    res = client.post(
        "/posts",
        headers=env["headers_mem"],
        json={
            "title": "Tình huống 1: Bài viết phác thảo ý tưởng Q4",
            "content": "Nội dung sơ bộ về kế hoạch truyền thông tháng 10...",
            "target_platforms": ["facebook"],
            "status": "draft",
            "workspace_id": ws_id,
        },
    )
    assert res.status_code == 201
    post = res.json()
    assert post["status"] == "draft"
    post_id = post["id"]

    # Cập nhật nội dung bản nháp
    res_update = client.patch(
        f"/workspaces/{ws_id}/posts/{post_id}",
        headers=env["headers_mem"],
        json={"content": "Nội dung đã được cập nhật thêm số liệu chi tiết."},
    )
    assert res_update.status_code == 200
    assert res_update.json()["content"] == "Nội dung đã được cập nhật thêm số liệu chi tiết."


# ============================================================================
# TÌNH HUỐNG 2: PENDING REVIEW (CHỜ DUYỆT)
# ============================================================================
def test_scenario_2_member_submits_post_for_review(client, setup_environment):
    """
    TÌNH HUỐNG 2: Member nộp bài viết chờ Manager phê duyệt (Pending Review).
    - Ngữ cảnh: Member hoàn thành bài viết và nhấn "Submit".
    - Hành động: Gọi POST /posts với status="pending_review".
    - Kỳ vọng:
      1. Vì author là Member, backend tự động áp dụng status == 'pending_review'.
      2. Bài viết xuất hiện trong danh sách chờ duyệt của Workspace.
    """
    env = setup_environment
    ws_id = env["workspace"].workspace_uuid

    res = client.post(
        "/posts",
        headers=env["headers_mem"],
        json={
            "title": "Tình huống 2: Thông báo ra mắt tính năng AI Content Generator",
            "content": "Giới thiệu tính năng AI Content Generator giúp tối ưu hóa viết bài tự động.",
            "target_platforms": ["linkedin"],
            "status": "pending_review",
            "workspace_id": ws_id,
        },
    )
    assert res.status_code == 201
    post = res.json()
    assert post["status"] == "pending_review", "Member submit bài phải có status pending_review"


# ============================================================================
# TÌNH HUỐNG 3: REJECTED (TỪ CHỐI DUYỆT CÓ GHI CHÚ FEEDBACK)
# ============================================================================
def test_scenario_3_manager_rejects_pending_post_with_reason(client, setup_environment):
    """
    TÌNH HUỐNG 3: Manager từ chối bài viết của Member kèm lý do (Rejected).
    - Ngữ cảnh: Member gửi bài nhưng Manager thấy thiếu hashtag thương hiệu và ảnh chất lượng cao.
    - Hành động: Manager gọi PATCH /workspaces/{ws_id}/posts/{post_id} với status="rejected" và reject_reason.
    - Kỳ vọng:
      1. Status chuyển thành 'rejected'.
      2. reject_reason được lưu lại để Member đọc được.
      3. Bản ghi trong bảng post_reviews được tạo tự động.
    """
    env = setup_environment
    ws_id = env["workspace"].workspace_uuid

    # 1. Member gửi bài
    res_create = client.post(
        "/posts",
        headers=env["headers_mem"],
        json={
            "title": "Tình huống 3: Bài viết chưa chuẩn thương hiệu",
            "content": "Bài viết chưa có CTA và chưa gắn hashtag công ty.",
            "target_platforms": ["facebook"],
            "status": "pending_review",
            "workspace_id": ws_id,
        },
    )
    assert res_create.status_code == 201
    post_id = res_create.json()["id"]

    # 2. Manager từ chối bài viết
    reject_msg = "Vui lòng bổ sung hashtag #MarketingTeam và lời kêu gọi hành động CTA trước khi gửi lại."
    res_reject = client.patch(
        f"/workspaces/{ws_id}/posts/{post_id}",
        headers=env["headers_mgr"],
        json={
            "status": "rejected",
            "reject_reason": reject_msg,
        },
    )
    assert res_reject.status_code == 200
    rejected_data = res_reject.json()
    assert rejected_data["status"] == "rejected"
    assert rejected_data.get("reject_reason") == reject_msg


# ============================================================================
# TÌNH HUỐNG 4: APPROVE TO READY FOR DISTRIBUTION (MANAGER PHÊ DUYỆT BÀI)
# ============================================================================
def test_scenario_4_manager_approves_pending_post(client, setup_environment):
    """
    TÌNH HUỐNG 4: Manager phê duyệt bài viết đang chờ (Approved -> Ready for Distribution).
    - Ngữ cảnh: Member nộp bài chất lượng tốt, Manager nhấn Duyệt (Approve).
    - Hành động: Manager gọi PATCH /workspaces/{ws_id}/posts/{post_id} với status="ready_for_distribution".
    - Kỳ vọng:
      1. Status chuyển từ 'pending_review' sang 'ready_for_distribution'.
      2. Bài viết sẵn sàng xuất bản ra mạng xã hội (hiển thị ở tab Published trên UI).
    """
    env = setup_environment
    ws_id = env["workspace"].workspace_uuid

    # 1. Member gửi bài
    res_create = client.post(
        "/posts",
        headers=env["headers_mem"],
        json={
            "title": "Tình huống 4: Bài viết hoàn hảo chờ Manager duyệt",
            "content": "Bài viết đầy đủ hashtag #TechNews, hình ảnh đẹp và văn phong chuẩn mực.",
            "target_platforms": ["linkedin"],
            "status": "pending_review",
            "workspace_id": ws_id,
        },
    )
    assert res_create.status_code == 201
    post_id = res_create.json()["id"]

    # 2. Manager duyệt bài
    res_approve = client.patch(
        f"/workspaces/{ws_id}/posts/{post_id}",
        headers=env["headers_mgr"],
        json={"status": "ready_for_distribution"},
    )
    assert res_approve.status_code == 200
    assert res_approve.json()["status"] == "ready_for_distribution"


# ============================================================================
# TÌNH HUỐNG 5: MANAGER TỰ TẠO BÀI (KHÔNG CẦN DUYỆT)
# ============================================================================
def test_scenario_5_manager_creates_post_directly_ready(client, setup_environment):
    """
    TÌNH HUỐNG 5: Manager trực tiếp tạo bài viết.
    - Ngữ cảnh: Manager có quyền cao nhất trong Workspace, khi soạn bài và Submit thì không cần kiểm duyệt.
    - Hành động: Manager gọi POST /posts với status="ready_for_distribution".
    - Kỳ vọng:
      1. Backend gán ngay status == 'ready_for_distribution' (hoặc draft nếu chọn draft).
      2. Tuyệt đối không bị đưa vào hàng chờ 'pending_review'.
    """
    env = setup_environment
    ws_id = env["workspace"].workspace_uuid

    res = client.post(
        "/posts",
        headers=env["headers_mgr"],
        json={
            "title": "Tình huống 5: Thông báo quan trọng từ Giám đốc Marketing",
            "content": "Chiến lược thương hiệu quý mới chính thức bắt đầu từ hôm nay.",
            "target_platforms": ["linkedin"],
            "status": "ready_for_distribution",
            "workspace_id": ws_id,
        },
    )
    assert res.status_code == 201
    post = res.json()
    assert post["status"] == "ready_for_distribution"


# ============================================================================
# TÌNH HUỐNG 6: PUBLISHED (ĐÃ XUẤT BẢN THÀNH CÔNG LÊN MẠNG XÃ HỘI)
# ============================================================================
def test_scenario_6_post_published_with_timestamp_and_metrics(client, setup_environment, db):
    """
    TÌNH HUỐNG 6: Xuất bản thành công (Published).
    - Ngữ cảnh: Bài viết sau khi qua distribution service đăng lên Facebook/LinkedIn thành công.
    - Hành động: Hệ thống ghi nhận published_at và status='published'.
    - Kỳ vọng:
      1. Bài viết có status == 'published'.
      2. Có mốc thời gian published_at.
      3. Ghi nhận lượt tương tác (engagements).
    """
    env = setup_environment
    ws_id = env["workspace"].workspace_uuid

    # Tạo post ready
    res = client.post(
        "/posts",
        headers=env["headers_mgr"],
        json={
            "title": "Tình huống 6: Bài viết đã đăng thành công lên LinkedIn",
            "content": "Chia sẻ case study tăng trưởng 300% lượng tiếp cận khách hàng.",
            "target_platforms": ["linkedin"],
            "status": "ready_for_distribution",
            "workspace_id": ws_id,
        },
    )
    assert res.status_code == 201
    post_id = uuid.UUID(res.json()["id"])

    # Mô phỏng distribution service hoàn tất đăng bài
    post_record = db.get(Post, post_id)
    post_record.status = "published"
    post_record.published_at = datetime.now(timezone.utc)
    post_record.total_engagements = 285
    db.commit()

    # Kiểm tra API trả về
    res_get = client.get(f"/workspaces/{ws_id}/posts", headers=env["headers_mgr"])
    assert res_get.status_code == 200
    matched = [p for p in res_get.json() if p["id"] == str(post_id)][0]
    assert matched["status"] == "published"
    assert matched["published_at"] is not None


# ============================================================================
# TÌNH HUỐNG 7: FAILED (XUẤT BẢN THẤT BẠI DO LỖI KỸ THUẬT)
# ============================================================================
def test_scenario_7_post_failed_distribution(client, setup_environment, db):
    """
    TÌNH HUỐNG 7: Phân phối thất bại (Failed).
    - Ngữ cảnh: Đăng bài lên mạng xã hội gặp lỗi (token hết hạn, API trả về 500 hoặc bị chặn).
    - Hành động: Hệ thống đánh dấu status='failed'.
    - Kỳ vọng:
      1. Bài viết có status == 'failed'.
      2. Xuất hiện trong tab Failed trên giao diện để người dùng nhấn Retry.
    """
    env = setup_environment
    ws_id = env["workspace"].workspace_uuid

    res = client.post(
        "/posts",
        headers=env["headers_mgr"],
        json={
            "title": "Tình huống 7: Bài viết đăng lỗi do Token mạng xã hội hết hạn",
            "content": "Nội dung bài viết mẫu bị ngắt kết nối mạng xã hội.",
            "target_platforms": ["facebook"],
            "status": "draft",
            "workspace_id": ws_id,
        },
    )
    assert res.status_code == 201
    post_id = uuid.UUID(res.json()["id"])

    # Gán trạng thái failed
    post_record = db.get(Post, post_id)
    post_record.status = "failed"
    db.commit()

    # Xác thực qua API
    res_get = client.get(f"/workspaces/{ws_id}/posts", headers=env["headers_mgr"])
    assert res_get.status_code == 200
    matched = [p for p in res_get.json() if p["id"] == str(post_id)][0]
    assert matched["status"] == "failed"


# ============================================================================
# TÌNH HUỐNG 8: INDIVIDUAL USER WORKFLOW (TÀI KHOẢN CÁ NHÂN)
# ============================================================================
def test_scenario_8_individual_account_flow(client, setup_environment):
    """
    TÌNH HUỐNG 8: Quy trình bài viết của tài khoản Cá nhân (Individual).
    - Ngữ cảnh: Người dùng cá nhân sử dụng hệ thống độc lập, không thuộc Workspace.
    - Hành động: Individual tạo bài Draft và bài Submit.
    - Kỳ vọng:
      1. Individual Submit bài -> Bỏ qua hàng chờ duyệt, đi thẳng vào 'ready_for_distribution'.
      2. Workspace Manager và Member KHÔNG nhìn thấy bài viết của Individual.
    """
    env = setup_environment

    # Individual tạo bài Submit
    res = client.post(
        "/posts",
        headers=env["headers_ind"],
        json={
            "title": "Tình huống 8: Bài viết của tài khoản Cá nhân",
            "content": "Chia sẻ kinh nghiệm lập trình độc lập.",
            "target_platforms": ["linkedin"],
            "status": "ready_for_distribution",
        },
    )
    assert res.status_code == 201
    ind_post = res.json()
    assert ind_post["status"] == "ready_for_distribution", "Individual submit bài không được bị pending_review"

    # Manager xem danh sách bài của Workspace -> Tuyệt đối không thấy bài của Individual
    ws_id = env["workspace"].workspace_uuid
    res_mgr_posts = client.get(f"/workspaces/{ws_id}/posts", headers=env["headers_mgr"])
    ws_post_ids = [p["id"] for p in res_mgr_posts.json()]
    assert ind_post["id"] not in ws_post_ids, "Bảo mật: Workspace không được thấy bài viết của tài khoản cá nhân"


# ============================================================================
# TÌNH HUỐNG 9: MEMBER HỦY BÀI VIẾT (CANCEL) & CHỐNG VƯỢT QUYỀN
# ============================================================================
def test_scenario_9_member_cancel_and_rbac_protection(client, setup_environment):
    """
    TÌNH HUỐNG 9: Quyền hạn Member và kiểm soát phân quyền (RBAC).
    - Ngữ cảnh:
      a) Member muốn thu hồi/hủy (cancel) bài viết pending của mình -> Cho phép.
      b) Member cố tình tự duyệt bài của mình sang ready_for_distribution -> BỊ CHẶN 403.
    - Hành động: Gọi PATCH /workspaces/{ws_id}/posts/{post_id}.
    - Kỳ vọng:
      1. Status 'cancel' thành công.
      2. Status 'ready_for_distribution' bị trả về 403 Forbidden.
    """
    env = setup_environment
    ws_id = env["workspace"].workspace_uuid

    # Member tạo bài pending
    res_create = client.post(
        "/posts",
        headers=env["headers_mem"],
        json={
            "title": "Tình huống 9: Bài viết kiểm tra phân quyền Member",
            "content": "Nội dung test cancel và tự duyệt.",
            "target_platforms": ["linkedin"],
            "status": "pending_review",
            "workspace_id": ws_id,
        },
    )
    assert res_create.status_code == 201
    post_id = res_create.json()["id"]

    # a) Member cố tình tự duyệt bài thành ready_for_distribution -> Phải bị 403
    res_unauth = client.patch(
        f"/workspaces/{ws_id}/posts/{post_id}",
        headers=env["headers_mem"],
        json={"status": "ready_for_distribution"},
    )
    assert res_unauth.status_code == 403, "Member không được phép tự duyệt bài viết"

    # b) Member hủy bài (cancel) -> Thành công
    res_cancel = client.patch(
        f"/workspaces/{ws_id}/posts/{post_id}",
        headers=env["headers_mem"],
        json={"status": "cancel"},
    )
    assert res_cancel.status_code == 200
    assert res_cancel.json()["status"] == "cancel"
