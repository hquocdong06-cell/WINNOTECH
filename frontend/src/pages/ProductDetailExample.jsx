/**
 * Product Detail Page Example
 * Location: frontend/src/pages/ProductDetailExample.jsx
 * 
 * Ví dụ trang chi tiết sản phẩm gọi API
 */

import { useParams } from 'react-router-dom';
import { useProductBySlug } from '../hooks/useProducts';
import { useState } from 'react';

export default function ProductDetail() {
    const { slug } = useParams();
    const { product, loading, error } = useProductBySlug(slug);
    const [quantity, setQuantity] = useState(1);

    if (loading) {
        return (
            <div className="product-detail-container">
                <div className="loading-spinner">
                    <p>⏳ Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-container">
                <div className="error-message">
                    <p>❌ Lỗi: {error || 'Không tìm thấy sản phẩm'}</p>
                    <a href="/">← Quay lại trang chủ</a>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        console.log(`Thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng`);
        // TODO: Thêm logic giỏ hàng ở đây
    };

    return (
        <div className="product-detail-container">
            <div className="product-detail">
                {/* Ảnh sản phẩm */}
                <div className="product-image">
                    {product.thumnail && (
                        <img 
                            src={product.thumnail} 
                            alt={product.name}
                            className="main-image"
                        />
                    )}
                    {product.sale > 0 && (
                        <div className="sale-badge">
                            -<span className="sale-percentage">{product.sale}%</span>
                        </div>
                    )}
                </div>

                {/* Chi tiết sản phẩm */}
                <div className="product-info">
                    <h1 className="product-name">{product.name}</h1>

                    {/* Danh mục */}
                    {product.cat_id && (
                        <p className="category">
                            📂 Danh mục: <strong>{product.cat_id.name}</strong>
                        </p>
                    )}

                    {/* Thương hiệu */}
                    {product.brand_id && (
                        <p className="brand">
                            🏷️ Thương hiệu: <strong>{product.brand_id.name}</strong>
                        </p>
                    )}

                    {/* Mô tả ngắn */}
                    <p className="short-description">{product.short_desc}</p>

                    {/* Mô tả chi tiết */}
                    {product.description && (
                        <div className="description">
                            <h3>Thông tin chi tiết:</h3>
                            <p>{product.description}</p>
                        </div>
                    )}

                    {/* Slug */}
                    <p className="slug">
                        <small>ID: {product._id}</small>
                    </p>

                    {/* Trạng thái */}
                    <p className={`status ${product.status}`}>
                        Trạng thái: <strong>{product.status === 'active' ? '✅ Còn hàng' : '❌ Hết hàng'}</strong>
                    </p>

                    {/* Số lượng & Thêm vào giỏ */}
                    {product.status === 'active' && (
                        <div className="product-actions">
                            <div className="quantity-selector">
                                <label htmlFor="quantity">Số lượng:</label>
                                <div className="quantity-input">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="btn-qty"
                                    >
                                        −
                                    </button>
                                    <input 
                                        type="number" 
                                        id="quantity"
                                        min="1" 
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                    <button 
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="btn-qty"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button 
                                className="btn-add-to-cart"
                                onClick={handleAddToCart}
                            >
                                🛒 Thêm vào giỏ hàng
                            </button>
                        </div>
                    )}

                    {/* Ngày tạo/cập nhật */}
                    <div className="product-meta">
                        <small>
                            📅 Tạo lúc: {new Date(product.createdAt).toLocaleString('vi-VN')}
                        </small>
                        {product.updatedAt !== product.createdAt && (
                            <small>
                                ✏️ Cập nhật: {new Date(product.updatedAt).toLocaleString('vi-VN')}
                            </small>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
