import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/checkout.css'

// ─── Constants ──────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:3000'
const fmt = (n) => Number(n).toLocaleString('vi-VN') + 'đ'

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
            placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
            value={form.address}
            onChange={onChange}
            required
          />
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
          <div className="co-shipping-name">{address.Name}</div>
          <div className="co-shipping-phone">{address.Phone}</div>
          <div className="co-shipping-addr">{address.address}</div>
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
function AddressSelectorModal({ addresses, selectedId, onSelect, onClose, onAddNew }) {
  const [showNewForm, setShowNewForm] = useState(false)
  const [newAddr, setNewAddr] = useState({ Name: '', Phone: '', address: '', set_default: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  const handleSaveNew = async () => {
    if (!newAddr.Name || !newAddr.Phone || !newAddr.address) return
    setSaving(true)
    try {
      const res = await fetch(API_URL + '/profile/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAddr)
      })
      const data = await res.json()
      if (data.success) {
        onAddNew(data.data)
        onSelect(data.data)
        onClose()
      } else {
        alert(data.message || 'Lỗi khi thêm địa chỉ')
      }
    } catch {
      alert('Lỗi kết nối server')
    } finally {
      setSaving(false)
    }
  }

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
                  const isSelected = addr._id === selectedId
                  const isDefault = addr.set_default
                  return (
                    <div
                      key={addr._id}
                      className={`asm-addr-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelect(addr)}
                    >
                      <div className="asm-radio">
                        <div className="asm-radio-dot" />
                      </div>
                      <div className="asm-addr-info">
                        <div className="asm-addr-top">
                          <span className="asm-addr-name">{addr.Name}</span>
                          <span className="asm-addr-phone">{addr.Phone}</span>
                          {isDefault && <span className="asm-default-badge">Mặc định</span>}
                        </div>
                        <div className="asm-addr-detail">{addr.address}</div>
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
            <div className="asm-new-form">
              <div className="asm-new-form-title">Địa chỉ mới</div>
              <div className="co-form">
                <div className="co-row-2">
                  <div className="co-field">
                    <label>Họ và tên <span className="req">*</span></label>
                    <input
                      type="text" placeholder="Nhập họ và tên"
                      value={newAddr.Name}
                      onChange={(e) => setNewAddr({ ...newAddr, Name: e.target.value })}
                    />
                  </div>
                  <div className="co-field">
                    <label>Số điện thoại <span className="req">*</span></label>
                    <input
                      type="tel" placeholder="Nhập số điện thoại"
                      value={newAddr.Phone}
                      onChange={(e) => setNewAddr({ ...newAddr, Phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="co-field">
                  <label>Địa chỉ đầy đủ <span className="req">*</span></label>
                  <input
                    type="text" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={newAddr.address}
                    onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                  />
                </div>
                <div className="co-field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newAddr.set_default}
                      onChange={(e) => setNewAddr({ ...newAddr, set_default: e.target.checked })}
                    />
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>
              <div className="asm-new-form-actions">
                <button type="button" className="asm-btn-cancel-new" onClick={() => setShowNewForm(false)}>
                  Hủy
                </button>
                <button
                  type="button"
                  className="asm-btn-save-new"
                  disabled={saving}
                  onClick={handleSaveNew}
                >
                  {saving ? 'Đang lưu...' : 'Lưu & sử dụng địa chỉ này'}
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
  const navigate = useNavigate()

  // ── Auth state ──
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Shipping addresses ──
  const [shippingAddresses, setShippingAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)

  // ── Guest form ──
  const [form, setForm] = useState({
    fullname: '', phone: '', address: '', note: ''
  })

  // ── Payment ──
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // Map payment method slug -> MongoDB ObjectId (lấy từ collection PaymentMethod)
  const PAYMENT_METHOD_IDS = {
    cod:     '6a3ea04fd27f601bd29ea067', // Thanh toán khi nhận hàng (COD)
    bank:    '6a3ea04fd27f601bd29ea068', // Chuyển khoản ngân hàng
    ewallet: '6a3ea04fd27f601bd29ea069', // Ví MoMo
  }

  // ── Cart ──
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(true)

  // ── Voucher ──
  const [voucherCode, setVoucherCode] = useState('')

  // ── Submit state ──
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false) // State xác nhận đặt hàng

  // ── Computed totals ──
  const subtotal = cartItems.reduce((s, item) => {
    const price = item.variant?.sale_price > 0 ? item.variant.sale_price : (item.variant?.price || item.cartItem?.price || 0)
    return s + price * (item.cartItem?.quantity || 1)
  }, 0)
  const discount = 0
  const shipping = subtotal >= 1000000 ? 0 : 30000
  const total = subtotal - discount + shipping

  // ── Fetch current user ──
  useEffect(() => {
    fetch(API_URL + '/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.user)
        else setUser(null)
      })
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false))
  }, [])

  // ── Fetch cart từ API thật ──
  useEffect(() => {
    setCartLoading(true)
    fetch(API_URL + '/cart', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCartItems(data.data || [])
        else setCartItems([])
      })
      .catch(() => setCartItems([]))
      .finally(() => setCartLoading(false))
  }, [])

  // ── Trực tiếp gọi API khi người dùng đã xác nhận trên modal ──
  const executeOrderSubmission = async () => {
    setSubmitting(true)
    setSubmitError('')
    setShowConfirmModal(false)
    
    const { Name, Phone, Adress } = getShippingInfo()
    const items = getOrderItems()

    try {
      const payment_method_id = PAYMENT_METHOD_IDS[paymentMethod] || PAYMENT_METHOD_IDS.cod
      const body = {
        Name,
        Phone,
        Adress,
        payment_method: payment_method_id,
        items,
      }
      if (voucherCode.trim()) body.voucher_code = voucherCode.trim()

      const res = await fetch(API_URL + '/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        navigate('/profile?tab=orders&success=1')
      } else {
        setSubmitError(data.message || 'Đặt hàng thất bại, vui lòng thử lại!')
      }
    } catch {
      setSubmitError('Lỗi kết nối server, vui lòng thử lại!')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Click ĐẶT HÀNG: Chỉ validate thông tin và mở Modal xác nhận ──
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitError('')

    if (cartItems.length === 0) {
      setSubmitError('Giỏ hàng trống, không thể đặt hàng!')
      return
    }

    const { Name, Phone, Adress } = getShippingInfo()
    if (!Name || !Phone || !Adress) {
      setSubmitError('Vui lòng điền đầy đủ thông tin giao hàng!')
      return
    }

    const items = getOrderItems()
    if (items.length === 0) {
      setSubmitError('Không tìm thấy sản phẩm để đặt hàng!')
      return
    }

    // Hiển thị Modal xác nhận
    setShowConfirmModal(true)
  }

  // ── Fetch địa chỉ giao hàng khi đã đăng nhập ──
  const fetchAddresses = useCallback(() => {
    if (!user) return
    setAddressLoading(true)
    fetch(API_URL + '/profile/deliver', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const addrs = data.data || []
          setShippingAddresses(addrs)
          // Chọn mặc định
          const def = addrs.find((a) => a.set_default) || addrs[0] || null
          setSelectedAddress(def)
        }
      })
      .catch(() => {})
      .finally(() => setAddressLoading(false))
  }, [user])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const handleGuestChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ── Lấy thông tin giao hàng để POST ──
  const getShippingInfo = () => {
    if (user && selectedAddress) {
      return {
        Name: selectedAddress.Name,
        Phone: selectedAddress.Phone,
        Adress: selectedAddress.address,
      }
    }
    return {
      Name: form.fullname,
      Phone: form.phone,
      Adress: form.address,
    }
  }

  // ── Lấy items để POST ──
  const getOrderItems = () => {
    return cartItems.map((item) => ({
      variant_id: item.cartItem?.variant_id || item.variant?._id,
      quantity: item.cartItem?.quantity || 1,
      price: item.variant?.sale_price > 0 ? item.variant.sale_price : (item.variant?.price || item.cartItem?.price || 0),
    }))
  }



  // ── Shipping section rendering ──
  const renderShippingSection = () => {
    if (authLoading || addressLoading) {
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

  // ── Render item trong giỏ ──
  const renderCartItem = (item, idx) => {
    const product = item.product
    const variant = item.variant
    const cartItem = item.cartItem
    const mainImg = item.AnhSP?.find((img) => img.is_main) || item.AnhSP?.[0]
    const imgUrl = mainImg?.url || product?.thumnail || ''
    const price = variant?.sale_price > 0 ? variant.sale_price : (variant?.price || cartItem?.price || 0)
    const qty = cartItem?.quantity || 1
    const name = product?.name || variant?.variant_name || 'Sản phẩm'
    const specs = variant?.variant_name !== 'Mặc định' ? variant?.variant_name : ''

    return (
      <div key={cartItem?._id || idx} className="co-item">
        <div className="co-item-img">
          {imgUrl
            ? <img src={API_URL + imgUrl} alt={name} onError={(e) => { e.target.style.display = 'none' }} />
            : <div style={{ width: '100%', height: '100%', background: '#333', borderRadius: '6px' }} />
          }
        </div>
        <div className="co-item-info">
          <div className="co-item-name">{name}</div>
          {specs && <div className="co-item-specs">{specs}</div>}
        </div>
        <div className="co-item-right">
          <div className="co-item-price">{fmt(price * qty)}</div>
          <div className="co-item-qty">x{qty}</div>
        </div>
      </div>
    )
  }

  return (
    <DefaultLayout>
      {/* Address selector modal */}
      {showAddressModal && (
        <AddressSelectorModal
          addresses={shippingAddresses}
          selectedId={selectedAddress?._id}
          onSelect={(addr) => { setSelectedAddress(addr); setShowAddressModal(false) }}
          onClose={() => setShowAddressModal(false)}
          onAddNew={(newAddr) => setShippingAddresses((prev) => [...prev, newAddr])}
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
              {cartLoading ? (
                <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '13px' }}>
                  Đang tải giỏ hàng...
                </div>
              ) : cartItems.length === 0 ? (
                <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '13px' }}>
                  Giỏ hàng trống
                </div>
              ) : (
                cartItems.map((item, idx) => renderCartItem(item, idx))
              )}
            </div>

            {/* Voucher */}
            <div className="co-voucher" style={{ padding: '12px 16px', borderTop: '1px solid #222' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                MÃ GIẢM GIÁ
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  style={{
                    flex: 1, background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px',
                    color: '#fff', padding: '8px 12px', fontSize: '13px'
                  }}
                />
              </div>
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

            {/* Error */}
            {submitError && (
              <div style={{
                margin: '0 16px 12px', padding: '10px 14px', background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)', borderRadius: '6px',
                color: '#f87171', fontSize: '13px'
              }}>
                {submitError}
              </div>
            )}

            {/* Submit */}
            <div className="co-submit-wrap">
              <button type="submit" className="co-btn-submit" disabled={submitting || cartLoading}>
                {submitting ? (
                  'Đang đặt hàng...'
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    ĐẶT HÀNG
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: '#111', border: '1px solid #222', borderRadius: '12px',
            width: '100%', maxWidth: '480px', padding: '28px', color: '#fff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{
              margin: '0 0 16px', fontSize: '18px', fontWeight: 800,
              color: '#c8e600', textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              Xác Nhận Đặt Hàng
            </h3>
            
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#aaa', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn đặt đơn hàng này với các thông tin giao nhận dưới đây?
            </p>

            <div style={{
              background: '#181818', border: '1px solid #222', borderRadius: '8px',
              padding: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px',
              fontSize: '13px'
            }}>
              <div>
                <span style={{ color: '#666', fontWeight: 600 }}>Người nhận:</span>{' '}
                <span style={{ color: '#fff', fontWeight: 700 }}>{getShippingInfo().Name}</span>
              </div>
              <div>
                <span style={{ color: '#666', fontWeight: 600 }}>Số điện thoại:</span>{' '}
                <span style={{ color: '#fff' }}>{getShippingInfo().Phone}</span>
              </div>
              <div>
                <span style={{ color: '#666', fontWeight: 600 }}>Địa chỉ nhận:</span>{' '}
                <span style={{ color: '#fff', lineHeight: 1.4 }}>{getShippingInfo().Adress}</span>
              </div>
              <div>
                <span style={{ color: '#666', fontWeight: 600 }}>Thanh toán qua:</span>{' '}
                <span style={{ color: '#c8e600', fontWeight: 700 }}>
                  {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 
                   paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Ví điện tử'}
                </span>
              </div>
              <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px solid #222' }}>
                <span style={{ color: '#666', fontWeight: 600, fontSize: '14px' }}>Tổng thanh toán:</span>{' '}
                <span style={{ color: '#c8e600', fontWeight: 800, fontSize: '16px' }}>{fmt(total)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1, padding: '12px', background: '#1c1c1c', border: '1px solid #2d2d2d',
                  color: '#ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#252525'}
                onMouseOut={(e) => e.target.style.background = '#1c1c1c'}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={executeOrderSubmission}
                style={{
                  flex: 1, padding: '12px', background: '#c8e600', border: 'none',
                  color: '#000', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.target.style.opacity = 0.9}
                onMouseOut={(e) => e.target.style.opacity = 1}
              >
                Xác nhận mua
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
