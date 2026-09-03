import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  UserCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  ShoppingBag,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchAdminUsers,
  updateAdminUserStatus,
  API_BASE
} from '../services/adminService';
import UserOrdersModal from '../components/UserOrdersModal';

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUserForOrders, setSelectedUserForOrders] = useState(null);

  // Tải danh sách người dùng từ API
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách khách hàng: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Khóa / Mở khóa tài khoản khách hàng
  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'locked' ? 'active' : 'locked';
    const actionText = nextStatus === 'locked' ? 'Khóa' : 'Mở khóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản "${user.email}" không?`)) return;

    try {
      await updateAdminUserStatus(user._id, nextStatus);
      toast.success(`${actionText} tài khoản thành công!`);
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Lỗi đổi trạng thái');
    }
  };

  // Chỉ lấy tài khoản KHÁCH HÀNG (LOẠI BỎ HOÀN TOÀN ADMIN)
  const customerUsers = users.filter((u) => u.role !== 'admin');

  // Lọc theo tìm kiếm & trạng thái hoạt động
  const filteredCustomers = customerUsers.filter((u) => {
    const matchSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search);
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-[#d4ff00]" />
            Quản lý Khách Hàng
          </h1>
        </div>
      </div>

      {/* Tìm kiếm & Lọc (Giao diện tối giản) */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm khách hàng theo tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1f1f1f] border border-[#333] rounded-lg text-xs outline-none focus:border-[#d4ff00] text-white placeholder-gray-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#d4ff00] min-w-[170px] text-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>
      </div>

      {/* Bảng Danh sách Khách hàng */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1f1f1f] text-gray-400 uppercase border-b border-[#262626]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">KHÁCH HÀNG</th>
                <th className="px-6 py-3.5 font-semibold">EMAIL</th>
                <th className="px-6 py-3.5 font-semibold">SĐT</th>
                <th className="px-6 py-3.5 font-semibold whitespace-nowrap">VAI TRÒ</th>
                <th className="px-6 py-3.5 font-semibold whitespace-nowrap">TRẠNG THÁI</th>
                <th className="px-6 py-3.5 font-semibold text-right whitespace-nowrap">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Đang tải danh sách khách hàng...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy khách hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#1a1a1a] transition-colors">
                    {/* Khách hàng - Canh thẳng hàng từ trên xuống dưới */}
                    <td className="px-6 py-3.5">
                      <div
                        onClick={() => setSelectedUserForOrders(u)}
                        className="flex items-center gap-3 cursor-pointer group w-fit"
                        title={`Click để xem tất cả đơn hàng của ${u.name || u.email}`}
                      >
                        {/* Khung avatar kích thước cố định, chống lệch dòng */}
                        <div className="w-10 h-10 rounded-full bg-[#222] border border-[#333] flex items-center justify-center shrink-0 overflow-hidden relative group-hover:border-[#d4ff00] transition-colors">
                          <span className="text-xs font-bold text-[#d4ff00] uppercase select-none">
                            {(u.name || u.email || 'U').charAt(0)}
                          </span>
                          {u.avatar && (
                            <img
                              src={u.avatar.startsWith('http') ? u.avatar : `${API_BASE}${u.avatar}`}
                              alt=""
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              className="w-full h-full object-cover absolute inset-0"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white group-hover:text-[#d4ff00] transition-colors truncate text-sm">
                            {u.name || 'Chưa đặt tên'}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            ID: {u._id?.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-3.5 text-gray-300 font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500" /> {u.email}
                      </div>
                    </td>

                    {/* SĐT */}
                    <td className="px-6 py-3.5 text-gray-400 font-mono whitespace-nowrap">
                      {u.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-500" /> {u.phone}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Vai trò */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#222] text-gray-300 border border-[#333] inline-flex items-center">
                        Khách hàng
                      </span>
                    </td>

                    {/* Trạng thái - Chuẩn Ảnh 2 */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {u.status === 'locked' ? (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-red-500/10 text-red-400 border border-red-500/30">
                          Đã Khóa
                        </span>
                      ) : u.status === 'inactive' ? (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-gray-800 text-gray-400 border border-gray-700">
                          Đã ẩn
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30">
                          Hoạt động
                        </span>
                      )}
                    </td>

                    {/* Hành động - Chuẩn Ảnh 3 */}
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Nút 1: Xem đơn hàng */}
                        <button
                          onClick={() => setSelectedUserForOrders(u)}
                          className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-[#d4ff00] transition-colors"
                          title="Xem lịch sử đơn hàng của người dùng"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>

                        {/* Nút 2: Thay đổi status (Khóa / Mở khóa) */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                          title={u.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {u.status === 'locked' ? (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-[#d4ff00]" />
                          )}
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

      {/* Modal xem đơn hàng của khách hàng */}
      <UserOrdersModal
        isOpen={!!selectedUserForOrders}
        onClose={() => setSelectedUserForOrders(null)}
        user={selectedUserForOrders}
      />
    </div>
  );
};

export default Customers;
