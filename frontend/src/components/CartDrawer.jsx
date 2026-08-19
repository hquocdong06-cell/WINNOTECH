import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotalPrice, removeFromCart, updateQuantity } from '../redux/cartSlice';
import '../assets/styles/cart-drawer.css'; // CSS riêng cho drawer mini cart

const API_URL = 'http://localhost:3000';

export default function CartDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotalPrice);
  const [removingId, setRemovingId] = useState(null);

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/60';
    if (image.startsWith('http')) return image;
    return `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemove(item);
      return;
    }
    // Cập nhật Redux local ngay để UX mượt
    dispatch(updateQuantity({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: newQuantity
    }));
    // Nếu có cartItemId → gọi API PUT lên DB
    if (item.cartItemId) {
      try {
        await fetch(`${API_URL}/cart/${item.cartItemId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity }),
        });
      } catch { /* bỏ qua lỗi kết nối */ }
    }
  };

  const handleRemove = async (item) => {
    // Cập nhật Redux + localStorage ngay để UX mượt
    dispatch(removeFromCart({
      product_id: item.product_id,
      variant_id: item.variant_id
    }));
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
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div className="cart-item" key={index}>
                  <img src={getImageUrl(item.image)} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <div className="cart-item-title">{item.name}</div>
                    <div className="cart-item-price">{formatPrice(item.price)}</div>
                    <div className="cart-item-qty">
                      <button onClick={() => handleUpdateQuantity(item, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => handleRemove(item)}>🗑️</button>
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
