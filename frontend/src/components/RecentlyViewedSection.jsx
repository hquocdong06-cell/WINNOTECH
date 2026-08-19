import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import useFavorite from '../hooks/useFavorite'
import { useAuth } from '../hooks/useAuth'
import ProductCard from './ProductCard'

const API_URL = 'http://localhost:3000'

export default function RecentlyViewedSection({ currentSlug }) {
  const dispatch = useDispatch()
  const { favoriteIds, toggleFavorite } = useFavorite()
  const { isLoggedIn } = useAuth()
  const [recentlyViewed, setRecentlyViewed] = useState([])

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const stored = localStorage.getItem('winnotech_recently_viewed')
        if (!stored) {
          setRecentlyViewed([])
          return
        }
        let slugs = JSON.parse(stored)
        if (!Array.isArray(slugs) || slugs.length === 0) {
          setRecentlyViewed([])
          return
        }

        // Tối đa 3 sản phẩm mới nhất
        const displaySlugs = [...slugs].reverse().slice(0, 3)

        const list = await Promise.all(
          displaySlugs.map(async (s) => {
            try {
              const res = await fetch(`${API_URL}/products/${s}`)
              const data = await res.json()
              if (data.success && data.data?.product) {
                return {
                  ...data.data.product,
                  AnhSP: data.data.AnhSP,
                  Variants: data.data.Variants,
                }
              }
            } catch (e) {}
            return null
          })
        )

        setRecentlyViewed(list.filter(Boolean))
      } catch (e) {
        console.error('Lỗi tải sản phẩm đã xem:', e)
      }
    }

    fetchRecentlyViewed()
  }, [currentSlug])

  if (recentlyViewed.length === 0) return null

  const handleQuickAddToCart = async (product) => {
    const variantsList = product.Variants || []
    const activeVar = variantsList.find(v => v.variant_name === 'Mặc định') || variantsList[0]
    const price = activeVar && activeVar.sale_price > 0 ? activeVar.sale_price : (activeVar?.price || product.price || 0)

    const cartPayload = {
      product_id: product._id,
      variant_id: activeVar ? activeVar._id : null,
      name: product.name,
      price,
      quantity: 1,
      image: (product.AnhSP && product.AnhSP.length > 0) ? product.AnhSP[0].url : (product.thumnail || product.image)
    }

    if (!isLoggedIn) {
      dispatch(addToCart(cartPayload))
      toast.success('Đã thêm vào giỏ hàng!', { position: 'bottom-right' })
      return
    }

    try {
      if (activeVar) {
        await fetch(`${API_URL}/cart/add`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variant_id: activeVar._id, quantity: 1 })
        })
      }
      dispatch(addToCart(cartPayload))
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right' })
    } catch (err) {
      toast.error('Lỗi khi thêm vào giỏ hàng!', { position: 'bottom-right' })
    }
  }

  return (
    <div className="recently-viewed-section" style={{ marginTop: '50px', borderTop: '1px solid #222', paddingTop: '30px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          SẢN PHẨM ĐÃ XEM <span style={{ fontSize: '13px', color: 'var(--accent-color, #c8e600)', marginLeft: '8px', fontWeight: 600 }}>({recentlyViewed.length}/3)</span>
        </h2>
      </div>
      <div className="recently-viewed-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {recentlyViewed.map((item) => (
          <ProductCard 
            key={item.slug || item._id} 
            product={item} 
            favoriteIds={favoriteIds} 
            onToggleFavorite={toggleFavorite} 
            onAddToCart={handleQuickAddToCart} 
          />
        ))}
      </div>
    </div>
  )
}
