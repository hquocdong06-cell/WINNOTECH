import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Download, RefreshCw, Eye } from 'lucide-react';
import { fetchRevenueStats, getRevenueExcelExportUrl, fetchAdminUsers, fetchAdminProducts, fetchAdminOrders, API_BASE } from '../services/adminService';
import { Link } from 'react-router-dom';

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  preparing: 'Chuẩn bị hàng',
  handed_over: 'Bàn giao VC',
  shipping: 'Đang vận chuyển',
  delivering: 'Đang giao',
  completed: 'Hoàn thành',
  canceled: 'Đã hủy',
};

const Dashboard = () => {
  const [revenueTab, setRevenueTab] = useState('month'); // 'day' | 'week' | 'month' | 'year'
  const [revenueData, setRevenueData] = useState({ summary: {}, breakdown: [] });
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, users, products, ordersRes] = await Promise.all([
        fetchRevenueStats(revenueTab).catch(() => ({ summary: {}, breakdown: [] })),
        fetchAdminUsers().catch(() => []),
        fetchAdminProducts().catch(() => []),
        fetchAdminOrders().catch(() => ({ data: [] })),
      ]);

      if (statsRes.success) {
        setRevenueData(statsRes);
      } else {
        setRevenueData({ summary: statsRes.summary || {}, breakdown: statsRes.breakdown || [] });
      }

      setUserCount(users.length);
      setProductCount(products.length);

      const ordersList = ordersRes.data || ordersRes || [];
      setRecentOrders(ordersList.slice(0, 6));

      // Calculate Top Best Sellers from products or orders
      const sortedProducts = [...products]
        .sort((a, b) => (b.sold_quantity || b.buyturn || 0) - (a.sold_quantity || a.buyturn || 0))
        .slice(0, 4);
      setBestSellers(sortedProducts);
    } catch (err) {
      console.error('Lỗi load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [revenueTab]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const maxRevenue = Math.max(...(revenueData.breakdown || []).map(b => b.revenue), 1);

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tổng quan Dashboard</h1>
          <p className="text-gray-400 text-sm">Dữ liệu quản trị thời gian thực từ hệ thống backend WINNOTECH</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#222] border border-[#333] hover:bg-[#333] text-white font-medium rounded-xl transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </button>
          <a
            href={getRevenueExcelExportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(212,255,0,0.2)]"
          >
            <Download className="w-4 h-4" /> Xuất Excel Doanh Thu
          </a>
        </div>
      </div>

      {/* 4 Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#141414] border border-[#333] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">TỔNG DOANH THU</div>
            <div className="text-2xl font-black text-[#d4ff00] mb-1">
              {(revenueData.summary?.totalRevenue || 0).toLocaleString('vi-VN')}₫
            </div>
            <div className="text-xs text-gray-400">
              TB đơn: <span className="text-white font-medium">{(revenueData.summary?.avgOrderValue || 0).toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/30" />
        </div>

        <div className="bg-[#141414] border border-[#333] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">ĐƠN HÀNG ĐÃ THANH TOÁN</div>
            <div className="text-2xl font-black text-white mb-1">
              {revenueData.summary?.totalPaidOrders || 0} đơn
            </div>
            <div className="text-xs text-green-400 font-medium">Từ dữ liệu thực tế</div>
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
            <div className="text-xs text-purple-400 font-medium">Trong kho hàng</div>
          </div>
          <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/30" />
        </div>
      </div>

      {/* Biểu đồ Doanh thu (Ngày / Tuần / Tháng / Năm) */}
      <div className="bg-[#141414] border border-[#333] rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-[#2b2b36] pb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#d4ff00]" /> Phân Tích Doanh Thu
          </h3>
          <div className="flex bg-[#1e1e2d] p-1 rounded-xl border border-[#333]">
            {[
              { id: 'day', label: 'Theo Ngày' },
              { id: 'week', label: 'Theo Tuần' },
              { id: 'month', label: 'Theo Tháng' },
              { id: 'year', label: 'Theo Năm' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setRevenueTab(t.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  revenueTab === t.id ? 'bg-[#d4ff00] text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Chart Container */}
        {revenueData.breakdown && revenueData.breakdown.length > 0 ? (
          <div className="h-64 flex items-end gap-3 pt-8 pb-4 px-2 overflow-x-auto">
            {revenueData.breakdown.map((item, idx) => {
              const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 5);
              return (
                <div key={idx} className="flex-1 min-w-[50px] flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-[#d4ff00] text-white text-[11px] py-1 px-2.5 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-xl">
                    <div className="font-bold text-[#d4ff00]">{item.period}</div>
                    <div>{item.revenue.toLocaleString('vi-VN')}₫ ({item.orderCount} đơn)</div>
                  </div>
                  {/* Bar */}
                  <div className="w-full bg-[#1e1e2d] rounded-t-lg h-full flex items-end overflow-hidden p-1">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-[#d4ff00]/20 to-[#d4ff00] rounded-t border-t-2 border-[#d4ff00] group-hover:brightness-125 transition-all"
                    ></div>
                  </div>
                  <span className="text-[11px] text-gray-400 truncate w-full text-center font-mono">
                    {item.period.replace(/^.*?-/, '')}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            {loading ? 'Đang tải dữ liệu thống kê...' : 'Chưa có dữ liệu giao dịch trong khoảng thời gian này'}
          </div>
        )}
      </div>

      {/* Grid: Đơn Hàng Mới Nhất & Sản Phẩm Bán Chạy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Đơn hàng gần đây */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#333] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Đơn Hàng Gần Đây</h3>
            <Link to="/admin/orders" className="text-xs text-[#d4ff00] hover:underline font-semibold">
              Xem tất cả đơn hàng →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1e1e2d] text-gray-400 text-xs uppercase border-b border-[#333]">
                <tr>
                  <th className="px-4 py-3">Mã Đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[#1a1a24] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-300">
                      {ord.code || ord._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-200">{ord.Name || ord.user_id?.name || 'Khách vãng lai'}</td>
                    <td className="px-4 py-3 text-[#d4ff00] font-bold">
                      {(ord.total_amount || 0).toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#222] border border-[#444] text-gray-300">
                        {STATUS_LABELS[ord.status] || ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500">Chưa có đơn hàng nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sản phẩm Nổi Bật / Bán Chạy */}
        <div className="bg-[#141414] border border-[#333] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Sản Phẩm Trong Kho</h3>
            <Link to="/admin/products" className="text-xs text-[#d4ff00] hover:underline font-semibold">
              Quản lý kho →
            </Link>
          </div>
          <div className="space-y-4">
            {bestSellers.map((prod) => (
              <div key={prod._id} className="flex items-center gap-3 p-3 bg-[#1a1a24] rounded-xl border border-[#2b2b36]">
                <img
                  src={prod.image ? (prod.image.startsWith('http') ? prod.image : `${API_BASE}${prod.image}`) : 'https://placehold.co/100'}
                  alt={prod.name}
                  className="w-12 h-12 object-cover rounded-lg border border-[#333]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{prod.name}</div>
                  <div className="text-xs text-[#d4ff00] font-semibold">
                    {(prod.sale_price || prod.price || 0).toLocaleString('vi-VN')}₫
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Tồn kho</span>
                  <span className="text-sm font-bold text-white">{prod.stock_quantity ?? prod.stock ?? 0}</span>
                </div>
              </div>
            ))}
            {bestSellers.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">Chưa có sản phẩm</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
