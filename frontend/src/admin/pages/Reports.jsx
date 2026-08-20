import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Package, Activity, Download, RefreshCw } from 'lucide-react';
import { fetchRevenueStats, getRevenueExcelExportUrl, fetchAdminProducts, API_BASE } from '../services/adminService';

const Reports = () => {
  const [period, setPeriod] = useState('month'); // 'day' | 'week' | 'month' | 'year'
  const [revenueStats, setRevenueStats] = useState({ summary: {}, breakdown: [] });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, products] = await Promise.all([
        fetchRevenueStats(period).catch(() => ({ summary: {}, breakdown: [] })),
        fetchAdminProducts().catch(() => []),
      ]);

      if (statsRes.success) {
        setRevenueStats(statsRes);
      } else {
        setRevenueStats({ summary: statsRes.summary || {}, breakdown: statsRes.breakdown || [] });
      }

      // Filter Low Stock (< 10)
      const lowStock = products.filter(p => (p.stock_quantity ?? p.stock ?? 0) <= 10);
      setLowStockProducts(lowStock);

      // Best Sellers
      const sorted = [...products].sort((a, b) => (b.sold_quantity || b.buyturn || 0) - (a.sold_quantity || a.buyturn || 0));
      setBestSellers(sorted.slice(0, 5));

    } catch (err) {
      console.error('Lỗi load báo cáo:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const maxRevenue = Math.max(...(revenueStats.breakdown || []).map(b => b.revenue), 1);

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Báo cáo & Thống kê Kinh doanh</h1>
          <p className="text-gray-400 text-sm">Phân tích hiệu suất doanh thu và tồn kho thực tế từ backend WINNOTECH</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white font-semibold"
          >
            <option value="day">Thống kê theo Ngày</option>
            <option value="week">Thống kê theo Tuần</option>
            <option value="month">Thống kê theo Tháng</option>
            <option value="year">Thống kê theo Năm</option>
          </select>
          <button
            onClick={loadReportData}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#222] border border-[#333] hover:bg-[#333] text-white font-medium rounded-xl text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <a
            href={getRevenueExcelExportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(212,255,0,0.2)]"
          >
            <Download className="w-4 h-4" /> Xuất Báo Cáo Excel
          </a>
        </div>
      </div>

      {/* Row 1: Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#14141d] border border-[#333] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">TỔNG DOANH THU</div>
            <div className="text-2xl font-black text-[#d4ff00] mb-2">
              {(revenueStats.summary?.totalRevenue || 0).toLocaleString('vi-VN')}₫
            </div>
            <div className="text-xs text-green-400 font-medium">Từ các đơn hàng hợp lệ</div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/30" />
        </div>
        
        <div className="bg-[#14141d] border border-[#333] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">ĐƠN HÀNG THÀNH CÔNG</div>
            <div className="text-2xl font-black text-white mb-2">
              {revenueStats.summary?.totalPaidOrders || 0} đơn
            </div>
            <div className="text-xs text-green-400 font-medium">Đã thanh toán / Hoàn thành</div>
          </div>
          <ShoppingCart className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/30" />
        </div>

        <div className="bg-[#14141d] border border-[#333] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">GIÁ TRỊ TRUNG BÌNH ĐƠN</div>
            <div className="text-2xl font-black text-white mb-2">
              {(revenueStats.summary?.avgOrderValue || 0).toLocaleString('vi-VN')}₫
            </div>
            <div className="text-xs text-blue-400 font-medium">Giá trị trung bình / đơn</div>
          </div>
          <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/30" />
        </div>

        <div className="bg-[#14141d] border border-[#333] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">CẢNH BÁO TỒN KHO</div>
            <div className="text-2xl font-black text-red-400 mb-2">
              {lowStockProducts.length} sản phẩm
            </div>
            <div className="text-xs text-red-400 font-medium">Sắp hết hàng (tồn kho ≤ 10)</div>
          </div>
          <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/30" />
        </div>
      </div>

      {/* Row 2: Biểu đồ doanh thu */}
      <div className="bg-[#14141d] border border-[#333] rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2b2b36]">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#d4ff00]" /> Biểu Đồ Doanh Thu ({period.toUpperCase()})
          </h3>
        </div>
        
        {revenueStats.breakdown && revenueStats.breakdown.length > 0 ? (
          <div className="h-64 flex items-end gap-3 pt-8 pb-4 px-2 overflow-x-auto">
            {revenueStats.breakdown.map((item, idx) => {
              const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 6);
              return (
                <div key={idx} className="flex-1 min-w-[50px] flex flex-col items-center gap-2 group relative">
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-[#d4ff00] text-white text-[11px] py-1 px-2.5 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-xl">
                    <div className="font-bold text-[#d4ff00]">{item.period}</div>
                    <div>{item.revenue.toLocaleString('vi-VN')}₫ ({item.orderCount} đơn)</div>
                  </div>
                  <div className="w-full bg-[#1e1e2d] rounded-t-lg h-full flex items-end overflow-hidden p-1">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-[#d4ff00]/20 to-[#d4ff00] rounded-t border-t-2 border-[#d4ff00] group-hover:brightness-125 transition-all"
                    ></div>
                  </div>
                  <span className="text-[11px] text-gray-400 truncate w-full text-center font-mono">
                    {item.period}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu giao dịch cho mốc thời gian này.'}
          </div>
        )}
      </div>

      {/* Row 3: Grid Cảnh Báo Tồn Kho & Sản Phẩm Nổi Bật */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cảnh báo tồn kho ít */}
        <div className="bg-[#14141d] border border-[#333] rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5 text-yellow-400" /> Cảnh Báo Sản Phẩm Sắp Hết Hàng
          </h3>
          <div className="space-y-3">
            {lowStockProducts.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-xl border border-red-500/20 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.image ? (p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`) : 'https://placehold.co/80'}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-lg border border-[#444]"
                  />
                  <div className="truncate">
                    <div className="font-bold text-white text-sm truncate">{p.name}</div>
                    <div className="text-gray-400">Giá: {(p.price || 0).toLocaleString('vi-VN')}₫</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-lg whitespace-nowrap">
                  Còn {p.stock_quantity ?? p.stock ?? 0} sản phẩm
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">Tất cả sản phẩm trong kho đều còn đủ số lượng.</div>
            )}
          </div>
        </div>

        {/* Top Sản Phẩm Bán Chạy */}
        <div className="bg-[#14141d] border border-[#333] rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 text-[#d4ff00]">
            Top Sản Phẩm Có Lượt Mua Cao Nhất
          </h3>
          <div className="space-y-3">
            {bestSellers.map((p, idx) => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-xl border border-[#333] text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-[#d4ff00] font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <img
                    src={p.image ? (p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`) : 'https://placehold.co/80'}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-lg border border-[#444]"
                  />
                  <div className="truncate">
                    <div className="font-bold text-white text-sm truncate">{p.name}</div>
                    <div className="text-[#d4ff00] font-semibold">{(p.sale_price || p.price || 0).toLocaleString('vi-VN')}₫</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400">Đã bán</div>
                  <div className="font-bold text-white text-sm">{p.sold_quantity || p.buyturn || 0} cái</div>
                </div>
              </div>
            ))}
            {bestSellers.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">Chưa có dữ liệu bán sản phẩm.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
