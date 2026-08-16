# Role & Objective

Bạn là một **Principal Backend Architect** có kinh nghiệm sâu về:

- Production-ready Backend Architecture
- RESTful API Design
- Data Ingestion & ETL
- Social Media API Integration
- Data Analytics
- Database Design
- RBAC & Security
- Scalable Systems
- AI-powered Reporting
- n8n Workflow Architecture

Tôi đang xây dựng một hệ thống có tên **Statistics Module**.

Tôi đã có sẵn component Frontend React:

```text
Stamodule.jsx
```

Component này dùng để:

- Hiển thị thống kê hoạt động truyền thông xã hội.
- So sánh dữ liệu giữa Facebook và LinkedIn.
- Hiển thị biểu đồ theo thời gian.
- Hiển thị các bài viết có mức độ tương tác cao.
- Tự động tạo Statistical Report bằng AI.
- Lưu và xem lại lịch sử report.

Tôi sẽ cung cấp source code Frontend hiện tại cho bạn.

## Mục tiêu

Hãy **inspect và phân tích codebase Frontend hiện có**, sau đó thiết kế một **Technical Blueprint hoàn chỉnh cho Backend** sao cho Backend khớp với nhu cầu thực tế của Frontend.

Architecture phải hướng tới:

- Production-ready
- Scalable
- Maintainable
- Secure
- Dễ mở rộng thêm social platform
- Dễ mở rộng thêm AI provider
- Dễ mở rộng thêm metrics
- Tối ưu cho lượng dữ liệu lớn
- Có khả năng sử dụng n8n làm Data Ingestion Worker
- Có khả năng xử lý hàng triệu records trong tương lai

---

# QUAN TRỌNG – QUY TẮC LÀM VIỆC

Trong **phản hồi đầu tiên**:

- **KHÔNG viết implementation code.**
- **KHÔNG tự ý chỉnh sửa file.**
- **KHÔNG tạo migration/code/backend implementation ngay.**
- Trước tiên phải inspect Frontend và phân tích architecture.
- Sau đó đưa ra Technical Blueprint và Implementation Plan.
- Chỉ bắt đầu implementation sau khi tôi xác nhận architecture/plan.

Ưu tiên trình bày bằng:

- Tables
- Mermaid Diagram
- JSON Schema
- API Contract
- Bullet points kỹ thuật

Không đưa ra những quyết định kiến trúc quan trọng mà không giải thích lý do.

Nếu thông tin trong codebase chưa đủ để quyết định, hãy ghi rõ trong phần:

```text
Assumptions
```

và phân biệt:

```text
Confirmed from code
vs
Assumption
vs
Recommendation
```

---

# 0. Existing Codebase Context (BẮT BUỘC ĐỌC)

Trước khi bắt đầu thiết kế, bạn **PHẢI** nắm rõ các thông tin sau về hệ thống hiện tại. Đây là những thông tin đã được xác nhận từ source code, KHÔNG PHẢI assumption.

## 0.1 Tech Stack hiện tại

```text
Backend Framework  : FastAPI (Python)
ORM               : SQLAlchemy 2.0 (Mapped Column style)
Database           : PostgreSQL — database name: omni_platforms
Validation         : Pydantic v2 (pydantic-settings)
Auth               : JWT Bearer Token (HS256)
Token Encryption   : Fernet (symmetric encryption)
Background Jobs    : APScheduler (BackgroundScheduler)
Frontend           : React + Vite
Charts             : Chart.js + react-chartjs-2
Migration          : Manual SQL (chưa dùng Alembic)
```

## 0.2 PostgreSQL Multi-Schema Layout

Hệ thống sử dụng **multi-schema** PostgreSQL, KHÔNG phải single schema:

| Schema | Tables |
|---|---|
| `"Users"` (viết hoa U) | `users` |
| `"public"` | `email_verifications`, `oauth_states` |
| `"workspaces"` | `workspaces`, `workspace_members`, `posts`, `post_distributions`, `social_accounts`, `post_media`, `tasks`, `task_attachments`, `notifications`, `post_reviews` |

Các bảng mới cho Statistics module phải đặt vào schema phù hợp. Đề xuất nên đặt vào `"workspaces"` hoặc tạo schema mới `"analytics"` — hãy đánh giá và lựa chọn.

## 0.3 Primary Key Convention

Hầu hết bảng dùng UUID primary key với PostgreSQL function `uuidv7()`:

```python
id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
)
```

**Ngoại lệ duy nhất**: `workspace_uuid` dùng `String(16)` với function `generate_workspace_id()`:

```python
workspace_uuid: Mapped[str] = mapped_column(
    String(16), primary_key=True, server_default=text("public.generate_workspace_id()")
)
```

Bất kỳ bảng mới nào có FK tham chiếu `workspace_id` **phải dùng `String(16)`**, KHÔNG phải UUID.

## 0.4 Existing Social Infrastructure (ĐÃ TỒN TẠI)

### Bảng `workspaces.social_accounts`

ĐÃ TỒN TẠI với các fields:

```text
id                      : UUID (PK, uuidv7)
platform                : String(20) — 'facebook' | 'linkedin'
platform_account_id     : String — external platform account ID
display_name            : String
note                    : Text (nullable)
owner_type              : String(20) — 'workspace' | 'individual'
owner_id                : String — workspace_uuid hoặc str(user UUID)
connected_by            : UUID (FK → Users.users.users_uuid)
access_token_encrypted  : Text — Fernet encrypted
refresh_token_encrypted : Text — Fernet encrypted (nullable)
token_expires_at        : DateTime(timezone=True) (nullable)
status                  : String(20) — 'active' | 'inactive' | 'expired'
enabled_for_workspace   : Boolean — default true
created_at              : DateTime(timezone=True)
```

