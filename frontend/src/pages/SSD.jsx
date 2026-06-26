import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/cpu.css' // Reuse the sidebar layout styles

const API_URL = 'http://localhost:3000'

// --- FILTER OPTIONS DATA MATCHING USER'S SSD IMAGE ---
const brandsData = [
  { label: 'Adata', value: 'adata' },
  { label: 'Asus', value: 'asus' },
  { label: 'Crucial', value: 'crucial' },
  { label: 'Kingmax', value: 'kingmax' },
  { label: 'Samsung', value: 'samsung' },
  { label: 'Western Digital', value: 'western-digital' },
  { label: 'Gigabyte', value: 'gigabyte' },
  { label: 'Kingston', value: 'kingston' },
  { label: 'MSI', value: 'msi' },
  { label: 'Seagate', value: 'seagate' },
  { label: 'Lexar', value: 'lexar' },
  { label: 'Sandisk', value: 'sandisk' }
]

const seriesData = [
  { label: 'Backup Plus', value: 'backup-plus' },
  { label: 'BarraCuda', value: 'barracuda' },
  { label: 'Black', value: 'black' },
  { label: 'Blue', value: 'blue' },
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'EVO', value: 'evo' },
  { label: 'PRO', value: 'pro' },
  { label: 'MX500', value: 'mx500' },
  { label: 'P3', value: 'p3' },
  { label: 'P5', value: 'p5' },
  { label: 'NV2', value: 'nv2' },
  { label: 'KC3000', value: 'kc3000' },
  { label: '980', value: '980' },
  { label: '990', value: '990' }
]

const driveTypeData = [
  { label: 'HDD', value: 'hdd' },
  { label: 'SSD', value: 'ssd' },
  { label: 'di động HDD', value: 'di-dong-hdd' },
  { label: 'di động SSD', value: 'di-dong-ssd' }
]

const capacitiesData = [
  { label: '10TB', value: '10tb' },
  { label: '120GB', value: '120gb' },
  { label: '12TB', value: '12tb' },
  { label: '14TB', value: '14tb' },
  { label: '240GB', value: '240gb' },
  { label: '250GB', value: '250gb' },
  { label: '480GB', value: '480gb' },
  { label: '500GB', value: '500gb' },
  { label: '1TB', value: '1tb' },
  { label: '2TB', value: '2tb' },
  { label: '4TB', value: '4tb' },
  { label: '8TB', value: '8tb' }
]

const connectionData = [
  { label: 'M.2 NVMe', value: 'm2-nvme' },
  { label: 'M.2 SATA', value: 'm2-sata' },
  { label: 'PCIe', value: 'pcie' },
  { label: 'SAS 3', value: 'sas-3' },
  { label: 'SATA 3', value: 'sata-3' },
  { label: 'USB 3.2', value: 'usb-32' },
  { label: 'Type-C', value: 'type-c' }
]

const nandTechData = [
  { label: '3D-NAND', value: '3d-nand' },
  { label: 'Không', value: 'khong' },
  { label: 'V-NAND', value: 'v-nand' }
]

const sizesData = [
  { label: '2.5"', value: '2.5' },
  { label: '3.5"', value: '3.5' },
  { label: 'Khác', value: 'khac' },
  { label: 'M.2', value: 'm2' }
]

