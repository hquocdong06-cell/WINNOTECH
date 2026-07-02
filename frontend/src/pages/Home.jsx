import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/home.css'

const API_URL = 'http://localhost:3000'
const PAGE_SIZE = 10

// ============================================================
// Helper functions (stable, defined outside component)
// ============================================================
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ'
  return price.toLocaleString('vi-VN') + 'đ'
}

const getProductImage = (product) => {
  if (product.AnhSP && product.AnhSP.length > 0) {
    const url = product.AnhSP[0].url
    return url.startsWith('http') ? url : `${API_URL}${url}`
  }
  if (product.thumnail) return product.thumnail.startsWith('http') ? product.thumnail : `${API_URL}${product.thumnail}`
  return null
}

const getProductPriceInfo = (product) => {
  let originalPrice = product.price || 0
  let currentPrice = product.price || 0
  let hasSale = false
  let salePercent = product.sale || 0

  if (product.Variants && product.Variants.length > 0) {
    let minActivePrice = Infinity
    let chosenVariant = null
    product.Variants.forEach(v => {
      const activePrice = v.sale_price && v.sale_price > 0 ? v.sale_price : v.price
      if (activePrice && activePrice < minActivePrice) {
        minActivePrice = activePrice
        chosenVariant = v
      }
    })
    if (chosenVariant) {
      originalPrice = chosenVariant.price
      currentPrice = minActivePrice
      hasSale = !!chosenVariant.sale_price && chosenVariant.sale_price > 0 && chosenVariant.sale_price < chosenVariant.price
      if (hasSale) {
        salePercent = Math.round(((chosenVariant.price - chosenVariant.sale_price) / chosenVariant.price) * 100)
      }
    }
  } else {
    if (product.sale > 0 && originalPrice > 0) {
      hasSale = true
      currentPrice = originalPrice * (1 - product.sale / 100)
      salePercent = product.sale
    }
  }

  return { originalPrice, currentPrice, hasSale, salePercent }
}

// ============================================================
// ProductCard — single card component
// ============================================================
const CartSVG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
)
const HeartSVG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const ProductCard = ({ product, onAddToCart }) => {
  const imgUrl = getProductImage(product)
  const { originalPrice, currentPrice, hasSale, salePercent } = getProductPriceInfo(product)
  return (
    <Link to={`/product/${product.slug}`} className="product-link">
      <div className="product-card">
        {hasSale && <div className="product-sale-badge">-{salePercent}%</div>}
        <div className="item-visual-box">
          {imgUrl
            ? <img src={imgUrl} alt={product.name} />
            : <div className="no-image">No Image</div>
          }
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-cat">{product.cat_id?.name || product.brand_id?.name || 'Linh kiện PC'}</div>
          <div className="product-footer">
            <div className="product-price-container">
              {hasSale ? (
                <>
                  <span className="product-price sale-price">{formatPrice(currentPrice)}</span>
                  <span className="original-price">{formatPrice(originalPrice)}</span>
                </>
              ) : (
                <span className="product-price">{formatPrice(currentPrice)}</span>
              )}
            </div>
            <div className="product-actions">
              <button className="btn-cart" onClick={(e) => { e.preventDefault(); onAddToCart?.() }}>
                <CartSVG />
              </button>
              <button className="btn-wishlist-home" onClick={(e) => e.preventDefault()} title="Thêm vào yêu thích">
                <HeartSVG />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ============================================================
// usePageFlip — hook quản lý pagination + animation
// ============================================================
function usePageFlip(items) {
  const [shownPage, setShownPage] = useState(0)   // trang đang hiển thị
  const [phase, setPhase] = useState('idle')       // 'idle' | 'exit' | 'enter'
  const [dir, setDir] = useState('next')           // 'next' | 'prev'
  const timerRef = useRef(null)

  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const currentItems = items.slice(shownPage * PAGE_SIZE, (shownPage + 1) * PAGE_SIZE)

  // Khi danh sách thay đổi (lọc, load xong…) reset về trang 0
  useEffect(() => {
    setShownPage(0)
    setPhase('idle')
  }, [items.length])

  const goPage = useCallback((newPage, direction) => {
    if (phase !== 'idle') return
    if (newPage < 0 || newPage >= totalPages) return

    setDir(direction)
    setPhase('exit')

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setShownPage(newPage)
      setPhase('enter')
      timerRef.current = setTimeout(() => {
        setPhase('idle')
      }, 360)
    }, 270)
  }, [phase, totalPages])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const animClass = (() => {
    if (phase === 'exit') return dir === 'next' ? 'flip-exit-next' : 'flip-exit-prev'
    if (phase === 'enter') return dir === 'next' ? 'flip-enter-right' : 'flip-enter-left'
    return ''
  })()

  return { shownPage, currentItems, totalPages, goPage, animClass, isAnimating: phase !== 'idle' }
}

