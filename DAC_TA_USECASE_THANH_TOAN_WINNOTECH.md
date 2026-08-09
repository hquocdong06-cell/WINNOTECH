# ĐẶC TẢ CHI TIẾT USE CASE: THANH TOÁN ĐƠN HÀNG (WINNOTECH E-COMMERCE)

> **Mã Use Case:** UC-CLIENT-07  
> **Tên Use Case:** Đặt hàng & Thanh toán Đơn hàng (Order Placement & Payment Processing)  
> **Phân hệ:** Khách hàng (Client Frontend) & Hệ thống Backend API  
> **Ngày cập nhật:** 08/08/2026  

---

## 1. THÔNG TIN TỔNG QUAN

- **Mô tả ngắn gọn:**  
  Chức năng cho phép Khách hàng thành viên đã đăng nhập truy cập vào trang Thanh toán (`/checkout`) từ Giỏ hàng (`/cart`). Khách hàng xem lại danh sách sản phẩm/biến thể linh kiện PC và quà tặng khuyến mãi được tặng kèm, kiểm tra/thay đổi thông tin địa chỉ người nhận trong Sổ địa chỉ (`DeliveryAddress`), áp dụng mã giảm giá Voucher đủ điều kiện, lựa chọn Phương thức thanh toán (COD hoặc VNPay Sandbox Gateway) và tiến hành đặt hàng.

- **Tác nhân (Actors):**
  - **Khách hàng (Client User):** Người mua hàng đã đăng nhập tài khoản thành viên.
  - **Hệ thống WINNOTECH Backend:** Node.js/Express REST API xử lý giao dịch.
  - **Cổng thanh toán bên thứ ba:** VNPay Sandbox Payment Gateway.
  - **Cơ sở dữ liệu:** MongoDB Database (`Order`, `OrderItem`, `ProductVariant`, `CartItem`, `DeliveryAddress`, `Voucher`).

---

## 2. ĐIỀU KIỆN HỆ THỐNG

- **Điều kiện tiên quyết (Pre-conditions):**
  1. Khách hàng **bắt buộc đã đăng nhập** tài khoản hợp lệ (xác thực thành công và sở hữu JWT Token lưu tại Cookie/LocalStorage).
  2. Giỏ hàng (`CartItem`) của người dùng có ít nhất **01 sản phẩm / biến thể linh kiện PC** (hoặc cấu hình PC được nạp từ công cụ Build PC) với số lượng tồn kho khả dụng (`stock_quantity > 0`).

- **Điều kiện hậu quả (Post-conditions - Khi đặt hàng thành công):**
  1. Một bản ghi Đơn hàng mới được tạo trong Collection `Order` với Mã đơn hàng duy nhất dạng `WNTyyyyMMddxx` (ví dụ: `WNT2026080801`).
  2. Các bản ghi Chi tiết đơn hàng được tạo trong Collection `OrderItem`.
  3. Tồn kho sản phẩm (`stock_quantity`) của từng biến thể được tự động trừ tương ứng với số lượng mua, đồng thời số lượng đã bán (`soldQuantity`) được cộng thêm.
  4. Các sản phẩm đã mua được xóa khỏi Giỏ hàng (`CartItem`).
  5. Nếu có áp dụng mã Voucher, số lần sử dụng (`used_count`) của voucher đó được cộng thêm 1.
  6. Email thông báo xác nhận đơn hàng tự động gửi tới email khách hàng qua dịch vụ Nodemailer.

---

## 3. LUỒNG SỰ KIỆN CHI TIẾT (FLOW OF EVENTS)

### 3.1. Luồng Chính (Main Flow - Success Scenario)

