import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, delete

from app.database import SessionLocal, engine, Base
from app.main import app
from app.models import User, Workspace, WorkspaceMember, PromptTemplate, KnowledgeBase
from app.security import create_access_token, hash_password


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def setup_users_and_workspaces(db_session):
    unique_suffix = uuid.uuid4().hex[:6]
    
    # 1. Individual User A
    user_ind_a = User(
        users_uuid=uuid.uuid4(),
        email=f"ind_a_{unique_suffix}@example.com",
        username=f"ind_a_{unique_suffix}",
        password_hash=hash_password("Password123!"),
        account_type="individual",
        is_email_verified=True,
    )
    
    # 2. Individual User B
    user_ind_b = User(
        users_uuid=uuid.uuid4(),
        email=f"ind_b_{unique_suffix}@example.com",
        username=f"ind_b_{unique_suffix}",
        password_hash=hash_password("Password123!"),
        account_type="individual",
        is_email_verified=True,
    )
    
    # 3. Workspace 1 Manager
    user_mgr_1 = User(
        users_uuid=uuid.uuid4(),
        email=f"mgr_1_{unique_suffix}@example.com",
        username=f"mgr_1_{unique_suffix}",
        password_hash=hash_password("Password123!"),
        account_type="business",
        is_email_verified=True,
    )
    
    # 4. Workspace 1 Member
    user_mem_1 = User(
        users_uuid=uuid.uuid4(),
        email=f"mem_1_{unique_suffix}@example.com",
        username=f"mem_1_{unique_suffix}",
        password_hash=hash_password("Password123!"),
        account_type="business",
        is_email_verified=True,
    )
    
    # 5. Workspace 2 Manager
    user_mgr_2 = User(
        users_uuid=uuid.uuid4(),
        email=f"mgr_2_{unique_suffix}@example.com",
        username=f"mgr_2_{unique_suffix}",
        password_hash=hash_password("Password123!"),
        account_type="business",
        is_email_verified=True,
    )

    db_session.add_all([user_ind_a, user_ind_b, user_mgr_1, user_mem_1, user_mgr_2])
    db_session.commit()

    # Workspace 1 (16 chars)
    ws_1 = Workspace(
        workspace_uuid=f"ws1_{unique_suffix}".ljust(16, "0")[:16],
        workspacename=f"Workspace 1 {unique_suffix}",
        manager_id=user_mgr_1.users_uuid,
        pin_hash=hash_password("123456"),
    )
    
    # Workspace 2 (16 chars)
    ws_2 = Workspace(
        workspace_uuid=f"ws2_{unique_suffix}".ljust(16, "0")[:16],
        workspacename=f"Workspace 2 {unique_suffix}",
        manager_id=user_mgr_2.users_uuid,
        pin_hash=hash_password("123456"),
    )
    db_session.add_all([ws_1, ws_2])
    db_session.commit()

    # Membership for Member W1
    mem_rec = WorkspaceMember(
        workspace_id=ws_1.workspace_uuid,
        user_id=user_mem_1.users_uuid,
        status="active",
    )
    db_session.add(mem_rec)
    db_session.commit()

    # Auth tokens
    tok_ind_a, _ = create_access_token(str(user_ind_a.users_uuid))
    tok_ind_b, _ = create_access_token(str(user_ind_b.users_uuid))
    tok_mgr_1, _ = create_access_token(str(user_mgr_1.users_uuid))
    tok_mem_1, _ = create_access_token(str(user_mem_1.users_uuid))
    tok_mgr_2, _ = create_access_token(str(user_mgr_2.users_uuid))

    data = {
        "user_ind_a": user_ind_a,
        "user_ind_b": user_ind_b,
        "user_mgr_1": user_mgr_1,
        "user_mem_1": user_mem_1,
        "user_mgr_2": user_mgr_2,
        "ws_1": ws_1,
        "ws_2": ws_2,
        "headers_ind_a": {"Authorization": f"Bearer {tok_ind_a}"},
        "headers_ind_b": {"Authorization": f"Bearer {tok_ind_b}"},
        "headers_mgr_1": {"Authorization": f"Bearer {tok_mgr_1}"},
        "headers_mem_1": {"Authorization": f"Bearer {tok_mem_1}"},
        "headers_mgr_2": {"Authorization": f"Bearer {tok_mgr_2}"},
    }

    yield data

    # Cleanup
    db_session.execute(delete(WorkspaceMember).where(WorkspaceMember.workspace_id.in_([ws_1.workspace_uuid, ws_2.workspace_uuid])))
    db_session.execute(delete(PromptTemplate).where(PromptTemplate.owner_user_id.in_([
        user_ind_a.users_uuid, user_ind_b.users_uuid, user_mgr_1.users_uuid, user_mem_1.users_uuid, user_mgr_2.users_uuid
    ])))
    db_session.execute(delete(KnowledgeBase).where(KnowledgeBase.owner_user_id.in_([
        user_ind_a.users_uuid, user_ind_b.users_uuid, user_mgr_1.users_uuid, user_mem_1.users_uuid, user_mgr_2.users_uuid
    ])))
    db_session.execute(delete(Workspace).where(Workspace.workspace_uuid.in_([ws_1.workspace_uuid, ws_2.workspace_uuid])))
    db_session.execute(delete(User).where(User.users_uuid.in_([
        user_ind_a.users_uuid, user_ind_b.users_uuid, user_mgr_1.users_uuid, user_mem_1.users_uuid, user_mgr_2.users_uuid
    ])))
    db_session.commit()