Polymorphic owner pattern: `owner_type='workspace'` → `owner_id = workspace_uuid (16-char)`.

**Statistics module phải REUSE bảng này làm FK, KHÔNG tạo bảng social_accounts mới.**

### Bảng `workspaces.post_distributions`

ĐÃ TỒN TẠI — liên kết `Post` ↔ `SocialAccount`:

```text
id            : UUID (PK, uuidv7)
post_id       : UUID (FK → workspaces.posts.id)
channel_id    : UUID (FK → workspaces.social_accounts.id)
status        : String(20) — 'pending' | 'published' | 'failed'
published_url : Text (nullable) — URL bài viết đã đăng
created_at    : DateTime(timezone=True)
```

Bảng này **rất quan trọng** cho Statistics module vì nó cho biết post nào đã được đăng lên platform nào. Analytics engine phải join `posts` ↔ `post_distributions` ↔ `social_accounts` để xây dựng timeline data.

### OAuth Providers ĐÃ TỒN TẠI

```text
distribution/oauth_providers.py — FacebookOAuthProvider, LinkedInOAuthProvider
distribution/service.py         — Service layer cho Distribution
distribution/router.py          — API router prefix: /api/v1/distribution/...
```

Statistics module nên **tái sử dụng pattern** từ distribution module (service layer, provider abstraction) thay vì tạo kiến trúc hoàn toàn mới.

### Fernet Token Encryption

Token của social accounts được mã hóa bằng **Fernet** (symmetric encryption). Key lưu trong `fernet_secret_key` (env variable).

**QUAN TRỌNG**: Nếu n8n cần đọc token để gọi Social API, n8n phải gọi **Internal API trên Backend** để Backend giải mã. **KHÔNG ĐƯỢC truyền Fernet key cho n8n.**

## 0.5 Authentication & Authorization (ĐÃ TỒN TẠI)

### JWT Authentication

```text
Login endpoint : /auth/login
Token type     : Bearer Token (HS256)
Dependency     : get_current_user() → returns User object
```

### RBAC — Runtime Role Inference

Hệ thống **KHÔNG** lưu role trong database column. Role được suy luận tại runtime qua `WorkspaceContext` dependency:

```python
@dataclass
class WorkspaceContext:
    workspace: Workspace
    role: str  # "manager" | "member"

def get_workspace_context(workspace_id, current_user, db) -> WorkspaceContext:
    workspace = db.get(Workspace, workspace_id)
    if workspace.manager_id == current_user.users_uuid:
        return WorkspaceContext(workspace=workspace, role="manager")
    membership = db.scalar(select(WorkspaceMember).where(...))
    if membership is not None:
        return WorkspaceContext(workspace=workspace, role="member")
    raise HTTPException(403)
```

Logic:
- Nếu user là `manager_id` của workspace → `role = "manager"`
- Nếu user có membership active trong `workspace_members` → `role = "member"`
- Ngược lại → 403 Forbidden

**Statistics endpoints cho client phải reuse `Depends(get_current_user)` và `Depends(get_workspace_context)`.** Internal APIs (cho n8n) cần cơ chế auth riêng (API Key / HMAC).

## 0.6 Post Status Enum

PostgreSQL Enum `post_status_enum` có các giá trị hợp lệ:

```text
draft | pending_review | rejected | ready_for_distribution | published | failed
```

**Statistics chỉ được tính trên bài viết có `posts.status = 'published'` VÀ `post_distributions.status = 'published'`.** Không bao gồm draft, pending_review, rejected, failed.

## 0.7 Existing Background Jobs

Backend đã sử dụng **APScheduler** cho internal scheduled tasks:

```python
scheduler = BackgroundScheduler()
scheduler.add_job(check_due_soon_tasks, "interval", hours=1)
```

Prompt phải phân biệt vai trò:

```text
n8n          → External data ingestion (Social API scraping, pagination, batching)
APScheduler  → Internal scheduled tasks (aggregation, token refresh, cleanup)
```

Hoặc đề xuất strategy consolidation nếu phù hợp.

## 0.8 Router Prefix Convention

| Router | Prefix |
|---|---|
| `auth.router` | `/auth` |
| `workspaces.router` | `/workspaces/{workspace_id}/...` |
| `posts.router` | `/posts/...` |
| `distribution_router` | `/api/v1/distribution/...` |

Chỉ distribution module dùng prefix `/api/v1/...`. Statistics module nên theo pattern `/api/v1/analytics/...` để nhất quán.

## 0.9 Frontend Integration Point

`Stamodule.jsx` hiện tại được gọi từ `MainDashboard.jsx`:

```jsx
<Stamodule user={user} />
```

**Vấn đề quan trọng**: Component chỉ nhận `user` prop, **KHÔNG có `workspace_id`**. Điều này có nghĩa Frontend hiện tại **không biết đang hiển thị statistics cho workspace nào**.

Khi kết nối Backend, cần refactor để truyền thêm `workspace_id` hoặc workspace context vào `Stamodule`. Hãy đề xuất approach phù hợp.

---

# 1. Frontend Codebase Analysis

Trước tiên hãy inspect `Stamodule.jsx` và tất cả file liên quan cần thiết để hiểu đầy đủ feature.

Phân tích:

- Component structure
- Props (lưu ý: hiện chỉ có `user`, thiếu `workspace_id`)
- State
- Mock data
- Constants
- Interfaces / Types nếu có
- Existing API calls
- Existing service layer
- Existing hooks
- Authentication information
- User/workspace information
- Social platform information
- Report data structure
- Chart configuration
- Dependencies như Chart.js, react-hot-toast hoặc các thư viện khác

Xác định chính xác:

- Frontend đang cần dữ liệu gì.
- Frontend đang giả lập dữ liệu gì.
- Frontend đang tính toán dữ liệu gì.
- Backend cần cung cấp dữ liệu gì.
- Dữ liệu nào nên chuyển từ Frontend sang Backend.

Tạo bảng:

| Frontend Feature | Frontend State/Data | Business Meaning | Backend Requirement | API cần thiết |
| ---------------- | ------------------- | ---------------- | ------------------- | ------------- |

Không được tự ý suy đoán nếu thông tin đã có trong source code.

---

# 2. Functional Requirements & RBAC

Hệ thống hiện tại có 2 role được suy luận tại runtime (xem Section 0.5):

```text
manager — user là manager_id của workspace
member  — user có active membership trong workspace_members
```

## Member

Member có thể:

- Xem statistics trong phạm vi được cấp quyền.
- Xem interaction của chính mình.
- Xem contribution của chính mình.
- Xem các report mà họ có quyền truy cập.
- Download các report được phép truy cập.

## Manager

Manager có thể:

- Xem tổng interaction của workspace.
- Xem contribution của từng member.
- Xem aggregated statistics của workspace.
- Generate report.
- Save report.
- View report history.
- Download report.
- Quản lý các report trong phạm vi quyền hạn.

Nếu muốn mở rộng thêm role:

```text
admin
analyst
viewer
...
```

thì cần thêm column `role` vào bảng `workspace_members` — hiện tại chưa có. Hãy đánh giá xem nên:

1. Thêm `role` column vào `workspace_members` ngay từ đầu.
2. Giữ nguyên logic runtime inference hiện tại và mở rộng sau.

Đồng thời phải chống:

- IDOR
- Privilege escalation
- Unauthorized workspace access
- Unauthorized report access

Đặc biệt:

> Member không được phép thay đổi `user_id`, `workspace_id`, `report_id` hoặc query parameter để truy cập dữ liệu của user/workspace khác.

---

# 3. System Architecture

Đề xuất architecture tổng thể của hệ thống.

Architecture phải phân tách rõ:

```text
n8n
= External Data Ingestion Orchestration (Social API scraping)

APScheduler (đã tồn tại trong Backend)
= Internal Scheduled Tasks (aggregation, cleanup, token refresh)

Backend (FastAPI)
= System of Record + Business Logic + API

Database (PostgreSQL: omni_platforms)
= Canonical Persisted Data (multi-schema)

Analytics Service
= Aggregation + Query Logic

AI Service
= Data Interpretation / Report Generation

React (Vite)
= Presentation Layer
```

Không đưa business logic quan trọng vào n8n.

## Nguyên tắc

n8n được phép thực hiện:

- Scheduling
- Extraction
- Pagination orchestration
- Retry workflow
- Lightweight mapping
- Batching
- Sending data to Backend

Backend phải chịu trách nhiệm:

- Authentication
- Authorization
- Schema validation
- Business validation
- Canonical normalization
- Metric calculation
- Aggregation
- Idempotency enforcement
- Persistence
- Data consistency
- Report logic

**Canonical business rules phải nằm ở Backend, không nằm độc quyền trong n8n.**

Ví dụ:

```text
engagement calculation
metric normalization
aggregation rules
permission rules
report snapshot rules
```

không được phụ thuộc vào logic chỉ tồn tại trong n8n.

Hãy cung cấp Mermaid System Architecture Diagram.

---

# 4. Analytics Dashboard & Aggregation Strategy

Frontend có Timeline Chart để theo dõi Facebook và LinkedIn.

Hỗ trợ:

```text
Weekly
Monthly
Yearly
```

Không hard-code aggregation chỉ dựa trên label.

Hãy định nghĩa rõ:

- Timeframe
- Date range
- Granularity
- Timezone
- Number of data points
- Grouping logic
- Aggregation formula

Đề xuất strategy phù hợp, ví dụ:

```text
Weekly
→ daily aggregation

Monthly
→ daily hoặc weekly aggregation

Yearly
→ monthly aggregation
```

Nhưng phải phân tích và lựa chọn dựa trên UX thực tế của Frontend.

Không mặc định rằng:

```text
Monthly = 4 weeks
```

nếu điều đó không phù hợp với date range thực tế.

Phải xử lý chính xác:

- 28 ngày
- 29 ngày
- 30 ngày
- 31 ngày
- Leap year

---

# 5. Timezone Strategy

Hãy thiết kế timezone strategy rõ ràng cho:

- Today
- Weekly
- Monthly
- Yearly
- Report period
- Data aggregation

Phân tích các timezone:

```text
UTC
System timezone
Workspace timezone (hiện tại chưa có field timezone trong bảng workspaces — cần đánh giá có nên thêm không)
User timezone
Social platform timezone
```

Đề xuất precedence rõ ràng.

Ví dụ:

```text
User timezone
    ↓
Workspace timezone
    ↓
System timezone (UTC)
```

Không để logic "Today" phụ thuộc vào timezone của server một cách vô tình.

Lưu ý: Bảng `workspaces` hiện tại KHÔNG có field `timezone`. Nếu cần, hãy đề xuất thêm column.

---

# 6. Metrics Definition & Normalization

Hệ thống có thể sử dụng các metrics:

```text
Impressions
Reach
Views
Likes
Reactions
Comments
Shares
Clicks
Engagements
Engagement Rate
Follower Growth
```

Không được dùng những thuật ngữ như:

```text
interaction
engagement
reach
attraction
```

một cách mơ hồ.

Hãy định nghĩa rõ:

- Metric meaning
- Source
- Unit
- Data type
- Whether cumulative or period-based
- Whether directly retrieved or calculated
- Calculation formula
- Platform compatibility

Ví dụ:

```text
engagements
= likes + comments + shares + clicks
```

hoặc:

```text
engagements
= platform-provided metric
```

Phải giải thích lựa chọn.

Không được tự âm thầm giả định công thức.

---

# 7. Snapshot vs Delta Metrics

Đây là requirement bắt buộc.

Phải phân biệt:

### Cumulative Metrics

Ví dụ:

```text
total likes on a post
total views on a post
total followers
```

### Point-in-Time Snapshot

Ví dụ:

```text
Post A
2026-08-01 → likes = 100

Post A
2026-08-02 → likes = 120
```

### Delta / Period Metrics

Ví dụ:

```text
daily likes gained = 20
```

Backend phải định nghĩa rõ cách tính:

```text
daily
weekly
monthly
yearly
```

từ snapshot/cumulative metrics.

Không được cộng trực tiếp:

```text
100 + 120 = 220
```

nếu 100 và 120 là cumulative snapshots.

Hãy thiết kế data model để tránh double counting.

---

# 8. Overview & Doughnut Charts

Frontend có Doughnut Charts cho:

- Facebook
- LinkedIn
- Other

Backend phải trả:

- Total reach/impressions nếu phù hợp
- Total engagements
- Percentage contribution
- Platform comparison

Xử lý các trường hợp:

- Không có dữ liệu
- Tổng = 0
- Một platform không có dữ liệu
- Social API lỗi
- Partial data

Percentage phải được tính nhất quán ở Backend.

---

# 9. Today Card

Backend phải hỗ trợ Today Statistics theo role.

### Member

Có thể xem:

```text
Personal interactions today
Personal contribution
```

### Manager

Có thể xem:

```text
Total workspace interactions today
Individual contribution
Workspace statistics
```

Xác định chính xác:

- Date boundary
- Timezone
- Metric aggregation
- Authorization scope (phải dùng `workspace_id` — Frontend hiện thiếu prop này)

---

# 10. Highest-Engaging Posts

Frontend có chức năng:

```text
Top 7 Posts
```

Backend phải hỗ trợ:

- `limit`
- Platform filter
- Date range
- Sorting
- Workspace/user scope
- Engagement metric

Default:

```text
limit = 7
```

nhưng không hard-code.

Mỗi post nên có:

```text
post_id
platform
platform_post_id
author
title / preview
published_at
url (từ post_distributions.published_url)
engagement_metrics
engagement_rate
thumbnail (từ post_media.image_url nếu có)
```

Hãy phân tích thêm field nào Frontend thực sự cần từ source code.

Lưu ý: Bảng `workspaces.post_media` tồn tại và chứa hình ảnh/attachment của bài viết. Có thể dùng cho thumbnail trong danh sách top posts.

---

# 11. n8n Data Ingestion Architecture

Hệ thống sử dụng **n8n làm Data Ingestion Worker / Orchestrator** cho external Social API data.

Flow mục tiêu:

```text
Facebook Graph API
        ↓
       n8n

LinkedIn API
        ↓
       n8n
        ↓
Batch / Normalize lightweight
        ↓
Internal Ingestion API (Backend)
        ↓
Backend validates, normalizes, persists
```

n8n chịu trách nhiệm:

- Cron / Schedule
- API request (sử dụng token được cung cấp qua Internal API — KHÔNG giải mã Fernet trực tiếp)
- Pagination
- Retry
- Workflow execution
- Lightweight transformation
- Batching
- Sending payload

Backend chịu trách nhiệm:

- Validate
- Normalize canonical schema
- Business validation
- Idempotency
- Persist
- Aggregate

**n8n cần token để gọi Social API**: n8n phải gọi Internal API trên Backend (ví dụ `GET /api/v1/internal/tokens/{social_account_id}`) để Backend giải mã Fernet token và trả về. Token KHÔNG được lưu trữ vĩnh viễn bên n8n.

---

# 12. Raw Ingestion & Replay

Không chỉ ghi dữ liệu trực tiếp vào canonical tables.

Đề xuất pipeline:

```text
Social API
    ↓
n8n
    ↓
Internal Ingestion API
    ↓
Raw / Staging Layer
    ↓
Validation
    ↓
Normalization
    ↓
Canonical Database
    ↓
Aggregation
```

Hãy đánh giá việc sử dụng các entity như:

```text
ingestion_runs
ingestion_events
raw_social_payloads
```

để hỗ trợ:

- Debugging
- Audit
- Replay
- Reprocessing
- Data lineage
- Version migration

Nếu raw payload không nên lưu toàn bộ do vấn đề privacy/storage/cost, hãy đề xuất strategy thay thế.

---

# 13. n8n Data Contract

Thiết kế **Standard Ingestion JSON Schema**.

Payload nên có metadata tối thiểu:

```text
schema_version
platform
social_account_id (FK → workspaces.social_accounts.id)
external_account_id (= social_accounts.platform_account_id)
external_post_id
metric_date
fetched_at
source_timezone
source_api_version
ingestion_run_id
workflow_id
execution_id
payload
```

Phải hỗ trợ schema versioning:

```text
schema_version: "1.0"
```

để sau này thay đổi contract mà vẫn backward compatible.

