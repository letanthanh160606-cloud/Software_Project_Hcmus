import boto3
from botocore.config import Config
from app.config import get_settings

def get_r2_client():
    settings = get_settings()
    account_id = settings.R2_ACCOUNT_ID or "dummy_account"
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID or "dummy_key",
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY or "dummy_secret",
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )

def generate_presigned_url(object_key: str, content_type: str, expires_in: int = 3600) -> str:
    """Generate presigned URL for R2 upload"""
    settings = get_settings()
    client = get_r2_client()
    bucket_name = settings.R2_BUCKET_NAME or "default_bucket"
    return client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": bucket_name,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=expires_in,
    )

def upload_file_to_r2(file_bytes: bytes, object_key: str, content_type: str) -> str:
    """Directly upload file bytes to Cloudflare R2 bucket"""
    settings = get_settings()
    client = get_r2_client()
    bucket_name = settings.R2_BUCKET_NAME or "default_bucket"
    client.put_object(
        Bucket=bucket_name,
        Key=object_key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return f"{(settings.R2_PUBLIC_BASE_URL or '').rstrip('/')}/{object_key}"