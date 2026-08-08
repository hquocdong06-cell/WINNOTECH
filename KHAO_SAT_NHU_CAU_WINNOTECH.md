# BÁO CÁO KHẢO SÁT NHU CẦU VÀ ĐẶC TẢ YÊU CẦU HỆ THỐNG WINNOTECH

> **Dự án:** Website Thương mại điện tử Bán lẻ Thiết bị Công nghệ, Linh kiện Máy tính & Quà tặng Ưu đãi **WINNOTECH**  
> **Đơn vị phát triển:** Nhóm WINNOTech - Trường Cao đẳng FPT Polytechnic TP.HCM  
> **Giảng viên hướng dẫn:** Thầy Trần Bá Hộ  
> **Năm hoàn thành:** 2026  

---

## PHẦN 1 – KHẢO SÁT HIỆN TRẠNG VÀ TÍNH CẤP THIẾT CỦA DỰ ÁN

### 1.1. Khảo sát Hiện trạng & Nhu cầu Thị trường
Thị trường kinh doanh sản phẩm công nghệ, máy tính và linh kiện PC tại Việt Nam đang có tốc độ tăng trưởng rất nhanh. Người tiêu dùng ngày nay không chỉ tìm kiếm nơi mua sắm uy tín mà còn đòi hỏi:
- **Tính chính xác về thông số kỹ thuật:** Các linh kiện máy tính (CPU, GPU, Mainboard, RAM, SSD, PSU, Case...) đòi hỏi sự tương thích nghiêm ngặt về Socket, Chuẩn giao tiếp, Bus và TDP Công suất.
- **Chương trình Quà tặng & Ư đãi Linh hoạt:** Khách hàng quan tâm đến các gói ưu đãi quà tặng có điều kiện (mua CPU tặng Tản nhiệt, mua Mainboard tặng Voucher, v.v.) và mong muốn theo dõi thời gian khuyến mãi minh bạch.
- **Trải nghiệm Mua sắm Cá nhân hóa:** Trải nghiệm riêng biệt cho từng thành viên đăng nhập, lưu lịch sử địa chỉ, gợi ý sản phẩm phù hợp thói quen, thông báo cập nhật trạng thái đơn hàng thời gian thực.
- **Quản lý Cửa hàng Toàn diện:** Ban quản trị cần công cụ quản lý tồn kho biến thể SKU chính xác, thông báo âm thanh khi có đơn mới, kiểm duyệt đánh giá, và báo cáo doanh thu chi tiết.

### 1.2. Mục tiêu Xây dựng Hệ thống WINNOTECH
Nền tảng thương mại điện tử **WINNOTECH** được xây dựng nhằm đáp ứng toàn bộ các yêu cầu trên, hoạt động trên mô hình Client-Server phân tách với bộ công nghệ MERN Stack (Node.js, Express.js, React.js, Vite, MongoDB), mang lại trải nghiệm mua sắm mượt mà, tiện lợi và hệ thống quản trị chuyên nghiệp.

---

## PHẦN 2 – ĐẶC TẢ YÊU CẦU CHỨC NĂNG PHÂN HỆ KHÁCH HÀNG (CLIENT FRONTEND)

Phân hệ dành cho người mua sắm trực tuyến, được tối ưu hóa cho cả 2 trạng thái: **Người dùng chưa đăng nhập (Guest)** và **Thành viên đã đăng nhập (User)**.

### 2.1. Cấu trúc Layout Chung & Header / Footer
1. **Thanh Header 2 tầng (Dual-level Header):**
   - **Thanh nhỏ phía trên (Top Header):**
     - Liên kết Điều hướng chung, Thông tin liên hệ hỗ trợ, Danh mục sản phẩm nhanh, Tra cứu đơn hàng công khai, Giỏ hàng.
     - **Phân biệt trạng thái:** 
       - *Chưa đăng nhập:* Hiển thị nút **"Đăng ký thành viên"** và **"Đăng nhập"**.
       - *Đã đăng nhập:* **Ẩn nút Đăng ký**, hiển thị tên người dùng (Username) / Avatar để truy cập nhanh Trang quản lý tài khoản.
   - **Thanh chính phía dưới (Main Header):**
     - Logo thương hiệu **WINNOTECH**.
     - Form tìm kiếm thông minh tích hợp **Fuzzy Search (`Fuse.js`)**.
     - Nút tài khoản nhanh (Đăng nhập / Username).
