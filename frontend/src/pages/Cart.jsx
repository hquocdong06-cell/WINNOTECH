import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { setCart, clearCart, removeFromCart, selectCartItems, clearGuestCartAPI } from '../redux/cartSlice'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/cart.css'

import { API_BASE as API_URL } from '../services/apiService';

function formatPrice(price) {
  if (!price && price !== 0) return '0đ'
  return Number(price).toLocaleString('vi-VN') + 'đ'
}

function getProductImage(item) {
  const url = item.AnhSP?.[0]?.url || item.product?.thumnail || ''
  if (!url) return null
  return url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`
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
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing]         = useState(false)

  // Checkbox selection state
  const [checkedIds, setCheckedIds]     = useState(new Set())  // Set<cartItemId>

  // Cart từ localStorage (dùng khi chưa login)
  const localCartItems = useSelector(selectCartItems)

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
      const fetchedItems = data.data || []
      setCartItems(fetchedItems)
      // Mặc định tick chọn tất cả sau khi fetch
      setCheckedIds(new Set(fetchedItems.map(d => d.cartItem?._id).filter(Boolean)))

      // Sync về Redux store để header cart badge cập nhật đúng
      const reduxItems = fetchedItems.map(d => ({
        cartItemId: d.cartItem?._id,
        product_id: d.product?._id,
        variant_id: d.cartItem?.variant_id,
        name:       d.product?.name || 'Sản phẩm',
        sku:        d.variant?.sku || d.product?.sku || d.product?.code || '',
        variantName:d.variant?.variant_name && d.variant?.variant_name !== 'Mặc định' ? d.variant.variant_name : '',
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
    if (newQty < 1) {
      await handleRemoveItem(cartItemId)
      return
    }

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
        // Xóa khỏi checkedIds
        setCheckedIds(prev => { const s = new Set(prev); s.delete(cartItemId); return s })
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
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { action: 'remove', cartItemId } }))
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  // ── Xóa tất cả giỏ hàng (Hỗ trợ cả Đã login & Guest) ────────────────
  const handleExecuteClearCart = async () => {
    setClearing(true)
    try {
      if (isLoggedIn) {
        try {
          const res = await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            credentials: 'include',
          })
          const data = await res.json()
          if (!data.success && res.status !== 401) {
            console.warn('Clear cart server message:', data.message)
          }
        } catch (serverErr) {
          console.warn('Lỗi gọi API xóa giỏ hàng server:', serverErr)
        }
      }

      // Xóa giỏ guest API nếu có
      try {
        await dispatch(clearGuestCartAPI()).unwrap()
      } catch {
        // ignore
      }

      // Luôn xóa sạch Redux store & localStorage phía client
      dispatch(clearCart())
      setCartItems([])
      setCheckedIds(new Set())
      toast.success('Đã xóa tất cả sản phẩm trong giỏ hàng!', { position: 'bottom-right' })
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      setShowClearConfirm(false)
    } catch (err) {
      console.error('Lỗi khi xóa giỏ hàng:', err)
      dispatch(clearCart())
      setCartItems([])
      setCheckedIds(new Set())
      toast.success('Đã xóa tất cả sản phẩm trong giỏ hàng!', { position: 'bottom-right' })
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      setShowClearConfirm(false)
    } finally {
      setClearing(false)
    }
  }

  // ── Thao tác giỏ hàng cho Guest (Chưa login) ─────────────────────────
  const handleLocalQuantityChange = (product_id, variant_id, newQty) => {
    if (newQty < 1) {
      handleLocalRemoveItem(product_id, variant_id)
      return
    }
    dispatch(updateQuantity({ product_id, variant_id, quantity: newQty }))
  }

  const handleLocalRemoveItem = (product_id, variant_id) => {
    dispatch(removeFromCart({ product_id, variant_id }))
    toast.info('Đã xóa sản phẩm khỏi giỏ hàng tạm thời', { position: 'bottom-right', autoClose: 1500 })
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

  // ── Checkbox helpers ──────────────────────────────────────────────────
  const allIds        = cartItems.map(i => i.cartItem?._id).filter(Boolean)
  const isAllChecked  = allIds.length > 0 && allIds.every(id => checkedIds.has(id))
  const isSomeChecked = allIds.some(id => checkedIds.has(id))

  const toggleItem = (cartItemId) => {
    setCheckedIds(prev => {
      const s = new Set(prev)
      if (s.has(cartItemId)) s.delete(cartItemId)
      else s.add(cartItemId)
      return s
    })
  }

  const toggleSelectAll = () => {
    if (isAllChecked) setCheckedIds(new Set())
    else setCheckedIds(new Set(allIds))
  }

  // ── Tính tổng — CHỈ trên sản phẩm đã được tick ────────────────────────
  const getItemPrice = (item) =>
    item.variant?.sale_price > 0 ? item.variant.sale_price : (item.variant?.price || 0)

  const selectedItems   = cartItems.filter(i => checkedIds.has(i.cartItem?._id))
  const subtotal        = selectedItems.reduce((sum, item) =>
    sum + getItemPrice(item) * (item.cartItem?.quantity || 1), 0)
  const shipping        = selectedItems.length === 0 ? 0 : (subtotal >= 1000000 ? 0 : 50000)
  const total           = subtotal - appliedDiscount + shipping

  // ── Checkout ──────────────────────────────────────────────────────────
  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để tiến hành mua hàng!')
      navigate('/login?redirect=/checkout')
      return
    }
    if (selectedItems.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!', { position: 'bottom-right' })
      return
    }
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

  // Chưa đăng nhập → hiện giỏ hàng từ localStorage (chế độ xem)
  if (!isLoggedIn) {
    const localTotal = localCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const localShipping = localTotal >= 1000000 ? 0 : 50000

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h1 className="cart-title" style={{ margin: 0 }}>GIỎ HÀNG CỦA BẠN</h1>
              {localCartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="btn-clear-all-cart"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  Xóa tất cả giỏ hàng
                </button>
              )}
            </div>

            {/* Banner gợi ý đăng nhập */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '1px solid #c8e600',
              borderRadius: '8px',
              padding: '12px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span style={{ color: '#c8e600', fontSize: '14px' }}>
                🔐 Bạn đang xem giỏ hàng tạm thời. Đăng nhập để lưu và thanh toán!
              </span>
              <Link to="/login" style={{
                background: '#c8e600', color: '#000',
                padding: '8px 20px', borderRadius: '4px',
                fontWeight: 700, fontSize: '13px', textDecoration: 'none'
              }}>ĐĂNG NHẬP NGAY</Link>
            </div>

            {localCartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-icon">🛒</div>
                <p>Giỏ hàng của bạn đang trống</p>
                <Link to="/" className="btn-continue-shopping">TIẾP TỤC MUA SẮM</Link>
              </div>
            ) : (
              <div className="cart-grid">
                <div className="cart-items">
                  <div className="cart-table-header">
                    <span>Hình ảnh</span>
                    <span>Sản phẩm</span>
                    <span style={{ textAlign: 'right' }}>Đơn giá</span>
                    <span style={{ textAlign: 'center' }}>Số lượng</span>
                    <span style={{ textAlign: 'right' }}>Thành tiền</span>
                    <span></span>
                  </div>
                  {localCartItems.map((item, idx) => (
                    <div key={`${item.product_id}-${item.variant_id}-${idx}`} className="cart-item no-checkbox">
                      <div className="item-image" style={{ background: '#1a1a1a', borderRadius: '6px', overflow: 'hidden' }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '28px' }}>📦</div>
                        }
                      </div>
                      <div className="item-info">
                        <div className="item-name">
                          <Link
                            to={`/product/${item.sku || item.product_id}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                            onMouseEnter={e => e.target.style.color = '#c8e600'}
                            onMouseLeave={e => e.target.style.color = 'inherit'}
                          >
                            {item.name}
                          </Link>
                        </div>
                        {(item.sku || item.variantName) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                            {item.sku && (
                              <div style={{ fontSize: '11.5px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: 600, color: '#6b7280' }}>SKU:</span>
                                <span style={{ fontFamily: 'monospace', color: '#d1d5db', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>
                                  {item.sku}
                                </span>
                              </div>
                            )}
                            {item.variantName && (
                              <div style={{ fontSize: '11.5px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: 600, color: '#6b7280' }}>Biến thể:</span>
                                <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '1px 7px', borderRadius: '4px', color: '#f3f4f6' }}>
                                  {item.variantName}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="item-price">{formatPrice(item.price)}</div>
                      <div className="item-quantity">
                        <button
                          onClick={() => handleLocalQuantityChange(item.product_id, item.variant_id, item.quantity - 1)}
                          className="qty-btn"
                        >−</button>
                        <input
                          type="number"
                          value={item.quantity}
                          min="0"
                          onChange={(e) => {
                            const v = parseInt(e.target.value)
                            if (isNaN(v) || v <= 0) {
                              handleLocalRemoveItem(item.product_id, item.variant_id)
                            } else {
                              handleLocalQuantityChange(item.product_id, item.variant_id, v)
                            }
                          }}
                          className="qty-input"
                        />
                        <button
                          onClick={() => handleLocalQuantityChange(item.product_id, item.variant_id, item.quantity + 1)}
                          className="qty-btn"
                        >+</button>
                      </div>
                      <div className="item-subtotal">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => handleLocalRemoveItem(item.product_id, item.variant_id)}
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
                  <Link to="/" className="btn-continue-shopping-link">← TIẾP TỤC MUA SẮM</Link>
                </div>

                <aside className="order-summary">
                  <h2>TÓM TẮT ĐƠN HÀNG</h2>
                  <div className="summary-item">
                    <span>Tạm tính ({localCartItems.length} sản phẩm)</span>
                    <span>{formatPrice(localTotal)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Phí vận chuyển</span>
                    <span style={{ color: localShipping === 0 ? '#22c55e' : 'inherit' }}>
                      {localShipping === 0 ? 'Miễn phí' : formatPrice(localShipping)}
                    </span>
                  </div>
                  <div className="summary-total">
                    <span>Tổng cộng</span>
                    <span className="total-price">{formatPrice(localTotal + localShipping)}</span>
                  </div>
                  <Link to="/login" className="btn-checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                    ĐĂNG NHẬP ĐỂ THANH TOÁN
                  </Link>
                </aside>
              </div>
            )}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h1 className="cart-title" style={{ margin: 0 }}>GIỎ HÀNG CỦA BẠN</h1>
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="btn-clear-all-cart"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                Xóa tất cả giỏ hàng
              </button>
            )}
          </div>

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
                {/* HEADER ROW: Table Header */}
                <div className="cart-table-header has-checkbox">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllChecked}
                      ref={el => { if (el) el.indeterminate = isSomeChecked && !isAllChecked }}
                      onChange={toggleSelectAll}
                      style={{ width: '17px', height: '17px', accentColor: '#c8e600', cursor: 'pointer', display: 'block' }}
                      title="Chọn tất cả"
                    />
                  </div>
                  <span>Hình ảnh</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Sản phẩm</span>
                    <span style={{ fontSize: '11px', color: '#888', textTransform: 'none', fontWeight: 500 }}>
                      ({allIds.length}{checkedIds.size > 0 && checkedIds.size < allIds.length ? ` - ${checkedIds.size} đã chọn` : ''})
                    </span>
                  </span>
                  <span style={{ textAlign: 'right' }}>Đơn giá</span>
                  <span style={{ textAlign: 'center' }}>Số lượng</span>
                  <span style={{ textAlign: 'right' }}>Thành tiền</span>
                  <span></span>
                </div>

                {cartItems.map((item) => {
                  const cartItemId = item.cartItem._id
                  const price      = getItemPrice(item)
                  const qty        = item.cartItem?.quantity || 1
                  const img        = getProductImage(item)
                  const isUpdating = updatingId === cartItemId
                  const isDeleting = deletingId === cartItemId
                  const isChecked  = checkedIds.has(cartItemId)
                  const specStr    = (() => {
                    const varAttrs = item.variant?.Attributes || []
                    if (!varAttrs.length) return ''
                    const pName = (item.product?.name || '').toLowerCase()
                    const catName = (item.product?.cat_id?.name || item.product?.cat_id?.slug || '').toLowerCase()
                    const isNoColorCategory = catName.includes('cpu') || catName.includes('vga') || catName.includes('gpu') ||
                                              catName.includes('ram') || catName.includes('ssd') || catName.includes('bo mạch') ||
                                              catName.includes('mainboard') || pName.includes('cpu') || pName.includes('ryzen') || pName.includes('intel')

                    const filtered = varAttrs.filter(a => {
                      const attrName = (a.attribute_name || a.name || '').toLowerCase()
                      const attrVal  = (a.value_name || a.value || '').toLowerCase()
                      if (attrVal.includes('mặc định') || attrVal.includes('default') || attrVal === 'tiêu chuẩn') return false
                      if (isNoColorCategory) {
                        if (attrName.includes('màu') || attrName.includes('color')) return false
                        if (attrVal.includes('đen') || attrVal.includes('black') || attrVal.includes('trắng') || attrVal.includes('white')) return false
                      }
                      return true
                    })
                    return filtered.slice(0, 3).map(a => a.value_name || a.value).join(' • ')
                  })()

                  return (
                    <div
                      key={cartItemId}
                      className="cart-item has-checkbox"
                      style={{
                        opacity: isDeleting ? 0.4 : 1,
                        transition: 'opacity 0.3s',
                        background: isChecked ? 'rgba(200,230,0,0.03)' : 'transparent',
                        borderColor: isChecked ? 'rgba(200,230,0,0.15)' : undefined
                      }}
                    >
                      {/* CHECKBOX */}
                      <div style={{ display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(cartItemId)}
                          style={{ width: '17px', height: '17px', accentColor: '#c8e600', cursor: 'pointer' }}
                        />
                      </div>

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
                            to={`/product/${item.product?.slug || item.product?._id}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                            onMouseEnter={e => e.target.style.color = '#c8e600'}
                            onMouseLeave={e => e.target.style.color = 'inherit'}
                          >
                            {item.product?.name || 'Sản phẩm'}
                          </Link>
                        </div>

                        {/* Display SKU & Biến thể */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                          {(item.variant?.sku || item.product?.sku || item.product?.code) && (
                            <div style={{ fontSize: '11.5px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontWeight: 600, color: '#6b7280' }}>SKU:</span>
                              <span style={{ fontFamily: 'monospace', color: '#d1d5db', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>
                                {item.variant?.sku || item.product?.sku || item.product?.code}
                              </span>
                            </div>
                          )}

                          {((item.variant?.variant_name && item.variant?.variant_name !== 'Mặc định') || specStr) && (
                            <div style={{ fontSize: '11.5px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontWeight: 600, color: '#6b7280' }}>Biến thể:</span>
                              <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '1px 7px', borderRadius: '4px', color: '#f3f4f6' }}>
                                {item.variant?.variant_name && item.variant?.variant_name !== 'Mặc định'
                                  ? item.variant.variant_name
                                  : specStr}
                              </span>
                            </div>
                          )}
                        </div>
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
                          disabled={isUpdating}
                        >−</button>
                        <input
                          type="number"
                          value={qty}
                          min="0"
                          onChange={(e) => {
                            const v = parseInt(e.target.value)
                            if (isNaN(v) || v <= 0) {
                              handleRemoveItem(cartItemId)
                            } else {
                              handleQuantityChange(cartItemId, v)
                            }
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
                      <div className="item-subtotal">
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

                {/* Sản phẩm đã chọn */}
                <div className="summary-item" style={{ borderBottom: '1px solid #2a2a2a', paddingBottom: '10px', marginBottom: '10px' }}>
                  <span style={{ color: '#aaa', fontSize: '13px' }}>Sản phẩm đã chọn</span>
                  <span style={{ color: checkedIds.size > 0 ? '#c8e600' : '#888', fontWeight: 700 }}>
                    {checkedIds.size} / {cartItems.length}
                  </span>
                </div>

                <div className="summary-item">
                  <span>Tạm tính ({checkedIds.size} sản phẩm)</span>
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
                    {selectedItems.length === 0 ? '—' : shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                  </span>
                </div>

                {selectedItems.length > 0 && shipping > 0 && (
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
                <button
                  className="btn-checkout"
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  style={{
                    opacity: selectedItems.length === 0 ? 0.45 : 1,
                    cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                  </svg>
                  {selectedItems.length === 0 ? 'CHỌN SẢN PHẨM ĐỂ THANH TOÁN' : `THANH TOÁN (${checkedIds.size} SẢN PHẨM)`}
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

      {/* MODAL XÁC NHẬN XÓA TOÀN BỘ GIỎ HÀNG */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#18181b',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '28px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#ef4444',
              fontSize: '24px'
            }}>
              🗑️
            </div>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Xác nhận xóa toàn bộ giỏ hàng?
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
              Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng? Thao tác này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
                style={{
                  flex: 1,
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#27272a',
                  color: '#e4e4e7',
                  border: '1px solid #3f3f46',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteClearCart}
                disabled={clearing}
                style={{
                  flex: 1,
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  opacity: clearing ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {clearing ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </DefaultLayout>
  )
}
