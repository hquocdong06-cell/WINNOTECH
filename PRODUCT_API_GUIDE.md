# 📦 HƯỚNG DẪN GỌI API SẢN PHẨM (PRODUCT API)

## 🎯 Tổng Quan
- **Base URL**: `http://localhost:3000/api/product`
- **Database**: MongoDB
- **Server**: Node.js + Express

---

## 📋 DANH SÁCH CÁC ENDPOINTS

### 1️⃣ **LẤY TẤT CẢ SẢN PHẨM** (GET)
```
GET /api/product
```

**Ví dụ với Fetch:**
```javascript
const response = await fetch('http://localhost:3000/api/product');
const data = await response.json();
console.log(data);
```

**Response thành công (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i",
      "name": "CPU Intel Core i9",
      "slug": "cpu-intel-core-i9",
      "sale": 15,
      "status": "active",
      "description": "Bộ xử lý cao cấp",
      "short_desc": "Intel Core i9 Gen 13",
      "thumnail": "https://...",
      "cat_id": {...},
      "brand_id": {...},
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-10T10:00:00.000Z"
    }
  ]
}
```

---

### 2️⃣ **LẤY SẢN PHẨM THEO ID** (GET)
```
GET /api/product/:id
```

**Ví dụ:**
```javascript
const productId = '675a1b2c3d4e5f6g7h8i';
const response = await fetch(`http://localhost:3000/api/product/${productId}`);
const data = await response.json();
console.log(data);
```

**Response thành công (200):**
```json
{
  "success": true,
  "data": {
    "_id": "675a1b2c3d4e5f6g7h8i",
    "name": "CPU Intel Core i9",
    "slug": "cpu-intel-core-i9",
    "sale": 15,
    "status": "active"
  }
}
```

**Response lỗi (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy sản phẩm"
}
```

---

### 3️⃣ **LẤY SẢN PHẨM THEO SLUG** (GET)
```
GET /api/product/slug/:slug
```

**Ví dụ:**
```javascript
const response = await fetch('http://localhost:3000/api/product/slug/cpu-intel-core-i9');
const data = await response.json();
```

---

### 4️⃣ **TẠO SẢN PHẨM MỚI** (POST) - Admin
```
POST /api/product
Content-Type: application/json
```

**Request body:**
```json
{
  "name": "GPU NVIDIA RTX 4090",
  "slug": "gpu-nvidia-rtx-4090",
  "sale": 10,
  "thumnail": "https://example.com/rtx-4090.jpg",
  "description": "Card đồ họa gaming flagship",
  "short_desc": "NVIDIA RTX 4090 - 24GB",
  "status": "active",
  "cat_id": "665a1b2c3d4e5f6g7h8i",
  "brand_id": "665a1b2c3d4e5f6g7h9j"
}
```

**Ví dụ với Fetch:**
```javascript
const response = await fetch('http://localhost:3000/api/product', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "GPU NVIDIA RTX 4090",
    slug: "gpu-nvidia-rtx-4090",
    sale: 10,
    description: "Card đồ họa gaming flagship",
    short_desc: "NVIDIA RTX 4090 - 24GB",
    status: "active"
  })
});
const data = await response.json();
console.log(data);
```

**Response thành công (201):**
```json
{
  "success": true,
  "message": "Tạo sản phẩm thành công",
  "data": {
    "_id": "675a1b2c3d4e5f6g7h8i",
    "name": "GPU NVIDIA RTX 4090",
    "slug": "gpu-nvidia-rtx-4090",
    "sale": 10,
    "status": "active",
    "createdAt": "2025-01-10T10:00:00.000Z"
  }
}
```

**Response lỗi (400):**
```json
{
  "success": false,
  "message": "Vui lòng điền đầy đủ thông tin (name, slug)"
}
```

**Response lỗi - slug trùng (409):**
```json
{
  "success": false,
  "message": "Slug đã được sử dụng"
}
```

