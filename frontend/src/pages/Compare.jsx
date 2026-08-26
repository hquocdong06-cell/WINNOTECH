import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'
import DefaultLayout from '../layouts/DefaultLayout'
import { compareAPI } from '../services/apiService'
import { cartAPI } from '../services/apiService'
import '../assets/styles/compare.css'

import { API_BASE as API_URL } from '../services/apiService';

const fmt = (n) => {
  if (!n && n !== 0) return 'Liên hệ'
  return Number(n).toLocaleString('vi-VN') + 'đ'
}

const getImg = (product) => {
  if (!product) return ''
  const imgs = product.images || []
  if (imgs.length > 0) {
    const url = imgs[0].url || imgs[0]
    return url?.startsWith('http') ? url : `${API_URL}${url}`
  }
  if (product.thumnail) {
    return product.thumnail.startsWith('http') ? product.thumnail : `${API_URL}${product.thumnail}`
  }
  return ''
}

const getPrice = (product) => {
  const vs = product?.Variants || product?.variants || []
  const def = vs.find(v => v.variant_name === 'Mặc định') || vs[0]
  return def?.sale_price > 0 ? def.sale_price : (def?.price || 0)
}

const getOriginalPrice = (product) => {
  const vs = product?.Variants || product?.variants || []
  const def = vs.find(v => v.variant_name === 'Mặc định') || vs[0]
  if (def?.sale_price > 0 && def?.price > def?.sale_price) return def.price
  return null
}

const getVariantId = (product) => {
  const vs = product?.Variants || product?.variants || []
  const def = vs.find(v => v.variant_name === 'Mặc định') || vs[0]
  return def?._id
}

// Danh sách các specs cần hiển thị trong bảng so sánh
const SPEC_ROWS = [
  { group: 'Tổng quan', rows: [
    { label: 'Thương hiệu',   key: p => p.brand_id?.name || '—' },
    { label: 'Danh mục',      key: p => p.category_id?.name || '—' },
    { label: 'Mô tả ngắn',    key: p => p.short_desc || '—' },
    { label: 'Trạng thái',    key: p => p.status === 'active' ? '✅ Đang bán' : '❌ Ngừng bán' },
  ]},
  { group: 'Giá & Kho', rows: [
    { label: 'Giá bán',           key: p => fmt(getPrice(p)), compare: 'number', getValue: p => getPrice(p) },
    { label: 'Giá gốc',          key: p => getOriginalPrice(p) ? fmt(getOriginalPrice(p)) : '—' },
    { label: 'Số biến thể',       key: p => ((p.Variants || p.variants)?.length || 0) + ' biến thể' },
  ]},
  { group: 'Thông số kỹ thuật', rows: [
    { label: 'CPU / Chip',        key: p => p.cpu || p.chip || '—' },
    { label: 'Số nhân / luồng',   key: p => p.cores ? `${p.cores} nhân` : '—' },
    { label: 'Tốc độ xung nhịp',  key: p => p.clock_speed || p.clock || '—' },
    { label: 'TDP / TGP',         key: p => p.tdp || p.tgp || '—' },
    { label: 'Dung lượng',        key: p => p.capacity || p.storage || '—' },
    { label: 'Tốc độ đọc',        key: p => p.read_speed || '—' },
    { label: 'Tốc độ ghi',        key: p => p.write_speed || '—' },
    { label: 'VRAM',              key: p => p.vram || '—' },
    { label: 'Loại RAM',          key: p => p.ram_type || p.memory_type || '—' },
    { label: 'Socket',            key: p => p.socket || '—' },
    { label: 'Form Factor',       key: p => p.form_factor || p.size || '—' },
    { label: 'Kích thước',        key: p => p.dimension || p.dimensions || '—' },
    { label: 'Bảo hành',          key: p => p.warranty || p.bao_hanh || '—' },
  ]},
]

