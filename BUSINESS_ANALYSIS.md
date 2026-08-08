# TÀI LIỆU PHÂN TÍCH TỔNG QUAN NGHIỆP VỤ HỆ THỐNG WINNOTECH

> **Ngày phân tích:** 08/08/2026  
> **Dự án:** WINNOTECH - Website Thương mại điện tử Bán lẻ Thiết bị Công nghệ & Linh kiện PC  
> **Kiến trúc:** Client-Server RESTful API Decoupled (Node.js/Express + React/Vite + MongoDB/Mongoose)

---

## 1. TỔNG QUAN DỰ ÁN VÀ VAI TRÒ HỆ THỐNG

**WINNOTECH** là nền tảng thương mại điện tử chuyên biệt trong lĩnh vực công nghệ thông tin và phần cứng máy tính. Hệ thống giải quyết 2 bài toán chính:
1. **Bán lẻ E-Commerce tiêu chuẩn:** Cung cấp trải nghiệm mua sắm linh kiện máy tính (CPU, GPU, RAM, Mainboard, SSD, PSU, Case, Cooling...), quản lý giỏ hàng, áp mã voucher, thanh toán trực tuyến và giao nhận đơn hàng.
2. **Công cụ Build PC Chuyên dụng (USP):** Cho phép người dùng tự phối ghép bộ cấu hình máy tính cá nhân hóa, tự động tính toán tổng công suất tiêu thụ điện (Wattage TDP) để đưa ra khuyến nghị chọn nguồn PSU phù hợp.

Hệ thống phân tách thành 2 phân hệ người dùng chính:
- **Client Web Application (Khách hàng & Guest):** Trải nghiệm giao diện Single Page Application (SPA) trên React + Vite, tương thích Responsive, hỗ trợ tìm kiếm mờ (Fuzzy search), Build PC, Checkout VNPay và Trợ lý AI Chatbot.
- **Admin Dashboard (Quản trị viên):** Bảng điều khiển dành riêng cho quản lý cửa hàng để theo dõi doanh thu, xử lý đơn hàng, quản lý kho hàng/biến thể, phát hành voucher, xuất báo cáo PDF/Excel.

---

## 2. BẢN ĐỒ NGHIỆP VỤ HỆ THỐNG (BUSINESS DOMAIN MAP)

```
                                +-------------------------------------------------------+
                                |               HỆ THỐNG WINNOTECH E-COMMERCE           |
                                +-------------------------------------------------------+
                                                            |
     +-------------------+-------------------+--------------+--------------+-------------------+-------------------+
     |                   |                   |                             |                   |                   |
     v                   v                   v                             v                   v                   v
[1. Sản phẩm &]     [2. Build PC]      [3. Giỏ hàng &]              [4. Đặt hàng &]     [5. Tài khoản &]    [6. AI Chatbot &]
[  Biến thể   ]     [ Chuyên sâu]      [ Khuyến mãi  ]              [  Thanh toán ]     [  Phân quyền  ]    [ Báo cáo CMS  ]
 - Categories        - Tự chọn linh     - Hỗ trợ Guest               - COD & VNPay       - JWT Auth          - Gemini AI 1.5
 - Brands              kiện theo nhóm     & User                      - Quét VietQR       - Sổ địa chỉ        - Xuất PDF Hóa đơn
 - Products & SKU    - TDP Wattage      - Mã giảm giá                - Vòng đời status   - Phân quyền        - Xuất Excel Báo cáo
 - Attributes          Estimator          Voucher (% / VNĐ)            Order Lifecycle     Admin/Client       - Bài viết News
```

---

## 3. CHI TIẾT CÁC PHÂN HỆ NGHIỆP VỤ CHÍNH

### Phân hệ 1: Quản lý Sản phẩm, Biến thể & Danh mục (Product Catalog & Inventory Management)
- **Danh mục (Category) & Thương hiệu (Brand):**
  - Quản lý cấu trúc danh mục linh kiện (CPU, GPU, Mainboard, RAM, SSD, PSU, Case, Tản nhiệt...).
  - Quản lý các thương hiệu đối tác (ASUS, MSI, Gigabyte, Intel, AMD, Corsair, Samsung...).
- **Sản phẩm (Product - `models/Product.js`):**
  - Lưu thông tin định danh: Tên sản phẩm, slug, mô tả chi tiết (`description`), mô tả ngắn (`short_desc`), phần trăm giảm giá (`sale`), danh mục (`cat_id`), thương hiệu (`brand_id`), trạng thái (`status`).
- **Biến thể Sản phẩm (Product Variant - `models/ProductVariant.js`):**
  - Quản lý mã SKU, tên biến thể (`variant_name`), giá gốc (`price`), giá khuyến mãi (`sale_price`), số lượng tồn kho (`stock_quantity`).
  - Liên kết bảng junction `VariantAttribute` với `AttributeValue` để hỗ trợ đa thuộc tính (màu sắc, dung lượng 16GB/32GB RAM, 512GB/1TB SSD).
