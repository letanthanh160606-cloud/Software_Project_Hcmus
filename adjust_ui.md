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

* **Vị trí**: Dòng 130 – 160.
* **Thay đổi**:
  * Thêm bước tự động kiểm tra token `localStorage.getItem('token')` trước khi khởi tạo kết nối.
  * Bổ sung thông báo lỗi Tiếng Việt thân thiện khi nhận HTTP status `401 Unauthorized`.
  * Chuyển hướng trình duyệt qua `window.location.href = data.authorization_url` cho cả luồng OAuth thật và luồng Dev/Mock callback.
* **Lý do thay đổi**:
  * Khắc phục triệt để lỗi `Failed to fetch` do lệnh AJAX `fetch()` tự động đi theo phản hồi chuyển hướng HTTP 302 (`RedirectResponse`) từ Backend vi phạm chính sách CORS cross-origin của trình duyệt. KHÔNG thay đổi bố cục hay kiểu dáng UI.

---

## 📌 3. File: `src/frontend/src/component/PMmodule.jsx`

* **Vị trí**: Dòng 287 – 320, Dòng 390 – 405 & Dòng 880 – 930.
* **Thay đổi**:
  * Lưu danh sách đầy đủ các kênh truyền thông xã hội đã kết nối (`connectedChannelsList`) bao gồm `id`, `platform`, và `display_name`.
  * Bổ sung Menu thả xuống **Target Account Selector** trong Modal chi tiết bài viết, cho phép người dùng chủ động chọn tài khoản LinkedIn/Facebook cụ thể (theo tên hiển thị) trước khi bấm Publish.
  * Truyền tham số `&channel_id=${selectedChannelId}` sang Backend khi thực hiện đăng bài (`POST /api/v1/distribution/channels/publish/{postId}`).
  * Bổ sung cơ chế `AbortController` với thời gian chờ 30 giây (`timeout 30000ms`) cho yêu cầu `fetch` xuất bản bài viết.
* **Lý do thay đổi**:
  * Cho phép người dùng đăng bài chính xác lên từng tài khoản LinkedIn/Facebook đã kết nối, khắc phục việc Backend bị mặc định chọn kênh mới nhất.
