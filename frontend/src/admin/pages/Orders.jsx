import React, { useState, useMemo } from 'react';
import { Search, Eye, Edit } from 'lucide-react';

const mockOrders = [
  { id: 'WIN123456', customer: 'Nguyễn Văn A', total: 18490000, status: 'Đang vận chuyển', date: '20/05/2024' },
  { id: 'WIN123455', customer: 'Trần Thị B', total: 23990000, status: 'Chờ xác nhận', date: '20/05/2024' },
  { id: 'WIN123454', customer: 'Lê Văn C', total: 12890000, status: 'Đang thanh toán', date: '20/05/2024' },
  { id: 'WIN123453', customer: 'Phạm Thị D', total: 5490000, status: 'Giao không thành công', date: '19/05/2024' },
];

const Orders = () => {
  const [orders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // Lọc đơn hàng theo tìm kiếm và trạng thái
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'Tất cả' || order.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  // Hàm lấy màu sắc cho badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đang thanh toán': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20">Đang thanh toán</span>;
      case 'Chờ xử lý':
      case 'Chờ xác nhận': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">{status}</span>;
      case 'Đang chuẩn bị hàng':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{status}</span>;
      case 'Đã bàn giao cho đơn vị vận chuyển':
      case 'Đang vận chuyển':
      case 'Đang giao hàng': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">{status}</span>;
      case 'Đã giao hàng': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">{status}</span>;
      case 'Hoàn thành': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">Hoàn thành</span>;
      case 'Đã hủy':
      case 'Giao không thành công': 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">{status}</span>;
      case 'Trả hàng/Hoàn tiền':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-500 border border-pink-500/20">{status}</span>;
      default: 
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">{status}</span>;
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
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Đang thanh toán">Đang thanh toán</option>
          <option value="Chờ xử lý">Chờ xử lý</option>
          <option value="Chờ xác nhận">Chờ xác nhận</option>
          <option value="Đang chuẩn bị hàng">Đang chuẩn bị hàng</option>
          <option value="Đã bàn giao cho đơn vị vận chuyển">Đã bàn giao cho đơn vị vận chuyển</option>
          <option value="Đang vận chuyển">Đang vận chuyển</option>
          <option value="Đang giao hàng">Đang giao hàng</option>
          <option value="Đã giao hàng">Đã giao hàng</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Đã hủy">Đã hủy</option>
          <option value="Giao không thành công">Giao không thành công</option>
          <option value="Trả hàng/Hoàn tiền">Trả hàng/Hoàn tiền</option>
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
