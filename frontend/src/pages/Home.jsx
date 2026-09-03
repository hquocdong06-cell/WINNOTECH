import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/home.css'
import useFavorite from '../hooks/useFavorite'
import { useAuth } from '../hooks/useAuth'
import { productAPI } from '../services/apiService'
import ProductCard from '../components/ProductCard'

import { API_BASE as API_URL } from '../services/apiService';
const PAGE_SIZE = 10

// ============================================================
// Helper functions (stable, defined outside component)
// ============================================================
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ'
  return price.toLocaleString('vi-VN') + 'đ'
}

const getProductImage = (product) => {
  if (product.AnhSP && product.AnhSP.length > 0) {
    const url = product.AnhSP[0].url
    return url.startsWith('http') ? url : `${API_URL}${url}`
  }
  if (product.thumnail) return product.thumnail.startsWith('http') ? product.thumnail : `${API_URL}${product.thumnail}`
  return null
}

const getCategoryImageUrl = (image) => {
  if (!image) return null
  return image.startsWith('http') ? image : `${API_URL}${image}`
}

const getProductPriceInfo = (product) => {
  let originalPrice = product.price || 0
  let currentPrice = product.price || 0
  let hasSale = false
  let salePercent = product.sale || 0

  if (product.Variants && product.Variants.length > 0) {
    let minActivePrice = Infinity
    let chosenVariant = null
    product.Variants.forEach(v => {
      const activePrice = v.sale_price && v.sale_price > 0 ? v.sale_price : v.price
      if (activePrice && activePrice < minActivePrice) {
        minActivePrice = activePrice
        chosenVariant = v
      }
    })
    if (chosenVariant) {
      originalPrice = chosenVariant.price
      currentPrice = minActivePrice
      hasSale = !!chosenVariant.sale_price && chosenVariant.sale_price > 0 && chosenVariant.sale_price < chosenVariant.price
      if (hasSale) {
        salePercent = Math.round(((chosenVariant.price - chosenVariant.sale_price) / chosenVariant.price) * 100)
      }
    }
  } else {
    if (product.sale > 0 && originalPrice > 0) {
      hasSale = true
      currentPrice = originalPrice * (1 - product.sale / 100)
      salePercent = product.sale
    }
  }

  return { originalPrice, currentPrice, hasSale, salePercent }
}



// ============================================================
// usePageFlip — hook quản lý pagination + animation
// ============================================================
function usePageFlip(items) {
  const [shownPage, setShownPage] = useState(0)   // trang đang hiển thị
  const [phase, setPhase] = useState('idle')       // 'idle' | 'exit' | 'enter'
  const [dir, setDir] = useState('next')           // 'next' | 'prev'
  const timerRef = useRef(null)

  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const currentItems = items.slice(shownPage * PAGE_SIZE, (shownPage + 1) * PAGE_SIZE)

  // Khi danh sách thay đổi (lọc, load xong…) reset về trang 0
  useEffect(() => {
    setShownPage(0)
    setPhase('idle')
  }, [items.length])

  const goPage = useCallback((newPage, direction) => {
    if (phase !== 'idle') return
    if (newPage < 0 || newPage >= totalPages) return

    setDir(direction)
    setPhase('exit')

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setShownPage(newPage)
      setPhase('enter')
      timerRef.current = setTimeout(() => {
        setPhase('idle')
      }, 360)
    }, 270)
  }, [phase, totalPages])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const animClass = (() => {
    if (phase === 'exit') return dir === 'next' ? 'flip-exit-next' : 'flip-exit-prev'
    if (phase === 'enter') return dir === 'next' ? 'flip-enter-right' : 'flip-enter-left'
    return ''
  })()

  return { shownPage, currentItems, totalPages, goPage, animClass, isAnimating: phase !== 'idle' }
}

