# 🏗️ TỔNG QUAN KIẾN TRÚC VÀ CÁCH HOẠT ĐỘNG CỦA HỆ THỐNG BACKEND (OMNI PLATFORMS)

Tài liệu này cung cấp cái nhìn tổng quan, toàn diện và chi tiết về cấu trúc hệ thống, các module chức năng, luồng xử lý dữ liệu và nguyên lý hoạt động của mã nguồn Backend ứng dụng **Omni Platforms**.

---

## 📐 1. Tổng Quan Kiến Trúc (Architecture Overview)

Hệ thống Backend được xây dựng trên nền tảng **FastAPI (Python 3.11+)** kết hợp với **SQLAlchemy 2.0 ORM** và cơ sở dữ liệu **PostgreSQL** hỗ trợ đa schema (Multi-schema).

### Các đặc trưng kiến trúc chính:
- **Clean & Layered Architecture**: Phân tách rõ ràng giữa các tầng:
  - **Routers / Controllers**: Tiếp nhận HTTP Request, validate dữ liệu đầu vào (Pydantic v2) và trả về HTTP Response.
  - **Services / Business Logic**: Xử lý nghiệp vụ chính (OAuth 2.0, OTP/Email, Encryption, Phân quyền).
  - **Repository / CRUD**: Tương tác trực tiếp với cơ sở dữ liệu qua SQLAlchemy Session.
  - **Models / Database Schemas**: Định nghĩa các bảng dữ liệu PostgreSQL phân tách theo schema (`Users`, `workspaces`, `public`).
- **Bảo mật Đa Lớp (Multi-layer Security)**: Mã hóa mật khẩu bằng `bcrypt`, mã hóa Token mạng xã hội lưu trong DB bằng **Fernet (AES-256)**, bảo vệ chống CSRF OAuth bằng State Token.
- **Tác vụ Ngầm (Background Jobs)**: Sử dụng **APScheduler** quét và tạo thông báo tự động cho các bài viết sắp đến hạn.

---

## 📁 2. Cấu Trúc Thư Mục Backend

```text
src/backend/
├── app/
│   ├── distribution/               # Module phân phối mạng xã hội (Clean Architecture)
│   │   ├── oauth_providers.py      # OAuth 2.0 Providers (Facebook, LinkedIn)
│   │   ├── repository.py           # Database Repository cho Social Channel & Post Distribution
│   │   ├── router.py               # REST API Endpoints cho OAuth & Channel Management
│   │   ├── schemas.py              # Pydantic Schemas request/response
│   │   ├── service.py              # Xử lý nghiệp vụ đăng bài & kết nối kênh
│   │   └── token_encryption.py     # Mã hóa/Giải mã Fernet Token
│   ├── jobs/                       # Background Jobs Lập lịch (APScheduler)
│   │   └── notification_jobs.py    # Quét bài viết sắp đến hạn (Due-soon checker)
│   ├── routers/                    # Các Router API chính của ứng dụng
│   │   ├── auth.py                 # Đăng ký, Đăng nhập, Xác minh OTP/Email
│   │   ├── calendar.py             # Lịch đăng bài & Quản lý mốc thời gian
│   │   ├── health.py               # Endpoint Health Check hệ thống
│   │   ├── notifications.py        # Quản lý Thông báo người dùng
│   │   ├── posts.py                # Quản lý Bài viết (Tạo, Sửa, Xóa, Phê duyệt)
│   │   └── workspaces.py           # Quản lý Workspace & Thành viên nhóm
│   ├── services/                   # Các dịch vụ dùng chung
│   │   ├── email_service.py        # Dịch vụ gửi Email OTP (SMTP / Resend API)
│   │   └── otp_service.py          # Tạo & Xác thực mã OTP an toàn (PBKDF2-HMAC-SHA256)
│   ├── config.py                   # Quản lý cấu hình môi trường (Pydantic BaseSettings)
│   ├── crud.py                     # Thao tác CRUD cơ bản cho User, Workspace, Post
│   ├── database.py                 # Khởi tạo SQLAlchemy Engine & SessionLocal
│   ├── dependencies.py             # FastAPI Dependencies (Authentication, DB Session)
│   ├── main.py                     # Entry point ứng dụng FastAPI & Scheduler startup
│   ├── models.py                   # Tất cả SQLAlchemy Models (PostgreSQL Schemas)
│   ├── schemas.py                  # Pydantic Schemas chung cho Auth, Post, Workspace
│   └── security.py                 # Hash mật khẩu (bcrypt) & Tạo/Xác thực JWT Token
├── database/                       # Các file SQL Migration / Schema Initialization
├── migrate_distribution.py         # Script khởi tạo bảng Distribution
├── migrate_email_verifications.py  # Script khởi tạo bảng Email Verifications
├── test_all_features.py            # Integration Tests toàn bộ hệ thống
├── test_distribution.py            # Integration Tests module Distribution
├── requirements.txt                # Danh sách thư viện phụ thuộc Python
└── .env                            # Biến môi trường hệ thống
```

