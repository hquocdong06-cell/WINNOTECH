import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Eye, Edit, RefreshCw, FileText, Trash2, X, Check, Clock, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAdminOrders, updateAdminOrderStatus, deleteAdminOrder, getOrderPdfUrl } from '../services/adminService';

const STATUS_LABELS = {
  pending:      'Chờ xác nhận',
  preparing:    'Đang chuẩn bị hàng',
  handed_over:  'Đã bàn giao vận chuyển',
  shipping:     'Đang vận chuyển',
  delivering:   'Đang giao hàng',
  completed:    'Hoàn thành',
  canceled:     'Đã hủy',
};

// Modal Xem Chi Tiết Đơn Hàng
const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#14141d] border border-[#333] rounded-2xl w-full max-w-2xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-[#2b2b36] mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              Chi Tiết Đơn Hàng <span className="font-mono text-[#d4ff00]">#{order.code || order._id?.slice(-8).toUpperCase()}</span>
            </h3>
            <span className="text-xs text-gray-400">Ngày tạo: {order.date}</span>
          </div>
          <button onClick={onClose} className="p-1.5 bg-[#222] hover:bg-[#333] rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin khách hàng & Giao hàng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-[#1a1a24] p-4 rounded-xl border border-[#2b2b36] text-xs">
          <div>
            <div className="text-gray-400 font-semibold mb-1">THÔNG TIN KHÁCH HÀNG</div>
            <div className="font-bold text-sm text-white">{order.customer || '—'}</div>
            <div className="text-gray-300 mt-1">SĐT: {order.phone || '—'}</div>
            <div className="text-gray-300">Email: {order.rawOrder?.Email || order.rawOrder?.user_id?.email || '—'}</div>
          </div>
          <div>
            <div className="text-gray-400 font-semibold mb-1">ĐỊA CHỈ & THANH TOÁN</div>
            <div className="text-gray-200">{order.rawOrder?.Address || 'Thanh toán trực tiếp'}</div>
            <div className="mt-1">
              PTTT: <span className="font-semibold text-white uppercase">{order.payment_method || 'COD'}</span>
            </div>
            <div>
              TT Thanh toán: <span className={`font-bold ${order.rawOrder?.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                {order.rawOrder?.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm trong đơn */}
        <div className="mb-6">
          <h4 className="text-sm font-bold mb-3 text-gray-300">DANH SÁCH SẢN PHẨM</h4>
          <div className="space-y-2">
            {(order.rawOrder?.items || []).map((item, idx) => {
              const variant = item.variants_id || {};
              const product = variant.p_id || {};
              return (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[#1e1e2d] rounded-xl border border-[#333] text-xs">
                  <img
                    src={product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:3000${product.image}`) : 'https://placehold.co/80'}
                    alt={product.name || 'Sản phẩm'}
                    className="w-12 h-12 object-cover rounded-lg border border-[#444]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{product.name || 'Sản phẩm kho'}</div>
                    <div className="text-gray-400">{variant.variant_name || 'Phiên bản chuẩn'} (SKU: {variant.sku || 'N/A'})</div>
                    <div className="text-gray-400">Số lượng: <span className="font-bold text-white">{item.quantity || 1}</span></div>
                  </div>
                  <div className="text-right font-bold text-[#d4ff00]">
                    {((item.price || variant.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}₫
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tổng tiền & Action */}
        <div className="flex justify-between items-center pt-4 border-t border-[#2b2b36]">
          <div>
            <span className="text-xs text-gray-400">TỔNG TIỀN ĐƠN HÀNG:</span>
            <div className="text-xl font-black text-[#d4ff00]">
              {(order.total || 0).toLocaleString('vi-VN')}₫
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href={getOrderPdfUrl(order.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-xl text-xs font-bold text-white transition-colors"
            >
              <FileText className="w-4 h-4 text-[#d4ff00]" /> In Hóa Đơn PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Cập Nhật Trạng Thái
const OrderStatusModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [status, setStatus] = useState(order?.status || 'pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) setStatus(order.status);
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateAdminOrderStatus(order.id, status);
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#14141d] border border-[#333] rounded-2xl w-full max-w-sm p-6 text-white shadow-2xl">
        <h3 className="text-lg font-bold mb-4">Cập Nhật Trạng Thái Đơn Hàng</h3>
        <p className="text-xs text-gray-400 mb-4">Mã đơn: <span className="font-mono text-white font-bold">#{order.code}</span></p>
        
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] mb-6"
        >
          {Object.entries(STATUS_LABELS).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-[#222] border border-[#444] rounded-xl text-xs font-semibold text-gray-300 hover:bg-[#333]">
            Hủy
          </button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-xl text-xs">
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [counts, setCounts] = useState({});

  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [selectedOrderEdit, setSelectedOrderEdit] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminOrders();
      if (data.success) {
        const mapped = (data.data || []).map(o => ({
          id: o._id,
          code: o.code || o._id?.slice(-8).toUpperCase(),
          customer: o.Name || o.user_id?.name || 'Khách vãng lai',
          phone: o.Phone || o.user_id?.phone || '—',
          total: o.total_amount || 0,
          status: o.status,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '—',
          payment_method: o.payment_method,
          itemCount: (o.items || []).length,
          rawOrder: o,
        }));
        setOrders(mapped);
        setCounts(data.counts || {});
      }
    } catch (err) {
      setError(err.message || 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Bạn có chắc muốn HỦY ĐƠN HÀNG #${order.code}?`)) return;
    try {
      await deleteAdminOrder(order.id);
      toast.success('Hủy đơn hàng thành công!');
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Lỗi hủy đơn');
    }
  };

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

  const getStatusBadge = (status) => {
    const label = STATUS_LABELS[status] || status;
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">{label}</span>;
      case 'preparing':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">{label}</span>;
      case 'handed_over':
      case 'shipping':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">{label}</span>;
      case 'delivering':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">{label}</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/30">{label}</span>;
      case 'canceled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">{label}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/30">{label}</span>;
    }
  };

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Đơn hàng</h1>
          <p className="text-gray-400 text-sm">Dữ liệu đơn hàng thời gian thực — Tổng: <strong>{orders.length}</strong> đơn</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#222] border border-[#333] hover:bg-[#333] text-white font-medium rounded-xl transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
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
              className={`p-3 rounded-2xl border text-center transition-all ${filterStatus === key ? 'border-[#d4ff00] bg-[#d4ff00]/10' : 'border-[#333] bg-[#14141d] hover:bg-[#1a1a24]'}`}
            >
              <div className="text-xl font-bold text-white">{counts[key] || 0}</div>
              <div className="text-xs text-gray-400 mt-1 leading-tight">{label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Thanh tìm kiếm & Lọc */}
      <div className="bg-[#14141d] border border-[#333] rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách hàng, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e2d] border border-[#333] rounded-xl text-sm outline-none focus:border-[#d4ff00]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] min-w-[200px]"
        >
          <option value="all">Tất cả trạng thái ({orders.length})</option>
          {Object.entries(STATUS_LABELS).map(([k, label]) => (
            <option key={k} value={k}>{label} ({counts[k] || 0})</option>
          ))}
        </select>
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-[#14141d] border border-[#333] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1e1e2d] text-gray-400 text-xs uppercase border-b border-[#333]">
              <tr>
                <th className="px-6 py-4 font-semibold">MÃ ĐƠN</th>
                <th className="px-6 py-4 font-semibold">KHÁCH HÀNG</th>
                <th className="px-6 py-4 font-semibold">SĐT</th>
                <th className="px-6 py-4 font-semibold">TỔNG TIỀN</th>
                <th className="px-6 py-4 font-semibold">TRẠNG THÁI</th>
                <th className="px-6 py-4 font-semibold">NGÀY TẠO</th>
                <th className="px-6 py-4 font-semibold text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Đang tải danh sách đơn hàng...</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#1a1a24] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#d4ff00] font-mono text-xs">{order.code}</td>
                    <td className="px-6 py-4 font-semibold text-white">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{order.phone}</td>
                    <td className="px-6 py-4 text-white font-bold">{order.total.toLocaleString('vi-VN')}₫</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{order.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrderDetail(order)}
                          className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedOrderEdit(order)}
                          className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-[#d4ff00] transition-colors"
                          title="Cập nhật trạng thái"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <a
                          href={getOrderPdfUrl(order.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-blue-400 transition-colors"
                          title="In hóa đơn PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                        {order.status !== 'canceled' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors"
                            title="Hủy đơn hàng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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

      <OrderDetailModal
        isOpen={!!selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
        order={selectedOrderDetail}
      />

      <OrderStatusModal
        isOpen={!!selectedOrderEdit}
        onClose={() => setSelectedOrderEdit(null)}
        order={selectedOrderEdit}
        onSuccess={() => {
          setSelectedOrderEdit(null);
          fetchOrders();
        }}
      />
    </div>
  );
};

export default Orders;