- **Thuộc tính Kỹ thuật (Attribute - `models/Attribute.js`):**
  - Định nghĩa các thuộc tính phần cứng: Socket CPU (LGA1700, AM5), Bus RAM (DDR4, DDR5), Công suất tiêu thụ TDP (W), Form Factor (ATX, Micro-ATX).

---

### Phân hệ 2: Công cụ Chuyên dụng Build PC (PC Builder Domain)
- **Quy trình Lắp ráp Linh kiện:**
  - Hướng dẫn người dùng chọn lần lượt các nhóm linh kiện bắt buộc & tùy chọn: `CPU` → `Mainboard` → `RAM` → `GPU (VGA)` → `SSD/HDD` → `PSU (Nguồn)` → `Case (Vỏ máy)` → `Cooling (Tản nhiệt)`.
- **Thuật toán Tính toán Công suất Điện năng (Wattage Estimator):**
  - Tự động cộng tổng TDP của vi xử lý CPU và card đồ họa GPU:  
    $$\text{Total Wattage} = \text{TDP}(\text{CPU}) + \text{TDP}(\text{GPU}) + 150\text{W (Base Load)}$$
  - Đưa ra cảnh báo và khuyến nghị mức công suất nguồn PSU an toàn (ví dụ: Hệ thống tiêu thụ 550W → Khuyên chọn PSU $\ge 650\text{W}$).
- **Hành động Mở rộng:**
  - Thêm toàn bộ các linh kiện trong bộ PC đã chọn vào Giỏ hàng với 1 click.
  - Lưu cấu hình PC cá nhân vào CSDL (`models/BuildPc.js`) gắn với tài khoản người dùng để xem lại hoặc chia sẻ.

---

### Phân hệ 3: Giỏ hàng & Mã giảm giá Khuyến mãi (Cart & Promotion Management)
- **Quản lý Giỏ hàng (`models/Cartitem.js`):**
  - Thiết kế linh hoạt với trường `u_id` dạng `Mixed`: Hỗ trợ cả Khách chưa đăng nhập (Session/Guest ID dạng `string`) và Khách đã đăng nhập (`ObjectId`).
  - Tự động tính toán tổng số lượng, đơn giá biến thể và tổng tiền thanh toán tạm tính.
- **Quản lý Voucher Khuyến mãi (`models/Voucher.js` & `UserVoucher`):**
  - Hỗ trợ 2 kiểu giảm giá: Theo số tiền cố định (VNĐ) hoặc phần trăm (%).
  - Kiểm tra các điều kiện ràng buộc: Thời gian hiệu lực (`start_day`, `end_day`), giá trị đơn hàng tối thiểu (`min_order`), giới hạn số lượt sử dụng (`usage_limit`), số lần đã dùng (`used_count`).

---

### Phân hệ 4: Quy trình Đặt hàng & Thanh toán (Order & Payment Gateway Domain)
- **Xác nhận Đặt hàng (Checkout):**
  - Chọn địa chỉ giao hàng từ Sổ địa chỉ (`DeliveryAddress`) hoặc nhập địa chỉ mới.
  - Áp dụng mã voucher giảm giá, chọn phương thức thanh toán.
- **Cổng Thanh toán Trực tuyến (Payment Gateways):**
  - **COD (Cash on Delivery):** Thanh toán tiền mặt khi nhận hàng.
  - **VNPay Sandbox Gateway:** Khởi tạo URL thanh toán với chữ băm bảo mật `HMAC-SHA512` bảo vệ dữ liệu giao dịch. Tiếp nhận IPN Webhook tự động cập nhật trạng thái `payment_status = 'paid'`.
- **Vòng đời Trạng thái Đơn hàng (Order Lifecycle Statuses):**
  - `pending` (Chờ xác nhận) → `preparing` (Đang chuẩn bị hàng) → `handed_over` (Đã giao đơn vị vận chuyển) → `shipping` / `delivering` (Đang giao hàng) → `completed` (Hoàn thành) / `canceled` (Đã hủy).
- **Chứng từ Hóa đơn:**
  - Tự động sinh file Hóa đơn bán hàng PDF (sử dụng thư viện `PDFKit`) trong Admin Panel.

---

### Phân hệ 5: Xác thực, Người dùng & Sổ địa chỉ (Auth, User & Address Management)
- **Xác thực Tài khoản (`models/User.js`):**
  - Đăng ký, Đăng nhập xác thực mã hóa mật khẩu 1 chiều `bcrypt`.
  - Cấp phát và xác thực Token `JSON Web Token (JWT)` bảo vệ các API riêng tư.
  - Khôi phục mật khẩu qua mã OTP gửi tới Email (`resetPasswordOTP`).
  - Đăng nhập nhanh qua Google OAuth (`googleId`).
- **Sổ địa chỉ Giao hàng (`models/DeliveryAddress.js`):**
  - Cho phép người dùng lưu nhiều địa chỉ nhận hàng, gán cờ `set_default` cho địa chỉ mặc định.
- **Phân quyền người dùng (Role-Based Access Control - RBAC):**
  - `client`: Người dùng mua sắm thông thường.
  - `admin`: Quản trị viên toàn quyền hệ thống (kiểm soát qua `AdminGuard` và `AuthMiddleware`).

