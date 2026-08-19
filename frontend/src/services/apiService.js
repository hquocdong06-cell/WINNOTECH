// ============================================================
// apiService.js — Tập trung toàn bộ API call cho Frontend
// Base URL: http://localhost:3000
// ============================================================

export const API_BASE = 'http://localhost:3000';

// Helper fetch (gửi kèm cookie)
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
// AUTH
// ============================================================
export const authAPI = {
  me: () => apiFetch('/auth/me'),
  googleLogin: (payload) => apiFetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  login: (email, password) => apiFetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }),
  register: (phone, email, password, confirmPassword) => apiFetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, email, password, confirmPassword }),
  }),
  logout: () => apiFetch('/logout'),
  getProfile: () => apiFetch('/profile'),
  forgotPassword: (identifier) => apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  }),
  resetPassword: (identifier, otp, newPassword, confirmPassword) => apiFetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otp, newPassword, confirmPassword }),
  }),
  requestChangePasswordOTP: () => apiFetch('/profile/change-password/request-otp', { method: 'POST' }),
  verifyChangePassword: (otp, newPassword, confirmPassword) => apiFetch('/profile/change-password/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp, newPassword, confirmPassword }),
  }),
  changePassword: (oldPassword, newPassword, confirmPassword) => apiFetch('/profile/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
  }),
};