def test_individual_prompt_template_isolation(client, setup_users_and_workspaces):
    """
    Test that Individual User A's prompt templates are NOT visible to Individual User B.
    """
    env = setup_users_and_workspaces

    # User A creates a prompt template
    res_create = client.post(
        "/prompt-context/prompt-templates",
        headers=env["headers_ind_a"],
        json={
            "title": "Ind A Secret Template",
            "content": "This is a private template for user A.",
            "tag": "personal",
            "created_by": str(env["user_ind_a"].users_uuid),
        },
    )
    assert res_create.status_code == 200
    created_a = res_create.json()

    # User A lists templates -> should see it
    res_list_a = client.get("/prompt-context/prompt-templates", headers=env["headers_ind_a"])
    assert res_list_a.status_code == 200
    titles_a = [t["title"] for t in res_list_a.json()]
    assert "Ind A Secret Template" in titles_a

    # User B lists templates -> MUST NOT see User A's template!
    res_list_b = client.get("/prompt-context/prompt-templates", headers=env["headers_ind_b"])
    assert res_list_b.status_code == 200
    titles_b = [t["title"] for t in res_list_b.json()]
    assert "Ind A Secret Template" not in titles_b, (
        "LOGIC ERROR DETECTED: Individual User B can see Individual User A's prompt template!"
    )


def test_manager_member_vs_individual_isolation(client, setup_users_and_workspaces):
    """
    Test that Workspace 1 Manager/Member prompt templates are shared within W1,
    but are NOT visible to an Individual account.
    """
    env = setup_users_and_workspaces

    # Manager of Workspace 1 creates a prompt template
    res_create_m1 = client.post(
        "/prompt-context/prompt-templates",
        headers=env["headers_mgr_1"],
        json={
            "title": "W1 Team Prompt Template",
            "content": "Team prompt guidelines for Workspace 1.",
            "tag": "team",
            "created_by": str(env["user_mgr_1"].users_uuid),
        },
    )
    assert res_create_m1.status_code == 200

    # Member of Workspace 1 lists templates -> SHOULD see W1 Team template
    res_list_mem1 = client.get("/prompt-context/prompt-templates", headers=env["headers_mem_1"])
    assert res_list_mem1.status_code == 200
    titles_mem1 = [t["title"] for t in res_list_mem1.json()]
    assert "W1 Team Prompt Template" in titles_mem1, (
        "Workspace 1 Member should see Workspace 1 Team template"
    )

    # Individual User A lists templates -> MUST NOT see Workspace 1 template!
    res_list_ind_a = client.get("/prompt-context/prompt-templates", headers=env["headers_ind_a"])
    assert res_list_ind_a.status_code == 200
    titles_ind_a = [t["title"] for t in res_list_ind_a.json()]
    assert "W1 Team Prompt Template" not in titles_ind_a, (
        "LOGIC ERROR DETECTED: Individual User A can see Workspace 1's prompt template!"
    )

    # Manager of Workspace 2 lists templates -> MUST NOT see Workspace 1 template!
    res_list_mgr2 = client.get("/prompt-context/prompt-templates", headers=env["headers_mgr_2"])
    assert res_list_mgr2.status_code == 200
    titles_mgr2 = [t["title"] for t in res_list_mgr2.json()]
    assert "W1 Team Prompt Template" not in titles_mgr2, (
        "LOGIC ERROR DETECTED: Workspace 2 Manager can see Workspace 1's prompt template!"
    )


