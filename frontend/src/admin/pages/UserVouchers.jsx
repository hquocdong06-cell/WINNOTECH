import React, { useState, useEffect, useCallback } from 'react';
import {
  Ticket,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Edit
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchAdminUserVouchers,
  deleteAdminUserVoucher,
  fetchAdminUsers,
  API_BASE
} from '../services/adminService';
import AddUserVoucherModal from '../components/AddUserVoucherModal';
import EditUserVoucherModal from '../components/EditUserVoucherModal';

const formatPrice = (v) => {
  if (v === undefined || v === null) return '0₫';
  return Number(v).toLocaleString('vi-VN') + '₫';
};

const formatDate = (d) => {
  if (!d) return 'Vô hạn';
  try {
    return new Date(d).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return String(d);
  }
};

// ── Tính trạng thái voucher y chang section Khuyến mãi (Promotions.jsx) ──
const getVoucherStatus = (v) => {
  if (!v || !v.code) {
    return { label: 'Đã xóa', cls: 'bg-gray-800 text-gray-500 border border-gray-700' };
  }
  if (v.status === 'deactive' || (v.status === undefined && v.isActive === false)) {
    return { label: 'Chưa kích hoạt (Deactive)', cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' };
  }
  const now = new Date();
  const start = new Date(v.start_day || v.startDate);
  const end = new Date(v.end_day || v.endDate);

  if ((v.start_day || v.startDate) && now < start) {
    return { label: 'Sắp diễn ra', cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/30' };
  }
  if ((v.end_day || v.endDate) && now > end) {
    return { label: 'Đã hết hạn', cls: 'bg-gray-800 text-gray-400 border border-gray-700' };
  }
  const used = v.used_count ?? v.usedCount ?? 0;
  const limit = v.usage_limit ?? v.usageLimit;
  if (limit && used >= limit) {
    return { label: 'Đã hết lượt', cls: 'bg-red-500/10 text-red-400 border border-red-500/30' };
  }
  return { label: 'Hoạt động (Active)', cls: 'bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30' };
};

const UserVouchers = () => {
  const [userVouchers, setUserVouchers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUserVoucher, setEditingUserVoucher] = useState(null);

  // Tải dữ liệu User Vouchers và danh sách khách hàng
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [vouchersData, usersData] = await Promise.all([
        fetchAdminUserVouchers(),
        fetchAdminUsers().catch(() => [])
      ]);
      setUserVouchers(vouchersData || []);
      // Chỉ lấy role khách hàng (khác admin)
      setCustomers((usersData || []).filter((u) => u.role !== 'admin'));
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Xóa / Thu hồi voucher khỏi ví của khách hàng
  const handleDelete = async (item) => {
    const code = item.voucher_id?.code || 'này';
    const userName = item.user_id?.name || item.user_id?.email || 'khách hàng';
    if (!window.confirm(`Bạn có chắc muốn xóa voucher [${code}] khỏi ví của ${userName} không?`)) return;

    try {
      await deleteAdminUserVoucher(item._id);
      toast.success('Đã xóa voucher khỏi ví thành công!');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa voucher khỏi ví');
    }
  };

  // Áp dụng tìm kiếm & lọc trạng thái
  const filteredList = userVouchers.filter((item) => {
    const customer = item.user_id || {};
    const voucher = item.voucher_id || {};
    const matchSearch =
      (customer.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (customer.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (customer.phone || '').includes(search) ||
      (voucher.code || '').toLowerCase().includes(search.toLowerCase());

    const vStatus = getVoucherStatus(voucher);

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'used' && item.is_used) ||
      (statusFilter === 'unused' && !item.is_used) ||
      (statusFilter === 'voucher_active' && vStatus.label.includes('Active')) ||
      (statusFilter === 'voucher_deactive' && vStatus.label.includes('Deactive')) ||
      (statusFilter === 'voucher_expired' && vStatus.label.includes('hết hạn'));

    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <div>
          <h1 className="text-xl font-bold mb-0.5 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#d4ff00]" />
            Quản lý Ví Voucher Khách Hàng
          </h1>
          <p className="text-gray-400 text-xs">
            Theo dõi và cấp phát voucher trong ví — Tổng:{' '}
            <strong className="text-white">{userVouchers.length}</strong> lượt lưu ví
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black border border-[#D3FC00] text-[#D3FC00] font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(211,252,0,0.15)] hover:bg-[#D3FC00]/10"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm Voucher Vào Ví
          </button>
        </div>
      </div>

      {/* Tìm kiếm & Lọc */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng, email hoặc mã voucher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#1f1f1f] border border-[#333] rounded-lg text-xs outline-none focus:border-[#d4ff00] text-white placeholder-gray-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#d4ff00] min-w-[170px] text-white cursor-pointer"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="unused">Ví: Chưa sử dụng</option>
          <option value="used">Ví: Đã sử dụng</option>
          <option value="voucher_active">Voucher: Hoạt động (Active)</option>
          <option value="voucher_deactive">Voucher: Chưa kích hoạt (Deactive)</option>
          <option value="voucher_expired">Voucher: Đã hết hạn</option>
        </select>
      </div>

      {/* Bảng Danh sách User Voucher: Tối ưu 100% Fit màn hình */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
        <div className="w-full">
          <table className="w-full text-xs text-left table-fixed">
            <thead className="bg-[#1f1f1f] text-gray-400 uppercase border-b border-[#262626] text-[11px]">
              <tr>
                <th className="px-3 py-3 font-semibold w-[20%]">KHÁCH HÀNG</th>
                <th className="px-3 py-3 font-semibold w-[12%]">MÃ VOUCHER</th>
                <th className="px-3 py-3 font-semibold w-[14%]">MỨC GIẢM</th>
                <th className="px-3 py-3 font-semibold w-[11%]">TRẠNG THÁI VÍ</th>
                <th className="px-3 py-3 font-semibold w-[16%]">TRẠNG THÁI VOUCHER</th>
                <th className="px-3 py-3 font-semibold w-[9%]">NGÀY LƯU</th>
                <th className="px-3 py-3 font-semibold w-[9%]">HẠN DÙNG</th>
                <th className="px-3 py-3 font-semibold text-right w-[9%]">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Đang tải danh sách ví voucher...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Không tìm thấy bản ghi voucher trong ví nào.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const customer = item.user_id || {};
                  const voucher = item.voucher_id || {};
                  const isUsed = item.is_used;
                  const vStatus = getVoucherStatus(voucher);
                  const discountText =
                    (voucher.discountType || voucher.discount_type) === 'percent'
                      ? `Giảm ${voucher.discountValue || voucher.discount_value}%`
                      : `Giảm ${formatPrice(voucher.discountValue || voucher.discount_value)}`;

                  return (
                    <tr key={item._id} className="hover:bg-[#1a1a1a] transition-colors">
                      {/* Khách hàng */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={
                              customer.avatar
                                ? customer.avatar.startsWith('http')
                                  ? customer.avatar
                                  : `${API_BASE}${customer.avatar}`
                                : `https://api.dicebear.com/7.x/bottts/svg?seed=${customer.email || 'user'}`
                            }
                            alt={customer.name || customer.email}
                            className="w-7 h-7 rounded-full object-cover border border-[#444] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-white truncate text-xs" title={customer.name || 'Chưa đặt tên'}>
                              {customer.name || 'Chưa đặt tên'}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono truncate" title={customer.email || ''}>
                              {customer.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mã Voucher */}
                      <td className="px-3 py-2.5">
                        {voucher.code ? (
                          <span
                            className="px-2 py-0.5 rounded bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30 font-mono font-bold text-xs tracking-wider inline-block truncate max-w-full"
                            title={voucher.code}
                          >
                            {voucher.code}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic text-[11px]">Đã xóa</span>
                        )}
                      </td>

                      {/* Mức giảm */}
                      <td className="px-3 py-2.5">
                        {voucher.code ? (
                          <div className="leading-tight">
                            <div className="font-bold text-white text-xs">{discountText}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              Đơn từ: {formatPrice(voucher.minOrderValue || voucher.min_order || 0)}
                            </div>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Trạng thái ví - Chuẩn Ảnh 2 */}
                      <td className="px-3 py-2.5">
                        {isUsed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-400 border border-gray-700 inline-flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="w-2.5 h-2.5 text-gray-500" /> Đã dùng
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30 inline-flex items-center gap-1 whitespace-nowrap">
                            <Clock className="w-2.5 h-2.5" /> Chưa dùng
                          </span>
                        )}
                      </td>

                      {/* Trạng thái Voucher: Hiển thị y chang mục Khuyến mãi */}
                      <td className="px-3 py-2.5">
                        {voucher.code ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-block whitespace-nowrap truncate max-w-full ${vStatus.cls}`} title={vStatus.label}>
                            {vStatus.label}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Ngày thêm vào ví */}
                      <td className="px-3 py-2.5 text-gray-300 font-mono text-[11px]">
                        {formatDate(item.save_at || item.savedAt || item.createdAt)}
                      </td>

                      {/* Hạn dùng voucher */}
                      <td className="px-3 py-2.5 text-gray-400 font-mono text-[11px]">
                        {voucher.endDate || voucher.end_day ? formatDate(voucher.endDate || voucher.end_day) : 'Vô hạn'}
                      </td>

                      {/* Hành động (Sửa / Xóa) - Chuẩn Ảnh 3 */}
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Sửa: Đổi sang voucher khác */}
                          <button
                            onClick={() => setEditingUserVoucher(item)}
                            className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                            title="Đổi sang voucher khác"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Xóa: Thu hồi voucher */}
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-red-400 transition-colors"
                            title="Xóa voucher khỏi ví khách hàng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Voucher vào ví */}
      <AddUserVoucherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
        customers={customers}
      />

      {/* Modal Sửa / Đổi Voucher trong ví */}
      <EditUserVoucherModal
        isOpen={!!editingUserVoucher}
        onClose={() => setEditingUserVoucher(null)}
        onSuccess={loadData}
        userVoucher={editingUserVoucher}
      />
    </div>
  );
};

export default UserVouchers;
