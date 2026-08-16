# n8n Self-Hosted Analytics Ingestion Setup Guide

Tài liệu hướng dẫn triển khai và vận hành **n8n Self-Hosted Automation Worker** cho hệ thống **Social Media Management & Analytics Platform**.

---

## 1. Khởi động n8n bằng Docker Compose

Từ thư mục gốc của dự án (`Software_Project_Hcmus`):

```bash
# Khởi động container n8n chạy ngầm
docker compose up -d n8n

# Kiểm tra log container
docker compose logs -f n8n
```

* **Giao diện n8n UI**: Mở trình duyệt tại [http://localhost:5678](http://localhost:5678)
* **Kết nối Backend nội bộ**: n8n gọi Backend qua `http://host.docker.internal:8000`

---

## 2. Cấu hình Biến môi trường & Header Auth

Hệ thống bảo vệ endpoint nội bộ bằng header `X-Internal-API-Key`.
Giá trị mặc định: `default-internal-secret-key-12345` (khớp với `.env` của Backend).

---

## 3. Import Workflows có sẵn

Thư mục `n8n/workflows/` đã chứa sẵn 4 workflow templates:

1. **`01_main_scheduler.json`**:
   * Cron Trigger chạy mỗi 2 giờ.
   * Gọi `GET /api/v1/internal/posts/active` để lấy danh sách bài viết `published` và kích hoạt các sub-workflow.
2. **`02_facebook_sync.json`**:
   * Gọi `GET /api/v1/internal/tokens/{channel_id}` lấy token giải mã.
   * Lấy số liệu tương tác từ Facebook Graph API `/insights`.
   * Gửi batch payload về `POST /api/v1/internal/ingest/metrics`.
3. **`03_linkedin_sync.json`**:
   * Lấy số liệu thống kê từ LinkedIn REST API `organizationalEntityShareStatistics`.
   * Gửi batch payload về `POST /api/v1/internal/ingest/metrics`.
4. **`04_manual_sync_webhook.json`**:
   * Lắng nghe Webhook `POST /webhook/analytics-sync` khi người dùng nhấn 'Refresh Analytics' trên UI.

### Cách Import vào n8n:
1. Mở giao diện n8n tại [http://localhost:5678](http://localhost:5678)
2. Chọn menu **Workflows** -> **Import from File...**
3. Chọn lần lượt 4 file JSON trong thư mục `n8n/workflows/`.
4. Bật công tắc **Active** (góc trên bên phải) để kích hoạt workflow.
