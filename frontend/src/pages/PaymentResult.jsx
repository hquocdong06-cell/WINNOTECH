import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'

/**
 * Trang nhận kết quả callback từ VNPay
 * VNPay sẽ redirect về: /payment-result?vnp_ResponseCode=00&vnp_TxnRef=WN...&...
 *
 * vnp_ResponseCode:
 *   "00" → Thành công
 *   khác → Thất bại / Hủy
 */
export default function PaymentResult() {
  const [searchParams] = useSearchParams()
  const [show, setShow] = useState(false)

  const responseCode = searchParams.get('vnp_ResponseCode')
  const txnRef       = searchParams.get('vnp_TxnRef')       // mã đơn hàng
  const amount       = searchParams.get('vnp_Amount')        // số tiền * 100
  const bankCode     = searchParams.get('vnp_BankCode')

  const isSuccess = responseCode === '00'
  const formattedAmount = amount
    ? Number(amount / 100).toLocaleString('vi-VN') + 'đ'
    : ''

  useEffect(() => {
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
          border: `1px solid ${isSuccess ? 'rgba(212,255,0,0.15)' : 'rgba(248,113,113,0.15)'}`,
          borderRadius: '20px',
          padding: '52px 44px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>

          {/* Icon */}
          <div style={{
            width: '84px', height: '84px',
            borderRadius: '50%',
            background: isSuccess
              ? 'linear-gradient(135deg, #d4ff00, #a8cc00)'
              : 'linear-gradient(135deg, #f87171, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: isSuccess
              ? '0 0 40px rgba(212,255,0,0.25)'
              : '0 0 40px rgba(248,113,113,0.25)',
          }}>
            {isSuccess ? (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>

          {/* VNPay Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#005BAA', borderRadius: '6px',
            padding: '4px 12px', marginBottom: '16px',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '13px', letterSpacing: '1.5px' }}>VNPAY</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '26px', fontWeight: 700,
            color: isSuccess ? '#d4ff00' : '#f87171',
            marginBottom: '10px',
          }}>
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>

          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            {isSuccess
              ? 'Đơn hàng của bạn đã được thanh toán qua VNPay và đang được xử lý.'
              : `Giao dịch không thành công (mã lỗi: ${responseCode}). Vui lòng thử lại hoặc chọn phương thức khác.`}
          </p>

          {/* Info */}
          {(txnRef || formattedAmount || bankCode) && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #222',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '28px',
              textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: '10px',
              fontSize: '13px',
            }}>
              {txnRef && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Mã đơn hàng</span>
                  <span style={{ color: '#d4ff00', fontWeight: 700 }}>{txnRef}</span>
                </div>
              )}
              {formattedAmount && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Số tiền</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{formattedAmount}</span>
                </div>
              )}
              {bankCode && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Ngân hàng</span>
                  <span style={{ color: '#fff' }}>{bankCode}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Trạng thái</span>
                <span style={{
                  color: isSuccess ? '#4ade80' : '#f87171',
                  fontWeight: 700,
                }}>
                  {isSuccess ? '✓ Thành công' : '✗ Thất bại'}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isSuccess ? (
              <>
                <Link
                  to="/profile?tab=orders"
                  style={{
                    padding: '13px 28px',
                    background: '#d4ff00', color: '#000',
                    borderRadius: '10px', fontWeight: 700, fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  Xem đơn hàng
                </Link>
                <Link
                  to="/"
                  style={{
                    padding: '13px 28px',
                    background: 'transparent', color: '#fff',
                    border: '1px solid #333', borderRadius: '10px',
                    fontWeight: 600, fontSize: '14px', textDecoration: 'none',
                  }}
                >
                  Tiếp tục mua sắm
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/checkout"
                  style={{
                    padding: '13px 28px',
                    background: '#d4ff00', color: '#000',
                    borderRadius: '10px', fontWeight: 700, fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  Thử lại
                </Link>
                <Link
                  to="/"
                  style={{
                    padding: '13px 28px',
                    background: 'transparent', color: '#fff',
                    border: '1px solid #333', borderRadius: '10px',
                    fontWeight: 600, fontSize: '14px', textDecoration: 'none',
                  }}
                >
                  Về trang chủ
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
