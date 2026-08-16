import boto3
from botocore.config import Config 
from app.config import get_settings

gettings = get_settings()


r2_client = boto3.client(
    "s3",
    endpoint_url=f"https://{gettings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=gettings.R2_ACCESS_KEY_ID,
    aws_secret_access_key=gettings.R2_SECRET_ACCESS_KEY,
    config=Config(signature_version="s3v4"),
    region_name="auto",
)

R2_BUCKET_NAME = gettings.R2_BUCKET_NAME

def generate_presigned_url(object_key: str, content_type: str, expires_in:int = 3600) -> str:
    return r2_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": R2_BUCKET_NAME,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=expires_in,
    )