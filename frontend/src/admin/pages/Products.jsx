import React from 'react';

const Products = () => {
  const products = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop",
      name: "ASUS ROG Strix RTX 4090 24GB GDDR6X",
      specs: "24GB GDDR6X • 384-bit • 2520 MHz",
      category: "Card đồ họa (GPU)",
      brand: "ASUS",
      price: "49.990.000₫",
      stock: 28,
      status: "Đang bán"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=2670&auto=format&fit=crop",
      name: "Intel Core i9-14900K",
      specs: "24 nhân / 32 luồng • 3.2GHz – 6.0GHz",
      category: "CPU - Bộ vi xử lý",
      brand: "Intel",
      price: "18.490.000₫",
      stock: 35,
      status: "Đang bán"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1624637710378-fc741639f75a?q=80&w=2670&auto=format&fit=crop",
      name: "G.Skill Trident Z5 RGB 32GB (2x16GB)",
      specs: "DDR5 • 6000MHz • CL30",
      category: "RAM - Bộ nhớ",
      brand: "G.Skill",
      price: "3.990.000₫",
      stock: 50,
      status: "Đang bán"
    }
  ];

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Quản lý sản phẩm</h1>
          <div style={{ fontSize: '13px', color: '#666' }}>Trang chủ &gt; Sản phẩm &gt; Danh sách sản phẩm</div>
        </div>
        <button className="btn-primary">
          <span>+</span> Thêm sản phẩm
        </button>
      </div>

      <div className="filters-wrapper">
        <div className="header-search" style={{ flex: 1.5, minWidth: '250px' }}>
          <i>🔍</i>
          <input type="text" placeholder="Tìm kiếm sản phẩm..." style={{ background: '#1e1e1e' }} />
        </div>
        
        <div className="filter-group">
          <label>Danh mục</label>
          <select>
            <option>Tất cả danh mục</option>
            <option>GPU</option>
            <option>CPU</option>
            <option>RAM</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Hãng</label>
          <select>
            <option>Tất cả hãng</option>
            <option>ASUS</option>
            <option>Intel</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Khoảng giá</label>
          <select>
            <option>Tất cả</option>
            <option>Dưới 10tr</option>
            <option>10tr - 20tr</option>
            <option>Trên 20tr</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="icon-btn" title="Làm mới">🔄</button>
          <button className="btn-primary" style={{ background: '#1e1e1e', color: '#fff', border: '1px solid #333' }}>
            <span>🔍</span> Bộ lọc
          </button>
        </div>
      </div>

      <div className="content-card" style={{ padding: '0' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}><input type="checkbox" /></th>
              <th>HÌNH ẢNH</th>
              <th>TÊN SẢN PHẨM</th>
              <th>DANH MỤC</th>
              <th>HÃNG</th>
              <th>GIÁ</th>
              <th>TỒN KHO</th>
              <th>TRẠNG THÁI</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
                <td><img src={p.image} alt={p.name} className="product-img" /></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#a0a0a0', marginTop: '4px' }}>{p.specs}</div>
                </td>
                <td>{p.category}</td>
                <td>{p.brand}</td>
                <td style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{p.price}</td>
                <td>{p.stock}</td>
                <td><span className="status-badge status-success">{p.status}</span></td>
                <td>
                  <div className="action-icons">
                    <button className="icon-btn edit">✏️</button>
                    <button className="icon-btn view">👁️</button>
                    <button className="icon-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination" style={{ padding: '20px' }}>
          <div>Hiển thị <select style={{ background: '#1e1e1e', color: '#fff', border: 'none' }}>
            <option>10</option>
            <option>25</option>
          </select> sản phẩm</div>
          
          <div className="page-numbers">
            <div className="page-num">&lt;</div>
            <div className="page-num active">1</div>
            <div className="page-num">2</div>
            <div className="page-num">3</div>
            <div className="page-num">...</div>
            <div className="page-num">12</div>
            <div className="page-num">&gt;</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
