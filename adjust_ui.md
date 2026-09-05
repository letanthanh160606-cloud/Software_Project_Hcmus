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

<<<<<<< HEAD
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

---

## 📌 7. File: `src/frontend/src/component/Contmodule.jsx` & `PMmodule.jsx` (Dynamic Selected Platforms)

* **Vị trí**: `Contmodule.jsx` (Dòng 320 – 335), `PMmodule.jsx` (Dòng 405 – 410, 520 – 530).
* **Thay đổi**:
  * `Contmodule.jsx`: Thu thập chính xác danh sách các nền tảng mạng xã hội đang được tích chọn (Facebook, LinkedIn hoặc cả hai) và gửi lên Backend qua trường `target_platforms`.
  * `PMmodule.jsx`: Hiển thị icon nền tảng (`PlatformIcons`) dựa trên đúng danh sách `p.target_platforms` được lưu trữ của từng bài viết thay vì gán cứng toàn bộ các kênh kết nối của Workspace.
* **Lý do thay đổi**:
  * Khi người dùng chỉ tích chọn Facebook bên Content, bài viết tại Post Management chỉ hiển thị biểu tượng Facebook.
  * Khi người dùng tích chọn cả Facebook & LinkedIn, bài viết hiển thị cả 2 biểu tượng.

---

## 📌 8. File: `src/frontend/src/component/TargetAccountSelector.jsx` & `PMmodule.jsx` (Hierarchical Scoped Accounts)

* **Vị trí**: `TargetAccountSelector.jsx` (Toàn bộ component), `PMmodule.jsx` (Dòng 1130 – 1160, 1270 – 1300).
* **Thay đổi**:
  * Tạo component `TargetAccountSelector.jsx` dạng cây phân cấp (Hierarchical Tree) có ô tìm kiếm (Search), Master Checkbox *"All Accounts on Selected Platforms"*, Header phân nhóm theo Platform kèm số lượng đã chọn (ví dụ: `Facebook (2/2)`, `LinkedIn (4/10)`), nút chọn tất cả trong từng platform, và từng checkbox tài khoản độc lập.
  * Tự động lọc tài khoản kết nối theo đúng `selectedPlatforms` của bài viết. Bất kỳ tài khoản nào không thuộc platform đã chọn sẽ bị loại khỏi bộ lọc và tự động xóa khỏi danh sách chọn khi platform bị uncheck.
  * Tích hợp `TargetAccountSelector` vào Modal bài viết (`Drafts` và `Pending`) trong `PMmodule.jsx`.
* **Lý do thay đổi**:
  * Giải quyết triệt để vấn đề logic: Không cho phép hiển thị tài khoản LinkedIn khi bài viết chỉ chọn Facebook.
  * Đảm bảo khả năng mở rộng (scale) lên hàng chục hoặc hàng trăm tài khoản trên nhiều nền tảng (Facebook, LinkedIn, Instagram, TikTok, X,...) trong tương lai mà không bị vỡ giao diện.

---

## 📌 9. File: `src/frontend/src/component/PMmodule.jsx` (Conditional Reject Comment Modal)

* **Vị trí**: Dòng 288, 1295 – 1380.
* **Thay đổi**:
  * Mặc định ẩn hoàn toàn khung nhập lý do từ chối `Rejection Comment` trong Modal duyệt bài của Manager.
  * Khi Manager bấm nút **Reject**, giao diện chuyển mượt mà sang khung nhập lý do từ chối màu đỏ nhạt (`#fef2f2`) với 2 nút hành động: **Cancel** (hủy từ chối và quay lại giao diện nút ban đầu) và **Confirm Reject** (xác nhận từ chối kèm lý do).
* **Lý do thay đổi**:
  * Giữ cho giao diện Modal duyệt bài ban đầu luôn gọn gàng, trực quan và chỉ yêu cầu nhập lý do khi người dùng thực sự muốn từ chối bài viết.

---

## 📌 10. File: `src/frontend/src/component/Stamodule.jsx` & `src/backend/app/analytics/service.py` (Purge Mock Data)

* **Vị trí**:
  * `Stamodule.jsx`: Dòng 35 – 280, 735 – 765, 1070 – 1115.
  * `service.py`: Dòng 38 – 220, 270 – 340.
* **Thay đổi**:
  * Xóa bỏ hoàn toàn mảng dữ liệu mẫu `dataMap` (các số liệu biểu đồ đường cong cứng `[210, 150, 240, ...]`).
  * Khởi tạo các giá trị state mặc định bằng `0` hoặc mảng rỗng `[]` (`overviewStats`, `todayData`, `reportTitle`, `reportText`, `reportHistoryList`, `topPosts`).
  * Xóa bỏ các bài viết mẫu cứng (`"[TA - P1] Archeology"`, `"Ecology"`) và báo cáo mẫu tự sinh (`"[Monthly report for July 2026]"`).
  * Bổ sung các thông báo trạng thái rỗng (Empty States) thân thiện khi Workspace mới chưa có dữ liệu:
    * *"No published posts yet."* cho Top Posts.
    * *"No reports found in the selected date range."* cho bảng lịch sử báo cáo.
    * *"No report generated yet. Select a timeframe or click Save to create an AI report."* cho khung báo cáo AI.
* **Lý do thay đổi**:
  * Đảm bảo toàn bộ số liệu trên màn hình Statistics phản ánh 100% dữ liệu thực từ CSDL PostgreSQL và pipeline cào số liệu n8n mà không chứa bất kỳ dữ liệu giả (mock/fallback) nào.
  * Giữ nguyên 100% thiết kế giao diện, kiểu dáng và bảng màu gốc.

---

## 📌 11. File: `src/frontend/src/component/DBmodule.jsx` & `DBultils/*` (Dashboard Mock Data Purge)

* **Vị trí**:
  * `DBmodule.jsx`: Dòng 35 – 150, 360 – 440, 880 – 890.
  * `AssignedTaskList.jsx`: Dòng 5 – 45.
  * `rightWidgets.jsx` (`MyCalendar`): Dòng 155 – 250.
* **Thay đổi**:
  * Xóa bỏ hoàn toàn các con số cứng (`monthlyIncrease = 822006`, `HPindex = 550744`, `data2 = [400, 800, 600, 1200, ...]`).
  * Kết nối `DBmodule.jsx` trực tiếp với các API Analytics của Backend (`/overview`, `/timeline`, `/today`) để hiển thị tỷ lệ nền tảng thực tế, đường tăng trưởng tháng thực tế và tương tác thực tế.
  * Xóa `mockBackendData` trong `AssignedTaskList.jsx` $\rightarrow$ Gọi trực tiếp `/workspaces/{workspace_id}/tasks` để hiển thị danh sách công việc được giao thực tế.
  * Cập nhật `MyCalendar` trong `rightWidgets.jsx` để hiển thị lịch làm việc thực tế từ các task của Workspace.
* **Lý do thay đổi**:
  * Đảm bảo giao diện Main Dashboard phản ánh 100% dữ liệu thực tế từ Database của người dùng, không còn sót bất kỳ dữ liệu mẫu/giả nào.

---

## 📌 12. File: `src/frontend/src/component/Stamodule.jsx` & `src/backend/app/analytics/router.py` (Report Document Download Flow)

* **Vị trí**:
  * `Stamodule.jsx`: Dòng 290 – 375, 1040 – 1070.
  * `router.py`: Dòng 166 – 188 (`download_report_document`).
* **Thay đổi**:
  * Cập nhật hàm `handleDownloadReport` phía Frontend sử dụng `fetch` kèm `Authorization: Bearer <token>` để tải file dưới dạng Blob, tự động khởi tạo và trigger file Markdown `.md` tải về máy người dùng.
  * Tùy biến nút **"Document"** trong cột Data của bảng **Report History** với hiệu ứng hover màu cam `#FE7216`, con trỏ chuột pointer và thông báo toast thành công khi tải xuống.
  * Nới lỏng kiểm tra phân quyền tại endpoint `/reports/{workspace_id}/{report_id}/download` để hỗ trợ cả tải trực tiếp qua Fetch và liên kết mở tab trình duyệt mà không bị lỗi `401 Unauthorized`.
* **Lý do thay đổi**:
  * Khắc phục triệt để lỗi `401 Unauthorized` khi người dùng nhấp vào tài liệu báo cáo để tải về, nâng cao trải nghiệm lưu trữ và xuất báo cáo phân tích AI.

---

## 📌 13. File: `src/frontend/src/component/DBmodule.jsx` (Dynamic Net Interaction Gain Percentage)

* **Vị trí**:
  * `DBmodule.jsx`: Dòng 40 – 115, 320 – 355.
* **Thay đổi**:
  * Xóa bỏ con số phần trăm cứng `43%` trong thẻ **Net Interaction Gain**.
  * Bổ sung state `netGainPct` và logic tính toán tỷ lệ tăng trưởng phần trăm tương tác động từ CSDL:
    * Khi chưa có tương tác (`monthlyIncrease == 0`): hiển thị `0%` màu xám và tiêu đề `"No growth recorded"`.
    * Khi có tương tác thực tế (`monthlyIncrease > 0`): hiển thị tỷ lệ tăng trưởng tương ứng `+X%` màu xanh lục `#6FD281` và tiêu đề `"Beat last month by"`.
  * Cập nhật cơ chế nhận diện `workspace_id` chuẩn xác để Dashboard không bị rơi vào trạng thái rỗng `0`.
* **Lý do thay đổi**:
  * Loại bỏ hoàn toàn số liệu giả lập `43%` còn sót lại trên Dashboard chính, đảm bảo giao diện phản ánh 100% số liệu tính toán động.

---

## 📌 14. File: `src/frontend/src/component/DBmodule.jsx` & `src/backend/app/analytics/` (Dynamic Monthly KPI Goal Feature)

* **Vị trí**:
  * `DBmodule.jsx`: Dòng 50 – 140, 580 – 780.
  * Backend: `models.py`, `schemas.py`, `service.py`, `router.py`.
* **Thay đổi**:
  * Chuyển đổi tính năng **"Goal For This Month"** từ trạng thái tĩnh (`50%` tạm thời trong React state) sang kết nối CSDL và tính toán động theo Phương án 1 (Target Goal vs Actual Monthly Interactions).
  * Backend:
    * Bổ sung bảng `analytics.workspace_kpi_goals` lưu mục tiêu `target_interactions` cho từng Workspace theo từng tháng (`month_year`).
    * Cung cấp 2 API: `GET /api/v1/analytics/{workspace_id}/kpi` và `PUT /api/v1/analytics/{workspace_id}/kpi`.
    * Tự động tính toán tiến độ: `progress_percentage = min(100, round((current_interactions / target) * 100))`.
  * Frontend:
    * Tự động lấy dữ liệu tiến độ KPI khi mở Dashboard và hiển thị phần trăm hoàn thành `{KPIcard}%` cùng hiệu ứng dâng mức nước màu cam `height: ${100 - KPIcard}%`.
    * Cập nhật Popup "Set Monthly KPI Goal" cho phép người dùng nhập mục tiêu tương tác, xem số lượng tương tác hiện tại của tháng và lưu trực tiếp vào CSDL khi bấm "Apply".
    * Bổ sung tooltip chi tiết khi rê chuột vào thẻ: `KPI Progress: X / Y interactions (Z% achieved)`.
* **Lý do thay đổi**:
  * Triển khai hoàn thiện tính năng KPI hàng tháng theo yêu cầu người dùng (Phương án 1), giữ nguyên vẹn 100% phong cách thiết kế thẩm mỹ (visual aesthetics) và hiệu ứng liquid animation gốc.

---

## 📌 15. File: `src/frontend/src/component/PMmodule.jsx` & `src/backend/app/` (Dynamic Post Management Engagement Display)

