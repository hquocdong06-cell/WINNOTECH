import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/checkout.css'

// ─── Constants ──────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:3000'

const fmt = (n) => n.toLocaleString('vi-VN') + 'đ'

// ─── Mock cart (sẽ thay bằng context/cart state thực sau) ───────────────────
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

// ─── Mock shipping addresses (swap bằng API thật khi DeliveryAddress model sẵn sàng) ──
const MOCK_SHIPPING_ADDRESSES = [
  {
    id: 1,
    fullName: 'Hồ Quốc Đông',
    phone: '0909 123 123',
    address: '123 Nguyễn Huệ',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
    is_default: 0
  },
  {
    id: 2,
    fullName: 'Hồ Quốc Đông',
    phone: '0911 222 333',
    address: '456 Lê Lợi',
    district: 'Quận 3',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
    is_default: 1
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: ShippingForm — hiển thị khi chưa đăng nhập
// ═══════════════════════════════════════════════════════════════════════════
function ShippingForm({ form, onChange }) {
  return (
    <div className="co-card">
      <div className="co-section-title">Thông tin giao hàng</div>
      <div className="co-form">
        <div className="co-row-2">
          <div className="co-field">
            <label>Họ và tên <span className="req">*</span></label>
            <input
              type="text"
              name="fullname"
              placeholder="Nhập họ và tên"
              value={form.fullname}
              onChange={onChange}
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
              onChange={onChange}
              required
            />
          </div>
        </div>
        <div className="co-field">
          <label>Địa chỉ <span className="req">*</span></label>
          <input
            type="text"
            name="address"
            placeholder="Nhập số nhà, tên đường, phường/xã"
            value={form.address}
            onChange={onChange}
            required
          />
        </div>
        <div className="co-row-2">
          <div className="co-field">
            <label>Tỉnh / Thành phố <span className="req">*</span></label>
            <select name="province" value={form.province} onChange={onChange} required>
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
            <select name="district" value={form.district} onChange={onChange} required>
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
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: ShippingInfoCard — hiển thị khi đã đăng nhập
// ═══════════════════════════════════════════════════════════════════════════
function ShippingInfoCard({ address, onChangeClick }) {
  if (!address) {
    return (
      <div className="co-card">
        <div className="co-section-title">Thông tin giao hàng</div>
        <div className="co-shipping-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <p>Bạn chưa có địa chỉ giao hàng nào.</p>
          <button type="button" className="co-btn-add-address" onClick={onChangeClick}>
            + Thêm địa chỉ mới
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="co-card">
      <div className="co-section-title">Thông tin giao hàng</div>
      <div className="co-shipping-card">
        <div className="co-shipping-card-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Địa chỉ mặc định
        </div>

        <div className="co-shipping-card-body">
          <div className="co-shipping-name">{address.fullName}</div>
          <div className="co-shipping-phone">{address.phone}</div>
          <div className="co-shipping-addr">
            {address.address}, {address.district}, {address.city}
          </div>
        </div>

        <button type="button" className="co-btn-change-addr" onClick={onChangeClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Thay đổi
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: AddressSelectorModal — chọn / thêm địa chỉ
// ═══════════════════════════════════════════════════════════════════════════
function AddressSelectorModal({ addresses, selectedId, onSelect, onClose }) {
  const [showNewForm, setShowNewForm] = useState(false)
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', address: '', district: '', city: '' })

  // Đóng khi nhấn Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="asm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="asm-panel">
        <div className="asm-header">
          <div className="asm-header-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Chọn địa chỉ giao hàng
          </div>
          <button className="asm-close" type="button" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="asm-body">
          {!showNewForm ? (
            <>
              <div className="asm-list">
                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedId
                  const isDefault = addr.isDefault || addr.is_default === 1
                  return (
                    <div
                      key={addr.id}
                      className={`asm-addr-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelect(addr)}
                    >
                      <div className="asm-radio">
                        <div className="asm-radio-dot" />
                      </div>
                      <div className="asm-addr-info">
                        <div className="asm-addr-top">
                          <span className="asm-addr-name">{addr.fullName}</span>
                          <span className="asm-addr-phone">{addr.phone}</span>
                          {isDefault && <span className="asm-default-badge">Mặc định</span>}
                        </div>
                        <div className="asm-addr-detail">
                          {addr.address}, {addr.district}, {addr.city}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                className="asm-btn-new"
                onClick={() => setShowNewForm(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Thêm địa chỉ mới
              </button>
            </>
          ) : (
            /* ── Form thêm địa chỉ mới (inline) ── */
            <div className="asm-new-form">
              <div className="asm-new-form-title">Địa chỉ mới</div>
              <div className="co-form">
                <div className="co-row-2">
                  <div className="co-field">
                    <label>Họ và tên <span className="req">*</span></label>
                    <input
                      type="text" placeholder="Nhập họ và tên"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    />
                  </div>
                  <div className="co-field">
                    <label>Số điện thoại <span className="req">*</span></label>
                    <input
                      type="tel" placeholder="Nhập số điện thoại"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="co-field">
                  <label>Địa chỉ <span className="req">*</span></label>
                  <input
                    type="text" placeholder="Số nhà, tên đường, phường/xã"
                    value={newAddr.address}
                    onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                  />
                </div>
                <div className="co-row-2">
                  <div className="co-field">
                    <label>Quận / Huyện <span className="req">*</span></label>
                    <input
                      type="text" placeholder="Nhập quận / huyện"
                      value={newAddr.district}
                      onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                    />
                  </div>
                  <div className="co-field">
                    <label>Tỉnh / Thành phố <span className="req">*</span></label>
                    <input
                      type="text" placeholder="Nhập tỉnh / thành phố"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="asm-new-form-actions">
                <button type="button" className="asm-btn-cancel-new" onClick={() => setShowNewForm(false)}>
                  Hủy
                </button>
                <button
                  type="button"
                  className="asm-btn-save-new"
                  onClick={() => {
                    if (!newAddr.fullName || !newAddr.phone || !newAddr.address) return
                    // TODO: POST /api/addresses khi có API thật
                    const fakeNew = { ...newAddr, id: Date.now(), isDefault: false, is_default: 0 }
                    onSelect(fakeNew)
                    onClose()
                  }}
                >
                  Lưu & sử dụng địa chỉ này
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: Checkout
// ═══════════════════════════════════════════════════════════════════════════
export default function Checkout() {
  // ── Auth state ──
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Shipping addresses ──
  const [shippingAddresses] = useState(MOCK_SHIPPING_ADDRESSES)
  const defaultAddress = shippingAddresses.find((a) => a.isDefault || a.is_default === 1) || shippingAddresses[0] || null
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress)
  const [showAddressModal, setShowAddressModal] = useState(false)

  // ── Guest form ──
  const [form, setForm] = useState({
    fullname: '', phone: '', address: '', province: '', district: '', note: ''
  })

  // ── Payment ──
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // ── Cart ──
  const [cartItems] = useState(INITIAL_CART)

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const discount = 0
  const shipping = subtotal >= 1000000 ? 0 : 30000
  const total = subtotal - discount + shipping

  // ── Fetch current user ──
  useEffect(() => {
    fetch(API_URL + '/profile', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.user)
        else setUser(null)
      })
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false))
  }, [])

  const handleGuestChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (user && !selectedAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng!')
      return
    }
    alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại WINNOTECH.')
  }

  // ── Shipping section rendering ──
  const renderShippingSection = () => {
    if (authLoading) {
      return (
        <div className="co-card">
          <div className="co-section-title">Thông tin giao hàng</div>
          <div className="co-shipping-loading">
            <div className="co-shipping-skeleton" />
            <div className="co-shipping-skeleton co-shipping-skeleton--sm" />
            <div className="co-shipping-skeleton co-shipping-skeleton--md" />
          </div>
        </div>
      )
    }

    if (user) {
      return (
        <ShippingInfoCard
          address={selectedAddress}
          onChangeClick={() => setShowAddressModal(true)}
        />
      )
    }

    return <ShippingForm form={form} onChange={handleGuestChange} />
  }

  return (
    <DefaultLayout>
      {/* Address selector modal */}
      {showAddressModal && (
        <AddressSelectorModal
          addresses={shippingAddresses}
          selectedId={selectedAddress?.id}
          onSelect={(addr) => { setSelectedAddress(addr); setShowAddressModal(false) }}
          onClose={() => setShowAddressModal(false)}
        />
      )}

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

          {/* ── SHIPPING SECTION (conditional) ── */}
          {renderShippingSection()}

          {/* ── PHƯƠNG THỨC THANH TOÁN ── */}
          <div className="co-card">
            <div className="co-section-title">Phương thức thanh toán</div>
            <div className="co-payment-list">

              {/* COD */}
              <div
                className={`co-payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="co-radio"><div className="co-radio-dot" /></div>
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
                <div className="co-radio"><div className="co-radio-dot" /></div>
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
                <div className="co-radio"><div className="co-radio-dot" /></div>
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
