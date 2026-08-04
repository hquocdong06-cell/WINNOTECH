import React, { useState, useEffect } from 'react';
import { Save, Store, Mail, Phone, MapPin, Bell, Shield, Moon } from 'lucide-react';
import { toast } from 'react-toastify';

const Settings = () => {
  const [storeInfo, setStoreInfo] = useState({
    storeName: 'WINNO TECH',
    email: 'sgdeath21@gmail.com',
    phone: '0909 260 436',
    address: '123 Đường Công Nghệ, Q. 1, TP. Hồ Chí Minh',
    enableNotifications: true,
    autoApproveOrders: false,
    darkMode: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('winnotech_admin_settings');
    if (saved) {
      try {
        setStoreInfo(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('winnotech_admin_settings', JSON.stringify(storeInfo));
      setSaving(false);
      toast.success('Đã lưu cấu hình hệ thống cửa hàng!');
    }, 400);
  };

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cài Đặt Hệ Thống</h1>
        <p className="text-gray-400 text-sm">Quản lý cấu hình cửa hàng, thông báo và thiết lập hệ thống WinnoTech Admin</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Thông tin cửa hàng */}
        <div className="bg-[#14141d] border border-[#333] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold border-b border-[#2b2b36] pb-3 flex items-center gap-2">
            <Store className="w-5 h-5 text-[#d4ff00]" /> Thông Tin Cửa Hàng
          </h3>

          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1">Tên Cửa Hàng</label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={storeInfo.storeName}
                onChange={e => setStoreInfo({ ...storeInfo, storeName: e.target.value })}
                className="w-full bg-[#1e1e2d] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1">Email Hỗ Trợ</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={storeInfo.email}
                onChange={e => setStoreInfo({ ...storeInfo, email: e.target.value })}
                className="w-full bg-[#1e1e2d] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1">Hotline Liên Hệ</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={storeInfo.phone}
                onChange={e => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                className="w-full bg-[#1e1e2d] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1">Địa Chỉ Văn Phòng / Cửa Hàng</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={storeInfo.address}
                onChange={e => setStoreInfo({ ...storeInfo, address: e.target.value })}
                className="w-full bg-[#1e1e2d] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Cấu hình thông báo & Giao diện */}
        <div className="bg-[#14141d] border border-[#333] rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-[#2b2b36] pb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#d4ff00]" /> Cấu Hình & Giao Diện Admin
            </h3>

            <div className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-xl border border-[#333]">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#d4ff00]" />
                <div>
                  <div className="font-bold text-sm">Thông báo đơn hàng mới</div>
                  <div className="text-xs text-gray-400">Tự động phát chuông báo khi có đơn hàng mới phát sinh</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={storeInfo.enableNotifications}
                onChange={e => setStoreInfo({ ...storeInfo, enableNotifications: e.target.checked })}
                className="w-5 h-5 accent-[#d4ff00] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-xl border border-[#333]">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-bold text-sm">Giao diện tối chuyên nghiệp (Dark Mode)</div>
                  <div className="text-xs text-gray-400">Giữ giao diện Admin ở chế độ tối tối ưu độ tương phản</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={storeInfo.darkMode}
                onChange={e => setStoreInfo({ ...storeInfo, darkMode: e.target.checked })}
                className="w-5 h-5 accent-[#d4ff00] cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#2b2b36] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(212,255,0,0.2)] text-sm"
            >
              <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Cấu Hình'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