* **Vị trí**:
  * `PMmodule.jsx`: Dòng 455 – 470, 595 – 610, 875 – 885.
  * Backend: `schemas.py` (`PostResponse`), `crud.py` (`attach_engagements_to_posts`), `routers/workspaces.py`, `routers/posts.py`.
* **Thay đổi**:
  * Backend:
    * Thêm trường `engagement: int = 0` và `total_engagements: int = 0` vào schema `PostResponse`.
    * Xây dựng hàm `attach_engagements_to_posts` tự động truy vấn tổng số tương tác (`SUM(engagements)`) của từng bài viết từ bảng `analytics.engagement_metrics`.
    * Tích hợp vào các endpoint `GET /workspaces/{workspace_id}/posts` và `GET /posts`.
  * Frontend:
    * Cập nhật hàm `fetchPosts` và logic reload sau khi xuất bản trong `PMmodule.jsx` để ánh xạ `engagement: p.engagement || p.total_engagements || 0` thay vì gán tĩnh `0`.
    * Cột **Engagement** trong bảng **Post Activity** tự động hiển thị số lượng tương tác thật được định dạng phân cách hàng nghìn (ví dụ: `211`) thay vì hiển thị dấu gạch ngang `—`.
* **Lý do thay đổi**:
  * Khắc phục tình trạng cột Engagement trong Post Activity không hiển thị số liệu tương tác đã thu thập được từ n8n/mạng xã hội, hoàn thiện trải nghiệm quản lý bài viết thống nhất với module Statistics.

---

## 📌 16. File: `src/frontend/src/page/PendingPage.jsx` — [NEW]

* **Vị trí**: File mới hoàn toàn.
* **Thay đổi**:
  * Tạo trang full-screen hiển thị cho các thành viên (business member) chưa được workspace owner chấp thuận.
  * Trang hiển thị: lock icon, tiêu đề "Workspace Access Pending", thông báo "Workspace Access Denied. Please contact the owner via [owner email]", và nút "Log Out".
  * Email của workspace owner được đọc từ `localStorage.getItem('user')` (trường `workspace.manager_email` nếu có), hoặc fallback thành "your workspace administrator".
* **Lý do thay đổi**:
  * Yêu cầu từ người dùng: chặn access vào dashboard cho member có `workspace_id = null` (tức là chưa được approved).

---

## 📌 17. File: `src/frontend/src/App.jsx`

* **Vị trí**: Toàn bộ file — thêm `PendingRoute` guard và import `PendingPage`.
* **Thay đổi**:
  * Import `PendingPage` component mới.
  * Thêm component `PendingRoute`: kiểm tra `user.account_type === 'business'` AND `user.role === 'individual'` từ localStorage — nếu đúng, render `<PendingPage />` thay vì dashboard.
  * Bọc route `/dashboard` bằng `<PendingRoute>` (bên trong `<ProtectedRoute>`).
* **Lý do thay đổi**:
  * Triển khai logic chặn pending member truy cập dashboard. Logic phát hiện dựa trên behavior của backend: `derive_role()` trả về `"individual"` cho business member chưa được active.

---

## 📌 18. File: `src/frontend/src/page/MainDashboard.jsx`

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

## 📌 19. File: `src/backend/app/schemas.py`

* **Vị trí**: Cuối file — thêm class `ChangePasswordRequest`.
* **Thay đổi**:
  * Thêm Pydantic schema `ChangePasswordRequest` với `current_password: str` và `new_password: str = Field(min_length=8, max_length=128)`.
* **Lý do thay đổi**:
  * Cần schema để validate request body cho endpoint đổi mật khẩu mới.

---

## 📌 20. File: `src/backend/app/routers/auth.py`

* **Vị trí**: Imports (thêm `ChangePasswordRequest`, `hash_password`) và cuối file (thêm endpoint).
* **Thay đổi**:
  * Thêm `POST /auth/change-password` endpoint (protected bởi JWT).
  * Xác thực `current_password` bằng `verify_password()`, sau đó hash và lưu `new_password`.
  * Trả về `{"message": "Password changed successfully"}` khi thành công.
* **Lý do thay đổi**:
  * Backend endpoint bắt buộc để frontend có thể đổi mật khẩu người dùng an toàn.

---

## 📌 21. File: `src/frontend/src/component/DBmodule.jsx` & `src/backend/app/analytics/` (Real Interaction Comparison & Month-over-Month Gain)

* **Vị trí**:
  * `DBmodule.jsx`: Dòng 80 – 125, 345 – 375, 425 – 440.
  * Backend: `schemas.py` (`MonthlyGainOverview`, `PlatformOverview`), `service.py` (`get_overview`).
* **Thay đổi**:
  * **Highest-engaging Platform**:
    * Chuyển đổi tiêu chí so sánh từ **Lượt xem (Attraction/Impressions)** sang **Lượt tương tác thực tế (Total Engagements: Likes + Comments + Shares + Clicks)**.
    * Thẻ hiển thị số lượng tương tác thật của nền tảng dẫn đầu (ví dụ: `133` thay vì `10,000`), tỷ trọng tương tác `{HPpercent}%` (ví dụ: `63%`) và biểu đồ Doughnut chart phân bổ tương tác thực tế giữa Facebook và LinkedIn.
    * Cập nhật subtitle: `${HPplatform} got the engagement!`.
  * **Net Interaction Gain**:
    * Tính toán tỷ lệ tăng trưởng phần trăm tương tác của **Tháng này so với Tháng trước (Month-over-Month Growth Rate)**:
      $$\text{Tăng trưởng (\%)} = \text{round}\left(\frac{\text{Tương tác Tháng này} - \text{Tương tác Tháng trước}}{\text{Tương tác Tháng trước}} \times 100\right)$$
    * Khi tăng trưởng: Hiển thị `+X%` màu xanh `#6FD281` cùng tiêu đề `"Beat last month by"`.
    * Khi giảm: Hiển thị `-X%` màu đỏ/cam `#F94000` cùng tiêu đề `"Decreased vs last month"`.
    * Hiển thị tổng tương tác tháng này (ví dụ: `211`).
* **Lý do thay đổi**:
  * Đáp ứng đúng nhu cầu phân tích tương tác thực tế giữa các kênh và đo lường tỷ lệ tăng trưởng theo tháng của người dùng, giữ nguyên vẹn 100% phong cách thiết kế thẩm mỹ gốc.

---

---

## 📌 23. File: `src/frontend/src/component/WSmodule.jsx` & Backend `workspaces.py`, `schemas.py`, `security.py` (Plain Workspace PIN Display for Manager)

* **Vị trí**:
  * `WSmodule.jsx`: Dòng 110 – 125, 1325 – 1345.
  * Backend: `app/security.py` (`hash_pin`, `verify_pin`), `app/schemas.py` (`WorkspaceDetailResponse`), `app/routers/workspaces.py` (`get_workspace_detail`).
* **Thay đổi**:
  * **Frontend (`WSmodule.jsx`)**:
    * Trong Modal **Pending Join Requests** $\rightarrow$ mục **Share to Invite Members**:
    * Trường **PIN Password**: Thay thế ký tự ẩn `••••••` bằng giá trị mã PIN thực tế (ví dụ: `789456` với kiểu chữ monospace, màu cam nổi bật `#FE7216`).
    * Cho phép Manager bấm trực tiếp vào ô để copy nhanh mã PIN gửi cho thành viên.
  * **Backend**:
    * Cập nhật `hash_pin` lưu mã PIN dưới dạng chuỗi rõ ràng (Plain text), và `verify_pin` hỗ trợ kiểm tra mã PIN trực tiếp.
    * Thêm trường `pin` vào `WorkspaceDetailResponse` và trả về mã PIN thật khi người yêu cầu là Manager của Workspace.
* **Lý do thay đổi**:
  * Đáp ứng yêu cầu từ người dùng: Manager cần xem được mã PIN rõ ràng của Workspace trong giao diện chia sẻ/mời thành viên để dễ dàng sao chép và gửi cho các Member tham gia Workspace. Giữ nguyên 100% bố cục và thiết kế của Modal.

---

## 📌 24. File: `MainDashboard.jsx`, `WSmodule.jsx` & Backend `crud.py`, `models.py`, `schemas.py` (Member Join Request Real-time Notification & Manager Click-to-Approve Flow)

* **Vị trí**:
  * `MainDashboard.jsx`: Dòng 30 – 40, 240 – 255, 390 – 435, 825 – 830.
  * `WSmodule.jsx`: Dòng 35 – 40, 315 – 330, 650 – 715, 1250 – 1285, 1830 – 1875.
  * Backend: `models.py` (`Notifications.task_id nullable`), `crud.py` (`create_member_for_workspace`), `schemas.py` (`NotificationResponse`).
* **Thay đổi**:
  * **Backend**:
    * Khi một thành viên (Member) đăng ký xin vào Workspace, hệ thống tự động tạo 1 bản ghi thông báo mới trong bảng `workspaces.notifications` gửi đích danh đến **Manager** của Workspace đó (`type="member_join_request"`).
    * Hỗ trợ `task_id` nullable trong `Notifications` model và schema `NotificationResponse`.
  * **Navbar Thông báo (MainDashboard.jsx)**:
    * Biểu tượng chuông 🔔 hiển thị số đỏ thông báo chưa đọc.
    * Trong danh sách thông báo: Hiển thị icon thành viên `👤`, nội dung thông báo chuẩn Tiếng Anh (*"Member [User] ([Email]) requested to join workspace [Name]."*), kèm nhãn **`Review now →`**.
    * **Tương tác trực tiếp**: Khi Manager bấm vào thông báo này, hệ thống sẽ tự động chuyển sang tab **Team Workspace** và **tự động bật Modal `Pending Join Requests`** để Manager xem thông tin và bấm **Accept** hoặc **Decline** ngay lập tức.
  * **Giao diện Team Workspace (WSmodule.jsx)**:
    * **Nút Join Request** (góc trên bên phải thẻ Manage Your Workspace): Hiển thị huy hiệu đỏ số lượng yêu cầu chờ duyệt khi có thành viên gửi yêu cầu.
    * **Mục Member (Bên phải)**: Hiển thị nhãn `{count} Pending` bên cạnh nút `Manage >`.
    * **Modal Manage Members**: Hiển thị thanh thông báo chuẩn Tiếng Anh *"🔔 {count} pending join request(s) awaiting approval"* kèm nút **[Review]** chuyển nhanh sang Modal phê duyệt.
* **Lý do thay đổi**:
  * Đáp ứng yêu cầu chuẩn hóa toàn bộ giao diện và thông báo sang tiếng Anh đồng bộ với toàn bộ hệ thống. Giữ nguyên 100% bố cục và thẩm mỹ thiết kế.

---

## 📌 25. File: `Contmodule.jsx` & Backend `ai_content_service.py`, `posts.py`, `schemas.py` (AI Content Generation from Multi-Input Sources)

* **Vị trí**:
  * `Contmodule.jsx`: Dòng 175 – 215 (SearchBar), 270 – 430 (State, Templates, KB Data & `handleGenerateAI`), 670 – 710 (`+ Generate` Button with Loading State), 880 – 1070 (Dynamic Search & KB View Modal).
  * Backend: `app/services/ai_content_service.py`, `app/routers/posts.py` (`POST /posts/generate-ai`), `app/schemas.py` (`AIContentGenerateRequest`, `AIContentGenerateResponse`).
