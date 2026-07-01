import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/home.css'

const API_URL = 'http://localhost:3000'

export default function Home() {
  const [cartCount, setCartCount] = useState(0)

  // ─── State từ API ───────────────────────────────────────────
  const [newProducts, setNewProducts] = useState([])           // sản phẩm mới từ DB
  const [saleProducts, setSaleProducts] = useState([])         // sản phẩm giảm giá từ DB
  const [featuredProducts, setFeaturedProducts] = useState([]) // sản phẩm nổi bật từ DB
  const [categories, setCategories] = useState([])             // danh mục từ DB
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingSale, setLoadingSale] = useState(true)
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Fallback data khi không có backend
  const fallbackProducts = [
    { _id: '1', name: 'Intel Core i9-14900K', price: 15000000, thumnail: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=i9' },
    { _id: '2', name: 'VGA ASUS ROG Strix RTX 4090', price: 50000000, sale: 10, thumnail: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=4090' },
    { _id: '3', name: 'RAM Corsair Vengeance 32GB', price: 3000000, thumnail: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=RAM' },
    { _id: '4', name: 'Mainboard ASUS Z790', price: 8000000, thumnail: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Z790' },
    { _id: '5', name: 'SSD Samsung 990 Pro 2TB', price: 4500000, sale: 5, thumnail: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=SSD' }
  ];

  // ─── Gọi API lấy sản phẩm mới ──────────────────────────
  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products/home/newest`)
        const data = await res.json()
        if (data.success) {
          setNewProducts(data.data)
        } else {
          setNewProducts(fallbackProducts)
        }
      } catch (err) {
        console.error('Lỗi lấy sản phẩm mới:', err)
        setNewProducts(fallbackProducts)
      } finally {
        setLoadingNew(false)
      }
    }
    fetchNewProducts()
  }, [])

  // ─── Gọi API lấy sản phẩm giảm giá ─────────────────────────
  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products/home/Sale`)
        const data = await res.json()
        if (data.success) {
          setSaleProducts(data.data)
        } else {
          setSaleProducts(fallbackProducts.filter(p => p.sale))
        }
      } catch (err) {
        console.error('Lỗi lấy sản phẩm giảm giá:', err)
        setSaleProducts(fallbackProducts.filter(p => p.sale))
      } finally {
        setLoadingSale(false)
      }
    }
    fetchSaleProducts()
  }, [])

  // ─── Gọi API lấy sản phẩm nổi bật ───────────────────────────
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products/home/featured`)
        const data = await res.json()
        if (data.success) {
          setFeaturedProducts(data.data)
        } else {
          setFeaturedProducts(fallbackProducts)
        }
      } catch (err) {
        console.error('Lỗi lấy sản phẩm nổi bật:', err)
        setFeaturedProducts(fallbackProducts)
      } finally {
        setLoadingFeatured(false)
      }
    }
    fetchFeaturedProducts()
  }, [])

  // ─── Gọi API lấy danh mục ───────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`)
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        } else {
          setCategories([{ _id: '1', name: 'CPU', slug: 'cpu' }, { _id: '2', name: 'VGA', slug: 'gpu' }])
        }
      } catch (err) {
        console.error('Lỗi lấy danh mục:', err)
        setCategories([{ _id: '1', name: 'CPU', slug: 'cpu' }, { _id: '2', name: 'VGA', slug: 'gpu' }])
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // ─── Blogs & FAQs (giữ nguyên static vì chưa có API) ────────
  const blogs = [
    {
      id: 1,
      tag: 'HƯỚNG DẪN',
      title: 'Hướng dẫn chọn cấu hình PC gaming 2024 phù hợp với bạn',
      date: '20/05/2024',
      image: new URL('../assets/images/blog1.png', import.meta.url).href
    },
    {
      id: 2,
      tag: 'KIẾN THỨC',
      title: 'CPU có nhân và luồng là gì? Hiểu đúng để chọn CPU tốt',
      date: '18/05/2024',
      image: new URL('../assets/images/blog2.png', import.meta.url).href
    },
    {
      id: 3,
      tag: 'BUILD PC',
      title: 'Build PC trắng đẹp 2024 — Stealth design & hiệu năng cao',
      date: '15/05/2024',
      image: new URL('../assets/images/blog3.png', import.meta.url).href
    }
  ]

  const faqs = [
    'WINNOTECH có bán hàng chính hãng không?',
    'Chính sách bảo hành như thế nào?',
    'Phương thức thanh toán nào được hỗ trợ?',
    'Thời gian giao hàng là bao lâu?'
  ]

  const handleAddToCart = () => {
    setCartCount(cartCount + 1)
  }

  // ─── Helper: format giá tiền từ DB (số) → chuỗi "8.990.000đ" ─
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ'
    return price.toLocaleString('vi-VN') + 'đ'
  }

  // ─── Helper: lấy ảnh đầu tiên của sản phẩm ─────────────────
  const getProductImage = (product) => {
    if (product.AnhSP && product.AnhSP.length > 0) {
      return product.AnhSP[0].url
    }
    return null // trả về null nếu không có ảnh
  }

  // ─── Helper: lấy giá và sale info cho sản phẩm ──────────────
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

  // ─── Lọc sản phẩm theo tìm kiếm (Frontend) ─────────────────
  const searchParams = new URLSearchParams(window.location.search)
  const searchQuery = (searchParams.get('search') || '').toLowerCase()

  const filteredNewProducts = newProducts.filter(p => p.name.toLowerCase().includes(searchQuery))
  const filteredSaleProducts = saleProducts.filter(p => p.name.toLowerCase().includes(searchQuery))
  const filteredFeaturedProducts = featuredProducts.filter(p => p.name.toLowerCase().includes(searchQuery))


  return (
    <DefaultLayout>
      {/* HERO */}
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

      {/* TRUST BAR */}
      <div className="trustbar">
        <div className="trustbar-inner">
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="trust-title">CẤU HÌNH ĐA DẠNG</div>
              <div className="trust-sub">Đáp ứng mọi nhu cầu</div>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              </svg>
            </div>
            <div>
              <div className="trust-title">LINH KIỆN CHÍNH HÃNG</div>
              <div className="trust-sub">100% chính hãng, chất lượng cao</div>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <div className="trust-title">HỖ TRỢ KỸ THUẬT 24/7</div>
              <div className="trust-sub">Đội ngũ kỹ thuật chuyên nghiệp</div>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div className="trust-title">THANH TOÁN AN TOÀN</div>
              <div className="trust-sub">Bảo mật tuyệt đối</div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY */}
      <section className="category-section">
        <div className="section-inner">
          <div className="cat-nav">
            <button>←</button>
            <button>→</button>
          </div>
          <div className="cat-layout">
            <div className="cat-left">
              <h2>
                DANH MỤC
                <br />
                NỔI BẬT
              </h2>
              <a href="#">XEM TẤT CẢ →</a>
            </div>
            <div className="cat-grid">
              {loadingCategories ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Đang tải danh mục...</div>
              ) : categories.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Chưa có danh mục nào</div>
              ) : (
                categories.slice(0, 4).map((cat) => (
                  <div key={cat._id} className="cat-card">
                    <div className="cat-card-name">{cat.name}</div>
                    <div className="cat-card-count">{cat.slug}</div>
                    <div className="cat-card-img">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {cat.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="products-section">
        <div className="section-inner">
          <div className="products-header">
            <div>
              <div className="section-label" style={{ color: 'var(--purple2)' }}>🔥 BÁN CHẠY NHẤT</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                TOP SẢN PHẨM
                <br />
                ĐANG BÁN CHẠY
              </h2>
            </div>
            <div className="products-header-right">
              <a href="#">XEM TẤT CẢ TOP SẢN PHẨM →</a>
              <div className="products-nav">
                <button>←</button>
                <button>→</button>
              </div>
            </div>
          </div>
          <div className="products-row">
            {loadingFeatured ? (
              <div className="products-empty">Đang tải sản phẩm nổi bật...</div>
            ) : filteredFeaturedProducts.length === 0 ? (
              <div className="products-empty">Chưa có sản phẩm nổi bật nào phù hợp</div>
            ) : (
              filteredFeaturedProducts.slice(0, 10).map((product) => {
                const imgUrl = getProductImage(product)
                const { originalPrice, currentPrice, hasSale, salePercent } = getProductPriceInfo(product)
                return (
                  <Link key={product._id} to={`/product/${product.slug}`} className="product-link">
                  <div className="product-card">
                    {hasSale && (
                      <div className="product-sale-badge">
                        -{salePercent}%
                      </div>
                    )}
                    <div className="item-visual-box">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-cat">
                        {product.cat_id?.name || product.brand_id?.name || 'Linh kiện PC'}
                      </div>
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
                          <button className="btn-cart" onClick={(e) => { e.preventDefault(); handleAddToCart() }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                          </button>
                          <button className="btn-wishlist-home" onClick={(e) => { e.preventDefault() }} title="Thêm vào yêu thích">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* NEW PRODUCTS */}
      <section className="products-section">
        <div className="section-inner">
          <div className="products-header">
            <div>
              <div className="section-label">SẢN PHẨM MỚI</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                HÀNG MỚI VỀ
                <br />
                ĐÓN ĐẦU CÔNG NGHỆ MỚI
              </h2>
            </div>
            <div className="products-header-right">
              <a href="#">XEM TẤT CẢ SẢN PHẨM →</a>
              <div className="products-nav">
                <button>←</button>
                <button>→</button>
              </div>
            </div>
          </div>
          <div className="products-row">
            {loadingNew ? (
              <div className="products-empty">Đang tải sản phẩm mới...</div>
            ) : filteredNewProducts.length === 0 ? (
              <div className="products-empty">Chưa có sản phẩm mới nào phù hợp</div>
            ) : (
              filteredNewProducts.map((product) => {
                const imgUrl = getProductImage(product)
                const { originalPrice, currentPrice, hasSale, salePercent } = getProductPriceInfo(product)
                return (
                  <Link key={product._id} to={`/product/${product.slug}`} className="product-link">
                  <div className="product-card">
                    {hasSale && (
                      <div className="product-sale-badge">
                        -{salePercent}%
                      </div>
                    )}
                    <div className="item-visual-box">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-cat">
                        {product.cat_id?.name || product.brand_id?.name || 'Linh kiện PC'}
                      </div>
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
                          <button className="btn-cart" onClick={(e) => { e.preventDefault(); handleAddToCart() }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                          </button>
                          <button className="btn-wishlist-home" onClick={(e) => { e.preventDefault() }} title="Thêm vào yêu thích">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </section>


      {/* DISCOUNTED PRODUCTS */}
      <section className="products-section products-section-sale">
        <div className="section-inner">
          <div className="products-header">
            <div>
              <div className="section-label section-label-yellow">SIÊU ƯU ĐÃI</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                SẢN PHẨM GIẢM GIÁ
                <br />
                SĂN DEAL HỜI CỰC KHỦNG
              </h2>
            </div>
            <div className="products-header-right">
              <a href="#">XEM TẤT CẢ KHUYẾN MÃI →</a>
              <div className="products-nav">
                <button>←</button>
                <button>→</button>
              </div>
            </div>
          </div>
          <div className="products-row">
            {loadingSale ? (
              <div className="products-empty">Đang tải sản phẩm giảm giá...</div>
            ) : filteredSaleProducts.length === 0 ? (
              <div className="products-empty">Không có sản phẩm giảm giá nào phù hợp</div>
            ) : (
              filteredSaleProducts.map((product) => {
                const imgUrl = getProductImage(product)
                const { originalPrice, currentPrice, hasSale, salePercent } = getProductPriceInfo(product)
                return (
                  <Link key={product._id} to={`/product/${product.slug}`} className="product-link">
                  <div className="product-card">
                    {hasSale && (
                      <div className="product-sale-badge">
                        -{salePercent}%
                      </div>
                    )}
                    <div className="item-visual-box">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-cat">
                        {product.cat_id?.name || product.brand_id?.name || 'Linh kiện PC'}
                      </div>
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
                          <button className="btn-cart" onClick={(e) => { e.preventDefault(); handleAddToCart() }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                          </button>
                          <button className="btn-wishlist-home" onClick={(e) => { e.preventDefault() }} title="Thêm vào yêu thích">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="blog-section">
        <div className="section-inner">
          <div className="blog-header">
            <div>
              <div className="section-label">KIẾN THỨC & HƯỚNG DẪN</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                NÂNG TẦM TRẢI NGHIỆM
              </h2>
            </div>
            <a
              href="#"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              XEM TẤT CẢ BÀI VIẾT →
            </a>
          </div>
          <div className="blog-grid">
            {blogs.map((blog) => (
              <div key={blog.id} className="blog-card">
                <div className="blog-img">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="blog-body">
                  <div className="blog-tag">{blog.tag}</div>
                  <div className="blog-title">{blog.title}</div>
                  <div className="blog-footer">
                    <div className="blog-date">{blog.date}</div>
                    <a href="#" className="blog-read">
                      Đọc thêm →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* NEWSLETTER */}
      <section className="newsletter-section">
        <div className="newsletter-inner">
          <div className="newsletter-left">
            <h2>
              LUÔN CẬP NHẬT
              <br />
              <span>CÔNG NGHỆ MỚI</span>
            </h2>
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