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

* **Vị trí**: Dòng 1170 – 1186.
* **Thay đổi**:
  * Dọn dẹp đoạn thẻ trùng lặp thừa `>>>>>>> origin/BEdev` bị dư sau quá trình merge.
  * Giữ thẻ đóng `</div>` hợp lệ cho Modal bài đăng.
* **Lý do thay đổi**:
  * Khắc phục lỗi `[BabelError] Expected corresponding JSX closing tag for <div> (1184:16)`, giúp Vite bundler biên dịch lại giao diện React bình thường 100%.

---

## 📌 4. File: `src/frontend/src/page/PendingPage.jsx` — [NEW]

* **Vị trí**: File mới hoàn toàn.
* **Thay đổi**:
  * Tạo trang full-screen hiển thị cho các thành viên (business member) chưa được workspace owner chấp thuận.
  * Trang hiển thị: lock icon, tiêu đề "Workspace Access Pending", thông báo "Workspace Access Denied. Please contact the owner via [owner email]", và nút "Log Out".
  * Email của workspace owner được đọc từ `localStorage.getItem('user')` (trường `workspace.manager_email` nếu có), hoặc fallback thành "your workspace administrator".
* **Lý do thay đổi**:
  * Yêu cầu từ người dùng: chặn access vào dashboard cho member có `workspace_id = null` (tức là chưa được approved).

---

## 📌 5. File: `src/frontend/src/App.jsx`

* **Vị trí**: Toàn bộ file — thêm `PendingRoute` guard và import `PendingPage`.
* **Thay đổi**:
  * Import `PendingPage` component mới.
  * Thêm component `PendingRoute`: kiểm tra `user.account_type === 'business'` AND `user.role === 'individual'` từ localStorage — nếu đúng, render `<PendingPage />` thay vì dashboard.
  * Bọc route `/dashboard` bằng `<PendingRoute>` (bên trong `<ProtectedRoute>`).
* **Lý do thay đổi**:
  * Triển khai logic chặn pending member truy cập dashboard. Logic phát hiện dựa trên behavior của backend: `derive_role()` trả về `"individual"` cho business member chưa được active.

---

## 📌 6. File: `src/frontend/src/page/MainDashboard.jsx`

* **Vị trí**: Lines 22–40 (state variables), lines 72–130 (handler functions), lines 483–660 (Account Details modal).
* **Thay đổi**:
  * Thêm state: `pwState`, `pwError`, `pwSuccess`, `pwLoading`, `showPwSection`.
  * Thêm hàm `resetAccountModal()` để reset toàn bộ trạng thái modal khi đóng.
  * Thêm hàm `handleChangePassword()`: validate client-side (required fields, match, min length), gọi `POST /auth/change-password`, hiển thị toast và inline feedback.
  * Nâng cấp Account Details modal:
    * Thêm các ô info riêng biệt: USERNAME, EMAIL (trước đây chỉ hiển thị ở avatar header).
    * Giữ nguyên ROLE + ACCOUNT TYPE grid.
    * Thêm nút toggle "Change Password" (collapsible section).
    * Section mật khẩu gồm: Current Password, New Password, Confirm New Password, error/success inline, nút "Update Password".
* **Lý do thay đổi**:
  * Yêu cầu từ người dùng: account configuration page hiển thị đầy đủ thông tin và cho phép đổi mật khẩu.

---

## 📌 7. File: `src/backend/app/schemas.py`

* **Vị trí**: Cuối file — thêm class `ChangePasswordRequest`.
* **Thay đổi**:
  * Thêm Pydantic schema `ChangePasswordRequest` với `current_password: str` và `new_password: str = Field(min_length=8, max_length=128)`.
* **Lý do thay đổi**:
  * Cần schema để validate request body cho endpoint đổi mật khẩu mới.

---

## 📌 8. File: `src/backend/app/routers/auth.py`

* **Vị trí**: Imports (thêm `ChangePasswordRequest`, `hash_password`) và cuối file (thêm endpoint).
* **Thay đổi**:
  * Thêm `POST /auth/change-password` endpoint (protected bởi JWT).
  * Xác thực `current_password` bằng `verify_password()`, sau đó hash và lưu `new_password`.
  * Trả về `{"message": "Password changed successfully"}` khi thành công.
* **Lý do thay đổi**:
  * Backend endpoint bắt buộc để frontend có thể đổi mật khẩu người dùng an toàn.
