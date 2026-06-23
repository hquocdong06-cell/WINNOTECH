# 📋 JSON EXAMPLES - CÓP TRỰC TIẾP VÀO POSTMAN/MONGODB

## 🔴 COPY-PASTE READY JSON DATA

---

## 1️⃣ USER EXAMPLES

### User 1 - Khách Hàng
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

### User 2 - Admin
```json
{
  "name": "Admin WINNOTech",
  "email": "admin@winnotech.com",
  "password": "Admin@123456",
  "role": "admin",
  "status": "active",
  "avatar": "https://example.com/avatars/admin.jpg"
}
```

### User 3 - Seller
```json
{
  "name": "Phạm Minh C",
  "email": "phamminhc@gmail.com",
  "password": "Seller@123456",
  "role": "seller",
  "status": "active",
  "avatar": "https://example.com/avatars/seller1.jpg"
}
```

---

## 2️⃣ PRODUCT EXAMPLES

### Product 1 - CPU Intel
```json
{
  "name": "CPU Intel Core i9-13900K",
  "slug": "cpu-intel-core-i9-13900k",
  "description": "Bộ xử lý Intel Core i9 thế hệ 13 với 24 lõi, tần số lên tới 5.8GHz. Hiệu năng mạnh cho gaming, streaming và công việc chuyên nghiệp.",
  "short_desc": "Intel Core i9-13900K - 24 cores, 5.8GHz",
  "thumnail": "https://example.com/products/cpu-i9-13900k.jpg",
  "sale": 15,
  "status": "active"
}
```

### Product 2 - GPU NVIDIA
```json
{
  "name": "GPU NVIDIA RTX 4090",
  "slug": "gpu-nvidia-rtx-4090",
  "description": "Card đồ họa NVIDIA RTX 4090 với 24GB GDDR6X, hiệu năng cao nhất cho gaming 4K và AI.",
  "short_desc": "NVIDIA RTX 4090 - 24GB GDDR6X, Gaming 4K",
  "thumnail": "https://example.com/products/gpu-rtx-4090.jpg",
  "sale": 5,
  "status": "active"
}
```

### Product 3 - CPU AMD
```json
{
  "name": "CPU AMD Ryzen 9 7950X3D",
  "slug": "cpu-amd-ryzen-9-7950x3d",
  "description": "Bộ xử lý AMD Ryzen 9 với 16 lõi, 32 thread, công nghệ 3D V-Cache độc quyền. Hiệu năng gaming tuyệt vời.",
  "short_desc": "AMD Ryzen 9 7950X3D - 16 cores, 3D V-Cache",
  "thumnail": "https://example.com/products/cpu-ryzen-7950x3d.jpg",
  "sale": 10,
  "status": "active"
}
```

### Product 4 - RAM Kingston
```json
{
  "name": "RAM Kingston Fury Beast DDR5 32GB",
  "slug": "ram-kingston-fury-beast-ddr5-32gb",
  "description": "Bộ nhớ Kingston Fury Beast DDR5 32GB (2x16GB), tần số 6000MHz, hiệu năng cao.",
  "short_desc": "Kingston Fury Beast DDR5 32GB - 6000MHz",
  "thumnail": "https://example.com/products/ram-kingston-fury-32gb.jpg",
  "sale": 10,
  "status": "active"
}
```

### Product 5 - SSD Samsung
```json
{
  "name": "SSD Samsung 990 Pro 2TB",
  "slug": "ssd-samsung-990-pro-2tb",
  "description": "SSD NVMe Samsung 990 Pro 2TB, tốc độ đọc ghi tới 7100MB/s, hỗ trợ PCIe 4.0.",
  "short_desc": "Samsung 990 Pro 2TB - PCIe 4.0, 7100MB/s",
  "thumnail": "https://example.com/products/ssd-samsung-990pro-2tb.jpg",
  "sale": 15,
  "status": "active"
}
```

### Product 6 - Mainboard
```json
{
  "name": "Motherboard ASUS ROG MAXIMUS Z790",
  "slug": "motherboard-asus-rog-maximus-z790",
  "description": "Bo mạch chủ ASUS ROG MAXIMUS Z790 hỗ trợ Intel Gen 13, PCIe 5.0, DDR5.",
  "short_desc": "ASUS ROG MAXIMUS Z790 - Intel Gen 13, DDR5",
  "thumnail": "https://example.com/products/mb-asus-rog-z790.jpg",
  "sale": 12,
  "status": "active"
}
```

---

## 3️⃣ MONGODB COMPASS - CATEGORIES INSERT

Chạy từng cái riêng:

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

```javascript
db.Category.insertOne({
  "name": "GPU / Card Đồ Họa",
  "slug": "gpu-card-do-hoa",
  "description": "Card đồ họa cho gaming và design",
  "image": "https://example.com/categories/gpu.jpg",
  "status": "active",
  "parent_id": null
})
```

```javascript
db.Category.insertOne({
  "name": "RAM / Bộ Nhớ",
  "slug": "ram-bo-nho",
  "description": "Bộ nhớ RAM các dung lượng khác nhau",
  "image": "https://example.com/categories/ram.jpg",
  "status": "active",
  "parent_id": null
})
```

