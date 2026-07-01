import React, { useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Calendar, Clock, Activity } from 'lucide-react';

const mockRecentOrders = [
  { id: 'WIN123456', customer: 'Nguyễn Văn A', total: 18490000, status: 'Hoàn thành', date: '20/05/2024 14:30' },
  { id: 'WIN123455', customer: 'Trần Thị B', total: 23990000, status: 'Chờ xử lý', date: '20/05/2024 13:15' },
  { id: 'WIN123454', customer: 'Lê Văn C', total: 12890000, status: 'Hoàn thành', date: '20/05/2024 11:22' },
];

const mockBestSellers = [
  { id: 1, name: 'RTX 4090 24GB', sold: 156, revenue: 166890000, image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=150&auto=format&fit=crop' },
  { id: 2, name: 'Intel Core i9-14900K', sold: 142, revenue: 121580000, image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=150&auto=format&fit=crop' },
];

const Dashboard = () => {
  const [revenueTab, setRevenueTab] = useState('day');

  return (
    <div className="p-8 text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tổng quan Dashboard</h1>
          <p className="text-gray-400 text-sm">Chào mừng bạn trở lại, hệ thống đang hoạt động tốt.</p>
        </div>
      </div>

      {/* TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">TỔNG DOANH THU</div>
            <div className="text-2xl font-bold text-white mb-2">2,450,000,000₫</div>
            <div className="text-xs text-green-400 font-medium">↑ 12.5% so với tháng trước</div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/50" />
        </div>
        
        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">TỔNG ĐƠN HÀNG</div>
            <div className="text-2xl font-bold text-white mb-2">1,256</div>
            <div className="text-xs text-green-400 font-medium">↑ 8.3% so với tháng trước</div>
          </div>
          <ShoppingCart className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/50" />
        </div>

        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">KHÁCH HÀNG</div>
            <div className="text-2xl font-bold text-white mb-2">3,452</div>
            <div className="text-xs text-green-400 font-medium">↑ 15.7% so với tháng trước</div>
          </div>
          <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/50" />
        </div>

        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">SẢN PHẨM</div>
            <div className="text-2xl font-bold text-white mb-2">245</div>
            <div className="text-xs text-green-400 font-medium">↑ 5.2% so với tháng trước</div>
          </div>
          <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/50" />
        </div>
      </div>

      {/* BÁO CÁO DOANH THU THEO NGÀY/THÁNG/NĂM */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#d4ff00]" /> Báo Cáo Doanh Thu (Ngày / Tháng / Năm)
          </h3>
          <div className="flex bg-[#222] p-1 rounded-lg border border-[#333]">
            <button 
              onClick={() => setRevenueTab('day')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${revenueTab === 'day' ? 'bg-[#d4ff00] text-black' : 'text-gray-400 hover:bg-[#333] hover:text-white'}`}
            >
              Hôm nay
            </button>
            <button 
              onClick={() => setRevenueTab('month')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${revenueTab === 'month' ? 'bg-[#d4ff00] text-black' : 'text-gray-400 hover:bg-[#333] hover:text-white'}`}
            >
              Tháng này
            </button>
            <button 
              onClick={() => setRevenueTab('year')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${revenueTab === 'year' ? 'bg-[#d4ff00] text-black' : 'text-gray-400 hover:bg-[#333] hover:text-white'}`}
            >
              Năm nay
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
            <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
              <Clock className="w-4 h-4 text-blue-400" /> Doanh thu hôm nay
            </div>
            <div className="text-2xl font-bold text-white">12,500,000₫</div>
            <div className="text-xs text-green-400 mt-2">↑ 5% so với hôm qua</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
            <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
              <Calendar className="w-4 h-4 text-purple-400" /> Doanh thu tháng này
            </div>
            <div className="text-2xl font-bold text-white">354,200,000₫</div>
            <div className="text-xs text-green-400 mt-2">↑ 12% so với tháng trước</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
            <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
              <Activity className="w-4 h-4 text-[#d4ff00]" /> Doanh thu năm nay
            </div>
            <div className="text-2xl font-bold text-white">2,450,000,000₫</div>
            <div className="text-xs text-green-400 mt-2">↑ 28% so với năm ngoái</div>
          </div>
        </div>
      </div>

      {/* BIỂU ĐỒ DOANH THU */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-[#d4ff00]" /> Biểu Đồ Tăng Trưởng Doanh Thu (12 Tháng)
        </h3>
        <div className="h-64 flex items-end justify-between px-2 pt-6 pb-2 border-b border-[#333] relative">
          <div className="absolute w-full top-0 border-t border-[#222]"></div>
          <div className="absolute w-full top-1/4 border-t border-[#222]"></div>
          <div className="absolute w-full top-2/4 border-t border-[#222]"></div>
          <div className="absolute w-full top-3/4 border-t border-[#222]"></div>
          
          {[30, 45, 35, 60, 50, 75, 65, 80, 95, 85, 90, 100].map((h, i) => (
             <div key={i} className="w-[6%] relative flex justify-center group">
               <div 
                  style={{ height: `${h}%` }} 
                  className="w-full bg-gradient-to-t from-[#d4ff00]/10 to-[#d4ff00] hover:opacity-80 transition-opacity rounded-t-sm z-10"
               ></div>
               <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black border border-[#333] text-xs px-2 py-1 rounded text-white z-20 pointer-events-none transition-opacity whitespace-nowrap">
                 {(h * 24.5).toLocaleString()}tr
               </div>
               <span className="absolute -bottom-6 text-xs text-gray-500">T{i+1}</span>
             </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ĐƠN HÀNG GẦN ĐÂY */}
        <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#333] bg-[#1a1a1a]">
            <h3 className="text-lg font-bold flex items-center gap-2">Đơn Hàng Gần Đây</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111] text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Mã đơn</th>
                  <th className="px-5 py-3 font-medium">Khách hàng</th>
                  <th className="px-5 py-3 font-medium">Tổng tiền</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {mockRecentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-[#1e1e1e] transition-colors">
                    <td className="px-5 py-3 font-semibold text-gray-300">#{order.id}</td>
                    <td className="px-5 py-3 text-white">{order.customer}</td>
                    <td className="px-5 py-3 text-[#d4ff00] font-medium">{order.total.toLocaleString('vi-VN')}₫</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${order.status === 'Hoàn thành' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SẢN PHẨM BÁN CHẠY */}
        <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#333] bg-[#1a1a1a]">
            <h3 className="text-lg font-bold flex items-center gap-2">Sản Phẩm Bán Chạy</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111] text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Sản phẩm</th>
                  <th className="px-5 py-3 font-medium text-center">Đã bán</th>
                  <th className="px-5 py-3 font-medium text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {mockBestSellers.map((item, i) => (
                  <tr key={i} className="hover:bg-[#1e1e1e] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} className="w-10 h-10 rounded object-cover border border-[#333]" />
                        <span className="font-semibold text-gray-200">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center text-white font-bold">{item.sold}</td>
                    <td className="px-5 py-3 text-right text-[#d4ff00] font-medium">
                      {(item.revenue / 1000).toLocaleString('vi-VN')}k
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
