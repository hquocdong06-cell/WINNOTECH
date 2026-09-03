import React, { useState, useEffect } from 'react';
import { X, Ticket, User, AlertCircle, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateAdminUserVoucher, fetchAllAvailableVouchers, API_BASE } from '../services/adminService';

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

const EditUserVoucherModal = ({ isOpen, onClose, onSuccess, userVoucher = null }) => {
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState('');
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && userVoucher) {
      const currentVId = userVoucher.voucher_id?._id || userVoucher.voucher_id;
      setSelectedVoucherId(currentVId || '');

      setLoadingVouchers(true);
      fetchAllAvailableVouchers(true)
        .then((data) => {
          // Bắt buộc chỉ lấy voucher đang hoạt động (status === 'active')
          const activeList = (data || []).filter((v) => v.status === 'active');
          setVouchers(activeList);
        })
        .catch((err) => {
          toast.error('Lỗi khi tải danh sách voucher: ' + err.message);
        })
        .finally(() => {
          setLoadingVouchers(false);
        });
    }
  }, [isOpen, userVoucher]);

  if (!isOpen || !userVoucher) return null;

  const customer = userVoucher.user_id || {};
  const currentVoucher = userVoucher.voucher_id || {};
  const newVoucher = vouchers.find((v) => v._id === selectedVoucherId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVoucherId) {
      toast.error('Vui lòng chọn voucher mới');
      return;
    }

    const currentVId = currentVoucher._id || currentVoucher;
    if (selectedVoucherId === currentVId) {
      toast.warning('Vui lòng chọn voucher khác với voucher hiện tại');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateAdminUserVoucher(userVoucher._id, {
        voucher_id: selectedVoucherId,
      });
      toast.success(res.message || 'Đã cập nhật đổi voucher cho khách hàng thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi cập nhật voucher trong ví');
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
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Đổi Voucher Trong Ví Khách Hàng</h3>
              <p className="text-xs text-gray-400">Thay đổi mã voucher hiện tại thành một voucher khác có sẵn</p>
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
          {/* Thông tin khách hàng */}
          <div className="bg-[#1e1e2d] border border-[#333] rounded-xl p-3.5 flex items-center gap-3">
            <img
              src={
                customer.avatar
                  ? customer.avatar.startsWith('http')
                    ? customer.avatar
                    : `${API_BASE}${customer.avatar}`
                  : `https://api.dicebear.com/7.x/bottts/svg?seed=${customer.email || 'user'}`
              }
              alt={customer.name || customer.email}
              className="w-10 h-10 rounded-full object-cover border border-[#444]"
            />
            <div className="text-xs">
              <div className="font-bold text-white text-sm">{customer.name || 'Chưa đặt tên'}</div>
              <div className="text-gray-400 font-mono mt-0.5">{customer.email}</div>
              {customer.phone && <div className="text-gray-500 font-mono">{customer.phone}</div>}
            </div>
          </div>

          {/* Voucher hiện tại */}
          <div className="bg-[#1a1a24] border border-[#2b2b36] rounded-xl p-3.5 text-xs space-y-1.5">
            <div className="text-gray-400 font-semibold flex items-center justify-between">
              <span>VOUCHER HIỆN TẠI TRONG VÍ:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                userVoucher.is_used ? 'bg-gray-800 text-gray-400' : 'bg-green-500/10 text-green-400 border border-green-500/30'
              }`}>
                {userVoucher.is_used ? 'Đã sử dụng' : 'Chưa sử dụng'}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded bg-[#d4ff00]/10 text-[#d4ff00] font-mono font-bold text-sm">
                {currentVoucher.code || 'N/A'}
              </span>
              <span className="text-gray-300">
                {(currentVoucher.discountType || currentVoucher.discount_type) === 'percent'
                  ? `Giảm ${currentVoucher.discountValue || currentVoucher.discount_value}%`
                  : `Giảm ${formatPrice(currentVoucher.discountValue || currentVoucher.discount_value)}`}
              </span>
            </div>
          </div>

          {/* Chọn voucher thay thế */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-[#d4ff00]" /> Chọn Voucher Mới Muốn Đổi Sang
            </label>
            {loadingVouchers ? (
              <div className="py-3 text-center text-xs text-gray-400">Đang tải danh sách voucher...</div>
            ) : vouchers.length === 0 ? (
              <div className="py-3 text-center text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                Hiện không có voucher nào đang hoạt động trong hệ thống để đổi sang!
              </div>
            ) : (
              <select
                value={selectedVoucherId}
                onChange={(e) => setSelectedVoucherId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1e1e2d] border border-[#333] rounded-xl text-sm text-white outline-none focus:border-[#d4ff00] transition-colors"
                required
              >
                <option value="" disabled>-- Chọn mã voucher mới (đang hoạt động) --</option>
                {vouchers.map((v) => {
                  const discountText =
                    (v.discountType || v.discount_type) === 'percent'
                      ? `Giảm ${v.discountValue || v.discount_value}%`
                      : `Giảm ${formatPrice(v.discountValue || v.discount_value)}`;
                  const isCurrent = v._id === (currentVoucher._id || currentVoucher);
                  return (
                    <option key={v._id} value={v._id}>
                      [{v.code}] {discountText} {isCurrent ? '(Voucher hiện tại)' : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Xem trước voucher mới */}
          {newVoucher && newVoucher._id !== (currentVoucher._id || currentVoucher) && (
            <div className="bg-[#1a1a26] border border-[#2e2e40] rounded-xl p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#2e2e40] pb-2">
                <span className="font-bold text-sm text-[#d4ff00] font-mono tracking-wider">
                  MÃ MỚI: {newVoucher.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    newVoucher.status === 'active'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  {newVoucher.status === 'active' ? 'Đang hoạt động' : 'Tạm tắt'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-300">
                <div>
                  <span className="text-gray-500">Mức giảm:</span>{' '}
                  <strong className="text-white">
                    {(newVoucher.discountType || newVoucher.discount_type) === 'percent'
                      ? `${newVoucher.discountValue || newVoucher.discount_value}%`
                      : formatPrice(newVoucher.discountValue || newVoucher.discount_value)}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">Đơn tối thiểu:</span>{' '}
                  <strong className="text-white">
                    {formatPrice(newVoucher.minOrderValue || newVoucher.min_order || 0)}
                  </strong>
                </div>
                {(newVoucher.discountType || newVoucher.discount_type) === 'percent' && (
                  <div>
                    <span className="text-gray-500">Giảm tối đa:</span>{' '}
                    <strong className="text-white">
                      {newVoucher.maxDiscountAmount ? formatPrice(newVoucher.maxDiscountAmount) : 'Không giới hạn'}
                    </strong>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Hạn dùng:</span>{' '}
                  <strong className="text-white">
                    {formatDate(newVoucher.endDate || newVoucher.end_day)}
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
              disabled={submitting || !selectedVoucherId || selectedVoucherId === (currentVoucher._id || currentVoucher)}
              className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5"
            >
              {submitting ? 'Đang cập nhật...' : 'Xác Nhận Đổi Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserVoucherModal;
