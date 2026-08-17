import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { findMockProductBySlug } from '../data/mockProducts'

const API_URL = 'http://localhost:3000'

export default function RecentlyViewedSection({ currentSlug }) {
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
            const mock = findMockProductBySlug(s)
            return mock?.product || null
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

  const formatPrice = (price) => {
    return price ? price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'
  }

  return (
    <div className="recently-viewed-section" style={{ marginTop: '50px', borderTop: '1px solid #222', paddingTop: '30px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          SẢN PHẨM ĐÃ XEM <span style={{ fontSize: '13px', color: 'var(--accent-color, #c8e600)', marginLeft: '8px', fontWeight: 600 }}>({recentlyViewed.length}/3)</span>
        </h2>
      </div>
      <div className="recently-viewed-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {recentlyViewed.map((item) => {
          const rawImg = item.AnhSP && item.AnhSP.length > 0
            ? item.AnhSP[0].url
            : (item.thumnail || item.image || '')
          const itemImg = rawImg
            ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`)
            : null

          const firstVariant = item.Variants && item.Variants.length > 0 ? item.Variants[0] : null
          const itemBasePrice = firstVariant?.price || item.price || 0
          const itemSalePrice = firstVariant?.sale_price > 0 ? firstVariant.sale_price : itemBasePrice
          const displayPrice = itemSalePrice || itemBasePrice

          return (
            <Link key={item.slug || item._id} to={`/product/${item.slug || item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="rv-card" style={{
                background: 'var(--dark2, #121621)',
                border: '1px solid #333',
                padding: '15px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent-color, #c8e600)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#333'
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
                <div style={{ height: '140px', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden' }}>
                  {itemImg ? (
                    <img src={itemImg} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '11px', color: '#666' }}>Sản phẩm</span>
                  )}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '13px',
                    height: '38px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    color: '#fff',
                    lineHeight: '1.4'
                  }}>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div style={{ color: 'var(--accent-color, #c8e600)', fontWeight: 700, fontSize: '14px' }}>
                      {formatPrice(displayPrice)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
