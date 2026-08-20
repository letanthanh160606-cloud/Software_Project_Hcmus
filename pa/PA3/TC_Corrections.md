# PA3 — Test Case Corrections

> Tài liệu này ghi lại các Test Case trong PA3_Draft.pdf cần được sửa lại cho khớp với hệ thống thực tế.
> Mỗi mục gồm: **Bản gốc (sai)** → **Tóm tắt lỗi** → **Bản sửa (đúng)**.

---

## 3.2.1 Test case 1 — U001-TC01: Verify Email with OTP

### Tóm tắt lỗi

| Mục sai | Bản gốc | Sửa thành |
|---------|---------|-----------|
| Endpoint URL | `POST /auth/verify_otp` (dấu `_`) | `POST /auth/verify-otp` (dấu `-`) |
| Test steps — URL | `BaseURL/auth/verify_otp` | `BaseURL/auth/verify-otp` |

> **Nguồn:** `src/backend/app/routers/auth.py` dòng 71: `@router.post("/verify-otp", ...)`

### Bản sửa

| Field | Description |
|-------|-------------|
| **Test case** | U001-TC01: Verify Email with OTP |
| **Related Use case** | U001 (Register & Login) |
| **Context** | User enters their email address and OTP code to verify identity before registration. |
| **Input Data** | Method / URL: **POST /auth/verify-otp** — Body: `{"email": "user@example.com", "otp": "123456"}` |
| **Expected Output** | HTTP 200 OK — `{"message": "Email verified successfully", "verification_token": "<token_string>", "expires_in": 900}` |
| **Test steps** | 1. Set HTTP request method to POST. — 2. Set URL to **BaseURL/auth/verify-otp**. — 3. Set request Body to raw JSON with valid email and OTP. — 4. Send request and inspect response status and verification token. |
| **Actual Output** | HTTP 200 OK returned with valid verification token and 900s expiration. |
| **Result** | **Passed** |

---

## 3.2.7 Test case 7 — U015-TC07: Submit Post for Review

### Tóm tắt lỗi

| Mục sai | Bản gốc | Sửa thành |
|---------|---------|-----------|
| Method & Flow | Member gửi **PATCH** `/workspaces/{id}/posts/{post_id}` với `{"status": "pending_review"}` | Member tạo post mới qua **POST** `/posts` với `{"status": "pending_review"}` |
| Lý do | Backend **cấm** member PATCH status khác `"cancel"` → trả 403. Flow submit thật là tạo post với status `"pending_review"` ngay từ đầu. | Xem `workspaces.py` dòng 143-145 và `posts.py` dòng 65. |

> **Nguồn:**
> - `src/backend/app/routers/workspaces.py` dòng 143–145: Member chỉ được phép chuyển status sang `"cancel"`.
> - `src/backend/app/routers/posts.py` dòng 65: `post_status = "pending_review" if payload.status in ("pending", "pending_review") else "draft"` — cho phép tạo post với status `pending_review`.

### Bản sửa

| Field | Description |
|-------|-------------|
| **Test case** | U015-TC07: Submit Post for Review |
| **Related Use case** | U015 (Review & Approval Workflow) |
| **Context** | A member creates and submits a new post for Manager review by setting the post status to `"pending_review"` at creation time. |
| **Input Data** | Method / URL: **POST /posts** — Headers: `Authorization: Bearer <member_token>` — Body: `{"workspace_id": "EWXDRDE7RY465RPC", "title": "Product Announcement", "content": "Official update...", "status": "pending_review"}` |
| **Expected Output** | HTTP 201 Created — Returns post object with `id`, `status: "pending_review"`, `author_id`, and timestamp metadata. |
| **Test steps** | 1. Authenticate with Member account and obtain JWT token. — 2. Send **POST** request to `/posts` with post payload including `"status": "pending_review"`. — 3. Verify response status code is **201 Created**. — 4. Confirm post `status` in response is `"pending_review"`. — 5. Verify post is persisted in database with correct status. |
| **Actual Output** | HTTP 201 Created returned; post successfully persisted with status `"pending_review"`. |
| **Result** | **Passed** |

---

## 3.2.8 Test case 8 — U016-TC08: Join Workspace with Valid PIN

