import React, { useState } from 'react';
import { Save, Store, Mail, Phone, MapPin, Moon, Sun, Shield, Globe, Bell } from 'lucide-react';
import { toast } from 'react-toastify';

const Settings = () => {
  const [formData, setFormData] = useState({
    storeName: 'WINNO TECH',
    email: 'support@winnotech.com',
    phone: '0123 456 789',
    address: '123 Đường Công Nghệ, TP. HCM',
    website: 'https://winnotech.vn',
  });
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate API call
    toast.success('Đã lưu cài đặt hệ thống thành công!');
  };

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cài đặt Hệ thống</h1>
          <p className="text-gray-400 text-sm">Quản lý thông tin cửa hàng và cấu hình hiển thị</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(212,255,0,0.2)]"
        >
          <Save className="w-5 h-5" /> Lưu Thay Đổi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Thông tin */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
            <div className="p-5 border-b border-[#333] bg-[#1a1a1a]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-400" /> Thông tin Cửa hàng
              </h3>
            </div>
            <div className="p-6">
              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tên cửa hàng</label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="text" name="storeName" value={formData.storeName} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email liên hệ</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="text" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="text" name="website" value={formData.website} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Địa chỉ cửa hàng</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" name="address" value={formData.address} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white transition-colors"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Cấu hình hệ thống */}
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
            <div className="p-5 border-b border-[#333] bg-[#1a1a1a]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" /> Tùy chọn Giao diện
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center">
                    {darkMode ? <Moon className="w-5 h-5 text-[#d4ff00]" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <div>
                    <div className="font-semibold text-white">Chế độ tối (Dark Mode)</div>
                    <div className="text-xs text-gray-400 mt-0.5">Sử dụng giao diện tối màu</div>
                  </div>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${darkMode ? 'bg-[#d4ff00]' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Thông báo (Notifications)</div>
                    <div className="text-xs text-gray-400 mt-0.5">Nhận thông báo đơn hàng mới</div>
                  </div>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications ? 'bg-[#d4ff00]' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
