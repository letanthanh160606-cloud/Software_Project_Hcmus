import sys
import uuid

sys.path.insert(0, ".")

from sqlalchemy import select, delete
from app.database import SessionLocal
from app.models import User, Workspace, WorkspaceMember, Notifications
from app.security import hash_password, hash_pin, verify_password
from app import crud


def create_or_reset_test_accounts():
    db = SessionLocal()
    try:
        test_emails = [
            "manager@test.com",
            "member@test.com",
            "individual@test.com",
        ]
        test_usernames = [
            "manager_test",
            "member_test",
            "individual_test",
        ]

        print("=== Cleaning up existing test accounts if any ===")
        # Find existing users
        existing_users = db.scalars(
            select(User).where(
                (User.email.in_(test_emails)) | (User.username.in_(test_usernames))
            )
        ).all()
        user_uuids = [u.users_uuid for u in existing_users]

        if user_uuids:
            # Delete memberships
            db.execute(delete(WorkspaceMember).where(WorkspaceMember.user_id.in_(user_uuids)))
            # Delete workspaces managed by them
            workspaces = db.scalars(select(Workspace).where(Workspace.manager_id.in_(user_uuids))).all()
            for ws in workspaces:
                db.execute(delete(WorkspaceMember).where(WorkspaceMember.workspace_id == ws.workspace_uuid))
                db.delete(ws)
            # Delete notifications
            db.execute(delete(Notifications).where(Notifications.user_id.in_(user_uuids)))
            # Delete users
            for u in existing_users:
                db.delete(u)
            db.commit()
            print(f"Cleaned up {len(existing_users)} old test users.")

        default_password = "Password123!"
        workspace_pin = "123456"
        workspace_name = "Demo Workspace"

        print("\n=== 1. Creating Manager & Workspace ===")
        manager, workspace = crud.create_manager_with_workspace(
            db,
            username="manager_test",
            email="manager@test.com",
            password=default_password,
            workspace_name=workspace_name,
            workspace_pin=workspace_pin,
        )
        print(f"-> Manager: {manager.email} | Username: {manager.username}")
        print(f"-> Workspace: {workspace.workspacename} (ID: {workspace.workspace_uuid}) | PIN: {workspace_pin}")

        print("\n=== 2. Creating Member in the same Workspace ===")
        member = crud.create_member_for_workspace(
            db,
            username="member_test",
            email="member@test.com",
            password=default_password,
            workspace=workspace,
        )
        # Directly approve / activate member membership
        membership = db.scalar(
            select(WorkspaceMember).where(
                WorkspaceMember.user_id == member.users_uuid,
                WorkspaceMember.workspace_id == workspace.workspace_uuid,
            )
        )
        if membership:
            membership.status = "active"
            db.commit()
            db.refresh(membership)
        print(f"-> Member: {member.email} | Username: {member.username} | Status: {membership.status}")

        print("\n=== 3. Creating Individual User ===")
        individual = crud.create_individual_user(
            db,
            username="individual_test",
            email="individual@test.com",
            password=default_password,
        )
        print(f"-> Individual: {individual.email} | Username: {individual.username}")

        # Verification of roles
        print("\n=== Verifying Roles & Workspace Associations ===")
        role_mgr = crud.derive_role(db, manager)
        role_mem = crud.derive_role(db, member)
        role_ind = crud.derive_role(db, individual)

        ws_mgr = crud.get_workspace_for_user(db, manager)
        ws_mem = crud.get_workspace_for_user(db, member)
        ws_ind = crud.get_workspace_for_user(db, individual)

        print(f"Manager: Role = '{role_mgr}', Workspace ID = '{ws_mgr.workspace_uuid if ws_mgr else None}'")
        print(f"Member:  Role = '{role_mem}', Workspace ID = '{ws_mem.workspace_uuid if ws_mem else None}'")
        print(f"Individual: Role = '{role_ind}', Workspace ID = '{ws_ind.workspace_uuid if ws_ind else None}'")

        assert role_mgr == "manager", "Manager role mismatch"
        assert role_mem == "member", "Member role mismatch"
        assert role_ind == "individual", "Individual role mismatch"
        assert ws_mgr.workspace_uuid == ws_mem.workspace_uuid, "Manager and Member must share the same workspace!"
        assert ws_ind is None, "Individual must NOT have a workspace!"

        print("\nSUCCESS: All 3 accounts created and verified successfully!")

    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_or_reset_test_accounts()
