import React, { useState, useMemo } from 'react';
import { Search, Edit, Eye, EyeOff, Trash2, Users, Download, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

const initialCustomers = [
  { id: 'CUS-001', name: 'Nguyễn Văn A', email: 'anv@gmail.com', phone: '0901234567', orders: 5, spent: 45000000, avatar: 'https://i.pravatar.cc/150?u=1', status: 'active', date: '2023-10-15' },
  { id: 'CUS-002', name: 'Trần Thị B', email: 'bt@gmail.com', phone: '0912345678', orders: 2, spent: 12500000, avatar: 'https://i.pravatar.cc/150?u=2', status: 'active', date: '2023-11-20' },
  { id: 'CUS-003', name: 'Lê Văn C', email: 'clv@gmail.com', phone: '0987654321', orders: 12, spent: 156000000, avatar: 'https://i.pravatar.cc/150?u=3', status: 'locked', date: '2023-12-05' },
  { id: 'CUS-004', name: 'Phạm Minh D', email: 'dpm@gmail.com', phone: '0933445566', orders: 0, spent: 0, avatar: 'https://i.pravatar.cc/150?u=4', status: 'active', date: '2024-01-10' },
  { id: 'CUS-005', name: 'Hoàng Ngọc E', email: 'ehn@gmail.com', phone: '0944556677', orders: 8, spent: 89000000, avatar: 'https://i.pravatar.cc/150?u=5', status: 'active', date: '2024-02-18' },
];

const Customers = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const handleToggleStatus = (id) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'active' ? 'locked' : 'active';
        toast.success(`Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản ${c.name}`);
        return { ...c, status: newStatus };
      }
      return c;
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast.success('Đã xóa khách hàng thành công');
    }
  };

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Khách hàng</h1>
          <p className="text-gray-400 text-sm">Tổng số: {customers.length} khách hàng trong hệ thống</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#222] hover:bg-[#333] border border-[#333] text-white font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(212,255,0,0.2)]">
            <UserPlus className="w-5 h-5" /> Thêm Khách hàng
          </button>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">TỔNG KHÁCH HÀNG</div>
            <div className="text-2xl font-bold text-white mb-2">{customers.length}</div>
          </div>
          <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-800/50" />
        </div>
        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">ĐANG HOẠT ĐỘNG</div>
            <div className="text-2xl font-bold text-green-400 mb-2">{customers.filter(c => c.status === 'active').length}</div>
          </div>
          <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-green-900/20" />
        </div>
        <div className="bg-[#141414] border border-[#333] p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">ĐÃ KHÓA</div>
            <div className="text-2xl font-bold text-red-400 mb-2">{customers.filter(c => c.status === 'locked').length}</div>
          </div>
          <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-red-900/20" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white transition-colors"
          />
        </div>
        <div className="flex gap-4 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1e1e1e] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Bị khóa</option>
          </select>
          <span className="text-sm text-gray-500">{filteredCustomers.length} kết quả</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">KHÁCH HÀNG</th>
              <th className="px-6 py-4 font-medium">LIÊN HỆ</th>
              <th className="px-6 py-4 font-medium">ĐƠN HÀNG</th>
              <th className="px-6 py-4 font-medium">CHI TIÊU</th>
              <th className="px-6 py-4 font-medium">TRẠNG THÁI</th>
              <th className="px-6 py-4 font-medium text-right">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                  Không tìm thấy khách hàng nào.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full border border-[#333]" />
                      <div>
                        <div className="font-semibold text-white">{c.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <div>{c.email}</div>
                    <div className="text-xs text-gray-500 mt-1">{c.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-300">{c.orders} đơn</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#d4ff00]">{c.spent.toLocaleString('vi-VN')}₫</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${c.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {c.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-blue-400 transition-colors" title="Sửa">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(c.id)}
                        className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-white transition-colors" 
                        title={c.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                      >
                        {c.status === 'active' ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 bg-[#222] hover:bg-red-500/20 border border-[#444] hover:border-red-500/50 rounded-md text-gray-300 hover:text-red-500 transition-colors" 
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