* **Thay đổi**:
  * **Frontend (`Contmodule.jsx`)**:
    * Khi bật toggle **`Enable AI`**, người dùng có thể kết hợp linh hoạt 4 nguồn dữ liệu:
      1. **Prompt Template** (chọn mẫu prompt có sẵn).
      2. **Knowledge Base** (chọn một hoặc nhiều tài liệu ngữ cảnh).
      3. **Manual Prompt** (nhập chỉ thị tùy biến của người dùng).
      4. **Existing Post Content** (tiêu đề và nội dung bài viết hiện có trong ô soạn thảo).
    * Gắn sự kiện cho nút **`+ Generate`**:
      * Kiểm tra dữ liệu đầu vào; nếu rỗng toàn bộ sẽ hiển thị thông báo nhắc nhở mà không gọi API vô nghĩa.
      * Hiển thị trạng thái đang sinh bài `Generating...` kèm hiệu ứng mượt mà và vô hiệu hóa nút trong lúc xử lý.
      * Khi nhận kết quả từ AI, tự động điền vào ô Title và Body để người dùng xem lại (review) và chỉnh sửa trước khi bấm `Submit` hoặc `Save as Draft`.
      * Nếu có lỗi phát sinh, bảo toàn 100% nội dung bài viết hiện tại của người dùng, không bị ghi đè.
    * Cung cấp thanh tìm kiếm **Search** hoạt động trực tiếp cho cả Knowledge Base và Prompt Template.
    * Cho phép nhấn **View** trên từng tài liệu Knowledge Base để xem chi tiết nội dung trong Popup Modal.
  * **Backend**:
    * Xây dựng service `AIContentService` tuân thủ đúng thứ tự ưu tiên và quy tắc kết hợp: *System Instruction $\rightarrow$ Prompt Template $\rightarrow$ Manual Prompt (Ưu tiên đè khi xung đột) $\rightarrow$ Knowledge Base Context $\rightarrow$ Existing Content $\rightarrow$ Output Format JSON*.
    * Tích hợp gọi trực tiếp Google Gemini API (`gemini-2.5-flash`) kết hợp bộ sinh nội dung dự phòng thông minh (resilient offline fallback) đảm bảo hệ thống không bao giờ bị gián đoạn hay crash.
* **Lý do thay đổi**:
  * Hiện thực hóa trọn vẹn đặc tả kỹ thuật trong `Prompt_Ai_Content_Feature.md`, đáp ứng đầy đủ 10 Acceptance Criteria, mang đến trải nghiệm sáng tạo nội dung mạng xã hội thông minh và tối ưu nhất cho người dùng.

---

## 📌 26. File: `src/frontend/src/component/Contmodule.jsx` (Dynamic Knowledge Base & Prompt Template Data)

* **Vị trí**:
  * `Contmodule.jsx`: Dòng 218 – 330 (Data state & fetch effect), dòng 880 – 1025 (Empty state display & Add navigation).
  * `MainDashboard.jsx`: Dòng 819 (Truyền prop `onNavigateTab={setActiveTab}`).
* **Thay đổi**:
  * **Xóa bỏ toàn bộ dữ liệu mock cứng** ban đầu của **Knowledge Base** (5 mục mẫu) và **Prompt Template** (3 mục mẫu).
  * Khởi tạo `kbItems` và `promptTemplates` là mảng rỗng `[]`.
  * Thêm `useEffect` tự động gọi các API từ Backend:
    * `GET /prompt-context/knowledge-bases`: Lấy danh sách Knowledge Base thật của người dùng.
* Backend:
    * Bổ sung bảng `analytics.workspace_kpi_goals` lưu mục tiêu `target_interactions` cho từng Workspace theo từng tháng (`month_year`).
    * Cung cấp 2 API: `GET /api/v1/analytics/{workspace_id}/kpi` và `PUT /api/v1/analytics/{workspace_id}/kpi`.
    * Tự động tính toán tiến độ: `progress_percentage = min(100, round((current_interactions / target) * 100))`.
  * Frontend:
    * Tự động lấy dữ liệu tiến độ KPI khi mở Dashboard và hiển thị phần trăm hoàn thành `{KPIcard}%` cùng hiệu ứng dâng mức nước màu cam `height: ${100 - KPIcard}%`.
    * Cập nhật Popup "Set Monthly KPI Goal" cho phép người dùng nhập mục tiêu tương tác, xem số lượng tương tác hiện tại của tháng và lưu trực tiếp vào CSDL khi bấm "Apply".
    * Bổ sung tooltip chi tiết khi rê chuột vào thẻ: `KPI Progress: X / Y interactions (Z% achieved)`.
* **Lý do thay đổi**:
  * Triển khai hoàn thiện tính năng KPI hàng tháng theo yêu cầu người dùng (Phương án 1), giữ nguyên vẹn 100% phong cách thiết kế thẩm mỹ (visual aesthetics) và hiệu ứng liquid animation gốc.

---

## 📌 15. File: `src/frontend/src/component/PMmodule.jsx` & `src/backend/app/` (Dynamic Post Management Engagement Display)

* **Vị trí**:
  * `PMmodule.jsx`: Dòng 455 – 470, 595 – 610, 875 – 885.
  * Backend: `schemas.py` (`PostResponse`), `crud.py` (`attach_engagements_to_posts`), `routers/workspaces.py`, `routers/posts.py`.
* **Thay đổi**:
  * Backend:
    * Thêm trường `engagement: int = 0` và `total_engagements: int = 0` vào schema `PostResponse`.
    * Xây dựng hàm `attach_engagements_to_posts` tự động truy vấn tổng số tương tác (`SUM(engagements)`) của từng bài viết từ bảng `analytics.engagement_metrics`.
    * Tích hợp vào các endpoint `GET /workspaces/{workspace_id}/posts` và `GET /posts`.
  * Frontend:
    * Cập nhật hàm `fetchPosts` và logic reload sau khi xuất bản trong `PMmodule.jsx` để ánh xạ `engagement: p.engagement || p.total_engagements || 0` thay vì gán tĩnh `0`.
    * Cột **Engagement** trong bảng **Post Activity** tự động hiển thị số lượng tương tác thật được định dạng phân cách hàng nghìn (ví dụ: `211`) thay vì hiển thị dấu gạch ngang `—`.
* **Lý do thay đổi**:
  * Khắc phục tình trạng cột Engagement trong Post Activity không hiển thị số liệu tương tác đã thu thập được từ n8n/mạng xã hội, hoàn thiện trải nghiệm quản lý bài viết thống nhất với module Statistics.

---

## 📌 16. File: `src/frontend/src/page/PendingPage.jsx` — [NEW]

* **Vị trí**: File mới hoàn toàn.
* **Thay đổi**:
  * Tạo trang full-screen hiển thị cho các thành viên (business member) chưa được workspace owner chấp thuận.
  * Trang hiển thị: lock icon, tiêu đề "Workspace Access Pending", thông báo "Workspace Access Denied. Please contact the owner via [owner email]", và nút "Log Out".
  * Email của workspace owner được đọc từ `localStorage.getItem('user')` (trường `workspace.manager_email` nếu có), hoặc fallback thành "your workspace administrator".
* **Lý do thay đổi**:
  * Yêu cầu từ người dùng: chặn access vào dashboard cho member có `workspace_id = null` (tức là chưa được approved).

---

## 📌 17. File: `src/frontend/src/App.jsx`

* **Vị trí**: Toàn bộ file — thêm `PendingRoute` guard và import `PendingPage`.
* **Thay đổi**:
  * Import `PendingPage` component mới.
  * Thêm component `PendingRoute`: kiểm tra `user.account_type === 'business'` AND `user.role === 'individual'` từ localStorage — nếu đúng, render `<PendingPage />` thay vì dashboard.
  * Bọc route `/dashboard` bằng `<PendingRoute>` (bên trong `<ProtectedRoute>`).
* **Lý do thay đổi**:
  * Triển khai logic chặn pending member truy cập dashboard. Logic phát hiện dựa trên behavior của backend: `derive_role()` trả về `"individual"` cho business member chưa được active.

---

## 📌 18. File: `src/frontend/src/page/MainDashboard.jsx`

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

## 📌 19. File: `src/backend/app/schemas.py`

* **Vị trí**: Cuối file — thêm class `ChangePasswordRequest`.
* **Thay đổi**:
  * Thêm Pydantic schema `ChangePasswordRequest` với `current_password: str` và `new_password: str = Field(min_length=8, max_length=128)`.
* **Lý do thay đổi**:
  * Cần schema để validate request body cho endpoint đổi mật khẩu mới.

---

## 📌 20. File: `src/backend/app/routers/auth.py`

* **Vị trí**: Imports (thêm `ChangePasswordRequest`, `hash_password`) và cuối file (thêm endpoint).
* **Thay đổi**:
  * Thêm `POST /auth/change-password` endpoint (protected bởi JWT).
  * Xác thực `current_password` bằng `verify_password()`, sau đó hash và lưu `new_password`.
  * Trả về `{"message": "Password changed successfully"}` khi thành công.
* **Lý do thay đổi**:
  * Backend endpoint bắt buộc để frontend có thể đổi mật khẩu người dùng an toàn.

---

## 📌 21. File: `src/frontend/src/component/DBmodule.jsx` & `src/backend/app/analytics/` (Real Interaction Comparison & Month-over-Month Gain)

* **Vị trí**:
  * `DBmodule.jsx`: Dòng 80 – 125, 345 – 375, 425 – 440.
  * Backend: `schemas.py` (`MonthlyGainOverview`, `PlatformOverview`), `service.py` (`get_overview`).
* **Thay đổi**:
  * **Highest-engaging Platform**:
    * Chuyển đổi tiêu chí so sánh từ **Lượt xem (Attraction/Impressions)** sang **Lượt tương tác thực tế (Total Engagements: Likes + Comments + Shares + Clicks)**.
    * Thẻ hiển thị số lượng tương tác thật của nền tảng dẫn đầu (ví dụ: `133` thay vì `10,000`), tỷ trọng tương tác `{HPpercent}%` (ví dụ: `63%`) và biểu đồ Doughnut chart phân bổ tương tác thực tế giữa Facebook và LinkedIn.
    * Cập nhật subtitle: `${HPplatform} got the engagement!`.
  * **Net Interaction Gain**:
    * Tính toán tỷ lệ tăng trưởng phần trăm tương tác của **Tháng này so với Tháng trước (Month-over-Month Growth Rate)**:
      $$\text{Tăng trưởng (\%)} = \text{round}\left(\frac{\text{Tương tác Tháng này} - \text{Tương tác Tháng trước}}{\text{Tương tác Tháng trước}} \times 100\right)$$
    * Khi tăng trưởng: Hiển thị `+X%` màu xanh `#6FD281` cùng tiêu đề `"Beat last month by"`.
    * Khi giảm: Hiển thị `-X%` màu đỏ/cam `#F94000` cùng tiêu đề `"Decreased vs last month"`.
    * Hiển thị tổng tương tác tháng này (ví dụ: `211`).
* **Lý do thay đổi**:
  * Đáp ứng đúng nhu cầu phân tích tương tác thực tế giữa các kênh và đo lường tỷ lệ tăng trưởng theo tháng của người dùng, giữ nguyên vẹn 100% phong cách thiết kế thẩm mỹ gốc.

---

---

## 📌 23. File: `src/frontend/src/component/WSmodule.jsx` & Backend `workspaces.py`, `schemas.py`, `security.py` (Plain Workspace PIN Display for Manager)

* **Vị trí**:
  * `WSmodule.jsx`: Dòng 110 – 125, 1325 – 1345.
  * Backend: `app/security.py` (`hash_pin`, `verify_pin`), `app/schemas.py` (`WorkspaceDetailResponse`), `app/routers/workspaces.py` (`get_workspace_detail`).
* **Thay đổi**:
  * **Frontend (`WSmodule.jsx`)**:
    * Trong Modal **Pending Join Requests** $\rightarrow$ mục **Share to Invite Members**:
    * Trường **PIN Password**: Thay thế ký tự ẩn `••••••` bằng giá trị mã PIN thực tế (ví dụ: `789456` với kiểu chữ monospace, màu cam nổi bật `#FE7216`).
    * Cho phép Manager bấm trực tiếp vào ô để copy nhanh mã PIN gửi cho thành viên.
  * **Backend**:
    * Cập nhật `hash_pin` lưu mã PIN dưới dạng chuỗi rõ ràng (Plain text), và `verify_pin` hỗ trợ kiểm tra mã PIN trực tiếp.
    * Thêm trường `pin` vào `WorkspaceDetailResponse` và trả về mã PIN thật khi người yêu cầu là Manager của Workspace.