Tách rõ:

```text
source data
vs
normalized data
```

---

# 14. Idempotency

Thiết kế cơ chế idempotency để n8n retry không tạo duplicate.

Phân tích các lựa chọn.

Ví dụ candidate key:

```text
platform
+
social_account_id
+
external_post_id
+
metric_date
```

hoặc:

```text
ingestion_run_id
+
external_record_id
```

Database phải có:

- Unique constraints
- Upsert strategy
- Duplicate detection
- Retry-safe ingestion

Hãy giải thích idempotency strategy cụ thể.

---

# 15. Batch Ingestion

Internal ingestion API phải hỗ trợ batch.

Không nên thiết kế architecture yêu cầu n8n gọi API một lần cho từng record nếu không cần thiết.

Ví dụ:

```text
POST /api/v1/internal/ingest/metrics
```

có thể nhận:

```json
{
  "schema_version": "1.0",
  "platform": "facebook",
  "ingestion_run_id": "run_123",
  "records": []
}
```

Hãy thiết kế:

- Batch size
- Validation
- Partial failure handling
- Transaction strategy
- Retry
- Response format

---

# 16. Social Media Integration

Hệ thống đã có sẵn OAuth provider pattern trong `distribution/oauth_providers.py`:

```text
FacebookOAuthProvider   — Facebook OAuth 2.0 flow, Graph API v19.0
LinkedInOAuthProvider   — LinkedIn OAuth 2.0 flow
```

Với `TokenExchangeResult` dataclass:

```text
platform_account_id
display_name
access_token
refresh_token (nullable)
token_expires_at (nullable)
```

Hãy **tái sử dụng và mở rộng** pattern hiện tại thay vì tạo abstraction hoàn toàn mới. Ví dụ có thể thêm method `fetch_post_insights()`, `fetch_page_insights()` vào các provider class hiện có.

Nếu cần abstraction mới, thiết kế sao cho sau này dễ thêm:

```text
Instagram
YouTube
TikTok
...
```

mà không thay đổi lớn Core Business Logic.

Phân tích cho mỗi platform:

- Authentication (đã có OAuth flow)
- Permissions cần thiết cho Statistics
- Access Token management (Fernet encrypted — đã có)
- Token expiration & refresh strategy
- Pagination
- Rate limit
- Retry
- Timeout
- API version
- Error mapping
- Data mapping

---

# 17. Database Design

Hệ thống **ĐÃ CÓ** các bảng sau (KHÔNG tạo lại):

```text
ĐÃ TỒN TẠI — REUSE:
  "Users".users
  "workspaces".workspaces
  "workspaces".workspace_members
  "workspaces".social_accounts
  "workspaces".posts
  "workspaces".post_distributions
  "workspaces".post_media
```

Bắt đầu xem xét các entity **MỚI CẦN TẠO**:

```text
engagement_metrics     — Raw/normalized metrics per post per platform per day
analytics_snapshots    — Point-in-time metric snapshots
reports                — Saved report metadata + AI content
report_exports         — Generated file exports (PDF, DOCX, etc.)
ingestion_runs         — n8n ingestion run tracking
ingestion_events       — Per-record ingestion event log
raw_social_payloads    — Raw API response storage (optional, for replay)
```

Nhưng **không giới hạn database chỉ ở các bảng trên**.

Nếu architecture cần thêm entity, hãy chủ động đề xuất.

Với mỗi bảng mới hãy mô tả:

- Purpose
- Schema placement (ví dụ `"workspaces"` hoặc `"analytics"`)
- Column
- Data type
- Primary Key (convention: UUID + `uuidv7()`)
- Foreign Key (lưu ý: `workspace_id` là `String(16)`, KHÔNG phải UUID)
- Nullable
- Unique constraints
- Indexes
- Relationship
- Retention
- Data lifecycle

Tối ưu cho:

- date range
- platform
- workspace
- user
- social account
- top posts
- analytics queries
- report history
- ingestion queries

Cần phân tích:

- Wide-table metrics
- Key-value metrics
- Hybrid model

và lựa chọn mô hình phù hợp nhất với hệ thống.

---

# 18. ERD

Cung cấp:

```text
Mermaid ER Diagram
```

Phải thể hiện:

- Users (existing)
- Workspaces (existing)
- Workspace members (existing)
- Social accounts (existing)
- Posts (existing)
- Post distributions (existing)
- Post media (existing)
- Metrics (new)
- Analytics snapshots (new)
- Reports (new)
- Ingestion entities (new)
- Relationships giữa existing và new entities

Phân biệt rõ bảng `existing` và bảng `new` trong diagram.

---

# 19. RESTful API Specification

Version tất cả API:

```text
/api/v1/...
```

## Client APIs (dùng `Depends(get_current_user)` + `Depends(get_workspace_context)`)

Tối thiểu:

```text
GET  /api/v1/analytics/{workspace_id}/timeline
GET  /api/v1/analytics/{workspace_id}/overview
GET  /api/v1/analytics/{workspace_id}/top-posts
GET  /api/v1/analytics/{workspace_id}/today

POST /api/v1/reports/{workspace_id}/generate
POST /api/v1/reports/{workspace_id}

GET  /api/v1/reports/{workspace_id}
GET  /api/v1/reports/{workspace_id}/{report_id}
GET  /api/v1/reports/{workspace_id}/{report_id}/download
DELETE /api/v1/reports/{workspace_id}/{report_id}
```

## Internal APIs cho n8n (dùng API Key / HMAC — KHÔNG dùng JWT user token)

Tối thiểu:

