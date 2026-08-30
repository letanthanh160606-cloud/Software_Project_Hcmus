import boto3
from botocore.config import Config
from app.config import get_settings

# Cấu hình R2 client
settings = get_settings()

# Khởi tạo client R2
r2_client = boto3.client(
    "s3",
    endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=settings.R2_ACCESS_KEY_ID,
    aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
    config=Config(signature_version="s3v4"),
    region_name="auto",
)

R2_BUCKET_NAME = settings.R2_BUCKET_NAME

def generate_presigned_url(object_key: str, content_type: str, expires_in: int = 3600) -> str:
    """Tạo presigned URL cho việc upload file lên R2"""
    return r2_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": R2_BUCKET_NAME,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=expires_in,
    )