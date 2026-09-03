import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { AdminThemeProvider, useAdminTheme } from '../context/AdminThemeContext';
import '../admin.css';

const AdminLayoutContent = () => {
  const { theme } = useAdminTheme();

  return (
    <div className={`admin-layout ${theme} ${theme === 'light' ? 'light-mode' : 'dark-mode'}`} data-theme={theme}>
      <Sidebar />
      <main className="admin-main">
        <Header />
        <div className="admin-content">
          <Outlet />
        </div>
        <footer className="admin-footer" style={{ padding: '20px', textAlign: 'center', fontSize: '12px' }}>
          © 2024 Winno Tech Admin. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent />
    </AdminThemeProvider>
  );
};

export default AdminLayout;

