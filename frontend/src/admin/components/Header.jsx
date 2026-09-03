import React, { useState, useEffect } from 'react';
import { LogOut, User, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../services/apiService';
import { useAdminTheme } from '../context/AdminThemeContext';

const Header = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const { theme, isDark, toggleTheme } = useAdminTheme();

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setAdminUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { credentials: 'include' });
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <header className="admin-header flex justify-between items-center px-6 py-4 bg-[#14141d] border-b border-[#2b2b36]">
      <div className="flex items-center gap-3">
        <h2 className="admin-header-title text-lg font-bold text-white tracking-wide">Quản Trị Hệ Thống WINNOTECH</h2>
        <span className="admin-badge-role px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> ADMIN SYSTEM
        </span>
      </div>

      <div className="header-actions flex items-center gap-3">

        <div className="user-profile flex items-center gap-3 bg-[#1e1e2d] px-3 py-1.5 rounded-xl border border-[#333]">
          {adminUser?.avatar && !imgError ? (
            <img 
              className="w-9 h-9 rounded-full object-cover border border-[#d4ff00]" 
              src={adminUser.avatar.startsWith('http') ? adminUser.avatar : `http://localhost:3000${adminUser.avatar}`} 
              alt={adminUser.name || 'Admin'} 
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#d4ff00]/20 text-[#d4ff00] flex items-center justify-center font-bold border border-[#d4ff00]">
              <User className="w-5 h-5" />
            </div>
          )}
          <div className="user-info text-left">
            <h5 className="text-sm font-semibold text-white leading-tight">{adminUser?.name || adminUser?.email || 'Quản trị viên'}</h5>
            <span className="text-[11px] text-[#d4ff00] font-mono">Role: {adminUser?.role || 'admin'}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/30 transition-colors"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Header;

