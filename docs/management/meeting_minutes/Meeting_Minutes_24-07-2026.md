# **BIÊN BẢN CUỘC HỌP \- 24/07/2026**

1. ## **MỤC ĐÍCH CUỘC HỌP**

Điều chỉnh kế hoạch thời gian (deadline) cho phù hợp với tiến độ thực tế.

Thống nhất chi tiết về Module Content và giao diện (UI) Dashboard.

Hoàn thiện cấu trúc Database liên quan đến phân quyền người dùng và thứ tự ưu tiên phát triển (dev)

2. ## **NỘI DUNG THẢO LUẬN CHI TIẾT**

   1. ### **Điều chỉnh kế hoạch và Deadline**

* Xem xét lại các mốc thời gian của Sprint 2 và các phần hành trong PA02  
* Thực hiện chỉnh sửa deadline để đảm bảo các thành viên có đủ thời gian hoàn thành các task thiết kế và code

  2. ### **Module Content và UI Dashboard**

* Module Content: Thảo luận sâu hơn về các tính năng trong hệ thống tạo Content (AI và không AI), quy trình duyệt bài dành cho Business  
* UI Dashboard: Thống nhất các thành phần hiển thị trên Dashboard để đảm bảo tính đồng nhất và trải nghiệm người dùng

  3. ### **Cập nhật cấu trúc Database**

* Phân quyền (Role): Thực hiện fix database để tách biệt rõ ràng hai vai trò Member và Manager (thay vì gộp chung là Business như phương án trước đó)  
* Đảm bảo logic phân quyền được áp dụng chính xác cho access token và các truy vấn dữ liệu liên quan.

  4. ### **Luồng hệ thống và Thứ tự phát triển (Dev)**

* Xác định luồng di chuyển thông tin và tính năng chính: Content \-\> Team workspace \-\> Statistic \-\> Calendar.  
* Thống nhất thứ tự ưu tiên triển khai code (Dev) để các module có sự liên kết chặt chẽ và không bị trì trệ công việc.

3. ## **KẾ HOẠCH HÀNH ĐỘNG & PHÂN CÔNG CÔNG VIỆC (ACTION ITEMS)**

| Công việc | Thành viên | Nội dung công việc |
| ----- | :---: | ----- |
| **Cập nhật UI/UX** | Tài lê | Thiết kế và code UI Dashboard theo thống nhất mới; chuẩn bị UI cho luồng Content đến Calendar |
| **Back-end & Database** | Trọng Tài | Triển khai fix database tách role Member/Manager; xây dựng logic cho luồng Team workspace và Statistic |
| **Data & Architecture** | Nhuận & Thành | Cập nhật Data Design và Architectural Design dựa trên các thay đổi về luồng dữ liệu và deadline mới |

	