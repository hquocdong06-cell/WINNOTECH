import React, { useState } from 'react'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/cpu.css'

export default function CPU() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    brands: [],
    productLine: [],
    socket: [],
    coresThreads: [],
    priceRange: [9990000, 18990000]
  })
  const [openFilters, setOpenFilters] = useState({
    brands: true,
    productLine: true,
    socket: true,
    coresThreads: true,
    priceRange: true
  })
  const [viewMode, setViewMode] = useState('grid')

  const toggleFilter = (key) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const cpuProducts = [
    {
      id: 1,
      name: 'Intel Core i9-14900K',
      specs: 'Desktop Cores 1 Socket',
      price: '18.490.000đ',
      image: '/src/assets/images/cpu1.png'
    },
    {
      id: 2,
      name: 'Intel Core i9-14900K',
      specs: 'Desktop Cores 1 Socket',
      price: '16.990.000đ',
      image: '/src/assets/images/cpu1.png'
    },
    {
      id: 3,
      name: 'AMD Ryzen 9 7950X',
      specs: 'Desktop 1 Cores Socket 21',
      price: '16.990.000đ',
      image: '/src/assets/images/cpu1.png'
    },
    {
      id: 4,
      name: 'Intel Core i9-14900K',
      specs: 'Desktop Cores 1 Socket',
      price: '18.490.000đ',
      image: '/src/assets/images/cpu1.png'
    },
    {
      id: 5,
      name: 'AMD Ryzen 9 7950X',
      specs: 'Desktop 1 Cores Socket U7',
      price: '16.990.000đ',
      image: '/src/assets/images/cpu1.png'
    },
    {
      id: 6,
      name: 'AMD Ryzen 9 7950X',
      specs: 'Clock speed 1 Cores Socket 19',
      price: '13.990.000đ',
      image: '/src/assets/images/cpu1.png'
    },
    {
      id: 7,
      name: 'Intel Core i9-14900K',
      specs: 'Desktop Cores 1 Socket 12',
      price: '18.490.000đ',
      image: '/src/assets/images/cpu1.png'
    },
    {
      id: 8,
      name: 'AMD Ryzen 9 7950X',
      specs: 'Desktop 1 Cores Socket 12',
      price: '13.490.000đ',
      image: '/src/assets/images/cpu1.png'
    },
    {
      id: 9,
      name: 'AMD Ryzen 9 7950X',
      specs: 'Clock speed 1 Cores 7',
      price: '16.990.000đ',
      image: '/src/assets/images/cpu1.png'
    }
  ]

  const brandsData = [
    { label: 'Intel', value: 'intel' },
    { label: 'AMD', value: 'amd' }
  ]

  const productLineData = [
    { label: 'Core i9', value: 'corei9' },
    { label: 'Core i7', value: 'corei7' },
    { label: 'Ryzen 9', value: 'ryzen9' },
    { label: 'Ryzen 7', value: 'ryzen7' }
  ]

  const socketData = [
    { label: 'S2-1', value: 's2-1' },
    { label: 'B1-5', value: 'b1-5' },
    { label: 'AMD', value: 'amd-socket' }
  ]

  const coresThreadsData = [
    { label: '3 - 8v4', value: '3-8' },
    { label: 'Số Nhân/Luồng', value: 'all' }
  ]

  const handleFilterChange = (category, value, isChecked) => {
    if (isChecked) {
      setFilters({
        ...filters,
        [category]: [...filters[category], value]
      })
    } else {
      setFilters({
        ...filters,
        [category]: filters[category].filter(item => item !== value)
      })
    }
  }

  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value)
    if (type === 'min') {
      setFilters({
        ...filters,
        priceRange: [Math.min(value, filters.priceRange[1]), filters.priceRange[1]]
      })
    } else {
      setFilters({
        ...filters,
        priceRange: [filters.priceRange[0], Math.max(value, filters.priceRange[0])]
      })
    }
  }

  const itemsPerPage = 9
  const totalPages = Math.ceil(cpuProducts.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const visibleProducts = cpuProducts.slice(startIdx, startIdx + itemsPerPage)

  return (
    <DefaultLayout>
      {/* CPU PRODUCTS SECTION */}
      <section className="cpu-section">
        <div className="cpu-section-inner">
          {/* BREADCRUMB */}
          <div className="breadcrumb">
            <a href="/">Trang chủ</a>
            <span>/</span>
            <span className="active">Sản phẩm</span>
            <span>/</span>
            <span className="active">BỘ VI XỬ LÝ CPU</span>
          </div>

          {/* MAIN LAYOUT */}
          <div className="cpu-layout">
            {/* LEFT SIDEBAR - FILTERS */}
            <aside className="cpu-sidebar">
              {/* BRAND FILTER */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('brands')}>
                  Hãng
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
                          checked={filters.brands.includes(brand.value)}
                          onChange={(e) => handleFilterChange('brands', brand.value, e.target.checked)}
                        />
                        <span>{brand.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* PRODUCT LINE FILTER */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('productLine')}>
                  Dòng Sản Phẩm
                  <span className={`accordion-icon ${openFilters.productLine ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.productLine && (
                  <div className="filter-options">
                    {productLineData.map(line => (
                      <label key={line.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.productLine.includes(line.value)}
                          onChange={(e) => handleFilterChange('productLine', line.value, e.target.checked)}
                        />
                        <span>{line.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* SOCKET FILTER */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('socket')}>
                  Socket
                  <span className={`accordion-icon ${openFilters.socket ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.socket && (
                  <div className="filter-options">
                    {socketData.map(socket => (
                      <label key={socket.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.socket.includes(socket.value)}
                          onChange={(e) => handleFilterChange('socket', socket.value, e.target.checked)}
                        />
                        <span>{socket.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* CORES/THREADS FILTER */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('coresThreads')}>
                  Số Nhân/Luồng
                  <span className={`accordion-icon ${openFilters.coresThreads ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.coresThreads && (
                  <div className="filter-options">
                    {coresThreadsData.map(cores => (
                      <label key={cores.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.coresThreads.includes(cores.value)}
                          onChange={(e) => handleFilterChange('coresThreads', cores.value, e.target.checked)}
                        />
                        <span>{cores.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

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
                <h1>BỘ VI XỬ LÝ CPU</h1>
                
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

              {/* PRODUCTS GRID */}
              <div className="cpu-grid">
                {visibleProducts.map(product => (
                  <div key={product.id} className="cpu-card">
                    <div className="cpu-card-img">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="cpu-card-info">
                      <h3 className="cpu-card-name">{product.name}</h3>
                      <p className="cpu-card-specs">{product.specs}</p>
                      <div className="cpu-card-footer">
                        <span className="cpu-card-price">{product.price}</span>
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
                ))}
              </div>

              {/* FOOTER / PAGINATION AREA */}
              <div className="cpu-footer-row">
                <button className="btn-show-more">Show More</button>
                <div className="cpu-pagination-right">
                  <span className="pagination-label">Products</span>
                  <button className="page-nav-btn" disabled>&lt;</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="page-nav-btn">&gt;</button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </DefaultLayout>
  )
}
