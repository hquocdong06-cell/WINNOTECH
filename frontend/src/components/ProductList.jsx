/**
 * Product List Component Example
 * Location: frontend/src/components/ProductList.jsx
 * 
 * Ví dụ cách sử dụng productService để hiển thị danh sách sản phẩm
 */

import { useEffect, useState } from 'react';
import productService from '../services/productService';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getAll();
            if (response.success) {
                setProducts(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Lỗi khi tải sản phẩm: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="product-list">
            <h1>Danh Sách Sản Phẩm</h1>
            <div className="products-grid">
                {products.map(product => (
                    <div key={product._id} className="product-card">
                        {product.thumnail && (
                            <img src={product.thumnail} alt={product.name} />
                        )}
                        <h3>{product.name}</h3>
                        <p>{product.short_desc}</p>
                        {product.sale > 0 && (
                            <span className="sale-badge">-{product.sale}%</span>
                        )}
                        <p className="status">Trạng thái: {product.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
