import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/cpu.css' // Reuse the sidebar layout styles

const API_URL = 'http://localhost:3000'

// --- FILTER OPTIONS DATA MATCHING USER'S MAINBOARD IMAGE ---
const brandsData = [
  { label: 'Asrock', value: 'asrock' },
  { label: 'Asus', value: 'asus' },
  { label: 'Gigabyte', value: 'gigabyte' },
  { label: 'Msi', value: 'msi' },
  { label: 'NZXT', value: 'nzxt' },
  { label: 'Biostar', value: 'biostar' },
  { label: 'Colorful', value: 'colorful' }
]

const seriesData = [
  { label: 'AORUS', value: 'aorus' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'MAG', value: 'mag' },
  { label: 'MEG', value: 'meg' },
  { label: 'MPG', value: 'mpg' },
  { label: 'PRO', value: 'pro' },
  { label: 'PROART', value: 'proart' },
  { label: 'Prime', value: 'prime' },
  { label: 'ROG', value: 'rog' },
  { label: 'Steel Legend', value: 'steel-legend' },
  { label: 'TUF', value: 'tuf' }
]

const useCaseData = [
  { label: 'Doanh nghiệp', value: 'doanh-nghiep' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Gaming Văn Phòng', value: 'gaming-van-phong' },
  { label: 'Học sinh - Sinh viên', value: 'hoc-sinh-sinh-vien' },
  { label: 'Văn phòng', value: 'van-phong' },
  { label: 'Đồ họa - Kỹ thuật', value: 'do-hoa-ky-thuat' }
]

const driveTypeData = [
  { label: 'Main AMD', value: 'main-amd' },
  { label: 'Main Intel', value: 'main-intel' }
]

const chipsetsData = [
  { label: 'A520', value: 'a520' },
  { label: 'A620', value: 'a620' },
  { label: 'B550', value: 'b550' },
  { label: 'B650', value: 'b650' },
  { label: 'B660', value: 'b660' },
  { label: 'B760', value: 'b760' },
  { label: 'B840', value: 'b840' },
  { label: 'B850', value: 'b850' },
  { label: 'B860', value: 'b860' },
  { label: 'H470', value: 'h470' },
  { label: 'H610', value: 'h610' },
  { label: 'X870', value: 'x870' },
  { label: 'X870E', value: 'x870e' },
  { label: 'Z490', value: 'z490' },
  { label: 'Z790', value: 'z790' },
  { label: 'Z890', value: 'z890' }
]

const socketsData = [
  { label: '1200', value: '1200' },
  { label: '1700', value: '1700' },
  { label: '1851', value: '1851' },
  { label: 'AM4', value: 'am4' },
  { label: 'AM5', value: 'am5' }
]

const sizesData = [
  { label: 'ATX', value: 'atx' },
  { label: 'Extended-ATX', value: 'e-atx' },
  { label: 'Micro-ATX', value: 'm-atx' },
  { label: 'Mini-ITX', value: 'itx' }
]

// --- REALISTIC FALLBACK MOCK DATA ---
const mockMainboardProducts = [
  {
    _id: 'mock-mb-1',
    name: 'ASUS PRIME B760M-K D4',
    short_desc: 'Intel LGA1700, B760 Chipset, m-ATX, DDR4',
    description: 'Bo mạch chủ ASUS PRIME B760M-K D4 hỗ trợ vi xử lý Intel socket LGA1700 thế hệ 12, 13, 14.',
    brand_id: { slug: 'asus', name: 'ASUS' },
    slug: 'asus-prime-b760m-k-d4',
    Variants: [{ price: 2390000, sale_price: 2250000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=PRIME+B760M-K', is_main: true }]
  },
  {
    _id: 'mock-mb-2',
    name: 'MSI MAG B650 TOMAHAWK WIFI',
    short_desc: 'AMD AM5, B650 Chipset, ATX, DDR5',
    description: 'Bo mạch chủ chơi game cao cấp MSI MAG B650 TOMAHAWK WIFI cho CPU Ryzen 7000/8000/9000.',
    brand_id: { slug: 'msi', name: 'MSI' },
    slug: 'msi-mag-b650-tomahawk-wifi',
    Variants: [{ price: 6190000, sale_price: 5850000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=B650+TOMAHAWK', is_main: true }]
  },
  {
    _id: 'mock-mb-3',
    name: 'GIGABYTE A520M K V2',
    short_desc: 'AMD AM4, A520 Chipset, Micro-ATX, DDR4',
    description: 'Bo mạch chủ phổ thông GIGABYTE A520M K V2 cho CPU AMD Ryzen socket AM4.',
    brand_id: { slug: 'gigabyte', name: 'GIGABYTE' },
    slug: 'gigabyte-a520m-k-v2',
    Variants: [{ price: 1590000, sale_price: 1590000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=GIGABYTE+A520M', is_main: true }]
  },
  {
    _id: 'mock-mb-4',
    name: 'ASRock Z790 Pro RS D4',
    short_desc: 'Intel LGA1700, Z790 Chipset, ATX, DDR4',
    description: 'Bo mạch chủ hiệu năng cao ASRock Z790 Pro RS D4 hỗ trợ CPU Intel thế hệ 12, 13, 14.',
    brand_id: { slug: 'asrock', name: 'ASRock' },
    slug: 'asrock-z790-pro-rs-d4',
    Variants: [{ price: 5490000, sale_price: 5290000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=ASRock+Z790+Pro', is_main: true }]
  }
]

export default function Mainboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popular')

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    brands: [],
    series: [],
    useCase: [],
    driveType: [],
    chipset: [],
    socket: [],
    size: []
  })

  // --- ACCORDION OPEN/CLOSE STATES ---
  const [openFilters, setOpenFilters] = useState({
    priceRange: true,
    brands: true,
    series: true,
    useCase: true,
    driveType: true,
    chipset: true,
    socket: true,
    size: true
  })

  // --- EXPAND FILTERS STATE ---
  const [expandedFilters, setExpandedFilters] = useState({
    brands: false,
    series: false,
    useCase: false,
    chipset: false,
    socket: false,
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
    const fetchMainboardProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/categories/mainboard`)
        const data = await res.json()
        if (data.success && data.data && data.data.products && data.data.products.length > 0) {
          setProducts(data.data.products)
        } else {
          setProducts(mockMainboardProducts)
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm Mainboard, sử dụng dữ liệu mẫu:', err)
        setProducts(mockMainboardProducts)
      } finally {
        setLoading(false)
      }
    }
    fetchMainboardProducts()
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
    const price = getProductPrice(product)

    // 1. Thương hiệu (Brand)
    if (filters.brands.length > 0) {
      const brandSlug = product.brand_id?.slug || ''
      if (!filters.brands.includes(brandSlug.toLowerCase())) return false
    }

    // 2. Series mainboard
    if (filters.series.length > 0) {
      const match = filters.series.some(ser => {
        const query = ser.replace('-', ' ').toLowerCase()
        return nameLower.includes(query) || descLower.includes(query)
      })
      if (!match) return false
    }

    // 3. Nhu cầu
    if (filters.useCase.length > 0) {
      const match = filters.useCase.some(uc => {
        if (uc === 'gaming') return nameLower.includes('gaming') || nameLower.includes('rog') || nameLower.includes('tuf') || nameLower.includes('aorus') || nameLower.includes('tomahawk') || descLower.includes('chơi game')
        if (uc === 'van-phong') return nameLower.includes('prime') || nameLower.includes('pro') || price < 2500000
        if (uc === 'hoc-sinh-sinh-vien') return price < 2000000 || descLower.includes('học tập')
        if (uc === 'gaming-van-phong') return nameLower.includes('gaming') && price < 3000000
        if (uc === 'do-hoa-ky-thuat') return nameLower.includes('proart') || nameLower.includes('creator') || nameLower.includes('x870') || nameLower.includes('z790') || nameLower.includes('z890')
        if (uc === 'doanh-nghiep') return descLower.includes('doanh nghiệp') || nameLower.includes('workstation')
        return false
      })
      if (!match) return false
    }

    // 4. Loại Mainboard
    if (filters.driveType.length > 0) {
      const match = filters.driveType.some(type => {
        if (type === 'main-amd') return nameLower.includes('amd') || specsLower.includes('amd') || nameLower.includes('am4') || nameLower.includes('am5') || specsLower.includes('am4') || specsLower.includes('am5')
        if (type === 'main-intel') return nameLower.includes('intel') || specsLower.includes('intel') || nameLower.includes('lga') || nameLower.includes('1700') || nameLower.includes('1200') || nameLower.includes('1851')
        return false
      })
      if (!match) return false
    }

    // 5. Chipset
    if (filters.chipset.length > 0) {
      const match = filters.chipset.some(chip => {
        const query = chip.toLowerCase()
        return nameLower.includes(query) || specsLower.includes(query)
      })
      if (!match) return false
    }

    // 6. Socket
    if (filters.socket.length > 0) {
      const match = filters.socket.some(sock => {
        const query = sock.toLowerCase()
        return nameLower.includes(query) || specsLower.includes(query) || (query === '1700' && nameLower.includes('lga1700')) || (query === '1200' && nameLower.includes('lga1200')) || (query === '1851' && nameLower.includes('lga1851'))
      })
      if (!match) return false
    }

    // 7. Chuẩn kích thước
    if (filters.size.length > 0) {
      const match = filters.size.some(sz => {
        if (sz === 'atx') return nameLower.includes('atx') && !nameLower.includes('micro-atx') && !nameLower.includes('m-atx') && !nameLower.includes('mini-itx') && !nameLower.includes('e-atx')
        if (sz === 'e-atx') return nameLower.includes('e-atx') || nameLower.includes('eatx') || nameLower.includes('extended-atx')
        if (sz === 'm-atx') return nameLower.includes('m-atx') || nameLower.includes('matx') || nameLower.includes('micro-atx')
        if (sz === 'itx') return nameLower.includes('itx') || nameLower.includes('mini-itx')
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
            <span className="active">MAINBOARD - BO MẠCH CHỦ</span>
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
                      <input type="text" value="40.000.000đ" disabled style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
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

              {/* SERIES MAINBOARD */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('series')}>
                  Series mainboard
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
                    {(expandedFilters.useCase ? useCaseData : useCaseData.slice(0, 4)).map(uc => (
                      <label key={uc.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.useCase.includes(uc.value)}
                          onChange={(e) => handleFilterChange('useCase', uc.value, e.target.checked)}
                        />
                        <span>{uc.label}</span>
                      </label>
                    ))}
                    {useCaseData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('useCase')} 
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
                        {expandedFilters.useCase ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* LOẠI MAINBOARD */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('driveType')}>
                  Loại Mainboard
                  <span className={`accordion-icon ${openFilters.driveType ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.driveType && (
                  <div className="filter-options">
                    {driveTypeData.map(type => (
                      <label key={type.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.driveType.includes(type.value)}
                          onChange={(e) => handleFilterChange('driveType', type.value, e.target.checked)}
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* CHIPSET */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('chipset')}>
                  Chipset
                  <span className={`accordion-icon ${openFilters.chipset ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.chipset && (
                  <div className="filter-options">
                    {(expandedFilters.chipset ? chipsetsData : chipsetsData.slice(0, 4)).map(chip => (
                      <label key={chip.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.chipset.includes(chip.value)}
                          onChange={(e) => handleFilterChange('chipset', chip.value, e.target.checked)}
                        />
                        <span>{chip.label}</span>
                      </label>
                    ))}
                    {chipsetsData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('chipset')} 
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
                        {expandedFilters.chipset ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SOCKET */}
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
                    {(expandedFilters.socket ? socketsData : socketsData.slice(0, 4)).map(sock => (
                      <label key={sock.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.socket.includes(sock.value)}
                          onChange={(e) => handleFilterChange('socket', sock.value, e.target.checked)}
                        />
                        <span>{sock.label}</span>
                      </label>
                    ))}
                    {socketsData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('socket')} 
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
                        {expandedFilters.socket ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
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
                    {(expandedFilters.size ? sizesData : sizesData.slice(0, 4)).map(sz => (
                      <label key={sz.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.size.includes(sz.value)}
                          onChange={(e) => handleFilterChange('size', sz.value, e.target.checked)}
                        />
                        <span>{sz.label}</span>
                      </label>
                    ))}
                    {sizesData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('size')} 
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
                        {expandedFilters.size ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* MAIN CONTENT - PRODUCTS */}
            <main className="cpu-main">
              {/* HEADER */}
              <div className="cpu-main-header">
                <h1>MAINBOARD (BO MẠCH CHỦ)</h1>
                
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
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Không tìm thấy bo mạch chủ nào phù hợp với bộ lọc hiện tại.</div>
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
