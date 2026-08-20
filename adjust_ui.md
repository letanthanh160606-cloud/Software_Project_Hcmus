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

## 📌 22. File: `src/frontend/src/component/DBmodule.jsx` & `src/backend/app/analytics/service.py` (This Week Timeline & Card Transition)

* **Vị trí**:
  * `DBmodule.jsx`: Dòng 55 – 65, 110 – 125, 530 – 545.
  * Backend: `service.py` (`get_timeline`).
* **Thay đổi**:
  * Chuyển đổi thẻ banner lớn màu cam và biểu đồ từ **"This Month"** sang **"This Week"**:
    * Tiêu đề đổi thành **`This Week`** (thay cho `This Month`).
    * Biểu đồ đường hiển thị 7 ngày trong tuần: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun` và các điểm tương tác tương ứng của từng ngày trong tuần hiện tại.
    * Con số lớn hiển thị tổng số lượt tương tác của **Tuần này (This Week Interactions)** (ví dụ: `211` vào Thứ Năm - Thu).
  * Backend:
    * Chuẩn hóa bộ lọc thời gian `get_timeline(timeframe="Weekly")` từ Thứ Hai đến Chủ Nhật của tuần hiện tại.
    * Cập nhật danh sách nhãn (labels) Title Case thân thiện: `['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']`.
* **Lý do thay đổi**:
  * Yêu cầu từ người dùng: chuyển đổi chế độ xem tiến độ tương tác nhanh trên Dashboard chính sang dạng Tuần này (This Week), giữ nguyên 100% bố cục và màu sắc thiết kế gốc.