---

## ⚙️ 3. Chi Tiết Các Module & Cách Hoạt Động Của Code

### 🔑 Module 1: Xác Thực & Quản Lý Người Dùng (`auth.py`, `security.py`, `otp_service.py`, `email_service.py`)

#### Chức năng:
Quản lý đăng ký tài khoản (Cá nhân `individual` / Doanh nghiệp `business`), xác minh email qua mã OTP 6 chữ số, đăng nhập và cấp phát JWT Token.

#### Luồng hoạt động:
1. **Đăng ký (`POST /auth/register`)**:
   - Nhận thông tin người dùng (`username`, `email`, `password`, `account_type`).
   - Hash mật khẩu bằng `bcrypt` thông qua `app/security.py`.
   - Lưu thông tin người dùng vào bảng `Users.users` với trạng thái `is_email_verified = False`.
   - Tự động tạo và gửi mã OTP xác minh về Email người dùng.
2. **Quy trình OTP An toàn (`otp_service.py` & `email_service.py`)**:
   - Mã OTP 6 chữ số được tạo ra kèm theo **Salt ngẫu nhiên 32-byte**.
   - Hợp nhất OTP + Salt và hash bằng thuật toán **PBKDF2-HMAC-SHA256** với 100,000 vòng lặp trước khi lưu vào bảng `public.email_verifications`. Mã OTP thô **không bao giờ được lưu dưới dạng plaintext**.
   - Giới hạn số lần thử (tối đa 5 lần) và thời gian hết hạn (10 phút).
3. **Xác minh Email (`POST /auth/verify-email-otp`)**:
   - Đối chiếu OTP người dùng nhập. Khi đúng, cấp một `verification_token` tạm thời và đánh dấu `is_verified = True`.
4. **Đăng nhập (`POST /auth/login`)**:
   - Kiểm tra `email` và `password_hash`.
   - Nếu tài khoản chưa xác minh email, trả về lỗi yêu cầu xác minh.
   - Nếu hợp lệ, cấp JWT Access Token chứa payload (`sub: user_uuid`, `account_type`, `exp`).

---

### 🏢 Module 2: Quản Lý Workspace & Nhóm Bài Viết (`workspaces.py`, `crud.py`)

#### Chức năng:
Cung cấp không gian làm việc chung (Workspace) cho tài khoản Doanh nghiệp (`business`) để phân quyền giữa Manager (Quản lý) và Member (Thành viên).

#### Phân quyền RBAC (Role-Based Access Control):
- **Manager**: Chủ sở hữu Workspace, có quyền tạo/xóa Workspace, duyệt bài viết của Member, thêm/xóa thành viên.
- **Member**: Thành viên trong Workspace, có quyền tạo bài viết (chuyển sang trạng thái `pending_review` chờ Manager duyệt).
- **Individual**: Tài khoản cá nhân hoạt động độc lập, tự quản lý và tự phê duyệt bài viết của chính mình.

#### Luồng hoạt động:
1. **Tạo Workspace (`POST /workspaces`)**:
   - Manager tạo Workspace kèm mã **PIN bảo mật** (được hash bằng bcrypt).
   - CSDL tự động sinh mã định danh `workspace_uuid` gồm 16 ký tự thông qua hàm PostgreSQL `public.generate_workspace_id()`.
2. **Tham gia Workspace (`POST /workspaces/join`)**:
   - Thành viên nhập `workspace_id` và mã PIN.
   - Hệ thống xác thực PIN và lưu liên kết vào bảng `workspaces.workspace_members`.

---

### 📝 Module 3: Quản Lý Bài Viết & Phê Duyệt (`posts.py`, `crud.py`)

#### Chức năng:
Tạo lập, cập nhật, theo dõi vòng đời bài viết (Content Management System).

#### Vòng đời trạng thái bài viết (`post_status_enum`):
```
[draft] (Nháp) ──► [pending_review] (Chờ duyệt) ──► [ready_for_distribution] (Đã duyệt / Sẵn sàng)
                         │                                       │
                         ▼                                       ▼
                    [rejected] (Từ chối)                   [published] (Đã xuất bản)
                                                                 │
                                                                 ▼
                                                            [failed] (Lỗi)
```