```javascript
db.Category.insertOne({
  "name": "SSD / HDD / Ổ Cứng",
  "slug": "ssd-hdd-o-cung",
  "description": "Ổ cứng SSD và HDD",
  "image": "https://example.com/categories/storage.jpg",
  "status": "active",
  "parent_id": null
})
```

```javascript
db.Category.insertOne({
  "name": "Mainboard / Bo Mạch Chủ",
  "slug": "mainboard-bo-mach-chu",
  "description": "Bo mạch chủ các hãng Intel, AMD",
  "image": "https://example.com/categories/mainboard.jpg",
  "status": "active",
  "parent_id": null
})
```

---

## 4️⃣ MONGODB COMPASS - BRANDS INSERT

```javascript
db.Brand.insertOne({
  "name": "Intel",
  "slug": "intel",
  "logo": "https://example.com/logos/intel.png",
  "description": "Nhà sản xuất CPU hàng đầu thế giới",
  "status": "active"
})
```

```javascript
db.Brand.insertOne({
  "name": "AMD",
  "slug": "amd",
  "logo": "https://example.com/logos/amd.png",
  "description": "Nhà sản xuất CPU, GPU, chipset",
  "status": "active"
})
```

```javascript
db.Brand.insertOne({
  "name": "NVIDIA",
  "slug": "nvidia",
  "logo": "https://example.com/logos/nvidia.png",
  "description": "Nhà sản xuất GPU NVIDIA GeForce",
  "status": "active"
})
```

```javascript
db.Brand.insertOne({
  "name": "Kingston",
  "slug": "kingston",
  "logo": "https://example.com/logos/kingston.png",
  "description": "Nhà sản xuất RAM, SSD, USB",
  "status": "active"
})
```

```javascript
db.Brand.insertOne({
  "name": "Samsung",
  "slug": "samsung",
  "logo": "https://example.com/logos/samsung.png",
  "description": "Nhà sản xuất SSD, RAM, màn hình",
  "status": "active"
})
```

```javascript
db.Brand.insertOne({
  "name": "ASUS",
  "slug": "asus",
  "logo": "https://example.com/logos/asus.png",
  "description": "Nhà sản xuất bo mạch, linh kiện",
  "status": "active"
})
```

---

## 5️⃣ MONGODB COMPASS - PAYMENT METHODS INSERT

```javascript
db.PaymentMethod.insertOne({
  "name": "Thẻ Tín Dụng",
  "code": "CREDIT_CARD",
  "description": "Thanh toán bằng thẻ tín dụng Visa, Mastercard, JCB",
  "status": "active"
})
```

```javascript
db.PaymentMethod.insertOne({
  "name": "Thẻ Ghi Nợ",
  "code": "DEBIT_CARD",
  "description": "Thanh toán bằng thẻ ghi nợ",
  "status": "active"
})
```

```javascript
db.PaymentMethod.insertOne({
  "name": "Chuyển Khoản Ngân Hàng",
  "code": "BANK_TRANSFER",
  "description": "Chuyển tiền trực tiếp vào tài khoản ngân hàng",
  "status": "active"
})
```

```javascript
db.PaymentMethod.insertOne({
  "name": "Ví Điện Tử",
  "code": "E_WALLET",
  "description": "Thanh toán qua Momo, ZaloPay, v.v",
  "status": "active"
})
```

```javascript
db.PaymentMethod.insertOne({
  "name": "Thanh Toán Khi Nhận Hàng",
  "code": "COD",
  "description": "Thanh toán khi nhận hàng (Cash on Delivery)",
  "status": "active"
})
```

---

## 🔧 CÁCH DÙNG

### 📌 Trong Postman:

1. **POST /api/account** - Tạo users
   - Chọn User 1, 2, hoặc 3 ở trên
   - Paste vào Body → raw → JSON
   - Click Send

2. **POST /api/product** - Tạo products
   - Chọn Product 1-6 ở trên
   - Paste vào Body → raw → JSON
   - Click Send

### 📌 Trong MongoDB Compass:

1. Mở MongoDB Compass
2. Chọn Database: `WINNOTech`
3. Chọn Collection: `Category` (hoặc Brand, PaymentMethod)
4. Click **+** → "Add Data"
5. Copy đoạn `db.Category.insertOne({...})` thành JSON:
   ```json
   {
     "name": "CPU / Bộ Xử Lý",
     "slug": "cpu-bo-xu-ly",
     ...
   }
   ```
6. Paste vào Insert Document
7. Click Insert

---

## 📌 LƯU Ý QUAN TRỌNG

⚠️ **Trước khi dùng:**
1. ✅ Máy chủ đang chạy: `npm start` 
2. ✅ MongoDB đang chạy: `mongod`
3. ✅ Kiểm tra `.env` có đúng MONGODB_URI

❌ **Lỗi thường gặp:**
- Email trùng → Thay đổi email
- Slug trùng → Thay đổi slug
- Server chưa chạy → Chạy `npm start`
- MongoDB chưa chạy → Chạy `mongod` (terminal khác)

✅ **Kiểm tra thành công:**
- User được tạo → `GET /api/account`
- Product được tạo → `GET /api/product`
- Thấy dữ liệu trong MongoDB Compass

---

Chúc bạn tạo dữ liệu thành công! 🚀
