import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
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
  if (product.AnhSP && product.AnhSP.length > 0) {
    const main = product.AnhSP.find(img => img.is_main) || product.AnhSP[0]
    const url = main?.url || ''
    if (url) return url.startsWith('http') ? url : `${API_URL}${url}`
  }
  const imgs = product.images || []
  if (imgs.length > 0) {
    const url = imgs[0]?.url || imgs[0]
    if (url) return typeof url === 'string' && url.startsWith('http') ? url : `${API_URL}${url}`
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

// Danh sách các thương hiệu phần cứng máy tính để nhận diện từ tên
const KNOWN_BRANDS = [
  'Intel', 'AMD', 'NVIDIA', 'Asus', 'ASUS', 'MSI', 'Gigabyte', 'Aorus',
  'Corsair', 'G.Skill', 'Kingston', 'Samsung', 'Western Digital', 'WD',
  'Seagate', 'Crucial', 'Lexar', 'Kioxia', 'TeamGroup', 'T-Force',
  'ADATA', 'XPG', 'Patriot', 'Colorful', 'Gainward', 'Galax', 'Zotac',
  'Inno3D', 'Palit', 'ASRock', 'Sapphire', 'PowerColor', 'XFX',
  'Deepcool', 'Thermalright', 'NZXT', 'Cooler Master', 'Lian Li',
  'Seasonic', 'Super Flower', 'be quiet!', 'Be Quiet', 'Noctua', 'Arctic',
  'ID-Cooling', 'Antec', 'Aigo', 'Jonsbo', 'Montech', 'Xigmatek',
  'MIK', 'SAMA', 'VSP', 'Segotep', 'Gamdias', 'ViewSonic', 'LG',
  'Dell', 'BenQ', 'Acer', 'AOC', 'Philips', 'Logitech', 'Razer',
  'SteelSeries', 'Akko', 'Dareu', 'Keychron'
]

const getBrandName = (product) => {
  if (!product) return '—'
  // 1. Trích xuất từ dữ liệu thương hiệu trong DB nếu có
  if (product.brand_id?.name) return product.brand_id.name
  if (product.brand?.name) return product.brand.name
  if (typeof product.brand_id === 'string' && product.brand_id.length > 0 && !/^[0-9a-fA-F]{24}$/.test(product.brand_id)) {
    return product.brand_id
  }

  // 2. Lọc tự động dựa vào tên sản phẩm (theo yêu cầu người dùng)
  const name = product.name || ''
  for (const b of KNOWN_BRANDS) {
    const escaped = b.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`(^|\\s|[._-])${escaped}($|\\s|[._-])`, 'i')
    if (regex.test(name)) {
      if (b.toUpperCase() === 'WD') return 'Western Digital'
      if (b.toLowerCase() === 'asus') return 'ASUS'
      if (b.toLowerCase() === 'asrock') return 'ASRock'
      if (b.toLowerCase() === 'msi') return 'MSI'
      return b
    }
  }

  // Nhận diện theo dòng vi xử lý / card
  const lower = name.toLowerCase()
  if (lower.includes('ryzen')) return 'AMD'
  if (lower.includes('core i') || lower.includes('xeon')) return 'Intel'
  if (lower.includes('radeon')) return 'AMD'
  if (lower.includes('geforce')) return 'NVIDIA'

  return '—'
}

const getCategoryName = (product) => {
  if (!product) return '—'
  // 1. Trỏ từ Danh mục lưu trong Database
  const catName = product.cat_id?.name || product.category_id?.name || product.category?.name
  if (catName && catName !== '—') return catName

  // 2. Dựa vào slug danh mục lưu trong Database nếu có
  const catSlug = (product.cat_id?.slug || product.category_id?.slug || product.category_slug || '').toLowerCase()
  if (catSlug.includes('cpu')) return 'Bộ vi xử lý (CPU)'
  if (catSlug.includes('vga') || catSlug.includes('gpu')) return 'Card đồ họa (VGA)'
  if (catSlug.includes('ram')) return 'Bộ nhớ trong (RAM)'
  if (catSlug.includes('ssd') || catSlug.includes('o-cung') || catSlug.includes('storage')) return 'Ổ cứng SSD'
  if (catSlug.includes('main')) return 'Bo mạch chủ (Mainboard)'
  if (catSlug.includes('psu') || catSlug.includes('nguon')) return 'Nguồn máy tính (PSU)'
  if (catSlug.includes('case')) return 'Vỏ Case'
  if (catSlug.includes('tan-nhiet') || catSlug.includes('cooling')) return 'Tản nhiệt PC'
  if (catSlug.includes('man-hinh') || catSlug.includes('monitor')) return 'Màn hình máy tính'

  // 3. Dự đoán thông minh dựa theo tên / slug sản phẩm nếu chưa có danh mục trong DB
  const text = ((product.name || '') + ' ' + (product.slug || '')).toLowerCase()
  if (text.includes('cpu') || text.includes('ryzen') || text.includes('core i3') || text.includes('core i5') || text.includes('core i7') || text.includes('core i9') || text.includes('ultra 5') || text.includes('ultra 7') || text.includes('ultra 9')) {
    return 'Bộ vi xử lý (CPU)'
  }
  if (text.includes('vga') || text.includes('card màn hình') || text.includes('rtx') || text.includes('gtx') || text.includes('radeon rx') || text.includes('geforce')) {
    return 'Card đồ họa (VGA)'
  }
  if (text.includes('ram') || text.includes('ddr4') || text.includes('ddr5')) {
    return 'Bộ nhớ trong (RAM)'
  }
  if (text.includes('ssd') || text.includes('nvme') || text.includes('m.2') || text.includes('ổ cứng') || text.includes('sata 3')) {
    return 'Ổ cứng SSD'
  }
  if (text.includes('mainboard') || text.includes('bo mạch chủ') || text.includes('b760') || text.includes('z790') || text.includes('b650') || text.includes('x670') || text.includes('h610') || text.includes('a620') || text.includes('b550') || text.includes('z890')) {
    return 'Bo mạch chủ (Mainboard)'
  }
  if (text.includes('nguồn') || text.includes('psu') || text.includes('power supply') || (text.includes('80 plus') && text.includes('w'))) {
    return 'Nguồn máy tính (PSU)'
  }
  if (text.includes('vỏ case') || text.includes('thùng máy') || text.includes('thùng pc') || text.includes('case')) {
    return 'Vỏ Case'
  }
  if (text.includes('tản nhiệt') || text.includes('cooler') || text.includes('aio') || text.includes('fan led') || text.includes('quạt')) {
    return 'Tản nhiệt PC'
  }
  if (text.includes('màn hình') || text.includes('monitor') || text.includes('hz')) {
    return 'Màn hình máy tính'
  }

  return 'Linh kiện máy tính'
}

