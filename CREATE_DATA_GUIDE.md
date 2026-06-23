# 📊 HƯỚNG DẪN TẠO DỮ LIỆU MONGODB CHO WINNOTECH

## 🎯 Mục Tiêu
Tài liệu này hướng dẫn cách tạo dữ liệu với **các trường chính xác** theo schema MongoDB của WINNOTech.

---

## 📌 QUI TẮC QUAN TRỌNG

### ✅ Các trường PHẢI có:
- **_id**: MongoDB tự tạo (ObjectId)
- **name**: Tên đối tượng (String, bắt buộc)
- **slug**: URL-friendly (lowercase, no dashes, no special chars)
- **email**: Đúng định dạng (user@domain.com)
- **timestamps**: createdAt, updatedAt (tự động)

### ❌ CÁC LỖI THƯỜNG GẶP:
- ❌ Slug có dấu, khoảng trắng: `"Cpu Intel I9"` → ✅ `"cpu-intel-i9"`
- ❌ ObjectId sai định dạng: `"123abc"` → ✅ `"675a1b2c3d4e5f6g7h8i"`
- ❌ Tiền không đúng: `"29999999"` (string) → ✅ `29999999` (number)
- ❌ Ngày tháng sai: `"15/01/2025"` → ✅ `"2025-01-15T10:00:00.000Z"` (ISO 8601)

---

## 1️⃣ TẠO USER (NGƯỜI DÙNG)

### Endpoint
```
POST /api/account
```

### JSON Request Body (Chính xác):

```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "password": "User@123456",
  "role": "user",
  "status": "active",
  "avatar": "https://example.com/avatars/user1.jpg"
}
```

### Các Giá Trị Hợp Lệ:

**role:**
- `"user"` - Khách hàng
- `"admin"` - Quản trị viên
- `"seller"` - Người bán

**status:**
- `"active"` - Hoạt động
- `"inactive"` - Vô hiệu hóa

### JSON Response (200 OK):