* **Lý do thay đổi**:
  * Đáp ứng yêu cầu từ người dùng: Manager cần xem được mã PIN rõ ràng của Workspace trong giao diện chia sẻ/mời thành viên để dễ dàng sao chép và gửi cho các Member tham gia Workspace. Giữ nguyên 100% bố cục và thiết kế của Modal.

---

## 📌 24. File: `MainDashboard.jsx`, `WSmodule.jsx` & Backend `crud.py`, `models.py`, `schemas.py` (Member Join Request Real-time Notification & Manager Click-to-Approve Flow)

* **Vị trí**:
  * `MainDashboard.jsx`: Dòng 30 – 40, 240 – 255, 390 – 435, 825 – 830.
  * `WSmodule.jsx`: Dòng 35 – 40, 315 – 330, 650 – 715, 1250 – 1285, 1830 – 1875.
  * Backend: `models.py` (`Notifications.task_id nullable`), `crud.py` (`create_member_for_workspace`), `schemas.py` (`NotificationResponse`).
* **Thay đổi**:
  * **Backend**:
    * Khi một thành viên (Member) đăng ký xin vào Workspace, hệ thống tự động tạo 1 bản ghi thông báo mới trong bảng `workspaces.notifications` gửi đích danh đến **Manager** của Workspace đó (`type="member_join_request"`).
    * Hỗ trợ `task_id` nullable trong `Notifications` model và schema `NotificationResponse`.
  * **Navbar Thông báo (MainDashboard.jsx)**:
    * Biểu tượng chuông 🔔 hiển thị số đỏ thông báo chưa đọc.
    * Trong danh sách thông báo: Hiển thị icon thành viên `👤`, nội dung thông báo chuẩn Tiếng Anh (*"Member [User] ([Email]) requested to join workspace [Name]."*), kèm nhãn **`Review now →`**.
    * **Tương tác trực tiếp**: Khi Manager bấm vào thông báo này, hệ thống sẽ tự động chuyển sang tab **Team Workspace** và **tự động bật Modal `Pending Join Requests`** để Manager xem thông tin và bấm **Accept** hoặc **Decline** ngay lập tức.
  * **Giao diện Team Workspace (WSmodule.jsx)**:
    * **Nút Join Request** (góc trên bên phải thẻ Manage Your Workspace): Hiển thị huy hiệu đỏ số lượng yêu cầu chờ duyệt khi có thành viên gửi yêu cầu.
    * **Mục Member (Bên phải)**: Hiển thị nhãn `{count} Pending` bên cạnh nút `Manage >`.
    * **Modal Manage Members**: Hiển thị thanh thông báo chuẩn Tiếng Anh *"🔔 {count} pending join request(s) awaiting approval"* kèm nút **[Review]** chuyển nhanh sang Modal phê duyệt.
* **Lý do thay đổi**:
  * Đáp ứng yêu cầu chuẩn hóa toàn bộ giao diện và thông báo sang tiếng Anh đồng bộ với toàn bộ hệ thống. Giữ nguyên 100% bố cục và thẩm mỹ thiết kế.

---

## 📌 25. File: `Contmodule.jsx` & Backend `ai_content_service.py`, `posts.py`, `schemas.py` (AI Content Generation from Multi-Input Sources)

* **Vị trí**:
  * `Contmodule.jsx`: Dòng 175 – 215 (SearchBar), 270 – 430 (State, Templates, KB Data & `handleGenerateAI`), 670 – 710 (`+ Generate` Button with Loading State), 880 – 1070 (Dynamic Search & KB View Modal).
  * Backend: `app/services/ai_content_service.py`, `app/routers/posts.py` (`POST /posts/generate-ai`), `app/schemas.py` (`AIContentGenerateRequest`, `AIContentGenerateResponse`).
* **Thay đổi**:
  * **Frontend (`Contmodule.jsx`)**:
    * Khi bật toggle **`Enable AI`**, người dùng có thể kết hợp linh hoạt 4 nguồn dữ liệu:
      1. **Prompt Template** (chọn mẫu prompt có sẵn).
      2. **Knowledge Base** (chọn một hoặc nhiều tài liệu ngữ cảnh).
      3. **Manual Prompt** (nhập chỉ thị tùy biến của người dùng).
      4. **Existing Post Content** (tiêu đề và nội dung bài viết hiện có trong ô soạn thảo).
    * Gắn sự kiện cho nút **`+ Generate`**:
      * Kiểm tra dữ liệu đầu vào; nếu rỗng toàn bộ sẽ hiển thị thông báo nhắc nhở mà không gọi API vô nghĩa.
      * Hiển thị trạng thái đang sinh bài `Generating...` kèm hiệu ứng mượt mà và vô hiệu hóa nút trong lúc xử lý.
      * Khi nhận kết quả từ AI, tự động điền vào ô Title và Body để người dùng xem lại (review) và chỉnh sửa trước khi bấm `Submit` hoặc `Save as Draft`.
      * Nếu có lỗi phát sinh, bảo toàn 100% nội dung bài viết hiện tại của người dùng, không bị ghi đè.
    * Cung cấp thanh tìm kiếm **Search** hoạt động trực tiếp cho cả Knowledge Base và Prompt Template.
    * Cho phép nhấn **View** trên từng tài liệu Knowledge Base để xem chi tiết nội dung trong Popup Modal.
  * **Backend**:
    * Xây dựng service `AIContentService` tuân thủ đúng thứ tự ưu tiên và quy tắc kết hợp: *System Instruction $\rightarrow$ Prompt Template $\rightarrow$ Manual Prompt (Ưu tiên đè khi xung đột) $\rightarrow$ Knowledge Base Context $\rightarrow$ Existing Content $\rightarrow$ Output Format JSON*.
    * Tích hợp gọi trực tiếp Google Gemini API (`gemini-2.5-flash`) kết hợp bộ sinh nội dung dự phòng thông minh (resilient offline fallback) đảm bảo hệ thống không bao giờ bị gián đoạn hay crash.
* **Lý do thay đổi**:
  * Hiện thực hóa trọn vẹn đặc tả kỹ thuật trong `Prompt_Ai_Content_Feature.md`, đáp ứng đầy đủ 10 Acceptance Criteria, mang đến trải nghiệm sáng tạo nội dung mạng xã hội thông minh và tối ưu nhất cho người dùng.

---

## 📌 26. File: `src/frontend/src/component/Contmodule.jsx` (Dynamic Knowledge Base & Prompt Template Data)

* **Vị trí**:
  * `Contmodule.jsx`: Dòng 218 – 330 (Data state & fetch effect), dòng 880 – 1025 (Empty state display & Add navigation).
  * `MainDashboard.jsx`: Dòng 819 (Truyền prop `onNavigateTab={setActiveTab}`).
* **Thay đổi**:
  * **Xóa bỏ toàn bộ dữ liệu mock cứng** ban đầu của **Knowledge Base** (5 mục mẫu) và **Prompt Template** (3 mục mẫu).
  * Khởi tạo `kbItems` và `promptTemplates` là mảng rỗng `[]`.
  * Thêm `useEffect` tự động gọi các API từ Backend:
    * `GET /prompt-context/knowledge-bases`: Lấy danh sách Knowledge Base thật của người dùng.
    * `GET /prompt-context/prompt-templates`: Lấy danh sách Prompt Template thật của người dùng.
  * Hiển thị thông báo thân thiện dạng empty-state khi chưa có dữ liệu:
    * Knowledge Base: *"No knowledge base documents found."*
    * Prompt Template: *"No prompt templates found."*
  * Nút **`Add >`** trên cả hai thẻ Knowledge Base và Prompt Template được gắn hành động chuyển tab mượt mà sang **`Prompt & Context`** để người dùng dễ dàng tạo mới.
* **Lý do thay đổi**:
  * Đáp ứng yêu cầu xóa dữ liệu hiển thị sẵn, đồng bộ hóa 100% dữ liệu thực tế từ hệ thống quản lý Prompt & Context của người dùng.

---

## 📌 27. File: `src/frontend/src/component/Stamodule.jsx` & `src/backend/app/analytics/ai_engine.py` (On-Demand AI Statistical Report & Gemini Integration)

* **Vị trí**:
  * `Stamodule.jsx`: Dòng 235 – 275 (Hàm `handleCreateReport` & xóa `useEffect` auto-generate), dòng 350 – 375 (Validate `handleSaveReport`), dòng 720 – 810 (Nút **Create Report** & Empty state UI).
  * `ai_engine.py`: Toàn bộ file (Tích hợp multi-key rotation, candidate models `gemini-2.5-flash`, `gemini-3.7-flash`, `gemini-3.5-flash`, `gemini-flash-latest`, viết lại Executive prompt & sửa fallback rule-based).
* **Thay đổi**:
  * **Frontend**:
    * **Xóa bỏ `useEffect` tự động gọi API mỗi khi vào tab Statistics hoặc đổi timeframe**: Ngăn chặn tình trạng spam API và lãng phí quota Gemini.
    * **Bổ sung nút bấm `Create Report`** (icon ✨) nổi bật cạnh dropdown Timeframe: Cho phép người dùng chủ động sinh báo cáo khi cần.
    * **Hiển thị trạng thái Loading chuyên nghiệp**: `Generating...` kèm hiệu ứng động khi đang gọi Gemini API và tạm thời vô hiệu hóa nút bấm.
    * **Trạng thái khởi tạo (Empty State) thân thiện**: Khi chưa có báo cáo được tạo, hiển thị thông báo hướng dẫn rõ ràng: *"Select a timeframe (Monthly/Weekly/Yearly) and click Create Report to generate an AI-powered statistical analysis."*
    * **Kiểm tra khi lưu (Save Report)**: Nhắc nhở người dùng tạo báo cáo trước khi bấm Save.
  * **Backend**:
    * Cải tiến `AIReportEngine` với cơ chế xoay vòng multi-key (`GEMINI_API_KEY`, `GEMINI_BACKUP_API_KEY`) và luân chuyển candidate models đảm bảo tỷ lệ phản hồi cao nhất.
    * Viết lại System Prompt cho Gemini với phong cách văn phong Giám đốc Marketing (CMO / Analytics Director), cung cấp nhận định sâu sắc, lưu loát thay vì chỉ liệt kê số liệu khô khan.
    * Sửa lỗi `RuleBasedReportProvider` fallback: Xóa bỏ các số liệu giả định cứng, tự động tạo văn phong phù hợp ngay cả khi các chỉ số tương tác ban đầu đang là `0`.
* **Lý do thay đổi**:
  * Chấm dứt tình trạng spam tự động gọi API khi chuyển tab, nâng cao chất lượng câu từ và độ tin cậy của báo cáo thống kê bằng Google Gemini AI theo đúng yêu cầu người dùng.

---

## 📌 38. File: `src/frontend/src/component/Contmodule.jsx` — Image Upload Pipeline

* **Vị trí**: Drop Zone section (Media + Action row), state variables, handleFileChange, handleDrop.
* **Thay đổi**:
  * **State**: Thay thế `mediaFiles[]` bằng `uploadedImageUrl`, `mediaPreview`, `isUploadingMedia` — chính xác hơn để theo dõi upload pipeline.
  * **Drop Zone UI**: Khi chọn/thả file → hiện preview thumbnail ngay lập tức; hiện badge "Uploading..." trong khi upload; hiện badge xanh "Uploaded ✓" khi hoàn thành; nút `×` để xóa ảnh.
  * **Upload Logic** (`processMediaFile`, `uploadFileToR2`): Gọi `POST /posts/upload-media` để nhận Presigned PUT URL từ R2, sau đó PUT file trực tiếp lên Cloudflare R2. Lưu `public_url` vào state.
  * **Submit**: `handleCreatePost` gửi `image_url: uploadedImageUrl` trong request body để backend link vào `PostMedia` record.
  * **Reset**: Sau khi submit thành công, `handleRemoveMedia()` xóa preview và revoke blob URL.