2. **Thanh Footer (Footer Section):**
   - Logo thương hiệu **WINNOTECH** và mô tả sứ mệnh doanh nghiệp.
   - **Liên kết quan trọng:** Trang Chính sách bảo mật, Điều khoản sử dụng, Trang Hỗ trợ khách hàng, Trang Giới thiệu.
   - Điều hướng Tài khoản cá nhân, Sổ địa chỉ, Lịch sử đơn hàng.
   - Các kênh kết nối Mạng xã hội (Facebook, Youtube, Zalo, TikTok).
   - Thông tin bản quyền website & Biểu tượng các phương thức thanh toán hỗ trợ (VNPay, VietQR, COD).

---

### 2.2. Chi tiết các Trang phía Khách hàng

#### 1. Trang Chủ (`Home.jsx`)
- **Slider Banner Quảng cáo:** Kết hợp các banner động và tĩnh do Admin chỉ định về chương trình Flash Sale, ưu đãi hot, ra mắt sản phẩm mới.
- **Sản phẩm Nổi bật & Bán chạy:**
  - Cụm sản phẩm **Bán chạy nhất (Best Sellers)**.
  - Cụm sản phẩm **Giảm giá Hot (Hot Deals)** làm nổi bật % giảm giá và giá ưu đãi.
  - Cụm sản phẩm **Chào sân (New Arrivals)** được quan tâm nhiều nhất.
- **Chương trình Quà tặng Ưu đãi:** Trưng bày các món quà tặng khuyến mãi có điều kiện được xem nhiều nhất.
- **Danh mục & Thương hiệu Hàng đầu:** Trưng bày linh kiện theo từng nhóm danh mục hot (CPU Intel/AMD, GPU Asus/MSI, Mainboard...) và các logo thương hiệu đối tác.
- **Gợi ý Cá nhân hóa (Personalized Section):** 
  - *Dành riêng cho Thành viên đã đăng nhập:* Tự động đề xuất các sản phẩm mà khách hàng có thể quan tâm dựa trên lịch sử xem và thói quen mua sắm.
- **Tin tức & Ưu đãi:** Bài viết mới nhất về khuyến mãi và tư vấn kinh nghiệm chọn linh kiện PC.

#### 2. Trang Trưng bày & Tìm kiếm Sản phẩm (`CategoryPage.jsx` / `Search`)
- **Thanh bên Bộ lọc (Sidebar Filter):** Lọc đa tiêu chí theo **Danh mục sản phẩm**, **Khoảng giá**, **Thương hiệu đối tác (Brand)**.
- **Danh sách Card Sản phẩm:**
  - Hiển thị: Hình ảnh linh kiện, Tên sản phẩm, Điểm đánh giá sao (Rating 1-5★), Lượt bán, % Giảm giá, Giá gốc, Giá khuyến mãi.
  - **Logic Giá hiển thị:** Tự động lấy mức **giá thấp nhất từ các biến thể (Variants)** hiện có của sản phẩm.

#### 3. Trang Chi tiết Sản phẩm (`ProductDetail.jsx`)
- **Thông tin Tổng quan:** Thư viện ảnh gallery linh kiện, Tên sản phẩm, Danh mục, Điểm đánh giá, Lượt bán, Lượt xem, Xuất xứ & Nơi sản xuất, % Giảm giá, Giá gốc và Giá khuyến mãi.
- **Lựa chọn Biến thể (Variants Matrix):** Cho phép người dùng chọn màu sắc, dung lượng (ví dụ: RAM 16GB/32GB, SSD 512GB/1TB) với mức giá và số lượng kho tương ứng được cập nhật tức thì.
- **Thanh bên phải (Right Sidebar):**
  - Khối chọn Số lượng mua, Nút **"Thêm vào giỏ hàng"** và **"Mua ngay"**.
  - Thông tin thương hiệu chính hãng, Nút Chia sẻ trang sản phẩm lên Mạng xã hội (Facebook, Zalo...).