```json
{
  "_id": "675a1b2c3d4e5f6g7h8i",
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "password": "$2b$10$hashedPassword...",
  "role": "user",
  "status": "active",
  "avatar": "https://example.com/avatars/user1.jpg",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

---

## 2️⃣ TẠO CATEGORY (DANH MỤC)

### ⚠️ Hiện chưa có API endpoint, tạo qua MongoDB Compass:

### Dữ Liệu Đúng:

```json
{
  "_id": ObjectId("675a1b2c3d4e5f6g7h8i"),
  "name": "CPU / Bộ Xử Lý",
  "slug": "cpu-bo-xu-ly",
  "description": "Các loại CPU và bộ xử lý máy tính",
  "image": "https://example.com/categories/cpu.jpg",
  "status": "active",
  "parent_id": null
}
```

### MongoDB Insert Command:

```javascript
db.Category.insertOne({
  "name": "CPU / Bộ Xử Lý",
  "slug": "cpu-bo-xu-ly",
  "description": "Các loại CPU và bộ xử lý máy tính",
  "image": "https://example.com/categories/cpu.jpg",
  "status": "active",
  "parent_id": null
})
```

---

## 3️⃣ TẠO BRAND (THƯƠNG HIỆU)

### ⚠️ Hiện chưa có API endpoint, tạo qua MongoDB Compass:

### Dữ Liệu Đúng:

```json
{
  "_id": ObjectId("675a1b2c3d4e5f6g7h8j"),
  "name": "Intel",
  "slug": "intel",
  "logo": "https://example.com/logos/intel.png",
  "description": "Nhà sản xuất CPU hàng đầu thế giới",
  "status": "active"
}
```

### MongoDB Insert Command:

```javascript
db.Brand.insertOne({
  "name": "Intel",
  "slug": "intel",
  "logo": "https://example.com/logos/intel.png",
  "description": "Nhà sản xuất CPU hàng đầu thế giới",
  "status": "active"
})
```

---

## 4️⃣ TẠO PRODUCT (SẢN PHẨM)

### Endpoint
```
POST /api/product
```

### JSON Request Body (Chính xác):

```json
{
  "name": "CPU Intel Core i9-13900K",
  "slug": "cpu-intel-core-i9-13900k",
  "description": "Bộ xử lý Intel Core i9 thế hệ 13 với 24 lõi, tần số lên tới 5.8GHz",
  "short_desc": "Intel Core i9-13900K - 24 cores, 5.8GHz",
  "thumnail": "https://example.com/products/cpu-i9-13900k.jpg",
  "sale": 15,
  "status": "active",
  "cat_id": "675a1b2c3d4e5f6g7h8i",
  "brand_id": "675a1b2c3d4e5f6g7h8j"
}
```

### Ghi Chú:
- **cat_id**: ID của Category (lấy từ bước 2)
- **brand_id**: ID của Brand (lấy từ bước 3)
- **sale**: Phần trăm giảm giá (0-100)
- **thumnail**: URL ảnh (chú ý chính tả "thumnail" không phải "thumbnail")

### JSON Response (201 Created):

```json
{
  "success": true,
  "message": "Tạo sản phẩm thành công",
  "data": {
    "_id": "675a1b2c3d4e5f6g7h8k",
    "name": "CPU Intel Core i9-13900K",
    "slug": "cpu-intel-core-i9-13900k",
    "description": "Bộ xử lý Intel Core i9 thế hệ 13 với 24 lõi, tần số lên tới 5.8GHz",
    "short_desc": "Intel Core i9-13900K - 24 cores, 5.8GHz",
    "thumnail": "https://example.com/products/cpu-i9-13900k.jpg",
    "sale": 15,
    "status": "active",
    "cat_id": "675a1b2c3d4e5f6g7h8i",
    "brand_id": "675a1b2c3d4e5f6g7h8j",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

## 5️⃣ TẠO PRODUCT VARIANT (BIẾN THỂ SẢN PHẨM)

### ⚠️ Hiện chưa có API endpoint, tạo qua MongoDB Compass:

### Dữ Liệu Đúng:

```json
{
  "_id": ObjectId("675a1b2c3d4e5f6g7h8l"),
  "product_id": ObjectId("675a1b2c3d4e5f6g7h8k"),
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

### MongoDB Insert Command:

```javascript
db.ProductVariant.insertOne({
  "product_id": ObjectId("675a1b2c3d4e5f6g7h8k"),
  "sku": "I9-13900K-001",
  "price": 28990000,
  "cost_price": 25000000,
  "quantity": 50,
  "reserved_quantity": 10,
  "status": "available",
  "attributes": [
    { "name": "color", "value": "Black" },
    { "name": "warehouse", "value": "HN01" }
  ]
})
```

---

## 6️⃣ TẠO ORDER (ĐƠN HÀNG)

### ⚠️ Hiện chưa có API endpoint, tạo qua MongoDB Compass:

### Dữ Liệu Đúng:

```json
{
  "_id": ObjectId("675a1b2c3d4e5f6g7h8m"),
  "user_id": ObjectId("675a1b2c3d4e5f6g7h8i"),
  "code": "ORD-2025-001",
  "status": "pending",
  "Name": "Nguyễn Văn A",
  "Phone": "0912345678",
  "Adress": "123 Đường Lê Lợi, Quận 1, TP.HCM",
  "total_amount": 58980000,
  "payment_method": ObjectId("675a1b2c3d4e5f6g7h8n"),
  "voucher_code": "TET2025",
  "voucher_value": 5000000,
  "payment_status": "unpaid",
  "date": new Date("2025-01-15T10:00:00.000Z"),
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

### MongoDB Insert Command:

```javascript
db.Order.insertOne({
  "user_id": ObjectId("675a1b2c3d4e5f6g7h8i"),
  "code": "ORD-2025-001",
  "status": "pending",
  "Name": "Nguyễn Văn A",
  "Phone": "0912345678",
  "Adress": "123 Đường Lê Lợi, Quận 1, TP.HCM",
  "total_amount": 58980000,
  "payment_method": ObjectId("675a1b2c3d4e5f6g7h8n"),
  "voucher_code": "TET2025",
  "voucher_value": 5000000,
  "payment_status": "unpaid",
  "date": new Date(),
  "createdAt": new Date(),
  "updatedAt": new Date()
})
```

---

## 7️⃣ TẠO CART ITEM (MỤC GIỎ HÀNG)

### ⚠️ Hiện chưa có API endpoint, tạo qua MongoDB Compass:

### Dữ Liệu Đúng:

```json
{
  "_id": ObjectId("675a1b2c3d4e5f6g7h8o"),
  "user_id": ObjectId("675a1b2c3d4e5f6g7h8i"),
  "product_id": ObjectId("675a1b2c3d4e5f6g7h8k"),
  "quantity": 1,
  "price": 28990000,
  "variant_id": ObjectId("675a1b2c3d4e5f6g7h8l")
}
```

### MongoDB Insert Command:

```javascript
db.CartItem.insertOne({
  "user_id": ObjectId("675a1b2c3d4e5f6g7h8i"),
  "product_id": ObjectId("675a1b2c3d4e5f6g7h8k"),
  "quantity": 1,
  "price": 28990000,
  "variant_id": ObjectId("675a1b2c3d4e5f6g7h8l")
})
```

---

## 🛠️ CÁCH TẠO DỮ LIỆU - 3 CÁCH

### Cách 1: Dùng Postman (API Endpoints)

**Cho Products và Users:**

```bash
1. Mở Postman
2. Tạo request mới
3. Method: POST
4. URL: http://localhost:3000/api/product
5. Tab Headers → Content-Type: application/json
6. Tab Body → Raw → JSON
7. Paste JSON ở trên
8. Click Send
```

### Cách 2: Dùng MongoDB Compass (Trực tiếp Database)

```bash
1. Mở MongoDB Compass
2. Kết nối: mongodb://127.0.0.1
3. Database: WINNOTech
4. Collection: Category, Brand, ProductVariant, Order, etc.
5. Click "Add Data" → Insert Document
6. Paste JSON ở trên
7. Click Insert
```

### Cách 3: Chạy Script Node.js

```bash
node seed_data_complete.js
```

---

## 📋 DANH SÁCH ID MẪU

Khi tạo dữ liệu, bạn cần thay các ID này bằng ID thực từ database:

| Tên | Loại | Ví Dụ ID |
|-----|------|---------|
| User | ObjectId | `675a1b2c3d4e5f6g7h8i` |
| Category | ObjectId | `675a1b2c3d4e5f6g7h8i` |
| Brand | ObjectId | `675a1b2c3d4e5f6g7h8j` |
| Product | ObjectId | `675a1b2c3d4e5f6g7h8k` |
| ProductVariant | ObjectId | `675a1b2c3d4e5f6g7h8l` |
| PaymentMethod | ObjectId | `675a1b2c3d4e5f6g7h8n` |

---

## ✅ KIỂM CHỨNG DỮ LIỆU

### Sau khi tạo, kiểm tra:

```bash
# Lấy tất cả users
GET http://localhost:3000/api/account

# Lấy tất cả products
GET http://localhost:3000/api/product

# Lấy user theo ID
GET http://localhost:3000/api/account/{user_id}

# Lấy product theo slug
GET http://localhost:3000/api/product/slug/cpu-intel-core-i9-13900k
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [MONGODB_FIELDS_GUIDE.md](MONGODB_FIELDS_GUIDE.md) - Hướng dẫn các trường chi tiết
- [PRODUCT_API_GUIDE.md](PRODUCT_API_GUIDE.md) - Hướng dẫn API sản phẩm
- [product_test.js](product_test.js) - File test API
- [seed_data_complete.js](seed_data_complete.js) - Script tạo dữ liệu

---

## 🚀 BƯỚC TIẾP THEO

1. ✅ Tạo Users qua API
2. ✅ Tạo Products qua API
3. ⏳ Tạo Category, Brand, ProductVariant qua MongoDB Compass
4. ⏳ Tạo Orders, CartItems, Reviews qua MongoDB Compass
5. ⏳ Tạo các API endpoints cho các collection còn lại

Chúc bạn thành công! 🎉
