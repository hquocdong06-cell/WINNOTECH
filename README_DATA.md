# 📚 WINNOTECH - HƯỚNG DẪN TẠO DỮ LIỆU MONGODB (TÓMLƯỢC)

## ✅ Server Status
- **Status**: ✅ **CHẠY THÀNH CÔNG**
- **URL**: http://localhost:3000
- **Database**: ✅ MongoDB Connected (127.0.0.1)

---

## 📖 DANH SÁCH CÁC HƯỚNG DẪN ĐÃ TẠO

| Tài Liệu | Nội Dung | Dùng Cho |
|---------|---------|---------|
| **MONGODB_FIELDS_GUIDE.md** | 📊 Các trường của TẤT CẢ collections (15 loại) | Hiểu cấu trúc dữ liệu |
| **CREATE_DATA_GUIDE.md** | 📝 Hướng dẫn từng bước tạo dữ liệu | Tạo dữ liệu đúng |
| **JSON_EXAMPLES.md** | 📋 JSON sẵn sàng copy-paste | Copy nhanh vào Postman |
| **PRODUCT_API_GUIDE.md** | 📦 API Sản phẩm chi tiết | Test API sản phẩm |
| **QUICK_START_PRODUCT_API.md** | ⚡ Bắt đầu nhanh Product API | Quick start |

---

## 🎯 CÁCH NHANH NHẤT TẠO DỮ LIỆU

### **Cách 1: Dùng Script (Tự động) ⭐⭐⭐**
```bash
npm start  # Terminal 1 (nếu chưa chạy)
node seed_data_complete.js  # Terminal 2
```
✅ Tạo tự động: Users + Products

### **Cách 2: Dùng Postman (Thủ công)**

**Bước 1: Tạo Users**
- Mở Postman
- POST: `http://localhost:3000/api/account`
- Body → Copy từ [JSON_EXAMPLES.md](JSON_EXAMPLES.md) (phần User)
- Click Send

**Bước 2: Tạo Products**
- POST: `http://localhost:3000/api/product`
- Body → Copy từ [JSON_EXAMPLES.md](JSON_EXAMPLES.md) (phần Product)
- Click Send

**Bước 3: Tạo Categories, Brands, v.v (MongoDB Compass)**
- Mở MongoDB Compass
- Database: WINNOTech
- Collection: Category
- Click "+", chọn "Add Document"
- Copy từ [JSON_EXAMPLES.md](JSON_EXAMPLES.md) (MongoDB INSERT)

### **Cách 3: Dùng MongoDB Compass (Trực tiếp)**
- Mở MongoDB Compass → Database WINNOTech
- Chọn collection (Category, Brand, ProductVariant, etc.)
- Insert Document → Copy JSON từ [JSON_EXAMPLES.md](JSON_EXAMPLES.md)

---

## 📋 BẢNG CHỨA CHỨC NĂNG

