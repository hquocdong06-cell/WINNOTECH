import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/checkout.css'

// ─── Dữ liệu mẫu giỏ hàng (lấy giống Cart.jsx) ────────────────
const INITIAL_CART = [
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
    specs: '16GB GDDR6X • 2640 MHz • PCIe 4.0',
    price: 18490000,
    quantity: 1,
    image: '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png'
  },
  {
    id: 3,
    name: 'MSI MAG B760 Tomahawk WiFi',
    specs: 'Intel • LGA 1700 • ATX',
    price: 6450000,
    quantity: 1,
    image: '/src/assets/images/mainboard1.png'
  },
  {
    id: 4,
    name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz',
    specs: '32GB DDR5 • DDR5 • 6000MHz',
    price: 3990000,
    quantity: 2,
    image: '/src/assets/images/ram1.png'
  }
]

// ─── Helper format tiền ─────────────────────────────────────────
const fmt = (n) => n.toLocaleString('vi-VN') + 'đ'

export default function Checkout() {
  const [cartItems] = useState(INITIAL_CART)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [form, setForm] = useState({
    fullname: '', email: '', phone: '', address: '',
    province: '', district: '', note: ''
  })

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const discount = 0
  const shipping = subtotal >= 1000000 ? 0 : 30000
  const total = subtotal - discount + shipping

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại WINNOTECH.')
  }

  return (
    <DefaultLayout>
      {/* Breadcrumb */}
      <div className="checkout-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span style={{ color: '#444' }}>›</span>
        <Link to="/cart">Giỏ hàng</Link>
        <span style={{ color: '#444' }}>›</span>
        <span>Thanh toán</span>
      </div>

      {/* Step progress */}
      <div className="checkout-steps">
        <div className="step-item active">
          <div className="step-num">1</div>
          <div className="step-label">Thông tin giao hàng</div>
        </div>
        <div className="step-connector" />
        <div className="step-item">
          <div className="step-num">2</div>
          <div className="step-label">Phương thức thanh toán</div>
        </div>
        <div className="step-connector" />
        <div className="step-item">
          <div className="step-num">3</div>
          <div className="step-label">Xác nhận đơn hàng</div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <form className="checkout-inner" onSubmit={handleSubmit}>

        {/* ── LEFT ── */}
        <div className="co-left">

          {/* THÔNG TIN KHÁCH HÀNG */}
          <div className="co-card">
            <div className="co-section-title">Thông tin khách hàng</div>
            <div className="co-form">
              <div className="co-field">
                <label>Họ và tên <span className="req">*</span></label>
                <input
                  type="text"
                  name="fullname"
                  placeholder="Nhập họ và tên"
                  value={form.fullname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="co-field">
                <label>Email <span className="req">*</span></label>
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="co-field">
                <label>Số điện thoại <span className="req">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="co-field">
                <label>Địa chỉ <span className="req">*</span></label>
                <input
                  type="text"
                  name="address"
                  placeholder="Nhập số nhà, tên đường, phường/xã"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="co-row-2">
                <div className="co-field">
                  <label>Tỉnh / Thành phố <span className="req">*</span></label>
                  <select name="province" value={form.province} onChange={handleChange} required>
                    <option value="">Chọn tỉnh / thành phố</option>
                    <option>Hà Nội</option>
                    <option>TP. Hồ Chí Minh</option>
                    <option>Đà Nẵng</option>
                    <option>Cần Thơ</option>
                    <option>Hải Phòng</option>
                    <option>Bình Dương</option>
                    <option>Đồng Nai</option>
                  </select>
                </div>
                <div className="co-field">
                  <label>Quận / Huyện <span className="req">*</span></label>
                  <select name="district" value={form.district} onChange={handleChange} required>
                    <option value="">Chọn quận / huyện</option>
                    <option>Quận 1</option>
                    <option>Quận 3</option>
                    <option>Quận 7</option>
                    <option>Quận Bình Thạnh</option>
                    <option>Quận Gò Vấp</option>
                    <option>Quận Tân Bình</option>
                  </select>
                </div>
              </div>
              <div className="co-field">
                <label>Ghi chú đơn hàng</label>
                <textarea
                  name="note"
                  placeholder="Ghi chú về đơn hàng (nếu có)"
                  rows={3}
                  value={form.note}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* PHƯƠNG THỨC THANH TOÁN */}
          <div className="co-card">
            <div className="co-section-title">Phương thức thanh toán</div>
            <div className="co-payment-list">

              {/* COD */}
              <div
                className={`co-payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="co-radio">
                  <div className="co-radio-dot" />
                </div>
                <div className="co-payment-info">
                  <div className="co-payment-name">Thanh toán khi nhận hàng (COD)</div>
                  <div className="co-payment-desc">Thanh toán bằng tiền mặt khi nhận hàng</div>
                </div>
                <div className="co-payment-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                    <rect x="2" y="6" width="20" height="13" rx="2" />
                    <path d="M2 10h20" />
                    <circle cx="12" cy="15" r="2" />
                  </svg>
                </div>
              </div>

              {/* Bank Transfer */}
              <div
                className={`co-payment-option ${paymentMethod === 'bank' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('bank')}
              >
                <div className="co-radio">
                  <div className="co-radio-dot" />
                </div>
                <div className="co-payment-info">
                  <div className="co-payment-name">Chuyển khoản ngân hàng</div>
                  <div className="co-payment-desc">Chuyển khoản qua ngân hàng, xác nhận nhanh chóng</div>
                </div>
                <div className="co-payment-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" />
                  </svg>
                </div>
              </div>

              {/* E-Wallet */}
              <div
                className={`co-payment-option ${paymentMethod === 'ewallet' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('ewallet')}
              >
                <div className="co-radio">
                  <div className="co-radio-dot" />
                </div>
                <div className="co-payment-info">
                  <div className="co-payment-name">Ví điện tử</div>
                  <div className="co-payment-desc">Thanh toán qua ví điện tử tiện lợi</div>
                </div>
                <div className="co-payment-icon">
                  <div className="co-wallet-badges">
                    <span className="co-badge-momo">MO</span>
                    <span className="co-badge-zalo">Zalo<b>Pay</b></span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="co-right">
          <div className="co-summary-card">
            <div className="co-summary-header">
              <div className="co-section-title">Tóm tắt đơn hàng</div>
            </div>

            {/* Items */}
            <div className="co-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="co-item">
                  <div className="co-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="co-item-info">
                    <div className="co-item-name">{item.name}</div>
                    <div className="co-item-specs">{item.specs}</div>
                  </div>
                  <div className="co-item-right">
                    <div className="co-item-price">{fmt(item.price * item.quantity)}</div>
                    <div className="co-item-qty">x{item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="co-totals">
              <div className="co-total-row">
                <span className="label">Tạm tính</span>
                <span className="value">{fmt(subtotal)}</span>
              </div>
              <div className="co-total-row">
                <span className="label">Giảm giá</span>
                <span className="value discount">-{fmt(discount)}</span>
              </div>
              <div className="co-total-row">
                <span className="label">Phí vận chuyển</span>
                <span className="value free">{shipping === 0 ? 'Miễn phí' : fmt(shipping)}</span>
              </div>
            </div>

            {/* Grand total */}
            <div className="co-grand-total">
              <span className="co-grand-label">Tổng cộng</span>
              <div className="co-grand-amount">
                <div className="co-grand-price">{fmt(total)}</div>
                <div className="co-grand-vat">Đã bao gồm VAT</div>
              </div>
            </div>

            {/* Benefits */}
            <div className="co-benefits">
              <div className="co-benefit">
                <div className="co-benefit-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <path d="M16 8h4l3 3v4h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div className="co-benefit-text">
                  <div className="co-benefit-title">Miễn phí vận chuyển</div>
                  <div className="co-benefit-sub">Cho đơn từ 1.000.000đ</div>
                </div>
              </div>
              <div className="co-benefit">
                <div className="co-benefit-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="co-benefit-text">
                  <div className="co-benefit-title">Bảo hành chính hãng</div>
                  <div className="co-benefit-sub">Sản phẩm chính hãng 100%</div>
                </div>
              </div>
              <div className="co-benefit">
                <div className="co-benefit-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M3 2v6h6" />
                    <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
                    <path d="M21 22v-6h-6" />
                    <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
                  </svg>
                </div>
                <div className="co-benefit-text">
                  <div className="co-benefit-title">Đổi trả dễ dàng</div>
                  <div className="co-benefit-sub">Đổi trả trong 30 ngày</div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="co-submit-wrap">
              <button type="submit" className="co-btn-submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                ĐẶT HÀNG
              </button>
            </div>
          </div>
        </div>

      </form>
    </DefaultLayout>
  )
}
