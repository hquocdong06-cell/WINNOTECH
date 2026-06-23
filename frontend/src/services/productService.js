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

const API_URL = 'http://localhost:3000/api/product';

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
        }
    }
};

export default productService;
