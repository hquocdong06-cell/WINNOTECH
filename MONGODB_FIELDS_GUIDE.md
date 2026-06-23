# 📚 HƯỚNG DẪN CÁC TRƯỜNG DỮ LIỆU MONGODB - WINNOTECH

## 📋 Mục Lục
1. [User (Người Dùng)](#user)
2. [Category (Danh Mục)](#category)
3. [Brand (Thương Hiệu)](#brand)
4. [Product (Sản Phẩm)](#product)
5. [ProductVariant (Biến Thể Sản Phẩm)](#productvariant)
6. [Order (Đơn Hàng)](#order)
7. [OrderItem (Chi Tiết Đơn Hàng)](#orderitem)
8. [Attribute (Thuộc Tính)](#attribute)
9. [AttributeValue (Giá Trị Thuộc Tính)](#attributevalue)
10. [Favorite (Yêu Thích)](#favorite)
11. [Compare (So Sánh)](#compare)
12. [Review (Đánh Giá)](#review)
13. [Image (Hình Ảnh)](#image)
14. [CartItem (Mục Giỏ Hàng)](#cartitem)
15. [PaymentMethod (Phương Thức Thanh Toán)](#paymentmethod)

---

## <a name="user"></a>1️⃣ User (Người Dùng)

**Collection Name:** `User`

### Các Trường (Fields):

| Trường | Kiểu | Bắt Buộc | Mặc Định | Mô Tả |
|--------|------|---------|---------|-------|
| `_id` | ObjectId | ✅ | Auto | ID duy nhất |
| `name` | String | ✅ | - | Tên người dùng |
| `email` | String | ✅ | - | Email (duy nhất) |
| `password` | String | ✅ | - | Mật khẩu (hash) |
| `role` | String | ❌ | 'user' | Vai trò: 'user', 'admin', 'seller' |
| `status` | String | ❌ | 'active' | Trạng thái: 'active', 'inactive' |
| `avatar` | String | ❌ | - | Đường dẫn ảnh đại diện |
| `createdAt` | Date | ✅ | now | Ngày tạo |
| `updatedAt` | Date | ✅ | now | Ngày cập nhật cuối cùng |

### Ví Dụ Dữ Liệu:

```json
{
  "_id": "ObjectId('123abc...')",
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "password": "$2b$10$hashedPassword...",
  "role": "user",
  "status": "active",
  "avatar": "https://example.com/avatars/user1.jpg",
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-12T15:30:00.000Z"
}
```

---

## <a name="category"></a>2️⃣ Category (Danh Mục)

**Collection Name:** `Category`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `name` | String | ✅ | Tên danh mục |
| `slug` | String | ✅ | URL slug (duy nhất) |
| `description` | String | ❌ | Mô tả danh mục |
| `image` | String | ❌ | Ảnh danh mục |
| `status` | String | ❌ | 'active', 'inactive' |
| `parent_id` | ObjectId | ❌ | ID danh mục cha (cho danh mục con) |

### Ví Dụ:

```json
{
  "_id": "ObjectId('456def...')",
  "name": "CPU / Bộ Xử Lý",
  "slug": "cpu-bo-xu-ly",
  "description": "Các loại CPU và bộ xử lý máy tính",
  "image": "https://example.com/categories/cpu.jpg",
  "status": "active",
  "parent_id": null
}
```

---

## <a name="brand"></a>3️⃣ Brand (Thương Hiệu)

**Collection Name:** `Brand`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `name` | String | ✅ | Tên thương hiệu |
| `slug` | String | ✅ | URL slug (duy nhất) |
| `logo` | String | ❌ | Logo thương hiệu |
| `description` | String | ❌ | Mô tả thương hiệu |
| `status` | String | ❌ | 'active', 'inactive' |

### Ví Dụ:

```json
{
  "_id": "ObjectId('789ghi...')",
  "name": "Intel",
  "slug": "intel",
  "logo": "https://example.com/logos/intel.png",
  "description": "Nhà sản xuất CPU hàng đầu thế giới",
  "status": "active"
}
```

---

## <a name="product"></a>4️⃣ Product (Sản Phẩm)

**Collection Name:** `Product`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mặc Định | Mô Tả |
|--------|------|---------|---------|-------|
| `_id` | ObjectId | ✅ | Auto | ID duy nhất |
| `name` | String | ✅ | - | Tên sản phẩm |
| `slug` | String | ✅ | - | URL slug (duy nhất) |
| `description` | String | ❌ | - | Mô tả chi tiết |
| `short_desc` | String | ❌ | - | Mô tả ngắn |
| `thumnail` | String | ❌ | - | URL hình ảnh thumbnail |
| `sale` | Number | ❌ | 0 | % giảm giá |
| `status` | String | ❌ | 'active' | 'active', 'inactive' |
| `cat_id` | ObjectId | ❌ | - | Tham chiếu Category |
| `brand_id` | ObjectId | ❌ | - | Tham chiếu Brand |
| `createdAt` | Date | ✅ | now | Ngày tạo |
| `updatedAt` | Date | ✅ | now | Ngày cập nhật |

### Ví Dụ:

```json
{
  "_id": "ObjectId('101abc...')",
  "name": "CPU Intel Core i9-13900K",
  "slug": "cpu-intel-core-i9-13900k",
  "description": "Bộ xử lý tối cao cấp với 24 lõi cho gaming và công việc chuyên nghiệp",
  "short_desc": "Intel Core i9 Gen 13 - 24 cores",
  "thumnail": "https://example.com/products/i9.jpg",
  "sale": 15,
  "status": "active",
  "cat_id": "ObjectId('456def...')",
  "brand_id": "ObjectId('789ghi...')",
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-12T15:30:00.000Z"
}
```

---

## <a name="productvariant"></a>5️⃣ ProductVariant (Biến Thể Sản Phẩm)

**Collection Name:** `ProductVariant`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `product_id` | ObjectId | ✅ | Tham chiếu Product |
| `sku` | String | ✅ | Mã SKU (duy nhất) |
| `price` | Number | ✅ | Giá bán |
| `cost_price` | Number | ❌ | Giá vốn |
| `quantity` | Number | ✅ | Số lượng tồn kho |
| `reserved_quantity` | Number | ❌ | Số lượng đã đặt trước |
| `status` | String | ❌ | 'available', 'out_of_stock' |
| `attributes` | Array | ❌ | Mảng thuộc tính |

### Ví Dụ:

```json
{
  "_id": "ObjectId('202abc...')",
  "product_id": "ObjectId('101abc...')",
  "sku": "I9-13900K-001",
  "price": 28990000,
  "cost_price": 25000000,
  "quantity": 50,
  "reserved_quantity": 10,
  "status": "available",
  "attributes": [
    {
      "name": "color",
      "value": "Black"
    },
    {
      "name": "warehouse",
      "value": "HN01"
    }
  ]
}
```

---

## <a name="order"></a>6️⃣ Order (Đơn Hàng)

**Collection Name:** `Order`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mặc Định | Mô Tả |
|--------|------|---------|---------|-------|
| `_id` | ObjectId | ✅ | Auto | ID duy nhất |
| `user_id` | ObjectId | ✅ | - | Tham chiếu User |
| `code` | String | ✅ | - | Mã đơn hàng (duy nhất) |
| `status` | String | ❌ | 'pending' | 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled' |
| `Name` | String | ✅ | - | Tên người nhận (giữ chính tả ERD) |
| `Phone` | String | ✅ | - | Số điện thoại |
| `Adress` | String | ✅ | - | Địa chỉ giao hàng (giữ chính tả ERD) |
| `total_amount` | Number | ✅ | - | Tổng tiền |
| `payment_method` | ObjectId | ❌ | - | Tham chiếu PaymentMethod |
| `voucher_code` | String | ❌ | - | Mã voucher |
| `voucher_value` | Number | ❌ | 0 | Giá trị voucher |
| `payment_status` | String | ❌ | 'unpaid' | 'paid', 'unpaid', 'refunded' |
| `date` | Date | ❌ | now | Ngày tạo đơn hàng |
| `createdAt` | Date | ✅ | now | Ngày tạo record |
| `updatedAt` | Date | ✅ | now | Ngày cập nhật |

### Ví Dụ:

```json
{
  "_id": "ObjectId('303abc...')",
  "user_id": "ObjectId('123abc...')",
  "code": "ORD-2025-001",
  "status": "pending",
  "Name": "Nguyễn Văn A",
  "Phone": "0912345678",
  "Adress": "123 Đường Lê Lợi, Quận 1, TP.HCM",
  "total_amount": 58980000,
  "payment_method": "ObjectId('404abc...')",
  "voucher_code": "TET2025",
  "voucher_value": 5000000,
  "payment_status": "unpaid",
  "date": "2025-01-15T10:00:00.000Z",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

---

## <a name="orderitem"></a>7️⃣ OrderItem (Chi Tiết Đơn Hàng)

**Collection Name:** `OrderItem`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `order_id` | ObjectId | ✅ | Tham chiếu Order |
| `attribute_value_id` | ObjectId | ❌ | Tham chiếu AttributeValue |
| `Quantity` | Number | ✅ | Số lượng (giữ chính tả ERD) |
| `price` | Number | ✅ | Giá bán tại thời điểm mua |

### Ví Dụ:

```json
{
  "_id": "ObjectId('505abc...')",
  "order_id": "ObjectId('303abc...')",
  "attribute_value_id": "ObjectId('606abc...')",
  "Quantity": 2,
  "price": 28990000
}
```

---

## <a name="attribute"></a>8️⃣ Attribute (Thuộc Tính)

**Collection Name:** `Attribute`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `name` | String | ✅ | Tên thuộc tính (VD: color, size) |
| `id_variants` | ObjectId | ❌ | Tham chiếu ProductVariant |

### Ví Dụ:

```json
{
  "_id": "ObjectId('707abc...')",
  "name": "color",
  "id_variants": "ObjectId('202abc...')"
}
```

---

## <a name="attributevalue"></a>9️⃣ AttributeValue (Giá Trị Thuộc Tính)

**Collection Name:** `AttributeValue`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `value` | String | ✅ | Giá trị thuộc tính (VD: Red, Blue) |
| `id_attribute` | ObjectId | ✅ | Tham chiếu Attribute |

### Ví Dụ:

```json
{
  "_id": "ObjectId('606abc...')",
  "value": "Black",
  "id_attribute": "ObjectId('707abc...')"
}
```

---

## <a name="favorite"></a>🔟 Favorite (Yêu Thích)

**Collection Name:** `Favorite`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `user_id` | ObjectId | ✅ | Tham chiếu User |
| `product_id` | ObjectId | ✅ | Tham chiếu Product |

### Ví Dụ:

```json
{
  "_id": "ObjectId('808abc...')",
  "user_id": "ObjectId('123abc...')",
  "product_id": "ObjectId('101abc...')"
}
```

---

## <a name="compare"></a>1️⃣1️⃣ Compare (So Sánh)

**Collection Name:** `Compare`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `user_id` | ObjectId | ✅ | Tham chiếu User |
| `product_id` | ObjectId | ✅ | Tham chiếu Product |

### Ví Dụ:

```json
{
  "_id": "ObjectId('909abc...')",
  "user_id": "ObjectId('123abc...')",
  "product_id": "ObjectId('101abc...')"
}
```

---

## <a name="review"></a>1️⃣2️⃣ Review (Đánh Giá)

**Collection Name:** `Review`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `id_oderitems` | ObjectId | ✅ | Tham chiếu OrderItem (giữ chính tả) |
| `content` | String | ✅ | Nội dung đánh giá |
| `star_number` | Number | ✅ | Số sao (1-5) |

### Ví Dụ:

```json
{
  "_id": "ObjectId('1010abc...')",
  "id_oderitems": "ObjectId('505abc...')",
  "content": "Sản phẩm rất tốt, đóng gói cẩn thận, giao hàng nhanh",
  "star_number": 5
}
```

---

## <a name="image"></a>1️⃣3️⃣ Image (Hình Ảnh)

**Collection Name:** `Image`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `url` | String | ✅ | URL hình ảnh |
| `type` | String | ❌ | Loại ảnh (VD: 'product', 'banner') |
| `alt_text` | String | ❌ | Văn bản mô tả ảnh |
| `p_id` | ObjectId | ❌ | Tham chiếu Product |

### Ví Dụ:

```json
{
  "_id": "ObjectId('1111abc...')",
  "url": "https://example.com/products/i9-front.jpg",
  "type": "product",
  "alt_text": "Intel Core i9-13900K Front View",
  "p_id": "ObjectId('101abc...')"
}
```

---

## <a name="cartitem"></a>1️⃣4️⃣ CartItem (Mục Giỏ Hàng)

**Collection Name:** `CartItem`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `user_id` | ObjectId | ✅ | Tham chiếu User |
| `product_id` | ObjectId | ✅ | Tham chiếu Product |
| `quantity` | Number | ✅ | Số lượng |
| `price` | Number | ✅ | Giá hiện tại |
| `variant_id` | ObjectId | ❌ | Tham chiếu ProductVariant |

### Ví Dụ:

```json
{
  "_id": "ObjectId('1212abc...')",
  "user_id": "ObjectId('123abc...')",
  "product_id": "ObjectId('101abc...')",
  "quantity": 1,
  "price": 28990000,
  "variant_id": "ObjectId('202abc...')"
}
```

---

## <a name="paymentmethod"></a>1️⃣5️⃣ PaymentMethod (Phương Thức Thanh Toán)

**Collection Name:** `PaymentMethod`

### Các Trường:

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|---------|-------|
| `_id` | ObjectId | ✅ | ID duy nhất |
| `name` | String | ✅ | Tên phương thức (VD: 'Credit Card') |
| `code` | String | ✅ | Mã phương thức (duy nhất) |
| `description` | String | ❌ | Mô tả |
| `status` | String | ❌ | 'active', 'inactive' |

### Ví Dụ:

```json
{
  "_id": "ObjectId('404abc...')",
  "name": "Thẻ Tín Dụng",
  "code": "CREDIT_CARD",
  "description": "Thanh toán bằng thẻ tín dụng Visa, Mastercard, JCB",
  "status": "active"
}
```

---

## 📝 Lưu Ý Quan Trọng

### ✅ Đúng:
- **Slug** phải là lowercase, không dấu, dùng dấu gạch ngang `-`
- **Tham chiếu** (Foreign Key) phải là ObjectId hoặc null
- **Số tiền** nên lưu dưới dạng số nguyên (VND không dấu phẩy)
- **Ngày tháng** lưu dưới dạng ISO 8601 (VD: `2025-01-15T10:00:00.000Z`)

### ❌ Sai:
- Lưu slug với dấu hoặc khoảng trắng
- Lưu tiền dưới dạng string
- Lưu ngày tháng dưới dạng string không chuẩn

---

## 🔗 Quan Hệ Giữa Các Collection

```
User (1) ──────── (N) Order
User (1) ──────── (N) Favorite
User (1) ──────── (N) Compare
User (1) ──────── (N) CartItem

Category (1) ──────── (N) Product
Brand (1) ──────---- (N) Product

Product (1) ──────---- (N) ProductVariant
Product (1) ──────---- (N) Image
Product (1) ──────---- (N) Favorite
Product (1) ──────---- (N) Compare

ProductVariant (1) ──────---- (N) OrderItem

Order (1) ──────---- (N) OrderItem
OrderItem (1) ──────---- (N) Review

Attribute (1) ──────---- (N) AttributeValue
```

---

Chúc bạn tạo dữ liệu MongoDB thành công! 🚀