| Chức Năng | Endpoint | Method | Status | Hướng Dẫn |
|----------|---------|--------|--------|-----------|
| **Tạo User** | `/api/account` | POST | ✅ API | [CREATE_DATA_GUIDE.md](#1️⃣-tạo-user) |
| **Lấy Users** | `/api/account` | GET | ✅ API | [PRODUCT_API_GUIDE.md](#) |
| **Cập nhật User** | `/api/account/:id` | PUT | ✅ API | - |
| **Xóa User** | `/api/account/:id` | DELETE | ✅ API | - |
| **Tạo Product** | `/api/product` | POST | ✅ API | [PRODUCT_API_GUIDE.md](#4️⃣-tạo-sản-phẩm-mới) |
| **Lấy Products** | `/api/product` | GET | ✅ API | [PRODUCT_API_GUIDE.md](#1️⃣-lấy-tất-cả-sản-phẩm) |
| **Lấy Product (ID)** | `/api/product/:id` | GET | ✅ API | [PRODUCT_API_GUIDE.md](#2️⃣-lấy-sản-phẩm-theo-id) |
| **Lấy Product (Slug)** | `/api/product/slug/:slug` | GET | ✅ API | [PRODUCT_API_GUIDE.md](#3️⃣-lấy-sản-phẩm-theo-slug) |
| **Cập nhật Product** | `/api/product/:id` | PUT | ✅ API | [PRODUCT_API_GUIDE.md](#5️⃣-cập-nhật-sản-phẩm) |
| **Xóa Product** | `/api/product/:id` | DELETE | ✅ API | [PRODUCT_API_GUIDE.md](#6️⃣-xóa-sản-phẩm) |
| **Tạo Category** | `/api/category` | POST | ⏳ TODO | MongoDB Compass |
| **Tạo Brand** | `/api/brand` | POST | ⏳ TODO | MongoDB Compass |
| **Tạo ProductVariant** | `/api/product-variant` | POST | ⏳ TODO | MongoDB Compass |
| **Tạo Order** | `/api/order` | POST | ⏳ TODO | MongoDB Compass |
| **Tạo CartItem** | `/api/cart-item` | POST | ⏳ TODO | MongoDB Compass |

---

## 📊 CÁC COLLECTIONS VÀ SỐ TRƯỜNG

| Collection | Số Trường | Trường Chính | Hướng Dẫn |
|-----------|---------|-------------|----------|
| User | 9 | name, email, password, role | [MONGODB_FIELDS_GUIDE.md#user](#1️⃣-user) |
| Category | 7 | name, slug, description | [MONGODB_FIELDS_GUIDE.md#category](#2️⃣-category) |
| Brand | 6 | name, slug, logo | [MONGODB_FIELDS_GUIDE.md#brand](#3️⃣-brand) |
| Product | 12 | name, slug, description, sale | [MONGODB_FIELDS_GUIDE.md#product](#4️⃣-product) |
| ProductVariant | 8 | product_id, sku, price, quantity | [MONGODB_FIELDS_GUIDE.md#productvariant](#5️⃣-productvariant) |
| Order | 13 | user_id, code, total_amount | [MONGODB_FIELDS_GUIDE.md#order](#6️⃣-order) |
| OrderItem | 5 | order_id, quantity, price | [MONGODB_FIELDS_GUIDE.md#orderitem](#7️⃣-orderitem) |
| Attribute | 3 | name, id_variants | [MONGODB_FIELDS_GUIDE.md#attribute](#8️⃣-attribute) |
| AttributeValue | 3 | value, id_attribute | [MONGODB_FIELDS_GUIDE.md#attributevalue](#9️⃣-attributevalue) |
| Favorite | 3 | user_id, product_id | [MONGODB_FIELDS_GUIDE.md#favorite](#🔟-favorite) |
| Compare | 3 | user_id, product_id | [MONGODB_FIELDS_GUIDE.md#compare](#1️⃣1️⃣-compare) |
| Review | 4 | id_oderitems, content, star_number | [MONGODB_FIELDS_GUIDE.md#review](#1️⃣2️⃣-review) |
| Image | 5 | url, type, alt_text, p_id | [MONGODB_FIELDS_GUIDE.md#image](#1️⃣3️⃣-image) |
| CartItem | 6 | user_id, product_id, quantity | [MONGODB_FIELDS_GUIDE.md#cartitem](#1️⃣4️⃣-cartitem) |
| PaymentMethod | 4 | name, code, description | [MONGODB_FIELDS_GUIDE.md#paymentmethod](#1️⃣5️⃣-paymentmethod) |

---

## 🚀 CÁC BƯỚC KHỞI CHẠY

### **Terminal 1 - Chạy Server**
```bash
cd h:\WINNOTech
npm start
```
✅ Khi thấy:
```
✅ MongoDB Connected: 127.0.0.1
Server started on port
```

### **Terminal 2 - Tạo Dữ Liệu (Tùy chọn)**
```bash
cd h:\WINNOTech
node seed_data_complete.js
```

### **Terminal 3 - Chạy Postman hoặc MongoDB Compass**
- Postman: `http://localhost:3000`
- MongoDB: `mongodb://127.0.0.1`

---

## ⚡ NHANH NHẤT: Tạo Dữ Liệu Trong 5 Phút

### **5 Bước:**

1. **Copy User JSON**
   ```bash
   Mở [JSON_EXAMPLES.md](JSON_EXAMPLES.md)
   Tìm "User 1 - Khách Hàng"
   Copy toàn bộ JSON
   ```

2. **Mở Postman**
   ```bash
   POST http://localhost:3000/api/account
   Paste vào Body → raw → JSON
   Click Send
   ```

3. **Lặp lại với User 2, 3**
   ```bash
   Thay email khác
   Thay password khác
   Click Send
   ```

4. **Tạo Product**
   ```bash
   Tìm "Product 1 - CPU Intel" trong [JSON_EXAMPLES.md](JSON_EXAMPLES.md)
   POST http://localhost:3000/api/product
   Paste → Click Send
   Lặp lại với Product 2-6
   ```

5. **Tạo Category, Brand qua MongoDB Compass**
   ```bash
   Mở MongoDB Compass
   Database: WINNOTech
   Collection: Category → Add Document
   Copy từ [JSON_EXAMPLES.md](JSON_EXAMPLES.md)
   ```

---

## ❌ LỖI THƯỜNG GẶP & CÁCH FIX

| Lỗi | Nguyên Nhân | Cách Khắc Phục |
|-----|-----------|---------------|
| **Cannot GET /api/account** | Server chưa chạy | `npm start` ở Terminal 1 |
| **MongoDB Connection Failed** | MongoDB chưa chạy | `mongod` ở Terminal khác |
| **Email already exists** | Email trùng | Thay email khác |
| **Slug already exists** | Slug trùng | Thay slug khác |
| **Postman Connection Refused** | Server không chạy | Kiểm tra Terminal 1 |
| **MONGODB_URI not found** | .env chưa cấu hình | Kiểm tra file `.env` |

---

## 📞 LIÊN HỆ & SUPPORT

- 📖 Hướng dẫn chi tiết: [MONGODB_FIELDS_GUIDE.md](MONGODB_FIELDS_GUIDE.md)
- 📋 JSON Examples: [JSON_EXAMPLES.md](JSON_EXAMPLES.md)
- 🔧 Tạo dữ liệu: [CREATE_DATA_GUIDE.md](CREATE_DATA_GUIDE.md)
- 📦 API Products: [PRODUCT_API_GUIDE.md](PRODUCT_API_GUIDE.md)

---

## 📌 CHECKLIST - KIỂM TRA XONG

- [ ] ✅ Server chạy `npm start`
- [ ] ✅ MongoDB kết nối
- [ ] ✅ Tạo Users qua Postman
- [ ] ✅ Tạo Products qua Postman
- [ ] ✅ Tạo Categories qua MongoDB Compass
- [ ] ✅ Tạo Brands qua MongoDB Compass
- [ ] ✅ Kiểm tra dữ liệu: `GET /api/product`

---

**Chúc bạn tạo dữ liệu thành công! 🎉**

**Bắt đầu ngay:** Mở [JSON_EXAMPLES.md](JSON_EXAMPLES.md) và bắt đầu copy-paste!