// Danh sách các specs cần hiển thị trong bảng so sánh
const SPEC_ROWS = [
  { group: 'Tổng quan', rows: [
    { label: 'Thương hiệu',   key: p => getBrandName(p) },
    { label: 'Danh mục',      key: p => getCategoryName(p) },
    { label: 'Mô tả ngắn',    key: p => p.short_desc || '—' },
    { label: 'Trạng thái',    key: p => p.status === 'active' ? '✅ Đang bán' : '❌ Ngừng bán' },
  ]},
  { group: 'Giá & Kho', rows: [
    { label: 'Giá bán',           key: p => fmt(getPrice(p)), compare: 'number', getValue: p => getPrice(p) },
    { label: 'Giá gốc',          key: p => getOriginalPrice(p) ? fmt(getOriginalPrice(p)) : '—' },
  ]},
]

export default function Compare() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
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
    const variantsList = product?.Variants || product?.variants || []
    const defaultVariant = variantsList.find(v => v.variant_name === 'Mặc định') || variantsList[0]
    if (!defaultVariant) {
      toast.warning('Sản phẩm chưa có biến thể sẵn sàng!', { position: 'bottom-right' })
      return
    }
    if (defaultVariant.stock_quantity !== undefined && defaultVariant.stock_quantity <= 0) {
      toast.error('Sản phẩm này đã hết hàng!', { position: 'bottom-right' })
      return
    }

    const currentPrice = defaultVariant.sale_price > 0 ? defaultVariant.sale_price : (defaultVariant.price || getPrice(product))
    const imgUrl = getImg(product)
    const cartPayload = {
      product_id: product._id,
      variant_id: defaultVariant._id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      image: imgUrl
    }

    if (!isLoggedIn) {
      dispatch(addToCart(cartPayload))
      toast.success('Đã thêm vào giỏ hàng!', { position: 'bottom-right', autoClose: 2000 })
      return
    }

    setAddingCart(product._id)
    try {
      const data = await cartAPI.addItem(defaultVariant._id, 1)
      if (data.success) {
        dispatch(addToCart(cartPayload))
        toast.success('Đã thêm vào giỏ hàng!', { position: 'bottom-right', autoClose: 2000 })
      } else {
        toast.error(data.message || 'Lỗi thêm vào giỏ', { position: 'bottom-right' })
      }
    } catch {
      // Fallback local dispatch nếu server network lỗi
      dispatch(addToCart(cartPayload))
      toast.success('Đã thêm vào giỏ hàng!', { position: 'bottom-right', autoClose: 2000 })
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
    const variantsList = p?.Variants || p?.variants || []
    const defaultVariant = variantsList.find(v => v.variant_name === 'Mặc định') || variantsList[0] || {}
    if (defaultVariant.stock_quantity !== undefined && defaultVariant.stock_quantity <= 0) {
      toast.error('Sản phẩm này đã hết hàng!', { position: 'bottom-right' })
      return
    }

    const price = defaultVariant.sale_price > 0 ? defaultVariant.sale_price : (defaultVariant.price || getPrice(p))
    const imgUrl = getImg(p)

    const buyNowItem = {
      cartItem: {
        _id: defaultVariant._id || p._id,
        variant_id: defaultVariant._id || p._id,
        quantity: 1,
        price: price
      },
      variant: defaultVariant,
      product: {
        _id: p._id,
        name: p.name
      },
      AnhSP: imgUrl ? [{ url: imgUrl }] : [],
      _localPrice: price,
      _variantId: defaultVariant._id || p._id,
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
                      <div className="compare-product-price" style={{ marginBottom: 0 }}>{fmt(getPrice(p))}</div>
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
