import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/product-detail.css'
import useFavorite from '../hooks/useFavorite'
import { useAuth } from '../hooks/useAuth'
import { reviewAPI } from '../services/apiService'

import RecentlyViewedSection from '../components/RecentlyViewedSection'
import ProductCard from '../components/ProductCard'

const API_URL = 'http://localhost:3000'

export default function ProductDetail() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoggedIn } = useAuth()
  const { slug } = useParams()
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const { favoriteIds, toggleFavorite } = useFavorite()
  const [selectedImage, setSelectedImage] = useState(0)

  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])

  // Sidebar mock filters (giữ giao diện đẹp mắt của template)
  const brands = ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'GIGABYTE']
  const productLines = [
    'GeForce RTX 40 Series',
    'GeForce RTX 30 Series',
    'Radeon RX 7000 Series',
    'Radeon RX 6000 Series'
  ]
  const sockets = ['PCIe 4.0', 'PCIe 3.0', 'PCIe 5.0']

  // Lưu sản phẩm đã xem vào localStorage (tối đa 3 sản phẩm, tự xóa sản phẩm đầu tiên khi thêm sản phẩm mới)
  useEffect(() => {
    if (!slug) return
    try {
      const KEY = 'winnotech_recently_viewed'
      const stored = localStorage.getItem(KEY)
      let slugs = stored ? JSON.parse(stored) : []
      if (!Array.isArray(slugs)) slugs = []

      // Bỏ trùng lặp (nếu mở lại sản phẩm đã xem trước đó, đẩy lên vị trí mới nhất)
      slugs = slugs.filter(s => s !== slug)

      // Thêm slug hiện tại vào cuối
      slugs.push(slug)

      // Nếu vượt quá 3 sản phẩm, xóa sản phẩm đầu tiên đã lưu (FIFO)
      if (slugs.length > 3) {
        slugs = slugs.slice(-3)
      }

      localStorage.setItem(KEY, JSON.stringify(slugs))
    } catch (e) {
      console.error('Lỗi lưu sản phẩm đã xem:', e)
    }
  }, [slug])

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/products/${slug}`)
        const data = await res.json()
        if (data.success && data.data) {
          setProductData(data.data)
          setError(null)
          
          // Lấy sản phẩm liên quan từ cùng Category — gọi /products rồi lọc theo cat_id
          const catId = data.data.product?.cat_id?._id || data.data.product?.cat_id
          const currentProductId = data.data.product?._id
          if (catId) {
            try {
              const allRes = await fetch(`${API_URL}/products`)
              const allData = await allRes.json()
              if (allData.success && Array.isArray(allData.data)) {
                const related = allData.data
                  .filter(p => {
                    const pCatId = p.cat_id?._id || p.cat_id
                    return String(pCatId) === String(catId) && String(p._id) !== String(currentProductId)
                  })
                  .slice(0, 4)
                setRelatedProducts(related)
              }
            } catch {
              // Không lấy được related products → bỏ qua
            }
          }
        } else {
          setError(data.message || 'Không tìm thấy sản phẩm')
        }
      } catch (err) {
        console.error('Lỗi lấy chi tiết sản phẩm từ DB:', err)
        setError('Không thể tải chi tiết sản phẩm từ hệ thống')
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      fetchProductDetail()
    }
  }, [slug])

  // Sync selected variant id
  useEffect(() => {
    if (productData?.Variants && productData.Variants.length > 0) {
      setSelectedVariantId(productData.Variants[0]._id)
    }
  }, [productData])

  if (loading) {
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#fff', fontSize: '18px' }}>
          ⏳ Đang tải thông tin sản phẩm...
        </div>
      </DefaultLayout>
    )
  }

  if (error || !productData) {
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#fff', gap: '20px' }}>
          <h2>❌ {error || 'Không tìm thấy sản phẩm'}</h2>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', background: 'var(--accent-color)', color: '#000', borderRadius: '4px', fontWeight: 600 }}>
            Quay lại trang chủ
          </Link>
        </div>
      </DefaultLayout>
    )
  }

  const { product, AnhSP, Variants } = productData

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ'
    return price.toLocaleString('vi-VN') + 'đ'
  }

  // Gallery images list
  const getProductImages = () => {
    const list = []
    if (AnhSP && AnhSP.length > 0) {
      AnhSP.forEach(img => {
        const url = img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`
        list.push(url)
      })
    }
    if (list.length === 0 && product.thumnail) {
      const thumb = product.thumnail.startsWith('http') ? product.thumnail : `${API_URL}${product.thumnail}`
      list.push(thumb)
    }
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop')
    }
    
    // Đảm bảo luôn có ít nhất 4 ảnh (1 ảnh chính + 3 ảnh phụ thêm)
    const baseImg = list[0]
    while (list.length < 4) {
      list.push(baseImg)
    }
    
    return list
  }

  const images = getProductImages()

  // Price calculations
  const hasVariants = Variants && Variants.length > 0
  const activeVariant = Variants?.find(v => v._id === selectedVariantId) || (hasVariants ? Variants[0] : null)
  const originalPrice = activeVariant ? activeVariant.price : (product.price || 0)
  const currentPrice = activeVariant && activeVariant.sale_price > 0 ? activeVariant.sale_price : originalPrice
  const hasSale = product.sale > 0 || (activeVariant && activeVariant.sale_price > 0)
  const salePercent = product.sale || (activeVariant ? Math.round((1 - activeVariant.sale_price / activeVariant.price) * 100) : 0)

  const isOutOfStock = activeVariant && activeVariant.stock_quantity !== undefined ? activeVariant.stock_quantity <= 0 : false
  const availableStock = activeVariant && activeVariant.stock_quantity !== undefined ? activeVariant.stock_quantity : 999

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value)
    if (value > 0) setQuantity(Math.min(value, availableStock))
  }

  const handleAddToCart = async () => {
    if (!activeVariant) {
      toast.error('Sản phẩm này hiện tại chưa có sẵn biến thể!', { position: 'bottom-right' })
      return
    }
    if (activeVariant.stock_quantity !== undefined && activeVariant.stock_quantity <= 0) {
      toast.error('Sản phẩm này đã hết hàng!', { position: 'bottom-right' })
      return
    }
    if (activeVariant.stock_quantity !== undefined && quantity > activeVariant.stock_quantity) {
      toast.error(`Chỉ còn lại ${activeVariant.stock_quantity} sản phẩm trong kho!`, { position: 'bottom-right' })
      return
    }

    const cartPayload = {
      product_id: product._id,
      variant_id: activeVariant._id,
      name: product.name + (activeVariant.attributes && activeVariant.attributes.length > 0 ? ` - ${activeVariant.attributes.map(a => a.value).join(', ')}` : ''),
      price: currentPrice,
      quantity,
      image: images[0]
    }

    // Chưa đăng nhập → lưu localStorage qua Redux
    if (!isLoggedIn) {
      dispatch(addToCart(cartPayload))
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, { position: 'bottom-right', autoClose: 3000 })
      return
    }

    // Đã đăng nhập → đồng bộ lên DB
    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_id: activeVariant._id,
          quantity: quantity
        })
      })
      const data = await res.json()

      if (res.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!', { position: 'bottom-right', autoClose: 3000 })
        return
      }
      if (!data.success) {
        toast.error(data.message || 'Lỗi khi thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right', autoClose: 3000 })
        return
      }

      dispatch(addToCart(cartPayload))
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, { position: 'bottom-right', autoClose: 3000 })
    } catch (err) {
      toast.error('Không thể kết nối tới server!', { position: 'bottom-right' })
    }
  }

  const handleQuickAddToCart = async (product) => {
    if (!product) return;
    const variantsList = product.Variants || [];
    const activeVar = variantsList.find(v => v.variant_name === 'Mặc định') || variantsList[0];
    const price = activeVar && activeVar.sale_price > 0 ? activeVar.sale_price : (activeVar?.price || product.price || 0);

    const cartPayload = {
      product_id: product._id,
      variant_id: activeVar ? activeVar._id : null,
      name: product.name,
      price,
      quantity: 1,
      image: (product.AnhSP && product.AnhSP.length > 0) ? product.AnhSP[0].url : (product.thumnail || product.image)
    };

    if (!isLoggedIn) {
      dispatch(addToCart(cartPayload));
      toast.success('Đã thêm vào giỏ hàng!', { position: 'bottom-right' });
      return;
    }

    try {
      if (activeVar) {
        await fetch(`${API_URL}/cart/add`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variant_id: activeVar._id, quantity: 1 })
        });
      }
      dispatch(addToCart(cartPayload));
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right' });
    } catch (err) {
      toast.error('Lỗi khi thêm vào giỏ hàng!', { position: 'bottom-right' });
    }
  }

  const handleBuyNow = async () => {
    if (!activeVariant) {
      toast.error('Sản phẩm này hiện tại chưa có sẵn biến thể!', { position: 'bottom-right' })
      return
    }
    if (activeVariant.stock_quantity !== undefined && activeVariant.stock_quantity <= 0) {
      toast.error('Sản phẩm này đã hết hàng!', { position: 'bottom-right' })
      return
    }
    await handleAddToCart()
    navigate('/checkout')
  }

  // ── ReviewSection component (Purchase-check & Customer Reviews) ──
  const ReviewSection = () => {
    const [reviewsList, setReviewsList] = useState([])
    const [avgRating, setAvgRating] = useState(5)
    const [loadingReviews, setLoadingReviews] = useState(true)

    const [eligibility, setEligibility] = useState({ canReview: false, hasPurchased: false, reason: null, order_item_id: null })
    const [checkingEligibility, setCheckingEligibility] = useState(true)

    const [rStars, setRStars] = useState(5)
    const [rContent, setRContent] = useState('')
    const [rSubmitting, setRSubmitting] = useState(false)
    const [rMsg, setRMsg] = useState(null)

    const productId = product?._id || slug

    // Fetch reviews list
    const loadReviews = async () => {
      if (!productId) return
      try {
        setLoadingReviews(true)
        const data = await reviewAPI.getProductReviews(productId)
        if (data.success) {
          setReviewsList(data.data || [])
          setAvgRating(data.avgRating || 5)
        }
      } catch (e) {
        console.error('Lỗi tải đánh giá sản phẩm:', e)
      } finally {
        setLoadingReviews(false)
      }
    }

    // Check eligibility for logged in user
    const checkUserEligibility = async () => {
      if (!isLoggedIn || !productId) {
        setEligibility({ canReview: false, hasPurchased: false, reason: 'not_logged_in' })
        setCheckingEligibility(false)
        return
      }

      try {
        setCheckingEligibility(true)
        const data = await reviewAPI.checkEligibility(productId)
        if (data.success) {
          setEligibility(data)
        }
      } catch (e) {
        setEligibility({ canReview: false, hasPurchased: false, reason: 'error' })
      } finally {
        setCheckingEligibility(false)
      }
    }

    useEffect(() => {
      loadReviews()
      checkUserEligibility()
    }, [productId, isLoggedIn])

    const handleSubmitReview = async (e) => {
      e.preventDefault()
      setRMsg(null)

      if (!eligibility.order_item_id) {
        setRMsg({ type: 'error', text: 'Không xác định được đơn hàng để đánh giá.' })
        return
      }
      if (!rContent.trim()) {
        setRMsg({ type: 'error', text: 'Vui lòng nhập nội dung đánh giá' })
        return
      }

      setRSubmitting(true)
      try {
        const data = await reviewAPI.createReview(eligibility.order_item_id, rContent.trim(), rStars)
        if (data.success) {
          setRMsg({ type: 'success', text: 'Gửi đánh giá thành công! Cảm ơn bạn đã chia sẻ.' })
          setRContent('')
          setRStars(5)
          loadReviews()
          checkUserEligibility()
        } else {
          setRMsg({ type: 'error', text: data.message || 'Gửi đánh giá thất bại' })
        }
      } catch (err) {
        setRMsg({ type: 'error', text: err.message || 'Lỗi kết nối server' })
      } finally {
        setRSubmitting(false)
      }
    }

    return (
      <div className="product-reviews-container" style={{ color: '#ccc' }}>
        {/* Form Đánh giá (Chỉ hiển thị nút viết cho người dùng ĐÃ MUA sản phẩm & chưa đánh giá) */}
        <div className="review-box" style={{ background: '#121621', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '12px' }}>ĐÁNH GIÁ SẢN PHẨM</h3>
          
          {checkingEligibility ? (
            <div style={{ fontSize: '13px', color: '#888' }}>Đang kiểm tra quyền đánh giá...</div>
          ) : !isLoggedIn ? (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed #333', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#aaa' }}>
              🔒 Vui lòng đăng nhập và mua sản phẩm này để viết đánh giá.
            </div>
          ) : eligibility.canReview ? (
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#86efac' }}>
                ✓ Bạn đã mua sản phẩm này! Hãy chia sẻ trải nghiệm thực tế của bạn:
              </p>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>Chọn số sao đánh giá</label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRStars(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: s <= rStars ? '#fbbf24' : '#444', transition: 'transform 0.1s' }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 700, marginLeft: '6px' }}>{rStars}/5 sao</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>Nội dung đánh giá *</label>
                <textarea
                  value={rContent}
                  onChange={e => setRContent(e.target.value)}
                  rows={4}
                  placeholder="Nhập nhận xét chi tiết về sản phẩm (chất lượng, hiệu năng, đóng gói...)..."
                  style={{ width: '100%', background: '#0a0a0f', border: '1px solid #333', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {rMsg && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: rMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: rMsg.type === 'success' ? '#22c55e' : '#ef4444',
                  border: `1px solid ${rMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                }}>
                  {rMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={rSubmitting}
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--accent-color, #c8e600)',
                  color: '#000',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: rSubmitting ? 'not-allowed' : 'pointer',
                  opacity: rSubmitting ? 0.7 : 1
                }}
              >
                {rSubmitting ? 'Đang gửi...' : 'GỬI ĐÁNH GIÁ'}
              </button>
            </form>
          ) : eligibility.alreadyReviewed ? (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#86efac' }}>
              ✓ Bạn đã gửi đánh giá cho sản phẩm này. Cảm ơn phản hồi của bạn!
            </div>
          ) : (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed #333', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#aaa' }}>
              🔒 Bạn chưa mua sản phẩm này nên không thể gửi đánh giá. Dưới đây là đánh giá từ các khách hàng đã mua:
            </div>
          )}
        </div>

        {/* Danh sách Đánh giá của Khách hàng (Công khai cho tất cả người xem) */}
        <div className="reviews-list-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
            <h4 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              ĐÁNH GIÁ TỪ KHÁCH HÀNG ({reviewsList.length})
            </h4>
            {reviewsList.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#fbbf24', fontWeight: 700 }}>
                <span>★ {avgRating}/5</span>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 400 }}>({reviewsList.length} nhận xét)</span>
              </div>
            )}
          </div>

          {loadingReviews ? (
            <div style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>Đang tải danh sách đánh giá...</div>
          ) : reviewsList.length === 0 ? (
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '8px', textAlign: 'center', color: '#777', fontSize: '13px' }}>
              Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên mua và trải nghiệm sản phẩm!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviewsList.map(r => (
                <div key={r._id} style={{ background: '#121621', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-color, #c8e600)', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                        {r.userName ? r.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>{r.userName}</div>
                        <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '2px' }}>✓ Đã mua hàng tại WinNoTech</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', fontSize: '14px', marginBottom: '8px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} style={{ color: s <= r.star_number ? '#fbbf24' : '#444' }}>★</span>
                    ))}
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: '#ddd', lineHeight: '1.6' }}>
                    {r.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <DefaultLayout>
      {/* BREADCRUMB */}
      <div className="breadcrumb-section">
        <div className="breadcrumb-inner">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>Sản phẩm</span>
          <span>/</span>
          <span>{product.cat_id?.name || 'Linh kiện'}</span>
          <span>/</span>
          <span style={{ color: 'var(--accent-color)' }}>{product.name}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="product-detail-section">
        <div className="section-inner">
          {/* PRODUCT MAIN */}
          <main className="product-main">
              <div className="product-grid">
                {/* LEFT: IMAGE GALLERY */}
                <div className="product-gallery">
                  <div className="gallery-main" style={{ background: 'var(--dark2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={images[selectedImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div className="gallery-thumbnails">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        className={`gallery-thumb ${selectedImage === idx ? 'active' : ''}`}
                        onClick={() => setSelectedImage(idx)}
                        style={{ background: 'var(--dark2)', borderRadius: '4px', overflow: 'hidden', border: selectedImage === idx ? '1px solid var(--accent-color)' : '1px solid transparent' }}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* RIGHT: PRODUCT INFO */}
                <div className="product-info-section">
                  <div className="product-header-info">
                    <span className="product-brand" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{product.brand_id?.name || 'Chính hãng'}</span>
                    <h1 className="product-title" style={{ fontSize: '24px', margin: '8px 0', color: '#fff' }}>{product.name}</h1>
                  </div>

                  <div className="product-meta">
                    <span className="status-badge" style={{ 
                      background: isOutOfStock ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', 
                      color: isOutOfStock ? '#ef4444' : '#22c55e', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px' 
                    }}>
                      {isOutOfStock ? 'Hết hàng' : (activeVariant && activeVariant.stock_quantity !== undefined ? `Còn hàng (${availableStock} sản phẩm)` : 'Còn hàng')}
                    </span>
                    <div className="rating">
                      <span className="stars">⭐⭐⭐⭐⭐</span>
                      <span className="rating-value" style={{ marginLeft: '4px' }}>5.0</span>
                    </div>
                  </div>

                  {/* SHORT DESC */}
                  <div className="specs-table" style={{ marginTop: '20px', background: 'var(--dark2)', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      {product.short_desc || 'Không có mô tả ngắn cho sản phẩm này.'}
                    </p>
                  </div>

                  {/* PRICE */}
                  <div className="product-pricing" style={{ margin: '20px 0' }}>
                    <span className="price-note" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Giá đã bao gồm VAT</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginTop: '5px' }}>
                      <span className="price-main" style={{ fontSize: '28px', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                        {formatPrice(currentPrice)}
                      </span>
                      {hasSale && (
                        <span className="price-original" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '16px' }}>
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* SELECT VARIANT CHIPS */}
                  {Variants && Variants.length > 1 && (
                    <div className="variant-selector" style={{ margin: '20px 0 10px 0' }}>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                        Phiên bản / Biến thể:
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {Variants.map(v => (
                          <button
                            key={v._id}
                            onClick={() => { setSelectedVariantId(v._id); setQuantity(1); }}
                            style={{
                              background: selectedVariantId === v._id ? 'var(--accent-color)' : 'var(--dark2)',
                              color: selectedVariantId === v._id ? '#000' : '#fff',
                              border: selectedVariantId === v._id ? '1px solid var(--accent-color)' : '1px solid #444',
                              padding: '6px 14px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {v.variant_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* QUANTITY & ACTIONS */}
                  <div className="product-actions">
                    <div className="quantity-selector">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="qty-btn"
                        disabled={isOutOfStock}
                        style={{ opacity: isOutOfStock ? 0.3 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                      >−</button>
                      <input 
                        type="number" 
                        value={isOutOfStock ? 0 : quantity} 
                        onChange={handleQuantityChange}
                        className="qty-input"
                        disabled={isOutOfStock}
                        style={{ color: isOutOfStock ? '#666' : '#fff' }}
                      />
                      <button 
                        onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                        className="qty-btn"
                        disabled={isOutOfStock}
                        style={{ opacity: isOutOfStock ? 0.3 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                      >+</button>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flex: 1, width: '100%', alignItems: 'center' }}>
                      <button 
                        className="btn-add-cart" 
                        onClick={handleAddToCart} 
                        disabled={isOutOfStock}
                        style={{ 
                          flex: 1,
                          height: '48px',
                          background: isOutOfStock ? '#333' : 'rgba(212, 255, 0, 0.12)', 
                          color: isOutOfStock ? '#888' : 'var(--accent-color)', 
                          border: isOutOfStock ? '1px solid #444' : '1px solid var(--accent-color)',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          borderRadius: '8px',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {isOutOfStock ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
                      </button>
                      <button 
                        className="btn-buy-now" 
                        onClick={handleBuyNow} 
                        disabled={isOutOfStock}
                        style={{ 
                          flex: 1,
                          height: '48px',
                          background: isOutOfStock ? '#444' : 'var(--accent-color)', 
                          color: isOutOfStock ? '#888' : '#000', 
                          border: 'none',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          borderRadius: '8px',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        {isOutOfStock ? 'HẾT HÀNG' : 'MUA NGAY'}
                      </button>
                    </div>
                  </div>

                  <button 
                    className="btn-wishlist"
                    onClick={(e) => {
                      e.preventDefault();
                      if (product) toggleFavorite(product._id);
                    }}
                    style={{ color: (product && favoriteIds.has(product._id)) ? '#ef4444' : '#fff' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={(product && favoriteIds.has(product._id)) ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    YÊU THÍCH
                  </button>
                </div>
              </div>

              {/* TABS */}
              <div className="product-tabs" style={{ marginTop: '40px' }}>
                <div className="tabs-header" style={{ borderBottom: '1px solid #333' }}>
                  <button 
                    className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    MÔ TẢ CHI TIẾT
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    ĐÁNH GIÁ SẢN PHẨM
                  </button>
                </div>

                <div className="tabs-content" style={{ padding: '20px 0' }}>
                  {activeTab === 'description' && (
                    <div className="tab-pane" style={{ lineHeight: '1.8', color: '#ccc', fontSize: '15px' }}>
                      <div style={{ whiteSpace: 'pre-line' }}>{product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}</div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="tab-pane">
                      <ReviewSection />
                    </div>
                  )}
                </div>
              </div>

              {/* RELATED PRODUCTS */}
              {relatedProducts.length > 0 && (
                <div className="related-products" style={{ marginTop: '50px' }}>
                  <div className="related-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', color: '#fff', margin: 0 }}>SẢN PHẨM LIÊN QUAN</h2>
                  </div>
                  <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                    {relatedProducts.map((item) => (
                      <ProductCard 
                        key={item._id} 
                        product={item} 
                        favoriteIds={favoriteIds} 
                        onToggleFavorite={toggleFavorite} 
                        onAddToCart={handleQuickAddToCart} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* RECENTLY VIEWED PRODUCTS SECTION */}
              <RecentlyViewedSection currentSlug={slug} />
            </main>
        </div>
      </div>
    </DefaultLayout>
  )
}