def test_knowledge_base_isolation(client, setup_users_and_workspaces):
    """
    Test that Knowledge Base documents are strictly isolated across Individual and Workspaces.
    """
    env = setup_users_and_workspaces

    # Individual User A creates Knowledge Base
    res_kb_a = client.post(
        "/prompt-context/knowledge-bases",
        headers=env["headers_ind_a"],
        json={
            "title": "Ind A Secret Document",
            "content": "Confidential individual notes.",
            "tag": "personal",
            "created_by": str(env["user_ind_a"].users_uuid),
        },
    )
    assert res_kb_a.status_code == 201

    # Manager of W1 creates Knowledge Base
    res_kb_w1 = client.post(
        "/prompt-context/knowledge-bases",
        headers=env["headers_mgr_1"],
        json={
            "title": "W1 Company Knowledge",
            "content": "Internal company handbook.",
            "tag": "internal",
            "created_by": str(env["user_mgr_1"].users_uuid),
        },
    )
    assert res_kb_w1.status_code == 201

    # Check Individual User B:
    # Cannot see Ind A's document, and cannot see W1's document!
    res_list_b = client.get("/prompt-context/knowledge-bases", headers=env["headers_ind_b"])
    assert res_list_b.status_code == 200
    titles_b = [kb["title"] for kb in res_list_b.json()]
    assert "Ind A Secret Document" not in titles_b, (
        "LOGIC ERROR DETECTED: User B can see User A's Knowledge Base document!"
    )
    assert "W1 Company Knowledge" not in titles_b, (
        "LOGIC ERROR DETECTED: Individual User B can see Workspace 1's Knowledge Base document!"
    )

    # Check Member of W1:
    # Can see W1 Company Knowledge, but CANNOT see Ind A's document!
    res_list_mem1 = client.get("/prompt-context/knowledge-bases", headers=env["headers_mem_1"])
    assert res_list_mem1.status_code == 200
    titles_mem1 = [kb["title"] for kb in res_list_mem1.json()]
    assert "W1 Company Knowledge" in titles_mem1
    assert "Ind A Secret Document" not in titles_mem1, (
        "LOGIC ERROR DETECTED: Workspace Member can see Individual User A's Knowledge Base document!"
    )


def test_unauthorized_deletion_prevented(client, setup_users_and_workspaces):
    """
    Test that a user cannot delete another user's prompt template or knowledge base.
    """
    env = setup_users_and_workspaces

    # User A creates a template
    res_create = client.post(
        "/prompt-context/prompt-templates",
        headers=env["headers_ind_a"],
        json={
            "title": "Template To Delete Test",
            "content": "User A content.",
            "tag": "test",
            "created_by": str(env["user_ind_a"].users_uuid),
        },
    )
    assert res_create.status_code == 200
    tmpl_id = res_create.json()["id"]

    # User B attempts to delete User A's template -> Forbidden or Not Found
    res_del_b = client.delete(f"/prompt-context/prompt-templates/{tmpl_id}", headers=env["headers_ind_b"])
    assert res_del_b.status_code in (403, 404), (
        "SECURITY FLAW: User B was able to delete User A's prompt template!"
    )

    # User A deletes their own template -> Success
    res_del_a = client.delete(f"/prompt-context/prompt-templates/{tmpl_id}", headers=env["headers_ind_a"])
    assert res_del_a.status_code == 204

    # Template should no longer be listed
    res_list_a = client.get("/prompt-context/prompt-templates", headers=env["headers_ind_a"])
    assert res_list_a.status_code == 200
    titles_a = [t["title"] for t in res_list_a.json()]
    assert "Template To Delete Test" not in titles_a