// ============================================================
// ProductSection — section tái sử dụng với animation lật trang
// ============================================================
const ProductSection = ({
  products,
  loading,
  emptyMsg,
  sectionLabel,
  sectionLabelStyle,
  titleLine1,
  titleLine2,
  viewAllText,
  viewAllHref = '#',
  className = '',
  favoriteIds,
  onToggleFavorite,
  onAddToCart,
  showSold = false
}) => {
  const { shownPage, currentItems, totalPages, goPage, animClass, isAnimating } = usePageFlip(products)

  return (
    <section className={`products-section ${className}`.trim()}>
      <div className="section-inner">
        {/* Header */}
        <div className="products-header">
          <div>
            <div className="section-label" style={sectionLabelStyle}>{sectionLabel}</div>
            <h2 className="section-title" style={{ marginBottom: 0, lineHeight: 1.2 }}>
              <span style={{ display: 'block' }}>{titleLine1}</span>
              <span style={{ display: 'block', marginTop: '12px' }}>{titleLine2}</span>
            </h2>
          </div>
          <div className="products-header-right">
            <div className="products-header-meta">
              {!loading && totalPages > 1 && (
                <span className="page-counter-badge">
                  Trang {shownPage + 1} / {totalPages}
                </span>
              )}
              <a href={viewAllHref}>{viewAllText}</a>
            </div>
            <div className="products-nav">
              <button
                onClick={() => goPage(shownPage - 1, 'prev')}
                disabled={shownPage === 0 || isAnimating || loading}
                aria-label="Trang trước"
              >←</button>
              <button
                onClick={() => goPage(shownPage + 1, 'next')}
                disabled={shownPage >= totalPages - 1 || isAnimating || loading}
                aria-label="Trang tiếp"
              >→</button>
            </div>
          </div>
        </div>

        {/* Product grid với animation */}
        <div className="products-row-wrapper">
          <div className={`products-row ${animClass}`}>
            {loading ? (
              <div className="products-empty" style={{ gridColumn: '1/-1' }}>Đang tải sản phẩm...</div>
            ) : currentItems.length === 0 ? (
              <div className="products-empty" style={{ gridColumn: '1/-1' }}>{emptyMsg}</div>
            ) : (
              currentItems.map(product => (
                <ProductCard key={product._id} product={product} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} onAddToCart={() => onAddToCart?.(product)} showSold={showSold} />
              ))
            )}
          </div>
        </div>

        {/* Page dots */}
        {!loading && totalPages > 1 && (
          <div className="section-page-dots">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-dot ${i === shownPage ? 'active' : ''}`}
                onClick={() => goPage(i, i > shownPage ? 'next' : 'prev')}
                aria-label={`Đến trang ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ============================================================
// Deduplication helpers
// ============================================================
const getMaxDiscountPct = (product) => {
  // Tính % giảm giá cao nhất từ variants
  if (product.Variants && product.Variants.length > 0) {
    let max = 0
    product.Variants.forEach(v => {
      if (v.sale_price > 0 && v.price > 0 && v.sale_price < v.price) {
        const pct = (v.price - v.sale_price) / v.price * 100
        if (pct > max) max = pct
      }
    })
    return max
  }
  return product.sale || 0
}

const hasTrueDiscount = (product) =>
  getMaxDiscountPct(product) > 0
// ============================================================
// Home — main component
// ============================================================
export default function Home() {
  const dispatch = useDispatch()
  const { isLoggedIn } = useAuth()
  const { favoriteIds, toggleFavorite } = useFavorite()

  const [featuredProducts, setFeaturedProducts] = useState([])  // Bán chạy
  const [newProducts, setNewProducts]           = useState([])  // Hàng mới
  const [saleProducts, setSaleProducts]         = useState([])  // Giảm giá
  const [flashSaleProducts, setFlashSaleProducts] = useState([])  // Flash Sale 8h
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(true)
  const [flashSaleRemainingSeconds, setFlashSaleRemainingSeconds] = useState(28800)
  const [allProducts, setAllProducts]           = useState([])  // Toàn bộ sản phẩm phục vụ tìm kiếm
  const [categories, setCategories]             = useState([])

  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingFlashSale, setLoadingFlashSale] = useState(true)

  const [currentBanner, setCurrentBanner] = useState(0)
  const [banners, setBanners] = useState([])
  const [loadingBanners, setLoadingBanners] = useState(true)

  const formatCountdown = (totalSeconds) => {
    const s = Math.max(0, totalSeconds || 0);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return {
      hrs: String(hrs).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
    };
  };

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

    const { originalPrice, currentPrice } = getProductPriceInfo(product)
    const discountPct = product.flash_sale_discount || 25
    const calcFlashPrice = currentPrice && currentPrice < originalPrice ? currentPrice : Math.round(originalPrice * (1 - discountPct / 100))
    const price = calcFlashPrice || currentPrice || defaultVariant.sale_price || defaultVariant.price || product.price

    const imgUrl = getProductImage(product)
    const cartPayload = {
      product_id: product._id,
      variant_id: defaultVariant._id,
      name: product.name,
      price: price,
      quantity: 1,
      image: imgUrl
    }

    // Chưa đăng nhập → lưu localStorage qua Redux, không cần gọi API
    if (!isLoggedIn) {
      dispatch(addToCart(cartPayload))
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right' })
      return
    }

    // Đã đăng nhập → đồng bộ lên CSDL MongoDB
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
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right' })
    } catch (err) {
      toast.error('Lỗi khi thêm vào giỏ hàng!', { position: 'bottom-right' })
    }
  }

  const handleBuyNowFlashSale = (product) => {
    if (!product) return

    // 1. Nếu chưa đăng nhập -> tuyệt đối không cho mua, hiện thông báo và chuyển hướng sang login
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thực hiện mua hàng!', { position: 'bottom-right' })
      navigate('/login?redirect=/checkout')
      return
    }

    const defaultVariant = product.Variants?.find(v => v.variant_name === 'Mặc định') || product.Variants?.[0] || {}
    const { originalPrice, currentPrice } = getProductPriceInfo(product)
    const discountPct = product.flash_sale_discount || 25
    const calcFlashPrice = currentPrice && currentPrice < originalPrice ? currentPrice : Math.round(originalPrice * (1 - discountPct / 100))
    const price = calcFlashPrice || originalPrice || product.price || 100000

    const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/
    let variantId = defaultVariant._id
    if (!variantId || !OBJECT_ID_REGEX.test(String(variantId))) {
      if (OBJECT_ID_REGEX.test(String(product._id))) {
        variantId = product._id
      }
    }

    if (!variantId || !OBJECT_ID_REGEX.test(String(variantId))) {
      toast.error('Sản phẩm Flash Sale chưa có biến thể sẵn sàng!', { position: 'bottom-right' })
      return
    }

    // 2. Tính toán cộng dồn số lượng nếu ấn Mua ngay 2 lần cho cùng 1 sản phẩm
    let qty = 1
    const stored = sessionStorage.getItem('buyNowItem')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?._variantId === variantId || parsed?.cartItem?.variant_id === variantId) {
          qty = (parsed.cartItem?.quantity || 1) + 1
        }
      } catch {}
    }

    const imgUrl = getProductImage(product)
    const buyNowItem = {
      cartItem: {
        _id: variantId,
        variant_id: variantId,
        quantity: qty,
        price: price
      },
      variant: {
        _id: variantId,
        price: originalPrice || price,
        sale_price: price,
        variant_name: defaultVariant.variant_name || ''
      },
      product: {
        _id: product._id,
        name: product.name
      },
      AnhSP: imgUrl ? [{ url: imgUrl }] : [],
      _localPrice: price,
      _variantId: variantId,
      _isBuyNow: true
    }

    // 3. Lưu vào sessionStorage & Chuyển thẳng đến trang thanh toán /checkout
    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem))
    navigate('/checkout', { state: { buyNowItem } })
  }

  // Fetch banners từ API (chỉ lấy active, sắp xếp theo position 1, 2, 3...)
  useEffect(() => {
    const STATIC_FALLBACK = [
      { _id: 's1', image: '/public/images/banners/banner11.jpg', name: 'Banner 1', link: '/products', position: 1 },
      { _id: 's2', image: '/public/images/banners/banner22.png', name: 'Banner 2', link: '/products', position: 2 },
      { _id: 's3', image: '/public/images/banners/banner33.png', name: 'Banner 3', link: '/gpu', position: 3 },
      { _id: 's4', image: '/public/images/banners/banner44.png', name: 'Banner 4', link: '/products', position: 4 },
    ]
    setLoadingBanners(true)
    fetch(`${API_URL}/api/banners`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          const active = d.data
            .filter(b => b.status === 'active')
            .sort((a, b) => {
              const posA = Number(a.position) ?? 999
              const posB = Number(b.position) ?? 999
              if (posA !== posB) return posA - posB
              return (a.createdAt || '').localeCompare(b.createdAt || '')
            })
          setBanners(active.length > 0 ? active : STATIC_FALLBACK)
        } else {
          setBanners(STATIC_FALLBACK)
        }
      })
      .catch(() => setBanners(STATIC_FALLBACK))
      .finally(() => setLoadingBanners(false))
  }, [])

  // Auto-slide banner (dùng banners.length động)
  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [banners.length])

  const [catPage, setCatPage] = useState(0)
  const CAT_PAGE_SIZE = 4
  const activeCategories = categories.filter(c => c.status === 'active')
  const totalCatPages = Math.ceil(activeCategories.length / CAT_PAGE_SIZE)
  const currentCategories = activeCategories.slice(catPage * CAT_PAGE_SIZE, (catPage + 1) * CAT_PAGE_SIZE)

  const handleNextCat = () => {
    if (catPage < totalCatPages - 1) {
      setCatPage(prev => prev + 1)
    }
  }

  const handlePrevCat = () => {
    if (catPage > 0) {
      setCatPage(prev => prev - 1)
    }
  }


  // ─── Fetch 1 lần, chia thành 3 nhóm + dedup ─────────────
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/products`)
        const data = await res.json()
        const all = data.data
        setAllProducts(all)

        // 1. SẢN PHẨM GIẢM GIÁ — có sale_price thực sự
        const saleList = [...all]
          .filter(hasTrueDiscount)
          .sort((a, b) => getMaxDiscountPct(b) - getMaxDiscountPct(a))

        const saleIds = new Set(saleList.map(p => String(p._id)))

        // 2. BÁN CHẠY / FEATURED — sản phẩm bán chạy nhất, lượt bán cao nhất
        //    KHÔNG trùng với saleList
        const getSold = (p) => Number(p.sold_count ?? p.sold_quantity ?? p.buyturn ?? 0)
        const featuredList = [...all]
          .filter(p => !saleIds.has(String(p._id)))   // loại trùng
          .sort((a, b) => getSold(b) - getSold(a) || (b.sale || 0) - (a.sale || 0))

        const featuredIds = new Set(featuredList.slice(0, PAGE_SIZE).map(p => String(p._id)))

        // 3. HÀNG MỚI — mới nhất, không trùng 2 nhóm trên
        const newList = [...all]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .filter(p => !saleIds.has(String(p._id)) && !featuredIds.has(String(p._id)))

        // Fallback: nếu sau dedup quá ít thì dùng toàn bộ (có thể trùng nhưng ít hơn)
        setSaleProducts(saleList.length >= 5 ? saleList : all.filter(hasTrueDiscount).concat(all).slice(0, 20))
        setFeaturedProducts(featuredList.length >= 5 ? featuredList : [...all].sort((a, b) => getSold(b) - getSold(a)))
        setNewProducts(newList.length >= 5 ? newList : [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      } catch (err) {
        console.error('Lỗi fetch products:', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    run()
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data) })
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [])

  // ── Fetch Flash Sale 8h (Top 5 sản phẩm bán thấp nhất hoặc tùy chỉnh) ──
  useEffect(() => {
    setLoadingFlashSale(true)
    productAPI.getFlashSale()
      .then(res => {
        if (res.success) {
          if (res.active === false) {
            setIsFlashSaleActive(false)
            setFlashSaleProducts([])
          } else if (res.data) {
            setIsFlashSaleActive(true)
            setFlashSaleProducts(res.data.slice(0, 5))
            if (res.sessionInfo && res.sessionInfo.remainingSeconds !== undefined) {
              setFlashSaleRemainingSeconds(res.sessionInfo.remainingSeconds)
            }
          }
        }
      })
      .catch(err => console.error("Lỗi fetch Flash Sale:", err))
      .finally(() => setLoadingFlashSale(false))
  }, [])

  // ── Đếm ngược thời gian thực 8h (Real-time timer 1s) ──
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleRemainingSeconds(prev => (prev > 0 ? prev - 1 : 28800))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Blog & FAQ (dynamic with static fallback)
  const [blogs, setBlogs] = useState([
    { _id: '1', categories_post_id: { name: 'HƯỚNG DẪN' }, tittle: 'Hướng dẫn chọn cấu hình PC gaming 2024 phù hợp với bạn', createdAt: '2024-05-20T00:00:00.000Z', slug: 'huong-dan-chon-cau-hinh-pc-gaming-2024', image: new URL('../assets/images/blog1.png', import.meta.url).href },
    { _id: '2', categories_post_id: { name: 'KIẾN THỨC' }, tittle: 'CPU có nhân và luồng là gì? Hiểu đúng để chọn CPU tốt', createdAt: '2024-05-18T00:00:00.000Z', slug: 'cpu-nhan-va-luong-la-gi', image: new URL('../assets/images/blog2.png', import.meta.url).href },
    { _id: '3', categories_post_id: { name: 'BUILD PC' }, tittle: 'Build PC trắng đẹp 2024 — Stealth design & hiệu năng cao', createdAt: '2024-05-15T00:00:00.000Z', slug: 'build-pc-trang-dep-2024', image: new URL('../assets/images/blog3.png', import.meta.url).href }
  ])

  useEffect(() => {
    fetch(`${API_URL}/posts?status=published`)
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data) && d.data.length > 0) setBlogs(d.data.slice(0, 3)) })
      .catch(() => {})
  }, [])

  // ── Search: gọi API BE thay vì filter client-side ──
  const searchQuery = new URLSearchParams(window.location.search).get('search') || ''
  const [searchResults, setSearchResults] = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }
    setLoadingSearch(true)
    productAPI.search(searchQuery)
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setSearchResults(data.data)
        } else {
          // Fallback: filter client-side nếu API không trả về kết quả
          const removeDiacritics = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D')
          const cleanQuery = removeDiacritics(searchQuery.toLowerCase().trim())
          setSearchResults(allProducts.filter(p => removeDiacritics((p.name || '').toLowerCase()).includes(cleanQuery)))
        }
      })
      .catch(() => {
        // Fallback client-side nếu lỗi mạng
        const removeDiacritics = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D')
        const cleanQuery = removeDiacritics(searchQuery.toLowerCase().trim())
        setSearchResults(allProducts.filter(p => removeDiacritics((p.name || '').toLowerCase()).includes(cleanQuery)))
      })
      .finally(() => setLoadingSearch(false))
  }, [searchQuery, allProducts])

  const filterBySearch = (list) => list

  return (
    <DefaultLayout>
      {searchQuery ? (
        <ProductSection
          products={searchResults}
          loading={loadingSearch}
          emptyMsg={`Không tìm thấy sản phẩm nào khớp với từ khóa "${searchQuery}"`}
          sectionLabel="KẾT QUẢ TÌM KIẾM"
          sectionLabelStyle={{ color: 'var(--yellow)' }}
          titleLine1="KẾT QUẢ TÌM KIẾM"
          titleLine2={`Từ khóa: "${searchQuery}"`}
          viewAllText="TẤT CẢ SẢN PHẨM →"
          viewAllHref="#"
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          onAddToCart={handleQuickAddToCart}
        />
      ) : (
        <>
          {/* ── HERO ── */}
          <div className="hero-wrapper">
        <section className="hero">
          <div className="hero-bg">
            {banners.map((banner, index) => {
              const imgSrc = banner.image
                ? (banner.image.startsWith('http') ? banner.image : `${API_URL}${banner.image.startsWith('/') ? '' : '/'}${banner.image}`)
                : null
              return imgSrc ? (
                <img
                  key={banner._id || index}
                  src={imgSrc}
                  alt={banner.name || `Banner ${index + 1}`}
                  className={currentBanner === index ? 'active' : ''}
                />
              ) : null
            })}
          </div>
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-ctas">
                <Link to="/products" className="btn-primary">KHÁM PHÁ NGAY →</Link>
                <Link to="/pc-gaming" className="btn-ghost">XEM CẤU HÌNH ĐỀ XUẤT →</Link>
              </div>
            </div>
          </div>
          <div className="hero-pagination">
            {banners.map((banner, index) => (
              <React.Fragment key={banner._id || index}>
                <span
                  className={currentBanner === index ? 'active' : ''}
                  onClick={() => setCurrentBanner(index)}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                {currentBanner === index && <div className="hero-pagination-accent"></div>}
                {index < banners.length - 1 && <div className="hero-pagination-line"></div>}
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>

      {/* ── TRUST BAR ── */}
      <div className="trustbar">
        <div className="trustbar-inner">
          {[
            { icon: <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>, title: 'CẤU HÌNH ĐA DẠNG', sub: 'Đáp ứng mọi nhu cầu' },
            { icon: <><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></>, title: 'LINH KIỆN CHÍNH HÃNG', sub: '100% chính hãng, chất lượng cao' },
            { icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />, title: 'HỖ TRỢ KỸ THUẬT 24/7', sub: 'Đội ngũ kỹ thuật chuyên nghiệp' },
            { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, title: 'THANH TOÁN AN TOÀN', sub: 'Bảo mật tuyệt đối' },
          ].map((t, i) => (
            <div key={i} className="trust-item">
              <div className="trust-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{t.icon}</svg>
              </div>
              <div>
                <div className="trust-title">{t.title}</div>
                <div className="trust-sub">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORY ── */}
      <section className="category-section">
        <div className="section-inner">
          <div className="cat-nav">
            <button 
              onClick={handlePrevCat} 
              disabled={catPage === 0 || loadingCategories}
              style={{ opacity: catPage === 0 ? 0.3 : 1, cursor: catPage === 0 ? 'not-allowed' : 'pointer' }}
            >
              ←
            </button>
            <button 
              onClick={handleNextCat} 
              disabled={catPage >= totalCatPages - 1 || loadingCategories}
              style={{ opacity: catPage >= totalCatPages - 1 ? 0.3 : 1, cursor: catPage >= totalCatPages - 1 ? 'not-allowed' : 'pointer' }}
            >
              →
            </button>
          </div>
          <div className="cat-layout">
            <div className="cat-left">
              <h2>DANH MỤC<br />NỔI BẬT</h2>
              <a href="#">XEM TẤT CẢ →</a>
            </div>
            <div className="cat-grid">
              {loadingCategories ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Đang tải danh mục...</div>
              ) : activeCategories.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Chưa có danh mục nào</div>
              ) : currentCategories.map(cat => (
                <Link key={cat._id} to={`/${cat.slug}`} className="cat-card" style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="cat-card-name">{cat.name}</div>
                  <div className="cat-card-count">{cat.slug}</div>
                  <div className="cat-card-img">
                    {cat.image
                      ? <img src={getCategoryImageUrl(cat.image)} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px' }}>{cat.name}</div>
                    }
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 🔥 FLASH SALE 8H REAL-TIME (TOP 5 SẢN PHẨM BÁN THẤP NHẤT HẶC TÙY CHỈNH) ── */}
      {!searchQuery && isFlashSaleActive && flashSaleProducts.length > 0 && (
        <section className="flash-sale-section">
          <div className="section-inner">
            <div className="flash-sale-container">
              
              {/* Header với Tiêu đề & Đồng hồ đếm ngược 8 tiếng thực */}
              <div className="flash-sale-header">
                <div className="flash-sale-title-wrap">
                  <span className="flash-sale-icon-flame">🔥</span>
                  <div>
                    <h2 className="flash-sale-heading">
                      FLASH SALE <span>8 GIỜ VÀNG</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Top 5 sản phẩm xả kho giá sốc — Đếm ngược thời gian thực</p>
                  </div>
                </div>

                {/* Đồng hồ đếm ngược Real-time */}
                <div className="flash-sale-timer-box">
                  <span className="flash-sale-timer-label">KẾT THÚC TRONG:</span>
                  <div className="flash-sale-countdown">
                    <span className="timer-num">{formatCountdown(flashSaleRemainingSeconds).hrs}</span>
                    <span className="timer-colon">:</span>
                    <span className="timer-num">{formatCountdown(flashSaleRemainingSeconds).mins}</span>
                    <span className="timer-colon">:</span>
                    <span className="timer-num">{formatCountdown(flashSaleRemainingSeconds).secs}</span>
                  </div>
                </div>
              </div>

              {/* Danh sách đúng 5 sản phẩm Flash Sale */}
              {loadingFlashSale ? (
                <div className="text-center py-10 text-gray-400">Đang tải sản phẩm Flash Sale...</div>
              ) : flashSaleProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Chưa có sản phẩm Flash Sale trong ca này</div>
              ) : (
                <div className="flash-sale-grid">
                  {flashSaleProducts.slice(0, 5).map((product) => {
                    const imgUrl = getProductImage(product)
                    const { originalPrice, currentPrice } = getProductPriceInfo(product)
                    const discountPct = product.flash_sale_discount || 25
                    const flashPrice = currentPrice && currentPrice < originalPrice ? currentPrice : Math.round(originalPrice * (1 - discountPct / 100))

                    return (
                      <div key={product._id} className="flash-card">
                        <div className="flash-badge">FLASH -{discountPct}%</div>
                        
                        <Link to={`/product/${product.slug || product._id}`}>
                          <img 
                            src={imgUrl || 'https://placehold.co/200x150?text=No+Image'} 
                            alt={product.name} 
                            className="flash-card-img" 
                          />
                        </Link>

                        <div>
                          <h4 className="flash-card-title">
                            <Link to={`/product/${product.slug || product._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {product.name}
                            </Link>
                          </h4>

                          <div className="flash-price-box">
                            <span className="flash-price-current">{formatPrice(flashPrice)}</span>
                            {originalPrice > flashPrice && (
                              <span className="flash-price-old">{formatPrice(originalPrice)}</span>
                            )}
                          </div>


                          <button 
                            onClick={() => handleQuickAddToCart(product)} 
                            className="btn-flash-buy"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            THÊM GIỎ HÀNG
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>
          </div>
        </section>
      )}


      {/* ── 🔥 BÁN CHẠY NHẤT ── */}
      <ProductSection
        products={filterBySearch(featuredProducts)}
        loading={loadingProducts}
        emptyMsg="Chưa có sản phẩm nổi bật nào"
        sectionLabel="BÁN CHẠY NHẤT"
        sectionLabelStyle={{ color: 'var(--purple2)' }}
        titleLine1="TOP SẢN PHẨM"
        titleLine2="ĐANG BÁN CHẠY"
        viewAllText="XEM TẤT CẢ TOP SẢN PHẨM →"
        viewAllHref="/shop"
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onAddToCart={handleQuickAddToCart}
        showSold={true}
      />

      {/* ── HÀNG MỚI VỀ ── */}
      <ProductSection
        products={filterBySearch(newProducts)}
        loading={loadingProducts}
        emptyMsg="Chưa có sản phẩm mới nào"
        sectionLabel="SẢN PHẨM MỚI"
        titleLine1="HÀNG MỚI VỀ"
        titleLine2="ĐÓN ĐẦU CÔNG NGHỆ MỚI"
        viewAllText="XEM TẤT CẢ SẢN PHẨM →"
        viewAllHref="/shop"
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onAddToCart={handleQuickAddToCart}
      />

      {/* ── GIẢM GIÁ ── */}
      <ProductSection
        products={filterBySearch(saleProducts)}
        loading={loadingProducts}
        emptyMsg="Không có sản phẩm giảm giá nào"
        sectionLabel="SIÊU ƯU ĐÃI"
        sectionLabelStyle={{ color: '#f5a623' }}
        titleLine1="SẢN PHẨM GIẢM GIÁ"
        titleLine2="SĂN DEAL HỜI CỰC KHỦNG"
        viewAllText="XEM TẤT CẢ KHUYẾN MÃI →"
        viewAllHref="/shop"
        className="products-section-sale"
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onAddToCart={handleQuickAddToCart}
      />
        </>
      )}

      {/* ── BLOG ── */}
      <section className="blog-section">
        <div className="section-inner">
          <div className="blog-header">
            <div>
              <div className="section-label">KIẾN THỨC & HƯỚNG DẪN</div>
              <h2 className="section-title" style={{ marginBottom: 0, lineHeight: 1.6 }}>NÂNG TẦM TRẢI NGHIỆM</h2>
            </div>
            <Link to="/blog" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              XEM TẤT CẢ BÀI VIẾT →
            </Link>
          </div>
          <div className="blog-grid">
            {blogs.map((blog, index) => {
              const fallbackImages = [
                '/src/assets/images/blog1.png',
                '/src/assets/images/blog2.png',
                '/src/assets/images/blog3.png'
              ];
              const imgUrl = blog.image || blog.thumnail || fallbackImages[index % 3];
              const resolvedImg = imgUrl.startsWith('http') || imgUrl.startsWith('/src/') 
                ? imgUrl 
                : `${API_URL}${imgUrl}`;
              const tag = blog.categories_post_id?.name || blog.tag || 'TIN TỨC';
              const title = blog.tittle || blog.title;
              const date = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : (blog.date || '');

              return (
                <div key={blog._id || blog.id} className="blog-card">
                  <Link to={`/blog/${blog.slug}`} className="blog-img" style={{ display: 'block', overflow: 'hidden' }}>
                    <img src={resolvedImg} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Link>
                  <div className="blog-body">
                    <div className="blog-tag">{tag}</div>
                    <div className="blog-title">
                      <Link to={`/blog/${blog.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {title}
                      </Link>
                    </div>
                    <div className="blog-footer">
                      <div className="blog-date">{date}</div>
                      <Link to={`/blog/${blog.slug}`} className="blog-read">Đọc thêm →</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter-section">
        <div className="newsletter-inner">
          <div className="newsletter-left">
            <h2 style={{ lineHeight: '1.3' }}>LUÔN CẬP NHẬT<br /><span>CÔNG NGHỆ MỚI</span></h2>
          </div>
          <div className="newsletter-right">
            <div className="newsletter-form">
              <input type="email" placeholder="Nhập email của bạn" />
              <button>ĐĂNG KÝ</button>
            </div>
            <p>Nhận tin tức, ưu đãi và hướng dẫn build PC mới nhất từ GearForge.</p>
          </div>
        </div>
      </section>
    </DefaultLayout>
  )
}


