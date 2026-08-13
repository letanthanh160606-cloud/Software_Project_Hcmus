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
  * Khắc phục triệt me lỗi `Failed to fetch` do lệnh AJAX `fetch()` tự động đi theo phản hồi chuyển hướng HTTP 302 (`RedirectResponse`) từ Backend vi phạm chính sách CORS cross-origin của trình duyệt. KHÔNG thay đổi bố cục hay kiểu dáng UI.

---

## 📌 3. File: `src/frontend/src/component/PMmodule.jsx`

* **Vị trí**: Dòng 285 – 290.
* **Thay đổi**:
  * Chuyển vị trí khai báo `const [selectedPost, setSelectedPost] = useState(null)` và `editingPost` lên đầu hàm `PMmodule` (trước các hook `useEffect`).
  * Lưu vết vĩnh viễn danh sách tất cả các đường dẫn bài viết đã đăng (`publishedUrlsList`) và khôi phục khi F5.
* **Lý do thay đổi**:
  * Sửa lỗi runtime `ReferenceError: Cannot access 'selectedPost' before initialization` làm màn hình bị trắng tinh. Sau khi di chuyển khai báo State lên trên `useEffect`, trang Post Management hoạt động bình thường 100%.