- **Khu vực Tabs Nội dung:**
  - *Tab Mô tả:* Chi tiết thông số kỹ thuật và bài viết đánh giá chuyên sâu.
  - *Tab Đánh giá:* Danh sách bình luận & chấm điểm sao thực tế từ khách hàng đã mua sản phẩm.
- **Sản phẩm Tương tự:** Trưng bày các sản phẩm cùng danh mục/tầm giá bên dưới.

#### 4. Trang Công cụ Build PC (`BuildPC.jsx` - Tính năng USP của WINNOTECH)
- Cho phép người dùng tự lắp ráp cấu hình PC từ nhóm linh kiện: `CPU` → `Mainboard` → `RAM` → `GPU` → `SSD/HDD` → `PSU` → `Case` → `Cooling`.
- **Ước tính Công suất Wattage:** Tự động tính toán tổng công suất tiêu thụ điện TDP (W) và đưa ra gợi ý chọn Nguồn PSU phù hợp.
- Nút **Thêm toàn bộ cấu hình vào Giỏ hàng** hoặc **Lưu bộ PC vào Tài khoản**.

#### 5. Trang Giỏ hàng (`Cart.jsx`)
- **Quản lý Sản phẩm:** Thay đổi số lượng mua, xóa từng sản phẩm hoặc xóa toàn bộ giỏ hàng.
- **Tự động Thêm Quà tặng Ưu đãi:** Khi đơn hàng đạt đủ điều kiện chương trình quà tặng, hệ thống tự động thêm **01 Quà tặng khuyến mãi** vào giỏ hàng với **số lượng mặc định cố định = 1 (không cho sửa/xóa)**.
- **Áp dụng Mã giảm giá (Voucher):**
  - **Không cho nhập mã tự do:** Hệ thống tự động liệt kê **danh sách các Voucher đủ điều kiện** của tài khoản.
  - Người dùng chỉ việc chọn 1 Voucher áp dụng duy nhất cho mỗi đơn hàng.

#### 6. Trang Thanh toán Đặt hàng (`Checkout.jsx` - Yêu cầu Đăng nhập)
- **Thông tin Người nhận:** Hiển thị địa chỉ mặc định, cho phép chọn địa chỉ khác từ Sổ địa chỉ hoặc thêm địa chỉ giao hàng mới.
- **Danh sách Đặt hàng:** Chi tiết danh sách linh kiện và quà tặng được lấy từ Giỏ hàng.
- **Phương thức Thanh toán:** Tùy chọn thanh toán **COD (Thanh toán khi nhận hàng - Mặc định)** hoặc **VNPay Gateway / VietQR**.
- **Thanh Summary bên phải:** Hiển thị Mã Voucher đã áp dụng, Tạm tính, Phí vận chuyển, Số tiền giảm giá, **Tổng thanh toán** và **Số tiền tiết kiệm được**.

#### 7. Trang Đặt hàng Thành công (`OrderSuccess.jsx`)
- Thông báo đặt hàng thành công, hiển thị **Mã đơn hàng duy nhất (`WNT...`)**, tổng tiền, địa chỉ giao hàng và danh sách món hàng.
- Nút bấm điều hướng nhanh tới: **Tiếp tục mua sắm** (về Trang sản phẩm), **Xem Lịch sử đơn hàng**, và **Tải Hóa đơn PDF**.

