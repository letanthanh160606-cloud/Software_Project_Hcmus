import logging
import base64
from cryptography.fernet import Fernet
from app.config import get_settings

logger = logging.getLogger("distribution.encryption")

_fernet_instance: Fernet | None = None


def _get_fernet() -> Fernet:
    """
    Retrieves or initializes the Fernet encryption instance.
    Uses FERNET_SECRET_KEY from settings. If key is missing or invalid,
    auto-generates a key for dev environment.
    """
    global _fernet_instance
    if _fernet_instance is not None:
        return _fernet_instance

    settings = get_settings()
    secret_key = settings.fernet_secret_key.strip()

    if not secret_key:
        # Auto-generate a valid Fernet key if empty (Dev mode fallback)
        key = Fernet.generate_key()
        logger.warning(
            "FERNET_SECRET_KEY not set in .env. Auto-generated temporary key. "
            "Tokens encrypted in this session won't be decryptable after app restart. "
            "Set FERNET_SECRET_KEY in production!"
        )
    else:
        try:
            # Check if key is valid Fernet key
            key = secret_key.encode("utf-8")
            Fernet(key)
        except Exception:
            # If plain string key was provided, derive Fernet key by urlsafe base64 encoding 32 bytes
            key = base64.urlsafe_b64encode(secret_key.zfill(32)[:32].encode("utf-8"))

    _fernet_instance = Fernet(key)
    return _fernet_instance


def encrypt_token(plaintext: str | None) -> str | None:
    """
    Encrypts sensitive OAuth access/refresh token string using AES/Fernet.
    Returns URL-safe base64 ciphertext string.
    """
    if not plaintext:
        return None
    fernet = _get_fernet()
    encrypted_bytes = fernet.encrypt(plaintext.encode("utf-8"))
    return encrypted_bytes.decode("utf-8")


def decrypt_token(ciphertext: str | None) -> str | None:
    """
    Decrypts ciphertext string back to plaintext token string.
    Never expose the decrypted token in API responses!
    """
    if not ciphertext:
        return None
    try:
        fernet = _get_fernet()
        decrypted_bytes = fernet.decrypt(ciphertext.encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except Exception as exc:
        logger.error(f"Failed to decrypt token: {exc}")
        return None
