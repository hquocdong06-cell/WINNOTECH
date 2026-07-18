import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get('code')
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Trigger animation sau khi mount
    const t = setTimeout(() => setShow(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <DefaultLayout>
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        background: 'var(--bg, #0d0d0d)',
      }}>
        <div style={{
          background: 'var(--surface, #141414)',
          border: '1px solid var(--border, #222)',
          borderRadius: '20px',
          padding: '60px 48px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>

          {/* Checkmark Icon */}
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4ff00 0%, #a8cc00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 0 40px rgba(212,255,0,0.25)',
            animation: show ? 'popIn 0.4s ease 0.2s both' : 'none',
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="#000"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: show ? 0 : 30,
                  transition: 'stroke-dashoffset 0.5s ease 0.4s',
                }}
              />
            </svg>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text, #fff)',
            marginBottom: '10px',
            letterSpacing: '-0.5px',
          }}>
            Đặt hàng thành công!
          </h1>

          {/* Subtitle */}
          <p style={{
            color: 'var(--text-muted, #888)',
            fontSize: '15px',
            lineHeight: 1.6,
            marginBottom: orderCode ? '16px' : '32px',
          }}>
            Cảm ơn bạn đã tin tưởng WINNO Tech. Đơn hàng của bạn đã được tiếp nhận và đang chờ xác nhận.
          </p>

          {/* Order code badge */}
          {orderCode && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(212,255,0,0.08)',
              border: '1px solid rgba(212,255,0,0.2)',
              borderRadius: '8px',
              padding: '10px 20px',
              marginBottom: '32px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#d4ff00" strokeWidth="2"/>
                <path d="M8 7h8M8 12h8M8 17h5" stroke="#d4ff00" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ color: '#d4ff00', fontWeight: 600, fontSize: '14px' }}>
                Mã đơn: {orderCode}
              </span>
            </div>
          )}

          {/* Info box */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border, #222)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '32px',
            textAlign: 'left',
          }}>
            {[
              { icon: '📦', text: 'Chúng tôi sẽ xử lý đơn hàng trong vòng 24 giờ làm việc.' },
              { icon: '🚚', text: 'Thông tin vận chuyển sẽ được cập nhật qua tài khoản của bạn.' },
              { icon: '💬', text: 'Liên hệ hỗ trợ nếu cần thay đổi hoặc hủy đơn hàng.' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: i < 2 ? '0 0 12px' : '0',
                borderBottom: i < 2 ? '1px solid var(--border, #222)' : 'none',
                marginBottom: i < 2 ? '12px' : '0',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ color: '#999', fontSize: '13px', lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/profile?tab=orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '13px 28px',
                background: '#d4ff00',
                color: '#000',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'opacity 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Xem đơn hàng
            </Link>

            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '13px 28px',
                background: 'transparent',
                color: 'var(--text, #fff)',
                border: '1px solid var(--border, #333)',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4ff00'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </DefaultLayout>
  )
}
