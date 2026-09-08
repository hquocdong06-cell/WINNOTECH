/**
 * Product Service - Gọi API sản phẩm
 * Location: frontend/src/services/productService.js
 * 
 * Cách sử dụng:
 * import productService from './productService';
 * 
 * // Lấy tất cả sản phẩm
 * const products = await productService.getAll();
 * 
 * // Lấy sản phẩm theo ID
 * const product = await productService.getById(productId);
 */

import { API_BASE } from './apiService';
const API_URL = `${API_BASE}/api/product`;

const productService = {
    // Lấy tất cả sản phẩm
    getAll: async () => {
        try {
            const response = await fetch(`${API_URL}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Lấy sản phẩm theo ID
    getById: async (productId) => {
        try {
            const response = await fetch(`${API_URL}/${productId}`);
            if (!response.ok) throw new Error('Product not found');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            throw error;
        }
    },

    // Lấy sản phẩm theo slug
    getBySlug: async (slug) => {
        try {
            const response = await fetch(`${API_URL}/slug/${slug}`);
            if (!response.ok) throw new Error('Product not found');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching product with slug ${slug}:`, error);
            throw error;
        }
    },

    // Lấy sản phẩm theo danh mục
    getByCategory: async (categoryId) => {
        try {
            const response = await fetch(`${API_URL}/category/${categoryId}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching products by category ${categoryId}:`, error);
            throw error;
        }
    },

    // Lấy sản phẩm theo thương hiệu
    getByBrand: async (brandId) => {
        try {
            const response = await fetch(`${API_URL}/brand/${brandId}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching products by brand ${brandId}:`, error);
            throw error;
        }
    },

    // Tạo sản phẩm mới (Admin)
    create: async (productData) => {
        try {
            const response = await fetch(`${API_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error('Failed to create product');
            return await response.json();
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    // Cập nhật sản phẩm (Admin)
    update: async (productId, productData) => {
        try {
            const response = await fetch(`${API_URL}/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error('Failed to update product');
            return await response.json();
        } catch (error) {
            console.error(`Error updating product ${productId}:`, error);
            throw error;
        }
    },

    // Xóa sản phẩm (Admin)
    delete: async (productId) => {
        try {
            const response = await fetch(`${API_URL}/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Failed to delete product');
            return await response.json();
        } catch (error) {
            console.error(`Error deleting product ${productId}:`, error);
            throw error;
    },

    // ── 3 API phục vụ cho 3 section trang chủ (Xem tất cả) ──
    // 1. Sản phẩm bán chạy nhất (sold_count giảm dần)
    getBestSellers: async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const url = `${API_BASE}/api/products/best-sellers${query ? `?${query}` : ''}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch best sellers');
            return await response.json();
        } catch (error) {
            console.error('Error fetching best sellers:', error);
            throw error;
        }
    },

    // 2. Sản phẩm mới nhất (createdAt giảm dần)
    getNewest: async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const url = `${API_BASE}/api/products/newest${query ? `?${query}` : ''}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch newest products');
            return await response.json();
        } catch (error) {
            console.error('Error fetching newest products:', error);
            throw error;
        }
    },

    // 3. Sản phẩm giảm giá (sale giảm dần như ảnh 1)
    getOnSale: async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const url = `${API_BASE}/api/products/on-sale${query ? `?${query}` : ''}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch on-sale products');
            return await response.json();
        } catch (error) {
            console.error('Error fetching on-sale products:', error);
            throw error;
        }
    }
};

export default productService;