### Tóm tắt lỗi

| Mục sai | Bản gốc | Sửa thành |
|---------|---------|-----------|
| Flow | "Open Join Workspace modal" trong Dashboard | Join workspace xảy ra qua **Sign Up page** (luồng đăng ký tài khoản) |
| API Endpoint | Không ghi rõ | `POST /auth/register` |
| `workspace_id` | `"WS-8849-A1B2-C3D4"` (17 ký tự, chứa dấu `-`) | `"EWXDRDE7RY465RPC"` (đúng 16 ký tự alphanumeric, do DB auto-generate) |
| Status sau join | "Granted dashboard access" (ngay lập tức) | Member có `status: "pending"`, cần Manager chấp thuận trước khi active |
| Test steps | "Log in → Open modal → Enter ID & PIN → Click Join" | "Verify email → Sign Up → Chọn Business/Member → Điền form → Submit" |

> **Nguồn:**
> - `src/frontend/src/page/SignUp.jsx` dòng 156–164: Frontend gửi `POST /auth/register` khi chọn Business + Member.
> - `src/backend/app/crud.py` dòng 100–103: `WorkspaceMember` được tạo với `status="pending"`.
> - `src/backend/app/routers/workspaces.py` dòng 220: Manager accept qua `PATCH /{workspace_id}/join-requests/{user_id}/accept`.

### Bản sửa

| Field | Description |
|-------|-------------|
| **Test case** | U016-TC08: Join Workspace with Valid PIN |
| **Related Use case** | U016 (Join Team Workspace) |
| **Context** | A new user registers as a Business Member and joins an existing team workspace by providing the workspace ID and PIN during the account registration process. |
| **Input Data** | Method / URL: **POST /auth/register** — Body: `{"username": "newmember", "email": "member@example.com", "password": "SecurePassword123!", "verification_token": "<token>", "account_type": "business", "business_role": "member", "workspace_id": "EWXDRDE7RY465RPC", "workspace_pin": "123456"}` |
| **Expected Output** | HTTP 201 Created — Returns `RegisterResponse` JSON containing user profile (`users_uuid`, `username`, `email`, `created_at`) and associated workspace info (`workspace_id`, `workspace_name`). A `workspace_members` record is created in the database with `status: "pending"`, awaiting Manager approval. |
| **Test steps** | 1. Complete the email verification flow (Send OTP → Verify OTP) to obtain a `verification_token`. — 2. Navigate to the Sign Up page. — 3. Select Account Type: **Business**, Role: **Member**. — 4. Fill in Username, Password, Workspace ID (16 characters), and Workspace password (4–8 digit PIN). — 5. Click **"Create your account"** and verify the API response returns HTTP 201. — 6. Confirm a `workspace_members` record is created in the database with `status = "pending"`. |
| **Actual Output** | HTTP 201 Created returned; user record and workspace membership with `status: "pending"` successfully persisted. User redirected to Sign In page with success toast message. |
| **Result** | **Passed** |

---

## 3.2.9 Test case 9 — U016-TC09: Join Workspace with Invalid PIN

### Tóm tắt lỗi

| Mục sai | Bản gốc | Sửa thành |
|---------|---------|-----------|
| Flow | "Open Join Workspace form" trong Dashboard | Đăng ký tài khoản qua **Sign Up page** (`POST /auth/register`) |
| Error message | `"Invalid Workspace ID or Workspace Password"` | `"Invalid workspace PIN"` (HTTP 401) hoặc `"Workspace not found"` (HTTP 404) |
| HTTP Status | Không ghi rõ | **401 Unauthorized** (PIN sai) hoặc **404 Not Found** (workspace_id không tồn tại) |
| `workspace_id` | `"WS-8849-A1B2-C3D4"` (17 ký tự) | `"EWXDRDE7RY465RPC"` (đúng 16 ký tự) |
| Test steps | "Open form → Input ID & PIN → Click Join → Observe UI" | "Sign Up → Chọn Business/Member → Điền form với PIN sai → Submit → Xem toast" |

