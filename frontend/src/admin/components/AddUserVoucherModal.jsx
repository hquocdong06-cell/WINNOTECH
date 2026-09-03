import React, { useState, useEffect } from 'react';
import { X, Ticket, User, Check, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { addAdminUserVoucher, fetchAllAvailableVouchers } from '../services/adminService';

const formatPrice = (v) => {
  if (v === undefined || v === null) return '0₫';
  return Number(v).toLocaleString('vi-VN') + '₫';
};

const formatDate = (d) => {
  if (!d) return 'Không giới hạn';
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

const AddUserVoucherModal = ({ isOpen, onClose, onSuccess, customers = [], defaultUser = null }) => {
  const [vouchers, setVouchers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedVoucherId, setSelectedVoucherId] = useState('');
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultUser && defaultUser._id) {
        setSelectedUserId(defaultUser._id);
      } else if (customers.length > 0 && !selectedUserId) {
        setSelectedUserId(customers[0]._id);
      }

      setLoadingVouchers(true);
      fetchAllAvailableVouchers(true)
        .then((data) => {
          // Bắt buộc chỉ lấy voucher đang hoạt động (status === 'active')
          const activeList = (data || []).filter((v) => v.status === 'active');
          setVouchers(activeList);
          if (activeList.length > 0 && !selectedVoucherId) {
            setSelectedVoucherId(activeList[0]._id);
          }
        })
        .catch((err) => {
          toast.error('Lỗi khi tải danh sách voucher: ' + err.message);
        })
        .finally(() => {
          setLoadingVouchers(false);
        });
    }
  }, [isOpen, defaultUser]);

  if (!isOpen) return null;

  const selectedVoucher = vouchers.find((v) => v._id === selectedVoucherId);
  const selectedCustomer = customers.find((c) => c._id === selectedUserId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Vui lòng chọn khách hàng');
      return;
    }
    if (!selectedVoucherId) {
      toast.error('Vui lòng chọn voucher');
      return;
    }

    setSubmitting(true);
    try {
      const res = await addAdminUserVoucher({
        user_id: selectedUserId,
        voucher_id: selectedVoucherId,
      });
      toast.success(res.message || 'Đã thêm voucher vào ví khách hàng thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi thêm voucher vào ví khách hàng');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#14141d] border border-[#333] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2b36] bg-[#1a1a24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-[#d4ff00] flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Thêm Voucher Vào Ví Khách Hàng</h3>
              <p className="text-xs text-gray-400">Gán trực tiếp voucher có sẵn vào tài khoản người dùng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252533] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Chọn khách hàng */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#d4ff00]" /> Chọn Khách Hàng
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1e1e2d] border border-[#333] rounded-xl text-sm text-white outline-none focus:border-[#d4ff00] transition-colors"
              required
            >
              <option value="" disabled>-- Chọn khách hàng --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name || 'Không tên'} ({c.email}) {c.phone ? `— ${c.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Chọn voucher có sẵn */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-[#d4ff00]" /> Chọn Voucher Có Sẵn
            </label>
            {loadingVouchers ? (
              <div className="py-3 text-center text-xs text-gray-400">Đang tải danh sách voucher...</div>
            ) : vouchers.length === 0 ? (
              <div className="py-3 text-center text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                Hiện không có voucher nào đang hoạt động trong hệ thống!
              </div>
            ) : (
              <select
                value={selectedVoucherId}
                onChange={(e) => setSelectedVoucherId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1e1e2d] border border-[#333] rounded-xl text-sm text-white outline-none focus:border-[#d4ff00] transition-colors"
                required
              >
                <option value="" disabled>-- Chọn mã voucher đang hoạt động --</option>
                {vouchers.map((v) => {
                  const discountText =
                    (v.discountType || v.discount_type) === 'percent'
                      ? `Giảm ${v.discountValue || v.discount_value}%`
                      : `Giảm ${formatPrice(v.discountValue || v.discount_value)}`;
                  return (
                    <option key={v._id} value={v._id}>
                      [{v.code}] {discountText}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* 3. Xem trước chi tiết voucher */}
          {selectedVoucher && (
            <div className="bg-[#1a1a26] border border-[#2e2e40] rounded-xl p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#2e2e40] pb-2">
                <span className="font-bold text-sm text-[#d4ff00] font-mono tracking-wider">
                  MÃ: {selectedVoucher.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    selectedVoucher.status === 'active'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  {selectedVoucher.status === 'active' ? 'Đang hoạt động' : 'Tạm tắt'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-300">
                <div>
                  <span className="text-gray-500">Mức giảm:</span>{' '}
                  <strong className="text-white">
                    {(selectedVoucher.discountType || selectedVoucher.discount_type) === 'percent'
                      ? `${selectedVoucher.discountValue || selectedVoucher.discount_value}%`
                      : formatPrice(selectedVoucher.discountValue || selectedVoucher.discount_value)}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">Đơn tối thiểu:</span>{' '}
                  <strong className="text-white">
                    {formatPrice(selectedVoucher.minOrderValue || selectedVoucher.min_order || 0)}
                  </strong>
                </div>
                {(selectedVoucher.discountType || selectedVoucher.discount_type) === 'percent' && (
                  <div>
                    <span className="text-gray-500">Giảm tối đa:</span>{' '}
                    <strong className="text-white">
                      {selectedVoucher.maxDiscountAmount ? formatPrice(selectedVoucher.maxDiscountAmount) : 'Không giới hạn'}
                    </strong>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Hạn dùng:</span>{' '}
                  <strong className="text-white">
                    {formatDate(selectedVoucher.endDate || selectedVoucher.end_day)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 rounded-xl text-sm font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedUserId || !selectedVoucherId}
              className="px-5 py-2 bg-[#d4ff00] hover:bg-[#c2ea00] disabled:opacity-50 text-black font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5"
            >
              {submitting ? 'Đang xử lý...' : 'Xác Nhận Thêm Vào Ví'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserVoucherModal;