#### Luồng xử lý:
- Khi **Member** tạo/sửa bài viết trong Workspace $\rightarrow$ Trạng thái tự động chuyển thành `pending_review`.
- Khi **Manager** duyệt bài $\rightarrow$ Chuyển thành `ready_for_distribution`.
- Khi **Individual** tạo bài $\rightarrow$ Bài viết tự động sẵn sàng xuất bản.

---

### 🚀 Module 4: Phân Phối Mạng Xã Hội (`app/distribution/`)

#### Chức năng:
Kết nối các kênh mạng xã hội (Facebook Fanpage, LinkedIn) qua chuẩn OAuth 2.0 và phát hành bài viết tự động lên mạng xã hội.

#### Cấu trúc thiết kế Clean Architecture:
- **`oauth_providers.py`**: Định nghĩa lớp trừu tượng `BaseOAuthProvider` và triển khai chi tiết cho `FacebookOAuthProvider` & `LinkedInOAuthProvider`.
- **`token_encryption.py`**: Mã hóa/giải mã Access Token bằng Fernet (Chìa khóa AES-256 định nghĩa trong `FERNET_SECRET_KEY`).
- **`repository.py`**: Xử lý truy vấn CSDL cho kênh mạng xã hội `SocialAccount` và `PostDistribution`.
- **`service.py`**: Nghiệp vụ kết nối OAuth, kiểm tra quyền hạn và gọi Facebook Graph API để xuất bản bài đăng.

#### Luồng Đăng bài tự động lên Facebook Fanpage:
1. Người dùng bấm **`Publish to Facebook`** trên giao diện.
2. Backend kiểm tra kênh mạng xã hội đang kết nối trong Workspace/Individual.
3. Giải mã `access_token_encrypted` từ CSDL bằng `token_encryption.py`.
4. Gọi Facebook Graph API (`/v19.0/me/accounts`) để lấy danh sách Fanpage và **Page Access Token** tương ứng.
5. Đăng bài lên tường Fanpage qua endpoint `https://graph.facebook.com/v19.0/{page_id}/feed`.
6. Nhận về Facebook Post ID (dạng `page_id_storyfbid`), tự động tạo đường link xem trực tiếp `https://www.facebook.com/permalink.php?story_fbid=...&id=...`.
7. Cập nhật `post.status = "published"` (hoặc `"ready_for_distribution"`) và `published_at = now()`.

#### Cơ chế Bảo vệ 409 Conflict Guard:
Ngăn không cho người dùng xóa một kênh mạng xã hội khi kênh đó vẫn còn bài viết đang trong hàng chờ phân phối (`pending` hoặc `queued`).

---

### 📅 Module 5: Quản Lý Lịch Đăng Bài (`calendar.py`)

#### Chức năng:
Truy vấn danh sách bài viết được sắp xếp theo thời gian (Calendar View).

#### Luồng hoạt động:
- Lọc bài viết theo mốc thời gian bắt đầu (`start_date`) và kết thúc (`end_date`).
- Trả về danh sách bài đăng phân loại theo các ngày trong tháng để hiển thị trên giao diện Lịch (Calendar Component).

---

### 🔔 Module 6: Thông Báo & Tác Vụ Lập Lịch Ngầm (`notifications.py`, `notification_jobs.py`, `main.py`)

#### Chức năng:
Tự động quét bài viết và gửi thông báo nhắc nhở khi bài viết sắp đến hạn xuất bản.

#### Luồng hoạt động:
1. Trong `main.py`, khi ứng dụng khởi động (`startup` event), một bộ lập lịch ngầm **APScheduler (`BackgroundScheduler`)** được kích hoạt.
2. Cứ mỗi **1 giờ**, scheduler thực thi hàm `check_due_soon_tasks()` trong `app/jobs/notification_jobs.py`.
3. Hàm quét CSDL tìm các bài viết có lịch đăng trong vòng 24h tới và tạo record thông báo mới vào bảng `workspaces.notifications`.
4. Người dùng xem thông báo qua API `GET /notifications` và đánh dấu đã đọc qua `PATCH /notifications/{id}/read`.

---

### 🩺 Module 7: Health Check (`health.py`)

#### Chức năng:
Cung cấp endpoint kiểm tra tình trạng sống (Liveness/Readiness probe) của Backend Server:
- `GET /health` $\rightarrow$ Trả về `{"status": "ok"}`.

