from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/omni_platforms"

    jwt_secret_key: str = "this-key-is-very-secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    cors_origins: str = "http://localhost:5173"

    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    email_from: str = ""

    otp_expire_minutes: int = 5
    otp_max_attempts: int = 5
    otp_resend_interval: int = 60
    verification_token_expire_minutes: int = 15

    # --- Distribution / OAuth ---
    facebook_app_id: str = ""
    facebook_app_secret: str = ""
    facebook_page_id: str = ""
    facebook_page_access_token: str = ""
    linkedin_client_id: str = ""
    linkedin_client_secret: str = ""
    oauth_redirect_uri: str = "http://localhost:8000/api/v1/distribution/channels/connect/callback"
    oauth_state_expire_seconds: int = 300  # 5 minutes

    # --- Token Encryption ---
    fernet_secret_key: str = ""  # Auto-generated at startup if empty

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