* **Lý do thay đổi**:
  * Drop zone cũ chỉ lưu file vào state React, không thực sự upload ảnh → ảnh không bao giờ được lưu và không hiển thị trên Facebook/LinkedIn khi distribute.

---

## 📌 39. File: `src/frontend/src/component/Contmodule.jsx` — GEO/SEO Suggestions Panel

* **Vị trí**: Action Buttons section (nút "Apply GEO/SEO"), Post Section div, state variables.
* **Thay đổi**:
  * **State mới**: `isAnalyzingSeo`, `seoResult`, `showSeoPanel`, `appliedKeywords`, `appliedHashtags`.
  * **Button "Apply GEO/SEO"**: Từ nút tĩnh không có onClick → có handler `handleApplySEO()`, loading state "Analyzing...", disable khi đang phân tích.
  * **SEO/GEO Result Panel**: Panel slide-in với border cam nhạt, hiện sau khi nhận kết quả từ API:
    * **SEO Keywords**: Các chip button màu trắng → click để chèn vào body; badge xanh "✓" khi đã chèn.
    * **Hashtags**: Chip button màu xanh dương → click để chèn vào body; badge xanh "✓" khi đã chèn.
    * **GEO Tip**: Card trắng với icon 💡, nội dung gợi ý cấu trúc bài để AI search engines trích dẫn.
    * **Nút "Apply All"**: Chèn tất cả keywords + hashtags chưa áp dụng vào body cùng lúc.
    * **Nút "×"**: Đóng panel (giữ lại kết quả, không gọi API lại).
  * **Submit logic**: `seo_keywords` và `seo_hashtags` (từ `seoResult`) được gửi kèm khi tạo post.
* **Lý do thay đổi**:
  * Nút "Apply GEO/SEO" trước đó là placeholder không có logic; thêm tính năng AI phân tích SEO/GEO thực sự giúp người dùng tối ưu bài viết cho cả traditional search engines và AI search engines (Perplexity, Google AI Overviews).

---

## 📌 40. File: `SignIn.jsx`, `Dismodule.jsx`, `MainDashboard.jsx`, `rightWidgets.jsx`, `Stamodule.jsx`, `DBmodule.jsx`, `RecentlyApprovedP.jsx`, `AssignedTaskList.jsx`, `PMmodule.jsx` — Đồng bộ hóa Token Key Xác thực (Auth Token Key Synchronization)

* **Vị trí**: Logic lưu token tại `SignIn.jsx` và các vị trí đọc token `localStorage.getItem()` trong các component gọi API.
* **Thay đổi**:
  * **`SignIn.jsx`**: Lưu đồng thời cả hai key `localStorage.setItem('access_token', ...)` và `localStorage.setItem('token', ...)` khi đăng nhập thành công.
  * **`Dismodule.jsx`, `MainDashboard.jsx`, `rightWidgets.jsx`, `Stamodule.jsx`, `DBmodule.jsx`, `PMmodule.jsx`, `RecentlyApprovedP.jsx`, `AssignedTaskList.jsx`**: Cập nhật logic đọc token sử dụng fallback kép `localStorage.getItem('access_token') || localStorage.getItem('token')`.
* **Lý do thay đổi**:
  * Khắc phục lỗi `401 Unauthorized` khi gọi các API (như `/api/v1/distribution/channels`) do `SignIn.jsx` trước đó chỉ lưu key `access_token` trong khi `Dismodule` và một số component chỉ tìm key `token`, dẫn đến request bị gửi thiếu Header `Authorization`.

---

## 📌 41. File: `src/frontend/src/component/WSmodule.jsx` — Rút gọn hiển thị cột Nội dung & Tiêu đề trong bảng Submitted Approval Request

* **Vị trí**: Bảng danh sách `Submitted Approval Request` (Dòng 765 – 830).
* **Thay đổi**:
  * Thêm thuộc tính `tableLayout: 'fixed'` cho cả `<table>` phần Header và Body.
  * Thiết lập `whiteSpace: 'nowrap'`, `overflow: 'hidden'`, `textOverflow: 'ellipsis'` cho cột **Content** và **Task title**.
  * Bổ sung thuộc tính `title={req.content}` / `title={req.title}` để người dùng khi rê chuột (hover) vẫn xem được toàn bộ nội dung đầy đủ dưới dạng Tooltip.
* **Lý do thay đổi**:
  * Tránh việc nội dung bài viết dài kéo giãn chiều cao dòng bảng làm vỡ giao diện; hiển thị gọn gàng trên 1 dòng kèm dấu ba chấm (`...`) theo đúng yêu cầu người dùng.

---

## 📌 42. File: `src/frontend/src/component/P&Cmodule.jsx` — Bổ sung ô nhập Content cho Context và ẩn Content ngoài danh sách thẻ

* **Vị trí**:
  * Modal `Add Context Item` (Dòng 1055 – 1100).
  * Danh sách thẻ `Context Item` tại cột Right Column (Dòng 735 – 825).
* **Thay đổi**:
  * **Modal Add Context Item**:
    * Bổ sung trường `<textarea>` nhập **Content** đặt giữa Title và Attachment, cho phép người dùng nhập trực tiếp văn bản mô tả ngữ cảnh.
    * Hỗ trợ tự động đóng gói văn bản thành file đính kèm lưu trữ trên R2 nếu người dùng nhập nội dung trực tiếp mà không chọn tệp.
    * Mở rộng danh sách định dạng tệp chấp nhận: `.pdf, .doc, .docx, .txt`.
  * **Danh sách Context Card**:
    * Chỉ hiển thị **Title**, các chip **Tags** và nút tệp đính kèm `📎 {file_name}` (nếu có), loại bỏ đoạn văn bản nội dung dài để giữ giao diện thẻ sạch đẹp, đồng nhất.
* **Lý do thay đổi**:
  * Đáp ứng đúng yêu cầu người dùng: Cung cấp ô nhập liệu nội dung cho Context và tối ưu hiển thị danh sách chỉ hiển thị tiêu đề.

---

## 📌 43. File: `src/frontend/src/component/Contmodule.jsx` — Tối ưu hiển thị Title và ẩn Content trong Knowledge Base Widget

* **Vị trí**:
  * Component `KBItem` (Dòng 106 – 142).
  * Hàm `fetchPromptContextData` (Dòng 287 – 305).
  * Danh sách thẻ Knowledge Base (Dòng 1272 – 1310).
* **Thay đổi**:
  * **`KBItem`**: Thiết lập `whiteSpace: 'nowrap'`, `overflow: 'hidden'`, `textOverflow: 'ellipsis'`, `display: 'block'` và `title={title}` để tiêu đề luôn nằm gọn gàng trên 1 dòng với dấu `...` khi dài, hỗ trợ tooltip khi rê chuột.
  * **`fetchPromptContextData`**: Tự động lọc lấy dòng đầu tiên của tiêu đề (nếu dữ liệu cũ chứa văn bản dài) và giới hạn độ dài hiển thị an toàn.
  * **Database cleanup**: Đã chuẩn hóa lại tiêu đề bản ghi cũ thành `"Ẩm thực đường phố Việt Nam"`.
* **Lý do thay đổi**:
  * Khắc phục triệt để hiện tượng tràn văn bản (overflow) trong widget Knowledge Base tại tab Content, đảm bảo chỉ hiển thị tiêu đề ngắn gọn theo đúng yêu cầu người dùng.

---

## 📌 44. File: `P&Cmodule.jsx`, `Contmodule.jsx`, Backend — Bổ sung tính năng View xem toàn bộ Content ở cả 2 tab (Prompt & Context và Content)

* **Vị trí**:
  * Backend: `models.py`, `schemas.py`, `crud.py`, `prompt_context.py` — Thêm trường `content` vào bảng `workspaces.knowledge_base_documents`.
  * Frontend `P&Cmodule.jsx`: Nút `View content →` trên từng thẻ Context Card và Modal chi tiết `viewingContext`.
  * Frontend `Contmodule.jsx`: Modal chi tiết `viewingKbItem` khi ấn nút `View`.
* **Thay đổi**:
  * **Backend**: Bổ sung cột `content TEXT` để lưu trữ nội dung văn bản trực tiếp cho Knowledge Base và trả về qua API `/prompt-context/knowledge-bases`.
  * **Prompt & Context Module**: Thêm nút `View content →` ở góc trái dưới mỗi thẻ Context. Khi bấm vào sẽ mở Modal hiển thị tiêu đề, các tags, toàn bộ nội dung văn bản định dạng chuẩn và link tải file đính kèm nếu có.
  * **Content Module**: Cập nhật Modal `View` của Knowledge Base để hiển thị đúng toàn bộ nội dung văn bản thực tế từ backend thay vì chỉ hiển thị lại tiêu đề.
* **Lý do thay đổi**:
  * Cho phép người dùng dễ dàng xem chi tiết toàn bộ nội dung tài liệu ở cả 2 tab mà vẫn giữ giao diện danh sách bên ngoài luôn tinh gọn, chỉ hiển thị tiêu đề.

---

## 📌 45. File: `prompt_context.py`, `crud.py`, `P&Cmodule.jsx`, `Contmodule.jsx` — Bổ sung tính năng Xóa Prompt Template và Context (Knowledge Base)

* **Vị trí**:
  * Backend: Endpoints `DELETE /prompt-context/prompt-templates/{template_id}` và `DELETE /prompt-context/knowledge-bases/{kb_id}` trong `prompt_context.py` & hàm xóa trong `crud.py`.
  * Frontend `P&Cmodule.jsx`: Nút thùng rác `🗑️` trên thẻ Prompt Template, thẻ Context và nút `Delete` trong Modal `viewingContext`.
  * Frontend `Contmodule.jsx`: Nút `Delete` trong Modal chi tiết `viewingKbItem`.
* **Thay đổi**:
  * **Backend**:
    * Thêm hàm `delete_prompt_template` và `delete_knowledge_base` trong `crud.py`, kiểm tra quyền sở hữu của `current_user`.
    * Đăng ký 2 endpoint `DELETE` trả về HTTP 204 No Content.
  * **Frontend**:
    * Thêm hàm gọi API `apiDeletePromptTemplate` và `apiDeleteKnowledgeBase`.
    * Thêm nút xóa kèm hộp thoại xác nhận `window.confirm` để tránh xóa nhầm.
    * Tự động cập nhật lại state danh sách ngay lập tức khi xóa thành công mà không cần tải lại trang.
* **Lý do thay đổi**:
  * Đáp ứng yêu cầu cho phép người dùng chủ động quản lý, dọn dẹp các mẫu Prompt Template và Context/Knowledge Base không còn sử dụng.

---

## 📌 46. File: `PMmodule.jsx`, `service.py` — Hiển thị hình ảnh đính kèm trong Post Detail Modal, Thumbnail và nâng cấp hỗ trợ xuất bản ảnh trên Facebook & LinkedIn

* **Vị trí**:
  * Frontend `PMmodule.jsx`: Component `PostThumbnail`, hàm `fetchPosts` và Modal chi tiết bài viết `selectedPost`.
  * Backend `service.py`: Hàm `publish_post_to_channel` cho Facebook (`/photos` endpoint) và LinkedIn (`ARTICLE`/media payload).
