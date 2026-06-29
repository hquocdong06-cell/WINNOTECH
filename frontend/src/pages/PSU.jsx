import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/cpu.css' // Reuse the sidebar layout styles

const API_URL = 'http://localhost:3000'

// --- FILTER OPTIONS DATA MATCHING USER'S PSU IMAGE ---
const brandsData = [
  { label: 'Acbel', value: 'acbel' },
  { label: 'Adata', value: 'adata' },
  { label: 'Antec', value: 'antec' },
  { label: 'Arrow', value: 'arrow' },
  { label: 'Corsair', value: 'corsair' },
  { label: 'Cooler Master', value: 'cooler-master' },
  { label: 'Deepcool', value: 'deepcool' },
  { label: 'Gigabyte', value: 'gigabyte' },
  { label: 'MSI', value: 'msi' },
  { label: 'ASUS', value: 'asus' },
  { label: 'Seasonic', value: 'seasonic' },
  { label: 'ThermalTake', value: 'thermaltake' }
]

const seriesData = [
  { label: 'CX', value: 'cx' },
  { label: 'HX', value: 'hx' },
  { label: 'HXI SHIFT Series', value: 'hxi-shift' },
  { label: 'HXI Series', value: 'hxi' },
  { label: 'MAG', value: 'mag' },
  { label: 'MEG', value: 'meg' },
  { label: 'MWE', value: 'mwe' },
  { label: 'MWE Gold', value: 'mwe-gold' },
  { label: 'Prime', value: 'prime' },
  { label: 'RMe Series', value: 'rme' },
  { label: 'RMx', value: 'rmx' }
]

const wattageData = [
  { label: '1000W', value: '1000w' },
  { label: '1050W', value: '1050w' },
  { label: '1200W', value: '1200w' },
  { label: '1250W', value: '1250w' },
  { label: '1500W', value: '1500w' },
  { label: '1600W', value: '1600w' },
  { label: '550W', value: '550w' },
  { label: '650W', value: '650w' },
  { label: '750W', value: '750w' },
  { label: '850W', value: '850w' }
]

const certificationsData = [
  { label: '80 Plus', value: '80-plus' },
  { label: '80 Plus Bronze', value: '80-plus-bronze' },
  { label: '80 Plus Gold', value: '80-plus-gold' },
  { label: '80 Plus Platinum', value: '80-plus-platinum' },
  { label: '80 Plus Silver', value: '80-plus-silver' },
  { label: '80 Plus Titanium', value: '80-plus-titanium' },
  { label: 'Cybenetics Gold', value: 'cybenetics-gold' },
  { label: 'Cybenetics Platinum', value: 'cybenetics-platinum' }
]

const cablesData = [
  { label: 'Full Modular', value: 'full-modular' },
  { label: 'Semi Modular', value: 'semi-modular' },
  { label: 'không hỗ trợ', value: 'non-modular' }
]

const sizesData = [
  { label: 'ATX', value: 'atx' },
  { label: 'SFX', value: 'sfx' }
]

