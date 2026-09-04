import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/checkout.css'
import { clearCart, clearGuestCartAPI, getGuestId, selectCartItems, removeFromCart } from '../redux/cartSlice'
import { clearPurchasedPCBuildConfig } from '../utils/pcBuildUtils'

// ─── Constants ──────────────────────────────────────────────────────────────
import { API_BASE as API_URL } from '../services/apiService';
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
// HELPER: Tính toán giảm giá Voucher (Xử lý mã FRS, SHIP và voucher thường)
// ═══════════════════════════════════════════════════════════════════════════
function calculateVoucherDiscount(voucher, subtotal, baseShipping = 30000) {
  const baseShippingFee = subtotal >= 1000000 ? 0 : baseShipping
  if (!voucher || !voucher.code) {
    return {
      productDiscount: 0,
      shippingDiscount: 0,
      shippingFee: baseShippingFee,
      baseShippingFee,
      totalDiscount: 0,
      finalTotal: subtotal + baseShippingFee,
      voucherType: 'none',
    }
  }

  const codeUpper = String(voucher.code).trim().toUpperCase()
  const hasFRS = codeUpper.includes('FRS')
  const hasSHIP = codeUpper.includes('SHIP')

  let productDiscount = 0
  let shippingDiscount = 0
  let voucherType = 'normal'

  if (hasFRS) {
    voucherType = 'frs'
    shippingDiscount = baseShippingFee

    if (voucher.discount_type === 'percent') {
      productDiscount = Math.round((subtotal * Number(voucher.discount_value)) / 100)
    } else {
      productDiscount = Number(voucher.discount_value) || 0
    }
    productDiscount = Math.min(productDiscount, subtotal)
  } else if (hasSHIP) {
    voucherType = 'ship'
    productDiscount = 0

    if (voucher.discount_type === 'percent') {
      shippingDiscount = Math.round((baseShippingFee * Number(voucher.discount_value)) / 100)
    } else {
      shippingDiscount = Number(voucher.discount_value) || 0
    }
    shippingDiscount = Math.min(shippingDiscount, baseShippingFee)
  } else {
    voucherType = 'normal'
    shippingDiscount = 0

    if (voucher.discount_type === 'percent') {
      productDiscount = Math.round((subtotal * Number(voucher.discount_value)) / 100)
    } else {
      productDiscount = Number(voucher.discount_value) || 0
    }
    productDiscount = Math.min(productDiscount, subtotal)
  }

  const finalShippingFee = Math.max(0, baseShippingFee - shippingDiscount)
  const totalDiscount = productDiscount + shippingDiscount
  const finalTotal = Math.max(0, subtotal - productDiscount) + finalShippingFee

  return {
    productDiscount,
    shippingDiscount,
    shippingFee: finalShippingFee,
    baseShippingFee,
    totalDiscount,
    finalTotal,
    voucherType,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: Checkout
// ═══════════════════════════════════════════════════════════════════════════
export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const buyNowState = React.useMemo(() => {
    try {
      if (location.state?.buyNowItem) return location.state.buyNowItem
      if (location.state?.isBuyNow) {
        const stored = sessionStorage.getItem('buyNowItem')
        if (stored && stored !== 'undefined' && stored !== 'null') {
          return JSON.parse(stored)
        }
      }
    } catch (e) {
      console.error('Error parsing buyNowItem:', e)
    }
    // Nếu không phải luồng "Mua ngay" (chuyển từ giỏ hàng), tự động xóa buyNowItem còn lưu trong sessionStorage
    sessionStorage.removeItem('buyNowItem')
    return null
  }, [location.state])

  // Cart từ Redux/localStorage (fallback khi chưa đăng nhập hoặc API trả trống)
  const localCartItems = useSelector(selectCartItems)

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
  // voucherInfo: { code, productDiscount, shippingDiscount, msg, isFreeShip, isShipOnly }
  const [voucherInfo, setVoucherInfo] = useState(null)
  const [voucherError, setVoucherError] = useState('')
  const [voucherChecking, setVoucherChecking] = useState(false)
  const [mySavedVouchers, setMySavedVouchers] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/vouchers/my-vouchers`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.available) {
          setMySavedVouchers(data.data.available)
        }
      })
      .catch(() => {})
  }, [])

  // ── Submit state & Cooldown rate limit (1 phút = 60s) ──
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const lastSubmitTimeRef = React.useRef(0)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  useEffect(() => {
    let timer = null
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
      }, 1000)
    }
    return () => { if (timer) clearInterval(timer) }
  }, [cooldownSeconds])

  // ── VNPay QR state ──
  const [vnpayQR, setVnpayQR] = useState(null)       // base64 QR image
  const [vnpayUrl, setVnpayUrl] = useState('')        // payment URL
  const [showVnpayModal, setShowVnpayModal] = useState(false)

  // ── Computed totals ──
  const subtotal = cartItems.reduce((s, item) => {
    const price = item._localPrice ||
                  (item.variant?.sale_price > 0 ? item.variant.sale_price : (item.variant?.price || item.cartItem?.price || 0))
    return s + price * (item.cartItem?.quantity || 1)
  }, 0)
const voucherCalc = voucherInfo?.rawVoucher
    ? calculateVoucherDiscount(voucherInfo.rawVoucher, subtotal, 30000)
    : {
        productDiscount: 0,
        shippingDiscount: 0,
        shippingFee: subtotal >= 1000000 ? 0 : 30000,
        baseShippingFee: subtotal >= 1000000 ? 0 : 30000,
        totalDiscount: 0,
        finalTotal: subtotal + (subtotal >= 1000000 ? 0 : 30000),
        voucherType: 'none',
      }

  const productDiscount = voucherCalc.productDiscount
  const shippingDiscount = voucherCalc.shippingDiscount
  const discount = voucherCalc.totalDiscount
  const shipping = voucherCalc.shippingFee
  const total = voucherCalc.finalTotal

  // ── Áp dụng voucher ──
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) { setVoucherError('Vui lòng nhập hoặc chọn mã giảm giá'); return }
    setVoucherChecking(true)
    setVoucherError('')
    setVoucherInfo(null)
    try {
      const res = await fetch(`${API_URL}/api/vouchers/apply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim(), cartTotal: subtotal })
      })
      const data = await res.json()
      if (data.success && data.data) {
        const v = data.data.rawVoucher || data.data
        const calc = calculateVoucherDiscount(v, subtotal, 30000)
        setVoucherInfo({
          code: data.data.code,
          discount: calc.totalDiscount,
          productDiscount: calc.productDiscount,
          shippingDiscount: calc.shippingDiscount,
          rawVoucher: v,
          msg: data.message || `Áp dụng mã ${data.data.code} thành công!`,
        })
      } else {
        setVoucherError(data.message || 'Mã giảm giá không hợp lệ')
      }
    } catch (err) {
      setVoucherError(err.message || 'Lỗi khi kiểm tra mã giảm giá')
    } finally {
      setVoucherChecking(false)
    }
  }


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
  const loadCartData = useCallback(() => {
    if (buyNowState) {
      setCartItems([buyNowState])
      setCartLoading(false)
      return
    }
    setCartLoading(true)
    fetch(API_URL + '/cart', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map(dbItem => {
            const matchLocal = localCartItems?.find(l => String(l.variant_id) === String(dbItem.cartItem?.variant_id))
            return {
              ...dbItem,
              _sku: matchLocal?.sku || dbItem.variant?.sku || '',
              _variantName: matchLocal?.variantName || dbItem.variant?.variant_name || '',
            }
          })
          setCartItems(mapped)
        } else {
          if (localCartItems && localCartItems.length > 0) {
            const mapped = localCartItems.map((item) => ({
              cartItem: {
                _id:        item.variant_id,
                variant_id: item.variant_id,
                quantity:   item.quantity || 1,
                price:      item.price || 0,
              },
              variant: item.variant || {
                _id:   item.variant_id,
                variant_name: item.variantName || '',
                sku: item.sku || '',
                price: item.price || 0,
                sale_price: 0,
              },
              product: {
                _id:  item.product_id,
                name: item.name,
              },
              AnhSP: item.image ? [{ url: item.image }] : [],
              _isLocal: true,
              _localPrice: item.price || 0,
              _variantId:  item.variant_id,
              _sku: item.sku || '',
              _variantName: item.variantName || '',
              variantName: item.variantName || '',
              sku: item.sku || '',
            }))
            setCartItems(mapped)
          } else {
            setCartItems([])
          }
        }
      })
      .catch(() => {
        if (localCartItems && localCartItems.length > 0) {
          const mapped = localCartItems.map((item) => ({
            cartItem: { _id: item.variant_id, variant_id: item.variant_id, quantity: item.quantity || 1, price: item.price || 0 },
            variant:  item.variant || { _id: item.variant_id, variant_name: item.variantName || '', sku: item.sku || '', price: item.price || 0, sale_price: 0 },
            product:  { _id: item.product_id, name: item.name },
            AnhSP:    item.image ? [{ url: item.image }] : [],
            _isLocal: true,
            _localPrice: item.price || 0,
            _variantId:  item.variant_id,
            _sku: item.sku || '',
            _variantName: item.variantName || '',
            variantName: item.variantName || '',
            sku: item.sku || '',
          }))
          setCartItems(mapped)
        } else {
          setCartItems([])
        }
      })
      .finally(() => setCartLoading(false))
  }, [localCartItems, buyNowState])

  useEffect(() => {
    loadCartData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── SỐ LƯỢNG / XÓA SẢN PHẨM TỨC THÌ: Lắng nghe Redux localCartItems thay đổi ──
  useEffect(() => {
    if (buyNowState) return
    if (localCartItems && localCartItems.length >= 0) {
      setCartItems((prev) => {
        if (prev.length > 0 && !prev[0]._isLocal) {
          return prev.map(dbItem => {
            const matchLocal = localCartItems.find(l => String(l.variant_id) === String(dbItem.cartItem?.variant_id))
            if (matchLocal) {
              return {
                ...dbItem,
                cartItem: {
                  ...dbItem.cartItem,
                  quantity: matchLocal.quantity || dbItem.cartItem?.quantity
                },
                _sku: matchLocal.sku || dbItem._sku || dbItem.variant?.sku || '',
                _variantName: matchLocal.variantName || dbItem._variantName || dbItem.variant?.variant_name || '',
                variantName: matchLocal.variantName || dbItem.variantName || dbItem.variant?.variant_name || '',
                sku: matchLocal.sku || dbItem.sku || dbItem.variant?.sku || ''
              }
            }
            return dbItem
          })
        }
        return localCartItems.map((item) => ({
          cartItem: { _id: item.variant_id, variant_id: item.variant_id, quantity: item.quantity || 1, price: item.price || 0 },
          variant:  item.variant || { _id: item.variant_id, variant_name: item.variantName || '', sku: item.sku || '', price: item.price || 0, sale_price: 0 },
          product:  { _id: item.product_id, name: item.name },
          AnhSP:    item.image ? [{ url: item.image }] : [],
          _isLocal: true,
          _localPrice: item.price || 0,
          _variantId:  item.variant_id,
          _sku: item.sku || '',
          _variantName: item.variantName || '',
          variantName: item.variantName || '',
          sku: item.sku || '',
        }))
      })
    }
  }, [localCartItems, buyNowState])

  // ── Lắng nghe sự kiện cartUpdated (CartDrawer/Cart) & storage (tab khác) ──
  useEffect(() => {
    const handleCartChange = () => {
      loadCartData()
    }
    window.addEventListener('cartUpdated', handleCartChange)
    window.addEventListener('storage', handleCartChange)
    return () => {
      window.removeEventListener('cartUpdated', handleCartChange)
      window.removeEventListener('storage', handleCartChange)
    }
  }, [loadCartData])

  // ── Trực tiếp gọi API khi người dùng đã xác nhận trên modal ──
  const executeOrderSubmission = async () => {
    if (!user) {
      setSubmitError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiến hành mua hàng!')
      setShowConfirmModal(false)
      navigate('/login?redirect=/checkout')
      return
    }
    if (isAdminUser) {
      setSubmitError('Tài khoản Quản trị viên (Admin) không được phép thực hiện chức năng mua hàng!')
      setShowConfirmModal(false)
      return
    }
    const now = Date.now()
    const elapsed = now - lastSubmitTimeRef.current
    if (elapsed < 60000 && lastSubmitTimeRef.current > 0) {
      const remainingSec = Math.ceil((60000 - elapsed) / 1000)
      setSubmitError(`Hệ thống đang xử lý hoặc bạn vừa gửi yêu cầu. Vui lòng chờ ${remainingSec} giây trước khi thử lại!`)
      setCooldownSeconds(remainingSec)
      setShowConfirmModal(false)
      return
    }

    lastSubmitTimeRef.current = now
    setCooldownSeconds(60)
    setSubmitting(true)
    setSubmitError('')
    setShowConfirmModal(false)

    const { Name, Phone, Adress } = getShippingInfo()
    const items = getOrderItems()

    // ── LUỒNG VNPay (Ví điện tử) ──
    if (paymentMethod === 'ewallet') {
      try {
        const body = {
          Name, Phone, Adress,
          payment_method: PAYMENT_METHOD_IDS.ewallet,
          items,
          user_id: user?._id || user?.id,
          guest_id: getGuestId(),
        }
        if (voucherCode.trim()) body.voucher_code = voucherCode.trim()

        const res = await fetch(API_URL + '/api/create-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        const data = await res.json()

        if (data.success) {
          if (buyNowState) {
            sessionStorage.removeItem('buyNowItem')
            setCartItems([])
          } else {
            dispatch(clearCart())
            dispatch(clearGuestCartAPI())
            clearPurchasedPCBuildConfig()
            setCartItems([])
            localStorage.removeItem('cartItems')
            localStorage.removeItem('cart')
            window.dispatchEvent(new CustomEvent('cartUpdated'))
          }
          window.location.href = data.paymentUrl;
        } else {
          setSubmitError(data.message || 'Không thể tạo thanh toán VNPay, vui lòng thử lại!')
        }
      } catch {
        setSubmitError('Lỗi kết nối server, vui lòng thử lại!')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // ── LUỒNG COD / Chuyển khoản ──
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
        if (buyNowState) {
          sessionStorage.removeItem('buyNowItem')
          setCartItems([])
        } else {
          dispatch(clearCart())
          clearPurchasedPCBuildConfig()
          setCartItems([])
          window.dispatchEvent(new CustomEvent('cartUpdated'))
        }
        navigate(`/order-success?code=${data.order?.code || ''}`)
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

    if (!user) {
      setSubmitError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiến hành mua hàng!')
      navigate('/login?redirect=/checkout')
      return
    }

    if (isAdminUser) {
      setSubmitError('Tài khoản Quản trị viên (Admin) không được phép thực hiện chức năng mua hàng!')
      return
    }

    const now = Date.now()
    const elapsed = now - lastSubmitTimeRef.current
    if (elapsed < 60000 && lastSubmitTimeRef.current > 0) {
      const remainingSec = Math.ceil((60000 - elapsed) / 1000)
      setSubmitError(`Bạn vừa gửi yêu cầu thanh toán. Vui lòng chờ ${remainingSec} giây trước khi thực hiện thao tác tiếp theo!`)
      setCooldownSeconds(remainingSec)
      return
    }

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

  // ── Lấy items để POST — lọc bỏ items không có variant_id MongoDB hợp lệ ──
  const OBJECTID_RE = /^[0-9a-fA-F]{24}$/
  const getOrderItems = () => {
    return cartItems
      .map((item) => ({
        variant_id: item._variantId || item.cartItem?.variant_id || item.variant?._id,
        quantity:   item.cartItem?.quantity || 1,
        price:      item._localPrice ||
                    (item.variant?.sale_price > 0 ? item.variant.sale_price : (item.variant?.price || item.cartItem?.price || 0)),
        _name:      item.product?.name || 'Sản phẩm',
      }))
      .filter((item) => {
        const vid = String(item.variant_id || '')
        if (!OBJECTID_RE.test(vid)) {
          console.warn(`[Checkout] Bỏ qua sản phẩm "${item._name}" — variant_id không hợp lệ: ${vid}`)
          return false
        }
        return true
      })
      .map(({ _name, ...rest }) => rest)  // xóa _name trước khi gửi
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

  // ── TỰ ĐỘNG XÓA DB & VỀ TRANG CHỦ NẾU ĐƠN HÀNG < 1 SẢN PHẨM ──
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      sessionStorage.removeItem('buyNowItem')
      fetch(`${API_URL}/cart`, { method: 'DELETE', credentials: 'include' }).catch(() => {})
      dispatch(clearCart())
      dispatch(clearGuestCartAPI())
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      const timer = setTimeout(() => {
        navigate('/')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [cartLoading, cartItems.length, dispatch, navigate])

  // ── Xóa sản phẩm trực tiếp từ DB / Checkout summary ──
  const handleRemoveCheckoutItem = async (item) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng?')) return

    const cartItemId = item.cartItem?._id
    const productId = item.product?._id
    const variantId = item._variantId || item.cartItem?.variant_id || item.variant?._id
    const nextCount = cartItems.length - 1

    if (nextCount < 1) {
      sessionStorage.removeItem('buyNowItem')
      setCartItems([])
      dispatch(clearCart())
      dispatch(clearGuestCartAPI())
      try {
        await fetch(`${API_URL}/cart`, { method: 'DELETE', credentials: 'include' })
      } catch {}
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      navigate('/')
      return
    }

    // Nếu là Buy Now Item
    if (buyNowState || item._isBuyNow) {
      sessionStorage.removeItem('buyNowItem')
      setCartItems([])
      navigate('/')
      return
    }

    // Nếu là DB cart item (đã đăng nhập và có cartItemId MongoDB 24 ký tự)
    if (cartItemId && /^[0-9a-fA-F]{24}$/.test(String(cartItemId)) && !item._isLocal) {
      try {
        const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        const data = await res.json()
        if (data.success) {
          const updated = cartItems.filter(i => (i.cartItem?._id || i._variantId) !== cartItemId)
          setCartItems(updated)
          dispatch(removeFromCart({ product_id: productId, variant_id: variantId }))
          window.dispatchEvent(new CustomEvent('cartUpdated'))
          if (updated.length < 1) {
            navigate('/')
          }
        } else {
          alert(data.message || 'Lỗi khi xóa sản phẩm khỏi cơ sở dữ liệu!')
        }
      } catch {
        alert('Lỗi kết nối máy chủ!')
      }
      return
    }

    // Nếu là local guest cart item
    dispatch(removeFromCart({ product_id: productId, variant_id: variantId }))
    const updated = cartItems.filter(i => (i._variantId || i.variant?._id) !== variantId)
    setCartItems(updated)
    window.dispatchEvent(new CustomEvent('cartUpdated'))
    if (updated.length < 1) {
      navigate('/')
    }
  }

  // ── Render item trong giỏ ──
  const renderCartItem = (item, idx) => {
    if (!item) return null
    const product = item.product
    const variant = item.variant
    const cartItem = item.cartItem
    const mainImg = item.AnhSP?.find((img) => img.is_main) || item.AnhSP?.[0]
    const imgUrl   = mainImg?.url || product?.thumnail || item.image || ''
    // Nếu imgUrl đã là URL đầy đủ (http) thì không thêm prefix API_URL
    const imgSrc   = imgUrl ? (imgUrl.startsWith('http') ? imgUrl : API_URL + (imgUrl.startsWith('/') ? '' : '/') + imgUrl) : null
    const price    = item._localPrice ||
                     (variant?.sale_price > 0 ? variant.sale_price : (variant?.price || cartItem?.price || 0))
    const qty      = cartItem?.quantity || 1
    const name     = product?.name || item.name || 'Sản phẩm'

    // Lấy thông tin biến thể & SKU
    const sku = item.sku || item._sku || variant?.sku || ''
    let variantName = item.variantName || item._variantName || ''

    if (!variantName && variant?.variant_name && variant.variant_name !== 'Mặc định') {
      variantName = variant.variant_name
    }
    if (!variantName && variant?.Attributes && variant.Attributes.length > 0) {
      variantName = variant.Attributes.map(a => a.value_name || a.value).filter(Boolean).join(' - ')
    }
    if (!variantName && variant?.attributes && variant.attributes.length > 0) {
      variantName = variant.attributes.map(a => a.value_name || a.value).filter(Boolean).join(' - ')
    }

    return (
      <div key={cartItem?._id || idx} className="co-item">
        <div className="co-item-img">
          {imgSrc
            ? <img src={imgSrc} alt={name} onError={(e) => { e.target.style.display = 'none' }} />
            : <div style={{ width: '100%', height: '100%', background: '#333', borderRadius: '6px' }} />
          }
        </div>
        <div className="co-item-info">
          <div className="co-item-name">{name}</div>
          {(variantName || sku) && (
            <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {variantName && (
                <span>Phân loại: <strong style={{ color: '#e4e4e7', fontWeight: 600 }}>{variantName}</strong></span>
              )}
              {sku && (
                <span>SKU: <strong style={{ color: '#71717a', fontFamily: 'monospace' }}>{sku}</strong></span>
              )}
            </div>
          )}
        </div>
        <div className="co-item-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="co-item-price">{fmt(price * qty)}</div>
            <div className="co-item-qty">x{qty}</div>
          </div>
          <button
            type="button"
            onClick={() => handleRemoveCheckoutItem(item)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
            title="Xóa khỏi đơn hàng"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  const isAdminUser = user && (user.role === 'admin' || user.role === 1 || user.isAdmin)

  if (!authLoading && !user) {
    return (
      <DefaultLayout>
        <div className="checkout-wrapper" style={{ padding: '80px 24px', textAlign: 'center', minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="co-card" style={{ maxWidth: '500px', width: '100%', margin: '0 auto', padding: '40px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', background: '#18181b', border: '1px solid #27272a', borderRadius: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              🔒
            </div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>Yêu cầu đăng nhập để mua hàng</h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Để đảm bảo an toàn đơn hàng và xử lý tồn kho chính xác, quý khách vui lòng đăng nhập trước khi tiến hành thanh toán.
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              <Link to="/cart" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #3f3f46', color: '#e4e4e7', textAlign: 'center', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                Quay lại giỏ hàng
              </Link>
              <Link to="/login?redirect=/checkout" style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--yellow, #c8e600)', color: '#000', textAlign: 'center', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  if (!authLoading && isAdminUser) {
    return (
      <DefaultLayout>
        <div className="checkout-wrapper" style={{ padding: '80px 24px', textAlign: 'center', minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="co-card" style={{ maxWidth: '520px', width: '100%', margin: '0 auto', padding: '40px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', background: '#18181b', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              🚫
            </div>
            <h2 style={{ color: '#ef4444', fontSize: '20px', fontWeight: '700', margin: 0 }}>Tài khoản Admin không được phép mua hàng</h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Tài khoản Quản trị viên (Admin) không được phép thực hiện chức năng mua hàng và tạo đơn hàng. Vui lòng sử dụng tài khoản khách hàng để mua hàng.
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              <Link to="/" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #3f3f46', color: '#e4e4e7', textAlign: 'center', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                Trang chủ
              </Link>
              <Link to="/admin" style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#ef4444', color: '#fff', textAlign: 'center', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
                Trang Quản Trị
              </Link>
            </div>
          </div>
        </div>
      </DefaultLayout>
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

              {/* VNPay */}
              <div
                className={`co-payment-option ${paymentMethod === 'ewallet' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('ewallet')}
              >
                <div className="co-radio"><div className="co-radio-dot" /></div>
                <div className="co-payment-info">
                  <div className="co-payment-name">Ví điện tử / VNPay</div>
                  <div className="co-payment-desc">Quét mã QR hoặc thanh toán qua cổng VNPay</div>
                </div>
                <div className="co-payment-icon">
                  <div className="co-wallet-badges">
                    <span className="co-badge-momo" style={{ background: '#005BAA', color: '#fff', borderRadius: '4px', padding: '2px 7px', fontWeight: 700, fontSize: '12px', letterSpacing: '0.5px' }}>VN</span>
                    <span className="co-badge-zalo" style={{ background: '#e5001a', color: '#fff', borderRadius: '4px', padding: '2px 7px', fontWeight: 700, fontSize: '12px' }}>Pay</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>MÃ GIẢM GIÁ</span>
                {mySavedVouchers.length > 0 && (
                  <span style={{ fontSize: '11px', color: '#d4ff00' }}>Ví có {mySavedVouchers.length} mã</span>
                )}
              </div>

              {/* Saved Vouchers Dropdown */}
              {mySavedVouchers.length > 0 && (
                <select
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected) {
                      setVoucherCode(selected);
                      setVoucherInfo(null);
                      setVoucherError('');
                    }
                  }}
                  style={{
                    width: '100%',
                    background: '#161622',
                    border: '1px solid #3d3d56',
                    borderRadius: '6px',
                    color: '#FFE500',
                    padding: '8px 10px',
                    fontSize: '12px',
                    marginBottom: '8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Chọn mã từ Ví Voucher của bạn --</option>
                  {mySavedVouchers.map((uv, idx) => {
                    const v = uv?.voucher || {};
                    if (!v.code) return null;
                    const isPct = (v.discountType || v.discount_type) === 'percent';
                    const val = v.discountValue || v.discount_value || 0;
                    const minVal = v.minOrderValue || v.min_order || 0;
                    const valText = isPct ? `${val}%` : `${(val / 1000)}K`;
                    return (
                      <option key={uv.userVoucherId || v._id || idx} value={v.code}>
                        🎟 [{v.code}] - Giảm {valText} (Đơn từ {minVal ? (minVal/1000)+'K' : '0đ'})
                      </option>
                    );
                  })}
                </select>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Hoặc nhập mã giảm giá"
                  value={voucherCode}
                  onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherInfo(null); setVoucherError('') }}
                  style={{
                    flex: 1, background: '#1a1a1a', border: `1px solid ${voucherInfo ? '#d4ff00' : voucherError ? '#ef4444' : '#333'}`, borderRadius: '6px',
                    color: '#fff', padding: '8px 12px', fontSize: '13px'
                  }}
                />
                <button
                  onClick={handleApplyVoucher}
                  disabled={voucherChecking}
                  style={{ background: '#d4ff00', color: '#000', border: 'none', borderRadius: '6px', padding: '8px 14px', fontWeight: 700, fontSize: '12px', cursor: voucherChecking ? 'not-allowed' : 'pointer', opacity: voucherChecking ? 0.7 : 1, whiteSpace: 'nowrap' }}
                >
                  {voucherChecking ? '...' : 'Áp dụng'}
                </button>
              </div>
              {voucherInfo && (
                <div style={{ fontSize: '12px', color: '#d4ff00', marginTop: '6px' }}>✓ {voucherInfo.msg}</div>
              )}
              {voucherError && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>⚠ {voucherError}</div>
              )}
            </div>

            {/* Totals */}
            <div className="co-totals">
              <div className="co-total-row">
                <span className="label">Tạm tính</span>
                <span className="value">{fmt(subtotal)}</span>
              </div>
{productDiscount > 0 && (
                <div className="co-total-row">
                  <span className="label">
                    Giảm sản phẩm
                    {voucherInfo && <span style={{ fontSize: '10px', color: '#d4ff00', fontFamily: 'monospace', marginLeft: '4px' }}>({voucherInfo.code})</span>}
                  </span>
                  <span className="value discount">-{fmt(productDiscount)}</span>
                </div>
              )}

              <div className="co-total-row">
                <span className="label">Phí vận chuyển
                  {shippingDiscount > 0 && voucherCalc.baseShippingFee > 0 && (
                    <span style={{ fontSize: '10px', color: '#d4ff00', marginLeft: '4px' }}>
                      ({voucherInfo?.isFRS || shippingDiscount >= voucherCalc.baseShippingFee ? 'FREESHIP' : `-${fmt(shippingDiscount)}`})
                    </span>
                  )}
                </span>
                <span className="value free">
                  {shippingDiscount > 0 && voucherCalc.baseShippingFee > 0 ? (
                    <span>
                      <s style={{ color: '#888', marginRight: '6px', fontSize: '12px' }}>{fmt(voucherCalc.baseShippingFee)}</s>
                      <span style={{ color: '#22c55e' }}>{shipping === 0 ? 'Miễn phí' : fmt(shipping)}</span>
                    </span>
                  ) : (
                    shipping === 0 ? 'Miễn phí' : fmt(shipping)
                  )}
                </span>
              </div>
              {shippingDiscount > 0 && voucherCalc.baseShippingFee > 0 && (
                <div className="co-total-row">
                  <span className="label" style={{ fontSize: '12px', color: '#22c55e' }}>
                    Giảm phí ship {voucherInfo && <span style={{ fontSize: '10px', color: '#d4ff00', fontFamily: 'monospace' }}>({voucherInfo.code})</span>}
                  </span>
                  <span className="value discount" style={{ color: '#22c55e' }}>-{fmt(shippingDiscount)}</span>
                </div>
              )}
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
              <button
                type="submit"
                className="co-btn-submit"
                disabled={submitting || cartLoading || cartItems.length === 0 || cooldownSeconds > 0}
                style={{
                  opacity: (submitting || cartLoading || cartItems.length === 0 || cooldownSeconds > 0) ? 0.6 : 1,
                  cursor: (submitting || cartLoading || cartItems.length === 0 || cooldownSeconds > 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? (
                  'Đang đặt hàng...'
                ) : cooldownSeconds > 0 ? (
                  `Vui lòng chờ (${cooldownSeconds}s)`
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
                   paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : '🔵 VNPay (Ví điện tử)'}
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
                disabled={submitting}
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
                disabled={submitting || cooldownSeconds > 0}
                style={{
                  flex: 1, padding: '12px',
                  background: (submitting || cooldownSeconds > 0) ? '#555' : '#c8e600',
                  border: 'none',
                  color: (submitting || cooldownSeconds > 0) ? '#aaa' : '#000',
                  borderRadius: '6px',
                  cursor: (submitting || cooldownSeconds > 0) ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontWeight: 700,
                  opacity: (submitting || cooldownSeconds > 0) ? 0.6 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                {submitting ? 'Đang gửi...' : cooldownSeconds > 0 ? `Chờ (${cooldownSeconds}s)` : 'Xác nhận mua'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VNPay QR Modal ── */}
      {showVnpayModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            width: '100%', maxWidth: '380px', padding: '28px 24px',
            textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          }}>
            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#005BAA', borderRadius: '8px', padding: '6px 16px', marginBottom: '12px',
              }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '18px', letterSpacing: '2px' }}>VNPAY</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#111' }}>Quét mã để thanh toán</h3>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#666' }}>
                Dùng app ngân hàng hoặc ví điện tử hỗ trợ VNPay để quét
              </p>
            </div>

            {/* QR Code */}
            {vnpayQR ? (
              <div style={{
                border: '3px solid #005BAA', borderRadius: '12px',
                padding: '10px', display: 'inline-block', marginBottom: '16px',
              }}>
                <img src={vnpayQR} alt="VNPay QR" style={{ width: '220px', height: '220px', display: 'block' }} />
              </div>
            ) : (
              <div style={{ width: '220px', height: '220px', background: '#f0f0f0', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '13px' }}>
                Đang tải mã QR...
              </div>
            )}

            {/* Total */}
            <div style={{
              background: '#f8f8f8', borderRadius: '8px', padding: '10px 16px',
              marginBottom: '16px', fontSize: '14px', color: '#333',
            }}>
              Tổng thanh toán: <strong style={{ color: '#e5001a', fontSize: '16px' }}>{fmt(total)}</strong>
            </div>

            {/* Notice */}
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px', lineHeight: 1.5 }}>
              ⚠️ Mã QR có hiệu lực trong <strong>15 phút</strong>. Sau khi thanh toán, bạn sẽ được chuyển đến trang xác nhận đơn hàng.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {vnpayUrl && (
                <a
                  href={vnpayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px',
                    background: '#005BAA', color: '#fff',
                    borderRadius: '8px', fontWeight: 700, fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  Mở trang thanh toán VNPay →
                </a>
              )}
              <button
                type="button"
                onClick={() => { setShowVnpayModal(false); navigate('/profile?tab=orders') }}
                style={{
                  padding: '11px', background: '#f5f5f5', border: '1px solid #ddd',
                  borderRadius: '8px', color: '#333', fontWeight: 600, fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Đã thanh toán xong → Xem đơn hàng
              </button>
              <button
                type="button"
                onClick={() => setShowVnpayModal(false)}
                style={{
                  padding: '9px', background: 'transparent', border: 'none',
                  color: '#999', fontSize: '12px', cursor: 'pointer',
                }}
              >
                Hủy thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
