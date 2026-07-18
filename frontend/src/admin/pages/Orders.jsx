import React, { useState, useMemo } from 'react';
import { Search, Eye, Edit } from 'lucide-react';

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

const mockOrders = [
  { id: 'WIN123456', customer: 'Nguyễn Văn A', total: 18490000, status: 'shipping',  date: '20/05/2024' },
  { id: 'WIN123455', customer: 'Trần Thị B',   total: 23990000, status: 'pending',   date: '20/05/2024' },
  { id: 'WIN123454', customer: 'Lê Văn C',     total: 12890000, status: 'preparing', date: '20/05/2024' },
  { id: 'WIN123453', customer: 'Phạm Thị D',   total: 5490000,  status: 'canceled',  date: '19/05/2024' },
];

const Orders = () => {
  const [orders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Lọc đơn hàng theo tìm kiếm và trạng thái
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  // Hàm lấy màu sắc cho badge trạng thái
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
          <p className="text-gray-400 text-sm">Danh sách đơn hàng đơn giản, dễ hiểu</p>
        </div>
        <button className="px-5 py-2.5 bg-[#222] border border-[#333] hover:bg-[#333] text-white font-medium rounded-lg transition-colors">
          Xuất báo cáo
        </button>
      </div>

      {/* Thanh tìm kiếm & Lọc */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách hàng..."
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
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="preparing">Đang chuẩn bị hàng</option>
          <option value="handed_over">Đã bàn giao vận chuyển</option>
          <option value="shipping">Đang vận chuyển</option>
          <option value="delivering">Đang giao hàng</option>
          <option value="completed">Hoàn thành</option>
          <option value="canceled">Đã hủy</option>
        </select>
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">MÃ ĐƠN</th>
              <th className="px-6 py-4 font-medium">KHÁCH HÀNG</th>
              <th className="px-6 py-4 font-medium">TỔNG TIỀN</th>
              <th className="px-6 py-4 font-medium">TRẠNG THÁI</th>
              <th className="px-6 py-4 font-medium">NGÀY TẠO</th>
              <th className="px-6 py-4 font-medium text-right">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[#1e1e1e] transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-200">#{order.id}</td>
                <td className="px-6 py-4">{order.customer}</td>
                <td className="px-6 py-4 text-[#d4ff00] font-medium">{order.total.toLocaleString('vi-VN')}₫</td>
                <td className="px-6 py-4">
                  {getStatusBadge(order.status)}
                </td>
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
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
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
