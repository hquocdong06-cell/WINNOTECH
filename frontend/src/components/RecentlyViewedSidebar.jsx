import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:3000'

export default function RecentlyViewedSidebar({ currentSlug }) {
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

        // Tối đa 3 sản phẩm mới nhất (đã lọc bớt sản phẩm trùng)
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

  return (
    <div className="recently-viewed-sidebar-widget" style={{
      background: 'var(--dark2, #111118)',
      border: '1px solid var(--border, #2a2a3a)',
      borderRadius: '10px',
      padding: '16px',
    }}>
      <div style={{
        fontSize: '13px',
        fontWeight: 700,
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>SẢN PHẨM ĐÃ XEM</span>
        <span style={{ fontSize: '11px', color: 'var(--accent-color, #c8e600)', background: 'rgba(200, 230, 0, 0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
          {recentlyViewed.length}/3
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {recentlyViewed.map((p) => {
          const pImg = p.AnhSP?.[0]?.url || p.thumnail || p.image || ''
          const fullImg = pImg
            ? (pImg.startsWith('http') ? pImg : `${API_URL}${pImg.startsWith('/') ? '' : '/'}${pImg}`)
            : null
          const firstVar = p.Variants?.[0]
          const pPrice = firstVar?.sale_price > 0 ? firstVar.sale_price : (firstVar?.price || p.price || 0)

          return (
            <Link
              key={p.slug || p._id}
              to={`/product/${p.slug || p._id}`}
              className="rv-sidebar-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                background: '#0a0a0f',
                borderRadius: '6px',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {fullImg ? (
                  <img src={fullImg} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '9px', color: '#666' }}>Sản phẩm</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '2px'
                }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-color, #c8e600)' }}>
                  {pPrice ? `${pPrice.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
