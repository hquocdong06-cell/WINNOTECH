import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, Edit, RefreshCw } from 'lucide-react';
import { orderAPI } from '../../services/apiService';

// Map enum tiếng Anh → nhãn tiếng Việt (đồng bộ với Order model)
const STATUS_LABELS = {
  pending:      'Chờ xác nhận',
  preparing:    'Đang chuẩn bị hàng',
  handed_over:  'Đã bàn giao vận chuyển',
  shipping:     'Đang vận chuyển',
  delivering:   'Đang giao hàng',
  completed:    'Hoàn thành',
  canceled:     'Đã hủy',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [counts, setCounts] = useState({});

  // ── Fetch orders từ API thật ──
  const fetchOrders = async (status) => {
    setLoading(true);
    setError('');
    try {
      const data = await orderAPI.getOrders(status);
      if (data.success) {
        // Flatten data: thêm tên khách hàng từ Name field
        const mapped = (data.data || []).map(o => ({
          id: o._id,
          code: o.code || o._id?.slice(-8).toUpperCase(),
          customer: o.Name || '—',
          phone: o.Phone || '—',
          total: o.total_amount || 0,
          status: o.status,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '—',
          payment_method: o.payment_method,
          itemCount: (o.items || []).length,
        }));
        setOrders(mapped);
        setCounts(data.counts || {});
      }
    } catch (err) {
      setError(err.message || 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders('all');
  }, []);

  // ── Lọc đơn hàng theo tìm kiếm ──
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch =
        order.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone?.includes(searchQuery);
      const matchStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  // ── Hàm lấy màu sắc cho badge trạng thái ──
  const getStatusBadge = (status) => {
    const label = STATUS_LABELS[status] || status;
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">{label}</span>;
      case 'preparing':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{label}</span>;
      case 'handed_over':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">{label}</span>;
      case 'shipping':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">{label}</span>;
      case 'delivering':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">{label}</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">{label}</span>;
      case 'canceled':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">{label}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">{label}</span>;
    }
  };

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Đơn hàng</h1>
          <p className="text-gray-400 text-sm">Dữ liệu thực từ database — Tổng: <strong>{counts.all || orders.length}</strong> đơn</p>
        </div>
        <button
          onClick={() => fetchOrders('all')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#222] border border-[#333] hover:bg-[#333] text-white font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Thống kê nhanh theo status */}
      {Object.keys(counts).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`p-3 rounded-xl border text-center transition-all ${filterStatus === key ? 'border-[#d4ff00] bg-[#d4ff00]/10' : 'border-[#333] bg-[#141414] hover:bg-[#1e1e1e]'}`}
            >
              <div className="text-xl font-bold">{counts[key] || 0}</div>
              <div className="text-xs text-gray-400 mt-1 leading-tight">{label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Thanh tìm kiếm & Lọc */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách hàng, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#1e1e1e] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none min-w-[200px]"
        >
          <option value="all">Tất cả trạng thái ({counts.all || orders.length})</option>
          <option value="pending">Chờ xác nhận ({counts.pending || 0})</option>
          <option value="preparing">Đang chuẩn bị hàng ({counts.preparing || 0})</option>
          <option value="handed_over">Đã bàn giao vận chuyển ({counts.handed_over || 0})</option>
          <option value="shipping">Đang vận chuyển ({counts.shipping || 0})</option>
          <option value="delivering">Đang giao hàng ({counts.delivering || 0})</option>
          <option value="completed">Hoàn thành ({counts.completed || 0})</option>
          <option value="canceled">Đã hủy ({counts.canceled || 0})</option>
        </select>
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">MÃ ĐƠN</th>
              <th className="px-6 py-4 font-medium">KHÁCH HÀNG</th>
              <th className="px-6 py-4 font-medium">SĐT</th>
              <th className="px-6 py-4 font-medium">TỔNG TIỀN</th>
              <th className="px-6 py-4 font-medium">TRẠNG THÁI</th>
              <th className="px-6 py-4 font-medium">NGÀY TẠO</th>
              <th className="px-6 py-4 font-medium text-right">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Đang tải...</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-200 font-mono text-xs">{order.code}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-400">{order.phone}</td>
                  <td className="px-6 py-4 text-[#d4ff00] font-medium">{order.total.toLocaleString('vi-VN')}₫</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-gray-400">{order.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-white transition-colors" title="Xem chi tiết">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-blue-400 transition-colors" title="Sửa đơn hàng">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loading && filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
