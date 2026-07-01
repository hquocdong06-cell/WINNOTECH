import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Package, Activity } from 'lucide-react';

const mockBestSellers = [
  { id: 1, name: 'VGA ASUS TUF Gaming RTX 4070', sold: 124, revenue: 1982760000, image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=150&auto=format&fit=crop' },
  { id: 2, name: 'CPU Intel Core i9-14900K', sold: 89, revenue: 1290500000, image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=150&auto=format&fit=crop' },
  { id: 3, name: 'RAM Corsair Vengeance 32GB', sold: 256, revenue: 819200000, image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=150&auto=format&fit=crop' },
  { id: 4, name: 'Màn hình Dell U2723QE', sold: 45, revenue: 562500000, image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=150&auto=format&fit=crop' },
];

const mockLowStock = [
  { id: 1, name: 'Bàn phím cơ Keychron Q1', stock: 2, threshold: 5, image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=150&auto=format&fit=crop' },
  { id: 2, name: 'Chuột Logitech G Pro X Superlight', stock: 1, threshold: 10, image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=150&auto=format&fit=crop' },
  { id: 3, name: 'SSD Samsung 990 Pro 2TB', stock: 3, threshold: 15, image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=150&auto=format&fit=crop' },
  { id: 4, name: 'Tản nhiệt nước NZXT Kraken Elite', stock: 0, threshold: 5, image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=150&auto=format&fit=crop' },
];

const Reports = () => {
  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Báo cáo & Thống kê</h1>
          <p className="text-gray-400 text-sm">Tổng quan hiệu suất kinh doanh cửa hàng</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white">
            <option>Tháng này (Tháng 5)</option>
            <option>Tháng trước</option>
            <option>Quý này</option>
            <option>Năm nay</option>
          </select>
          <button className="px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-lg transition-colors">
            Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* Row 1: Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">Tổng Doanh Thu</div>
            <div className="text-2xl font-bold text-white mb-2">1,840,450,000₫</div>
            <div className="text-xs text-green-400 font-medium">↑ 14.5% so với tháng trước</div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/50" />
        </div>
        
        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">Đơn Hàng Thành Công</div>
            <div className="text-2xl font-bold text-white mb-2">1,245</div>
            <div className="text-xs text-green-400 font-medium">↑ 8.2% so với tháng trước</div>
          </div>
          <ShoppingCart className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/50" />
        </div>

        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">Tỷ lệ Chuyển Đổi</div>
            <div className="text-2xl font-bold text-white mb-2">3.8%</div>
            <div className="text-xs text-red-400 font-medium">↓ 1.1% so với tháng trước</div>
          </div>
          <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/50" />
        </div>

        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">Tổng Sản Phẩm Đã Bán</div>
            <div className="text-2xl font-bold text-white mb-2">3,492</div>
            <div className="text-xs text-green-400 font-medium">↑ 12.3% so với tháng trước</div>
          </div>
          <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/50" />
        </div>
      </div>

      {/* Row 2: Biểu đồ & Tình trạng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Báo cáo doanh thu (Biểu đồ) */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#333] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#d4ff00]" /> Biểu đồ Doanh Thu
            </h3>
          </div>
          <div className="h-64 flex items-end justify-between px-2 pt-6 pb-2 border-b border-[#333] relative">
            {/* Lưới ngang */}
            <div className="absolute w-full top-0 border-t border-[#222]"></div>
            <div className="absolute w-full top-1/4 border-t border-[#222]"></div>
            <div className="absolute w-full top-2/4 border-t border-[#222]"></div>
            <div className="absolute w-full top-3/4 border-t border-[#222]"></div>
            
            {[30, 45, 35, 60, 50, 75, 65, 80, 95, 85, 90, 100].map((h, i) => (
               <div key={i} className="w-[6%] relative flex justify-center group">
                 <div 
                    style={{ height: `${h}%` }} 
                    className="w-full bg-[#d4ff00]/20 border-t-2 border-[#d4ff00] hover:bg-[#d4ff00]/40 transition-colors rounded-t-sm z-10"
                 ></div>
                 {/* Tooltip */}
                 <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black border border-[#333] text-xs px-2 py-1 rounded text-white z-20 pointer-events-none transition-opacity">
                   {h * 10}tr
                 </div>
                 <span className="absolute -bottom-6 text-xs text-gray-500">T{i+1}</span>
               </div>
            ))}
          </div>
        </div>

        {/* Tình trạng sản phẩm */}
        <div className="bg-[#141414] border border-[#333] rounded-xl p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-blue-400" /> Tình trạng Sản phẩm
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Đang bán (Active)</span>
                <span className="font-bold text-white">450 SP</span>
              </div>
              <div className="w-full h-2.5 bg-[#222] rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Sắp hết hàng (Low Stock)</span>
                <span className="font-bold text-white">42 SP</span>
              </div>
              <div className="w-full h-2.5 bg-[#222] rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Hết hàng (Out of Stock)</span>
                <span className="font-bold text-white">18 SP</span>
              </div>
              <div className="w-full h-2.5 bg-[#222] rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '5%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Đã ẩn / Bản nháp (Draft)</span>
                <span className="font-bold text-white">35 SP</span>
              </div>
              <div className="w-full h-2.5 bg-[#222] rounded-full overflow-hidden">
                <div className="h-full bg-gray-500" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-[#222]/50 border border-[#333] rounded-lg">
            <p className="text-sm text-gray-400 leading-relaxed">
              Tổng kho hiện có <strong className="text-white">545</strong> sản phẩm. Tỷ lệ hàng sẵn sàng bán đạt <strong className="text-green-400">82%</strong>.
            </p>
          </div>
        </div>

      </div>

      {/* Row 3: Bảng xếp hạng sản phẩm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sản phẩm bán chạy */}
        <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#333] bg-[#1a1a1a]">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" /> Top Sản phẩm Bán chạy
            </h3>
          </div>
          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111] text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Sản phẩm</th>
                  <th className="px-5 py-3 font-medium text-center">Đã bán</th>
                  <th className="px-5 py-3 font-medium text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {mockBestSellers.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#1e1e1e] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-gray-500 w-4">{index + 1}</div>
                        <img src={item.image} className="w-10 h-10 rounded object-cover border border-[#333]" />
                        <div className="font-semibold text-gray-200 line-clamp-1">{item.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-white">{item.sold}</td>
                    <td className="px-5 py-3 text-right text-[#d4ff00] font-medium">
                      {(item.revenue / 1000000).toFixed(1)} tr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sản phẩm sắp hết hàng */}
        <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#333] bg-[#1a1a1a]">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> Sản phẩm Sắp hết / Hết hàng
            </h3>
          </div>
          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111] text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Sản phẩm</th>
                  <th className="px-5 py-3 font-medium text-center">Tồn kho</th>
                  <th className="px-5 py-3 font-medium text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {mockLowStock.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1e1e1e] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} className="w-10 h-10 rounded object-cover border border-[#333]" />
                        <div className="font-semibold text-gray-200 line-clamp-1">{item.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`font-bold ${item.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                        {item.stock}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">/ {item.threshold}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {item.stock === 0 ? (
                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-red-500/10 text-red-500 border border-red-500/20">Hết hàng</span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">Cần nhập</span>
                      )}
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

export default Reports;
