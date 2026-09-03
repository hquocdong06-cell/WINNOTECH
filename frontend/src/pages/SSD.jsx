import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import useFavorite from '../hooks/useFavorite'
import useCompare from '../hooks/useCompare'
import { useAuth } from '../hooks/useAuth'
import '../assets/styles/cpu.css' // Reuse the sidebar layout styles

import { API_BASE as API_URL } from '../services/apiService';
import PriceRangeFilter from '../components/PriceRangeFilter';

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

export default function SSD() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { favoriteIds, toggleFavorite } = useFavorite()
  const { compareIds, toggleCompare } = useCompare()
  const { isLoggedIn } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popular')
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 0 })
  const [maxCategoryPrice, setMaxCategoryPrice] = useState(100000000)

  useEffect(() => {
    if (products.length > 0) {
      let max = 0
      products.forEach(p => {
        const pr = (p.Variants && p.Variants[0]) ? (p.Variants[0].sale_price || p.Variants[0].price || 0) : 0
        if (pr > max) max = pr
      })
      const roundedMax = max > 0 ? Math.ceil(max / 1000000) * 1000000 : 30000000
      setMaxCategoryPrice(roundedMax)
      setPriceFilter(prev => ({
        min: prev.min || 0,
        max: prev.max > 0 ? prev.max : roundedMax
      }))
    }
  }, [products])

  const handleQuickAddToCart = async (product) => {
    const variantsList = product.Variants || product.variants;
    const defaultVariant = variantsList?.find(v => v.variant_name === 'Mặc định') || variantsList?.[0];
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
        const res = await fetch(`${API_URL}/api/buildpc/components?category=storage`)
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm SSD từ DB:', err)
        setProducts([])
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

  const formatPrice = (price) => {
    return price ? price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'
  }

  // --- FILTER & SORT LOGIC ---
  const filteredProducts = products.filter(product => {
    // 0. Lọc theo Khoảng giá
    if (priceFilter.max > 0) {
      const price = getProductPrice(product)
      if (price < priceFilter.min || price > priceFilter.max) return false
    }

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

  // Pagination (12 SP / trang)
  const itemsPerPage = 12
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1
  const startIdx = (currentPage - 1) * itemsPerPage
  const visibleProducts = sortedProducts.slice(startIdx, startIdx + itemsPerPage)

  const paginationPages = (() => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages]
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  })()

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
                  <PriceRangeFilter
                    minPrice={priceFilter.min}
                    maxPrice={priceFilter.max || maxCategoryPrice}
                    minLimit={0}
                    maxLimit={maxCategoryPrice}
                    onPriceChange={({ min, max }) => {
                      setPriceFilter({ min, max })
                      setCurrentPage(1)
                    }}
                  />
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
                    const variantsList = product.Variants || product.variants
                    const defaultVariant = variantsList?.find(v => v.variant_name === 'Mặc định') || variantsList?.[0]
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
                            <div className="cpu-card-price-wrap"><span className="cpu-card-price">{formatPrice(price)}</span></div>
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
                <div className="cpu-footer-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Trang <span style={{ color: '#fff', fontWeight: 700 }}>{currentPage}</span> / {totalPages} (Hiển thị {startIdx + 1} - {Math.min(startIdx + itemsPerPage, sortedProducts.length)} trên {sortedProducts.length} sản phẩm)
                  </div>

                  <div className="cpu-pagination-right">
                    <button 
                      className="page-nav-btn" 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      title="Trang trước"
                    >
                      &lt;
                    </button>
                    {paginationPages.map((item, idx) => {
                      if (item === '...') {
                        return <span key={`ellipsis-${idx}`} className="page-ellipsis">...</span>
                      }
                      return (
                        <button
                          key={item}
                          className={`page-btn ${currentPage === item ? 'active' : ''}`}
                          onClick={() => setCurrentPage(item)}
                        >
                          {item}
                        </button>
                      )
                    })}
                    <button 
                      className="page-nav-btn"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      title="Trang tiếp theo"
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
