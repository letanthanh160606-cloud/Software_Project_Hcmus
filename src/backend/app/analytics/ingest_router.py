import uuid
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.analytics import service
from app.analytics.schemas import BatchIngestRequest, BatchIngestResponse
from app.config import get_settings
from app.database import get_db

router = APIRouter(prefix="/api/v1/internal", tags=["internal-ingestion"])


def verify_internal_api_key(x_internal_api_key: str | None = Header(None, alias="X-Internal-API-Key")):
    settings = get_settings()
    expected_key = settings.internal_api_key.strip()

    if not x_internal_api_key or x_internal_api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Internal-API-Key header",
        )
    return True


@router.post("/ingest/metrics", response_model=BatchIngestResponse)
def ingest_batch_metrics(
    payload: BatchIngestRequest,
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_internal_api_key),
):
    """
    Internal endpoint for n8n to ingest a batch of post performance metrics.
    Guarantees idempotency via database upsert constraints.
    """
    try:
        return service.handle_batch_ingestion(db, payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch ingestion failed: {str(e)}",
        )


@router.get("/tokens/{channel_id}")
def get_channel_token_for_worker(
    channel_id: uuid.UUID,
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_internal_api_key),
):
    """
    Internal endpoint for n8n to fetch decrypted access tokens without exposing the Fernet master key.
    """
    try:
        return service.get_decrypted_token(db, channel_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to decrypt token: {str(e)}",
        )