// ============================================================
// ProductSection — section tái sử dụng với animation lật trang
// ============================================================
const ProductSection = ({
  products,
  loading,
  emptyMsg,
  sectionLabel,
  sectionLabelStyle,
  titleLine1,
  titleLine2,
  viewAllText,
  viewAllHref = '#',
  className = '',
}) => {
  const { shownPage, currentItems, totalPages, goPage, animClass, isAnimating } = usePageFlip(products)

  return (
    <section className={`products-section ${className}`.trim()}>
      <div className="section-inner">
        {/* Header */}
        <div className="products-header">
          <div>
            <div className="section-label" style={sectionLabelStyle}>{sectionLabel}</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              {titleLine1}<br />{titleLine2}
            </h2>
          </div>
          <div className="products-header-right">
            <div className="products-header-meta">
              {!loading && totalPages > 1 && (
                <span className="page-counter-badge">
                  Trang {shownPage + 1} / {totalPages}
                </span>
              )}
              <a href={viewAllHref}>{viewAllText}</a>
            </div>
            <div className="products-nav">
              <button
                onClick={() => goPage(shownPage - 1, 'prev')}
                disabled={shownPage === 0 || isAnimating || loading}
                aria-label="Trang trước"
              >←</button>
              <button
                onClick={() => goPage(shownPage + 1, 'next')}
                disabled={shownPage >= totalPages - 1 || isAnimating || loading}
                aria-label="Trang tiếp"
              >→</button>
            </div>
          </div>
        </div>

        {/* Product grid với animation */}
        <div className="products-row-wrapper">
          <div className={`products-row ${animClass}`}>
            {loading ? (
              <div className="products-empty" style={{ gridColumn: '1/-1' }}>Đang tải sản phẩm...</div>
            ) : currentItems.length === 0 ? (
              <div className="products-empty" style={{ gridColumn: '1/-1' }}>{emptyMsg}</div>
            ) : (
              currentItems.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>

        {/* Page dots */}
        {!loading && totalPages > 1 && (
          <div className="section-page-dots">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-dot ${i === shownPage ? 'active' : ''}`}
                onClick={() => goPage(i, i > shownPage ? 'next' : 'prev')}
                aria-label={`Đến trang ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ============================================================
// Deduplication helpers
// ============================================================
const getMaxDiscountPct = (product) => {
  // Tính % giảm giá cao nhất từ variants
  if (product.Variants && product.Variants.length > 0) {
    let max = 0
    product.Variants.forEach(v => {
      if (v.sale_price > 0 && v.price > 0 && v.sale_price < v.price) {
        const pct = (v.price - v.sale_price) / v.price * 100
        if (pct > max) max = pct
      }
    })
    return max
  }
  return product.sale || 0
}

const hasTrueDiscount = (product) =>
  getMaxDiscountPct(product) > 0

// ============================================================
// Home — main component
// ============================================================
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])  // Bán chạy
  const [newProducts, setNewProducts]           = useState([])  // Hàng mới
  const [saleProducts, setSaleProducts]         = useState([])  // Giảm giá
  const [categories, setCategories]             = useState([])

  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  // ─── Fetch 1 lần, chia thành 3 nhóm + dedup ─────────────
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/products`)
        const data = await res.json()
        if (!data.success) return

        const all = data.data

        // 1. SẢN PHẨM GIẢM GIÁ — có sale_price thực sự
        const saleList = [...all]
          .filter(hasTrueDiscount)
          .sort((a, b) => getMaxDiscountPct(b) - getMaxDiscountPct(a))

        const saleIds = new Set(saleList.map(p => String(p._id)))

        // 2. BÁN CHẠY / FEATURED — sản phẩm có sale field hoặc nổi bật
        //    KHÔNG trùng với saleList
        const featuredList = [...all]
          .filter(p => !saleIds.has(String(p._id)))   // loại trùng
          .sort((a, b) => (b.sale || 0) - (a.sale || 0))

        const featuredIds = new Set(featuredList.slice(0, PAGE_SIZE).map(p => String(p._id)))

        // 3. HÀNG MỚI — mới nhất, không trùng 2 nhóm trên
        const newList = [...all]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .filter(p => !saleIds.has(String(p._id)) && !featuredIds.has(String(p._id)))

        // Fallback: nếu sau dedup quá ít thì dùng toàn bộ (có thể trùng nhưng ít hơn)
        setSaleProducts(saleList.length >= 5 ? saleList : all.filter(hasTrueDiscount).concat(all).slice(0, 20))
        setFeaturedProducts(featuredList.length >= 5 ? featuredList : [...all].sort((a, b) => (b.sale || 0) - (a.sale || 0)))
        setNewProducts(newList.length >= 5 ? newList : [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      } catch (err) {
        console.error('Lỗi fetch products:', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    run()
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data) })
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [])

  // Blog & FAQ (static)
  const blogs = [
    { id: 1, tag: 'HƯỚNG DẪN', title: 'Hướng dẫn chọn cấu hình PC gaming 2024 phù hợp với bạn', date: '20/05/2024', image: new URL('../assets/images/blog1.png', import.meta.url).href },
    { id: 2, tag: 'KIẾN THỨC', title: 'CPU có nhân và luồng là gì? Hiểu đúng để chọn CPU tốt', date: '18/05/2024', image: new URL('../assets/images/blog2.png', import.meta.url).href },
    { id: 3, tag: 'BUILD PC',  title: 'Build PC trắng đẹp 2024 — Stealth design & hiệu năng cao',  date: '15/05/2024', image: new URL('../assets/images/blog3.png', import.meta.url).href },
  ]

  // Search filter
  const searchQuery = (new URLSearchParams(window.location.search).get('search') || '').toLowerCase()
  const filterBySearch = (list) => searchQuery ? list.filter(p => p.name.toLowerCase().includes(searchQuery)) : list

  return (
    <DefaultLayout>
      {/* ── HERO ── */}
      <div className="hero-wrapper">
        <section className="hero">
          <div className="hero-bg">
            <img src="/src/assets/images/banner11.jpg" alt="Banner" />
          </div>
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-ctas">
                <button className="btn-primary">KHÁM PHÁ NGAY →</button>
                <button className="btn-ghost">XEM CẤU HÌNH ĐỀ XUẤT →</button>
              </div>
            </div>
          </div>
          <div className="hero-pagination">
            <span className="active">01</span>
            <div className="hero-pagination-accent"></div>
            <div className="hero-pagination-line"></div>
            <span>02</span>
            <div className="hero-pagination-line"></div>
            <span>03</span>
            <div className="hero-pagination-line"></div>
            <span>04</span>
          </div>
        </section>
      </div>

      {/* ── TRUST BAR ── */}
      <div className="trustbar">
        <div className="trustbar-inner">
          {[
            { icon: <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>, title: 'CẤU HÌNH ĐA DẠNG', sub: 'Đáp ứng mọi nhu cầu' },
            { icon: <><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></>, title: 'LINH KIỆN CHÍNH HÃNG', sub: '100% chính hãng, chất lượng cao' },
            { icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />, title: 'HỖ TRỢ KỸ THUẬT 24/7', sub: 'Đội ngũ kỹ thuật chuyên nghiệp' },
            { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, title: 'THANH TOÁN AN TOÀN', sub: 'Bảo mật tuyệt đối' },
          ].map((t, i) => (
            <div key={i} className="trust-item">
              <div className="trust-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{t.icon}</svg>
              </div>
              <div>
                <div className="trust-title">{t.title}</div>
                <div className="trust-sub">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORY ── */}
      <section className="category-section">
        <div className="section-inner">
          <div className="cat-nav">
            <button>←</button>
            <button>→</button>
          </div>
          <div className="cat-layout">
            <div className="cat-left">
              <h2>DANH MỤC<br />NỔI BẬT</h2>
              <a href="#">XEM TẤT CẢ →</a>
            </div>
            <div className="cat-grid">
              {loadingCategories ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Đang tải danh mục...</div>
              ) : categories.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Chưa có danh mục nào</div>
              ) : categories.slice(0, 4).map(cat => (
                <div key={cat._id} className="cat-card">
                  <div className="cat-card-name">{cat.name}</div>
                  <div className="cat-card-count">{cat.slug}</div>
                  <div className="cat-card-img">
                    {cat.image
                      ? <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px' }}>{cat.name}</div>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 🔥 BÁN CHẠY NHẤT ── */}
      <ProductSection
        products={filterBySearch(featuredProducts)}
        loading={loadingProducts}
        emptyMsg="Chưa có sản phẩm nổi bật nào"
        sectionLabel="🔥 BÁN CHẠY NHẤT"
        sectionLabelStyle={{ color: 'var(--purple2)' }}
        titleLine1="TOP SẢN PHẨM"
        titleLine2="ĐANG BÁN CHẠY"
        viewAllText="XEM TẤT CẢ TOP SẢN PHẨM →"
        viewAllHref="/shop"
      />

      {/* ── HÀNG MỚI VỀ ── */}
      <ProductSection
        products={filterBySearch(newProducts)}
        loading={loadingProducts}
        emptyMsg="Chưa có sản phẩm mới nào"
        sectionLabel="SẢN PHẨM MỚI"
        titleLine1="HÀNG MỚI VỀ"
        titleLine2="ĐÓN ĐẦU CÔNG NGHỆ MỚI"
        viewAllText="XEM TẤT CẢ SẢN PHẨM →"
        viewAllHref="/shop"
      />

      {/* ── GIẢM GIÁ ── */}
      <ProductSection
        products={filterBySearch(saleProducts)}
        loading={loadingProducts}
        emptyMsg="Không có sản phẩm giảm giá nào"
        sectionLabel="SIÊU ƯU ĐÃI"
        sectionLabelStyle={{ color: '#f5a623' }}
        titleLine1="SẢN PHẨM GIẢM GIÁ"
        titleLine2="SĂN DEAL HỜI CỰC KHỦNG"
        viewAllText="XEM TẤT CẢ KHUYẾN MÃI →"
        viewAllHref="/shop"
        className="products-section-sale"
      />

      {/* ── BLOG ── */}
      <section className="blog-section">
        <div className="section-inner">
          <div className="blog-header">
            <div>
              <div className="section-label">KIẾN THỨC & HƯỚNG DẪN</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>NÂNG TẦM TRẢI NGHIỆM</h2>
            </div>
            <a href="#" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              XEM TẤT CẢ BÀI VIẾT →
            </a>
          </div>
          <div className="blog-grid">
            {blogs.map(blog => (
              <div key={blog.id} className="blog-card">
                <div className="blog-img">
                  <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="blog-body">
                  <div className="blog-tag">{blog.tag}</div>
                  <div className="blog-title">{blog.title}</div>
                  <div className="blog-footer">
                    <div className="blog-date">{blog.date}</div>
                    <a href="#" className="blog-read">Đọc thêm →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter-section">
        <div className="newsletter-inner">
          <div className="newsletter-left">
            <h2>LUÔN CẬP NHẬT<br /><span>CÔNG NGHỆ MỚI</span></h2>
          </div>
          <div className="newsletter-right">
            <div className="newsletter-form">
              <input type="email" placeholder="Nhập email của bạn" />
              <button>ĐĂNG KÝ</button>
            </div>
            <p>Nhận tin tức, ưu đãi và hướng dẫn build PC mới nhất từ GearForge.</p>
          </div>
        </div>
      </section>
    </DefaultLayout>
  )
}


