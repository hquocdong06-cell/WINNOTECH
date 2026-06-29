import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCartTotalQuantity } from '../redux/cartSlice'
import CartDrawer from '../components/CartDrawer'

export default function DefaultLayout({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartTotalQuantity = useSelector(selectCartTotalQuantity)

  return (
    <>
      {/* TOP BAR */}
      <div className="topbar">
        <div className="inner">
          <div className="topbar-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'5px',verticalAlign:'middle',color:'#e5e5e5'}}>
              <rect x="1" y="3" width="15" height="13" rx="1"/>
              <path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            MIỄN PHÍ VẬN CHUYỂN cho đơn từ <span>1.000.000đ</span>
          </div>
          <div className="topbar-divider" />
          <div className="topbar-trust">
            <span className="trust-inline">✓ Bảo hành chính hãng</span>
            <span className="trust-inline">✓ Đổi trả 30 ngày</span>
            <span className="trust-inline">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'3px',verticalAlign:'middle'}}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              1800 1234
            </span>
          </div>
          <div className="topbar-right">
            <a href="#">Hỗ trợ</a>
            <a href="#">Blog</a>
            <a href="#">FAQ</a>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <nav>
        {/* Row 1: Logo + Search + Actions */}
        <div className="nav-main">
          <div className="nav-main-inner">
            <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span style={{ color: 'white' }}>WINNO</span><span style={{ color: 'var(--yellow)' }}>TECH</span>
            </Link>

            <div className="nav-search">
              <select className="search-select">
                <option>Tất cả</option>
                <option>CPU</option>
                <option>GPU</option>
                <option>RAM</option>
                <option>Ổ cứng</option>
              </select>
              <div className="search-divider" />
              <input type="text" placeholder="Tìm CPU, GPU, RAM,..." />
              <button className="search-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>

            <div className="nav-actions">
              <button className="nav-action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
                <span>So sánh</span>
              </button>
              <Link to="/profile" className="nav-action-btn" style={{ textDecoration: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Tài khoản</span>
              </Link>
              <button className="nav-cart-btn" onClick={() => setIsCartOpen(true)}>
                <div className="cart-btn-inner">
                  <div style={{ position: 'relative' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <div className="cart-badge-new">{cartTotalQuantity}</div>
                  </div>
                  <span>Giỏ hàng</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category bar */}
        <div className="nav-catbar">
          <div className="nav-catbar-inner">
            <Link to="/build-pc" className="btn-build-pc" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#000" style={{marginRight:'5px',verticalAlign:'middle'}}>
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/>
              </svg>
              + Build PC ngay
            </Link>
            <div className="category-menu-wrapper">
              <button className="btn-category-menu">
                ☰ Danh mục ▾
              </button>
              <div className="mega-menu">
                <div className="mega-menu-grid">
                  <div className="mega-menu-col">
                    <div className="mega-menu-title">Linh kiện PC</div>
                    <ul className="mega-menu-links">
                      <li><Link to="/cpu">CPU (Bộ vi xử lý)</Link></li>
                      <li><Link to="/mainboard">Mainboard (Bo mạch chủ)</Link></li>
                      <li><Link to="/ram">RAM (Bộ nhớ trong)</Link></li>
                      <li><Link to="/gpu">VGA / Card đồ họa</Link></li>
                      <li><Link to="/storage">Ổ cứng (SSD / HDD)</Link></li>
                      <li><Link to="/psu">Nguồn máy tính (PSU)</Link></li>
                      <li><Link to="/case">Vỏ máy tính (Case)</Link></li>
                      <li><Link to="/cooling">Tản nhiệt (Cooling)</Link></li>
                    </ul>
                  </div>
                  <div className="mega-menu-col">
                    <div className="mega-menu-title">PC Nguyên Bộ</div>
                    <ul className="mega-menu-links">
                      <li><a href="#">PC Gaming</a></li>
                      <li><a href="#">PC Đồ họa / Workstation</a></li>
                      <li><a href="#">PC Văn phòng / Học tập</a></li>
                      <li><Link to="/build-pc" style={{ color: 'var(--yellow)', fontWeight: 600 }}>⚡ Tự Build PC</Link></li>
                    </ul>
                  </div>
                  <div className="mega-menu-col">
                    <div className="mega-menu-title">Gaming Gear & Màn hình</div>
                    <ul className="mega-menu-links">
                      <li><a href="#">Màn hình máy tính</a></li>
                      <li><a href="#">Bàn phím cơ</a></li>
                      <li><a href="#">Chuột chơi game</a></li>
                      <li><a href="#">Tai nghe Gaming</a></li>
                      <li><a href="#">Ghế Gaming</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="catbar-links">
              <Link to="/cpu">CPU</Link>
              <Link to="/gpu">GPU</Link>
              <Link to="/ram">RAM</Link>
              <Link to="/storage">Ổ cứng</Link>
              <Link to="/mainboard">Mainboard</Link>
              <Link to="/psu">Nguồn</Link>
              <Link to="/cooling">Tản nhiệt PC</Link>
              <Link to="/case">Case</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      {children}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
                                      <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                WINNO<span style={{ color: 'var(--yellow)' }}>TECH</span>
              </div>
              <p>WINNO TECH – Nơi đam mê công nghệ và hiệu năng gặp nhau.</p>
              <div className="footer-social">
                <div className="social-btn">f</div>
                <div className="social-btn">ig</div>
                <div className="social-btn">tk</div>
                <div className="social-btn">yt</div>
              </div>
            </div>
            <div className="footer-col">
              <h4>CỬA HÀNG</h4>
              <ul>
                <li>
                  <a href="#">Tất cả sản phẩm</a>
                </li>
                <li>
                  <a href="#">Sản phẩm nổi bật</a>
                </li>
                <li>
                  <a href="#">Khuyến mãi</a>
                </li>
                <li>
                  <a href="#">Cấu hình đề xuất</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>HỖ TRỢ</h4>
              <ul>
                <li>
                  <a href="#">Hướng dẫn mua hàng</a>
                </li>
                <li>
                  <a href="#">Chính sách bảo hành</a>
                </li>
                <li>
                  <a href="#">Chính sách đổi trả</a>
                </li>
                <li>
                  <a href="#">Thanh toán & vận chuyển</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>THÔNG TIN</h4>
              <ul>
                <li>
                  <a href="#">Giới thiệu</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
                <li>
                  <a href="#">Liên hệ</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>LIÊN HỆ</h4>
              <ul>
                <li>
                  <a href="#">Hotline: 1900 1234</a>
                </li>
                <li>
                  <a href="#">support@gearforge.vn</a>
                </li>
                <li>
                  <a href="#">
                    12 Nguyễn Công Trứ, P. Nguyễn Thái Bình, Q.1, HCM
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            © 2024 WINNO TECH. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