#### 8. Trang Trưng bày Quà tặng (`Gifts.jsx`) & Chi tiết Quà tặng (`GiftDetail.jsx`)
- **Trang Trưng bày Quà tặng:**
  - Bộ lọc tìm kiếm quà tặng ở thanh bên phải.
  - Card quà tặng: Hình ảnh quà, Nhà cung cấp (Thương hiệu), Mô tả ngắn, Thời gian đếm ngược kết thúc ưu đãi.
- **Trang Chi tiết Quà tặng:**
  - Hiển thị ảnh quà, Tiêu đề, Mô tả, Thời gian kết thúc đếm ngược, Điều kiện áp dụng quà tặng, Thông tin chi tiết món quà, **Thanh tiến độ nhận quà (Progress bar)**, Nhà cung cấp.
  - **Tính năng Mua kèm Tiện lợi:** Gợi ý danh sách các sản phẩm sẵn có thỏa mãn điều kiện để khách hàng bấm chọn mua ngay và nhận quà lập tức.

#### 9. Phân hệ Quản lý Tài khoản Cá nhân (Trang Profile - Đã Đăng Nhập)
- **Trang Thông tin Cá nhân (`Profile.jsx`):** Xem và chỉnh sửa Họ tên, Email, Số điện thoại, Ngày sinh, Giới tính, Đổi mật khẩu, Tải ảnh đại diện Avatar.
- **Trang Thông báo (`Notifications.jsx`):**
  - Phân loại thông báo theo tabs: **Đơn hàng**, **Khuyến mãi**, **Quà tặng**, **Hệ thống**.
  - Mỗi thông báo có trạng thái Đã đọc / Chưa đọc, đi kèm nút **"Đánh dấu đã đọc tất cả"**.
- **Trang Lịch sử Mua hàng (`OrderHistory.jsx`):**
  - **Lọc theo 2 kiểu tab:** Tab Trạng thái đơn hàng (`Tất cả`, `Chờ xác nhận`, `Đang xử lý`, `Đang giao`, `Hoàn thành`, `Đã hủy`) và Tab Trạng thái thanh toán (`Đã thanh toán`, `Chưa thanh toán`).
  - **Ràng buộc xử lý:** 
    - Đơn hàng khi đã được Quản trị viên xác nhận (`Processing` trở đi) **không cho phép Hủy đơn**.
    - Đơn hàng chưa thanh toán (VNPay) có nút **"Quay lại thanh toán"** để hoàn tất giao dịch.
- **Trang Sổ Địa chỉ (`AddressBook.jsx`):**
  - Danh sách địa chỉ nhận hàng của người dùng.
  - Địa chỉ đang được gắn cờ **Mặc định (Default)** sẽ **KHÔNG ĐƯỢC PHÉP XÓA** (bảo vệ luồng thanh toán).
- **Trang Đánh giá Sản phẩm của tôi (`MyReviews.jsx`):** Danh sách các bài đánh giá/chấm sao mà khách hàng đã thực hiện trên các sản phẩm đã mua.
- **Trang Sản phẩm Yêu thích (`Wishlist.jsx`):** Danh sách các linh kiện người dùng đã nhấn nút Yêu thích (trái tim), hỗ trợ xem nhanh hoặc thêm vào giỏ.

#### 10. Các Trang Hỗ trợ & Thông tin Bổ sung
- **Trang Tra cứu Đơn hàng (`TrackOrder.jsx`):** Form công khai nhập Mã đơn hàng & Số điện thoại để tra cứu tiến độ đơn không cần đăng nhập.
- **Trang Danh sách Bài viết (`Blog.jsx`) & Chi tiết Bài viết (`BlogPostDetail.jsx`):** Danh sách tin tức công nghệ, thanh bên hiển thị Bài viết quan tâm nhất, lượt xem, ngày đăng.
- **Trang Chương trình Sự kiện (`EventDetail.jsx`):** Giao diện tương tự bài viết nhưng có kết nối hiển thị danh sách các **Quà tặng đi kèm** với sự kiện đó.
- **Trang Liên hệ (`Contact.jsx`):** Form gửi thắc mắc qua Email SMTP & thông tin liên hệ Hotline, bản đồ, địa chỉ cửa hàng WINNOTECH.
- **Trang Giới thiệu (`About.jsx`):** Landing page thiết kế hiện đại giới thiệu thương hiệu Siêu thị Công nghệ WINNOTECH.
- **Trang Điều khoản / Chính sách (`Policy.jsx`):** Tiêu đề, Ngày cập nhật văn bản và Nội dung chi tiết các điều khoản bảo mật & chính sách đổi trả.