export default function Compare() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [products, setProducts] = useState([])   // max 2 items
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)
  const [addingCart, setAddingCart] = useState(null)

  // Fetch danh sách so sánh khi mount
  const fetchCompare = useCallback(async () => {
    setLoading(true)
    try {
      const data = await compareAPI.getMyList()
      if (data.success) {
        setProducts(data.data || [])
      }
    } catch {
      // Chưa login → so sánh rỗng
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompare()
  }, [fetchCompare])

  // Xóa 1 sản phẩm khỏi danh sách so sánh
  const handleRemove = async (productId) => {
    setRemoving(productId)
    try {
      const data = await compareAPI.toggle(productId)
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== productId))
        toast.info('Đã xóa khỏi danh sách so sánh', { position: 'bottom-right', autoClose: 2000 })
      }
    } catch {
      toast.error('Lỗi kết nối', { position: 'bottom-right' })
    } finally {
      setRemoving(null)
    }
  }

  // Xóa toàn bộ danh sách so sánh
  const handleClearAll = async () => {
    for (const p of products) {
      try { await compareAPI.toggle(p._id) } catch {}
    }
    setProducts([])
    toast.info('Đã xóa toàn bộ danh sách so sánh', { position: 'bottom-right', autoClose: 2000 })
  }

  // Thêm vào giỏ hàng
  const handleAddToCart = async (product) => {
    const variantId = getVariantId(product)
    if (!variantId) {
      toast.warning('Không tìm thấy biến thể', { position: 'bottom-right' })
      return
    }
    setAddingCart(product._id)
    try {
      const data = await cartAPI.addItem(variantId, 1)
      if (data.success) {
        toast.success('Đã thêm vào giỏ hàng!', { position: 'bottom-right', autoClose: 2000 })
      } else {
        toast.error(data.message || 'Lỗi thêm vào giỏ', { position: 'bottom-right' })
      }
    } catch {
      toast.error('Lỗi kết nối server', { position: 'bottom-right' })
    } finally {
      setAddingCart(null)
    }
  }

  // ── Mua ngay trực tiếp (không qua giỏ hàng) ──
  const handleDirectBuyNow = (p) => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để tiến hành mua hàng!', { position: 'bottom-right' })
      navigate('/login?redirect=/checkout')
      return
    }
    const variant = p.Variants?.[0] || {}
    const price = getPrice(p)
    const buyNowItem = {
      cartItem: {
        _id: variant._id || p._id,
        variant_id: variant._id || p._id,
        quantity: 1,
        price: price
      },
      variant: {
        _id: variant._id || p._id,
        price: price,
        sale_price: price,
        variant_name: variant.variant_name || ''
      },
      product: {
        _id: p._id,
        name: p.name
      },
      AnhSP: p.images?.[0] ? [{ url: p.images[0] }] : (p.thumnail ? [{ url: p.thumnail }] : []),
      _localPrice: price,
      _variantId: variant._id || p._id,
      _isBuyNow: true
    }
    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem))
    navigate('/checkout', { state: { buyNowItem } })
  }

  // ── So sánh số: ai cao hơn ai ──
  const getBetterIdx = (row) => {
    if (row.compare !== 'number') return null
    const v0 = row.getValue(products[0])
    const v1 = row.getValue(products[1])
    if (!v0 || !v1) return null
    if (v0 === v1) return null
    // Với giá: thấp hơn = tốt hơn
    if (row.label.includes('Giá')) return v0 < v1 ? 0 : 1
    return v0 > v1 ? 0 : 1
  }

  // ── Render ──
  return (
    <DefaultLayout>
      <div className="compare-page">
        <div className="compare-inner">

          {/* Header */}
          <div className="compare-header">
            <h1 className="compare-title">
              So sánh <span>sản phẩm</span>
            </h1>
            {products.length > 0 && (
              <button className="compare-clear-btn" onClick={handleClearAll}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="compare-loading">
              <div className="compare-spinner" />
              Đang tải danh sách so sánh...
            </div>
          )}

          {/* Empty */}
          {!loading && products.length === 0 && (
            <div className="compare-empty">
              <div className="compare-empty-icon">⚖️</div>
              <h2>Chưa có sản phẩm nào để so sánh</h2>
              <p>Hãy thêm sản phẩm vào danh sách so sánh từ các trang sản phẩm</p>
              <Link to="/cpu" className="compare-empty-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
                Xem sản phẩm
              </Link>
            </div>
          )}

          {/* 1 product — chờ thêm sản phẩm thứ 2 */}
          {!loading && products.length === 1 && (
            <>
              <div className="compare-one-product">
                {/* Product 1 */}
                <div style={{
                  background: '#111', border: '1px solid #222', borderRadius: '16px',
                  padding: '28px 20px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center', position: 'relative'
                }}>
                  <button
                    className="compare-remove-btn"
                    onClick={() => handleRemove(products[0]._id)}
                    disabled={removing === products[0]._id}
                    title="Xóa"
                  >✕</button>
                  <img
                    src={getImg(products[0])}
                    alt={products[0].name}
                    className="compare-product-img"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <div className="compare-product-name">{products[0].name}</div>
                  <div className="compare-product-price">{fmt(getPrice(products[0]))}</div>
                  <Link to={`/product/${products[0].slug || products[0]._id}`} className="compare-product-btn">Xem chi tiết</Link>
                </div>

                {/* Slot chờ */}
                <div className="compare-product-slot">
                  <div className="compare-product-slot-icon">➕</div>
                  <h3>Chọn sản phẩm thứ 2</h3>
                  <p>Vào trang sản phẩm và nhấn nút "So sánh" để thêm vào đây</p>
                  <Link to="/cpu" style={{
                    padding: '10px 20px', background: 'transparent',
                    border: '1px solid #d4ff00', color: '#d4ff00',
                    borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none'
                  }}>Xem sản phẩm →</Link>
                </div>
              </div>

              <p style={{ textAlign: 'center', color: '#555', fontSize: '13px' }}>
                Hãy thêm 1 sản phẩm cùng danh mục để bắt đầu so sánh
              </p>
            </>
          )}

          {/* 2 products — hiển thị bảng so sánh đầy đủ */}
          {!loading && products.length === 2 && (
            <>
              {/* Header cards */}
              <div className="compare-products-header">
                <div className="compare-label-col">
                  <span className="compare-label-col-title">Thông số</span>
                </div>

                {products.map((p, idx) => {
                  const origPrice = getOriginalPrice(p)
                  return (
                    <div className="compare-product-header-card" key={p._id}>
                      <button
                        className="compare-remove-btn"
                        onClick={() => handleRemove(p._id)}
                        disabled={removing === p._id}
                        title="Xóa khỏi so sánh"
                      >
                        {removing === p._id ? '...' : '✕'}
                      </button>

                      <img
                        src={getImg(p)}
                        alt={p.name}
                        className="compare-product-img"
                        onError={e => { e.target.style.display = 'none' }}
                      />

                      <div className="compare-product-name">{p.name}</div>

                      {origPrice && (
                        <div className="compare-product-original-price">{fmt(origPrice)}</div>
                      )}
                      <div className="compare-product-price">{fmt(getPrice(p))}</div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                          className="compare-product-btn"
                          onClick={() => handleDirectBuyNow(p)}
                          style={{ fontSize: '12px', padding: '8px 14px', background: 'var(--yellow)', color: '#000', border: 'none', fontWeight: '800' }}
                        >
                          ⚡ Mua ngay
                        </button>
                        <button
                          className="compare-product-btn"
                          onClick={() => handleAddToCart(p)}
                          disabled={addingCart === p._id}
                          style={{ fontSize: '12px', padding: '8px 14px' }}
                        >
                          {addingCart === p._id ? 'Đang thêm...' : '🛒 Thêm giỏ'}
                        </button>
                        <Link
                          to={`/product/${p.slug || p._id}`}
                          style={{
                            padding: '8px 14px', background: 'transparent',
                            border: '1px solid #444', color: '#ccc',
                            borderRadius: '8px', fontSize: '12px',
                            fontWeight: 600, textDecoration: 'none'
                          }}
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Spec table */}
              <div className="compare-table">
                {SPEC_ROWS.map(group => (
                  <React.Fragment key={group.group}>
                    {/* Group header */}
                    <div className="compare-row-group-header">
                      {group.group}
                    </div>

                    {group.rows.map(row => {
                      const vals = products.map(p => row.key(p))
                      const betterIdx = products.length === 2 ? getBetterIdx(row) : null

                      return (
                        <div className="compare-row" key={row.label}>
                          <div className="compare-row-label">{row.label}</div>
                          {vals.map((val, idx) => {
                            const isNA = val === '—'
                            const isBetter = betterIdx === idx
                            const isWorse = betterIdx !== null && betterIdx !== idx
                            return (
                              <div
                                className={`compare-row-val ${isBetter ? 'compare-val-better' : ''} ${isWorse ? 'compare-val-worse' : ''} ${isNA ? 'compare-val-na' : ''}`}
                                key={idx}
                              >
                                {isBetter && '✓ '}{val}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}

                {/* Hàng cuối: nút mua */}
                <div className="compare-row">
                  <div className="compare-row-label">Hành động</div>
                  {products.map(p => (
                    <div className="compare-row-val" key={p._id} style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                      <button
                        className="compare-product-btn"
                        onClick={() => handleDirectBuyNow(p)}
                        style={{ width: '100%', justifyContent: 'center', background: 'var(--yellow)', color: '#000', border: 'none', fontWeight: '800' }}
                      >
                        ⚡ Mua ngay
                      </button>
                      <button
                        className="compare-product-btn"
                        onClick={() => handleAddToCart(p)}
                        disabled={addingCart === p._id}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {addingCart === p._id ? 'Đang thêm...' : '🛒 Thêm vào giỏ hàng'}
                      </button>
                      <Link
                        to={`/product/${p.slug || p._id}`}
                        style={{
                          width: '100%', padding: '9px', background: 'transparent',
                          border: '1px solid #333', color: '#aaa',
                          borderRadius: '8px', fontSize: '12px',
                          fontWeight: 600, textDecoration: 'none',
                          textAlign: 'center', display: 'block'
                        }}
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}
