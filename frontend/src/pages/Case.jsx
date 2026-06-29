import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/cpu.css' // Reuse the sidebar layout styles

const API_URL = 'http://localhost:3000'

// --- FILTER OPTIONS DATA MATCHING USER'S CASE IMAGE ---
const brandsData = [
  { label: 'Aigo', value: 'aigo' },
  { label: 'Antec', value: 'antec' },
  { label: 'Asus', value: 'asus' },
  { label: 'Cooler Master', value: 'cooler-master' },
  { label: 'Jonsbo', value: 'jonsbo' },
  { label: 'Xigmatek', value: 'xigmatek' },
  { label: 'Corsair', value: 'corsair' },
  { label: 'MSI', value: 'msi' },
  { label: 'NZXT', value: 'nzxt' },
  { label: 'Lian Li', value: 'lian-li' },
  { label: 'Deepcool', value: 'deepcool' },
  { label: 'Phanteks', value: 'phanteks' },
  { label: 'Thermaltake', value: 'thermaltake' }
]

const useCaseData = [
  { label: 'Doanh nghiệp', value: 'doanh-nghiep' },
  { label: 'Doanh nhân', value: 'doanh-nhan' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Gia đình', value: 'gia-dinh' },
  { label: 'Đồ họa', value: 'do-hoa' },
  { label: 'Học sinh - Sinh viên', value: 'hoc-sinh-sinh-vien' },
  { label: 'Văn phòng', value: 'van-phong' }
]

const seriesData = [
  { label: 'AORUS', value: 'aorus' },
  { label: 'CM', value: 'cm' },
  { label: 'CMP', value: 'cmp' },
  { label: 'Cosmos', value: 'cosmos' },
  { label: 'H510', value: 'h510' },
  { label: 'H7', value: 'h7' },
  { label: '4000D', value: '4000d' },
  { label: '5000D', value: '5000d' },
  { label: 'MasterBox', value: 'masterbox' },
  { label: 'HAF', value: 'haf' },
  { label: 'Lancool', value: 'lancool' },
  { label: 'O11', value: 'o11' }
]

const colorsData = [
  { label: 'Bạc', value: 'bac' },
  { label: 'Cam', value: 'cam' },
  { label: 'Gold', value: 'gold' },
  { label: 'Hồng', value: 'hong' },
  { label: 'Đen', value: 'den' },
  { label: 'Trắng', value: 'trang' },
  { label: 'Đỏ', value: 'do' },
  { label: 'Vàng', value: 'vang' },
  { label: 'Xanh', value: 'xanh' },
  { label: 'Xám', value: 'xam' }
]

const materialsData = [
  { label: 'Kính', value: 'kinh' },
  { label: 'Nhôm', value: 'nhom' },
  { label: 'Nhựa', value: 'nhua' },
  { label: 'SECC', value: 'secc' },
  { label: 'Thép', value: 'thep' },
  { label: 'Acrylic', value: 'acrylic' },
  { label: 'SGCC', value: 'sgcc' }
]

const sideMaterialsData = [
  { label: 'Kính', value: 'kinh' },
  { label: 'Kính cường lực', value: 'kinh-cuong-luc' },
  { label: 'Mica', value: 'mica' },
  { label: 'Thép', value: 'thep' },
  { label: 'Nhôm', value: 'nhom' },
  { label: 'Acrylic', value: 'acrylic' },
  { label: 'Lưới (Mesh)', value: 'luoi' }
]

const caseTypesData = [
  { label: 'Mini Tower', value: 'mini-tower' },
  { label: 'Mid Tower', value: 'mid-tower' },
  { label: 'Full Tower', value: 'full-tower' },
  { label: 'Super Tower', value: 'super-tower' }
]

const supportMbsData = [
  { label: 'ATX', value: 'atx' },
  { label: 'E-ATX', value: 'e-atx' },
  { label: 'Micro-ATX', value: 'm-atx' },
  { label: 'Mini-ITX', value: 'itx' }
]

// --- REALISTIC FALLBACK MOCK DATA ---
const mockCaseProducts = [
  {
    _id: 'mock-case-1',
    name: 'ASUS A31 ATX BLACK 4FA',
    short_desc: 'Mid Tower, Black, ATX, Micro-ATX, Mini-ITX, Thép & Kính cường lực',
    description: 'Thùng máy / CASE ASUS A31 ATX BLACK 4FA thiết kế thông thoáng đi kèm sẵn 4 Fan.',
    brand_id: { slug: 'asus', name: 'ASUS' },
    slug: 'asus-a31-atx-black-4fa',
    Variants: [{ price: 1890000, sale_price: 1890000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=ASUS+A31+ATX', is_main: true }]
  },
  {
    _id: 'mock-case-2',
    name: 'XIGMATEK MYX Air 3F (3 Fan) (EN45967)',
    short_desc: 'Micro-ATX, Black, Thép & Acrylic',
    description: 'Thùng máy / CASE Xigmatek MYX Air 3F kèm sẵn 3 quạt làm mát hiệu quả.',
    brand_id: { slug: 'xigmatek', name: 'XIGMATEK' },
    slug: 'xigmatek-myx-air-3f',
    Variants: [{ price: 790000, sale_price: 729000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Xigmatek+MYX+Air', is_main: true }]
  },
  {
    _id: 'mock-case-3',
    name: 'Jonsbo D200 M-ATX White',
    short_desc: 'Micro-ATX, White, Bể cá, Kính cường lực',
    description: 'Vỏ máy tính / Case Jonsbo D200 M-ATX thiết kế bể cá sang trọng.',
    brand_id: { slug: 'jonsbo', name: 'JONSBO' },
    slug: 'jonsbo-d200-m-atx-white',
    Variants: [{ price: 1390000, sale_price: 1390000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Jonsbo+D200+White', is_main: true }]
  },
  {
    _id: 'mock-case-4',
    name: 'Aigo C218M Black',
    short_desc: 'Micro-ATX, Black, Thép & Kính',
    description: 'Vỏ máy tính / CASE Aigo C218M thiết kế chắc chắn, kính cường lực hông.',
    brand_id: { slug: 'aigo', name: 'AIGO' },
    slug: 'aigo-c218m-black',
    Variants: [{ price: 790000, sale_price: 690000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Aigo+C218M', is_main: true }]
  }
]

export default function Case() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popular')

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    brands: [],
    useCase: [],
    series: [],
    colors: [],
    materials: [],
    sideMaterials: [],
    caseTypes: [],
    supportMbs: []
  })

  // --- ACCORDION OPEN/CLOSE STATES ---
  const [openFilters, setOpenFilters] = useState({
    priceRange: true,
    brands: true,
    useCase: true,
    series: true,
    colors: true,
    materials: true,
    sideMaterials: true,
    caseTypes: true,
    supportMbs: true
  })

  // --- EXPAND FILTERS STATE ---
  const [expandedFilters, setExpandedFilters] = useState({
    brands: false,
    useCase: false,
    series: false,
    colors: false,
    materials: false,
    sideMaterials: false,
    caseTypes: false,
    supportMbs: false
  })

  const toggleFilter = (key) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleExpand = (key) => {
    setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // --- FETCH PRODUCTS FROM BACKEND ---
  useEffect(() => {
    const fetchCaseProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/categories/case`)
        const data = await res.json()
        if (data.success && data.data && data.data.products && data.data.products.length > 0) {
          setProducts(data.data.products)
        } else {
          setProducts(mockCaseProducts)
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm Case, sử dụng dữ liệu mẫu:', err)
        setProducts(mockCaseProducts)
      } finally {
        setLoading(false)
      }
    }
    fetchCaseProducts()
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

    // 2. Nhu cầu
    if (filters.useCase.length > 0) {
      const match = filters.useCase.some(uc => {
        if (uc === 'gaming') return nameLower.includes('gaming') || nameLower.includes('aorus') || nameLower.includes('rog') || nameLower.includes('tuf') || descLower.includes('gaming')
        if (uc === 'van-phong') return nameLower.includes('office') || descLower.includes('văn phòng') || price < 1000000
        if (uc === 'gia-dinh') return price < 1500000 || descLower.includes('gia đình')
        if (uc === 'doanh-nghiep') return descLower.includes('doanh nghiệp') || nameLower.includes('workstation')
        if (uc === 'doanh-nhan') return nameLower.includes('premium') || nameLower.includes('dual') || price > 3000000
        if (uc === 'do-hoa') return nameLower.includes('workstation') || nameLower.includes('pro') || price > 2000000
        if (uc === 'hoc-sinh-sinh-vien') return price < 1200000 || descLower.includes('sinh viên')
        return false
      })
      if (!match) return false
    }

    // 3. Series
    if (filters.series.length > 0) {
      const match = filters.series.some(ser => {
        const query = ser.replace('-', ' ').toLowerCase()
        return nameLower.includes(query) || descLower.includes(query)
      })
      if (!match) return false
    }

    // 4. Màu sắc
    if (filters.colors.length > 0) {
      const match = filters.colors.some(col => {
        if (col === 'den') return nameLower.includes('đen') || nameLower.includes('black') || specsLower.includes('black')
        if (col === 'trang') return nameLower.includes('trắng') || nameLower.includes('white') || specsLower.includes('white')
        if (col === 'hong') return nameLower.includes('hồng') || nameLower.includes('pink') || specsLower.includes('pink')
        if (col === 'bac') return nameLower.includes('bạc') || nameLower.includes('silver') || specsLower.includes('silver')
        if (col === 'cam') return nameLower.includes('cam') || nameLower.includes('orange')
        if (col === 'gold') return nameLower.includes('gold') || nameLower.includes('vàng')
        if (col === 'do') return nameLower.includes('đỏ') || nameLower.includes('red')
        if (col === 'vang') return nameLower.includes('vàng') || nameLower.includes('yellow')
        if (col === 'xanh') return nameLower.includes('xanh') || nameLower.includes('blue') || nameLower.includes('green')
        if (col === 'xam') return nameLower.includes('xám') || nameLower.includes('gray') || nameLower.includes('grey')
        return false
      })
      if (!match) return false
    }

    // 5. Chất liệu
    if (filters.materials.length > 0) {
      const match = filters.materials.some(mat => {
        if (mat === 'kinh') return nameLower.includes('kính') || specsLower.includes('kính') || descLower.includes('kính') || nameLower.includes('glass')
        if (mat === 'nhom') return nameLower.includes('nhôm') || specsLower.includes('nhôm') || descLower.includes('nhôm') || nameLower.includes('aluminum')
        if (mat === 'nhua') return nameLower.includes('nhựa') || specsLower.includes('nhựa') || descLower.includes('nhựa') || nameLower.includes('plastic')
        if (mat === 'secc') return nameLower.includes('secc') || specsLower.includes('secc') || descLower.includes('secc')
        if (mat === 'thep') return nameLower.includes('thép') || specsLower.includes('thép') || nameLower.includes('steel')
        if (mat === 'acrylic') return nameLower.includes('acrylic') || specsLower.includes('acrylic')
        if (mat === 'sgcc') return nameLower.includes('sgcc') || specsLower.includes('sgcc')
        return false
      })
      if (!match) return false
    }

    // 6. Chất liệu nắp hông
    if (filters.sideMaterials.length > 0) {
      const match = filters.sideMaterials.some(side => {
        if (side === 'kinh-cuong-luc') return nameLower.includes('kính cường lực') || specsLower.includes('kính cường lực') || nameLower.includes('tempered glass') || specsLower.includes('tempered glass')
        if (side === 'kinh') return (nameLower.includes('kính') || specsLower.includes('kính') || nameLower.includes('glass') || specsLower.includes('glass')) && !nameLower.includes('cường lực')
        if (side === 'mica') return nameLower.includes('mica') || specsLower.includes('mica') || nameLower.includes('acrylic')
        if (side === 'thep') return nameLower.includes('thép') || specsLower.includes('thép') || nameLower.includes('steel')
        if (side === 'nhom') return nameLower.includes('nhôm') || specsLower.includes('nhôm') || nameLower.includes('aluminum')
        if (side === 'acrylic') return nameLower.includes('acrylic') || specsLower.includes('acrylic')
        if (side === 'luoi') return nameLower.includes('lưới') || specsLower.includes('lưới') || nameLower.includes('mesh')
        return false
      })
      if (!match) return false
    }

    // 7. Kiểu case
    if (filters.caseTypes.length > 0) {
      const match = filters.caseTypes.some(type => {
        if (type === 'mini-tower') return nameLower.includes('mini') || specsLower.includes('mini')
        if (type === 'mid-tower') return nameLower.includes('mid') || specsLower.includes('mid') || (!nameLower.includes('mini') && !nameLower.includes('full') && !nameLower.includes('super'))
        if (type === 'full-tower') return nameLower.includes('full') || specsLower.includes('full')
        if (type === 'super-tower') return nameLower.includes('super') || specsLower.includes('super')
        return false
      })
      if (!match) return false
    }

    // 8. Kích thước mainboard hỗ trợ
    if (filters.supportMbs.length > 0) {
      const match = filters.supportMbs.some(mb => {
        if (mb === 'atx') return nameLower.includes('atx') && !nameLower.includes('micro-atx') && !nameLower.includes('m-atx') && !nameLower.includes('mini-itx') && !nameLower.includes('e-atx')
        if (mb === 'e-atx') return nameLower.includes('e-atx') || nameLower.includes('eatx') || nameLower.includes('extended-atx')
        if (mb === 'm-atx') return nameLower.includes('m-atx') || nameLower.includes('matx') || nameLower.includes('micro-atx')
        if (mb === 'itx') return nameLower.includes('itx') || nameLower.includes('mini-itx')
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
            <span className="active">VỎ CASE - THÙNG MÁY TÍNH PC</span>
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
                      <input type="text" value="90.000.000đ" disabled style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
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
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                          fontWeight: '500',
                          gridColumn: 'span 2'
                        }}
                      >
                        {expandedFilters.series ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* MÀU SẮC */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('colors')}>
                  Màu sắc
                  <span className={`accordion-icon ${openFilters.colors ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.colors && (
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(expandedFilters.colors ? colorsData : colorsData.slice(0, 4)).map(col => (
                      <label key={col.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.colors.includes(col.value)}
                          onChange={(e) => handleFilterChange('colors', col.value, e.target.checked)}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                    {colorsData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('colors')} 
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
                        {expandedFilters.colors ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CHẤT LIỆU */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('materials')}>
                  Chất liệu
                  <span className={`accordion-icon ${openFilters.materials ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.materials && (
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(expandedFilters.materials ? materialsData : materialsData.slice(0, 4)).map(mat => (
                      <label key={mat.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.materials.includes(mat.value)}
                          onChange={(e) => handleFilterChange('materials', mat.value, e.target.checked)}
                        />
                        <span>{mat.label}</span>
                      </label>
                    ))}
                    {materialsData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('materials')} 
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
                        {expandedFilters.materials ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CHẤT LIỆU NẮP HÔNG */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('sideMaterials')}>
                  Chất liệu nắp hông
                  <span className={`accordion-icon ${openFilters.sideMaterials ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.sideMaterials && (
                  <div className="filter-options">
                    {(expandedFilters.sideMaterials ? sideMaterialsData : sideMaterialsData.slice(0, 4)).map(side => (
                      <label key={side.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.sideMaterials.includes(side.value)}
                          onChange={(e) => handleFilterChange('sideMaterials', side.value, e.target.checked)}
                        />
                        <span>{side.label}</span>
                      </label>
                    ))}
                    {sideMaterialsData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('sideMaterials')} 
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
                        {expandedFilters.sideMaterials ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* KIỂU CASE */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('caseTypes')}>
                  Kiểu case
                  <span className={`accordion-icon ${openFilters.caseTypes ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.caseTypes && (
                  <div className="filter-options">
                    {(expandedFilters.caseTypes ? caseTypesData : caseTypesData.slice(0, 4)).map(type => (
                      <label key={type.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.caseTypes.includes(type.value)}
                          onChange={(e) => handleFilterChange('caseTypes', type.value, e.target.checked)}
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                    {caseTypesData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('caseTypes')} 
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
                        {expandedFilters.caseTypes ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* KÍCH THƯỚC MAINBOARD HỖ TRỢ */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('supportMbs')}>
                  Kích thước mainboard hỗ trợ
                  <span className={`accordion-icon ${openFilters.supportMbs ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.supportMbs && (
                  <div className="filter-options">
                    {(expandedFilters.supportMbs ? supportMbsData : supportMbsData.slice(0, 4)).map(mb => (
                      <label key={mb.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.supportMbs.includes(mb.value)}
                          onChange={(e) => handleFilterChange('supportMbs', mb.value, e.target.checked)}
                        />
                        <span>{mb.label}</span>
                      </label>
                    ))}
                    {supportMbsData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('supportMbs')} 
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
                        {expandedFilters.supportMbs ? 'Thu gọn' : 'Xem thêm'}
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
                <h1>VỎ CASE - THÙNG MÁY TÍNH PC</h1>
                
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
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Không tìm thấy vỏ case nào phù hợp với bộ lọc hiện tại.</div>
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