```text
POST /api/v1/internal/ingest/metrics
POST /api/v1/internal/ingest/posts
GET  /api/v1/internal/tokens/{social_account_id}
```

Có thể đề xuất:

```text
POST /api/v1/internal/ingest
```

nếu batch unified endpoint phù hợp hơn.

---

# 20. API Contract

Với mỗi endpoint phải mô tả:

- Purpose
- HTTP Method
- Path
- Authentication (`Depends(get_current_user)` cho client, API Key cho internal)
- Authorization (`Depends(get_workspace_context)` — role-based filtering)
- Query Parameters
- Request Body
- Response JSON
- Pagination
- Validation
- Status Codes
- Error response
- Idempotency nếu cần

Response phải được thiết kế dựa trên **data contract thực tế của Frontend**, không chỉ tạo API CRUD chung chung.

---

# 21. Internal API Security

Đối với:

```text
n8n → Backend
```

hãy phân tích và lựa chọn cơ chế phù hợp giữa:

- Bearer token
- API secret
- HMAC signature
- Timestamp + nonce
- IP allowlist
- mTLS nếu cần

Không nhất thiết dùng tất cả.

Hãy đánh giá dựa trên:

- n8n Cloud
- Self-hosted n8n
- Deployment architecture
- Threat model

Phải chống:

- Replay attack
- Unauthorized ingestion
- Payload tampering
- Token leakage

**Lưu ý**: Token của social accounts đã được mã hóa bằng Fernet. Internal API phải đảm bảo chỉ trả decrypted token cho authenticated n8n caller, và token response phải có TTL ngắn.

---

# 22. AI Statistical Report Engine

Flow:

```text
User selects timeframe
        ↓
Backend determines period
        ↓
Get analytics (từ existing tables + new metrics tables)
        ↓
Create structured context
        ↓
AI Provider
        ↓
Validate output
        ↓
Return / persist
```

AI providers:

```text
OpenAI
Gemini
```

Thiết kế abstraction:

```text
AIProvider
├── OpenAIProvider
└── GeminiProvider
```

Business logic không được phụ thuộc trực tiếp vào một provider.

---

# 23. AI Input Context

Thiết kế JSON context tối ưu token.

Ví dụ:

```json
{
  "schema_version": "1.0",
  "timeframe": "monthly",
  "period": {
    "start": "2026-07-01",
    "end": "2026-07-31",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "workspace_id": "abc123def456",
  "platforms": {},
  "totals": {},
  "trends": {},
  "top_posts": []
}
```

Hãy thiết kế schema hoàn chỉnh.

Không gửi dữ liệu thừa nếu không cần thiết.

---

# 24. AI Output

Không sử dụng plain text tự do làm source of truth.

Ưu tiên:

```json
{
  "summary": "...",
  "key_metrics": [],
  "platform_comparison": [],
  "trends": [],
  "insights": [],
  "recommendations": []
}
```

Output phải:

- JSON Schema validated
- Versioned
- Parseable
- Deterministic về mặt structure

---

# 25. AI Guardrails

AI không phải source of truth.

Backend là source of truth cho metrics.

AI:

- Không được bịa số liệu.
- Không được thay đổi raw metrics.
- Không được tự tạo metrics không tồn tại.
- Không được coi assumption là fact.
- Không được đưa ra số liệu không có trong context.
- Nếu thiếu dữ liệu phải nói rõ.
- Chỉ được diễn giải dữ liệu Backend cung cấp.

Không nói "ngăn chặn hallucination 100%".

Thay vào đó, thiết kế:

- Structured input
- Deterministic metrics
- JSON schema validation
- Factual constraints
- Post-generation validation
- Numeric consistency checks

---

# 26. AI Report Generation: Sync vs Async

Hãy đánh giá cả hai mô hình:

### Synchronous

```text
POST /reports/generate
↓
AI
↓
Response
```

### Asynchronous

```text
POST /reports/generate
↓
Create Job
↓
202 Accepted
↓
Background Worker (APScheduler hoặc FastAPI BackgroundTasks)
↓
AI
↓
Validate
↓
Persist
```

Hãy lựa chọn mô hình phù hợp với production.

Nếu async phù hợp, hãy thiết kế:

```text
report_job
status
progress
error
```

và API kiểm tra status.

Lưu ý: Backend đã có APScheduler. Nếu dùng async, có thể tận dụng APScheduler hoặc FastAPI BackgroundTasks.

---

# 27. AI Cost & Reliability

Phải đề xuất:

- Caching
- Prompt optimization
- Token optimization
- Rate limiting
- Retry
- Timeout
- Circuit breaker nếu phù hợp
- Provider fallback
- Model selection
- Cost tracking

Nếu AI provider lỗi:

- Không làm crash toàn bộ Statistics Module.
- Có fallback response rõ ràng.
- Không lưu report không hợp lệ.

---

# 28. Report Management

Report lifecycle:

```text
Generate
↓
Validate
↓
Preview
↓
Save
↓
History
↓
View
↓
Download
```

Phân biệt rõ:

```text
Raw Metrics
Aggregated Analytics
Report Snapshot
AI Report Content
Exported Document
```

Report Snapshot phải phản ánh dữ liệu tại thời điểm report được tạo.

Không phụ thuộc vào việc metrics trong database có thay đổi sau đó.

---

# 29. Report Export

Frontend có:

```text
Document Download
```

Hãy thiết kế hỗ trợ:

```text
PDF
DOCX
JSON
```

nếu phù hợp.

Phân tích:

- Synchronous vs asynchronous export
- File generation
- Storage
- File naming
- Content type
- Access control
- Expiration
- Download authorization

