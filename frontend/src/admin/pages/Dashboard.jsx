import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Download, AlertTriangle, Box, Clock } from 'lucide-react';
import { fetchAdminUsers, fetchAdminProducts, fetchAdminOrders, fetchMonthlyRevenue, fetchRevenueByMonth, fetchRevenueByWeek, getRevenueExcelExportUrl } from '../services/adminService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState({ months: [], totalRevenue: 0, totalOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [inStockItems, setInStockItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Chart view mode
  const [viewMode, setViewMode] = useState('by_month'); // '12months' | 'by_month' | 'by_week'
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    return monday.toISOString().split('T')[0];
  });
  const [chartData, setChartData] = useState({ items: [], totalRevenue: 0, totalOrders: 0 });
  const [chartLoading, setChartLoading] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [users, products, ordersRes, monthlyRes] = await Promise.all([
        fetchAdminUsers().catch(() => []),
        fetchAdminProducts().catch(() => []),
        fetchAdminOrders().catch(() => ({ data: [] })),
        fetchMonthlyRevenue().catch(() => ({ months: [], totalRevenue: 0, totalOrders: 0 })),
      ]);

      setUserCount(users.length);
      setProductCount(products.length);

      // 1. Đơn hàng mới (10 đơn mới nhất)
      const ordersList = ordersRes.data || ordersRes || [];
      const sortedOrders = [...ordersList]
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 10);
      setRecentOrders(sortedOrders);

      // Flatten products / variants for inventory & low stock
      const inventory = [];
      products.forEach(p => {
        if (p.Variants && p.Variants.length > 0) {
          p.Variants.forEach(v => {
            inventory.push({
              id: v._id || `${p._id}-${v.sku}`,
              name: p.name,
              sku: v.sku || v.code || 'N/A',
              price: v.price || p.price || 0,
              stock: v.stock_quantity ?? v.stock ?? 0,
            });
          });
        } else {
          inventory.push({
            id: p._id,
            name: p.name,
            sku: p.sku || p.code || p.slug || 'N/A',
            price: p.price || 0,
            stock: p.stock ?? p.stock_quantity ?? 0,
          });
        }
      });

      // 2. Tồn kho (Top 10 số lượng cao nhất)
      const topInStock = [...inventory].sort((a, b) => b.stock - a.stock).slice(0, 10);
      setInStockItems(topInStock);

      // 3. Sắp hết hàng (Top 10 số lượng thấp nhất)
      const topLowStock = [...inventory].sort((a, b) => a.stock - b.stock).slice(0, 10);
      setLowStockItems(topLowStock);

      if (monthlyRes && monthlyRes.success) {
        setMonthlyData(monthlyRes);
      }
      loadChart();
    } catch (err) {
      console.error('Lỗi load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load chart when view mode or picker changes
  const loadChart = useCallback(async () => {
    setChartLoading(true);
    try {
      if (viewMode === '12months') {
        const res = await fetchMonthlyRevenue().catch(() => null);
        if (res && res.success) setChartData({ items: res.months || [], totalRevenue: res.totalRevenue || 0, totalOrders: res.totalOrders || 0 });
      } else if (viewMode === 'by_month') {
        const res = await fetchRevenueByMonth(selectedMonth).catch(() => null);
        if (res && res.success) setChartData({ items: res.days || [], totalRevenue: res.totalRevenue || 0, totalOrders: res.totalOrders || 0 });
      } else if (viewMode === 'by_week') {
        const res = await fetchRevenueByWeek(selectedWeek).catch(() => null);
        if (res && res.success) setChartData({ items: res.days || [], totalRevenue: res.totalRevenue || 0, totalOrders: res.totalOrders || 0 });
      }
    } catch (err) {
      console.error('Lỗi load chart:', err);
    } finally {
      setChartLoading(false);
    }
  }, [viewMode, selectedMonth, selectedWeek]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);
  useEffect(() => { loadChart(); }, [loadChart]);

  const maxRevenue = Math.max(...(chartData.items || []).map(m => m.revenue), 1);

  return (
    <div className="p-8 text-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tổng quan Dashboard</h1>
          <p className="text-gray-400 text-sm">Dữ liệu quản trị thời gian thực từ hệ thống backend WINNOTECH</p>
        </div>
        <div className="flex gap-3">
          <a href={getRevenueExcelExportUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(212,255,0,0.2)]">
            <Download className="w-4 h-4" /> Xuất Excel Doanh Thu
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#141414] border border-[#333] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">TỔNG DOANH THU</div>
            <div className="text-2xl font-black text-[#d4ff00] mb-1">{(chartData.totalRevenue || 0).toLocaleString('vi-VN')}₫</div>
            <div className="text-xs text-gray-400">
              {viewMode === '12months' ? '12 tháng gần nhất' : viewMode === 'by_month' ? `Tháng ${selectedMonth.split('-').reverse().join('/')}` : 'Tuần này'}
            </div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/30" />
        </div>
        <div className="bg-[#141414] border border-[#333] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">ĐƠN HÀNG HOÀN THÀNH</div>
            <div className="text-2xl font-black text-white mb-1">{chartData.totalOrders || 0} đơn</div>
            <div className="text-xs text-green-400 font-medium">
              {viewMode === '12months' ? '12 tháng gần nhất' : viewMode === 'by_month' ? `Tháng ${selectedMonth.split('-').reverse().join('/')}` : 'Tuần này'}
            </div>
          </div>
          <ShoppingCart className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/30" />
        </div>
        <div className="bg-[#141414] border border-[#333] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">TỔNG KHÁCH HÀNG</div>
            <div className="text-2xl font-black text-white mb-1">{userCount} tài khoản</div>
            <div className="text-xs text-blue-400 font-medium">Đã đăng ký hệ thống</div>
          </div>
          <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/30" />
        </div>
        <div className="bg-[#141414] border border-[#333] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">TỔNG SẢN PHẨM</div>
            <div className="text-2xl font-black text-white mb-1">{productCount} sản phẩm</div>
            <div className="text-xs text-gray-400 font-medium">Trong kho hàng</div>
          </div>
          <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/30" />
        </div>
      </div>

      <div className="bg-[#141414] border border-[#333] rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3 border-b border-[#222] pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#d4ff00]" />
            <h3 className="text-base font-bold">
              {viewMode === '12months' ? 'Doanh Thu 12 Tháng Gần Nhất' : viewMode === 'by_month' ? `Doanh Thu Theo Ngày — ${selectedMonth.split('-').reverse().join('/')}` : 'Doanh Thu Theo Tuần'}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2">
              {[
                { value: '12months', label: '12 Tháng' },
                { value: 'by_month', label: 'Theo Tháng' },
                { value: 'by_week', label: 'Theo Tuần' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="chartViewMode"
                    value={opt.value}
                    checked={viewMode === opt.value}
                    onChange={() => setViewMode(opt.value)}
                    className="accent-[#d4ff00] w-3.5 h-3.5"
                  />
                  <span className={`text-xs font-semibold ${viewMode === opt.value ? 'text-white' : 'text-gray-400'}`}>{opt.label}</span>
                </label>
              ))}
            </div>
            {viewMode === 'by_month' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-[#141414] text-white border border-[#444] rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#666] cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            )}
            {viewMode === 'by_week' && (
              <input
                type="date"
                value={selectedWeek}
                onChange={e => setSelectedWeek(e.target.value)}
                title="Chọn ngày bất kỳ trong tuần"
                className="bg-[#141414] text-white border border-[#444] rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#666] cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            )}
          </div>
        </div>

        {(loading || chartLoading) ? (
          <div className="h-56 flex items-center justify-center text-gray-500 text-sm">Đang tải dữ liệu...</div>
        ) : chartData.items.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-gray-500 text-sm">Chưa có dữ liệu trong khoảng thời gian này</div>
        ) : (
          <div>
            <div className="flex gap-2 items-end h-52 mb-2" style={{ paddingLeft: '4px' }}>
              {chartData.items.map((m, idx) => {
                const heightPct = maxRevenue > 0 ? Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 4 : 0) : 0;
                const isHovered = hoveredMonth === idx;
                return (
                  <div
                    key={m.key}
                    className="flex-1 flex flex-col items-center justify-end h-full relative"
                    onMouseEnter={() => setHoveredMonth(idx)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isHovered && m.revenue > 0 && (
                      <div
                        className="absolute z-30 whitespace-nowrap pointer-events-none text-center"
                        style={{ bottom: `calc(${heightPct}% + 6px)`, left: '50%', transform: 'translateX(-50%)' }}
                      >
                        <div style={{ background: '#1a1a1a', border: '1px solid #4b5563', borderRadius: '8px', padding: '5px 8px', boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
                          <div style={{ color: '#e4e4e7', fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                            {m.revenue >= 1_000_000 ? `${(m.revenue / 1_000_000).toFixed(1)}tr₫` : `${m.revenue.toLocaleString('vi-VN')}₫`}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>{m.orderCount} đơn</div>
                        </div>
                        <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #4b5563', margin: '0 auto' }} />
                      </div>
                    )}
                    <div
                      className="w-full rounded-t-sm transition-all duration-150"
                      style={{
                        height: m.revenue > 0 ? `${heightPct}%` : '2px',
                        minHeight: m.revenue > 0 ? '4px' : '2px',
                        background: isHovered ? '#9ca3af' : m.revenue > 0 ? '#52525b' : '#27272a',
                        boxShadow: isHovered ? '0 0 8px rgba(156,163,175,0.3)' : 'none',
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2" style={{ paddingLeft: '4px' }}>
              {chartData.items.map(m => (
                <div key={m.key} className="flex-1 text-center" style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {viewMode === 'by_week' 
                    ? `${m.label}\n${m.date || ''}` 
                    : viewMode === 'by_month' 
                      ? m.label 
                      : m.label.slice(0, 5)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#141414] border border-[#333] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d4ff00]" /> Đơn Hàng Mới
              </h3>
              <Link to="/admin/orders" className="text-xs text-[#d4ff00] hover:underline font-semibold">
                Tất cả →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#1e1e2d] text-gray-400 uppercase text-[10px] border-b border-[#2b2b36]">
                  <tr>
                    <th className="px-3 py-2">Mã</th>
                    <th className="px-3 py-2">Ngày</th>
                    <th className="px-3 py-2 text-right">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {recentOrders.map((ord) => {
                    const dateStr = ord.createdAt || ord.date;
                    const formattedDate = dateStr
                      ? new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                      : 'N/A';
                    return (
                      <tr key={ord._id} className="hover:bg-[#1a1a24] transition-colors">
                        <td className="px-3 py-2 font-mono font-bold text-gray-300 truncate max-w-[100px]">
                          {ord.code || ord._id?.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-3 py-2 text-gray-400">{formattedDate}</td>
                        <td className="px-3 py-2 text-right text-[#d4ff00] font-bold">
                          {(ord.total_amount || 0).toLocaleString('vi-VN')}₫
                        </td>
                      </tr>
                    );
                  })}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-3 py-6 text-center text-gray-500">Chưa có đơn hàng</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#333] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-400" /> Tồn Kho
              </h3>
              <Link to="/admin/products" className="text-xs text-[#d4ff00] hover:underline font-semibold">
                Tất cả →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#1e1e2d] text-gray-400 uppercase text-[10px] border-b border-[#2b2b36]">
                  <tr>
                    <th className="px-3 py-2">Sản phẩm (SKU)</th>
                    <th className="px-3 py-2 text-right">Giá</th>
                    <th className="px-3 py-2 text-right">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {inStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a1a24] transition-colors">
                      <td className="px-3 py-2 text-gray-200 truncate max-w-[140px]" title={item.name}>
                        <div className="font-semibold truncate">{item.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">SKU: {item.sku}</div>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-300">
                        {item.price.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-blue-400">
                        {item.stock}
                      </td>
                    </tr>
                  ))}
                  {inStockItems.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-3 py-6 text-center text-gray-500">Chưa có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#333] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Sắp Hết Hàng
              </h3>
              <Link to="/admin/products" className="text-xs text-[#d4ff00] hover:underline font-semibold">
                Quản lý →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#1e1e2d] text-gray-400 uppercase text-[10px] border-b border-[#2b2b36]">
                  <tr>
                    <th className="px-3 py-2">Sản phẩm (SKU)</th>
                    <th className="px-3 py-2 text-right">Giá</th>
                    <th className="px-3 py-2 text-right">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a1a24] transition-colors">
                      <td className="px-3 py-2 text-gray-200 truncate max-w-[140px]" title={item.name}>
                        <div className="font-semibold truncate">{item.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">SKU: {item.sku}</div>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-300">
                        {item.price.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-amber-400">
                        {item.stock}
                      </td>
                    </tr>
                  ))}
                  {lowStockItems.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-3 py-6 text-center text-gray-500">Chưa có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
