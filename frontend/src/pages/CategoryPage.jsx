import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/cpu.css'

const API_URL = 'http://localhost:3000'

const FILTER_CONFIG = {
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

export default function CategoryPage({ slug, title }) {
  const [products, setProducts] = useState([])
  const [categoryName, setCategoryName] = useState(title)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  
  // Accordion open/close states
  const [openFilters, setOpenFilters] = useState({
    brands: true,
    custom1: true,
    custom2: true,
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
        const res = await fetch(`${API_URL}/categories/${slug}`)
        const data = await res.json()
        if (data.success) {
          setProducts(data.data.products || [])
          setCategoryName(data.data.category.name || title)
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

  // Get current filter configuration
  const filters = FILTER_CONFIG[slug] || []
  const brandFilter = filters.find(f => f.key === 'brands')
  const customFilters = filters.filter(f => f.key !== 'brands')

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
    const productBrand = product.brand_id?.slug || ''
    return selectedBrands.includes(productBrand.toLowerCase())
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
      return mainImg ? mainImg.url : product.AnhSP[0].url
    }
    return product.thumnail || 'https://placehold.co/600x400/1a1a2e/7c3aed?text=No+Image'
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
              {/* BRAND FILTER */}
              {brandFilter && (
                <div className="filter-group">
                  <div className="filter-title" onClick={() => toggleFilter('brands')}>
                    {brandFilter.title}
                    <span className={`accordion-icon ${openFilters.brands ? 'open' : ''}`}>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                        <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                  {openFilters.brands && (
                    <div className="filter-options">
                      {brandFilter.options.map(opt => (
                        <label key={opt.value} className="filter-label">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(opt.value)}
                            onChange={(e) => handleBrandChange(opt.value, e.target.checked)}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC ADDITIONAL FILTERS */}
              {customFilters.map((filter, index) => {
                const stateKey = `custom${index + 1}`
                const isOpen = openFilters[stateKey] !== false
                return (
                  <div key={filter.key} className="filter-group">
                    <div className="filter-title" onClick={() => toggleFilter(stateKey)}>
                      {filter.title}
                      <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                          <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    {isOpen && (
                      <div className="filter-options">
                        {filter.options.map(opt => (
                          <label key={opt.value} className="filter-label">
                            <input type="checkbox" />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* PRICE RANGE FILTER */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('priceRange')}>
                  Tầm Giá
                  <span className={`accordion-icon ${openFilters.priceRange ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.priceRange && (
                  <div className="price-range">
                    <div className="custom-slider-wrapper">
                      <div className="slider-track-line">
                        <span className="slider-dot active" style={{left: '0%'}}></span>
                        <span className="slider-dot active" style={{left: '33.33%'}}></span>
                        <span className="slider-dot active" style={{left: '66.66%'}}></span>
                        <span className="slider-dot active" style={{left: '100%'}}></span>
                        <div className="slider-active-line" style={{left: '0%', width: '100%'}}></div>
                      </div>
                    </div>
                    <div className="price-labels">
                      <span>9.990.000đ</span>
                      <span>18.990.000đ</span>
                    </div>
                  </div>
                )}
              </div>
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
                  
                  <div className="view-modes-group">
                    <button className={`btn-view-mode ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    </button>
                    <button className={`btn-view-mode ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="6" x2="8" y2="6" />
                        <line x1="12" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="8" y2="12" />
                        <line x1="12" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="8" y2="18" />
                        <line x1="12" y1="18" x2="21" y2="18" />
                      </svg>
                    </button>
                    <button className={`btn-view-mode ${viewMode === 'detail' ? 'active' : ''}`} onClick={() => setViewMode('detail')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <line x1="15" y1="3" x2="15" y2="21" />
                      </svg>
                    </button>
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
                    return (
                      <div key={product._id} className="cpu-card">
                        <div className="cpu-card-img">
                          <img src={image} alt={product.name} />
                        </div>
                        <div className="cpu-card-info">
                          <h3 className="cpu-card-name">{product.name}</h3>
                          <p className="cpu-card-specs">{product.short_desc || 'Sản phẩm công nghệ cao'}</p>
                          <div className="cpu-card-footer">
                            <span className="cpu-card-price">{formatPrice(price)}</span>
                            <div className="cpu-card-actions">
                              <button className="btn-add-cart" title="Thêm vào giỏ">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="#000">
                                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                              </button>
                              <button className="btn-wishlist" title="Thêm vào yêu thích">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <div className="cpu-footer-row">
                  <button className="btn-show-more">Show More</button>
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
