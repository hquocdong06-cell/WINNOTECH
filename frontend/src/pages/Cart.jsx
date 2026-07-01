import React, { useState } from 'react'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/cart.css'
import '../assets/styles/home.css'

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Intel Core i9-14900K',
      specs: '24 Nhân / 32 Luồng • 3.2GHz • LGA 1700',
      price: 18490000,
      quantity: 1,
      image: '/src/assets/images/cpu1.png'
    },
    {
      id: 2,
      name: 'ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB GDDR6X',
      specs: '16GB GDDR6X • 2640 Mhz • PCIe 4.0',
      price: 18490000,
      quantity: 1,
      image: '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png'
    },
    {
      id: 3,
      name: 'MSI MAG B760 Tomahawk WiFi',
      specs: 'Intel • LGA 1700 • ATX',
      price: 6490000,
      quantity: 1,
      image: '/src/assets/images/mainboard1.png'
    },
    {
      id: 4,
      name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz',
      specs: '32GB GDDR5 • DDR5 • 6000MHz',
      price: 3990000,
      quantity: 2,
      image: '/src/assets/images/ram1.png'
    }
  ])

  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [shippingFee, setShippingFee] = useState(0)

  // Related products
  const relatedProducts = [
    {
      id: 101,
      name: 'ASUS ROG Strix GeForce RTX 4080 SUPER 16GB GDDR6X',
      specs: '16GB GDDR6X • 1980 Mhz',
      price: 34990000,
      image: '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png'
    },
    {
      id: 102,
      name: 'Lian Li O11 Dynamic Black',
      specs: 'Mid Tower',
      price: 2700000,
      image: '/src/assets/images/case.png'
    },
    {
      id: 103,
      name: 'Corsair RM850e 850W 80 Plus Gold',
      specs: '850W • 80 Plus Gold',
      price: 2990000,
      image: '/src/assets/images/psu.png'
    },
    {
      id: 104,
      name: 'NZXT Kraken H6 RGB',
      specs: '280MM • RGB',
      price: 5490000,
      image: '/src/assets/images/cooler.png'
    }
  ]

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal - appliedDiscount + shippingFee

  // Handle quantity change
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ))
  }

  // Handle remove item
  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  // Handle apply discount
  const handleApplyDiscount = () => {
    if (discountCode === 'SAVE1M') {
      setAppliedDiscount(1000000)
    } else if (discountCode === 'SAVE500K') {
      setAppliedDiscount(500000)
    } else if (discountCode.trim()) {
      alert('Mã giảm giá không hợp lệ')
      setAppliedDiscount(0)
    }
  }

  // Format price
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ'
  }

  return (
    <DefaultLayout>
      {/* BREADCRUMB */}
      <div className="breadcrumb-section">
        <div className="breadcrumb-inner">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <a href="/cart">Giỏ hàng</a>
        </div>
      </div>

      {/* CART SECTION */}
      <div className="cart-section">
        <div className="section-inner">
          <h1 className="cart-title">GIỎ HÀNG CỦA BẠN</h1>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <p>Giỏ hàng của bạn đang trống</p>
              <a href="/products" className="btn-continue-shopping">
                TIẾP TỤC MUA SẮM
              </a>
            </div>
          ) : (
            <div className="cart-grid">
              {/* LEFT: CART ITEMS */}
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-specs">{item.specs}</div>
                    </div>

                    <div className="item-price">
                      {formatPrice(item.price)}
                    </div>

                    <div className="item-quantity">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="qty-btn"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="qty-input"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="btn-remove"
                      title="Xóa sản phẩm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                ))}

                <a href="/products" className="btn-continue-shopping-link">
                  ← TIẾP TỤC MUA SẮM
                </a>
              </div>

              {/* RIGHT: ORDER SUMMARY */}
              <aside className="order-summary">
                <h2>TÓM TẮT ĐƠN HÀNG</h2>

                {/* PRICING DETAILS */}
                <div className="summary-item">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="summary-item">
                  <span>Giảm giá</span>
                  <span className="discount">-{formatPrice(appliedDiscount)}</span>
                </div>

                <div className="summary-item">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                </div>

                {/* DISCOUNT CODE */}
                <div className="discount-section">
                  <label>Nhập mã giảm giá</label>
                  <div className="discount-input-group">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className="discount-input"
                    />
                    <button onClick={handleApplyDiscount} className="btn-apply">
                      ÁP DỤNG
                    </button>
                  </div>
                  <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Mã test: SAVE1M (giảm 1M), SAVE500K (giảm 500K)
                  </small>
                </div>

                {/* TOTAL */}
                <div className="summary-total">
                  <span>Tổng cộng</span>
                  <span className="total-price">{formatPrice(total)}</span>
                </div>

                {/* CHECKOUT BUTTON */}
                <button className="btn-checkout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                  </svg>
                  TIẾN HÀNH THANH TOÁN
                </button>

                {/* BENEFITS */}
                <div className="summary-benefits">
                  <div className="benefit-item">
                    <span className="benefit-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13" rx="1" />
                        <path d="M16 8h4l3 3v4h-7V8z" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                    </span>
                    <div>
                      <div className="benefit-title">Miễn phí vận chuyển</div>
                      <div className="benefit-text">Cho đơn từ 1.000.000đ</div>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </span>
                    <div>
                      <div className="benefit-title">Bảo hành chính hãng</div>
                      <div className="benefit-text">36 tháng</div>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M3 2v6h6" />
                        <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
                        <path d="M21 22v-6h-6" />
                        <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
                      </svg>
                    </span>
                    <div>
                      <div className="benefit-title">Đổi trả miễn phí</div>
                      <div className="benefit-text">30 ngày</div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* RELATED PRODUCTS */}
          {cartItems.length > 0 && (
            <div className="related-products">
              <div className="related-header">
                <h2>SẢN PHẨM LIÊN QUAN</h2>
                <a href="/products">XEM TẤT CẢ →</a>
              </div>
              <div className="related-grid">
                {relatedProducts.map((item) => (
                  <div key={item.id} className="product-card">
                    <div className="item-visual-box">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="product-info">
                      <div className="product-name" style={{ minHeight: '38px', fontSize: '13px' }}>{item.name}</div>
                      <div className="product-cat">{item.specs}</div>
                      <div className="product-footer">
                        <div className="product-price-container">
                          <span className="product-price">{formatPrice(item.price)}</span>
                        </div>
                        <div className="product-actions">
                          <button className="btn-cart">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}
