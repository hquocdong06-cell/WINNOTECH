import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import useFavorite from '../hooks/useFavorite'
import useCompare from '../hooks/useCompare'
import { useAuth } from '../hooks/useAuth'
import RecentlyViewedSidebar from '../components/RecentlyViewedSidebar'

const API_URL = 'http://localhost:3000'

const FILTER_CONFIG = {
  all: [
    { title: 'Hãng sản xuất', key: 'brands', options: [
      { label: 'ASUS', value: 'asus' },
      { label: 'MSI', value: 'msi' },
      { label: 'Gigabyte', value: 'gigabyte' },
      { label: 'AMD', value: 'amd' },
      { label: 'Intel', value: 'intel' },
      { label: 'Kingston', value: 'kingston' },
      { label: 'Corsair', value: 'corsair' },
      { label: 'Samsung', value: 'samsung' },
      { label: 'NZXT', value: 'nzxt' }
    ]}
  ],
  gpu: [
    { title: 'Hãng', key: 'brands', options: [{ label: 'ASUS', value: 'asus' }, { label: 'MSI', value: 'msi' }, { label: 'Gigabyte', value: 'gigabyte' }] },
    { title: 'Dòng GPU', key: 'vgaLine', options: [{ label: 'RTX 4070 Ti Super', value: '4070-ti-super' }, { label: 'RTX 4060', value: '4060' }] },
    { title: 'Dung lượng VRAM', key: 'vram', options: [{ label: '8GB', value: '8gb' }, { label: '16GB', value: '16gb' }] }
  ],
  ram: [
    { title: 'Hãng', key: 'brands', options: [{ label: 'Kingston', value: 'kingston' }, { label: 'Corsair', value: 'corsair' }] },
    { title: 'Dung lượng', key: 'capacity', options: [{ label: '32GB', value: '32gb' }, { label: '16GB', value: '16gb' }] },
    { title: 'Chuẩn RAM', key: 'type', options: [{ label: 'DDR5', value: 'ddr5' }] }
  ],
  storage: [
    { title: 'Hãng', key: 'brands', options: [{ label: 'Samsung', value: 'samsung' }, { label: 'Western Digital', value: 'western-digital' }] },
    { title: 'Dung lượng', key: 'capacity', options: [{ label: '1TB', value: '1tb' }, { label: '2TB', value: '2tb' }] },
    { title: 'Chuẩn giao tiếp', key: 'type', options: [{ label: 'M.2 NVMe', value: 'nvme' }] }
  ],
  mainboard: [
    { title: 'Hãng', key: 'brands', options: [{ label: 'MSI', value: 'msi' }, { label: 'ASUS', value: 'asus' }] },
    { title: 'Socket', key: 'socket', options: [{ label: 'AM5', value: 'am5' }, { label: 'LGA1700', value: 'lga1700' }] },
    { title: 'Chipset', key: 'chipset', options: [{ label: 'B650', value: 'b650' }, { label: 'B760', value: 'b760' }] }
  ],
  psu: [
    { title: 'Hãng', key: 'brands', options: [{ label: 'Corsair', value: 'corsair' }] },
    { title: 'Công suất', key: 'wattage', options: [{ label: '850W', value: '850w' }] },
    { title: 'Chuẩn hiệu suất', key: 'efficiency', options: [{ label: '80 Plus Gold', value: 'gold' }] }
  ],
  cooling: [
    { title: 'Hãng', key: 'brands', options: [{ label: 'NZXT', value: 'nzxt' }] },
    { title: 'Loại tản nhiệt', key: 'type', options: [{ label: 'Tản nhiệt nước AIO', value: 'aio' }] },
    { title: 'Kích thước két nước', key: 'radSize', options: [{ label: '280mm', value: '280mm' }] }
  ],
  case: [
    { title: 'Hãng', key: 'brands', options: [{ label: 'NZXT', value: 'nzxt' }, { label: 'Corsair', value: 'corsair' }] },
    { title: 'Màu sắc', key: 'color', options: [{ label: 'Đen', value: 'den' }, { label: 'Trắng', value: 'trang' }] }
  ]
}

