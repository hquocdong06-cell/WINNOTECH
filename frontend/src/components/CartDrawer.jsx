import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { selectCartItems, selectCartTotalPrice, removeFromCart, updateQuantity } from '../redux/cartSlice';
import '../assets/styles/cart-drawer.css'; // CSS riêng cho drawer mini cart

import { API_BASE as API_URL } from '../services/apiService';

export default function CartDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotalPrice);
  const [removingId, setRemovingId] = useState(null);

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('vi-VN') + 'đ';
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/60';
    if (image.startsWith('http')) return image;
    return `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
  };

  const getItemStock = (item) => {
    if (item?.variant && item.variant.stock_quantity !== undefined) {
      return Number(item.variant.stock_quantity);
    }
    if (item?.stock_quantity !== undefined) {
      return Number(item.stock_quantity);
    }
    if (item?.stock !== undefined) {
      return Number(item.stock);
    }
    return null;
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemove(item);
      return;
    }

    // 1. Kiểm tra tồn kho sẵn có ở client
    const maxStock = getItemStock(item);

    if (newQuantity > item.quantity && maxStock !== null && maxStock !== undefined) {
      if (newQuantity > maxStock) {
        toast.error(`Không thể cập nhật! Chỉ còn ${maxStock} sản phẩm trong kho.`, { position: 'bottom-right' });
        return;
      }
    }

    // 2. Nếu có cartItemId (user đã login) -> gọi API PUT lên server kiểm tra kho & ghi DB trước
    if (item.cartItemId) {
      try {
        const res = await fetch(`${API_URL}/cart/${item.cartItemId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity }),
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.message || 'Không thể cập nhật số lượng', { position: 'bottom-right' });
          return;
        }
      } catch {
        toast.error('Lỗi kết nối server!', { position: 'bottom-right' });
        return;
      }
    }

    // 3. Cập nhật Redux local nếu hợp lệ
    dispatch(updateQuantity({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: newQuantity
    }));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { action: 'update', item, quantity: newQuantity } }));
  };

  const handleRemove = async (item) => {
    // Cập nhật Redux + localStorage ngay để UX mượt
    dispatch(removeFromCart({
      product_id: item.product_id,
      variant_id: item.variant_id
    }));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { action: 'remove', item } }));
    // Nếu có cartItemId → gọi API DELETE lên DB để tránh item xuất hiện lại khi F5
    if (item.cartItemId) {
      setRemovingId(item.cartItemId);
      try {
        await fetch(`${API_URL}/cart/${item.cartItemId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch { /* bỏ qua lỗi kết nối */ } finally {
        setRemovingId(null);
      }
    }
  };

  const handleCheckout = () => {
    onClose();
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để tiến hành mua hàng!');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>Giỏ Hàng Của Bạn</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Giỏ hàng đang trống.</p>
              <button onClick={onClose} className="btn-primary" style={{marginTop:'10px'}}>Tiếp tục mua sắm</button>
            </div>
          ) : (
            <div className="drawer-items">
              {cartItems.map((item, index) => (
                <div className="drawer-item" key={index}>
                  <img src={getImageUrl(item.image)} alt={item.name} className="drawer-item-img" />
                  <div className="drawer-item-info">
                    <div className="drawer-item-title">{item.name}</div>
                    {(item.sku || item.variantName) && (
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {item.sku && <span>SKU: <strong style={{ color: '#d1d5db', fontFamily: 'monospace' }}>{item.sku}</strong></span>}
                        {item.variantName && <span>Biến thể: <strong style={{ color: '#f3f4f6' }}>{item.variantName}</strong></span>}
                      </div>
                    )}
                    <div className="drawer-item-price">{formatPrice(item.price)}</div>
                    <div className="drawer-item-qty">
                      <button onClick={() => handleUpdateQuantity(item, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="drawer-item-remove" onClick={() => handleRemove(item)}>🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total">
              <span>Tổng cộng:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <button className="btn-checkout" onClick={handleCheckout}>THANH TOÁN NGAY</button>
            <Link to="/cart" onClick={onClose} className="btn-view-cart">Xem chi tiết giỏ hàng</Link>
          </div>
        )}
      </div>
    </>
  );
}
