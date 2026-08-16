// ============================================================
// adminService.js — Tập trung toàn bộ API call cho Admin
// ============================================================

export const API_BASE = 'http://localhost:3000';

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
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload ảnh thất bại');
  return data; // { success, url }
}

// ============================================================
// CATEGORIES
// ============================================================
export async function fetchCategories() {
  const data = await apiFetch('/categories');
  return data.data || [];
}

export async function createCategory({ name, image }) {
  return apiFetch('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, image }),
  });
}

export async function updateCategory(id, { name, image }) {
  return apiFetch(`/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, image }),
  });
}

export async function toggleCategoryStatus(id, status) {
  return apiFetch(`/categories/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function deleteCategory(id) {
  return apiFetch(`/categories/${id}`, { method: 'DELETE' });
}

// ============================================================
// PRODUCTS & BRANDS & VARIANTS (ADMIN)
// ============================================================
export async function fetchProducts() {
  const data = await apiFetch('/products');
  return data.data || [];
}

export async function fetchAdminProducts() {
  const data = await apiFetch('/admin/products');
  return data.data || [];
}

export async function fetchBrands() {
  const data = await apiFetch('/brands');
  return data.data || [];
}

export async function fetchAdminBrands() {
  const data = await apiFetch('/admin/brands');
  return data.data || [];
}

export async function createAdminBrand(payload) {
  return apiFetch('/admin/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminBrand(id, payload) {
  return apiFetch(`/admin/brands/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminBrand(id) {
  return apiFetch(`/admin/brands/${id}`, { method: 'DELETE' });
}

export async function createProduct(payload) {
  return apiFetch('/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id, payload) {
  return apiFetch(`/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id) {
  return apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
}

export async function toggleProductStatus(id, newStatus) {
  return apiFetch(`/admin/products/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
}

/** Biến thể sản phẩm (Variants) */
export async function fetchAdminVariants(productId) {
  const data = await apiFetch(`/admin/products/${productId}/variants`);
  return data.data || [];
}

export async function createAdminVariant(productId, payload) {
  return apiFetch(`/admin/products/${productId}/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminVariant(variantId, payload) {
  return apiFetch(`/admin/variants/${variantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminVariant(variantId) {
  return apiFetch(`/admin/variants/${variantId}`, { method: 'DELETE' });
}

// ============================================================
// USERS / CUSTOMERS (ADMIN)
// ============================================================
export async function fetchAdminUsers() {
  const data = await apiFetch('/admin/users');
  return data.data || [];
}

export async function createAdminUser(payload) {
  return apiFetch('/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserStatus(id, status) {
  return apiFetch(`/admin/users/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function deleteAdminUser(id) {
  return apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
}

// ============================================================
// ORDERS (ADMIN)
// ============================================================
export async function fetchAdminOrders() {
  const data = await apiFetch('/admin/orders');
  return data;
}

export async function updateAdminOrderStatus(id, status) {
  return apiFetch(`/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function deleteAdminOrder(id) {
  return apiFetch(`/admin/orders/${id}`, { method: 'DELETE' });
}

export function getOrderPdfUrl(id) {
  return `${API_BASE}/admin/orders/${id}/export-pdf`;
}

// ============================================================
// REVENUE & STATS (ADMIN)
// ============================================================
export async function fetchRevenueStats(type = 'month') {
  return apiFetch(`/admin/revenue/stats?type=${type}`);
}

export function getRevenueExcelExportUrl() {
  return `${API_BASE}/admin/revenue/export-excel`;
}

// ============================================================
// VOUCHERS / PROMOTIONS (ADMIN)
// ============================================================
export async function fetchVouchers() {
  const data = await apiFetch('/api/vouchers');
  return data.data || [];
}

export async function createVoucher(payload) {
  return apiFetch('/api/vouchers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateVoucher(id, payload) {
  return apiFetch(`/api/vouchers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteVoucher(id) {
  return apiFetch(`/api/vouchers/${id}`, { method: 'DELETE' });
}

// ============================================================
// REVIEWS (ADMIN)
// ============================================================
export async function fetchReviewsFilter(filter = {}) {
  const data = await apiFetch('/reviews/filter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filter),
  });
  return data.data || [];
}

export async function toggleReviewStatus(id, status) {
  return apiFetch(`/admin/reviews/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

// ============================================================
// POSTS & POST CATEGORIES (ADMIN)
// ============================================================
export async function fetchPosts(status) {
  const query = status ? `?status=${status}` : '';
  const data = await apiFetch(`/posts${query}`);
  return data.data || [];
}

export async function fetchPostCategories() {
  const data = await apiFetch('/post-categories');
  return data.data || [];
}

export async function createPostCategory(payload) {
  return apiFetch('/admin/post-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updatePostCategory(id, payload) {
  return apiFetch(`/admin/post-categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function togglePostCategoryStatus(id, status) {
  return apiFetch(`/admin/post-categories/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function createPost(payload) {
  return apiFetch('/admin/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updatePost(id, payload) {
  return apiFetch(`/admin/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deletePost(id) {
  return apiFetch(`/admin/posts/${id}`, { method: 'DELETE' });
}

// ============================================================
// BANNERS (ADMIN)
// ============================================================
export async function fetchAdminBanners() {
  const data = await apiFetch('/admin/banners');
  return data.data || [];
}

export async function createAdminBanner(formData) {
  if (formData instanceof FormData) {
    const res = await fetch(`${API_BASE}/admin/banners`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi tạo banner');
    return data;
  }

  return apiFetch('/admin/banners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
}

export async function updateAdminBanner(id, formData) {
  if (formData instanceof FormData) {
    const res = await fetch(`${API_BASE}/admin/banners/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi cập nhật banner');
    return data;
  }

  return apiFetch(`/admin/banners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
}

export async function toggleAdminBannerStatus(id) {
  return apiFetch(`/admin/banners/${id}/status`, {
    method: 'PATCH',
  });
}
