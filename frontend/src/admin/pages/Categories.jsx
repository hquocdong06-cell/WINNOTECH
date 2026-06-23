import React from 'react';

const Categories = () => {
  const categories = [
    { id: 1, name: 'Card đồ họa (GPU)', slug: 'gpu', count: 45, icon: '🎮' },
    { id: 2, name: 'CPU - Bộ vi xử lý', slug: 'cpu', count: 32, icon: '🧠' },
    { id: 3, name: 'RAM - Bộ nhớ', slug: 'ram', count: 28, icon: '💾' },
    { id: 4, name: 'Mainboard - Bo mạch chủ', slug: 'mainboard', count: 15, icon: '🔌' },
    { id: 5, name: 'SSD - Ổ cứng', slug: 'ssd', count: 22, icon: '💿' },
  ];

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Quản lý danh mục</h1>
          <div style={{ fontSize: '13px', color: '#666' }}>Trang chủ &gt; Danh mục</div>
        </div>
        <button className="btn-primary">
          <span>+</span> Thêm danh mục
        </button>
      </div>

      <div className="content-card" style={{ padding: '0' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>ID</th>
              <th>BIỂU TƯỢNG</th>
              <th>TÊN DANH MỤC</th>
              <th>SLUG</th>
              <th>SỐ SẢN PHẨM</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td style={{ textAlign: 'center' }}>#{cat.id}</td>
                <td><span style={{ fontSize: '24px' }}>{cat.icon}</span></td>
                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                <td>{cat.slug}</td>
                <td>{cat.count} sản phẩm</td>
                <td>
                  <div className="action-icons">
                    <button className="icon-btn edit">✏️</button>
                    <button className="icon-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
