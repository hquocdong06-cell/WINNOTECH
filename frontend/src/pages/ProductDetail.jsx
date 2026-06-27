import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/product-detail.css'

const API_URL = 'http://localhost:3000'

export default function ProductDetail() {
  const dispatch = useDispatch()
  const { slug } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])

  // Sidebar mock filters (giữ giao diện đẹp mắt của template)
  const brands = ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'GIGABYTE']
  const productLines = [
    'GeForce RTX 40 Series',
    'GeForce RTX 30 Series',
    'Radeon RX 7000 Series',
    'Radeon RX 6000 Series'
  ]
  const sockets = ['PCIe 4.0', 'PCIe 3.0', 'PCIe 5.0']

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/products/${slug}`)
        const data = await res.json()
        if (data.success) {
          setProductData(data.data)
          setError(null)
          
          // Lấy sản phẩm liên quan từ cùng Category
          const catSlug = data.data.product?.cat_id?.slug
          if (catSlug) {
            const catRes = await fetch(`${API_URL}/categories/${catSlug}`)
            const catData = await catRes.json()
            if (catData.success && catData.data?.products) {
              const filtered = catData.data.products.filter(p => p._id !== data.data.product._id)
              setRelatedProducts(filtered.slice(0, 4))
            }
          }
        } else {
          setError(data.message || 'Không tìm thấy sản phẩm')
        }
      } catch (err) {
        console.error('Lỗi lấy chi tiết sản phẩm:', err)
        setError('Không thể tải chi tiết sản phẩm')
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      fetchProductDetail()
    }
  }, [slug])

  if (loading) {
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#fff', fontSize: '18px' }}>
          ⏳ Đang tải thông tin sản phẩm...
        </div>
      </DefaultLayout>
    )
  }

  if (error || !productData) {
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#fff', gap: '20px' }}>
          <h2>❌ {error || 'Không tìm thấy sản phẩm'}</h2>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', background: 'var(--accent-color)', color: '#000', borderRadius: '4px', fontWeight: 600 }}>
            Quay lại trang chủ
          </Link>
        </div>
      </DefaultLayout>
    )
  }

  const { product, AnhSP, Variants } = productData

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ'
    return price.toLocaleString('vi-VN') + 'đ'
  }

  // Gallery images list
  const getProductImages = () => {
    const list = []
    if (AnhSP && AnhSP.length > 0) {
      AnhSP.forEach(img => list.push(img.url))
    }
    if (list.length === 0 && product.thumnail) {
      list.push(product.thumnail)
    }
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop')
    }
    return list
  }

  const images = getProductImages()

  // Price calculations
  const hasVariants = Variants && Variants.length > 0
  const activeVariant = hasVariants ? Variants[0] : null
  const originalPrice = activeVariant ? activeVariant.price : (product.price || 0)
  const currentPrice = activeVariant && activeVariant.sale_price > 0 ? activeVariant.sale_price : originalPrice
  const hasSale = product.sale > 0 || (activeVariant && activeVariant.sale_price > 0)
  const salePercent = product.sale || (activeVariant ? Math.round((1 - activeVariant.sale_price / activeVariant.price) * 100) : 0)

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value)
    if (value > 0) setQuantity(value)
  }

  const handleAddToCart = () => {
    dispatch(addToCart({
      product_id: product._id,
      variant_id: activeVariant?._id || 'default',
      name: product.name + (activeVariant ? ` - ${activeVariant.attributes.map(a => a.value).join(', ')}` : ''),
      price: currentPrice,
      quantity,
      image: images[0]
    }))
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
      position: "bottom-right",
      autoClose: 3000,
    })
  }

  return (
    <DefaultLayout>
      {/* BREADCRUMB */}
      <div className="breadcrumb-section">
        <div className="breadcrumb-inner">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>Sản phẩm</span>
          <span>/</span>
          <span>{product.cat_id?.name || 'Linh kiện'}</span>
          <span>/</span>
          <span style={{ color: 'var(--accent-color)' }}>{product.name}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="product-detail-section">
        <div className="section-inner">
          {/* SIDEBAR FILTERS (MOCK) */}
          <aside className="product-sidebar">
            <div className="filter-group">
              <button className="filter-title">
                <span>HÃNG</span>
                <span className="filter-toggle">−</span>
              </button>
              <div className="filter-content">
                {brands.map((brand) => (
                  <label key={brand} className="filter-item">
                    <input type="checkbox" defaultChecked={brand.toLowerCase() === product.brand_id?.name?.toLowerCase()} />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <button className="filter-title">
                <span>DÒNG SẢN PHẨM</span>
                <span className="filter-toggle">−</span>
              </button>
              <div className="filter-content">
                {productLines.map((line) => (
                  <label key={line} className="filter-item">
                    <input type="checkbox" />
                    <span>{line}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <button className="filter-title">
                <span>SOCKET</span>
                <span className="filter-toggle">−</span>
              </button>
              <div className="filter-content">
                {sockets.map((socket) => (
                  <label key={socket} className="filter-item">
                    <input type="checkbox" />
                    <span>{socket}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCT MAIN */}
          <main className="product-main">
            <div className="product-grid">
              {/* LEFT: IMAGE GALLERY */}
              <div className="product-gallery">
                <div className="gallery-main" style={{ background: 'var(--dark2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={images[selectedImage]} alt={product.name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                </div>
                <div className="gallery-thumbnails">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`gallery-thumb ${selectedImage === idx ? 'active' : ''}`}
                      onClick={() => setSelectedImage(idx)}
                      style={{ background: 'var(--dark2)', borderRadius: '4px', overflow: 'hidden', border: selectedImage === idx ? '1px solid var(--accent-color)' : '1px solid transparent' }}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT: PRODUCT INFO */}
              <div className="product-info-section">
                <div className="product-header-info">
                  <span className="product-brand" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{product.brand_id?.name || 'Chính hãng'}</span>
                  <h1 className="product-title" style={{ fontSize: '24px', margin: '8px 0', color: '#fff' }}>{product.name}</h1>
                </div>

                <div className="product-meta">
                  <span className="status-badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    {product.status === 'active' ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                  <div className="rating">
                    <span className="stars">⭐⭐⭐⭐⭐</span>
                    <span className="rating-value" style={{ marginLeft: '4px' }}>5.0</span>
                  </div>
                </div>

                {/* SHORT DESC */}
                <div className="specs-table" style={{ marginTop: '20px', background: 'var(--dark2)', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    {product.short_desc || 'Không có mô tả ngắn cho sản phẩm này.'}
                  </p>
                </div>

                {/* PRICE */}
                <div className="product-pricing" style={{ margin: '20px 0' }}>
                  <span className="price-note" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Giá đã bao gồm VAT</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginTop: '5px' }}>
                    <span className="price-main" style={{ fontSize: '28px', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                      {formatPrice(currentPrice)}
                    </span>
                    {hasSale && (
                      <span className="price-original" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '16px' }}>
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* QUANTITY & ACTIONS */}
                <div className="product-actions">
                  <div className="quantity-selector">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="qty-btn"
                    >−</button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={handleQuantityChange}
                      className="qty-input"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="qty-btn"
                    >+</button>
                  </div>
                  <button className="btn-add-cart" onClick={handleAddToCart} style={{ background: 'var(--accent-color)', color: '#000', fontWeight: 'bold' }}>
                    THÊM VÀO GIỎ
                  </button>
                </div>

                <button 
                  className="btn-wishlist"
                  onClick={() => setIsFavorite(!isFavorite)}
                  style={{ color: isFavorite ? 'var(--accent-color)' : '#fff' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  YÊU THÍCH
                </button>
              </div>
            </div>

            {/* TABS */}
            <div className="product-tabs" style={{ marginTop: '40px' }}>
              <div className="tabs-header" style={{ borderBottom: '1px solid #333' }}>
                <button 
                  className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  MÔ TẢ CHI TIẾT
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  ĐÁNH GIÁ (0)
                </button>
              </div>

              <div className="tabs-content" style={{ padding: '20px 0' }}>
                {activeTab === 'description' && (
                  <div className="tab-pane" style={{ lineHeight: '1.8', color: '#ccc', fontSize: '15px' }}>
                    <div style={{ whiteSpace: 'pre-line' }}>{product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}</div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="tab-pane">
                    <div className="reviews-section" style={{ color: 'var(--text-muted)' }}>
                      <p>Hiện chưa có đánh giá. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                      <button className="btn-review" style={{ background: '#1e1e1e', color: '#fff', border: '1px solid #333', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>VIẾT ĐÁNH GIÁ</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
              <div className="related-products" style={{ marginTop: '50px' }}>
                <div className="related-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', color: '#fff' }}>SẢN PHẨM LIÊN QUAN</h2>
                </div>
                <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {relatedProducts.map((item) => {
                    const itemImg = item.AnhSP && item.AnhSP.length > 0 ? item.AnhSP[0].url : item.thumnail
                    const itemPrice = item.price || 0
                    const itemSalePrice = item.Variants && item.Variants.length > 0 && item.Variants[0].sale_price > 0 ? item.Variants[0].sale_price : itemPrice
                    return (
                      <Link key={item._id} to={`/product/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="related-card" style={{ background: 'var(--dark2)', border: '1px solid #333', padding: '15px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}>
                          <div className="related-img" style={{ height: '150px', background: 'var(--dark3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden' }}>
                            <img src={itemImg || 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop'} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </div>
                          <div className="related-info" style={{ marginTop: '10px' }}>
                            <div className="related-name" style={{ fontWeight: 600, fontSize: '14px', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: '#fff' }}>{item.name}</div>
                            <div className="related-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                              <div className="related-price" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{formatPrice(itemSalePrice || itemPrice)}</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </DefaultLayout>
  )
}
