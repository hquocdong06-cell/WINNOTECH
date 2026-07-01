# Tóm tắt Giao diện và Chức năng Admin - WINNOTECH

Tài liệu này tóm tắt toàn bộ giao diện và các chức năng của trang Quản trị (Admin) trong dự án dựa trên cấu trúc hiện tại.

## 1. Cấu trúc Layout Chung
Trang Admin sử dụng bố cục chuẩn bao gồm hai thành phần chính:
- **Sidebar (Thanh điều hướng bên trái):** Chứa logo "WINNO TECH" và danh sách các menu chức năng chính. Ngoài ra còn có banner quảng cáo nhỏ gọn ở phía dưới.
- **Header & Nội dung chính (AdminLayout):** Khu vực hiển thị nội dung chi tiết tương ứng với từng menu được chọn từ Sidebar.

## 2. Các Chức năng chính trên Sidebar (Menu)

### 🏠 Dashboard (Bảng điều khiển)
- **Thống kê tổng quan:** Hiển thị số liệu về Tổng doanh thu, Tổng đơn hàng, Số lượng Khách hàng và Số lượng Sản phẩm (có so sánh tăng/giảm so với tháng trước).
- **Biểu đồ doanh thu:** Hiển thị biểu đồ cột mô phỏng doanh thu trong 12 tháng của năm hiện tại.
- **Thống kê trạng thái đơn hàng:** Biểu đồ hình khuyên phân tích tỷ lệ các đơn hàng (Thành công, Đang xử lý, Hủy).
- **Đơn hàng gần đây:** Bảng danh sách các giao dịch/đơn hàng mới nhất kèm trạng thái.
- **Sản phẩm bán chạy:** Liệt kê các sản phẩm có số lượng bán ra nhiều nhất cùng doanh thu tương ứng (VD: RTX 4090, Intel Core i9).

### 📦 Sản phẩm (Products)
- **Quản lý danh sách:** Hiển thị toàn bộ sản phẩm trong hệ thống (gọi API từ `/products`).
- **Bộ lọc & Tìm kiếm:** Cho phép tìm kiếm sản phẩm theo tên, hoặc lọc theo Danh mục (Category) và Thương hiệu (Brand).
- **Thêm/Sửa/Xóa (CRUD):** 
  - Modal form để thêm mới hoặc chỉnh sửa thông tin sản phẩm (Tên, Danh mục, Thương hiệu, Giá, Giá khuyến mãi, Hình ảnh, Mô tả ngắn, Tồn kho, Trạng thái).
  - Tích hợp gọi API để quản lý biến thể sản phẩm (Variants).

### 📂 Danh mục (Categories)
- Quản lý các phân loại sản phẩm.
- Cho phép xem, thêm, sửa, xóa danh mục sản phẩm của cửa hàng.

### 🛒 Đơn hàng (Orders)
- Xem danh sách toàn bộ đơn hàng của khách hàng.
- Cập nhật trạng thái đơn hàng (từ lúc đặt hàng đến khi giao thành công hoặc hủy).

### 👥 Khách hàng (Customers)
- Quản lý thông tin tài khoản của người dùng, xem danh sách khách hàng đã đăng ký.

### ⭐ Đánh giá (Reviews)
- Quản lý và kiểm duyệt các đánh giá/bình luận của người dùng về sản phẩm.

### 🏷️ Khuyến mãi (Promotions)
- Thiết lập và quản lý các chương trình giảm giá, mã coupon cho hệ thống.

### 📊 Báo cáo (Reports)
- Xem các báo cáo chuyên sâu về hoạt động kinh doanh, xuất dữ liệu bán hàng.

### ⚙️ Cài đặt (Settings)
- Quản lý các thiết lập chung cho hệ thống cửa hàng (thông tin liên hệ, cấu hình website, v.v.).

---
*Lưu ý: Các module (Categories, Orders, Customers...) đều được xây dựng dựa trên kiến trúc file `jsx` tách biệt trong thư mục `src/admin/pages` và giao tiếp trực tiếp với Backend API qua chuẩn REST.*