---

## PHẦN 3 – ĐẶC TẢ YÊU CẦU CHỨC NĂNG PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN DASHBOARD)

Yêu cầu người dùng đăng nhập tài khoản có quyền `role = 'admin'`. Giao diện có Sidebar điều hướng và Admin Guard bảo mật.

### 3.1. Chi tiết các Trang Quản trị

1. **Trang Tổng quan Thống kê (`Dashboard.jsx`):**
   - Thống kê chỉ số: Doanh thu tổng, Tổng đơn hàng, Tổng sản phẩm, Tổng quà tặng phát ra theo khoảng thời gian (Ngày / Tuần / Tháng / Năm).
   - Biểu đồ cột Doanh thu 12 tháng, Biểu đồ tròn Tỷ lệ trạng thái đơn hàng, Top sản phẩm bán chạy.
2. **Trang Quản lý Sản phẩm (`Products.jsx`):**
   - Danh sách sản phẩm, Tìm kiếm & Lọc theo Danh mục / Thương hiệu.
   - Thêm mới, Chỉnh sửa, Tạm ẩn / Xóa mềm sản phẩm. Modal quản lý ma trận biến thể SKU (`VariantManagementModal`).
3. **Trang Quản lý Danh mục (`Categories.jsx`):**
   - Xem danh sách, Thêm, Sửa, Xóa danh mục linh kiện (upload logo đại diện).
4. **Trang Quản lý Thương hiệu (`Brands.jsx`):**
   - Xem danh sách, Thêm, Sửa, Xóa thương hiệu đối tác (upload logo hãng).
5. **Trang Quản lý Voucher (`Promotions.jsx`):**
   - Tạo mã voucher giảm giá theo VNĐ hoặc %, đặt mức giảm tối đa, đơn hàng tối thiểu, thời hạn và số lượt dùng tối đa.
6. **Trang Quản lý Quà tặng Khuyến mãi (`GiftsManagement.jsx`):**
   - Tạo và quản lý danh mục quà tặng khuyến mãi đi kèm, thiết lập điều kiện áp dụng quà tặng.
7. **Trang Quản lý Đơn hàng (`Orders.jsx`):**
   - Hiển thị danh sách đơn hàng toàn hệ thống với bộ lọc trạng thái.
   - **Tính năng Chuông Thông báo Âm thanh (Sound Notification):** Tự động phát âm thanh cảnh báo khi có đơn hàng mới phát sinh.
   - Cập nhật trạng thái đơn hàng và trạng thái thanh toán. In và xuất file **Hóa đơn bán hàng PDF (`PDFKit`)**.
8. **Trang Quản lý Phương thức Thanh toán (`PaymentMethods.jsx`):**
   - Xem danh sách cố định các phương thức (COD, VNPay, VietQR...). Thay đổi thông tin, Bật/Tắt (Tạm ẩn) phương thức. **KHÔNG CHO PHÉP TẠO MỚI** phương thức thanh toán.
9. **Trang Quản lý Người dùng (`Customers.jsx`):**
   - Danh sách tài khoản người dùng, Thống kê tần suất hoạt động, Khóa/Mở khóa tài khoản, Chỉnh sửa thông tin & Phân quyền.
10. **Trang Quản lý Hàng tồn kho (`Inventory.jsx`):**
    - Quản lý danh sách tồn kho theo từng Biến thể sản phẩm (SKU). Cập nhật số lượng nhập/xuất kho.
