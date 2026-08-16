import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode
import httpx
from app.config import get_settings

logger = logging.getLogger("distribution.oauth")


class OAuthProviderError(Exception):
    """Raised when an external OAuth provider API call fails."""
    def __init__(self, message: str, status_code: int = 502, details: str = ""):
        super().__init__(message)
        self.status_code = status_code
        self.details = details


@dataclass
class TokenExchangeResult:
    platform_account_id: str
    display_name: str
    access_token: str
    refresh_token: str | None = None
    token_expires_at: datetime | None = None


class FacebookOAuthProvider:
    """
    Handles Facebook OAuth 2.0 Flow.
    Requests scopes: pages_show_list, pages_read_engagement, pages_manage_posts
    Exchanges short-lived code -> short-lived user token -> long-lived Page access token.
    """

    AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth"
    TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"
    PAGES_URL = "https://graph.facebook.com/v19.0/me/accounts"

    @classmethod
    def get_authorization_url(cls, state: str) -> str:
        settings = get_settings()
        app_id = settings.facebook_app_id.strip()

        if not app_id:
            # Dev/Mock mode URL
            logger.info("Facebook App ID empty. Using Mock Authorization URL.")
            params = {
                "mock": "true",
                "platform": "facebook",
                "state": state,
                "redirect_uri": settings.oauth_redirect_uri,
            }
            return f"http://localhost:8000/api/v1/distribution/channels/connect/callback?code=mock_fb_code_{state[:8]}&{urlencode(params)}"

        params = {
            "client_id": app_id,
            "redirect_uri": settings.oauth_redirect_uri,
            "state": state,
            "scope": "public_profile,pages_show_list,pages_read_engagement,pages_manage_posts",
            "response_type": "code",
        }
        return f"{cls.AUTH_URL}?{urlencode(params)}"

    @classmethod
    def exchange_code(cls, code: str, state: str, channel_name: str | None = None) -> TokenExchangeResult:
        settings = get_settings()
        app_id = settings.facebook_app_id.strip()
        app_secret = settings.facebook_app_secret.strip()

        if not app_id or not app_secret or code.startswith("mock_"):
            logger.info("Executing Facebook Mock Token Exchange for dev environment.")
            return TokenExchangeResult(
                platform_account_id=f"fb_page_{state[:8]}",
                display_name=channel_name or "Facebook Fanpage (Mock)",
                access_token=f"mock_fb_long_lived_page_token_{state[:12]}",
                refresh_token=None,
                token_expires_at=None,  # FB Page tokens are non-expiring
            )

        try:
            with httpx.Client(timeout=10.0) as client:
                # 1. Exchange authorization code for user access token
                token_res = client.get(
                    cls.TOKEN_URL,
                    params={
                        "client_id": app_id,
                        "client_secret": app_secret,
                        "redirect_uri": settings.oauth_redirect_uri,
                        "code": code,
                    },
                )
                if token_res.status_code != 200:
                    logger.error(f"Facebook token exchange failed: {token_res.text}")
                    raise OAuthProviderError("Failed to exchange authorization code with Facebook", status_code=502)

                user_token_data = token_res.json()
                user_access_token = user_token_data.get("access_token")

                # 2. Fetch Facebook Pages managed by user or fallback to profile
                pages_res = client.get(
                    cls.PAGES_URL,
                    params={"access_token": user_access_token},
                )

                pages_data = pages_res.json().get("data", []) if pages_res.status_code == 200 else []

                if pages_data:
                    selected_page = pages_data[0]
                    if channel_name:
                        for p in pages_data:
                            if p.get("name", "").lower() == channel_name.lower():
                                selected_page = p
                                break
                    page_id = str(selected_page.get("id"))
                    page_name = selected_page.get("name", "Facebook Page")
                    page_access_token = selected_page.get("access_token", user_access_token)
                else:
                    # Fallback to Facebook Profile if user has no pages or page permissions not added
                    me_res = client.get(
                        "https://graph.facebook.com/v19.0/me",
                        params={"fields": "id,name", "access_token": user_access_token},
                    )
                    me_data = me_res.json() if me_res.status_code == 200 else {}
                    page_id = str(me_data.get("id", f"fb_{state[:8]}"))
                    page_name = channel_name if channel_name else f"{me_data.get('name', 'Shop')} (Fanpage)"
                    page_access_token = user_access_token

                return TokenExchangeResult(
                    platform_account_id=page_id,
                    display_name=page_name,
                    access_token=page_access_token,
                    refresh_token=None,
                    token_expires_at=None,
                )
        except httpx.HTTPError as exc:
            logger.error(f"Network error connecting to Facebook Graph API: {exc}")
            raise OAuthProviderError("Could not reach Facebook OAuth servers", status_code=503)


