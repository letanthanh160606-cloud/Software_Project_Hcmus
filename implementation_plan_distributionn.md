# Distribution Module — Backend Implementation Plan

## Goal

Build the complete Backend module for the **Distribution** feature (Connected Channels management) following **Clean Architecture** with 4 layers: Router → Service → Repository → Model. This enables Manager, Individual, and Member users to manage social media channel connections (Facebook, LinkedIn) via OAuth 2.0.

---

## User Review Required

> [!IMPORTANT]
> **Facebook & LinkedIn App Credentials**: You need to create developer apps on both platforms and provide:
> - `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
> - `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
> - `OAUTH_REDIRECT_URI` (e.g. `http://localhost:8000/api/v1/distribution/channels/connect/callback`)
>
> Without these, the OAuth flow will use **Dev/Mock mode** (simulates token exchange) so you can still test the full API flow locally.

> [!IMPORTANT]
> **Token Encryption Key**: A `FERNET_SECRET_KEY` will be auto-generated on first run if not set in `.env`. In production, this MUST be a fixed, securely stored key — losing it means all stored tokens become unreadable.

> [!WARNING]
> **Existing `SocialAccount` model**: The current model at [models.py:L120-L134](file:///d:/Study_Work/Hcmus/Nhập%20môn%20công%20nghệ%20phần%20mềm%20-%2024C08/Software_Project_Hcmus/src/backend/app/models.py#L120-L134) will be **replaced in-place** with an upgraded version that adds encrypted token fields, `owner_type`, `enabled_for_workspace`, `note`, and `token_expires_at`. The existing `workspace_id` + `user_id` columns are kept but reinterpreted via the `owner_type` discriminator.

## Open Questions

> [!IMPORTANT]
> **Post ↔ Channel linkage for the 409 delete guard**: The current `Post` model has no FK to `social_accounts`. For the "block delete if channel has pending posts" constraint, should we:
> - **(A)** Create a new junction table `post_distributions` linking posts to channels? (Recommended — needed for future "distribute post to selected channels" feature)
> - **(B)** Add a `target_channel_id` FK directly on `Post`?
> - **(C)** Skip the 409 guard for now and add it when the post-distribution flow is built?
>
> **Recommendation**: Option **(A)** is the most future-proof. The plan below assumes **(A)** by creating a lightweight `PostDistribution` model. If you prefer **(C)**, I will omit it.

---

## Proposed Changes

### 1. Configuration & Dependencies

#### [MODIFY] [config.py](file:///d:/Study_Work/Hcmus/Nhập%20môn%20công%20nghệ%20phần%20mềm%20-%2024C08/Software_Project_Hcmus/src/backend/app/config.py)
Add OAuth and encryption settings:
```python
# Facebook OAuth
facebook_app_id: str = ""
facebook_app_secret: str = ""
# LinkedIn OAuth
linkedin_client_id: str = ""
linkedin_client_secret: str = ""
# OAuth redirect
oauth_redirect_uri: str = "http://localhost:8000/api/v1/distribution/channels/connect/callback"
# Token encryption
fernet_secret_key: str = ""  # Auto-generated if empty
# OAuth state expiry
oauth_state_expire_seconds: int = 300  # 5 minutes
```

#### [MODIFY] [.env](file:///d:/Study_Work/Hcmus/Nhập%20môn%20công%20nghệ%20phần%20mềm%20-%2024C08/Software_Project_Hcmus/src/backend/.env)
Add placeholder keys (empty = Dev/Mock mode):
```
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
OAUTH_REDIRECT_URI=http://localhost:8000/api/v1/distribution/channels/connect/callback
FERNET_SECRET_KEY=
```

---

### 2. Database Models

#### [MODIFY] [models.py](file:///d:/Study_Work/Hcmus/Nhập%20môn%20công%20nghệ%20phần%20mềm%20-%2024C08/Software_Project_Hcmus/src/backend/app/models.py)

**Replace `SocialAccount`** (L120-L134) with the upgraded version:

```python
class SocialAccount(Base):
    """
    Represents a connected social media channel.
    
    owner_type + owner_id = polymorphic owner pattern:
    - owner_type='workspace', owner_id=workspace_uuid → owned by a Workspace (Manager controls)
    - owner_type='individual', owner_id=user_uuid    → owned by an Individual user
    
    Tokens are Fernet-encrypted at rest; NEVER exposed in API responses.
    """
    __tablename__ = "social_accounts"
    __table_args__ = {"schema": "workspaces"}

    id: UUID PK (uuidv7)
    platform: Enum('facebook','linkedin')
    platform_account_id: str
    display_name: str
    note: str | None
    
    owner_type: Enum('workspace','individual')
    owner_id: str  # workspace_uuid (16-char) or user_uuid (UUID as str)
    connected_by: UUID FK → Users.users
    
    access_token_encrypted: str | None
    refresh_token_encrypted: str | None
    token_expires_at: datetime | None
    
    status: Enum('active','inactive','expired'), default='active'
    enabled_for_workspace: bool, default=True  # Only meaningful when owner_type='workspace'
    
    created_at: datetime
```

**Add `PostDistribution`** junction table (for 409 delete guard):

```python
class PostDistribution(Base):
    """Links a Post to the SocialAccount(s) it is targeted for distribution."""
    __tablename__ = "post_distributions"
    __table_args__ = {"schema": "workspaces"}

    id: UUID PK
    post_id: UUID FK → posts.id
    channel_id: UUID FK → social_accounts.id
    status: str  # 'pending', 'published', 'failed'
    created_at: datetime
```

**Add `OAuthState`** for CSRF protection:

```python
class OAuthState(Base):
    """Temporary OAuth state tokens for CSRF protection during OAuth flow."""
    __tablename__ = "oauth_states"
    __table_args__ = {"schema": "public"}

    state: str PK
    user_id: UUID FK → Users.users
    platform: str
    metadata_json: JSONB | None  # stores note, channel_name from initiate
    expires_at: datetime
    created_at: datetime
```

---

### 3. Clean Architecture — New Files

#### [NEW] `src/backend/app/distribution/` — Module Directory

```
app/distribution/
├── __init__.py
├── schemas.py          # Pydantic schemas (request/response)
├── repository.py       # Data access layer (DB queries)
├── service.py          # Business logic layer
├── router.py           # FastAPI router (presentation)
├── token_encryption.py # Fernet encrypt/decrypt helpers
└── oauth_providers.py  # Facebook & LinkedIn OAuth helpers
```

---

#### [NEW] `distribution/schemas.py`

| Schema | Purpose |
|--------|---------|
| `ChannelInitiateRequest` | Query params: `platform`, optional `note`, `channel_name` |
| `ChannelInitiateResponse` | Returns `authorization_url` + `state` |
| `OAuthCallbackParams` | Query params: `code`, `state` |
| `ChannelResponse` | Full channel info — **NO tokens** |
| `ChannelListResponse` | `channels: list[ChannelResponse]`, `total: int` |
| `ChannelUpdateRequest` | Optional `display_name`, `note` |
| `ChannelToggleWorkspaceResponse` | `enabled_for_workspace: bool` |

---

#### [NEW] `distribution/token_encryption.py`

- Uses `cryptography.fernet.Fernet` for symmetric encryption of OAuth tokens
- `encrypt_token(plaintext) → ciphertext`
- `decrypt_token(ciphertext) → plaintext`
- Key sourced from `settings.fernet_secret_key`; auto-generates and warns if empty

---

#### [NEW] `distribution/oauth_providers.py`

Two provider classes with identical interface:

```python
class FacebookOAuth:
    def get_authorization_url(state: str) → str
    def exchange_code(code: str) → TokenResult
    def get_pages(user_token: str) → list[PageInfo]  # FB-specific
    def exchange_for_page_token(user_token, page_id) → str

class LinkedInOAuth:
    def get_authorization_url(state: str) → str
    def exchange_code(code: str) → TokenResult
    def get_profile(token: str) → ProfileInfo
```

- All external HTTP calls use `httpx` (already installed)
- Errors from FB/LI APIs → logged internally, raised as `OAuthProviderError` → router maps to 502/503
- **Dev/Mock mode**: When `app_id`/`client_id` is empty, returns simulated tokens and fake page lists for local testing

---

#### [NEW] `distribution/repository.py`

Pure data-access functions (no business logic):

```python
def create_channel(db, **kwargs) → SocialAccount
def get_channel_by_id(db, channel_id) → SocialAccount | None
def list_channels_by_owner(db, owner_type, owner_id) → list[SocialAccount]
def list_workspace_enabled_channels(db, workspace_id) → list[SocialAccount]
def update_channel(db, channel, updates) → SocialAccount
def delete_channel(db, channel) → None
def save_oauth_state(db, state, user_id, platform, metadata, expires_at) → OAuthState
def get_and_validate_oauth_state(db, state) → OAuthState | None
def delete_oauth_state(db, state) → None
def count_active_post_distributions(db, channel_id) → int
```

---

#### [NEW] `distribution/service.py`

Business logic orchestration:

```python
class DistributionService:
    def initiate_connection(user, platform, note, channel_name) → (auth_url, state)
        # 1. Generate cryptographic state token
        # 2. Save OAuthState with user_id, platform, metadata
        # 3. Build authorization URL via oauth_providers
        # 4. Return URL + state

    def complete_connection(code, state) → ChannelResponse
        # 1. Validate state (exists, not expired, CSRF check)
        # 2. Exchange code → tokens via oauth_providers
        # 3. For FB: exchange to Page Token, get page list
        # 4. Encrypt tokens via token_encryption
        # 5. Determine owner_type/owner_id from user's role
        # 6. Create SocialAccount record
        # 7. Delete used OAuthState
        # 8. Return channel (without tokens)

    def list_channels(user, role, workspace_id?) → list[ChannelResponse]
        # Manager: all channels where owner_type='workspace' AND owner_id=workspace_id
        # Individual: all channels where owner_type='individual' AND owner_id=user_id
        # Member: workspace channels WHERE enabled_for_workspace=True

    def toggle_workspace_enable(user, channel_id) → bool
        # 1. Get channel, verify owner_type='workspace'
        # 2. Verify user is manager of that workspace
        # 3. Toggle enabled_for_workspace
        # 4. Return new value

    def update_channel(user, channel_id, updates) → ChannelResponse
        # 1. Get channel, verify ownership
        # 2. Update display_name / note
        # 3. Return updated channel

    def delete_channel(user, channel_id) → None
        # 1. Get channel, verify ownership
        # 2. Check active post distributions → 409 if any
        # 3. Delete channel + encrypted tokens from DB
```

---

#### [NEW] `distribution/router.py`

```python
router = APIRouter(prefix="/api/v1/distribution", tags=["distribution"])

GET  /channels                       → list_channels
GET  /channels/connect/initiate      → initiate_connection
GET  /channels/connect/callback      → complete_connection
PATCH /channels/{id}/toggle-workspace → toggle_workspace_enable
PATCH /channels/{id}                 → update_channel
DELETE /channels/{id}                → delete_channel
```

---

### 4. Integrate with Existing App

#### [MODIFY] [main.py](file:///d:/Study_Work/Hcmus/Nhập%20môn%20công%20nghệ%20phần%20mềm%20-%2024C08/Software_Project_Hcmus/src/backend/app/main.py)
Add: `from app.distribution.router import router as distribution_router`
Add: `app.include_router(distribution_router)`

#### [MODIFY] [schemas.py](file:///d:/Study_Work/Hcmus/Nhập%20môn%20công%20nghệ%20phần%20mềm%20-%2024C08/Software_Project_Hcmus/src/backend/app/schemas.py)
Update `DistributorResponse` to use the new field names (backward compat).

---

### 5. Database Migration Script

#### [NEW] `src/backend/migrate_distribution.py`

SQL migration to:
1. Drop old `social_accounts` columns that changed
2. Add new columns: `owner_type`, `owner_id`, `note`, `access_token_encrypted`, `refresh_token_encrypted`, `token_expires_at`, `enabled_for_workspace`
3. Create `oauth_states` table
4. Create `post_distributions` table
5. Create enum types if not exists

---

## Error Handling Matrix

| HTTP Code | Condition | Example |
|-----------|-----------|---------|
| **401** | JWT missing/expired | Any endpoint without valid `Authorization: Bearer` |
| **403** | Correct role but wrong resource | Member calling toggle-workspace; Manager accessing another workspace's channel |
| **404** | Channel not found or doesn't belong to caller | `DELETE /channels/{wrong_id}` |
| **409** | Delete blocked by active posts; OAuth state mismatch/expired | Channel has pending_review posts; state token expired |
| **502** | Facebook/LinkedIn API error during token exchange | FB returns error during code→token exchange |

---

## Verification Plan

### Automated Tests
```bash
cd src/backend
.venv\Scripts\python.exe -m pytest test_distribution.py -v
```

Test cases:
1. **TC1**: FastAPI loads with distribution router — all 6 endpoints registered
2. **TC2**: OAuth state creation/validation/expiry
3. **TC3**: Token encryption round-trip (encrypt → decrypt = original)
4. **TC4**: Channel CRUD (create, list, update, delete)
5. **TC5**: RBAC — Manager sees workspace channels, Member sees only enabled, Individual sees own
6. **TC6**: 409 guard — delete blocked when post_distributions exist
7. **TC7**: Dev/Mock OAuth flow end-to-end (no real FB/LI credentials needed)

### Manual Verification
- Swagger UI at `http://localhost:8000/docs` → test each endpoint interactively
- Frontend integration test after connecting Distribution UI
