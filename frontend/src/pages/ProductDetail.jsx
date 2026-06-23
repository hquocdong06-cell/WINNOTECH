import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/product-detail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  // Mock product data - Replace with API call
  const product = {
    id: 1,
    brand: 'ASUS',
    name: 'ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB GDDR6X',
    category: 'GPU / NVIDIA',
    price: '18.490.000đ',
    status: 'Còn hàng',
    rating: 4.9,
    reviews: 123,
    sold: 356,
    images: [
      '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png',
      '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png',
      '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png',
      '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png'
    ],
    specs: {
      'Memory': '16GB GDDR6X',
      'Clock Speed': '2640 MHz',
      'Memory Bus': '256-bit',
      'PCIe': 'PCIe 4.0'
    },
    description: `ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB GDDR6X là card đồ họa mạnh mẽ với hiệu năng vượt trội, được thiết kế riêng cho các game thủ và nhà sáng tạo nội dung.

Đặc điểm nổi bật:
- Hỗ trợ Ray Tracing và DLSS 3
- Quạt tản nhiệt Axial-Tech với công nghệ Air flow
- Hệ thống nguồn điện ổn định
- Thiết kế TUF Gaming bền bỉ

Hiệu suất vô cùng ổn định, tiếp tục sử dụng được lâu dài nhờ công nghệ chế tạo tiên tiến.`,
    features: [
      'Được hỗ trợ bởi NVIDIA DLSS 3 kiến trúc Ada Levelset siêu tối ưu',
      'Quạt Axial-tech với hệ thống Dual Ball Bearing làm mát hiệu quả',
      'Thế 2x2-slot như được chế tạo cho phù hợp sây kiềm kĩ thuật quản lý độ ổn định',
      'Linh hoạt TUF, được làm theo tiêu chuẩn chất lượng cao'
    ]
  }

  // Related products
  const relatedProducts = [
    {
      id: 2,
      name: 'ASUS TUF Gaming GeForce RTX 4070 SUPER 12GB GDDR6X',
      specs: '12GB GDDR6X • 1980 MHz',
      price: '15.990.000đ',
      image: '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png'
    },
    {
      id: 3,
      name: 'MSI Gaming GeForce RTX 4060 SUPER 16GB GDDR6X',
      specs: '16GB GDDR6X • 2565 MHz',
      price: '28.990.000đ',
      image: '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png'
    },
    {
      id: 4,
      name: 'GIGABYTE GeForce RTX 4070 SUPER 16GB GDDR6X',
      specs: '16GB GDDR6X • 2640 MHz',
      price: '17.990.000đ',
      image: '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png'
    },
    {
      id: 5,
      name: 'ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X',
      specs: '24GB GDDR6X • 2640 MHz',
      price: '49.990.000đ',
      image: '/src/assets/images/ASUS ROG Strix GeForce RTX 4070 Ti Super.png'
    }
  ]

  // Sidebar filters
  const [filters, setFilters] = useState({
    brands: [],
    productLines: [],
    sockets: []
  })

  const brands = ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'GIGABYTE']
  const productLines = [
    'GeForce RTX 40 Series',
    'GeForce RTX 30 Series',
    'Radeon RX 7000 Series',
    'Radeon RX 6000 Series'
  ]
  const sockets = ['PCIe 4.0', 'PCIe 3.0', 'PCIe 5.0']

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value)
    if (value > 0) setQuantity(value)
  }

  const handleAddToCart = () => {
    console.log('Added to cart:', { product: product.id, quantity })
    // Add API call here
  }

  return (
    <DefaultLayout>
      {/* BREADCRUMB */}
      <div className="breadcrumb-section">
        <div className="breadcrumb-inner">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <a href="/products">Sản phẩm</a>
          <span>/</span>
          <a href="/products?category=gpu">GPU</a>
          <span>/</span>
          <a href="/products?brand=asus">ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB GDDR6X</a>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="product-detail-section">
        <div className="section-inner">
          {/* SIDEBAR FILTERS */}
          <aside className="product-sidebar">
            {/* HÃNG */}
            <div className="filter-group">
              <button className="filter-title">
                <span>HÃNG</span>
                <span className="filter-toggle">−</span>
              </button>
              <div className="filter-content">
                {brands.map((brand) => (
                  <label key={brand} className="filter-item">
                    <input type="checkbox" />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
              <a href="#" className="filter-viewmore">Xem thêm</a>
            </div>

            {/* DÒNG SẢN PHẨM */}
            <div className="filter-group">
              <button className="filter-title">
                <span>DÒNG SẢN PHẨM</span>
                <span className="filter-toggle">−</span>
              </button>
              <div className="filter-content">
                {productLines.map((line) => (
                  <label key={line} className="filter-item">
                    <input type="checkbox" />
                    <span>{line}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SOCKET */}
            <div className="filter-group">
              <button className="filter-title">
                <span>SOCKET</span>
                <span className="filter-toggle">−</span>
              </button>
              <div className="filter-content">
                {sockets.map((socket) => (
                  <label key={socket} className="filter-item">
                    <input type="checkbox" />
                    <span>{socket}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* PRICE RANGE */}
            <div className="filter-group">
              <button className="filter-title">
                <span>TẦM GIÁ</span>
                <span className="filter-toggle">−</span>
              </button>
              <div className="filter-content">
                <input type="range" min="1000000" max="50000000" defaultValue="18490000" className="price-slider" />
                <div className="price-display">
                  <span>1.000.000đ</span>
                  <span>50.000.000đ</span>
                </div>
              </div>
              <button className="btn-filter-apply">ÁP DỤNG BỘ LỌC</button>
            </div>
          </aside>

          {/* PRODUCT MAIN */}
          <main className="product-main">
            {/* PRODUCT HEADER */}
            <div className="product-header">
              <span className="breadcrumb-text">Trang chủ / Sản phẩm / GPU / ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB GDDR6X</span>
            </div>

            {/* PRODUCT GRID */}
            <div className="product-grid">
              {/* LEFT: IMAGE GALLERY */}
              <div className="product-gallery">
                <div className="gallery-main">
                  <img src={product.images[selectedImage]} alt={product.name} />
                </div>
                <div className="gallery-thumbnails">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`gallery-thumb ${selectedImage === idx ? 'active' : ''}`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT: PRODUCT INFO */}
              <div className="product-info-section">
                {/* BRAND & NAME */}
                <div className="product-header-info">
                  <span className="product-brand">{product.brand}</span>
                  <h1 className="product-title">{product.name}</h1>
                </div>

                {/* STATUS & RATING */}
                <div className="product-meta">
                  <span className="status-badge">Còn hàng</span>
                  <div className="rating">
                    <span className="stars">⭐⭐⭐⭐⭐</span>
                    <span className="rating-value">4.9</span>
                    <span className="rating-count">({product.reviews} đánh giá)</span>
                    <span className="sold-count">| Đã bán {product.sold}</span>
                  </div>
                </div>

                {/* SPECS TABLE */}
                <div className="specs-table">
                  <div className="specs-row">
                    <div className="specs-item">
                      <div className="specs-label">16GB GDDR6X</div>
                    </div>
                    <div className="specs-item">
                      <div className="specs-label">Clock Speed</div>
                      <div className="specs-value">2640 MHz</div>
                    </div>
                    <div className="specs-item">
                      <div className="specs-label">PCIe 4.0</div>
                    </div>
                    <div className="specs-item">
                      <div className="specs-label">256-bit</div>
                    </div>
                  </div>
                </div>

                {/* PRICE */}
                <div className="product-pricing">
                  <span className="price-note">Giá cả bao gồm VAT</span>
                  <div className="price-main">18.490.000đ</div>
                </div>

                {/* QUANTITY & ACTIONS */}
                <div className="product-actions">
                  <div className="quantity-selector">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="qty-btn"
                    >−</button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={handleQuantityChange}
                      className="qty-input"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="qty-btn"
                    >+</button>
                  </div>
                  <button className="btn-add-cart" onClick={handleAddToCart}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                    </svg>
                    THÊM VÀO GIỎ
                  </button>
                </div>

                {/* WISHLIST */}
                <button 
                  className="btn-wishlist"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  YÊU THÍCH
                </button>

                {/* BENEFITS */}
                <div className="product-benefits">
                  <div className="benefit-item">
                    <span className="benefit-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="1" y="3" width="15" height="13" rx="1"/>
                        <path d="M16 8h4l3 3v5h-7V8z"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                    </span>
                    <div>
                      <div className="benefit-title">Miễn phí vận chuyển</div>
                      <div className="benefit-text">Cho đơn từ 1.000.000đ</div>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                    </span>
                    <div>
                      <div className="benefit-title">Bảo hành chính hãng</div>
                      <div className="benefit-text">36 tháng</div>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M1 4v6h6"/>
                        <path d="M23 20v-6h-6"/>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                      </svg>
                    </span>
                    <div>
                      <div className="benefit-title">Đổi trả miễn phí</div>
                      <div className="benefit-text">30 ngày</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="product-tabs">
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  MỎ TẢ
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  THÔNG SỐ KỸ THUẬT
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  ĐÁNH GIÁ (128)
                </button>
              </div>

              <div className="tabs-content">
                {activeTab === 'description' && (
                  <div className="tab-pane">
                    <p>{product.description}</p>
                    <ul className="features-list">
                      {product.features.map((feature, idx) => (
                        <li key={idx}>
                          <span className="feature-icon">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="tab-pane">
                    <table className="specs-details">
                      <tbody>
                        {Object.entries(product.specs).map(([key, value]) => (
                          <tr key={key}>
                            <td className="spec-label">{key}</td>
                            <td className="spec-value">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="tab-pane">
                    <div className="reviews-section">
                      <p>Hiện chưa có đánh giá. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                      <button className="btn-review">VIẾT ĐÁNH GIÁ</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RELATED PRODUCTS */}
            <div className="related-products">
              <div className="related-header">
                <h2>SẢN PHẨM LIÊN QUAN</h2>
                <a href="#">XEM TẤT CẢ →</a>
              </div>
              <div className="related-grid">
                {relatedProducts.map((item) => (
                  <div key={item.id} className="related-card">
                    <div className="related-img">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="related-info">
                      <div className="related-name">{item.name}</div>
                      <div className="related-specs">{item.specs}</div>
                      <div className="related-footer">
                        <div className="related-price">{item.price}</div>
                        <button className="btn-related-cart">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          </main>
        </div>
      </div>
    </DefaultLayout>
  )
}
