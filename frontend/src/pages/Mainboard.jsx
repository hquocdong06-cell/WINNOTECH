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

export default function Mainboard() {
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

      localStorage.removeItem('cartItems')
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right' })
    } catch (err) {
      toast.error('Lỗi khi thêm vào giỏ hàng!', { position: 'bottom-right' })
    }
  }

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
        const res = await fetch(`${API_URL}/api/buildpc/components?category=mainboard`)
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm Mainboard từ DB:', err)
        setProducts([])
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
    const price = getProductPrice(product)
    if (priceFilter.max > 0) {
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
