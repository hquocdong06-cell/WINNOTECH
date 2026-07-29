import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { voucherAPI } from '../../services/apiService';

const PromotionFormModal = ({ isOpen, onClose, promo, onSaved }) => {
  const isEditing = !!promo;

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_order: '',
    usage_limit: '',
    start_day: '',
    end_day: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (promo) {
      setForm({
        code: promo.code || '',
        discount_type: promo.discount_type || 'percent',
        discount_value: promo.discount_value ?? '',
        min_order: promo.min_order ?? '',
        usage_limit: promo.usage_limit ?? '',
        start_day: promo.start_day ? new Date(promo.start_day).toISOString().slice(0, 10) : '',
        end_day: promo.end_day ? new Date(promo.end_day).toISOString().slice(0, 10) : '',
      });
    } else {
      setForm({ code: '', discount_type: 'percent', discount_value: '', min_order: '', usage_limit: '', start_day: '', end_day: '' });
    }
    setError('');
  }, [promo, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.code.trim()) { setError('Vui lòng nhập mã code voucher'); return; }
    if (!form.discount_value) { setError('Vui lòng nhập giá trị giảm giá'); return; }
    if (!form.usage_limit) { setError('Vui lòng nhập giới hạn sử dụng'); return; }

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order: Number(form.min_order) || 0,
      usage_limit: Number(form.usage_limit),
      start_day: form.start_day || undefined,
      end_day: form.end_day || undefined,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await voucherAPI.update(promo._id, payload);
      } else {
        await voucherAPI.create(payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu voucher');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-xl w-[90%] max-w-lg shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#141414] border-b border-[#333] px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">{isEditing ? 'Cập nhật Voucher' : 'Tạo Voucher mới'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Mã Code *</label>
            <input type="text" name="code" value={form.code}
              onChange={handleChange} placeholder="VD: HELLO2024"
              className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Loại giảm giá *</label>
              <select name="discount_type" value={form.discount_type} onChange={handleChange}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white">
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Giá trị giảm * ({form.discount_type === 'percent' ? '%' : 'đ'})
              </label>
              <input type="number" name="discount_value" value={form.discount_value}
                onChange={handleChange} placeholder={form.discount_type === 'percent' ? 'VD: 10' : 'VD: 50000'}
                min="0" className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Đơn tối thiểu (đ)</label>
              <input type="number" name="min_order" value={form.min_order}
                onChange={handleChange} placeholder="0 = không giới hạn" min="0"
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Giới hạn sử dụng *</label>
              <input type="number" name="usage_limit" value={form.usage_limit}
                onChange={handleChange} placeholder="VD: 100" min="1"
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ngày bắt đầu</label>
              <input type="date" name="start_day" value={form.start_day} onChange={handleChange}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ngày kết thúc</label>
              <input type="date" name="end_day" value={form.end_day} onChange={handleChange}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-[#333] px-6 py-4 flex justify-end gap-3 bg-[#141414] shrink-0">
          <button onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-transparent border border-[#444] rounded-lg hover:bg-[#222] transition-colors">
            Hủy bỏ
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2.5 text-sm font-bold text-black bg-[#d4ff00] rounded-lg hover:bg-[#bce600] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? 'Đang lưu...' : (isEditing ? 'Lưu thay đổi' : 'Tạo voucher')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PromotionFormModal;