> **Nguồn:**
> - `src/backend/app/routers/auth.py` dòng 139: `raise HTTPException(status_code=404, detail="Workspace not found")`
> - `src/backend/app/routers/auth.py` dòng 142: `raise HTTPException(status_code=401, detail="Invalid workspace PIN")`
> - `src/frontend/src/page/SignUp.jsx` dòng 178–186: Frontend hiển thị `data.detail` qua `toast.error(err.message)`.

### Bản sửa

| Field | Description |
|-------|-------------|
| **Test case** | U016-TC09: Join Workspace with Invalid PIN |
| **Related Use case** | U016 (Join Team Workspace) |
| **Context** | A new user attempts to register as a Business Member with an incorrect workspace PIN during the account registration process. |
| **Input Data** | Method / URL: **POST /auth/register** — Body: `{"username": "badmember", "email": "bad@example.com", "password": "SecurePassword123!", "verification_token": "<token>", "account_type": "business", "business_role": "member", "workspace_id": "EWXDRDE7RY465RPC", "workspace_pin": "999999"}` (Incorrect PIN) |
| **Expected Output** | HTTP 401 Unauthorized — Returns JSON error: `{"detail": "Invalid workspace PIN"}`. No user account or workspace membership record is created in the database. |
| **Test steps** | 1. Complete the email verification flow to obtain a `verification_token`. — 2. Navigate to the Sign Up page. — 3. Select Account Type: **Business**, Role: **Member**. — 4. Fill in Username, Password, valid Workspace ID, and an **incorrect** Workspace password. — 5. Click **"Create your account"**. — 6. Observe that the form displays an error toast with message **"Invalid workspace PIN"**. — 7. Verify that no user account was created in the database. |
| **Actual Output** | HTTP 401 Unauthorized returned with `{"detail": "Invalid workspace PIN"}`; error toast displayed on the Sign Up form. No records created. |
| **Result** | **Passed** |

---

## 3.2.13 Test case 13 — U008-TC13: Reject Past Deadline Task

### Tóm tắt lỗi

| Mục sai | Bản gốc | Sửa thành |
|---------|---------|-----------|
| Toàn bộ expected behavior | UI blocks submission, highlights date in red, message "Cannot schedule tasks in past timelines." | **Tính năng này chưa được implement.** Cả backend lẫn frontend đều không validate past date. |
| Backend validation | (ngầm hiểu là có) | `PersonalTaskCreateRequest` schema chỉ validate `title` length, **không** validate `due_date` |
| Frontend validation | Highlight red + block | `Calenmodule.jsx` chỉ kiểm tra title & due_date không rỗng, **không** kiểm tra past date |
| Error message | `"Cannot schedule tasks in past timelines."` | Message này **không tồn tại** trong codebase |

> **Nguồn:**
> - `src/backend/app/schemas.py` dòng 278–282: `PersonalTaskCreateRequest` — không có date validation.
> - `src/frontend/src/component/Calenmodule.jsx` dòng 88–96: Chỉ check `if (!newTitle.trim() || !newDueDate)`.

### Bản sửa

> **Lưu ý:** Vì tính năng past-date validation chưa được implement, test case này cần được viết lại để phản ánh **hành vi thực tế** của hệ thống — tức là hệ thống **cho phép** tạo task với ngày trong quá khứ (không có validation chặn). Test case nên ghi nhận **Result: Failed** vì behavior mong đợi (block past dates) chưa có.

| Field | Description |
|-------|-------------|
| **Test case** | U008-TC13: Reject Past Deadline Task |
| **Related Use case** | U008 (Personal Task & Calendar) |
| **Context** | User attempts to create a personal task with a deadline set to a past date. The system is expected to reject the submission. |
| **Input Data** | Method / URL: **POST /calendar/tasks** — Headers: `Authorization: Bearer <valid_jwt_token>` — Body: `{"title": "Late Task", "content": "", "priority": "medium", "due_date": "2026-08-10T10:00:00Z"}` (Past date) |
| **Expected Output** | Submission is blocked; system returns an error or UI highlights the date field and prevents task creation for past dates. |
| **Test steps** | 1. Open "Calendar" module from sidebar. — 2. Click the "+" button to open the Add Task modal. — 3. Input valid title and select a **past date** as the deadline. — 4. Click "Confirm" and observe system behavior. |
| **Actual Output** | Task is **accepted and created successfully** with HTTP 201. Both the backend (`PersonalTaskCreateRequest` schema) and frontend (`Calenmodule.jsx`) do not validate whether the due date is in the past. No error message is displayed. |
| **Result** | **Failed** — Past-date validation is not yet implemented in either the backend API or the frontend UI. This validation needs to be added to properly enforce this business rule. |

