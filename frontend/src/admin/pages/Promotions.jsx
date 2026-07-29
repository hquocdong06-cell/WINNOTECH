import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import PromotionFormModal from '../components/PromotionFormModal';
import { voucherAPI } from '../../services/apiService';

const Promotions = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  // ── Lấy danh sách voucher từ API thật ──
  const fetchVouchers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await voucherAPI.getAll();
      setVouchers(data.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // ── Xóa voucher ──
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa voucher này không?')) return;
    try {
      await voucherAPI.delete(id);
      setVouchers(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      alert(err.message || 'Lỗi xóa voucher');
    }
  };

  const handleOpenAddModal = () => {
    setEditingPromo(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo) => {
    setEditingPromo(promo);
    setIsModalOpen(true);
  };

  // ── Tính trạng thái voucher ──
  const getVoucherStatus = (v) => {
    const now = new Date();
    const start = new Date(v.start_day);
    const end = new Date(v.end_day);
    if (now < start) return { label: 'Sắp diễn ra', cls: 'bg-blue-500/10 text-blue-400' };
    if (now > end) return { label: 'Đã hết hạn', cls: 'bg-gray-800 text-gray-400' };
    if (v.used_count >= v.usage_limit) return { label: 'Đã hết lượt', cls: 'bg-red-500/10 text-red-400' };
    return { label: 'Đang chạy', cls: 'bg-[#d4ff00]/10 text-[#d4ff00]' };
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Khuyến mãi & Mã giảm giá</h1>
          <p className="text-gray-400 text-sm">Quản lý các chương trình khuyến mãi từ database</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchVouchers}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#222] border border-[#333] hover:bg-[#333] text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Làm mới
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(212,255,0,0.2)]"
          >
            <Plus className="w-5 h-5" /> Tạo mã mới
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">MÃ CODE</th>
              <th className="px-6 py-4 font-medium">LOẠI GIẢM</th>
              <th className="px-6 py-4 font-medium">GIÁ TRỊ</th>
              <th className="px-6 py-4 font-medium">ĐƠN TỐI THIỂU</th>
              <th className="px-6 py-4 font-medium">THỜI GIAN</th>
              <th className="px-6 py-4 font-medium">SỬ DỤNG</th>
              <th className="px-6 py-4 font-medium">TRẠNG THÁI</th>
              <th className="px-6 py-4 font-medium text-right">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : vouchers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  Chưa có voucher nào.
                </td>
              </tr>
            ) : (
              vouchers.map((v) => {
                const status = getVoucherStatus(v);
                return (
                  <tr key={v._id} className="hover:bg-[#1e1e1e] transition-colors">
                    <td className="px-6 py-4">
                      <code className="bg-[#333] px-2 py-1 rounded text-[#d4ff00] font-mono">{v.code}</code>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {v.discount_type === 'percent' ? 'Phần trăm (%)' : 'Số tiền cố định'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {v.discount_type === 'percent'
                        ? `${v.discount_value}%`
                        : `${v.discount_value?.toLocaleString('vi-VN')}đ`}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {v.min_order > 0 ? `${v.min_order?.toLocaleString('vi-VN')}đ` : 'Không giới hạn'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatDate(v.start_day)} — {formatDate(v.end_day)}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {v.used_count ?? 0} / {v.usage_limit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-blue-400 transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="p-2 bg-[#222] hover:bg-red-500/20 border border-[#444] hover:border-red-500/50 rounded-md text-gray-300 hover:text-red-500 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
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

      <PromotionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        promo={editingPromo}
        onSaved={fetchVouchers}
      />
    </div>
  );
};

export default Promotions;
