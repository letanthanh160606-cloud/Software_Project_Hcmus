# **BIÊN BẢN CUỘC HỌP \- 03/07/2026**

1. ## **MỤC ĐÍCH CUỘC HỌP**

Thống nhất các luồng đăng nhập (ứng theo vai trò của users); thêm chi tiết về tech stack, operation environment của dự án.

Tinh chỉnh proposal cho đồng bộ với các điều trên.

2. ## **NỘI DUNG THẢO LUẬN CHI TIẾT**

   1. ### **Các luồng đăng nhập, tính năng ứng theo vai trò**

* **Trang web được cung cấp để phục vụ cho 2 đối tượng chính: Individual (Cá Nhân) và Business (Doanh Nghiệp). Trong đó, khi người dùng chọn Business sẽ phải chọn một trong 2 vai trò (Supervisor hoặc Member). Chi tiết các vai trò:**  
  * Supervisor (Business): Đóng vai trò là người quản lý các Member trong 1 team. Là người sẽ tạo Workspace và cho các Member tham gia vào.  
  * Member (Business): Đóng vai trò là cấp dưới, là người tạo ra content. Tất cả các content do Member tạo ra phải trước tiên được duyệt bởi Supervisor thì mới được phân phát trên các nền tảng.  
  * Individual: Vai trò dành cho các cá nhân độc lập muốn có nơi để quản lý, phân phát content của bản thân.  
* **Các tính năng ứng theo vai trò (Chi tiết của từng chức năng sẽ được nêu trong Project Proposal):**  
  * Supervisor (Business): Dashboard, Statistics, Post Management, Distribution và Team Management.  
  * Member (Business): Dashboard, My Analytics, My Tasks & Calendar, Post Management.  
  * Individual: tất cả các tính năng của Supervisor trừ Team Management

  2. ### **Thống nhất về operating environment, tech stack**

* **Front-end:** React \+ Vite \+ JavaScript, Tailwind CSS, React Router (protected routes theo role), React Query/Axios để gọi API.  
* **Back-end:** Python \+ FastAPI (hoặc Django REST Framework), JWT cho authentication, dependency/permission class để kiểm tra role cho authorization.  
* **Database:** MySQL (đang chờ thống nhất)

3. ## **KẾ HOẠCH HÀNH ĐỘNG & PHÂN CÔNG CÔNG VIỆC (ACTION ITEMS)**

| Công việc | Thành viên | Nội dung công việc |
| ----- | :---: | ----- |
| **Project Proposal \- Preliminary Problem Statement** | Tài lê | Bổ sung chi tiết về Operating Evironment và lý do chọn |
| **Project Proposal \- Proposed Solution** | Trọng Tài | Tinh chỉnh các figure cho phù hợp với luồng đăng nhập đã được thống nhất |
| **Project Proposal** | Thành  | Tổng hợp các thông tin, tinh chỉnh và duyệt các nội dung trước khi cho vào Project Proposal |
| **Back-end \- Database** | Nhuận | Tìm hiểu và chọn nền tảng thiết kế Database |

	