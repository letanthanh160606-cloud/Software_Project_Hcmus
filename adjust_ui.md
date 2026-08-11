# 🎨 BÁO CÁO ĐIỀU CHỈNH GIAO DIỆN (ADJUST UI LOG)

Tài liệu này ghi nhận chi tiết tất cả các vị trí điều chỉnh giao diện người dùng (UI) đã được thực hiện trong hệ thống, bao gồm file, vị trí dòng code và lý do thực hiện.

---

## 📌 1. File: `src/frontend/src/page/MainDashboard.jsx`

* **Vị trí**: Dòng 19.
* **Thay đổi**:
  * Xóa bỏ các ký tự đánh dấu xung đột git merge còn sót lại (`<<<<<<< HEAD`, `=======`, `>>>>>>> main`).
  * Giữ lại dòng import hợp lệ: `import Dismodule from '../component/Dismodule.jsx';`.
* **Lý do thay đổi**:
  * Sửa lỗi cú pháp Babel Compiler (`[BabelError] Unexpected token (19:1)`), giúp Vite Bundler biên dịch lại giao diện React bình thường.

---

## 📌 2. File: `src/frontend/src/component/Dismodule.jsx`

* **Vị trí**: Dòng 130 – 144.
* **Thay đổi**:
  * Thêm bước tự động kiểm tra token `localStorage.getItem('token')` trước khi khởi tạo kết nối.
  * Bổ sung thông báo lỗi Tiếng Việt thân thiện khi nhận HTTP status `401 Unauthorized`.
* **Lý do thay đổi**:
  * Tránh lỗi im lặng và hỗ trợ người dùng nhận biết ngay khi phiên đăng nhập JWT bị hết hạn/chưa đăng nhập (`401 Unauthorized`).

---

## 📌 3. File: `src/frontend/src/component/PMmodule.jsx`

* **Vị trí**: Dòng 385 – 410 & Dòng 439 – 446.
* **Thay đổi**:
  * Truyền tham số `?platform=${primaryPlatform}` khi gọi API xuất bản bài viết (`POST /api/v1/distribution/channels/publish/{postId}?platform=linkedin`).
  * Bổ sung cơ chế `AbortController` với thời gian chờ 30 giây (`timeout 30000ms`) cho yêu cầu `fetch` xuất bản bài viết.
  * Bổ sung câu thông báo lỗi Tiếng Việt rõ ràng cho trường hợp `Failed to fetch` (Backend chưa bật/mất mạng) và `AbortError` (Quá thời gian chờ).
  * Cập nhật URL xem bài đăng thực tế cho LinkedIn (`linkedin_post_url`).
* **Lý do thay đổi**:
  * Tránh lỗi im lặng hoặc thông báo lỗi tiếng Anh mơ hồ của trình duyệt (`Failed to fetch`), giúp người dùng nhận biết chính xác nguyên nhân lỗi. KHÔNG thay đổi bất kỳ bố cục, thiết kế hay màu sắc UI nào.
