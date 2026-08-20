import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import useFavorite from '../hooks/useFavorite'
import useCompare from '../hooks/useCompare'
import { useAuth } from '../hooks/useAuth'
import '../assets/styles/cpu.css'

import { API_BASE as API_URL } from '../services/apiService';

// --- FILTER OPTION DATA MATCHING USER'S IMAGE ---
const brandsData = [
  { label: 'AMD', value: 'amd' },
  { label: 'Intel', value: 'intel' }
]

const useCaseData = [
  { label: 'Doanh nghiệp', value: 'doanh-nghiep' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Học sinh - Sinh viên', value: 'hoc-sinh-sinh-vien' },
  { label: 'Văn phòng', value: 'van-phong' },
  { label: 'Đồ họa - Kỹ thuật', value: 'do-hoa-ky-thuat' }
]

const seriesData = [
  { label: 'Core i3', value: 'core-i3' },
  { label: 'Core i5', value: 'core-i5' },
  { label: 'Core i7', value: 'core-i7' },
  { label: 'Core i9', value: 'core-i9' },
  { label: 'Pentium', value: 'pentium' },
  { label: 'Ryzen 3', value: 'ryzen-3' },
  { label: 'Ryzen 5', value: 'ryzen-5' },
  { label: 'Ryzen 7', value: 'ryzen-7' },
  { label: 'Ryzen 9', value: 'ryzen-9' },
  { label: 'Ryzen Threadripper', value: 'ryzen-threadripper' },
  { label: 'Ultra 5', value: 'ultra-5' },
  { label: 'Ultra 7', value: 'ultra-7' },
  { label: 'Ultra 9', value: 'ultra-9' }
]

const generationData = [
  { label: 'AMD Ryzen 5000 Series', value: 'amd-ryzen-5000' },
  { label: 'AMD Ryzen thế hệ thứ 1', value: 'amd-ryzen-1' },
  { label: 'AMD Ryzen thế hệ thứ 2', value: 'amd-ryzen-2' },
  { label: 'AMD Ryzen thế hệ thứ 3', value: 'amd-ryzen-3' },
  { label: 'AMD Ryzen thế hệ thứ 4', value: 'amd-ryzen-4' },
  { label: 'AMD Ryzen thế hệ thứ 5', value: 'amd-ryzen-5' },
  { label: 'AMD Ryzen thế hệ thứ 7', value: 'amd-ryzen-7' },
  { label: 'AMD Ryzen thế hệ thứ 8', value: 'amd-ryzen-8' },
  { label: 'AMD Ryzen thế hệ thứ 9', value: 'amd-ryzen-9' },
  { label: 'AMD Threadripper', value: 'amd-threadripper' },
  { label: 'Intel Core Ultra series 2', value: 'intel-ultra-2' },
  { label: 'Intel Core thế hệ thứ 10', value: 'intel-core-10' },
  { label: 'Intel Core thế hệ thứ 11', value: 'intel-core-11' },
  { label: 'Intel Core thế hệ thứ 12', value: 'intel-core-12' },
  { label: 'Intel Core thế hệ thứ 13', value: 'intel-core-13' },
  { label: 'Intel Core thế hệ thứ 14', value: 'intel-core-14' },
  { label: 'Intel Pentium G', value: 'intel-pentium-g' },
  { label: 'Intel Pentium Gold', value: 'intel-pentium-gold' },
  { label: 'Ryzen Threadripper PRO 9000 WX', value: 'ryzen-threadripper-9000' }
]

const coresData = [
  { label: '10', value: '10' },
  { label: '12', value: '12' },
  { label: '14', value: '14' },
  { label: '16', value: '16' },
  { label: '18', value: '18' },
  { label: '2', value: '2' },
  { label: '20', value: '20' },
  { label: '24', value: '24' },
  { label: '32', value: '32' },
  { label: '4', value: '4' },
  { label: '6', value: '6' },
  { label: '64', value: '64' },
  { label: '8', value: '8' },
  { label: '96', value: '96' }
]

const socketData = [
  { label: '1200', value: '1200' },
  { label: '1700', value: '1700' },
  { label: '1851', value: '1851' },
  { label: 'AM4', value: 'am4' },
  { label: 'AM5', value: 'am5' },
  { label: 'FCLGA1700', value: 'fclga1700' },
  { label: 'TR4', value: 'tr4' },
  { label: 'sTR5', value: 'str5' },
  { label: 'sWRX8', value: 'swrx8' }
]

export default function CPU() {
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
    useCase: [],
    series: [],
    generation: [],
    cores: [],
    socket: []
  })

  // --- ACCORDION OPEN/CLOSE STATES ---
  const [openFilters, setOpenFilters] = useState({
    priceRange: true,
    brands: true,
    useCase: true,
    series: true,
    generation: true,
    cores: true,
    socket: true
  })

  const toggleFilter = (key) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // --- EXPAND FILTERS STATE ---
  const [expandedFilters, setExpandedFilters] = useState({
    useCase: false,
    series: false,
    generation: false,
    cores: false,
    socket: false
  })

  const toggleExpand = (key) => {
    setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // --- FETCH PRODUCTS FROM BACKEND ---
  useEffect(() => {
    const fetchCPUProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/buildpc/components?category=cpu`)
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm CPU từ DB:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchCPUProducts()
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
    const nameLower = product.name.toLowerCase()
    const descLower = (product.description || '').toLowerCase()
    const specsLower = (product.short_desc || '').toLowerCase()
    // compatibility_meta có socket chính xác nhất
    const metaSocket = (product.compatibility_meta?.socket || '').toUpperCase()

    // 1. Thương hiệu (Brand) — dùng brand_id.slug đã được populate
    if (filters.brands.length > 0) {
      const brandSlug = (product.brand_id?.slug || '').toLowerCase()
      if (!filters.brands.includes(brandSlug)) return false
    }

    // 2. Nhu cầu (Use Case) — dựa theo tên + mô tả + đặc điểm CPU
    if (filters.useCase.length > 0) {
      const match = filters.useCase.some(uc => {
        if (uc === 'gaming')
          return nameLower.includes('gaming') || nameLower.includes('x3d') ||
                 descLower.includes('chơi game') || descLower.includes('gaming') ||
                 /\bi7[-\s]/i.test(product.name) || /\bi9[-\s]/i.test(product.name) ||
                 /ryzen\s*7\s+\d/i.test(product.name) || /ryzen\s*9\s+\d/i.test(product.name)
        if (uc === 'van-phong')
          return nameLower.includes('office') || descLower.includes('văn phòng') ||
                 /\bi3[-\s]/i.test(product.name) || /\bi5[-\s]/i.test(product.name) ||
                 nameLower.includes('pentium') || nameLower.includes('celeron') ||
                 /ryzen\s*3\s+\d/i.test(product.name) || /ryzen\s*5\s+\d/i.test(product.name)
        if (uc === 'hoc-sinh-sinh-vien')
          return descLower.includes('học sinh') || descLower.includes('sinh viên') ||
                 descLower.includes('học tập') ||
                 /\bi3[-\s]/i.test(product.name) || nameLower.includes('pentium') ||
                 /ryzen\s*3\s+\d/i.test(product.name)
        if (uc === 'do-hoa-ky-thuat')
          return descLower.includes('đồ họa') || descLower.includes('kỹ thuật') ||
                 descLower.includes('render') || descLower.includes('workstation') ||
                 nameLower.includes('threadripper') ||
                 /\bi9[-\s]/i.test(product.name) || /ryzen\s*9\s+\d/i.test(product.name) ||
                 /ultra\s*9/i.test(product.name)
        if (uc === 'doanh-nghiep')
          return descLower.includes('doanh nghiệp') || descLower.includes('server') ||
                 descLower.includes('máy chủ') || nameLower.includes('threadripper') ||
                 nameLower.includes('xeon')
        return false
      })
      if (!match) return false
    }

    // 3. Series CPU — regex chính xác theo tên sản phẩm
    if (filters.series.length > 0) {
      const match = filters.series.some(s => {
        if (s === 'core-i3') return /\bi3[-\s]/i.test(product.name) || nameLower.includes('core i3')
        if (s === 'core-i5') return /\bi5[-\s]/i.test(product.name) || nameLower.includes('core i5')
        if (s === 'core-i7') return /\bi7[-\s]/i.test(product.name) || nameLower.includes('core i7')
        if (s === 'core-i9') return /\bi9[-\s]/i.test(product.name) || nameLower.includes('core i9')
        if (s === 'pentium') return nameLower.includes('pentium')
        if (s === 'ryzen-3') return /ryzen\s*3\s+\d/i.test(product.name)
        if (s === 'ryzen-5') return /ryzen\s*5\s+\d/i.test(product.name)
        if (s === 'ryzen-7') return /ryzen\s*7\s+\d/i.test(product.name)
        if (s === 'ryzen-9') return /ryzen\s*9\s+\d/i.test(product.name)
        if (s === 'ryzen-threadripper') return nameLower.includes('threadripper')
        if (s === 'ultra-5') return /ultra\s*5\s+\d/i.test(product.name)
        if (s === 'ultra-7') return /ultra\s*7\s+\d/i.test(product.name)
        if (s === 'ultra-9') return /ultra\s*9\s+\d/i.test(product.name)
        return false
      })
      if (!match) return false
    }

    // 4. Thế hệ (Generation) — dùng regex số model trong tên sản phẩm
    if (filters.generation.length > 0) {
      const match = filters.generation.some(gen => {
        // Intel: i*-14xxx, 13xxx...
        if (gen === 'intel-core-14') return /i[3579]-1[34][0-9]{3}/i.test(product.name) || nameLower.includes('14th') || specsLower.includes('14th')
        if (gen === 'intel-core-13') return /i[3579]-13[0-9]{3}/i.test(product.name) || nameLower.includes('13th') || specsLower.includes('13th')
        if (gen === 'intel-core-12') return /i[3579]-12[0-9]{3}/i.test(product.name) || nameLower.includes('12th') || specsLower.includes('12th')
        if (gen === 'intel-core-11') return /i[3579]-11[0-9]{3}/i.test(product.name) || nameLower.includes('11th')
        if (gen === 'intel-core-10') return /i[3579]-10[0-9]{3}/i.test(product.name) || nameLower.includes('10th')
        // AMD Ryzen: số đầu của model number
        if (gen === 'amd-ryzen-9') return /ryzen\s*[579]\s+9[0-9]{3}/i.test(product.name)
        if (gen === 'amd-ryzen-8') return /ryzen\s*[357]\s+8[0-9]{3}/i.test(product.name) || /8[567]00[gG]/.test(product.name)
        if (gen === 'amd-ryzen-7') return /ryzen\s*[579]\s+7[0-9]{3}/i.test(product.name)
        if (gen === 'amd-ryzen-5000') return /ryzen\s*[357]\s+5[0-9]{3}/i.test(product.name)
        if (gen === 'amd-ryzen-4') return /ryzen\s*[357]\s+4[0-9]{3}/i.test(product.name)
        if (gen === 'amd-ryzen-3') return /ryzen\s*[357]\s+3[0-9]{3}/i.test(product.name)
        if (gen === 'amd-ryzen-2') return /ryzen\s*[357]\s+2[0-9]{3}/i.test(product.name)
        if (gen === 'amd-ryzen-1') return /ryzen\s*[357]\s+1[0-9]{3}/i.test(product.name)
        if (gen === 'intel-ultra-2') return /ultra\s*[579]\s+2[0-9]{2}/i.test(product.name) || nameLower.includes('series 2')
        if (gen === 'intel-pentium-g') return /pentium\s+g\d+/i.test(product.name)
        if (gen === 'intel-pentium-gold') return nameLower.includes('pentium gold')
        if (gen === 'amd-threadripper') return nameLower.includes('threadripper') && !/threadripper.*pro.*9/i.test(product.name)
        if (gen === 'ryzen-threadripper-9000') return /threadripper.*pro.*9[0-9]{3}/i.test(product.name)
        return false
      })
      if (!match) return false
    }

    // 5. Số nhân thực (Cores) — parse từ short_desc format "8C/16T" hoặc "8c/16t"
    if (filters.cores.length > 0) {
      // short_desc format: "8C/16T, 5.0GHz, ..." hoặc "24C/32T"
      const coreMatch = specsLower.match(/^(\d+)[c\/]/) || specsLower.match(/(\d+)c\//)
      const coreCount = coreMatch ? coreMatch[1] : null
      const match = filters.cores.some(c => {
        if (coreCount && coreCount === c) return true
        // Fallback: tìm "Xc" hoặc "X cores" hoặc "X nhân"
        return specsLower.includes(`${c}c/`) || specsLower.includes(`${c} cores`) ||
               specsLower.includes(`${c} nhân`) || descLower.includes(`${c} nhân`)
      })
      if (!match) return false
    }

    // 6. Socket — ưu tiên compatibility_meta.socket (chính xác nhất), fallback short_desc
    if (filters.socket.length > 0) {
      const match = filters.socket.some(sock => {
        const sockUpper = sock.toUpperCase()
        // So sánh với compatibility_meta trước
        if (metaSocket && metaSocket === sockUpper) return true
        // Fallback: tìm trong short_desc, tên, mô tả
        return specsLower.includes(sock.toLowerCase()) ||
               nameLower.includes(sock.toLowerCase()) ||
               descLower.includes(sock.toLowerCase())
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
            <span className="active">BỘ VI XỬ LÝ CPU</span>
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

              {/* SERIES CPU */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('series')}>
                  Series CPU
                  <span className={`accordion-icon ${openFilters.series ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.series && (
                  <div className="filter-options">
                    {(expandedFilters.series ? seriesData : seriesData.slice(0, 4)).map(s => (
                      <label key={s.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.series.includes(s.value)}
                          onChange={(e) => handleFilterChange('series', s.value, e.target.checked)}
                        />
                        <span>{s.label}</span>
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

              {/* THẾ HỆ */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('generation')}>
                  Thế hệ
                  <span className={`accordion-icon ${openFilters.generation ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.generation && (
                  <div className="filter-options">
                    {(expandedFilters.generation ? generationData : generationData.slice(0, 4)).map(gen => (
                      <label key={gen.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.generation.includes(gen.value)}
                          onChange={(e) => handleFilterChange('generation', gen.value, e.target.checked)}
                        />
                        <span style={{ fontSize: '12px' }}>{gen.label}</span>
                      </label>
                    ))}
                    {generationData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('generation')} 
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
                        {expandedFilters.generation ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SỐ NHÂN THỰC */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('cores')}>
                  Số nhân thực
                  <span className={`accordion-icon ${openFilters.cores ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.cores && (
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(expandedFilters.cores ? coresData : coresData.slice(0, 4)).map(c => (
                      <label key={c.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.cores.includes(c.value)}
                          onChange={(e) => handleFilterChange('cores', c.value, e.target.checked)}
                        />
                        <span>{c.label}</span>
                      </label>
                    ))}
                    {coresData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('cores')} 
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
                        {expandedFilters.cores ? 'Thu gọn' : 'Xem thêm'}
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
                    {(expandedFilters.socket ? socketData : socketData.slice(0, 4)).map(sock => (
                      <label key={sock.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.socket.includes(sock.value)}
                          onChange={(e) => handleFilterChange('socket', sock.value, e.target.checked)}
                        />
                        <span>{sock.label}</span>
                      </label>
                    ))}
                    {socketData.length > 4 && (
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


            </aside>

            {/* MAIN CONTENT - PRODUCTS */}
            <main className="cpu-main">
              {/* HEADER */}
              <div className="cpu-main-header">
                <h1>BỘ VI XỬ LÝ CPU</h1>
                
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
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Không tìm thấy CPU nào phù hợp với bộ lọc hiện tại.</div>
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
                            <div className="cpu-card-price-wrap">
                              <span className="cpu-card-price">{formatPrice(price)}</span>
                              {product.sale > 0 && variantsList?.[0]?.price && (
                                <span className="cpu-card-original-price">
                                  {formatPrice(variantsList[0].price)}
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