```
[Khách hàng]                 [React Client UI]             [Express Backend API]         [VNPay Gateway]         [MongoDB Database]
     |                               |                                |                           |                         |
     |-- 1. Click "Thanh toán" ----->|                                |                           |                         |
     |    (tại trang /cart)          |--- 2. Kiểm tra JWT Auth ------>|                           |                         |
     |                               |<-- 3. Token hợp lệ ------------|                           |                         |
     |                               |                                |                           |                         |
     |                               |--- 4. Lấy Sổ địa chỉ, Giỏ hàng, Voucher ---------------------------------->|
     |                               |<-- 5. Trả về dữ liệu Checkout --------------------------------------------|
     |                               |                                |                           |                         |
     |-- 6. Xem & Thay đổi Địa chỉ ->|                                |                           |                         |
     |    & Phương thức thanh toán   |                                |                           |                         |
     |                               |                                |                           |                         |
     |-- 7. Nhấn nút "Đặt hàng" ---->|                                |                           |                         |
     |                               |--- 8. POST /api/orders ------->|                           |                         |
     |                               |    (Gửi địa chỉ, items, vnp)  |--- 9. Kiểm tra Kho, Voucher, Địa chỉ ------>|
     |                               |                                |<-- 10. Dữ liệu hợp lệ --------------------|
     |                               |                                |                           |                         |
     |                               |                                |--- 11. Tạo Order & Trừ Kho stock ---------->|
     |                               |                                |--- 12. Xóa các item khỏi CartItem ---------->|
     |                               |                                |                           |                         |
     |                               |    [NẾU CHỌN COD]              |                           |                         |
     |                               |<-- 13a. Trả về orderSuccess ---|                           |                         |
     |<- 14a. Chuyển sang /order-succ|                                |                           |                         |
     |                               |                                |                           |                         |
     |                               |    [NẾU CHỌN VNPAY]            |                           |                         |
     |                               |                                |--- 13b. Sinh URL băm HMAC-SHA512 -------->|
     |                               |<-- 14b. Trả về paymentUrl -----|                           |                         |
     |-- 15b. Chuyển sang VNPay UI -------------------------------------------------------------->|                         |
     |-- 16b. Quét QR / Thẻ ATM ---------------------------------------------------------------->|                         |
     |                                                                                            |-- 17b. Giao dịch OK     |
     |                                                                |<-- 18b. IPN Webhook ------|                         |
     |                                                                |    (ResponseCode = '00')  |                         |
     |                                                                |--- 19b. Update paymentStatus: 'paid' ------>|
     |<-- 20b. Chuyển về /order-success ------------------------------|                           |                         |
```

1. **Bước 1:** Khách hàng tại trang Giỏ hàng (`/cart`) nhấn nút **"Tiến hành thanh toán"**.
2. **Bước 2:** Hệ thống Frontend kiểm tra cờ xác thực JWT Token của người dùng.
3. **Bước 3:** Hệ thống chuyển hướng người dùng đến trang Thanh toán (`/checkout`).
4. **Bước 4:** Trang `/checkout` tự động gọi các API Backend để tải:
   - Danh sách địa chỉ nhận hàng từ Collection `DeliveryAddress` (gán mặc định địa chỉ có `set_default: true`).
   - Danh sách các linh kiện/biến thể và sản phẩm Quà tặng ưu đãi tặng kèm từ Collection `CartItem`.
   - Thông tin mã Voucher đủ điều kiện đã được áp dụng.
5. **Bước 5:** Khách hàng kiểm tra và thực hiện điều chỉnh (nếu cần):
   - Chọn địa chỉ nhận hàng có sẵn hoặc bấm chọn "Thêm địa chỉ giao hàng mới".
   - Tùy chọn Phương thức thanh toán: **COD (Thanh toán khi nhận hàng - Mặc định)** hoặc **Cổng thanh toán VNPay Sandbox / VietQR**.
   - Nhập ghi chú đơn hàng (nếu có).
6. **Bước 6:** Khách hàng quan sát bảng Tổng quan Thanh toán ở cột bên phải: Tiền tạm tính linh kiện, Phí vận chuyển, Tiền giảm giá Voucher, **Tổng giá trị thanh toán** và **Số tiền tiết kiệm được**.
7. **Bước 7:** Khách hàng nhấn nút **"Đặt hàng"** (đối với COD) hoặc **"Thanh toán qua VNPay"**.
8. **Bước 8:** Hệ thống Backend nhận request `POST /api/orders` và tiến hành xác thực dữ liệu:
   - Kiểm tra tồn kho thời gian thực của từng biến thể (`stock_quantity >= quantity`).
   - Kiểm tra điều kiện hiệu lực của mã Voucher.
   - Xác thực thông tin địa chỉ và số điện thoại người nhận.
9. **Bước 9:** Backend tạo bản ghi Đơn hàng mới (`Order`) với trạng thái ban đầu `orderStatus: 'pending'`, `paymentStatus: 'unpaid'`, tạo các bản ghi `OrderItem`, tự động trừ số lượng tồn kho (`stock_quantity`), xóa các mặt hàng tương ứng trong `CartItem`, và gửi Email xác nhận qua Nodemailer.
10. **Bước 10 (Chuyển hướng theo phương thức thanh toán):**
    - **Trường hợp thanh toán COD:** Backend phản hồi kết quả thành công. Frontend chuyển hướng khách hàng sang trang **Đặt hàng Thành công (`/order-success`)**, hiển thị Mã đơn hàng, chi tiết đơn và nút Tải Hóa đơn PDF.
    - **Trường hợp thanh toán VNPay:** Backend khởi tạo chuỗi mã hóa băm `HMAC-SHA512` với `vnp_HashSecret`, trả về `paymentUrl`. Frontend chuyển hướng khách hàng sang Cổng thanh toán VNPay Sandbox để nhập thông tin thẻ / quét mã VietQR. Sau khi thanh toán hoàn tất, VNPay gửi Webhook IPN phản hồi `vnp_ResponseCode = '00'`, Backend cập nhật `paymentStatus: 'paid'`, `orderStatus: 'preparing'` và chuyển hướng khách hàng về trang `/order-success`.

