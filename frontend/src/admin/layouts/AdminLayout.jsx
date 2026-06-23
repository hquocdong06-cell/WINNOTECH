import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../admin.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <Header />
        <div className="admin-content">
          <Outlet />
        </div>
        <footer style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
          © 2024 Winno Tech Admin. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;
