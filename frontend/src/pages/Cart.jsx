import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { setCart, clearCart } from '../redux/cartSlice'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/cart.css'

const API_URL = 'http://localhost:3000'

function formatPrice(price) {
  if (!price && price !== 0) return '0đ'
  return Number(price).toLocaleString('vi-VN') + 'đ'
}

function getProductImage(item) {
  const url = item.AnhSP?.[0]?.url || item.product?.thumnail || ''
  if (!url) return null
  return url.startsWith('http') ? url : `${API_URL}${url}`
}

export default function Cart() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [cartItems, setCartItems]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [isLoggedIn, setIsLoggedIn]     = useState(true)
  const [updatingId, setUpdatingId]     = useState(null)   // cartItemId đang update
  const [deletingId, setDeletingId]     = useState(null)   // cartItemId đang xóa
  const [error, setError]               = useState(null)

  const [discountCode, setDiscountCode]     = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [discountMsg, setDiscountMsg]       = useState('')

  // ── Fetch giỏ hàng từ backend ──────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/cart`, {
        credentials: 'include',  // gửi cookie JWT
      })
      const data = await res.json()

      if (res.status === 401) {
        setIsLoggedIn(false)
        setLoading(false)
        return
      }

      if (!data.success) {
        setError(data.message || 'Không thể tải giỏ hàng')
        setLoading(false)
        return
      }

      setIsLoggedIn(true)
      setCartItems(data.data || [])

      // Sync về Redux store để header cart badge cập nhật đúng
      const reduxItems = (data.data || []).map(d => ({
        product_id: d.product?._id,
        variant_id: d.cartItem?.variant_id,
        name:       d.product?.name || 'Sản phẩm',
        price:      d.variant?.sale_price > 0 ? d.variant.sale_price : (d.variant?.price || 0),
        quantity:   d.cartItem?.quantity || 1,
        image:      getProductImage(d),
      }))
      dispatch(setCart(reduxItems))
    } catch (err) {
      setError('Không thể kết nối server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // ── Cập nhật số lượng ──────────────────────────────────────────────────
  const handleQuantityChange = async (cartItemId, newQty) => {
    if (newQty < 1) return

    const item = cartItems.find(i => i.cartItem?._id === cartItemId)
    if (item && item.variant && item.variant.stock_quantity !== undefined) {
      if (newQty > item.variant.stock_quantity) {
        toast.error(`Không thể cập nhật! Chỉ còn ${item.variant.stock_quantity} sản phẩm trong kho.`, { position: 'bottom-right' })
        return
      }
    }

    setUpdatingId(cartItemId)
    try {
      const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      })
      const data = await res.json()
      if (data.success) {
        setCartItems(prev =>
          prev.map(item =>
            item.cartItem._id === cartItemId
              ? { ...item, cartItem: { ...item.cartItem, quantity: newQty } }
              : item
          )
        )
        // Sync Redux
        dispatch(setCart(
          cartItems.map(d => ({
            product_id: d.product?._id,
            variant_id: d.cartItem?.variant_id,
            name:       d.product?.name || 'Sản phẩm',
            price:      d.variant?.sale_price > 0 ? d.variant.sale_price : (d.variant?.price || 0),
            quantity:   d.cartItem._id === cartItemId ? newQty : d.cartItem?.quantity,
            image:      getProductImage(d),
          }))
        ))
      } else {
        toast.error(data.message || 'Lỗi khi cập nhật số lượng!', { position: 'bottom-right' })
      }
    } catch {
      toast.error('Lỗi kết nối tới máy chủ!', { position: 'bottom-right' })
    } finally {
      setUpdatingId(null)
    }
  }

  // ── Xóa sản phẩm ──────────────────────────────────────────────────────
  const handleRemoveItem = async (cartItemId) => {
    setDeletingId(cartItemId)
    try {
      const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        const newItems = cartItems.filter(item => item.cartItem._id !== cartItemId)
        setCartItems(newItems)
        // Sync Redux
        dispatch(setCart(
          newItems.map(d => ({
            product_id: d.product?._id,
            variant_id: d.cartItem?.variant_id,
            name:       d.product?.name || 'Sản phẩm',
            price:      d.variant?.sale_price > 0 ? d.variant.sale_price : (d.variant?.price || 0),
            quantity:   d.cartItem?.quantity,
            image:      getProductImage(d),
          }))
        ))
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  // ── Mã giảm giá (demo) ────────────────────────────────────────────────
  const handleApplyDiscount = () => {
    if (discountCode === 'SAVE1M') {
      setAppliedDiscount(1000000)
      setDiscountMsg('✅ Đã áp dụng: Giảm 1.000.000đ')
    } else if (discountCode === 'SAVE500K') {
      setAppliedDiscount(500000)
      setDiscountMsg('✅ Đã áp dụng: Giảm 500.000đ')
    } else if (discountCode.trim()) {
      setAppliedDiscount(0)
      setDiscountMsg('❌ Mã giảm giá không hợp lệ')
    }
  }

  // ── Tính tổng ─────────────────────────────────────────────────────────
  const getItemPrice = (item) =>
    item.variant?.sale_price > 0 ? item.variant.sale_price : (item.variant?.price || 0)

  const subtotal  = cartItems.reduce((sum, item) =>
    sum + getItemPrice(item) * (item.cartItem?.quantity || 1), 0)
  const shipping  = subtotal >= 1000000 ? 0 : 50000
  const total     = subtotal - appliedDiscount + shipping

  // ── Checkout ──────────────────────────────────────────────────────────
  const handleCheckout = () => {
    navigate('/checkout')
  }

  // ─── RENDER STATES ────────────────────────────────────────────────────

  // Đang tải
  if (loading) {
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            width: 44, height: 44,
            border: '3px solid #2a2a2a',
            borderTop: '3px solid #c8e600',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <span style={{ color: '#aaa', fontSize: '14px' }}>Đang tải giỏ hàng...</span>
        </div>
      </DefaultLayout>
    )
  }

  // Chưa đăng nhập
  if (!isLoggedIn) {
    return (
      <DefaultLayout>
        <div className="breadcrumb-section">
          <div className="breadcrumb-inner">
            <Link to="/">Trang chủ</Link><span>/</span>
            <span>Giỏ hàng</span>
          </div>
        </div>
        <div className="cart-section">
          <div className="section-inner">
            <div className="empty-cart" style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔒</div>
              <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>Vui lòng đăng nhập</h2>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>Bạn cần đăng nhập để xem giỏ hàng của mình</p>
              <Link to="/auth" className="btn-continue-shopping" style={{
                display: 'inline-block',
                background: '#c8e600',
                color: '#000',
                padding: '12px 32px',
                borderRadius: '4px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '14px'
              }}>
                ĐĂNG NHẬP NGAY
              </Link>
            </div>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  // Lỗi server
  if (error) {
    return (
      <DefaultLayout>
        <div className="cart-section">
          <div className="section-inner">
            <div className="empty-cart" style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>⚠️</div>
              <p style={{ color: '#aaa', marginBottom: '24px' }}>{error}</p>
              <button onClick={fetchCart} style={{
                background: '#c8e600', color: '#000', border: 'none',
                padding: '10px 28px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer'
              }}>Thử lại</button>
            </div>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      {/* BREADCRUMB */}
      <div className="breadcrumb-section">
        <div className="breadcrumb-inner">
          <Link to="/">Trang chủ</Link><span>/</span>
          <Link to="/cart">Giỏ hàng</Link>
          {cartItems.length > 0 && (
            <><span>/</span><span style={{ color: 'var(--accent-color)' }}>{cartItems.length} sản phẩm</span></>
          )}
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
              <Link to="/" className="btn-continue-shopping">TIẾP TỤC MUA SẮM</Link>
            </div>
          ) : (
            <div className="cart-grid">
              {/* LEFT: CART ITEMS */}
              <div className="cart-items">
                {cartItems.map((item) => {
                  const cartItemId = item.cartItem._id
                  const price      = getItemPrice(item)
                  const qty        = item.cartItem?.quantity || 1
                  const img        = getProductImage(item)
                  const isUpdating = updatingId === cartItemId
                  const isDeleting = deletingId === cartItemId
                  const varAttrs   = item.variant?.Attributes || []
                  const specStr    = varAttrs.slice(0, 3).map(a => a.value).join(' • ')

                  return (
                    <div
                      key={cartItemId}
                      className="cart-item"
                      style={{ opacity: isDeleting ? 0.4 : 1, transition: 'opacity 0.3s' }}
                    >
                      {/* ẢNH */}
                      <div className="item-image" style={{ background: '#1a1a1a', borderRadius: '6px', overflow: 'hidden' }}>
                        {img
                          ? <img src={img} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '28px' }}>📦</div>
                        }
                      </div>

                      {/* THÔNG TIN */}
                      <div className="item-info">
                        <div className="item-name">
                          <Link
                            to={`/products/${item.product?.slug || item.product?._id}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                            onMouseEnter={e => e.target.style.color = '#c8e600'}
                            onMouseLeave={e => e.target.style.color = 'inherit'}
                          >
                            {item.product?.name || 'Sản phẩm'}
                          </Link>
                        </div>
                        {specStr && (
                          <div className="item-specs">{specStr}</div>
                        )}
                        {/* Hiển thị giá sale nếu có */}
                        {item.variant?.sale_price > 0 && item.variant.sale_price < item.variant.price && (
                          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                            <span style={{ textDecoration: 'line-through' }}>{formatPrice(item.variant.price)}</span>
                            <span style={{ color: '#ef4444', marginLeft: '6px' }}>
                              -{Math.round((1 - item.variant.sale_price / item.variant.price) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* GIÁ */}
                      <div className="item-price">
                        {formatPrice(price)}
                      </div>

                      {/* SỐ LƯỢNG */}
                      <div className="item-quantity" style={{ opacity: isUpdating ? 0.6 : 1 }}>
                        <button
                          onClick={() => handleQuantityChange(cartItemId, qty - 1)}
                          className="qty-btn"
                          disabled={isUpdating || qty <= 1}
                        >−</button>
                        <input
                          type="number"
                          value={qty}
                          min="1"
                          onChange={(e) => {
                            const v = parseInt(e.target.value)
                            if (v > 0) handleQuantityChange(cartItemId, v)
                          }}
                          className="qty-input"
                          disabled={isUpdating}
                        />
                        <button
                          onClick={() => handleQuantityChange(cartItemId, qty + 1)}
                          className="qty-btn"
                          disabled={isUpdating}
                        >+</button>
                      </div>

                      {/* THÀNH TIỀN */}
                      <div className="item-subtotal" style={{ minWidth: '110px', textAlign: 'right', fontWeight: 700, color: '#c8e600', fontSize: '14px' }}>
                        {formatPrice(price * qty)}
                      </div>

                      {/* NÚT XÓA */}
                      <button
                        onClick={() => handleRemoveItem(cartItemId)}
                        className="btn-remove"
                        title="Xóa sản phẩm"
                        disabled={isDeleting}
                        style={{ opacity: isDeleting ? 0.5 : 1 }}
                      >
                        {isDeleting
                          ? <span style={{ fontSize: '12px', animation: 'spin 0.6s linear infinite', display: 'inline-block' }}>⏳</span>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        }
                      </button>
                    </div>
                  )
                })}

                <Link to="/" className="btn-continue-shopping-link">← TIẾP TỤC MUA SẮM</Link>
              </div>

              {/* RIGHT: ORDER SUMMARY */}
              <aside className="order-summary">
                <h2>TÓM TẮT ĐƠN HÀNG</h2>

                <div className="summary-item">
                  <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="summary-item">
                  <span>Giảm giá</span>
                  <span className="discount">
                    {appliedDiscount > 0 ? `-${formatPrice(appliedDiscount)}` : '—'}
                  </span>
                </div>

                <div className="summary-item">
                  <span>Phí vận chuyển</span>
                  <span style={{ color: shipping === 0 ? '#22c55e' : 'inherit' }}>
                    {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                  </span>
                </div>

                {shipping > 0 && (
                  <div style={{
                    fontSize: '11px', color: '#aaa', marginBottom: '12px',
                    padding: '8px', background: '#1a1a1a', borderRadius: '4px'
                  }}>
                    💡 Mua thêm <strong style={{ color: '#c8e600' }}>{formatPrice(1000000 - subtotal)}</strong> để được miễn phí ship
                  </div>
                )}

                {/* MÃ GIẢM GIÁ */}
                <div className="discount-section">
                  <label>Mã giảm giá</label>
                  <div className="discount-input-group">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value.toUpperCase())
                        setDiscountMsg('')
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                      className="discount-input"
                    />
                    <button onClick={handleApplyDiscount} className="btn-apply">ÁP DỤNG</button>
                  </div>
                  {discountMsg && (
                    <div style={{ fontSize: '12px', marginTop: '6px', color: discountMsg.startsWith('✅') ? '#22c55e' : '#ef4444' }}>
                      {discountMsg}
                    </div>
                  )}
                  <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Mã test: SAVE1M · SAVE500K
                  </small>
                </div>

                {/* TỔNG CỘNG */}
                <div className="summary-total">
                  <span>Tổng cộng</span>
                  <span className="total-price">{formatPrice(total)}</span>
                </div>

                {/* NÚT THANH TOÁN */}
                <button className="btn-checkout" onClick={handleCheckout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                  </svg>
                  TIẾN HÀNH THANH TOÁN
                </button>

                {/* ĐẶC QUYỀN */}
                <div className="summary-benefits">
                  <div className="benefit-item">
                    <span className="benefit-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13" rx="1"/>
                        <path d="M16 8h4l3 3v4h-7V8z"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
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
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="m9 12 2 2 4-4"/>
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
                        <path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/>
                        <path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/>
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
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </DefaultLayout>
  )
}