---

# 30. Security

Phải phân tích:

- Authentication (JWT Bearer — đã có, reuse `get_current_user`)
- RBAC (runtime inference via `WorkspaceContext` — đã có, reuse `get_workspace_context`)
- Object-level authorization
- IDOR
- Input validation
- Rate limiting
- Secret management (Fernet key, JWT secret, AI API keys — tất cả qua env vars)
- Access token protection (Fernet encrypted — đã có)
- AI API key protection
- CORS (đã configured trong main.py)
- CSRF nếu phù hợp
- Audit logging
- Sensitive data protection

Không lưu:

```text
Access Token
AI API Key
Secret
```

trực tiếp trong source code. Tất cả phải qua environment variables (`.env` file với `pydantic-settings`).

---

# 31. Performance & Scalability

Phân tích hệ thống khi:

```text
Posts = millions
Metrics = millions / tens of millions
Reports = large volume
```

Đề xuất nếu phù hợp:

- Indexing
- Composite indexes
- Partitioning
- Aggregation tables
- Materialized views
- Redis Cache
- Background jobs (APScheduler đã có, hoặc Celery nếu cần)
- Queue
- Batch processing
- Pagination
- Query optimization
- Connection pooling

Đặc biệt phân tích:

> Có nên gọi Facebook/LinkedIn API mỗi lần user mở Dashboard không?

Và so sánh:

```text
On-demand fetch
vs
Scheduled ingestion (n8n)
vs
Hybrid
```

---

# 32. Error Handling

Thiết kế error strategy cho:

- Facebook API failure
- LinkedIn API failure
- Token expired (Fernet decryption vẫn OK, nhưng Social API reject token)
- Rate limit
- Timeout
- Invalid payload
- Duplicate ingestion
- Partial batch failure
- No data
- AI timeout
- AI invalid JSON
- DB failure
- Report generation failure
- File generation failure

Phân loại:

```text
Retryable
Non-retryable
User-facing
Internal
```

---

# 33. Observability

Do hệ thống có n8n + Backend (FastAPI) + Social APIs + AI, hãy đề xuất:

- Structured logging
- Request ID
- Correlation ID
- Ingestion Run ID
- Metrics
- Error tracking
- Audit logs
- n8n execution tracking
- API latency monitoring
- AI latency/cost tracking

Có thể dùng:

```text
trace_id
workflow_id
execution_id
ingestion_run_id
```

để trace một record từ Social API đến Dashboard.

---

# 34. Frontend Integration & Refactor

Map từng UI component trong `Stamodule.jsx` với:

- Endpoint
- Request
- Response
- State
- Loading state
- Empty state
- Error state
- Refetch
- Caching

**Bắt buộc**: Đề xuất cách truyền `workspace_id` vào `Stamodule.jsx` (hiện tại component chỉ nhận `user` prop).

Có thể đề xuất:

- Custom Hooks
- TanStack Query / React Query
- Axios Client
- API Service Layer
- TypeScript types
- Centralized error handling

Nhưng:

> Chỉ refactor Frontend khi thực sự cần thiết để kết nối Backend.

Không thay đổi UI chỉ vì sở thích kiến trúc.

---

# 35. Testing Strategy

## Unit Tests

Test:

- Metric calculation
- Snapshot-to-delta calculation
- Aggregation
- Timezone logic
- Permission logic (WorkspaceContext role inference)
- RBAC
- Idempotency
- AI JSON validator
- Report snapshot

## Integration Tests

Test:

- Database (PostgreSQL multi-schema)
- n8n ingestion API
- Facebook adapter (extend existing FacebookOAuthProvider)
- LinkedIn adapter (extend existing LinkedInOAuthProvider)
- AI provider
- Report generation

## API Tests

Test:

- Authentication (JWT Bearer)
- Authorization (WorkspaceContext — manager vs member)
- Validation
- Pagination
- Date filtering
- Error cases

## Mock Tests

Mock:

- Facebook API
- LinkedIn API
- n8n payload
- AI timeout
- AI invalid response

Đặc biệt phải test:

- Duplicate n8n payload
- Retry ingestion
- Partial batch failure
- Token expired
- Platform API failure
- No data
- AI timeout
- AI invalid JSON
- Unauthorized member access (IDOR prevention)

---

# 36. Implementation Roadmap

Chia implementation thành các phase có dependency rõ ràng.

Ví dụ:

```text
Phase 1  — Frontend Codebase Analysis
Phase 2  — Architecture & Data Contract
Phase 3  — Database Schema (new tables only, reuse existing)
Phase 4  — Extend Authentication & RBAC for Statistics
Phase 5  — n8n Ingestion Infrastructure
Phase 6  — Extend Social Media Adapters (reuse oauth_providers.py)
Phase 7  — Raw Ingestion & Normalization
Phase 8  — Analytics & Aggregation
Phase 9  — Analytics REST API
Phase 10 — AI Report Engine
Phase 11 — Report Management
Phase 12 — Report Export
Phase 13 — Frontend Integration (add workspace_id prop + API calls)
Phase 14 — Testing
Phase 15 — Performance & Production Hardening
```

Với mỗi phase phải ghi:

- Objective
- Tasks
- Dependencies
- Modules/files cần tạo hoặc sửa (lưu ý: existing files KHÔNG được sửa mà không nêu rõ lý do)
- Expected output
- Acceptance criteria

---

# 37. Acceptance Criteria

Hãy tạo checklist hoàn chỉnh.

Ví dụ:

