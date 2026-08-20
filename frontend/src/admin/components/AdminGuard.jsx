import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, LogIn, Home } from 'lucide-react';
import { API_BASE } from '../../services/apiService';

export default function AdminGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUserInfo(data.user);
            if (data.user.role === 'admin') {
              setIsAdmin(true);
            }
          }
        }
      } catch (error) {
        console.warn('Lỗi kiểm tra quyền Admin:', error.message);
      } finally {
        setChecking(false);
      }
    };

    checkAdminAuth();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center text-[#d4ff00] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#d4ff00]/30 border-t-[#d4ff00] rounded-full animate-spin"></div>
          <span className="text-sm font-medium tracking-wide">Đang kiểm tra quyền Admin...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d0d12] text-white flex items-center justify-center p-6 font-sans">
        <div className="bg-[#14141d] border border-red-500/30 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500 text-center" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Quyền Truy Cập Bị Từ Chối</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {userInfo ? (
              <>
                Tài khoản <span className="text-white font-semibold">{userInfo.email || userInfo.name}</span> không có quyền quản trị viên.
                Chức năng này chỉ dành riêng cho Quản trị viên (Admin).
              </>
            ) : (
              'Bạn chưa đăng nhập hoặc không có quyền truy cập trang quản trị viên Admin.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(212,255,0,0.2)]"
            >
              <LogIn className="w-4 h-4" /> Đăng nhập Admin
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#222] hover:bg-[#333] border border-[#444] text-gray-300 hover:text-white font-medium rounded-xl transition-all"
            >
              <Home className="w-4 h-4" /> Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
