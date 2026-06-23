# 🚀 API SETUP GUIDE - WINNOTech

## ✅ Những gì đã được setup

### 1️⃣ **DATABASE CONFIG**
- ✅ `config/db.js` - Kết nối MongoDB
- ✅ `.env` - Environment variables (MongoDB URI, JWT Secret, Port)

### 2️⃣ **MODELS** (Database Schemas)
- ✅ `models/User.js` - User schema
- ✅ `models/Product.js` - Product schema  
- ✅ `models/Brand.js` - Brand schema
- ✅ `models/Category.js` - Category schema
- ✅ `models/ProductVariant.js` - Product variant schema
- ✅ `models/Order.js` - Order schema
- ✅ `models/CartItem.js` - Cart item schema

### 3️⃣ **API ENDPOINTS**
- ✅ `routers/account.js` - User API (Create, Read, Update, Delete)
  - `GET /api/account` - Lấy tất cả users
  - `GET /api/account/:id` - Lấy user theo ID
  - `POST /api/account` - Tạo user mới
  - `PUT /api/account/:id` - Cập nhật user
  - `DELETE /api/account/:id` - Xóa user

### 4️⃣ **SERVER CONFIGURATION**
- ✅ `server.js` - Updated với connectDB + mount routes
- ✅ `api_test.js` - Test file để gọi API

---

## 🛠️ CÁC BƯỚC SETUP & CHẠY

### BƯỚC 1: Cài đặt Dependencies
```bash
cd h:\WINNOTech
npm install
```

### BƯỚC 2: Setup MongoDB
**Option A - MongoDB Local:**
```bash
# Windows - Download từ https://www.mongodb.com/try/download/community
# Cài đặt rồi chạy MongoDB
mongod
```

**Option B - MongoDB Atlas (Cloud):**
1. Tạo account tại https://www.mongodb.com/cloud/atlas
2. Tạo cluster
3. Copy connection string
4. Update `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/WINNOTech?retryWrites=true&w=majority
```

### BƯỚC 3: Cấu hình .env
Update file `h:\WINNOTech\.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1/WINNOTech
JWT_SECRET=your_super_secret_key_12345
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### BƯỚC 4: Chạy Server
```bash
npm start
```

Output sẽ hiển thị:
```
✅ MongoDB Connected: 127.0.0.1
Server is running on port 3000
```

### BƯỚC 5: Test API
**Mở terminal mới** và chạy:
```bash
node api_test.js
```

---

## 📋 API DOCUMENTATION

### CREATE USER (POST)
```bash
curl -X POST http://localhost:3000/api/account \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "password": "Pass123!",
    "role": "user",
    "status": "active"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tạo user thành công",
  "data": {
    "_id": "66f4abc123...",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "createdAt": "2026-06-12T10:30:00Z"
  }
}
```

### GET ALL USERS
```bash
curl http://localhost:3000/api/account
```

### GET USER BY ID
```bash
curl http://localhost:3000/api/account/66f4abc123...
```

### UPDATE USER
```bash
curl -X PUT http://localhost:3000/api/account/66f4abc123... \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn B",
    "status": "inactive"
  }'
```

### DELETE USER
```bash
curl -X DELETE http://localhost:3000/api/account/66f4abc123...
```

---

## 🐛 TROUBLESHOOTING

### ❌ "Cannot find module './config/db'"
**Fix:** 
```bash
# Đảm bảo folder config tồn tại
mkdir config
```

### ❌ "MongoDB connection failed"
**Fix:**
1. Kiểm tra MongoDB đang chạy: `mongod`
2. Kiểm tra MONGODB_URI trong .env
3. Nếu dùng MongoDB Atlas, kiểm tra IP whitelist

### ❌ "Port 3000 already in use"
**Fix:**
```bash
# Windows - Tìm process sử dụng port 3000
netstat -ano | findstr :3000
# Kill process
taskkill /PID <PID> /F
```

---

## 📝 NEXT STEPS (Tạo thêm API khác)

Để tạo thêm API cho Product, Category, Brand, Order:

1. **Tạo routers file mới** (ví dụ: `routers/product.js`)
2. **Thêm endpoints** (GET, POST, PUT, DELETE)
3. **Mount router** trong `server.js`:
```javascript
const ProductRouter = require('./routers/product');
app.use('/api/product', ProductRouter);
```

---

## 📞 SUPPORT

Nếu có vấn đề, hãy cung cấp:
- Error message từ terminal
- MongoDB connection status
- .env file content (ẩn sensitive data)

---

**Created:** 2026-06-12 | **Project:** WINNOTech | **Status:** ✅ Ready to use