class LinkedInOAuthProvider:
    """
    Handles LinkedIn OAuth 2.0 Flow.
    Request scopes: w_member_social (individual) or w_organization_social,r_organization_social (workspace).
    """

    AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
    TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
    USERINFO_URL = "https://api.linkedin.com/v2/userinfo"

    @classmethod
    def get_authorization_url(cls, state: str, is_workspace: bool = False) -> str:
        settings = get_settings()
        client_id = settings.linkedin_client_id.strip()

        if not client_id:
            logger.info("LinkedIn Client ID empty. Using Mock Authorization URL.")
            params = {
                "mock": "true",
                "platform": "linkedin",
                "state": state,
                "redirect_uri": settings.oauth_redirect_uri,
            }
            return f"http://localhost:8000/api/v1/distribution/channels/connect/callback?code=mock_li_code_{state[:8]}&{urlencode(params)}"

        scope = "openid profile w_member_social"
        params = {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": settings.oauth_redirect_uri,
            "state": state,
            "scope": scope,
            "prompt": "login",
            "max_age": "0",
        }
        return f"{cls.AUTH_URL}?{urlencode(params)}"

    @classmethod
    def exchange_code(cls, code: str, state: str, channel_name: str | None = None) -> TokenExchangeResult:
        settings = get_settings()
        client_id = settings.linkedin_client_id.strip()
        client_secret = settings.linkedin_client_secret.strip()

        if not client_id or not client_secret or code.startswith("mock_"):
            logger.info("Executing LinkedIn Mock Token Exchange for dev environment.")
            now_tz = datetime.now(timezone.utc)
            return TokenExchangeResult(
                platform_account_id=f"li_profile_{state[:8]}",
                display_name=channel_name or "LinkedIn Channel (Mock)",
                access_token=f"mock_li_access_token_{state[:12]}",
                refresh_token=f"mock_li_refresh_token_{state[:12]}",
                token_expires_at=now_tz + timedelta(days=60),
            )

        try:
            with httpx.Client(timeout=10.0) as client:
                token_res = client.post(
                    cls.TOKEN_URL,
                    data={
                        "grant_type": "authorization_code",
                        "code": code,
                        "redirect_uri": settings.oauth_redirect_uri,
                        "client_id": client_id,
                        "client_secret": client_secret,
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
                if token_res.status_code != 200:
                    logger.error(f"LinkedIn token exchange failed: {token_res.text}")
                    raise OAuthProviderError("Failed to exchange authorization code with LinkedIn", status_code=502)

                data = token_res.json()
                access_token = data.get("access_token")
                refresh_token = data.get("refresh_token")
                expires_in = data.get("expires_in", 5184000)  # default ~60 days

                expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

                # Fetch user profile info (try /v2/userinfo first, fallback to /v2/me)
                profile_name = "LinkedIn Account"
                account_id = None

                profile_res = client.get(
                    cls.USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                if profile_res.status_code == 200:
                    pdata = profile_res.json()
                    profile_name = pdata.get("name") or pdata.get("given_name", "LinkedIn Account")
                    account_id = pdata.get("sub")

                if not account_id:
                    # Fallback: try /v2/me to get numeric person ID
                    me_res = client.get(
                        "https://api.linkedin.com/v2/me",
                        headers={"Authorization": f"Bearer {access_token}"},
                    )
                    if me_res.status_code == 200:
                        me_data = me_res.json()
                        account_id = me_data.get("id")
                        if not profile_name or profile_name == "LinkedIn Account":
                            fn = me_data.get("localizedFirstName", "")
                            ln = me_data.get("localizedLastName", "")
                            if fn or ln:
                                profile_name = f"{fn} {ln}".strip()

                if not account_id:
                    account_id = f"li_user_{state[:8]}"
                    logger.warning(f"Could not resolve LinkedIn person ID. Using fallback: {account_id}")

                return TokenExchangeResult(
                    platform_account_id=account_id,
                    display_name=channel_name or profile_name,
                    access_token=access_token,
                    refresh_token=refresh_token,
                    token_expires_at=expires_at,
                )
        except httpx.HTTPError as exc:
            logger.error(f"Network error connecting to LinkedIn API: {exc}")
            raise OAuthProviderError("Could not reach LinkedIn OAuth servers", status_code=503)
