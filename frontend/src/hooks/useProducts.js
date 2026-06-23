/**
 * Advanced Product Service Examples
 * Location: frontend/src/hooks/useProducts.js
 * 
 * Custom React Hook để quản lý sản phẩm
 */

import { useEffect, useState, useCallback } from 'react';
import productService from '../services/productService';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productService.getAll();
            if (response.success) {
                setProducts(response.data);
                setError(null);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    return { products, loading, error, refetch: fetchAllProducts };
}

export function useProductById(productId) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) return;

        async function fetch() {
            try {
                setLoading(true);
                const response = await productService.getById(productId);
                if (response.success) {
                    setProduct(response.data);
                    setError(null);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetch();
    }, [productId]);

    return { product, loading, error };
}

export function useProductBySlug(slug) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) return;

        async function fetch() {
            try {
                setLoading(true);
                const response = await productService.getBySlug(slug);
                if (response.success) {
                    setProduct(response.data);
                    setError(null);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetch();
    }, [slug]);

    return { product, loading, error };
}

export function useProductsByCategory(categoryId) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!categoryId) return;

        async function fetch() {
            try {
                setLoading(true);
                const response = await productService.getByCategory(categoryId);
                if (response.success) {
                    setProducts(response.data);
                    setError(null);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetch();
    }, [categoryId]);

    return { products, loading, error };
}

export function useProductsByBrand(brandId) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!brandId) return;

        async function fetch() {
            try {
                setLoading(true);
                const response = await productService.getByBrand(brandId);
                if (response.success) {
                    setProducts(response.data);
                    setError(null);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetch();
    }, [brandId]);

    return { products, loading, error };
}
