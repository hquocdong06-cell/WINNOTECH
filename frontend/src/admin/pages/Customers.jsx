import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, UserCheck, UserX, Trash2, Lock, Unlock, RefreshCw, AlertTriangle, ShieldCheck, Mail, Phone, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAdminUsers, createAdminUser, updateAdminUserStatus, deleteAdminUser } from '../services/adminService';

// Modal Thêm User mới
const UserFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Vui lòng nhập Email và Mật khẩu!');
      return;
    }
    setLoading(true);
    try {
      const res = await createAdminUser(formData);
      if (res.success) {
        toast.success('Tạo người dùng mới thành công!');
        onSuccess();
      } else {
        toast.error(res.message || 'Tạo người dùng thất bại');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#14141d] border border-[#333] rounded-2xl w-full max-w-md p-6 text-white shadow-2xl">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#d4ff00]" /> Thêm Tài Khoản Mới
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1">Họ và tên</label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 outline-none focus:border-[#d4ff00]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1">Email (*)</label>
            <input
              type="email"
              required
              placeholder="user@gmail.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 outline-none focus:border-[#d4ff00]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1">Số điện thoại</label>
            <input
              type="text"
              placeholder="0987654321"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 outline-none focus:border-[#d4ff00]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1">Mật khẩu (*)</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 outline-none focus:border-[#d4ff00]"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1">Vai trò</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 outline-none focus:border-[#d4ff00]"
            >
              <option value="customer">Khách hàng (customer)</option>
              <option value="admin">Quản trị viên (admin)</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#222] border border-[#444] rounded-xl text-gray-300 font-semibold hover:bg-[#333]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-xl flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Không thể tải danh sách người dùng: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn XÓA MỀM tài khoản "${user.email}"?`)) return;
    try {
      await deleteAdminUser(user._id);
      toast.success('Xóa người dùng thành công!');
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa người dùng');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Khách hàng & Tài khoản</h1>
          <p className="text-gray-400 text-sm">Dữ liệu tài khoản thực tế từ hệ thống MongoDB — Tổng: <strong>{users.length}</strong> tài khoản</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#222] border border-[#333] hover:bg-[#333] text-white font-medium rounded-xl transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(212,255,0,0.2)]"
          >
            <Plus className="w-5 h-5" /> Thêm tài khoản
          </button>
        </div>
      </div>

      {/* Tìm kiếm & Lọc */}
      <div className="bg-[#14141d] border border-[#333] rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e2d] border border-[#333] rounded-xl text-sm outline-none focus:border-[#d4ff00]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] min-w-[180px]"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="customer">Khách hàng (customer)</option>
          <option value="admin">Quản trị viên (admin)</option>
        </select>
      </div>

      {/* Bảng Danh sách Người Dùng */}
      <div className="bg-[#14141d] border border-[#333] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1e1e2d] text-gray-400 text-xs uppercase border-b border-[#333]">
              <tr>
                <th className="px-6 py-4 font-semibold">TÀI KHOẢN</th>
                <th className="px-6 py-4 font-semibold">EMAIL</th>
                <th className="px-6 py-4 font-semibold">SĐT</th>
                <th className="px-6 py-4 font-semibold">VAI TRÒ</th>
                <th className="px-6 py-4 font-semibold">TRẠNG THÁI</th>
                <th className="px-6 py-4 font-semibold text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Đang tải danh sách tài khoản...</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#1a1a24] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar ? (u.avatar.startsWith('http') ? u.avatar : `http://localhost:3000${u.avatar}`) : `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                          alt={u.name || u.email}
                          className="w-10 h-10 rounded-full object-cover border border-[#444]"
                        />
                        <div>
                          <div className="font-bold text-white">{u.name || 'Chưa đặt tên'}</div>
                          <div className="text-xs text-gray-400 font-mono">ID: {u._id?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500" /> {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {u.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-500" /> {u.phone}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> ADMIN
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                          Khách hàng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.status === 'locked' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Đã Khóa
                        </span>
                      ) : u.status === 'inactive' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-800 text-gray-400 border border-gray-700">
                          Đã ẩn / Tắt
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-500/10 text-green-400 border border-green-500/30 inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-2 rounded-lg border transition-colors ${
                            u.status === 'locked'
                              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                          }`}
                          title={u.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {u.status === 'locked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors"
                          title="Xóa tài khoản (Soft Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Không tìm thấy tài khoản nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          loadUsers();
        }}
      />
    </div>
  );
};

export default Customers;
