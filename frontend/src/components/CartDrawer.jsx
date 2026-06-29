import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotalPrice, removeFromCart, updateQuantity } from '../redux/cartSlice';
import '../assets/styles/cart-drawer.css'; // Mượn css tự tạo hoặc inline

export default function CartDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotalPrice);

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) return;
    dispatch(updateQuantity({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: newQuantity
    }));
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({
      product_id: item.product_id,
      variant_id: item.variant_id
    }));
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
                  <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="cart-item-img" />
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
