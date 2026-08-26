import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import { API_BASE as API_URL } from '../services/apiService';

const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ'
  return price.toLocaleString('vi-VN') + 'đ'
}

const CartSVG = ({ isAdded }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={isAdded ? "var(--yellow)" : "currentColor"}>
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
)

const HeartSVG = ({ isFilled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={isFilled ? "#ef4444" : "none"} stroke={isFilled ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

export default function ProductCard({ product, onAddToCart, favoriteIds, onToggleFavorite, showSold = false }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [cartActive, setCartActive] = useState(false)

  if (!product) return null

  // Image URL resolution
  const imgUrl = (() => {
    if (product.AnhSP && product.AnhSP.length > 0 && product.AnhSP[0]?.url) {
      const u = product.AnhSP[0].url
      return u.startsWith('http') ? u : `${API_URL}${u.startsWith('/') ? '' : '/'}${u}`
    }
    if (product.thumnail) {
      return product.thumnail.startsWith('http') ? product.thumnail : `${API_URL}${product.thumnail.startsWith('/') ? '' : '/'}${product.thumnail}`
    }
    if (product.image) {
      return product.image.startsWith('http') ? product.image : `${API_URL}${product.image.startsWith('/') ? '' : '/'}${product.image}`
    }
    return 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=600&auto=format&fit=crop'
  })()

  // Variant & Price calculations
  const variantsList = product.Variants || product.variants || []
  const defaultVariant = variantsList.find(v => v.variant_name === 'Mặc định') || variantsList[0]

  const originalPrice = defaultVariant ? defaultVariant.price : (product.price || 0)
  const currentPrice = defaultVariant && defaultVariant.sale_price > 0 
    ? defaultVariant.sale_price 
    : (product.sale_price || product.price || originalPrice)

  const hasSale = product.sale > 0 || (defaultVariant && defaultVariant.sale_price > 0 && defaultVariant.sale_price < defaultVariant.price)
  const salePercent = product.sale || (defaultVariant && defaultVariant.price ? Math.round((1 - defaultVariant.sale_price / defaultVariant.price) * 100) : 0)

  const isOutOfStock = defaultVariant && defaultVariant.stock_quantity !== undefined ? defaultVariant.stock_quantity <= 0 : false
  const isFav = favoriteIds?.has(product._id)
  const soldCount = product.sold_count ?? product.sold_quantity ?? product.buyturn ?? 0

  const handleCartClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isOutOfStock) {
      onAddToCart?.(product)
      setCartActive(true)
      setTimeout(() => setCartActive(false), 1800)
    }
  }

  const handleBuyNowClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isOutOfStock) {
      const variant = product.Variants?.[0] || {}
      const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/
      let variantId = variant._id
      if (!variantId || !OBJECT_ID_REGEX.test(String(variantId))) {
        if (OBJECT_ID_REGEX.test(String(product._id))) {
          variantId = product._id
        }
      }

      if (!variantId || !OBJECT_ID_REGEX.test(String(variantId))) {
        alert('Sản phẩm này chưa có biến thể sẵn sàng trong cơ sở dữ liệu!')
        return
      }

      if (isLoggedIn) {
        try {
          const res = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variant_id: variantId, quantity: 1 })
          })
          const data = await res.json()
          if (!data.success) {
            alert(data.message || 'Lỗi khi thêm vào giỏ hàng!')
            return
          }
          window.dispatchEvent(new CustomEvent('cartUpdated'))
          navigate('/checkout')
        } catch {
          alert('Lỗi kết nối máy chủ!')
        }
        return
      }

      alert('Vui lòng đăng nhập để tiến hành mua hàng!')
      navigate('/login?redirect=/checkout')
    }
  }

  return (
    <Link to={`/product/${product.slug || product._id}`} className="product-link" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div className="product-card" style={isOutOfStock ? { opacity: 0.85 } : {}}>
        {isOutOfStock ? (
          <div className="product-sale-badge" style={{ background: '#ef4444', color: '#fff' }}>Hết hàng</div>
        ) : (
          hasSale && salePercent > 0 && <div className="product-sale-badge">-{salePercent}%</div>
        )}
        <div className="item-visual-box">
          <img src={imgUrl} alt={product.name} onError={(e)=>{ e.target.src='https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=600&auto=format&fit=crop' }} />
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-cat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="product-cat" style={{ margin: 0 }}>{product.cat_id?.name || product.brand_id?.name || 'Linh kiện PC'}</span>
            {showSold && (
              <span className="product-sold-badge" style={{ fontSize: '11px', color: '#ffb703', fontWeight: '600', background: 'rgba(255, 183, 3, 0.12)', padding: '2px 7px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                Đã bán: {soldCount}
              </span>
            )}
          </div>
          <div className="product-footer">
            <div className="product-price-container">
              {hasSale ? (
                <>
                  <span className="product-price sale-price">{formatPrice(currentPrice)}</span>
                  <span className="original-price">{formatPrice(originalPrice)}</span>
                </>
              ) : (
                <span className="product-price">{formatPrice(currentPrice)}</span>
              )}
            </div>
            <div className="product-actions-group">
              <button 
                className={`btn-cart ${cartActive ? 'added-active' : ''}`}
                onClick={handleCartClick}
                disabled={isOutOfStock}
                style={isOutOfStock ? { background: '#222', color: '#555', cursor: 'not-allowed', borderColor: '#333' } : {}}
                title={isOutOfStock ? 'Hết hàng' : (cartActive ? 'Đã thêm vào giỏ!' : 'Thêm vào giỏ')}
              >
                <CartSVG isAdded={cartActive} />
              </button>
              <button 
                className="btn-wishlist-home" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite?.(product._id) }} 
                title="Thêm vào yêu thích"
              >
                <HeartSVG isFilled={isFav} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