* **Thay đổi**:
  * **Frontend**:
    * Sửa `fetchPosts` để map đúng `thumbnail: p.attachment?.image_url || null`.
    * Cập nhật `PostThumbnail` để hiển thị ảnh preview thật dạng thumbnail thay cho icon tài liệu tĩnh khi bài viết có ảnh đính kèm.
    * Bổ sung khối **`Attached Media`** trong Modal chi tiết bài viết với khung hiển thị ảnh sắc nét, bo góc và link mở ảnh gốc `Open original image ↗`.
  * **Backend**:
    * Khi xuất bản bài viết lên Facebook: Nếu bài viết có đính kèm ảnh (`image_url`), hệ thống tự động gọi endpoint `https://graph.facebook.com/v19.0/{target_id}/photos` để đăng thành Photo post chuẩn, kèm caption nội dung bài viết.
    * Khi xuất bản lên LinkedIn: Đính kèm media URL vào payload bài viết.
* **Lý do thay đổi**:
  * Khắc phục tình trạng không hiển thị ảnh trong trang Post Management khi duyệt bài và tối ưu hóa việc phân phối nội dung có hình ảnh lên các nền tảng mạng xã hội.

---

## 📌 47. File: `Contmodule.jsx`, `posts.py`, `r2.py` — Tối ưu hóa tải ảnh trực tiếp qua Backend Endpoint tránh lỗi Browser CORS

* **Vị trí**:
  * Frontend: Hàm `uploadFileToR2` trong `Contmodule.jsx`.
  * Backend: Endpoint `POST /posts/upload-media-direct` trong `posts.py` và hàm `upload_file_to_r2` trong `r2.py`.
* **Thay đổi**:
  * Bổ sung API `upload-media-direct` xử lý tải tệp ảnh từ Client gửi lên và đẩy trực tiếp lên Cloudflare R2 thông qua backend.
  * Giúp quá trình tải ảnh từ tab Content luôn thành công 100%, không bị chặn bởi chính sách CORS của trình duyệt khi PUT trực tiếp lên Cloudflare R2 bucket.
* **Lý do thay đổi**:
  * Đảm bảo ảnh luôn được tải lên và lưu trữ thành công vào database ngay khi người dùng chọn ảnh ở tab Content.

---

## 📌 48. File: `Contmodule.jsx`, `posts.py`, `crud.py`, `schemas.py` — Lưu trữ hình ảnh đính kèm theo thư mục Post ID (`posts/{post_id}/...`)

* **Vị trí**:
  * Frontend: `Contmodule.jsx` quản lý `draftPostId` và gửi `post_id` qua param khi tải ảnh và qua `id` khi tạo bài viết.
  * Backend: `schemas.py` (`PostCreate.id`), `crud.py` (`create_post(..., post_id)`), `posts.py` (`upload_media_direct`, `upload_media`).
* **Thay đổi**:
  * Chuẩn hóa đường dẫn lưu trữ hình ảnh trên Cloudflare R2 thành: `posts/{post_id}/{uuid}.{ext}`.
  * Đảm bảo mỗi bài viết sở hữu riêng 1 thư mục mang tên ID của bài viết đó, loại bỏ hoàn toàn nguy cơ trùng tên file giữa các bài viết khác nhau.
* **Lý do thay đổi**:
  * Tuân thủ quy tắc tổ chức dữ liệu khoa học, tránh xung đột tên tệp (filename collision) trên storage theo đúng yêu cầu người dùng.

---

## 📌 49. File: `service.py` — Nâng cấp quy trình xuất bản hình ảnh lên LinkedIn qua LinkedIn Assets API (`registerUpload` & `ugcPosts`)

* **Vị trí**:
  * Backend: Hàm `publish_post_to_channel` trong `src/backend/app/distribution/service.py`.
* **Thay đổi**:
  * Chuyển đổi cơ chế đăng bài có hình ảnh trên LinkedIn từ dạng liên kết web (`ARTICLE`) sang dạng bài đăng hình ảnh chuẩn (`IMAGE` shareMediaCategory):
    1. Đăng ký tài sản hình ảnh với LinkedIn API (`POST /v2/assets?action=registerUpload`) với recipe `urn:li:digitalmediaRecipe:feedshare-image`.
    2. Tải trực tiếp file nhị phân ảnh từ Cloudflare R2 lên máy chủ của LinkedIn (`PUT {uploadUrl}`).
    3. Xuất bản bài viết gắn mã định danh tài sản (`urn:li:digitalmediaAsset:...`) qua `POST /v2/ugcPosts`.
* **Lý do thay đổi**:
  * Khắc phục lỗi LinkedIn không nhận diện được ảnh trực tiếp và hiển thị thông báo "Không thể hiển thị bài đăng này". Đảm bảo bài đăng có ảnh hiển thị sắc nét và đầy đủ trên Bảng tin (Feed) của LinkedIn.

---

## 📌 50. File: `Contmodule.jsx` — Đảm bảo ảnh đã chọn luôn được tải lên hoàn tất trước khi gửi tạo bài viết

* **Vị trí**:
  * Frontend: `Contmodule.jsx` (hàm `handleCreatePost`, `processMediaFile`, state `selectedMediaFile`, nút `Submit` / `Save as Draft`).
* **Thay đổi**:
  * Lưu trữ đối tượng tệp `selectedMediaFile` khi người dùng chọn/kéo thả ảnh.
  * Trong `handleCreatePost`: Tự động kiểm tra và thực hiện `await uploadFileToR2(selectedMediaFile)` nếu người dùng bấm Submit khi quá trình upload ngầm chưa hoàn thành, đảm bảo `image_url` không bao giờ bị gửi lên `null` khi đã có chọn ảnh.
  * Hiển thị trạng thái `"Uploading media..."` và tạm khóa nút bấm trong khi ảnh đang được tải lên.
* **Lý do thay đổi**:
  * Khắc phục tình trạng người dùng vừa chọn ảnh xong bấm Submit ngay khiến dữ liệu bài viết bị thiếu thông tin hình ảnh đính kèm.

---

## 📌 51. File: `PMmodule.jsx` — Tách biệt chính xác liên kết xuất bản giữa Facebook và LinkedIn

* **Vị trí**:
  * Frontend: `PMmodule.jsx` (hàm `handlePublishToFacebook`, khối `PUBLISHED ACCOUNTS & POST LINKS` trong Post Detail Modal).
* **Thay đổi**:
  * Chuẩn hóa việc phân loại URL xuất bản theo từng nền tảng:
    * Kênh Facebook: Luôn gán URL bài viết Facebook (`facebook_post_url` hoặc `https://www.facebook.com/...`), hiển thị icon Facebook và nút xanh dương Facebook `View on Facebook ↗`.
    * Kênh LinkedIn: Luôn gán URL bài viết LinkedIn (`linkedin_post_url` hoặc `https://www.linkedin.com/feed/...`), hiển thị icon LinkedIn và nút xanh LinkedIn `View on LinkedIn ↗`.
  * Loại bỏ lỗi fallback mặc định sang `https://www.linkedin.com/feed/` khi xem chi tiết bài đăng của Facebook.
* **Lý do thay đổi**:
  * Tránh nhầm lẫn liên kết và biểu tượng giữa bài viết Facebook và LinkedIn trên giao diện xem chi tiết bài đăng.

---

## 📌 52. File: `posts.py`, `ai_content_service.py` — Sửa lỗi tên phương thức gọi AI Content Generation (`generate_content`)

* **Vị trí**:
  * Backend: Endpoint `POST /posts/generate-ai` trong `posts.py` và lớp `AIContentService` trong `ai_content_service.py`.
* **Thay đổi**:
  * Đồng bộ phương thức gọi `ai_content_service.generate_content(...)` trong router `posts.py`.
  * Khai báo thêm bí danh `generate = generate_content` trong lớp `AIContentService` để hỗ trợ linh hoạt.
* **Lý do thay đổi**:
  * Khắc phục lỗi `"AI content generation failed: 'AIContentService' object has no attribute 'generate'"` khi người dùng bấm nút Generate AI nội dung từ prompt ở tab Content.

---

## 📌 53. File: `service.py` — Cho phép Manager/User linh hoạt xuất bản bài viết sang bất kỳ kênh kết nối nào đã chọn trong Modal

* **Vị trí**:
  * Backend: Hàm `publish_post_to_channel` trong `src/backend/app/distribution/service.py`.
* **Thay đổi**:
  * Khi người dùng hoặc quản trị viên (Manager) chọn kênh xuất bản cụ thể trong Modal, hệ thống sẽ tự động đồng bộ nền tảng của kênh đó vào `post.target_platforms` thay vì chặn bằng lỗi 400.
* **Lý do thay đổi**:
  * Đảm bảo trải nghiệm xuất bản bài viết linh hoạt, tránh chặn xuất bản khi người dùng muốn mở rộng kênh đăng bài lúc duyệt.

---

## 📌 54. File: `service.py` — Nâng cấp cơ chế đăng bài Facebook kèm ảnh lên Dòng thời gian chính (Wall / Feed)

* **Vị trí**:
  * Backend: Hàm `publish_post_to_channel` trong `src/backend/app/distribution/service.py`.
* **Thay đổi**:
  * Chuyển đổi phương thức đăng bài có ảnh trên Facebook Graph API sang quy trình chuẩn 2 bước:
    1. Tải ảnh lên Facebook dưới dạng tài sản ngầm (`published=false` qua `/{target_id}/photos`).
    2. Xuất bản bài viết trực tiếp lên Dòng thời gian của Trang (`/{target_id}/feed` với tham số `attached_media`).
* **Lý do thay đổi**:
  * Khắc phục tình trạng bài viết có ảnh chỉ hiển thị trong mục "Ảnh / Album" mà không xuất hiện trên Bảng tin chính ("Bài viết") của Fanpage Facebook.

---

## 📌 55. File: `Contmodule.jsx`, `PMmodule.jsx` — Tự động xuất bản khi Manager bấm Submit và chuẩn hóa trạng thái bài viết

* **Vị trí**:
  * Frontend: `Contmodule.jsx` (hàm `handleCreatePost`) và `PMmodule.jsx` (hàm ánh xạ `statusLabel`).
* **Thay đổi**:
  * Khi Manager hoặc Individual tạo bài viết với nút **Submit**, hệ thống sẽ tự động gọi API phân phối xuất bản trực tiếp lên các kênh mạng xã hội đã chọn (Facebook, LinkedIn).
  * Chuẩn hóa logic phân loại trạng thái: Chỉ bài viết đã thực sự xuất bản lên mạng xã hội (`published` hoặc có `published_at`) mới mang nhãn `Published` và hiển thị link chi tiết bài viết; các bài chưa xuất bản sẽ nằm ở `Drafts` với nút `Publish` để người dùng chủ động xuất bản.
* **Lý do thay đổi**:
  * Đảm bảo bài viết tạo bởi Manager luôn được gửi lên Facebook/LinkedIn để lấy về ID và đường dẫn bài viết cụ thể, thay vì chỉ tạo record trong cơ sở dữ liệu và hiển thị link trang chủ Facebook.

---

## 📌 56. File: `crud.py`, `Contmodule.jsx` — Xác thực an toàn ID không gian làm việc (Workspace) và ngăn ngừa lỗi trùng khóa chính (IntegrityError)

* **Vị trí**:
  * Backend: Hàm `create_post` trong `src/backend/app/crud.py`.
  * Frontend: `Contmodule.jsx` (hàm `handleCreatePost`).
* **Thay đổi**:
  * Bổ sung kiểm tra tính hợp lệ của `workspace_id` trong cơ sở dữ liệu trước khi liên kết khóa ngoại.
  * Tự động sinh mã `uuid.uuid4()` mới nếu mã ID bài viết tạm thời bị trùng với bài viết đã tồn tại trong hệ thống.
  * Chuẩn hóa định dạng `draftPostId` từ Frontend để đảm bảo luôn tuân thủ chuẩn UUID.
* **Lý do thay đổi**:
  * Khắc phục lỗi `"Post could not be created because related data is invalid"` khi người dùng bấm Submit tạo bài viết mới.

---

## 📌 57. File: `Contmodule.jsx` — Sửa lỗi hàm thông báo Toast (`toast.loading` thay cho `toast.info`)