---

### Phân hệ 6: Đánh giá, So sánh & Danh sách Yêu thích (Review, Compare & Wishlist)
- **Đánh giá Sản phẩm (`Review`):**
  - Khách hàng đã mua sản phẩm (`OrderItem`) có quyền viết bình luận và chấm điểm sao (1 - 5 star).
- **So sánh Linh kiện (`Compare`):**
  - Chọn nhiều sản phẩm cùng loại để so sánh thông số kỹ thuật trên bảng trực quan.
- **Danh sách Yêu thích (`Favorite`):**
  - Lưu trữ danh sách linh kiện yêu thích vào tài khoản cá nhân.

---

### Phân hệ 7: Trợ lý Virtual AI Chatbot (AI Assistant Domain)
- **Tích hợp SDK `@google/generative-ai` (`routers/AI_chatbot.js`):**
  - Sử dụng model `gemini-1.5-flash` với cấu hình nhân cách chuyên gia tư vấn thiết bị điện tử WINNOTECH.
  - Tiếp nhận lịch sử trò chuyện (`history`) và câu hỏi mới của khách hàng (`message`).
  - Tự động tư vấn cấu hình PC/laptop theo ngân sách, mục đích sử dụng (Gaming, Đồ họa 3D, Văn phòng) và khéo léo lái khách về sản phẩm của WINNOTECH.

---

### Phân hệ 8: CMS Bài viết, Banner & Báo cáo Quản trị (CMS, Media & Analytics)
- **Bài viết & Tin tức (`Post` & `PostCategory`):**
  - Đăng bài viết chia sẻ thủ thuật công nghệ, review linh kiện mới và thông báo khuyến mãi.
- **Banner & Media (`BannerPaymentImage`):**
  - Quản lý hình ảnh slider banner trang chủ và các biểu tượng thanh toán.
- **Báo cáo & Thống kê Admin:**
  - Biểu đồ doanh thu 12 tháng trong năm, thống kê đơn hàng theo trạng thái, Top sản phẩm bán chạy.
  - Xuất dữ liệu báo cáo kinh doanh ra file Excel (`.xlsx`) bằng thư viện `ExcelJS`.

---

## 4. TÓM TẮT TẬP CƠ SỞ DỮ LIỆU (14 MONGOOSE COLLECTIONS)

| STT | Tên Collection | Mongoose Model | Vai trò & Chức năng |
| :---: | :--- | :--- | :--- |
| 1 | `User` | `User.js` | Lưu thông tin tài khoản người dùng, admin, mã OTP, avatar |
| 2 | `Product` | `Product.js` | Lưu sản phẩm chính (tên, slug, mô tả, danh mục, thương hiệu) |
| 3 | `ProductVariant` | `ProductVariant.js` | Lưu biến thể sản phẩm (SKU, giá gốc, giá sale, tồn kho) |
| 4 | `VariantAttribute` | `ProductVariant.js` | Bảng junction kết nối biến thể với giá trị thuộc tính |
| 5 | `Category` | `Category.js` | Lưu danh mục linh kiện (CPU, GPU, RAM, Mainboard...) |
| 6 | `Brand` | `Brand.js` | Lưu thương hiệu phần cứng (ASUS, MSI, Intel, AMD...) |
| 7 | `Attribute` | `Attribute.js` | Lưu tên & giá trị các thuộc tính kỹ thuật phần cứng |
| 8 | `BuildPC` & `BuildItem` | `BuildPc.js` | Lưu thông tin bộ cấu hình PC do người dùng tự dựng |
| 9 | `CartItem` | `Cartitem.js` | Lưu các sản phẩm trong giỏ hàng (hỗ trợ cả Guest & User) |
| 10 | `Order` & `OrderItem` | `Order.js` | Lưu thông tin đơn hàng, địa chỉ, tổng tiền, chi tiết món hàng |
| 11 | `DeliveryAddress` | `DeliveryAddress.js` | Lưu sổ địa chỉ giao hàng của người dùng |
| 12 | `Voucher` & `UserVoucher` | `Voucher.js` | Lưu mã giảm giá và lịch sử lưu/sử dụng voucher của user |
| 13 | `Favorite`, `Compare`, `Review` | `FavoriteCompareReview.js` | Lưu danh sách yêu thích, so sánh và đánh giá sản phẩm |
| 14 | `Post` & `PostCategory` | `Post.js` | Lưu bài viết tin tức công nghệ và danh mục tin tức |

---

## 5. KẾT LUẬN & GHI NHỚ CHO HỆ THỐNG

Hệ thống **WINNOTECH** là một dự án thương mại điện tử chuyên ngành phần cứng PC hoàn chỉnh. Mọi thiết kế từ Cơ sở dữ liệu Mongoose, RESTful APIs Backend trên Express, đến State Management Redux Toolkit trên React đều được chuẩn hóa cao. 

Nghiệp vụ cốt lõi này đã được phân tích chi tiết và lưu giữ tại tài liệu [BUSINESS_ANALYSIS.md](file:///d:/GAMES/WINNOTECH/BUSINESS_ANALYSIS.md) trong thư mục gốc dự án.
