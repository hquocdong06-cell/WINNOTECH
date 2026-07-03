import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/product-detail.css'
import { findMockProductBySlug, mockProducts } from '../data/mockProducts'
import useFavorite from '../hooks/useFavorite'

const API_URL = 'http://localhost:3000'

export default function ProductDetail() {
  const dispatch = useDispatch()
  const { slug } = useParams()
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const { favoriteIds, toggleFavorite } = useFavorite()
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
          
          // Lấy sản phẩm liên quan từ cùng Category — gọi /products rồi lọc theo cat_id
          const catId = data.data.product?.cat_id?._id || data.data.product?.cat_id
          const currentProductId = data.data.product._id
          if (catId) {
            try {
              const allRes = await fetch(`${API_URL}/products`)
              const allData = await allRes.json()
              if (allData.success && Array.isArray(allData.data)) {
                const related = allData.data
                  .filter(p => {
                    const pCatId = p.cat_id?._id || p.cat_id
                    return String(pCatId) === String(catId) && String(p._id) !== String(currentProductId)
                  })
                  .slice(0, 4)
                setRelatedProducts(related)
              }
            } catch {
              // Không lấy được related products → bỏ qua
            }
          }
        } else {
          // Thử fallback sang mock data
          const mockItem = findMockProductBySlug(slug)
          if (mockItem) {
            setProductData({
              product: mockItem.product,
              AnhSP: mockItem.product.AnhSP || [],
              Variants: mockItem.product.Variants || []
            })
            setError(null)
            const related = mockProducts[mockItem.category]
              .filter(p => p.slug !== slug)
              .slice(0, 4)
            setRelatedProducts(related)
          } else {
            setError(data.message || 'Không tìm thấy sản phẩm')
          }
        }
      } catch (err) {
        console.error('Lỗi lấy chi tiết sản phẩm, thử fallback mock data:', err)
        const mockItem = findMockProductBySlug(slug)
        if (mockItem) {
          setProductData({
            product: mockItem.product,
            AnhSP: mockItem.product.AnhSP || [],
            Variants: mockItem.product.Variants || []
          })
          setError(null)
          const related = mockProducts[mockItem.category]
            .filter(p => p.slug !== slug)
            .slice(0, 4)
          setRelatedProducts(related)
        } else {
          setError('Không thể tải chi tiết sản phẩm')
        }
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      fetchProductDetail()
    }
  }, [slug])

  // Sync selected variant id
  useEffect(() => {
    if (productData?.Variants && productData.Variants.length > 0) {
      setSelectedVariantId(productData.Variants[0]._id)
    }
  }, [productData])

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
      AnhSP.forEach(img => {
        const url = img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`
        list.push(url)
      })
    }
    if (list.length === 0 && product.thumnail) {
      const thumb = product.thumnail.startsWith('http') ? product.thumnail : `${API_URL}${product.thumnail}`
      list.push(thumb)
    }
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop')
    }
    
    // Đảm bảo luôn có ít nhất 4 ảnh (1 ảnh chính + 3 ảnh phụ thêm)
    const baseImg = list[0]
    while (list.length < 4) {
      list.push(baseImg)
    }
    
    return list
  }

  const images = getProductImages()

  // Price calculations
  const hasVariants = Variants && Variants.length > 0
  const activeVariant = Variants?.find(v => v._id === selectedVariantId) || (hasVariants ? Variants[0] : null)
  const originalPrice = activeVariant ? activeVariant.price : (product.price || 0)
  const currentPrice = activeVariant && activeVariant.sale_price > 0 ? activeVariant.sale_price : originalPrice
  const hasSale = product.sale > 0 || (activeVariant && activeVariant.sale_price > 0)
  const salePercent = product.sale || (activeVariant ? Math.round((1 - activeVariant.sale_price / activeVariant.price) * 100) : 0)

  const isOutOfStock = activeVariant && activeVariant.stock_quantity !== undefined ? activeVariant.stock_quantity <= 0 : false
  const availableStock = activeVariant && activeVariant.stock_quantity !== undefined ? activeVariant.stock_quantity : 999

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value)
    if (value > 0) setQuantity(Math.min(value, availableStock))
  }

  const handleAddToCart = async () => {
    if (!activeVariant) {
      toast.error('Sản phẩm này hiện tại chưa có sẵn biến thể!', { position: 'bottom-right' })
      return
    }
    if (activeVariant.stock_quantity !== undefined && activeVariant.stock_quantity <= 0) {
      toast.error('Sản phẩm này đã hết hàng!', { position: 'bottom-right' })
      return
    }
    if (activeVariant.stock_quantity !== undefined && quantity > activeVariant.stock_quantity) {
      toast.error(`Chỉ còn lại ${activeVariant.stock_quantity} sản phẩm trong kho!`, { position: 'bottom-right' })
      return
    }

    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_id: activeVariant._id,
          quantity: quantity
        })
      })
      const data = await res.json()
      
      if (res.status === 401 || !data.success) {
        toast.error(data.message || 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
          position: "bottom-right",
          autoClose: 3000,
        })
        return
      }

      dispatch(addToCart({
        product_id: product._id,
        variant_id: activeVariant._id,
        name: product.name + (activeVariant.attributes && activeVariant.attributes.length > 0 ? ` - ${activeVariant.attributes.map(a => a.value).join(', ')}` : ''),
        price: currentPrice,
        quantity,
        image: images[0]
      }))

      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
        position: "bottom-right",
        autoClose: 3000,
      })
    } catch (err) {
      toast.error('Không thể kết nối tới server!', { position: 'bottom-right' })
    }
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
          {/* PRODUCT MAIN */}
          <main className="product-main">
            <div className="product-grid">
              {/* LEFT: IMAGE GALLERY */}
              <div className="product-gallery">
                <div className="gallery-main" style={{ background: 'var(--dark2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={images[selectedImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                  <span className="status-badge" style={{ 
                    background: isOutOfStock ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', 
                    color: isOutOfStock ? '#ef4444' : '#22c55e', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px' 
                  }}>
                    {isOutOfStock ? 'Hết hàng' : (activeVariant && activeVariant.stock_quantity !== undefined ? `Còn hàng (${availableStock} sản phẩm)` : 'Còn hàng')}
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

                {/* SELECT VARIANT CHIPS */}
                {Variants && Variants.length > 1 && (
                  <div className="variant-selector" style={{ margin: '20px 0 10px 0' }}>
                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                      Phiên bản / Biến thể:
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Variants.map(v => (
                        <button
                          key={v._id}
                          onClick={() => { setSelectedVariantId(v._id); setQuantity(1); }}
                          style={{
                            background: selectedVariantId === v._id ? 'var(--accent-color)' : 'var(--dark2)',
                            color: selectedVariantId === v._id ? '#000' : '#fff',
                            border: selectedVariantId === v._id ? '1px solid var(--accent-color)' : '1px solid #444',
                            padding: '6px 14px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {v.variant_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* QUANTITY & ACTIONS */}
                <div className="product-actions">
                  <div className="quantity-selector">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="qty-btn"
                      disabled={isOutOfStock}
                      style={{ opacity: isOutOfStock ? 0.3 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                    >−</button>
                    <input 
                      type="number" 
                      value={isOutOfStock ? 0 : quantity} 
                      onChange={handleQuantityChange}
                      className="qty-input"
                      disabled={isOutOfStock}
                      style={{ color: isOutOfStock ? '#666' : '#fff' }}
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      className="qty-btn"
                      disabled={isOutOfStock}
                      style={{ opacity: isOutOfStock ? 0.3 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                    >+</button>
                  </div>
                  <button 
                    className="btn-add-cart" 
                    onClick={handleAddToCart} 
                    disabled={isOutOfStock}
                    style={{ 
                      background: isOutOfStock ? '#444' : 'var(--accent-color)', 
                      color: isOutOfStock ? '#888' : '#000', 
                      fontWeight: 'bold',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      border: 'none'
                    }}
                  >
                    {isOutOfStock ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ'}
                  </button>
                </div>

                <button 
                  className="btn-wishlist"
                  onClick={(e) => {
                    e.preventDefault();
                    if (product) toggleFavorite(product._id);
                  }}
                  style={{ color: (product && favoriteIds.has(product._id)) ? '#ef4444' : '#fff' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={(product && favoriteIds.has(product._id)) ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2">
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
                    // Xử lý ảnh: ưu tiên AnhSP, fallback thumnail; thêm API_URL nếu là relative path
                    const rawImg = item.AnhSP && item.AnhSP.length > 0
                      ? item.AnhSP[0].url
                      : (item.thumnail || '')
                    const itemImg = rawImg
                      ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`)
                      : null

                    // Xử lý giá: ưu tiên sale_price của variant đầu tiên
                    const firstVariant = item.Variants && item.Variants.length > 0 ? item.Variants[0] : null
                    const itemBasePrice = firstVariant?.price || item.price || 0
                    const itemSalePrice = firstVariant?.sale_price > 0 ? firstVariant.sale_price : itemBasePrice
                    const displayPrice = itemSalePrice || itemBasePrice
                    return (
                      <Link key={item._id} to={`/product/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="related-card" style={{ background: 'var(--dark2)', border: '1px solid #333', padding: '15px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}>
                          <div className="related-img" style={{ height: '150px', background: 'var(--dark3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden' }}>
                            <img src={itemImg || 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop'} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </div>
                          <div className="related-info" style={{ marginTop: '10px' }}>
                            <div className="related-name" style={{ fontWeight: 600, fontSize: '14px', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: '#fff' }}>{item.name}</div>
                            <div className="related-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                              <div className="related-price" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{formatPrice(displayPrice)}</div>
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