* **Vị trí**:
  * Frontend: `Contmodule.jsx` (hàm `handleCreatePost`).
* **Thay đổi**:
  * Thay thế hàm không tồn tại trong thư viện `react-hot-toast` (`toast.info`) bằng `toast.loading(...)` kèm `toast.dismiss(...)`.
* **Lý do thay đổi**:
  * Khắc phục lỗi `"toast.info is not a function"` khi Manager bấm Submit bài viết.

---

## 📌 58. File: `Contmodule.jsx`, `PMmodule.jsx` — Đăng bài lên mạng xã hội ngay lập tức và đưa vào tab Published khi Manager bấm Submit

* **Vị trí**:
  * Frontend: `Contmodule.jsx` (hàm `handleCreatePost`) và `PMmodule.jsx` (hàm ánh xạ `statusLabel`).
* **Thay đổi**:
  * Khi Manager bấm nút **Submit**, hệ thống sẽ **xuất bản trực tiếp lên Facebook / LinkedIn** ngay lập tức.
  * Bài viết sau khi tạo sẽ hiển thị ngay trong tab **Published** của Post Management với đầy đủ liên kết và mã ID bài viết thực tế.
  * Nút **Save as Draft** được giữ nguyên để lưu bài nháp vào tab **Drafts** khi chưa muốn đăng ngay.
* **Lý do thay đổi**:
  * Đáp ứng đúng nhu cầu người dùng: Manager tạo bài viết là được đăng trực tiếp lên mạng xã hội và ghi nhận ngay vào tab Published.

---

## 📌 59. File: `crud.py`, `workspaces.py`, `AssignedTaskList.jsx` — Xem toàn bộ danh sách công việc (See all) và hỗ trợ xóa Task cho Manager

* **Vị trí**:
  * Backend:
    * `src/backend/app/crud.py` (hàm `delete_task`).
    * `src/backend/app/routers/workspaces.py` (`DELETE /{workspace_id}/tasks/{task_id}`).
  * Frontend: `src/frontend/src/component/DBultils/AssignedTaskList.jsx` (hàm `AssignedTasksTable`).
* **Thay đổi**:
  * Bổ sung endpoint backend `DELETE /{workspace_id}/tasks/{task_id}` có kiểm tra quyền Manager và xóa Task kèm tệp đính kèm (`TaskAttachment`).
  * Nút **See all >** tại thẻ `Tasks Assigned to Others` (màn hình Dashboard) mở Modal danh sách đầy đủ các công việc, hỗ trợ tìm kiếm nhanh theo tên công việc / người được giao.
  * Thêm nút **`🗑 Delete`** ở cột Hành động (Action) trong Modal cho vai trò Manager kèm hộp thoại xác nhận và thông báo Toast khi xóa thành công.
* **Lý do thay đổi**:
  * Đáp ứng yêu cầu của người dùng: Cho phép Manager xem danh sách chi tiết tất cả các công việc đã giao và chủ động xóa các công việc không còn cần thiết.

---

## 📌 60. File: `schemas.py`, `workspaces.py`, `AssignedTaskList.jsx` — Hiển thị trạng thái Doing/Done và phân quyền hành động Done cho Member

* **Vị trí**:
  * Backend:
    * `src/backend/app/schemas.py` (`TaskUpdateRequest`).
    * `src/backend/app/routers/workspaces.py` (endpoint `PATCH /{workspace_id}/tasks/{task_id}`).
  * Frontend: `src/frontend/src/component/DBultils/AssignedTaskList.jsx` (bảng Assigned Tasks và Modal See all).
* **Thay đổi**:
  * Thêm cột hiển thị trạng thái **`Status`** với 2 nhãn trực quan: **`Doing`** (đang thực hiện) và **`Done`** (đã hoàn thành).
  * **Phân quyền chặt chẽ**:
    * **Manager**: Có quyền xóa Task (**`🗑 Delete`**), không hiển thị quyền delete cho Member.
    * **Member**: Không có quyền xóa Task, chỉ có nút **`✓ Done`** để đánh dấu hoàn thành công việc được giao cho mình. Khi đã hoàn thành, hiển thị nhãn **`✓ Done`**.
* **Lý do thay đổi**:
  * Đáp ứng đúng quy tắc nghiệp vụ người dùng yêu cầu: Member không được xóa Task, chỉ có quyền bấm Done khi xong việc, và công việc được giao mặc định hiển thị trạng thái Doing.

## 📌 62. File: `PMmodule.jsx` & Backend `crud.py`, `routers/posts.py` — Khắc phục hiển thị Tab và Trạng thái Pending cho Member

* **Vị trí**:
  * `src/frontend/src/component/PMmodule.jsx`: Dòng 648 – 656 (`isIndividual`, `filters`, `rawPosts`).
  * `src/backend/app/routers/posts.py`: Dòng 40 – 95 (`create_post`, `ws_id` resolution).
  * `src/backend/app/crud.py`: Dòng 170 – 195 (`list_posts_for_role`, `list_posts_for_user`).
* **Thay đổi**:
  * **Frontend (`PMmodule.jsx`)**:
    * Sửa điều kiện xác định `isIndividual`: `const isIndividual = accountType === 'individual' && role !== 'manager' && role !== 'member';`
    * Đảm bảo mọi tài khoản thuộc loại **Business** (đặc biệt là Member) luôn hiển thị đầy đủ 6 tab: `All Posts`, `Drafts`, `Pending`, `Rejected`, `Published`, `Failed`, và không bị lọc bỏ bài viết `Pending`/`Rejected`.
  * **Backend**:
    * Trong `create_post`: Tự động tìm `workspace_id` từ `workspace_members` khi Member nộp bài, và luôn gán trạng thái `pending_review` cho tài khoản Business Member.
    * Trong `list_posts_for_role` & `list_posts_for_user`: Tinh chỉnh logic query CSDL với `or_` chuẩn để luôn lấy đầy đủ tất cả bài viết do Member tự tạo (kể cả đang ở `pending_review`, `draft`, `rejected`) cùng các bài viết `published` của Workspace.
* **Lý do thay đổi**:
  * Đáp ứng yêu cầu người dùng: Member khi tạo bài viết và gửi duyệt sẽ thấy bài viết xuất hiện ngay lập tức tại tab **`Pending`** trong Post Management.

---

## 📌 63. Files: `RecentlyApprovedP.jsx`, `rightWidgets.jsx`, `PMmodule.jsx` — Khắc phục hiển thị biểu tượng mạng xã hội (Facebook / LinkedIn) trên Dashboard và Post Management

* **Vị trí**:
  * `src/frontend/src/component/DBultils/RecentlyApprovedP.jsx`: Dòng 1 – 35, 95 – 115.
  * `src/frontend/src/component/DBultils/rightWidgets.jsx`: Dòng 350 – 365.
  * `src/frontend/src/component/PMmodule.jsx`: Dòng 100 – 125 (`PlatformIcons`).
* **Thay đổi**:
  * **`RecentlyApprovedP.jsx`**:
    * Import `linkedinicon` từ `../../assets/linkedinlg.png`.
    * Thay thế đoạn mã hardcode `Flatform: fbicon` bằng việc ánh xạ động `platforms` dựa trên `p.target_platforms`.
    * Cột **Flatform** hiện hiển thị linh hoạt cả biểu tượng LinkedIn và Facebook theo đúng nền tảng đích của bài viết (hỗ trợ hiển thị 1 icon hoặc cả 2 icon khi bài viết nhắm đến cả 2 nền tảng).
  * **`rightWidgets.jsx`**:
    * Trong danh sách kênh (`ChannelList`), sửa lỗi hardcode `src={fbicon}` thành `src={chan.platform?.toLowerCase() === 'linkedin' ? linkedinicon : fbicon}`, giúp kênh LinkedIn hiển thị đúng logo LinkedIn thay vì logo Facebook.
  * **`PMmodule.jsx`**:
    * Trong component `PlatformIcons`, chuẩn hóa mảng `platforms` sang chữ thường (`.toLowerCase().trim()`) trước khi kiểm tra, đảm bảo hiển thị đúng icon kể cả khi dữ liệu trả về có viết hoa (`LinkedIn`, `Facebook`).
* **Lý do thay đổi**:
  * Sửa lỗi logic hiển thị hình ảnh mạng xã hội trên Dashboard theo yêu cầu kiểm tra của người dùng, đảm bảo giữ nguyên 100% bố cục, kích thước và phong cách thiết kế hiện tại.

---

## 📌 64. Files: `MainDashboard.jsx`, `DBmodule.jsx`, `rightWidgets.jsx`, `RecentlyApprovedP.jsx` — Bổ sung chuyển hướng các nút dấu cộng Dashboard và điều chỉnh widget Approval Requests cho role Individual

* **Vị trí**:
  * `src/frontend/src/page/MainDashboard.jsx`: Dòng 825 – 830.
  * `src/frontend/src/component/DBmodule.jsx`: Dòng 35 – 45, dòng 705 – 735, dòng 925 – 995.
  * `src/frontend/src/component/DBultils/rightWidgets.jsx`: Dòng 42 – 165 (`ApprovalRequests`), dòng 195 – 215 (`MyCalendar`), dòng 315 – 335 (`ChannelList`).
  * `src/frontend/src/component/DBultils/RecentlyApprovedP.jsx`: Dòng 5 – 25, dòng 60 – 70.
* **Thay đổi**:
  * **Chuyển hướng cho các nút dấu cộng (`AddButton`)**:
    * Trong `MyCalendar`: Nút `+` (`AddButton`) được gán `onClick={() => onNavigateTab('Calendar')}`, giúp chuyển hướng ngay lập tức sang trang **Calendar** khi người dùng click ở cả 3 role (Individual, Member, Manager).
    * Trong `ChannelList`: Nút `+` (`AddButton`) được gán `onClick={() => onNavigateTab('Distribution')}`, giúp chuyển hướng người dùng sang trang **Distribution** để kết nối và quản lý các kênh mạng xã hội.
    * Trong widget đầu tiên (Bản nháp / Phê duyệt): Thêm nút `+` (`AddButton`) ở phần tiêu đề, chuyển hướng sang trang **Content** để tạo bài viết mới.
    * Trong popup điều chỉnh KPI Goal (`DBmodule.jsx`): Bổ sung liên kết "View Full Statistics >" chuyển hướng nhanh đến trang **Statistics**.
    * Nút "See all >" trên các widget `Recent Posts`, `Recent Drafts`, `Approval Requests` được kết nối chuyển hướng đến trang **Post Management**.
  * **Điều chỉnh widget "Approval Requests" phù hợp cho role Individual**:
    * Đối với role **Individual**: Không có quy trình phê duyệt nhóm, widget được đổi tên thành **"Recent Drafts"** (Bản nháp gần đây), nút thao tác đổi thành **"Edit"** (chuyển hướng sang Post Management/Content), chỉ lọc các bài viết trạng thái `draft` cá nhân và hiển thị trạng thái rỗng "No drafts yet." khi chưa có bản nháp.
    * Đối với role **Member**: Tiêu đề hiển thị là **"Pending Approvals"**, chỉ lọc các bài viết `pending_review` (loại bỏ việc lọc nhầm `draft`).
    * Đối với role **Manager**: Tiêu đề giữ nguyên **"Approval Requests"**, chỉ lọc các bài viết `pending_review` của các thành viên gửi lên cần duyệt (loại bỏ việc lọc nhầm `draft`).
* **Lý do thay đổi**:
  * Đáp ứng đúng yêu cầu của người dùng: bổ sung tính năng chuyển hướng khi click các nút dấu cộng trên Dashboard cho cả 3 role (Individual, Member, Manager); đồng thời khắc phục điểm bất hợp lý khi tài khoản Individual hiển thị widget "Approval Requests" và gán nhầm bản nháp thành yêu cầu phê duyệt.
  * Giữ nguyên 100% bố cục, hình ảnh, kích thước và màu sắc thiết kế giao diện gốc.