---

## 3.2.14 Test case 14 — U012-TC14: Disconnect Channel Role Guard

### Tóm tắt lỗi

| Mục sai | Bản gốc | Sửa thành |
|---------|---------|-----------|
| Target URL | `/distribution/settings` | URL này không tồn tại. Distribution API prefix thật: `/api/v1/distribution/channels`. Frontend là SPA, không có route `/distribution/settings`. |
| Access control behavior | "Direct URL access is blocked and redirects to Dashboard with an unauthorized notice (403)" | Frontend dùng **role-based tab filtering** — tab "Distribution" bị ẩn trong sidebar cho `member`. Không có HTTP 403 message. Truy cập URL trực tiếp → React Router catch-all redirect về `/dashboard`. |

> **Nguồn:**
> - `src/backend/app/distribution/router.py` dòng 18–20: `prefix="/api/v1/distribution/channels"`.
> - `src/frontend/src/page/MainDashboard.jsx` dòng 172: `{ label: 'Distribution', roles: ['individual', 'manager'], ... }` — Member bị loại khỏi danh sách roles.
> - `src/frontend/src/App.jsx` dòng 65–72: React Router catch-all redirect.

### Bản sửa

| Field | Description |
|-------|-------------|
| **Test case** | U012-TC14: Disconnect Channel Role Guard |
| **Related Use case** | U012 (Delete Distribution Channel) |
| **Context** | A Member account attempts to access the Distribution Channel configuration. |
| **Input Data** | User role: `member` — Action: Attempt to access the Distribution module via sidebar navigation and direct browser URL. |
| **Expected Output** | The "Distribution" tab is **not visible** in the sidebar navigation for Member role. The module is inaccessible because the tab is filtered out based on the user's role (`roles: ['individual', 'manager']`). |
| **Test steps** | 1. Log in with a Member account. — 2. Inspect the sidebar navigation and verify that the **"Distribution" tab is not present**. — 3. Verify that the Distribution API endpoints (`GET /api/v1/distribution/channels`) return only channels the member has access to (workspace-enabled channels), and management endpoints (delete, toggle) enforce ownership/manager checks server-side. |
| **Actual Output** | "Distribution" tab is hidden in sidebar for Member role. The Distribution module is only accessible to Individual and Manager users via the UI role-based navigation filter. Backend API endpoints additionally enforce ownership checks for channel operations. |
| **Result** | **Passed** |

---

## Tổng hợp các thay đổi

| Test Case | Loại lỗi | Mức độ | Tóm tắt |
|-----------|----------|--------|----------|
| **TC01** | Endpoint URL sai | Cao | `/auth/verify_otp` → `/auth/verify-otp` |
| **TC07** | Sai flow nghiệp vụ | Rất cao | Member không thể PATCH status sang `pending_review` (bị 403). Flow đúng: tạo post mới qua `POST /posts` với `status: "pending_review"`. |
| **TC08** | Sai flow + sai data + sai kết quả | Rất cao | Không có "Join Workspace modal". Join qua Sign Up. `workspace_id` sai format. Status sau join là `"pending"`, không phải active ngay. |
| **TC09** | Sai flow + sai error message | Cao | Error message thật: `"Invalid workspace PIN"` (401) hoặc `"Workspace not found"` (404), không phải `"Invalid Workspace ID or Workspace Password"`. |
| **TC13** | Tính năng chưa implement | Rất cao | Past-date validation không tồn tại ở cả backend lẫn frontend. Test case mô tả behavior chưa có → Result: **Failed**. |
| **TC14** | Sai URL + sai mechanism | Trung bình | URL `/distribution/settings` không tồn tại. Access control bằng role-based tab filtering trên sidebar, không trả HTTP 403. |