// --- REALISTIC FALLBACK MOCK DATA ---
const mockPsuProducts = [
  {
    _id: 'mock-psu-1',
    name: 'Corsair SF850 - 850W - 80 Plus Platinum - Full Modular',
    short_desc: '850W, SFX, 80 Plus Platinum, Full Modular',
    description: 'Nguồn máy tính Corsair SF850 thiết kế nhỏ gọn SFX hiệu suất cao 80 Plus Platinum.',
    brand_id: { slug: 'corsair', name: 'Corsair' },
    slug: 'corsair-sf850-850w-80-plus-platinum',
    Variants: [{ price: 5190000, sale_price: 5190000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Corsair+SF850', is_main: true }]
  },
  {
    _id: 'mock-psu-2',
    name: 'Cooler Master MWE Gold 1250V2 - 1250W',
    short_desc: '1250W, ATX, 80 Plus Gold, Full Modular',
    description: 'Nguồn máy tính Cooler Master MWE Gold 1250W V2 chất lượng cao hỗ trợ PCIe 5.0.',
    brand_id: { slug: 'cooler-master', name: 'Cooler Master' },
    slug: 'cooler-master-mwe-gold-1250v2',
    Variants: [{ price: 4990000, sale_price: 4990000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=CM+MWE+Gold+1250', is_main: true }]
  },
  {
    _id: 'mock-psu-3',
    name: 'Cooler Master V Platinum 1600 V2 - 1600W',
    short_desc: '1600W, ATX, 80 Plus Platinum, Full Modular',
    description: 'Nguồn máy tính cao cấp Cooler Master V Platinum 1600 V2 công suất khủng 1600W.',
    brand_id: { slug: 'cooler-master', name: 'Cooler Master' },
    slug: 'cooler-master-v-platinum-1600-v2',
    Variants: [{ price: 8090000, sale_price: 7590000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=V+Platinum+1600', is_main: true }]
  },
  {
    _id: 'mock-psu-4',
    name: 'ASUS TUF Gaming 750W Gold',
    short_desc: '750W, ATX, 80 Plus Gold, Full Modular',
    description: 'Nguồn máy tính Asus TUF Gaming 750W Gold độ bền chuẩn quân đội.',
    brand_id: { slug: 'asus', name: 'ASUS' },
    slug: 'asus-tuf-gaming-750w-gold',
    Variants: [{ price: 2890000, sale_price: 2690000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=ASUS+TUF+750W', is_main: true }]
  }
]

export default function PSU() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popular')

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    brands: [],
    series: [],
    wattage: [],
    certification: [],
    cables: [],
    size: []
  })

  // --- ACCORDION OPEN/CLOSE STATES ---
  const [openFilters, setOpenFilters] = useState({
    priceRange: true,
    brands: true,
    series: true,
    wattage: true,
    certification: true,
    cables: true,
    size: true
  })

  // --- EXPAND FILTERS STATE ---
  const [expandedFilters, setExpandedFilters] = useState({
    brands: false,
    series: false,
    wattage: false,
    certification: false,
    cables: false,
    size: false
  })

  const toggleFilter = (key) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleExpand = (key) => {
    setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // --- FETCH PRODUCTS FROM BACKEND ---
  useEffect(() => {
    const fetchPSUProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/categories/psu`)
        const data = await res.json()
        if (data.success && data.data && data.data.products && data.data.products.length > 0) {
          setProducts(data.data.products)
        } else {
          setProducts(mockPsuProducts)
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm PSU, sử dụng dữ liệu mẫu:', err)
        setProducts(mockPsuProducts)
      } finally {
        setLoading(false)
      }
    }
    fetchPSUProducts()
  }, [])

  const handleFilterChange = (category, value, isChecked) => {
    if (isChecked) {
      setFilters(prev => ({
        ...prev,
        [category]: [...prev[category], value]
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        [category]: prev[category].filter(item => item !== value)
      }))
    }
    setCurrentPage(1)
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

  const formatPrice = (price) => {
    return price ? price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'
  }

  // --- FILTER & SORT LOGIC ---
  const filteredProducts = products.filter(product => {
    const nameLower = product.name.toLowerCase()
    const descLower = (product.description || '').toLowerCase()
    const specsLower = (product.short_desc || '').toLowerCase()

    // 1. Thương hiệu (Brand)
    if (filters.brands.length > 0) {
      const brandSlug = product.brand_id?.slug || ''
      if (!filters.brands.includes(brandSlug.toLowerCase())) return false
    }

    // 2. Series
    if (filters.series.length > 0) {
      const match = filters.series.some(ser => {
        const query = ser.replace('-', ' ').toLowerCase()
        return nameLower.includes(query) || descLower.includes(query)
      })
      if (!match) return false
    }

    // 3. Công suất tối đa
    if (filters.wattage.length > 0) {
      const match = filters.wattage.some(w => {
        const query1 = w.toLowerCase() // e.g. "750w"
        const query2 = w.replace('w', ' w').toLowerCase() // e.g. "750 w"
        return nameLower.includes(query1) || nameLower.includes(query2) || specsLower.includes(query1) || specsLower.includes(query2)
      })
      if (!match) return false
    }

    // 4. Chứng nhận hiệu suất (80 Plus)
    if (filters.certification.length > 0) {
      const match = filters.certification.some(cert => {
        if (cert === '80-plus') return (nameLower.includes('80 plus') || specsLower.includes('80 plus') || nameLower.includes('80plus') || nameLower.includes('80+')) &&
                                      !nameLower.includes('bronze') && !nameLower.includes('gold') && !nameLower.includes('platinum') && !nameLower.includes('silver') && !nameLower.includes('titanium')
        if (cert === '80-plus-bronze') return nameLower.includes('bronze') || specsLower.includes('bronze')
        if (cert === '80-plus-gold') return nameLower.includes('gold') || specsLower.includes('gold')
        if (cert === '80-plus-platinum') return nameLower.includes('platinum') || specsLower.includes('platinum')
        if (cert === '80-plus-silver') return nameLower.includes('silver') || specsLower.includes('silver')
        if (cert === '80-plus-titanium') return nameLower.includes('titanium') || specsLower.includes('titanium')
        if (cert === 'cybenetics-gold') return nameLower.includes('cybenetics gold') || descLower.includes('cybenetics gold')
        if (cert === 'cybenetics-platinum') return nameLower.includes('cybenetics platinum') || descLower.includes('cybenetics platinum')
        return false
      })
      if (!match) return false
    }

    // 5. Cáp rời
    if (filters.cables.length > 0) {
      const match = filters.cables.some(c => {
        if (c === 'full-modular') return nameLower.includes('full modular') || specsLower.includes('full modular') || nameLower.includes('fully modular')
        if (c === 'semi-modular') return nameLower.includes('semi modular') || specsLower.includes('semi modular')
        if (c === 'non-modular') return !nameLower.includes('modular') && !specsLower.includes('modular')
        return false
      })
      if (!match) return false
    }

    // 6. Chuẩn kích thước
    if (filters.size.length > 0) {
      const match = filters.size.some(sz => {
        if (sz === 'atx') return nameLower.includes('atx') || specsLower.includes('atx')
        if (sz === 'sfx') return nameLower.includes('sfx') || specsLower.includes('sfx')
        return false
      })
      if (!match) return false
    }

    return true
  })

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = getProductPrice(a)
    const priceB = getProductPrice(b)
    if (sortBy === 'price-asc') return priceA - priceB
    if (sortBy === 'price-desc') return priceB - priceA
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    return 0
  })

  // Pagination
  const itemsPerPage = 9
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1
  const startIdx = (currentPage - 1) * itemsPerPage
  const visibleProducts = sortedProducts.slice(startIdx, startIdx + itemsPerPage)

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
            <span className="active">PSU - NGUỒN MÁY TÍNH</span>
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
                      <input type="text" value="20.000.000đ" disabled style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
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

              {/* THƯƠNG HIỆU */}
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
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(expandedFilters.brands ? brandsData : brandsData.slice(0, 4)).map(brand => (
                      <label key={brand.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand.value)}
                          onChange={(e) => handleFilterChange('brands', brand.value, e.target.checked)}
                        />
                        <span>{brand.label}</span>
                      </label>
                    ))}
                    {brandsData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('brands')} 
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '13px',
                          padding: '4px 0 0 0',
                          textAlign: 'left',
                          marginTop: '4px',
                          display: 'block',
                          fontWeight: '500',
                          gridColumn: 'span 2'
                        }}
                      >
                        {expandedFilters.brands ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SERIES */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('series')}>
                  Series
                  <span className={`accordion-icon ${openFilters.series ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.series && (
                  <div className="filter-options">
                    {(expandedFilters.series ? seriesData : seriesData.slice(0, 4)).map(ser => (
                      <label key={ser.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.series.includes(ser.value)}
                          onChange={(e) => handleFilterChange('series', ser.value, e.target.checked)}
                        />
                        <span>{ser.label}</span>
                      </label>
                    ))}
                    {seriesData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('series')} 
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '13px',
                          padding: '4px 0 0 0',
                          textAlign: 'left',
                          marginTop: '4px',
                          display: 'block',
                          fontWeight: '500'
                        }}
                      >
                        {expandedFilters.series ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CÔNG SUẤT TỐI ĐA */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('wattage')}>
                  Công suất tối đa
                  <span className={`accordion-icon ${openFilters.wattage ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.wattage && (
                  <div className="filter-options">
                    {(expandedFilters.wattage ? wattageData : wattageData.slice(0, 4)).map(w => (
                      <label key={w.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.wattage.includes(w.value)}
                          onChange={(e) => handleFilterChange('wattage', w.value, e.target.checked)}
                        />
                        <span>{w.label}</span>
                      </label>
                    ))}
                    {wattageData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('wattage')} 
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '13px',
                          padding: '4px 0 0 0',
                          textAlign: 'left',
                          marginTop: '4px',
                          display: 'block',
                          fontWeight: '500'
                        }}
                      >
                        {expandedFilters.wattage ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CHỨNG NHẬN HIỆU SUẤT (80 PLUS) */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('certification')}>
                  Chứng nhận hiệu suất (80 Plus)
                  <span className={`accordion-icon ${openFilters.certification ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.certification && (
                  <div className="filter-options">
                    {certificationsData.map(cert => (
                      <label key={cert.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.certification.includes(cert.value)}
                          onChange={(e) => handleFilterChange('certification', cert.value, e.target.checked)}
                        />
                        <span>{cert.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* CÁP RỜI */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('cables')}>
                  Cáp rời
                  <span className={`accordion-icon ${openFilters.cables ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.cables && (
                  <div className="filter-options">
                    {cablesData.map(c => (
                      <label key={c.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.cables.includes(c.value)}
                          onChange={(e) => handleFilterChange('cables', c.value, e.target.checked)}
                        />
                        <span>{c.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* CHUẨN KÍCH THƯỚC */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('size')}>
                  Chuẩn kích thước
                  <span className={`accordion-icon ${openFilters.size ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.size && (
                  <div className="filter-options">
                    {sizesData.map(sz => (
                      <label key={sz.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.size.includes(sz.value)}
                          onChange={(e) => handleFilterChange('size', sz.value, e.target.checked)}
                        />
                        <span>{sz.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* MAIN CONTENT - PRODUCTS */}
            <main className="cpu-main">
              {/* HEADER */}
              <div className="cpu-main-header">
                <h1>PSU - NGUỒN MÁY TÍNH</h1>
                
                <div className="cpu-main-header-right">
                  <div className="cpu-sort">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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
                  </div>
                </div>
              </div>

              {/* PRODUCTS GRID */}
              {loading ? (
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Đang tải sản phẩm...</div>
              ) : visibleProducts.length === 0 ? (
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Không tìm thấy nguồn máy tính nào phù hợp với bộ lọc hiện tại.</div>
              ) : (
                <div className="cpu-grid">
                  {visibleProducts.map(product => {
                    const price = getProductPrice(product)
                    const image = getProductImage(product)
                    return (
                      <div key={product._id} className="cpu-card">
                        <div className="cpu-card-img">
                          <Link to={`/product/${product.slug}`}>
                            <img src={image} alt={product.name} />
                          </Link>
                        </div>
                        <div className="cpu-card-info">
                          <h3 className="cpu-card-name">
                            <Link to={`/product/${product.slug}`}>{product.name}</Link>
                          </h3>
                          <p className="cpu-card-specs">{product.short_desc || 'Sản phẩm công nghệ cao'}</p>
                          <div className="cpu-card-footer">
                            <div className="cpu-card-price-wrap"><span className="cpu-card-price">{formatPrice(price)}</span></div>
                            <div className="cpu-card-actions">
                              <button className="btn-add-cart" title="Thêm vào giỏ">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff">
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
                  <button className="btn-show-more" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>Show More</button>
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
