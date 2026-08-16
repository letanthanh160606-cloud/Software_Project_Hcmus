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

* **Vị trí**: Dòng 1170 – 1186.
* **Thay đổi**:
  * Dọn dẹp đoạn thẻ trùng lặp thừa `>>>>>>> origin/BEdev` bị dư sau quá trình merge.
  * Giữ thẻ đóng `</div>` hợp lệ cho Modal bài đăng.
* **Lý do thay đổi**:
  * Khắc phục lỗi `[BabelError] Expected corresponding JSX closing tag for <div> (1184:16)`, giúp Vite bundler biên dịch lại giao diện React bình thường 100%.

---

## 📌 4. File: `src/frontend/src/component/Stamodule.jsx`

* **Vị trí**: Dòng 30 – 250, 560 – 1140.
* **Thay đổi**:
  * Truyền dữ liệu động `seriesData` và `labelsData` vào `MultiLineChart` từ endpoint `GET /api/v1/analytics/{workspace_id}/timeline`.
  * Ràng buộc dữ liệu thời gian thực cho `fbPieData` (75%) và `linkedinPieData` (25%) từ `GET /api/v1/analytics/{workspace_id}/overview`.
  * Kết nối dữ liệu tương tác hôm nay (Today Card) từ `GET /api/v1/analytics/{workspace_id}/today`.
  * Ràng buộc danh sách Top 7 bài viết có tương tác cao nhất từ `GET /api/v1/analytics/{workspace_id}/top-posts`.
  * Tự động tạo phân tích báo cáo thông minh AI từ `POST /api/v1/reports/{workspace_id}/generate` khi thay đổi mốc thời gian (Weekly/Monthly/Yearly).
  * Cho phép lưu báo cáo vào CSDL qua `POST /api/v1/reports/{workspace_id}` và tải về tài liệu qua `GET /api/v1/reports/{workspace_id}/{report_id}/download`.
* **Lý do thay đổi**:
  * Nâng cấp từ Mock Data tĩnh sang kết nối dữ liệu thật của Backend FastAPI theo tài liệu `Statistics Module Backend Architecture với n8n + AI.md`.
  * **TUÂN THỦ TUYỆT ĐỐI**: Giữ nguyên 100% bố cục visual layout, kích thước, màu sắc, font chữ Satoshi và hoạt ảnh (animation) gốc.

---

## 📌 5. File: `src/frontend/src/component/Contmodule.jsx`

* **Vị trí**: Dòng 300 – 355, 660 – 720.
* **Thay đổi**:
  * Gắn sự kiện `onClick={() => handleCreatePost('pending_review')}` cho nút **Submit** màu cam $\rightarrow$ Lưu bài viết ở trạng thái `pending_review` (Pending).
  * Gắn sự kiện `onClick={() => handleCreatePost('draft')}` cho nút **Save as Draft** $\rightarrow$ Lưu bài viết ở trạng thái `draft` (Drafts).
* **Lý do thay đổi**:
  * Phân biệt rõ ràng 2 luồng lưu bài viết: Gửi duyệt (Pending) và Lưu bản nháp (Draft) theo đúng yêu cầu nghiệp vụ.
  * Giữ nguyên 100% bố cục, màu sắc, style hover của các nút bấm.

---

## 📌 6. File: `src/frontend/src/component/PMmodule.jsx` (Target Channel Selector)

* **Vị trí**: Dòng 345 – 355, 1250 – 1285.
* **Thay đổi**:
  * Mặc định `selectedChannelId` là `'all'` khi Workspace có nhiều kênh kết nối (cả Facebook & LinkedIn).
  * Thêm dropdown **Target Account** vào khu vực Modal xét duyệt bài viết (`Pending`) của Manager để Manager có thể chủ động chọn đăng lên **Facebook**, **LinkedIn**, hoặc **Tất cả các tài khoản**.
* **Lý do thay đổi**:
  * Khắc phục tình trạng khi duyệt bài viết Pending, hệ thống tự động gán kênh mặc định là LinkedIn mà không cho Manager lựa chọn Facebook.
