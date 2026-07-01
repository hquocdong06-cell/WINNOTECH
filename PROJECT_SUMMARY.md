# Tóm tắt Tổng quan Dự án WINNOTECH

WINNOTECH là một dự án thương mại điện tử chuyên cung cấp linh kiện máy tính (PC components) và chức năng xây dựng cấu hình máy tính (Build PC). Dự án được phát triển với kiến trúc Client - Server, sử dụng các công nghệ hiện đại.

## 1. Cấu trúc Công nghệ
- **Frontend:** Xây dựng bằng React.js kết hợp với Vite.
- **Backend:** Xây dựng bằng Node.js và Express.js.
- **Cơ sở dữ liệu (Database):** MongoDB (sử dụng thư viện Mongoose để quản lý Schema).

---

## 2. Phần Backend (Node.js & MongoDB)

Hệ thống Backend cung cấp các API để giao tiếp với cả giao diện Người dùng (Client) và Quản trị viên (Admin).
Tệp chính xử lý hầu hết các logic và endpoint là `server.js`.

### Các Models (Bảng Dữ Liệu) chính:
- **Người dùng & Phân quyền:** `User` (lưu trữ thông tin người dùng, admin).
- **Sản phẩm & Phân loại:**
  - `Product`: Thông tin sản phẩm chính (tên, mô tả, đánh giá...).
  - `ProductVariant`: Biến thể của sản phẩm (giá, màu sắc, tồn kho...).
  - `Category`: Danh mục sản phẩm (CPU, GPU, Mainboard...).
  - `Brand`: Thương hiệu (Asus, Intel, Nvidia...).
  - `Attribute`: Các thông số kỹ thuật chi tiết của linh kiện.
- **Giao dịch & Thanh toán:**
  - `Cartitem`: Quản lý giỏ hàng.
  - `Order`: Lưu trữ đơn hàng.
  - `DeliveryAddress`: Sổ địa chỉ giao hàng của người dùng.
- **Tính năng mở rộng:**
  - `BuildPc`: Lưu trữ các cấu hình PC mà người dùng tự build.
  - `Voucher`: Mã giảm giá / khuyến mãi.
  - `FavoriteCompareReview`: Quản lý danh sách yêu thích, so sánh sản phẩm và đánh giá.
  - `Post`, `BannerPaymentImage`: Quản lý bài viết blog, tin tức và hình ảnh banner.

---

## 3. Phần Frontend (React + Vite)

Frontend được chia làm hai khu vực hoàn toàn độc lập: **Trang Người Dùng (Client)** và **Trang Quản Trị (Admin)**.

### A. Giao diện Người dùng (Client - `/src/pages/`)
Đây là giao diện dành cho khách hàng truy cập website. Các tính năng và trang chính bao gồm:
- **Trang chủ & Khám phá:** `Home`, `CategoryPage` (trang danh mục), `ProductDetail` (chi tiết sản phẩm).
- **Trang theo Linh kiện:** Các trang phân loại riêng biệt giúp người dùng dễ dàng tìm kiếm: `CPU`, `GPU`, `Mainboard`, `RAM`, `SSD`, `PSU` (Nguồn), `Case` (Vỏ máy).
- **Chức năng Build PC (`BuildPC.jsx`):** Cho phép người dùng tự do lựa chọn và lắp ráp các linh kiện tương thích để tạo thành một bộ PC hoàn chỉnh.
- **Giỏ hàng & Thanh toán:** `Cart` (giỏ hàng), `Checkout` (tiến hành đặt hàng và thanh toán).
- **Xác thực & Tài khoản:** `Auth` (Đăng nhập/Đăng ký), `Profile` (Quản lý thông tin cá nhân, xem lịch sử đơn hàng, địa chỉ giao hàng).

### B. Giao diện Quản trị (Admin - `/src/admin/`)
Hệ thống dành riêng cho người quản lý cửa hàng (yêu cầu quyền Admin).
- **Dashboard:** Bảng điều khiển thống kê tổng quan doanh thu, số lượng đơn hàng, lượng khách hàng và các biểu đồ phân tích.
- **Quản lý Cửa hàng:** 
  - `Products`: Thêm, sửa, xóa, quản lý tồn kho sản phẩm.
  - `Categories`: Quản lý danh mục linh kiện.
  - `Orders`: Theo dõi và cập nhật trạng thái đơn hàng (Đang xử lý, Giao hàng, Hoàn thành, Hủy).
  - `Customers`: Quản lý danh sách thành viên/khách hàng.
- **Chức năng khác:** `Reviews` (Đánh giá), `Promotions` (Khuyến mãi/Voucher), `Reports` (Báo cáo doanh thu), và `Settings` (Cấu hình chung).

---

## 4. Tổng Kết
**WINNOTECH** là một nền tảng E-commerce chuyên ngành công nghệ được thiết kế khá toàn diện, bao quát từ hệ thống bán lẻ cơ bản (thêm vào giỏ hàng, thanh toán, quản lý đơn hàng) đến các công cụ chuyên dụng đặc thù như **Build PC**. Dự án có sự phân chia rõ ràng giữa phân hệ Backend (API) và Frontend (UI/UX) với cả hai mặt trận Client và Admin.