- [ ] Manager xem được workspace-wide statistics.
- [ ] Member chỉ xem được dữ liệu được cấp quyền.
- [ ] IDOR được ngăn chặn.
- [ ] Weekly analytics đúng aggregation.
- [ ] Monthly analytics đúng aggregation.
- [ ] Yearly analytics đúng aggregation.
- [ ] Timezone được xử lý nhất quán.
- [ ] Snapshot và delta được phân biệt.
- [ ] Không xảy ra double counting.
- [ ] n8n ingestion hỗ trợ retry an toàn.
- [ ] Duplicate ingestion không tạo duplicate record.
- [ ] Raw payload có thể trace/replay nếu architecture lưu raw data.
- [ ] Metrics được normalize về canonical model.
- [ ] Top posts hoạt động theo dynamic limit.
- [ ] AI report chỉ phân tích dữ liệu Backend cung cấp.
- [ ] AI output được JSON Schema validate.
- [ ] Invalid AI response không được lưu.
- [ ] Report snapshot độc lập với dữ liệu thay đổi sau này.
- [ ] Report có thể Save.
- [ ] Report History hoạt động.
- [ ] Report có thể Download.
- [ ] Social API failure không làm Dashboard crash.
- [ ] AI provider failure có fallback.
- [ ] Access Tokens không xuất hiện trong source code.
- [ ] Fernet key không được truyền cho n8n.
- [ ] Internal ingestion API được bảo vệ.
- [ ] Có Unit / Integration / API tests.
- [ ] Architecture có khả năng scale khi dữ liệu tăng lên hàng triệu records.
- [ ] Statistics chỉ tính trên posts có status = 'published'.
- [ ] Workspace context (workspace_id) được truyền đúng từ Frontend.

---

# 38. Assumptions

Tạo riêng phần:

```text
Assumptions
```

Phân loại:

### Confirmed

Thông tin chắc chắn lấy từ Frontend/Backend source code.

Tối thiểu phải include:

- Database: PostgreSQL `omni_platforms`, multi-schema
- ORM: SQLAlchemy 2.0
- Auth: JWT Bearer Token
- RBAC: Runtime inference via `WorkspaceContext` (không lưu role trong DB)
- Token encryption: Fernet
- Social accounts: đã tồn tại với OAuth flow
- Post distributions: đã tồn tại
- Background jobs: APScheduler đã có
- PK convention: UUID + `uuidv7()`
- workspace_id: String(16), không phải UUID
- Post status enum: draft | pending_review | rejected | ready_for_distribution | published | failed

### Assumed

Thông tin chưa được xác nhận nhưng cần thiết để thiết kế.

### Recommended

Quyết định architecture mà bạn đề xuất.

Không biến assumption thành fact.

---

# 39. Risk Assessment

Tạo bảng:

| Risk | Impact | Probability | Mitigation |
| ---- | ------ | ----------- | ---------- |

Phải xem xét tối thiểu:

- Facebook API changes
- LinkedIn API changes
- Token expiration
- Rate limiting
- n8n workflow failure
- Duplicate ingestion
- Data inconsistency
- Snapshot/delta calculation errors
- AI hallucination
- AI cost
- AI provider downtime
- Database growth
- Security breach
- Performance degradation
- Report generation timeout
- Fernet key rotation

---

# 40. Final Response Format

Phản hồi đầu tiên phải theo đúng thứ tự:

## 1. Frontend Analysis & Requirement Mapping

## 2. System Architecture Proposal

Bao gồm Mermaid Architecture Diagram.

## 3. Data Ingestion Architecture

Bao gồm:

```text
Facebook/LinkedIn
→ n8n
→ Internal API (Backend)
→ Raw/Staging
→ Normalization
→ Database (omni_platforms)
```

## 4. Data Model & ERD

Bao gồm Mermaid ERD (phân biệt existing vs new tables).

## 5. Metrics Definition & Aggregation Strategy

Bao gồm:

- Snapshot
- Delta
- Normalization
- Timezone
- Weekly/Monthly/Yearly

## 6. n8n Data Contract

Bao gồm:

- JSON Schema
- Idempotency
- Batch strategy
- Versioning

## 7. RESTful & Internal API Specifications

Bao gồm request/response JSON.

## 8. AI Report Architecture

Bao gồm:

- Input schema
- Output schema
- Guardrails
- Validation
- Retry
- Caching
- Cost optimization
- Sync vs Async

## 9. Security, Performance & Error Handling

## 10. Frontend Integration Plan

Bao gồm: approach cho truyền `workspace_id` vào `Stamodule.jsx`.

## 11. Testing Strategy

## 12. Implementation Roadmap

## 13. Acceptance Criteria

## 14. Assumptions

## 15. Risk Assessment

## 16. Recommended Next Step

---

# FINAL CONSTRAINT

**Không viết implementation code trong phản hồi đầu tiên.**

Không tự ý sửa Frontend.

Không tự ý tạo database migration.

Không tự ý tạo Backend files.

Mục tiêu của phản hồi đầu tiên là tạo ra một:

> **Production-ready Technical Blueprint**

đủ chi tiết để một Backend Developer có thể bắt đầu implementation mà **không phải tự đoán các quyết định kiến trúc quan trọng**.

Nếu phát hiện Frontend hiện tại có vấn đề về architecture, hãy nêu:

```text
Problem
Impact
Recommendation
Required / Optional
```

Nếu nội dung quá dài, hãy ưu tiên hoàn thành đầy đủ các phần:

```text
1 → 8
```

trước, sau đó dừng lại và thông báo tôi gửi lệnh:

```text
Continue
```

để tiếp tục các phần còn lại.