---

### 5️⃣ **CẬP NHẬT SẢN PHẨM** (PUT) - Admin
```
PUT /api/product/:id
Content-Type: application/json
```

**Ví dụ:**
```javascript
const productId = '675a1b2c3d4e5f6g7h8i';
const response = await fetch(`http://localhost:3000/api/product/${productId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "GPU NVIDIA RTX 4090 Updated",
    sale: 15,
    status: "inactive"
  })
});
const data = await response.json();
```

---

### 6️⃣ **XÓA SẢN PHẨM** (DELETE) - Admin
```
DELETE /api/product/:id
```

**Ví dụ:**
```javascript
const productId = '675a1b2c3d4e5f6g7h8i';
const response = await fetch(`http://localhost:3000/api/product/${productId}`, {
  method: 'DELETE'
});
const data = await response.json();
```

---

### 7️⃣ **LẤY SẢN PHẨM THEO DANH MỤC** (GET)
```
GET /api/product/category/:catId
```

**Ví dụ:**
```javascript
const categoryId = '665a1b2c3d4e5f6g7h8i';
const response = await fetch(`http://localhost:3000/api/product/category/${categoryId}`);
const data = await response.json();
```

---

### 8️⃣ **LẤY SẢN PHẨM THEO THƯƠNG HIỆU** (GET)
```
GET /api/product/brand/:brandId
```

**Ví dụ:**
```javascript
const brandId = '665a1b2c3d4e5f6g7h9j';
const response = await fetch(`http://localhost:3000/api/product/brand/${brandId}`);
const data = await response.json();
```

---

## 🔧 CÁCH SỬ DỤNG TRONG REACT COMPONENT

```javascript
import { useEffect, useState } from 'react';
import productService from '../services/productService';

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? <p>Đang tải...</p> : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product._id} className="product-card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              {product.sale > 0 && <span>Giảm {product.sale}%</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 KIỂM TRA API

**Chạy file test:**
```bash
node product_test.js
```

**Hoặc dùng Postman/Thunder Client với các request trên**

---

## 📊 PRODUCT MODEL FIELDS

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|---------|--------|
| `_id` | ObjectId | Tự động | ID sản phẩm |
| `name` | String | ✅ | Tên sản phẩm |
| `slug` | String | ✅ | URL slug (unique) |
| `sale` | Number | ❌ | Phần trăm giảm giá (mặc định 0) |
| `thumnail` | String | ❌ | URL ảnh thumbnail |
| `description` | String | ❌ | Mô tả chi tiết |
| `short_desc` | String | ❌ | Mô tả ngắn |
| `status` | String | ❌ | "active" hoặc "inactive" |
| `cat_id` | ObjectId | ❌ | ID danh mục |
| `brand_id` | ObjectId | ❌ | ID thương hiệu |
| `createdAt` | Date | Tự động | Thời gian tạo |
| `updatedAt` | Date | Tự động | Thời gian cập nhật |

---

## ⚠️ LỖI THƯỜNG GẶP

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| **404 Not Found** | Sản phẩm không tồn tại | Kiểm tra ID hoặc slug |
| **409 Conflict** | Slug bị trùng | Chọn slug khác |
| **400 Bad Request** | Thiếu trường bắt buộc | Thêm `name` và `slug` |
| **500 Server Error** | Lỗi server | Kiểm tra console backend |

---

## 💡 MẸO SỬ DỤNG

1. **Luôn kiểm tra** `response.success` trước khi sử dụng dữ liệu
2. **Slug nên** dùng kí tự thường, gạch ngang, không khoảng trắng
3. **Dùng try-catch** khi gọi API để xử lý lỗi
4. **ObjectId** MongoDB là chuỗi 24 kí tự hex, VD: `675a1b2c3d4e5f6g7h8i`

---

**Tác giả**: WINNOTech Team  
**Cập nhật**: 2025-01-10