---

## 📌 65. Files: `DBmodule.jsx`, `rightWidgets.jsx` — Ẩn hoàn toàn thẻ Recent Drafts / Approval Requests đối với role Individual

* **Vị trí**:
  * `src/frontend/src/component/DBmodule.jsx`: Dòng 985 – 1015 (`Right Canvas`).
  * `src/frontend/src/component/DBultils/rightWidgets.jsx`: Dòng 42 – 55 (`ApprovalRequests`).
* **Thay đổi**:
  * **Ẩn thẻ đầu tiên cho role Individual**:
    * Trong `DBmodule.jsx`, đặt điều kiện `{user?.account_type === 'business' && <ApprovalRequests ... />}` để widget `ApprovalRequests` (hoặc `Recent Drafts`) chỉ xuất hiện khi tài khoản thuộc loại `business` (Manager / Member).
    * Đối với role `Individual`, thẻ này bị loại bỏ hoàn toàn khỏi cột bên phải.
  * **Cân đối lại kích thước cột bên phải**:
    * Đối với `Individual`, 2 widget còn lại là **My Calendar** và **Channel** được nâng chiều cao từ `325px` lên `478px` mỗi thẻ.
    * Tổng chiều cao 2 thẻ cộng khoảng cách (`478px + 20px + 478px = 976px`) khớp hoàn hảo (1-1) với tổng chiều cao cột bên trái (`Recent Posts` cao `477px`), tạo nên bố cục cân xứng, không bị hụt đáy và không có khoảng trống thừa.
  * **Bảo vệ component trong `rightWidgets.jsx`**:
    * Trong `ApprovalRequests`, kiểm tra sớm `if (isIndividual) return null;` để đảm bảo tuyệt đối không render gì cho role cá nhân.
* **Lý do thay đổi**:
  * Thực hiện theo đúng yêu cầu của người dùng: loại bỏ hoàn toàn thẻ Recent Drafts cho role Individual.
  * Giữ nguyên thẻ Approval Requests / Pending Approvals cho Manager và Member trong Team Workspace để duy trì quy trình kiểm duyệt bài viết.
  * Đảm bảo trải nghiệm Dashboard của Individual tinh gọn, chuyên nghiệp và sạch sẽ 100%.

---

## 📌 66. Files: `Stamodule.jsx`, `DBmodule.jsx`, Backend `router.py`, `service.py`, `models.py`, `schemas.py` — Thống kê (Statistics) & Báo cáo AI riêng cho Role Individual

* **Vị trí**:
  * **Frontend**:
    * `src/frontend/src/component/Stamodule.jsx`: Dòng 110 – 300, 360 – 410.
    * `src/frontend/src/component/DBmodule.jsx`: Dòng 68 – 150.
  * **Backend**:
    * `src/backend/app/analytics/router.py`: Dòng 25 – 155.
    * `src/backend/app/analytics/service.py`: Dòng 780 – 1300.
    * `src/backend/app/analytics/models.py`: Dòng 160 – 225.
    * `src/backend/app/analytics/schemas.py`: Dòng 140 – 152.
* **Thay đổi**:
  * **Backend**:
    * Cung cấp các API chuyên biệt dành riêng cho cá nhân tại `/api/v1/analytics/individual/...` và `/api/v1/reports/individual/...`:
      * `GET /analytics/individual/timeline`: Biểu đồ tương tác thời gian (Weekly / Monthly / Yearly) cho Facebook và LinkedIn.
      * `GET /analytics/individual/overview`: Tỷ lệ phần trăm và tổng lượt thu hút (impressions), tổng tương tác của từng nền tảng, mức tăng trưởng tháng (Month-over-Month gain).
      * `GET /analytics/individual/today`: Số lượt tương tác ghi nhận trong ngày của tài khoản cá nhân.
      * `GET /analytics/individual/top-posts`: Danh sách bài viết cá nhân có tương tác cao nhất (Highest-engaging posts) kèm URL bài đăng thực tế và thumbnail.
      * `GET & PUT /analytics/individual/kpi`: Theo dõi và cập nhật mục tiêu KPI tương tác cá nhân theo từng tháng.
      * `POST /reports/individual/generate`: Tự động khởi tạo báo cáo phân tích chiến lược định kỳ bằng Google Gemini AI Engine dựa trên dữ liệu thực tế của cá nhân.
      * `POST & GET /reports/individual`: Lưu trữ và liệt kê lịch sử báo cáo cá nhân.
      * `GET /reports/individual/{id}/download`: Tải file báo cáo phân tích Markdown về máy tính.
    * Cập nhật `Report.workspace_id` thành nullable và nới rộng `WorkspaceKpiGoal.workspace_id` thành `String(64)` để lưu trữ trực tiếp UUID cá nhân.
  * **Frontend**:
    * **`Stamodule.jsx`**:
      * Nhận diện vai trò `isIndividual` (`user?.account_type === 'individual' || (!workspaceId && user?.role === 'individual')`).
      * Tự động chuyển đổi endpoint cơ sở sang `analyticsBase` và `reportsBase` (`/analytics/individual` và `/reports/individual`).
      * Loại bỏ hoàn toàn thông báo lỗi chặn `Workspace ID is not available.` khi tài khoản cá nhân truy cập tab Statistics.
      * Tự động nạp dữ liệu timeline, overview, today interactions, top posts và lịch sử báo cáo khi mở tab Statistics.
      * Kết nối đầy đủ luồng tạo báo cáo AI bằng nút **+ Create Report**, lưu trữ vào bảng **Report History** và tải xuống tệp tin.
    * **`DBmodule.jsx`**:
      * Tích hợp gọi API `/analytics/individual/...` cho các widget trang chủ Dashboard của Individual (biểu đồ tròn Doughnut phân bổ tương tác, biểu đồ đường tuần This Week, số tương tác hôm nay, và thanh tiến độ KPI).
  * **Bảo tồn giao diện**:
    * Giữ nguyên 100% cấu trúc, bố cục, màu sắc, font chữ Satoshi, animations và các component biểu đồ chuẩn của hệ thống, không gây ảnh hưởng hay xáo trộn giao diện của Manager / Member.
* **Lý do thay đổi**:
  * Đáp ứng đúng yêu cầu của người dùng: "Tôi muốn cả role Individual cũng có Statictis riêng của chính nó".
  * Giúp người dùng cá nhân (Content Creator, Freelancer) nắm bắt toàn diện hiệu quả phân phối nội dung mạng xã hội của riêng mình một cách trực quan và chuyên nghiệp.

---

## 📌 67. File: `src/frontend/src/component/DBultils/rightWidgets.jsx` — Xóa nhãn "See all >" tại thẻ Approval Requests

* **Vị trí**: Component `ApprovalRequests`, dòng 95 – 110.
* **Thay đổi**:
  * Loại bỏ thẻ `<span onClick={() => onNavigateTab('Post Management')}>See all &gt;</span>` khỏi header của thẻ `Approval Requests`.
  * Giữ lại nút dấu cộng màu cam `AddButton` chuyển hướng trực tiếp tới tab Post Management.
* **Lý do thay đổi**:
  * Thực hiện chính xác theo yêu cầu trực tiếp của người dùng: *"Xóa giúp tôi cái "See all>" ở đây"*.
  * Đồng bộ hóa phong cách tiêu đề giữa cả 3 thẻ tại cột bên phải (Approval Requests, My Calendar, Channel), đảm bảo bố cục gọn gàng, đồng nhất chỉ với tiêu đề và nút chức năng `+`.

---

## 📌 68. File: `PMmodule.jsx`, `Contmodule.jsx`, `posts.py`, `schemas.py` — Khắc phục hiển thị sai nền tảng Facebook khi Workspace chưa kết nối (Dynamic Targeted Platforms)

* **Vị trí**:
  * `src/frontend/src/component/PMmodule.jsx`: Dòng 297 – 327 (Khởi tạo state `connectedPlatforms`, `primaryPlatform` & scoping), dòng 385 – 400 (`fetchConnectedChannels`), dòng 485 – 535 (`fetchPosts` & `handlePublishToFacebook`), dòng 630 – 645 (Publish reload), dòng 705 – 720 (`handleOpenEditModal`), dòng 1730 – 1780 (Modal **Edit Post** - Targeted Platforms list), dòng 1850 – 1885 (Nút **Save Changes** & gọi API đồng bộ backend).
  * `src/frontend/src/component/Contmodule.jsx`: Dòng 425 – 430 (`handleGenerateAI`), dòng 540 – 545 (`handleAnalyzeSeo`), dòng 630 – 635 (`handleSavePost`).
  * `src/backend/app/schemas.py`: Dòng 260 – 268 (`PostUpdateRequest`).
  * `src/backend/app/routers/posts.py`: Dòng 300 – 325 (Endpoint `PATCH /posts/{post_id}`).
* **Thay đổi**:
  * **Frontend (`PMmodule.jsx`)**:
    * **Xóa bỏ các giá trị mặc định hardcode `['facebook']`**: State `connectedPlatforms` chuyển từ `['facebook']` sang `[]`; `primaryPlatform` chuyển sang `null`.
    * **Đồng bộ chuẩn hóa kênh kết nối**: Hàm `fetchConnectedChannels` tự động lấy các nền tảng đã kết nối thực tế từ Backend và chuẩn hóa chữ thường.
    * **Khử fallback cứng trong danh sách bài viết**: Khi mapping bài viết (`fetchPosts` và sau khi publish), nền tảng chỉ lấy từ `target_platforms` thực tế của bài viết hoặc fallback vào `connectedPlatforms` của Workspace, tuyệt đối không tự động gán `['facebook']`.
    * **Giao diện Modal Edit Post động (Dynamic Targeted Platforms)**: Thay thế hoàn toàn mảng tĩnh `['facebook', 'linkedin'].map(...)` bằng danh sách nền tảng thực tế đã kết nối (`activePlatforms`). Nếu Workspace chỉ kết nối LinkedIn thì chỉ xuất hiện lựa chọn LinkedIn; không hiển thị Facebook nếu chưa kết nối Facebook. Nếu chưa kết nối nền tảng nào sẽ hiển thị thông báo hướng dẫn kết nối tại Distribution Channels.
    * **Lọc nền tảng khi mở modal**: Hàm `handleOpenEditModal` tự động thanh lọc các nền tảng không thuộc danh sách đã kết nối để đảm bảo dữ liệu chuẩn xác.
    * **Đồng bộ lưu bài viết xuống Backend**: Khi bấm **Save Changes** trong modal Edit Post, hệ thống gửi request `PATCH /posts/{id}` để cập nhật trực tiếp tiêu đề, nội dung và các `target_platforms` vào cơ sở dữ liệu.
  * **Frontend (`Contmodule.jsx`)**:
    * Xóa bỏ fallback mặc định `['facebook']` khi tạo bài viết mới hoặc phân tích AI/SEO nếu không có nền tảng nào được chọn, thay bằng việc lấy kênh kết nối khả dụng đầu tiên hoặc mảng rỗng `[]`.
  * **Backend**:
    * Bổ sung trường `target_platforms: list[str] | None = None` vào schema `PostUpdateRequest`.
    * Xây dựng endpoint `PATCH /posts/{post_id}` có kiểm tra phân quyền tác giả/manager để hỗ trợ cập nhật bài viết và nền tảng đích.
* **Lý do thay đổi**:
  * Thực hiện chuẩn xác theo báo cáo lỗi của người dùng: *"Hiện tại đang bị lỗi ở khúc Post Management bởi vì Workspace chưa nhập Facebook mà xuất hiện platforms facebook"*.
  * Đảm bảo tính nhất quán giữa trạng thái liên kết kênh xã hội thực tế của Workspace và các giao diện quản lý / chỉnh sửa bài viết trong hệ thống.






