11. **Trang Quản lý Đánh giá Sản phẩm (`Reviews.jsx`):**
    - Kiểm duyệt tất cả các bài đánh giá của khách hàng. Thay đổi trạng thái **Đăng công khai** hoặc **Tạm ẩn**. **KHÔNG CHO PHÉP THÊM HOẶC XÓA** bài đánh giá của khách.
12. **Trang Quản lý Phí vận chuyển (`ShippingFee.jsx`):**
    - Tạo và chỉnh sửa danh sách các hình thức vận chuyển & bảng giá phí giao hàng theo khu vực.
13. **Trang Quản lý Thông báo đến Người dùng (`Notifications.jsx`):**
    - Form soạn thảo nội dung thông báo, lựa chọn loại thông báo (Đơn hàng, Khuyến mãi, Hệ thống) và chọn người nhận (Gửi một người hoặc Gửi hàng loạt toàn bộ người dùng). Không cần bảng danh sách lịch sử.
14. **Trang Quản lý Nội dung Cố định (`ContentPages.jsx`):**
    - Hiển thị danh sách cố định các trang nội dung (Chính sách bảo mật, Điều khoản sử dụng, Trang giới thiệu...). Cho phép Chỉnh sửa nội dung hoặc Tạm ẩn. **KHÔNG CHO PHÉP THÊM MỚI HOẶC XÓA TRANG**.
15. **Trang Quản lý Banner Quảng cáo (`Banners.jsx`):**
    - Hiển thị danh sách các vị trí Banner quảng cáo cố định trên giao diện (Slider Home, Banner giữa trang, Banner Sidebar...). Cho phép Chỉnh sửa ảnh và cập nhật liên kết. **KHÔNG CHO PHÉP THÊM/XÓA VỊ TRÍ BANNER**.
16. **Trang Quản lý Chương trình Sự kiện (`Events.jsx`):**
    - Tạo mới, chỉnh sửa, xóa các chương trình sự kiện có Quà tặng đi kèm. Có tùy chọn gán hiển thị sự kiện lên **Popup Quảng cáo** khi truy cập trang web.
17. **Trang Quản lý Bài viết (`Posts.jsx`):**
    - Thêm, sửa, xóa các bài viết tin tức công nghệ và đánh giá linh kiện.

---

## PHẦN 4 – ĐẶC TẢ YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

1. **Hiệu năng (Performance):**
   - Tốc độ tải trang Frontend SPA < 1.5s nhờ Vite build & React lazy load.
   - Thời gian phản hồi Backend REST API < 200ms.
2. **Bảo mật (Security):**
   - Mật khẩu mã hóa 1 chiều `bcrypt` (Salt rounds = 10).
   - Xác thực API bằng chuỗi JWT mã hóa RSA/Private Key.
   - Kiểm tra băm chữ ký HMAC-SHA512 đối với các giao dịch VNPay Sandbox.
   - Ngăn ngừa các lỗ hổng CORS, XSS, NoSQL Injection qua Mongoose ODM.
3. **Giao diện & Trải nghiệm Người dùng (UI/UX):**
   - Thiết kế chuẩn Responsive hiển thị mượt mà trên Desktop, Laptop, Tablet và Smartphone.
   - Tích hợp hiệu ứng chuyển cảnh mịn màng, Toast thông báo tự động (React Toastify), chuông âm thanh đơn hàng Admin.

---

## PHẦN 5 – TỔNG KẾT VÀ BẢN ĐỒ MÁP MA TRẬN YÊU CẦU

Tất cả các yêu cầu khảo sát trên hoàn toàn phù hợp và khớp 100% với định hướng phát triển của nền tảng **WINNOTECH**. Hệ thống đáp ứng hoàn hảo cả mặt trải nghiệm mua sắm công nghệ tiện lợi của Khách hàng lẫn công cụ quản lý bán hàng thông minh của Quản trị viên.
