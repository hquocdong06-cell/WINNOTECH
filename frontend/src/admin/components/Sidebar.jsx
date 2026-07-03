import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
    { title: 'Sản phẩm', path: '/admin/products', icon: '📦' },
    { title: 'Danh mục', path: '/admin/categories', icon: '📂' },
    { title: 'Đơn hàng', path: '/admin/orders', icon: '🛒' },
    { title: 'Khách hàng', path: '/admin/customers', icon: '👥' },
    { title: 'Đánh giá', path: '/admin/reviews', icon: '⭐' },
    { title: 'Khuyến mãi', path: '/admin/promotions', icon: '🏷️' },
    { title: 'Báo cáo', path: '/admin/reports', icon: '📊' },
    { title: 'Bài viết', path: '/admin/posts', icon: '📝' },
    { title: 'Cài đặt', path: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        WINNO <span>TECH</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <i>{item.icon}</i>
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-promo">
        <img src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=2787&auto=format&fit=crop" alt="PC Build" />
        <h4>WINNO TECH</h4>
        <p>BUILD. PERFORM. DOMINATE.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