// --- REALISTIC FALLBACK MOCK DATA ---
const mockStorageProducts = [
  {
    _id: 'mock-ssd-1',
    name: 'Samsung 990 PRO M.2 NVMe 1TB PCIe Gen4',
    short_desc: '1TB, M.2 NVMe, PCIe Gen4 x4, V-NAND',
    description: 'SSD Samsung 990 PRO M.2 NVMe PCIe Gen4 x4 dung lượng 1TB tốc độ cực nhanh.',
    brand_id: { slug: 'samsung', name: 'Samsung' },
    slug: 'samsung-990-pro-m2-nvme-1tb',
    Variants: [{ price: 2990000, sale_price: 2850000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Samsung+990+PRO', is_main: true }]
  },
  {
    _id: 'mock-ssd-2',
    name: 'Crucial MX500 2.5 inch SATA 3 500GB',
    short_desc: '500GB, 2.5 inch, SATA 3, 3D-NAND',
    description: 'Ổ cứng SSD Crucial MX500 dung lượng 500GB giao tiếp SATA 3 6Gb/s.',
    brand_id: { slug: 'crucial', name: 'Crucial' },
    slug: 'crucial-mx500-25-inch-sata-3-500gb',
    Variants: [{ price: 1290000, sale_price: 1190000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Crucial+MX500', is_main: true }]
  },
  {
    _id: 'mock-ssd-3',
    name: 'Western Digital Black WD101FZBX 10TB 3.5 inch SATA 3',
    short_desc: '10TB, 3.5 inch, SATA 3, 7200 RPM',
    description: 'Ổ cứng HDD Western Digital Black 10TB chuyên dụng chơi game và lưu trữ hiệu năng cao.',
    brand_id: { slug: 'western-digital', name: 'Western Digital' },
    slug: 'wd-black-10tb-35-inch-sata-3',
    Variants: [{ price: 8490000, sale_price: 7990000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=WD+Black+10TB', is_main: true }]
  },
  {
    _id: 'mock-ssd-4',
    name: 'Kingston NV2 M.2 PCIe Gen4 x4 NVMe 1TB',
    short_desc: '1TB, M.2 NVMe, PCIe Gen4 x4',
    description: 'SSD Kingston NV2 PCIe Gen4 x4 NVMe 1TB hiệu năng cao giá tốt.',
    brand_id: { slug: 'kingston', name: 'Kingston' },
    slug: 'kingston-nv2-m2-pcie-gen4-1tb',
    Variants: [{ price: 1750000, sale_price: 1690000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Kingston+NV2', is_main: true }]
  }
]

export default function SSD() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popular')

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    brands: [],
    series: [],
    driveType: [],
    capacity: [],
    connection: [],
    nandTech: [],
    size: []
  })

  // --- ACCORDION OPEN/CLOSE STATES ---
  const [openFilters, setOpenFilters] = useState({
    priceRange: true,
    brands: true,
    series: true,
    driveType: true,
    capacity: true,
    connection: true,
    nandTech: true,
    size: true
  })

  // --- EXPAND FILTERS STATE ---
  const [expandedFilters, setExpandedFilters] = useState({
    brands: false,
    series: false,
    driveType: false,
    capacity: false,
    connection: false,
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
    const fetchStorageProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/categories/storage`)
        const data = await res.json()
        if (data.success && data.data && data.data.products && data.data.products.length > 0) {
          setProducts(data.data.products)
        } else {
          setProducts(mockStorageProducts)
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm SSD, sử dụng dữ liệu mẫu:', err)
        setProducts(mockStorageProducts)
      } finally {
        setLoading(false)
      }
    }
    fetchStorageProducts()
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

    // 3. Kiểu ổ cứng
    if (filters.driveType.length > 0) {
      const match = filters.driveType.some(type => {
        if (type === 'hdd') return (nameLower.includes('hdd') || descLower.includes('hdd') || descLower.includes('ổ cứng hdd')) && !nameLower.includes('di động') && !descLower.includes('di động')
        if (type === 'ssd') return (nameLower.includes('ssd') || descLower.includes('ssd') || descLower.includes('ổ cứng ssd')) && !nameLower.includes('di động') && !descLower.includes('di động')
        if (type === 'di-dong-hdd') return (nameLower.includes('di động') || descLower.includes('di động') || nameLower.includes('portable')) && (nameLower.includes('hdd') || descLower.includes('hdd'))
        if (type === 'di-dong-ssd') return (nameLower.includes('di động') || descLower.includes('di động') || nameLower.includes('portable') || nameLower.includes('t5') || nameLower.includes('t7')) && (nameLower.includes('ssd') || descLower.includes('ssd'))
        return false
      })
      if (!match) return false
    }

    // 4. Dung lượng
    if (filters.capacity.length > 0) {
      const match = filters.capacity.some(cap => {
        const query1 = cap.toLowerCase() // e.g. "1tb" or "120gb"
        const query2 = cap.replace('tb', ' tb').replace('gb', ' gb').toLowerCase() // e.g. "1 tb" or "120 gb"
        return specsLower.includes(query1) || specsLower.includes(query2) || nameLower.includes(query1) || nameLower.includes(query2)
      })
      if (!match) return false
    }

    // 5. Chuẩn kết nối
    if (filters.connection.length > 0) {
      const match = filters.connection.some(conn => {
        if (conn === 'm2-nvme') return nameLower.includes('nvme') || specsLower.includes('nvme') || descLower.includes('nvme') || nameLower.includes('pcie gen')
        if (conn === 'm2-sata') return nameLower.includes('m.2 sata') || specsLower.includes('m.2 sata') || descLower.includes('m.2 sata')
        if (conn === 'pcie') return nameLower.includes('pcie') || specsLower.includes('pcie')
        if (conn === 'sas-3') return nameLower.includes('sas') || specsLower.includes('sas')
        if (conn === 'sata-3') return nameLower.includes('sata 3') || specsLower.includes('sata 3') || nameLower.includes('sata iii') || specsLower.includes('sata iii')
        if (conn === 'usb-32') return nameLower.includes('usb 3') || specsLower.includes('usb 3')
        if (conn === 'type-c') return nameLower.includes('type-c') || specsLower.includes('type-c') || nameLower.includes('type c')
        return false
      })
      if (!match) return false
    }

    // 6. Công nghệ bộ nhớ NAND
    if (filters.nandTech.length > 0) {
      const match = filters.nandTech.some(tech => {
        if (tech === '3d-nand') return nameLower.includes('3d nand') || specsLower.includes('3d nand') || nameLower.includes('3d-nand') || specsLower.includes('3d-nand')
        if (tech === 'v-nand') return nameLower.includes('v-nand') || specsLower.includes('v-nand') || nameLower.includes('v nand') || specsLower.includes('v nand')
        if (tech === 'khong') return !nameLower.includes('nand') && !specsLower.includes('nand')
        return false
      })
      if (!match) return false
    }

    // 7. Kích thước
    if (filters.size.length > 0) {
      const match = filters.size.some(sz => {
        if (sz === '2.5') return nameLower.includes('2.5') || specsLower.includes('2.5') || descLower.includes('2.5')
        if (sz === '3.5') return nameLower.includes('3.5') || specsLower.includes('3.5') || descLower.includes('3.5')
        if (sz === 'm2') return nameLower.includes('m.2') || specsLower.includes('m.2') || nameLower.includes('m2') || specsLower.includes('m2')
        if (sz === 'khac') return !nameLower.includes('2.5') && !nameLower.includes('3.5') && !nameLower.includes('m.2') && !nameLower.includes('m2')
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
            <span className="active">Ổ CỨNG SSD / HDD</span>
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
                      <input type="text" value="80.000.000đ" disabled style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
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

              {/* KIỂU Ổ CỨNG */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('driveType')}>
                  Kiểu ổ cứng
                  <span className={`accordion-icon ${openFilters.driveType ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.driveType && (
                  <div className="filter-options">
                    {(expandedFilters.driveType ? driveTypeData : driveTypeData.slice(0, 4)).map(type => (
                      <label key={type.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.driveType.includes(type.value)}
                          onChange={(e) => handleFilterChange('driveType', type.value, e.target.checked)}
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                    {driveTypeData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('driveType')} 
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
                        {expandedFilters.driveType ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* DUNG LƯỢNG */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('capacity')}>
                  Dung lượng
                  <span className={`accordion-icon ${openFilters.capacity ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.capacity && (
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(expandedFilters.capacity ? capacitiesData : capacitiesData.slice(0, 4)).map(cap => (
                      <label key={cap.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.capacity.includes(cap.value)}
                          onChange={(e) => handleFilterChange('capacity', cap.value, e.target.checked)}
                        />
                        <span>{cap.label}</span>
                      </label>
                    ))}
                    {capacitiesData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('capacity')} 
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
                        {expandedFilters.capacity ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CHUẨN KẾT NỐI */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('connection')}>
                  Chuẩn kết nối
                  <span className={`accordion-icon ${openFilters.connection ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.connection && (
                  <div className="filter-options">
                    {(expandedFilters.connection ? connectionData : connectionData.slice(0, 4)).map(conn => (
                      <label key={conn.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.connection.includes(conn.value)}
                          onChange={(e) => handleFilterChange('connection', conn.value, e.target.checked)}
                        />
                        <span>{conn.label}</span>
                      </label>
                    ))}
                    {connectionData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('connection')} 
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
                        {expandedFilters.connection ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CÔNG NGHỆ BỘ NHỚ NAND */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('nandTech')}>
                  Công nghệ bộ nhớ NAND
                  <span className={`accordion-icon ${openFilters.nandTech ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.nandTech && (
                  <div className="filter-options">
                    {nandTechData.map(tech => (
                      <label key={tech.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.nandTech.includes(tech.value)}
                          onChange={(e) => handleFilterChange('nandTech', tech.value, e.target.checked)}
                        />
                        <span>{tech.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* KÍCH THƯỚC */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('size')}>
                  Kích thước
                  <span className={`accordion-icon ${openFilters.size ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.size && (
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                          fontWeight: '500',
                          gridColumn: 'span 2'
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
                <h1>Ổ CỨNG (SSD / HDD)</h1>
                
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
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Không tìm thấy ổ cứng nào phù hợp với bộ lọc hiện tại.</div>
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
