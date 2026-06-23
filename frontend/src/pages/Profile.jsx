import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/profile.css'

const API_URL = 'http://localhost:3000'

export default function Profile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // ─── State cho user từ API ─────────────────────────────────
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ─── Gọi API /profile lấy thông tin user đã đăng nhập ─────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/profile`, {
          credentials: 'include' // gửi cookie token
        })
        const data = await res.json()

        if (data.success) {
          setUser(data.user)
        } else {
          // Chưa đăng nhập → redirect về trang login
          navigate('/auth')
        }
      } catch (err) {
        console.error('Lỗi lấy profile:', err)
        setError('Không thể kết nối server')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [navigate])

  // ─── Xử lý đăng xuất ──────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { credentials: 'include' })
      navigate('/auth')
    } catch (err) {
      console.error('Lỗi đăng xuất:', err)
    }
  }

  // ─── Format ngày tham gia từ createdAt ─────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // ─── Lấy chữ cái đầu cho avatar ──────────────────────────
  const getInitial = () => {
    if (!user || !user.name) return '?'
    return user.name.charAt(0).toUpperCase()
  }

  const orders = [
    { id: '#WIN123456', date: '20/05/2024', total: '18.490.000đ', status: 'completed' },
    { id: '#WIN123455', date: '18/05/2024', total: '23.990.000đ', status: 'processing' },
    { id: '#WIN123454', date: '16/05/2024', total: '12.890.000đ', status: 'completed' },
    { id: '#WIN123453', date: '14/05/2024', total: '5.490.000đ', status: 'cancelled' },
    { id: '#WIN123452', date: '10/05/2024', total: '32.990.000đ', status: 'completed' }
  ]

  const wishlistProducts = [
    {
      id: 1,
      name: 'ASUS ROG Strix GeForce RTX 4070 Ti Super',
      price: '49.990.000đ',
      image: new URL('../assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png', import.meta.url).href
    },
    {
      id: 2,
      name: 'MSI MAG B650 Tomahawk WiFi DDR5 - ATX',
      price: '6.490.000đ',
      image: new URL('../assets/images/MSI MAG B650 Tomahawk WiFi.png', import.meta.url).href
    },
    {
      id: 3,
      name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz',
      price: '3.990.000đ',
      image: new URL('../assets/images/G.Skill Trident Z5 RGB DDR5 32GB.png', import.meta.url).href
    },
    {
      id: 4,
      name: 'AMD Ryzen 7 7800X3D\n8 nhân / 16 luồng',
      price: '18.490.000đ',
      image: new URL('../assets/images/AMD Ryzen 7 7800X3D.png', import.meta.url).href
    }
  ]

  const statusMap = {
    completed: 'Hoàn thành',
    processing: 'Đang xử lý',
    cancelled: 'Đã hủy'
  }

  const menuItems = [
    {
      key: 'overview',
      label: 'Tổng quan',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      key: 'personal',
      label: 'Thông tin cá nhân',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      key: 'orders',
      label: 'Đơn hàng của tôi',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )
    },
    {
      key: 'wishlist',
      label: 'Wishlist',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    },
    {
      key: 'address',
      label: 'Địa chỉ giao hàng',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    }
  ]

  // ─── Loading / Error states ────────────────────────────────
  if (loading) {
    return (
      <DefaultLayout>
        <div className="profile-page">
          <div className="profile-inner" style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Đang tải thông tin tài khoản...</div>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="profile-page">
          <div className="profile-inner" style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ color: '#f87171', fontSize: '14px', marginBottom: '16px' }}>{error}</div>
            <button
              onClick={() => navigate('/auth')}
              style={{ background: 'var(--yellow)', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  if (!user) return null

  return (
    <DefaultLayout>
      <div className="profile-page">
        <div className="profile-inner">
          {/* Breadcrumb */}
          <div className="profile-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            Tài khoản của tôi
          </div>

          {/* Page Title */}
          <h1 className="profile-page-title">TÀI KHOẢN CỦA TÔI</h1>

          {/* 3-Column Layout */}
          <div className="profile-layout">

            {/* ═══ LEFT SIDEBAR ═══ */}
            <aside className="profile-sidebar">
              <div className="profile-sidebar-user">
                <div className="profile-avatar-sidebar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span className="avatar-initials">{getInitial()}</span>
                  )}
                </div>
                <div className="profile-sidebar-name">{user.name}</div>
                <div className="profile-sidebar-email">{user.email}</div>
                <div className="profile-vip-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {user.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                </div>
              </div>
              <div className="profile-sidebar-menu">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    className={`profile-menu-item ${activeTab === item.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.key)}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                <div className="profile-menu-divider" />
                <button className="profile-menu-item logout" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <div className="profile-main">
              {/* ── Personal Info Card ── */}
              <div className="profile-card">
                <div className="profile-card-title">THÔNG TIN CÁ NHÂN</div>
                <div className="profile-info-layout">
                  <div className="profile-avatar-main">
                    <div className="profile-avatar-main-img">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span className="avatar-initials">{getInitial()}</span>
                      )}
                    </div>
                    <button className="btn-change-avatar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      Đổi ảnh
                    </button>
                  </div>
                  <div className="profile-info-fields">
                    <div className="profile-info-item">
                      <span className="profile-info-label">Họ tên</span>
                      <span className="profile-info-value">{user.name}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Email</span>
                      <span className="profile-info-value">{user.email}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Số điện thoại</span>
                      <span className="profile-info-value">{user.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Ngày tham gia</span>
                      <span className="profile-info-value">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="profile-info-actions">
                  <button className="btn-update-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Cập nhật thông tin
                  </button>
                </div>
              </div>

              {/* ── Recent Orders ── */}
              <div className="profile-card">
                <div className="profile-orders-header">
                  <div className="profile-card-title">ĐƠN HÀNG GẦN ĐÂY</div>
                  <button className="profile-orders-viewall">
                    Xem tất cả
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
                <table className="profile-orders-table">
                  <thead>
                    <tr>
                      <th>MÃ ĐƠN</th>
                      <th>NGÀY ĐẶT</th>
                      <th>TỔNG TIỀN</th>
                      <th>TRẠNG THÁI</th>
                      <th>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td><span className="order-id">{order.id}</span></td>
                        <td><span className="order-date">{order.date}</span></td>
                        <td><span className="order-total">{order.total}</span></td>
                        <td>
                          <span className={`order-status ${order.status}`}>
                            {statusMap[order.status]}
                          </span>
                        </td>
                        <td>
                          <button className="btn-view-detail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Wishlist Products ── */}
              <div className="profile-card">
                <div className="profile-card-title">SẢN PHẨM YÊU THÍCH</div>
                <div className="profile-wishlist-grid">
                  {wishlistProducts.map((product) => (
                    <div key={product.id} className="profile-wishlist-card">
                      <button className="wishlist-heart">
                        <svg viewBox="0 0 24 24" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <div className="wishlist-img">
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = `<div style="color:var(--text-muted);font-size:11px;text-align:center;padding:8px">${product.name.split('\n')[0]}</div>`
                          }}
                        />
                      </div>
                      <div className="wishlist-info">
                        <div className="wishlist-name">{product.name.split('\n')[0]}</div>
                        {product.name.includes('\n') && (
                          <div className="wishlist-desc">{product.name.split('\n')[1]}</div>
                        )}
                        <div className="wishlist-footer">
                          <span className="wishlist-price">{product.price}</span>
                          <button className="wishlist-cart-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                              <line x1="3" y1="6" x2="21" y2="6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ RIGHT SIDEBAR ═══ */}
            <div className="profile-right">
              {/* ── Account Stats ── */}
              <div className="profile-stats-card">
                <div className="profile-card-title">THỐNG KÊ TÀI KHOẢN</div>
                <div className="profile-stats-grid">
                  <div className="profile-stat-item">
                    <div className="profile-stat-icon orders">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                      </svg>
                    </div>
                    <div className="profile-stat-label">Tổng đơn hàng</div>
                    <div className="profile-stat-value">28</div>
                  </div>
                  <div className="profile-stat-item">
                    <div className="profile-stat-icon spending">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                        <path d="M12 18V6" />
                      </svg>
                    </div>
                    <div className="profile-stat-label">Tổng chi tiêu</div>
                    <div className="profile-stat-value small">48.760.000đ</div>
                  </div>
                  <div className="profile-stat-item">
                    <div className="profile-stat-icon points">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <div className="profile-stat-label">Điểm thưởng</div>
                    <div className="profile-stat-value">2.450</div>
                  </div>
                  <div className="profile-stat-item">
                    <div className="profile-stat-icon wishlist">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <div className="profile-stat-label">Sản phẩm yêu thích</div>
                    <div className="profile-stat-value">12</div>
                  </div>
                </div>
              </div>

              {/* ── Support Center ── */}
              <div className="profile-support-card">
                <div className="profile-card-title">TRUNG TÂM HỖ TRỢ</div>
                <div className="profile-support-desc">
                  Winno Tech luôn sẵn sàng hỗ trợ bạn
                </div>
                <div className="profile-support-list">
                  <div className="profile-support-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Hotline: <span>1900 1234</span>
                  </div>
                  <div className="profile-support-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Email: <span>support@winno.com</span>
                  </div>
                  <div className="profile-support-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Thời gian: <span>8:00 - 22:00 (T2 - CN)</span>
                  </div>
                </div>
                <button className="btn-contact-support">Liên hệ hỗ trợ</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