---

## 🗄️ 4. Sơ Đồ Cơ Sở Dữ Liệu PostgreSQL (Database Schemas)

Hệ thống sử dụng **PostgreSQL** được tổ chức theo 3 Schema chính nhằm tăng tính đóng gói và bảo mật:

```mermaid
erDiagram
    "Users.users" ||--o{ "workspaces.workspaces" : "manages"
    "Users.users" ||--o{ "workspaces.workspace_members" : "belongs_to"
    "workspaces.workspaces" ||--o{ "workspaces.workspace_members" : "contains"
    "workspaces.workspaces" ||--o{ "workspaces.posts" : "owns"
    "Users.users" ||--o{ "workspaces.posts" : "authors"
    "workspaces.posts" ||--o{ "workspaces.post_distributions" : "targets"
    "workspaces.social_accounts" ||--o{ "workspaces.post_distributions" : "receives"

    "Users.users" {
        uuid users_uuid PK
        string username
        string email
        string password_hash
        enum account_type "individual | business"
        boolean is_email_verified
    }

    "workspaces.workspaces" {
        string workspace_uuid PK "16-char code"
        string workspacename
        uuid manager_id FK
        string pin_hash
    }

    "workspaces.workspace_members" {
        uuid user_id PK, FK
        string workspace_id PK, FK
        enum status "pending | active | removed"
    }

    "workspaces.social_accounts" {
        uuid id PK "UUIDv7"
        string owner_type "workspace | individual"
        string owner_id
        string platform "facebook | linkedin"
        string display_name
        text access_token_encrypted
    }

    "workspaces.posts" {
        uuid id PK "UUIDv7"
        string workspace_id FK
        uuid author_id FK
        text title
        text content
        enum status "draft | pending_review | rejected | ready_for_distribution | published | failed"
        timestamp published_at
    }

    "workspaces.post_distributions" {
        uuid id PK
        uuid post_id FK
        uuid channel_id FK
        string status "pending | published | failed"
    }

    "public.email_verifications" {
        uuid id PK
        string email
        string otp_hash
        string salt
        boolean is_verified
    }

    "public.oauth_states" {
        string state PK
        uuid user_id FK
        string platform
        jsonb metadata_json
    }
```

---

## 🔒 5. Quy Trình Bảo Mật & Luồng Xử Lý Request (Security Architecture)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend Client
    participant Router as FastAPI Router
    participant Auth as Auth Dependency
    participant Service as Business Service
    participant Encrypt as Fernet Cryptography
    participant DB as PostgreSQL Database
    participant ExtAPI as Facebook / LinkedIn API

    Client->>Router: HTTP Request + Bearer JWT Token
    Router->>Auth: get_current_user(token)
    Auth->>Auth: Giải mã JWT & kiểm tra Expire
    Auth-->>Router: Trả về đối tượng User

    Router->>Service: Gọi hàm nghiệp vụ (vd: publish_post)
    Service->>DB: Truy vấn Kênh SocialAccount & Post
    DB-->>Service: Trả về kênh mã hóa Token

    Service->>Encrypt: decrypt_token(access_token_encrypted)
    Encrypt-->>Service: Trả về Token thô (Plaintext Access Token)

    Service->>ExtAPI: HTTP POST bài viết + Token lên Facebook Graph API
    ExtAPI-->>Service: Trả về Post ID thành công

    Service->>DB: Cập nhật Post Status = 'published'
    Service-->>Router: Trả về kết quả thành công + Link bài đăng
    Router-->>Client: HTTP 200 OK + Payload JSON
```

---

## 🛠️ 6. Hướng Dẫn Chạy & Khởi Động Backend

### 1. Cài đặt môi trường:
```bash
cd src/backend
python -m venv .venv
.venv\Scripts\activate  # Trởn Windows
pip install -r requirements.txt
```

### 2. Cấu hình file `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/omni_db
JWT_SECRET_KEY=your_super_secret_jwt_key
FERNET_SECRET_KEY=your_fernet_aes256_base64_key
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

### 3. Chạy Migration CSDL:
```bash
python migrate_email_verifications.py
python migrate_distribution.py
```

### 4. Khởi chạy Server Backend:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Chạy Integration Tests:
```bash
python test_all_features.py
python test_distribution.py
```

---

*Tài liệu này được cập nhật tự động đồng bộ theo đúng mã nguồn mới nhất của hệ thống Backend Omni Platforms.* 🚀