const brandsData = [
  { label: 'AMD', value: 'amd' },
  { label: 'Intel', value: 'intel' },
  { label: 'ASUS', value: 'asus' },
  { label: 'MSI', value: 'msi' },
  { label: 'Gigabyte', value: 'gigabyte' },
  { label: 'Kingston', value: 'kingston' },
  { label: 'Corsair', value: 'corsair' },
  { label: 'Samsung', value: 'samsung' },
  { label: 'NZXT', value: 'nzxt' }
]

const useCaseData = [
  { label: 'Gaming', value: 'gaming' },
  { label: 'Đồ họa - Kỹ thuật', value: 'do-hoa-ky-thuat' },
  { label: 'Văn phòng', value: 'van-phong' },
  { label: 'Doanh nghiệp', value: 'doanh-nghiep' },
  { label: 'Học sinh - Sinh viên', value: 'hoc-sinh-sinh-vien' }
]

const seriesData = [
  { label: 'Core i3 / i5 / i7 / i9', value: 'intel-core' },
  { label: 'Ryzen 3 / 5 / 7 / 9', value: 'amd-ryzen' },
  { label: 'RTX 40 Series / RTX 30 Series', value: 'rtx-series' },
  { label: 'DDR5 / DDR4 RAM', value: 'ram-ddr' },
  { label: 'SSD NVMe M.2 / SATA3', value: 'ssd-nvme' }
]

const socketData = [
  { label: 'LGA1700', value: 'lga1700' },
  { label: 'AM5', value: 'am5' },
  { label: 'AM4', value: 'am4' },
  { label: 'LGA1200', value: 'lga1200' },
  { label: 'PCIe 4.0 / PCIe 5.0', value: 'pcie' }
]