---

### 3.2. Luồng Ngoại Lệ & Xử Lý Thất Bại (Exception / Alternative Flows)

- **E1. Chưa đăng nhập hoặc Phiên làm việc hết hạn (JWT Invalid/Expired):**
  - *Điều kiện phát hiện:* Khách hàng chưa đăng nhập hoặc Token hết hạn khi truy cập `/checkout`.
  - *Xử lý:* Hệ thống hiển thị thông báo "Vui lòng đăng nhập để tiến hành thanh toán", tự động lưu trạng thái giỏ hàng và chuyển hướng người dùng về trang Đăng nhập (`/auth`).

- **E2. Sản phẩm trong kho bị hết hàng hoặc không đủ số lượng (Out of Stock):**
  - *Điều kiện phát hiện:* Tại Bước 8, có ít nhất 01 biến thể linh kiện trong giỏ hàng có số lượng tồn kho `stock_quantity < quantity` (do khách hàng khác đã mua trước đó).
  - *Xử lý:* Hệ thống từ chối tạo đơn hàng, trả về thông báo lỗi: *"Sản phẩm [Tên sản phẩm - Biến thể] hiện chỉ còn [X] sản phẩm trong kho. Vui lòng cập nhật lại giỏ hàng!"*. Giỏ hàng được giữ nguyên để khách hàng điều chỉnh.

- **E3. Bỏ trống địa chỉ giao hàng hoặc thông tin người nhận không hợp lệ:**
  - *Điều kiện phát hiện:* Người dùng chưa chọn địa chỉ từ Sổ địa chỉ hoặc số điện thoại người nhận không đúng định dạng.
  - *Xử lý:* Hệ thống hiển thị lỗi cảnh báo form *"Vui lòng chọn hoặc nhập đầy đủ địa chỉ giao hàng và số điện thoại người nhận hợp lệ!"*, ngăn không cho gửi request đặt hàng.

- **E4. Voucher hết hạn hoặc bị hủy trong quá trình thanh toán:**
  - *Điều kiện phát hiện:* Mã Voucher bị hết hạn hoặc vượt quá tổng lượt sử dụng toàn hệ thống.
  - *Xử lý:* Hệ thống hiển thị thông báo *"Mã voucher không còn hiệu lực"*, tự động tính toán lại Tổng tiền đơn hàng không bao gồm giảm giá voucher và yêu cầu người dùng xác nhận lại trước khi bấm Đặt hàng.

- **E5. Giao dịch thanh toán trực tuyến qua VNPay thất bại hoặc người dùng hủy:**
  - *Điều kiện phát hiện:* Khách hàng chủ động nhấn "Hủy giao dịch" tại cổng VNPay hoặc thanh toán không thành công (`vnp_ResponseCode != '00'`).
  - *Xử lý:* VNPay chuyển hướng về trang `/payment-result?status=failed`. Đơn hàng vẫn được tạo ở trạng thái `paymentStatus: 'unpaid'`. Hệ thống hiển thị thông báo *"Thanh toán không thành công. Đơn hàng của bạn đã được lưu ở trạng thái Chưa thanh toán"*, đi kèm nút **"Thực hiện lại thanh toán"** hoặc chuyển sang phương thức COD trong trang Lịch sử mua hàng.

---

## 4. KẾT QUẢ ĐẦU RA (RESULTS)

- **Trường hợp Thành công:**
  - Khách hàng được chuyển hướng mượt mà đến trang **Đặt hàng Thành công (`/order-success`)**.
  - Hiển thị đầy đủ tổng quan đơn hàng: Mã đơn hàng (`WNT...`), Ngày đặt, Danh sách linh kiện & quà tặng, Tổng tiền thanh toán, Phương thức thanh toán, Nút xem Lịch sử đơn hàng và Nút Tải Hóa đơn PDF.
  - Đơn hàng xuất hiện ngay lập tức trong Trang Quản lý Đơn hàng của Admin (`Orders.jsx`) kèm phát âm thanh thông báo đơn mới.

- **Trường hợp Thất bại:**
  - Hệ thống giữ người dùng ở lại trang Thanh toán (`/checkout`) hoặc hiển thị modal/toast thông báo nguyên nhân lỗi chi tiết (Hết hàng, Lỗi kết nối cổng thanh toán, Sai thông tin địa chỉ).
  - Không làm mất dữ liệu giỏ hàng của người dùng.