// ============================================================
// PRODUCTS
// ============================================================
export const productAPI = {
  getAll: () => apiFetch('/products'),
  getBySlug: (slug) => apiFetch(`/products/${slug}`),
  getNewest: () => apiFetch('/products/home/newest'),
  getFeatured: () => apiFetch('/products/home/featured'),
  getFlashSale: () => apiFetch('/products/home/flash-sale'),
  getAllNewest: () => apiFetch('/products/home/Newest'),
  getAllBySale: () => apiFetch('/products/home/Sale'),
  search: (q) => apiFetch(`/products/search?q=${encodeURIComponent(q)}`),
  create: (payload) => apiFetch('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  update: (id, payload) => apiFetch(`/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  delete: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
  toggleStatus: (id, status) => apiFetch(`/products/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }),
};

// ============================================================
// CATEGORIES
// ============================================================
export const categoryAPI = {
  getAll: () => apiFetch('/categories'),
  getById: (id) => apiFetch(`/categories/${id}`),
  getProductsBySlug: (slug) => apiFetch(`/categories/${slug}`),
  create: (payload) => apiFetch('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  update: (id, payload) => apiFetch(`/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  toggleStatus: (id, status) => apiFetch(`/categories/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetch(`${API_BASE}/categories/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(r => r.json());
  },
};

// ============================================================
// BRANDS
// ============================================================
export const brandAPI = {
  getAll: () => apiFetch('/brands'),
};

// ============================================================
// CART
// ============================================================
export const cartAPI = {
  getCart: () => apiFetch('/cart'),
  addItem: (variant_id, quantity) => apiFetch('/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variant_id, quantity }),
  }),
  updateItem: (cartItemId, quantity) => apiFetch(`/cart/${cartItemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  }),
  removeItem: (cartItemId) => apiFetch(`/cart/${cartItemId}`, { method: 'DELETE' }),
};

// ============================================================
// ORDERS
// ============================================================
export const orderAPI = {
  createOrder: (payload) => apiFetch('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  getOrders: (status) => apiFetch(`/orders${status && status !== 'all' ? `?status=${status}` : ''}`),
  getOrderDetail: (orderId) => apiFetch(`/orders/${orderId}`),
  createVNPayQR: (payload) => apiFetch('/api/create-qr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
};

// ============================================================
// REVIEWS
// ============================================================
export const reviewAPI = {
  createReview: (order_item_id, content, star_number) => apiFetch('/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_item_id, content, star_number }),
  }),
  getProductReviews: (productId) => apiFetch(`/api/products/${productId}/reviews`),
  checkEligibility: (productId) => apiFetch(`/api/products/${productId}/review-eligibility`),
};

// ============================================================
// FAVORITES
// ============================================================
export const favoriteAPI = {
  getIds: () => apiFetch('/favorites/ids'),
  getList: () => apiFetch('/favorites'),
  toggle: (productId) => apiFetch(`/favorites/${productId}`, { method: 'POST' }),
  remove: (productId) => apiFetch(`/favorites/${productId}`, { method: 'DELETE' }),
};

// ============================================================
// COMPARE
// ============================================================
export const compareAPI = {
  toggle: (product_id) => apiFetch('/compare/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id }),
  }),
  getMyList: () => apiFetch('/compare/my-list'),
  compareGuest: (id1, id2) => apiFetch(`/api/compare/guest?id1=${id1}&id2=${id2}`),
};

// ============================================================
// DELIVERY ADDRESSES
// ============================================================
export const addressAPI = {
  getAddresses: () => apiFetch('/profile/deliver'),
  addAddress: (payload) => apiFetch('/profile/deliver', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  updateAddress: (id, payload) => apiFetch(`/profile/deliver/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  // Xóa địa chỉ theo ID (DELETE /delivery-addresses/:id)
  deleteAddress: (id) => apiFetch(`/delivery-addresses/${id}`, { method: 'DELETE' }),
};


// ============================================================
// VOUCHERS
// ============================================================
export const voucherAPI = {
  getAll: () => apiFetch('/api/vouchers'),
  getValid: () => apiFetch('/api/vouchers/valid'),
  getOne: (idOrCode) => apiFetch(`/api/vouchers/${idOrCode}`),
  check: (code) => apiFetch(`/vouchers/check/${code}`),
  create: (payload) => apiFetch('/api/vouchers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  update: (id, payload) => apiFetch(`/api/vouchers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  delete: (id) => apiFetch(`/api/vouchers/${id}`, { method: 'DELETE' }),
  apply: (code, variant_id, quantity) => apiFetch('/api/vouchers/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, variant_id, quantity }),
  }),
};

// ============================================================
// USER VOUCHERS
// ============================================================
export const userVoucherAPI = {
  save: (payload) => apiFetch('/api/user-vouchers/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  getMyVouchers: (is_used) => apiFetch(`/api/user-vouchers/my-vouchers${is_used !== undefined ? `?is_used=${is_used}` : ''}`),
  apply: (payload) => apiFetch('/api/user-vouchers/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  use: (payload) => apiFetch('/api/user-vouchers/use', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
};

// ============================================================
// BUILD PC
// ============================================================
export const buildPCAPI = {
  getComponents: (category, search) =>
    apiFetch(`/api/buildpc/components?category=${category}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  save: (total_price, items) => apiFetch('/api/buildpc/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ total_price, items }),
  }),
  suggest: (budget, purpose) =>
    apiFetch(`/api/buildpc/suggest?budget=${budget}&purpose=${purpose}`),
};


// ============================================================
// POSTS & BLOG
// ============================================================
export const postAPI = {
  getAll: (categoryId, status) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (status) params.append('status', status);
    const query = params.toString();
    return apiFetch(`/posts${query ? `?${query}` : ''}`);
  },
  getBySlug: (slug) => apiFetch(`/posts/${slug}`),
  getCategories: () => apiFetch('/post-categories'),
  create: (payload) => apiFetch('/admin/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  update: (id, payload) => apiFetch(`/admin/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  delete: (id) => apiFetch(`/admin/posts/${id}`, { method: 'DELETE' }),
};

// ============================================================
// ADMIN — PRODUCT VARIANTS
// ============================================================
export const variantAPI = {
  getByProduct: (productId) => apiFetch(`/admin/products/${productId}/variants`),
  create: (productId, payload) => apiFetch(`/admin/products/${productId}/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  update: (variantId, payload) => apiFetch(`/admin/variants/${variantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  delete: (variantId) => apiFetch(`/admin/variants/${variantId}`, { method: 'DELETE' }),
};

// ============================================================
// CONTACT
// ============================================================
export const contactAPI = {
  send: (name, email, content) => apiFetch('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, content }),
  }),
};

// ============================================================
// UPLOAD
// ============================================================
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetch(`${API_BASE}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(r => r.json());
  },
};

// ============================================================
// AI CHATBOT
// ============================================================
export const chatbotAPI = {
  chat: (message, history = []) => apiFetch('/api/chatbot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  }),
  ask: (message, history = []) => apiFetch('/api/chatbot/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  }),
};

