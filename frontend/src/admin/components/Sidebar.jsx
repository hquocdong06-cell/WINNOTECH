import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Building2,
  Image,
  ShoppingCart,
  Users,
  Ticket,
  Star,
  Tag,
  FileText,
  Layers,
  Settings,
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Sản phẩm', path: '/admin/products', icon: Package },
    { title: 'Danh mục', path: '/admin/categories', icon: FolderTree },
    { title: 'Thương hiệu', path: '/admin/brands', icon: Building2 },
    { title: 'Banner', path: '/admin/banners', icon: Image },
    { title: 'Đơn hàng', path: '/admin/orders', icon: ShoppingCart },
    { title: 'Khách hàng', path: '/admin/customers', icon: Users },
    { title: 'Ví voucher KH', path: '/admin/user-vouchers', icon: Ticket },
    { title: 'Đánh giá', path: '/admin/reviews', icon: Star },
    { title: 'Khuyến mãi', path: '/admin/promotions', icon: Tag },
    { title: 'Bài viết', path: '/admin/posts', icon: FileText },
    { title: 'DM Bài viết', path: '/admin/post-categories', icon: Layers },
    { title: 'Cài đặt', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        WINNO <span>TECH</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <NavLink 
              key={index} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <i className="nav-icon">
                <IconComponent className="w-5 h-5 shrink-0" />
              </i>
              <span className="nav-text">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

