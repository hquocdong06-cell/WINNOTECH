// ============================================================
// adminService.js — Tập trung toàn bộ API call cho Admin
// ============================================================

const API_BASE = 'http://localhost:3000';

// ——— Hàm helper fetch ———
async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Lỗi không xác định từ server');
  }
  return data;
}

// ============================================================
// UPLOAD ẢNH — dùng chung cho sản phẩm & danh mục
// ============================================================
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // KHÔNG set Content-Type — để browser tự set multipart/form-data
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload ảnh thất bại');
  return data; // { success, url }
}

// ============================================================
// CATEGORIES
// ============================================================

/** Lấy toàn bộ danh mục */
export async function fetchCategories() {
  const data = await apiFetch('/categories');
  return data.data || [];
}

/** Tạo danh mục mới */
export async function createCategory({ name, image }) {
  return apiFetch('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, image }),
  });
}

/** Cập nhật danh mục */
export async function updateCategory(id, { name, image }) {
  return apiFetch(`/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, image }),
  });
}

/** Xóa danh mục */
export async function deleteCategory(id) {
  return apiFetch(`/categories/${id}`, { method: 'DELETE' });
}

// ============================================================
// PRODUCTS
// ============================================================

/** Lấy toàn bộ sản phẩm kèm ảnh + biến thể */
export async function fetchProducts() {
  const data = await apiFetch('/products');
  return data.data || [];
}

/** Lấy toàn bộ thương hiệu */
export async function fetchBrands() {
  const data = await apiFetch('/brands');
  return data.data || [];
}

/** Tạo sản phẩm mới */
export async function createProduct(payload) {
  return apiFetch('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Cập nhật sản phẩm */
export async function updateProduct(id, payload) {
  return apiFetch(`/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Xóa sản phẩm (cascade variants + images) */
export async function deleteProduct(id) {
  return apiFetch(`/products/${id}`, { method: 'DELETE' });
}

/** Toggle trạng thái active ↔ hidden */
export async function toggleProductStatus(id, newStatus) {
  return apiFetch(`/products/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
}