export default function CategoryPage({ slug, title }) {
  const dispatch = useDispatch()
  const { favoriteIds, toggleFavorite } = useFavorite()
  const { compareIds, toggleCompare } = useCompare()
  const { isLoggedIn } = useAuth()
  const [products, setProducts] = useState([])
  const [categoryName, setCategoryName] = useState(title || 'Tất cả sản phẩm')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [viewMode, setViewMode] = useState('grid')

  const handleQuickAddToCart = async (product) => {
    const defaultVariant = product.Variants?.find(v => v.variant_name === 'Mặc định') || product.Variants?.[0];
    if (!defaultVariant) {
      toast.error('Sản phẩm chưa có biến thể sẵn sàng!', { position: 'bottom-right' })
      return
    }
    if (defaultVariant.stock_quantity !== undefined && defaultVariant.stock_quantity <= 0) {
      toast.error('Sản phẩm này đã hết hàng!', { position: 'bottom-right' })
      return
    }

    const currentPrice = defaultVariant.sale_price > 0 ? defaultVariant.sale_price : defaultVariant.price
    const imgUrl = getProductImage(product)
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
      toast.success('Đã thêm vào giỏ hàng!', { position: 'bottom-right' })
      return
    }

    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: defaultVariant._id, quantity: 1 })
      })
      const data = await res.json()

      if (res.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!', { position: 'bottom-right' })
        return
      }
      if (!data.success) {
        toast.error(data.message || 'Lỗi khi thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right' })
        return
      }

      dispatch(addToCart(cartPayload))
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right' })
    } catch (err) {
      toast.error('Lỗi khi thêm vào giỏ hàng!', { position: 'bottom-right' })
    }
  }
  
  // Accordion open/close states
  const [openFilters, setOpenFilters] = useState({
    brands: true,
    useCase: true,
    series: true,
    socket: true,
    priceRange: true
  })

  const toggleFilter = (key) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Fetch category data when slug changes
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true)
      try {
        const isAll = !slug || slug === 'all'
        const endpoint = isAll ? `${API_URL}/products` : `${API_URL}/categories/${slug}`
        const res = await fetch(endpoint)
        const data = await res.json()
        if (data.success) {
          if (isAll) {
            setProducts(Array.isArray(data.data) ? data.data : [])
            setCategoryName(title || 'Tất cả sản phẩm')
          } else {
            setProducts(data.data.products || [])
            setCategoryName(data.data.category?.name || title)
          }
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm theo danh mục:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchCategoryProducts()
    setSelectedBrands([])
    setCurrentPage(1)
  }, [slug])

  const handleBrandChange = (brandValue, checked) => {
    if (checked) {
      setSelectedBrands(prev => [...prev, brandValue])
    } else {
      setSelectedBrands(prev => prev.filter(v => v !== brandValue))
    }
    setCurrentPage(1)
  }

  // Filter products by selected brands
  const filteredProducts = products.filter(product => {
    if (selectedBrands.length === 0) return true
    const productBrand = (product.brand_id?.slug || product.brand_id?.name || '').toLowerCase()
    const productName = (product.name || '').toLowerCase()
    return selectedBrands.some(b => productBrand.includes(b) || productName.includes(b))
  })

  // Pagination helper
  const itemsPerPage = 9
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1
  const startIdx = (currentPage - 1) * itemsPerPage
  const visibleProducts = filteredProducts.slice(startIdx, startIdx + itemsPerPage)

  const formatPrice = (price) => {
    return price ? price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'
  }

  const getProductImage = (product) => {
    if (product.AnhSP && product.AnhSP.length > 0) {
      const mainImg = product.AnhSP.find(img => img.is_main)
      const url = mainImg ? mainImg.url : product.AnhSP[0].url
      return url.startsWith('http') ? url : `${API_URL}${url}`
    }
    if (product.thumnail) {
      return product.thumnail.startsWith('http') ? product.thumnail : `${API_URL}${product.thumnail}`
    }
    return 'https://placehold.co/600x400/1a1a2e/7c3aed?text=No+Image'
  }

  const getProductPrice = (product) => {
    if (product.Variants && product.Variants.length > 0) {
      return product.Variants[0].sale_price || product.Variants[0].price
    }
    return 0
  }

  return (
    <DefaultLayout>
      <section className="cpu-section">
        <div className="cpu-section-inner">
          {/* BREADCRUMB */}
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span className="active">Sản phẩm</span>
            <span>/</span>
            <span className="active">{categoryName.toUpperCase()}</span>
          </div>

          {/* MAIN LAYOUT */}
          <div className="cpu-layout">
            {/* LEFT SIDEBAR - FILTERS */}
            <aside className="cpu-sidebar">
              {/* PRICE RANGE FILTER */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('priceRange')}>
                  Khoảng giá
                  <span className={`accordion-icon ${openFilters.priceRange ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.priceRange && (
                  <div className="price-range">
                    <div className="price-inputs" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <input type="text" value="0đ" disabled style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                      <input type="text" value="420.000.000đ" disabled style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
                    </div>
                    <div className="custom-slider-wrapper">
                      <div className="slider-track-line">
                        <span className="slider-dot active" style={{left: '0%'}}></span>
                        <span className="slider-dot active" style={{left: '100%'}}></span>
                        <div className="slider-active-line" style={{left: '0%', width: '100%'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BRAND FILTER */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('brands')}>
                  Thương hiệu
                  <span className={`accordion-icon ${openFilters.brands ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.brands && (
                  <div className="filter-options">
                    {brandsData.map(brand => (
                      <label key={brand.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.value)}
                          onChange={(e) => handleBrandChange(brand.value, e.target.checked)}
                        />
                        <span>{brand.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* NHU CẦU */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('useCase')}>
                  Nhu cầu
                  <span className={`accordion-icon ${openFilters.useCase ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.useCase && (
                  <div className="filter-options">
                    {useCaseData.map(uc => (
                      <label key={uc.value} className="filter-label">
                        <input type="checkbox" />
                        <span>{uc.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* SERIES */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('series')}>
                  Dòng sản phẩm / Series
                  <span className={`accordion-icon ${openFilters.series ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.series && (
                  <div className="filter-options">
                    {seriesData.map(s => (
                      <label key={s.value} className="filter-label">
                        <input type="checkbox" />
                        <span style={{ fontSize: '12px' }}>{s.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* SOCKET */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('socket')}>
                  Socket / Chuẩn kết nối
                  <span className={`accordion-icon ${openFilters.socket ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.socket && (
                  <div className="filter-options">
                    {socketData.map(sock => (
                      <label key={sock.value} className="filter-label">
                        <input type="checkbox" />
                        <span>{sock.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* SẢN PHẨM ĐÃ XEM WIDGET */}
              <RecentlyViewedSidebar />
            </aside>

            {/* MAIN CONTENT - PRODUCTS */}
            <main className="cpu-main">
              {/* HEADER */}
              <div className="cpu-main-header">
                <h1>{categoryName.toUpperCase()}</h1>
                
                <div className="cpu-main-header-right">
                  <div className="cpu-sort">
                    <select defaultValue="popular">
                      <option value="popular">Sắp xếp theo</option>
                      <option value="price-asc">Giá: Thấp đến Cao</option>
                      <option value="price-desc">Giá: Cao đến Thấp</option>
                      <option value="newest">Mới nhất</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* LOADING STATE OR DYNAMIC PRODUCTS GRID */}
              {loading ? (
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Đang tải sản phẩm...</div>
              ) : visibleProducts.length === 0 ? (
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Không tìm thấy sản phẩm nào trong danh mục này.</div>
              ) : (
                <div className="cpu-grid">
                  {visibleProducts.map(product => {
                    const price = getProductPrice(product)
                    const image = getProductImage(product)
                    const defaultVariant = product.Variants?.find(v => v.variant_name === 'Mặc định') || product.Variants?.[0]
                    const isOutOfStock = defaultVariant && defaultVariant.stock_quantity !== undefined ? defaultVariant.stock_quantity <= 0 : false

                    return (
                      <div key={product._id} className="cpu-card" style={isOutOfStock ? { opacity: 0.85 } : {}}>
                        {isOutOfStock ? (
                          <div className="cpu-card-sale-badge" style={{ background: '#ef4444' }}>Hết hàng</div>
                        ) : (
                          product.sale > 0 && <div className="cpu-card-sale-badge">-{product.sale}%</div>
                        )}
                        <div className="cpu-card-img">
                          <Link to={`/product/${product.slug || product._id}`}>
                            <img src={image} alt={product.name} />
                          </Link>
                        </div>
                        <div className="cpu-card-info">
                          <h3 className="cpu-card-name">
                            <Link to={`/product/${product.slug || product._id}`}>{product.name}</Link>
                          </h3>
                          <p className="cpu-card-specs">{product.short_desc || 'Sản phẩm công nghệ cao'}</p>
                          <div className="cpu-card-footer">
                            <div className="cpu-card-price-wrap">
                              <span className="cpu-card-price">{formatPrice(price)}</span>
                              {product.sale > 0 && product.Variants?.[0]?.price && (
                                <span className="cpu-card-original-price">
                                  {formatPrice(product.Variants[0].price)}
                                </span>
                              )}
                            </div>
                            <div className="cpu-card-actions">
                              <button 
                                className="btn-add-cart" 
                                title={isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                                disabled={isOutOfStock}
                                onClick={(e) => { e.preventDefault(); handleQuickAddToCart(product); }}
                                style={isOutOfStock ? { background: '#222', cursor: 'not-allowed', borderColor: '#333', opacity: 0.5 } : {}}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff">
                                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                              </button>
                              <button 
                                className="btn-wishlist" 
                                title={compareIds.has(String(product._id)) ? 'Bỏ so sánh' : 'So sánh'}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (!isLoggedIn) { toast.warning('Vui lòng đăng nhập để sử dụng tính năng so sánh', { position: 'bottom-right' }); return; }
                                  await toggleCompare(product._id);
                                  if (!compareIds.has(String(product._id))) {
                                    toast.success(
                                      <span>Đã thêm vào so sánh! <Link to="/compare" style={{color:'#d4ff00',fontWeight:700}}>Xem ngay →</Link></span>,
                                      { position: 'bottom-right', autoClose: 3000 }
                                    );
                                  }
                                }}
                                style={{ color: compareIds.has(String(product._id)) ? '#d4ff00' : undefined }}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                                </svg>
                              </button>
                              <button 
                                className="btn-wishlist" 
                                title="Thêm vào yêu thích"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleFavorite(product._id);
                                }}
                              >
                                <svg 
                                  width="15" 
                                  height="15" 
                                  viewBox="0 0 24 24" 
                                  fill={favoriteIds.has(product._id) ? "#ef4444" : "none"} 
                                  stroke={favoriteIds.has(product._id) ? "#ef4444" : "currentColor"} 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* FOOTER / PAGINATION AREA */}
              {totalPages > 1 && (
                <div className="cpu-footer-row" style={{ justifyContent: 'center', marginTop: '16px', paddingTop: '16px' }}>
                  <div className="cpu-pagination-right">
                    <span className="pagination-label">Products</span>
                    <button 
                      className="page-nav-btn" 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      className="page-nav-btn"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </DefaultLayout>
  )
}
