import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Eye, EyeOff, Loader2, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAdminBrands, createAdminBrand, updateAdminBrand, deleteAdminBrand } from '../services/adminService';

const BrandManagementModal = ({ isOpen, onClose, onSuccess }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBrands();
      setEditingBrand(null);
      setBrandName('');
    }
  }, [isOpen]);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminBrands();
      setBrands(data);
    } catch (err) {
      toast.error('Không thể tải thương hiệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast.error('Vui lòng nhập tên thương hiệu!');
      return;
    }

    setSaving(true);
    try {
      if (editingBrand) {
        await updateAdminBrand(editingBrand._id, { name: brandName.trim() });
        toast.success('Cập nhật thương hiệu thành công!');
      } else {
        await createAdminBrand({ name: brandName.trim() });
        toast.success('Tạo thương hiệu mới thành công!');
      }
      setBrandName('');
      setEditingBrand(null);
      loadBrands();
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Lỗi xử lý thương hiệu');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name || '');
  };

  const handleToggleStatus = async (brand) => {
    const nextStatus = brand.status === 'active' ? 'inactive' : 'active';
    try {
      await updateAdminBrand(brand._id, { status: nextStatus });
      toast.success(nextStatus === 'active' ? 'Đã kích hoạt thương hiệu' : 'Đã ẩn thương hiệu (Soft delete)');
      loadBrands();
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Lỗi đổi trạng thái');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="bg-[#14141d] border border-[#333] rounded-2xl w-full max-w-lg shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1e1e2d] border-b border-[#333] px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-[#d4ff00]" /> Quản Lý Thương Hiệu (Brands)
          </h2>
          <button onClick={onClose} className="p-1 bg-[#222] hover:bg-[#333] rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Form thêm/sửa */}
          <form onSubmit={handleSubmit} className="bg-[#1a1a24] p-4 rounded-xl border border-[#333] space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              {editingBrand ? `Cập nhật thương hiệu: "${editingBrand.name}"` : 'Tạo Thương Hiệu Mới'}
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="VD: ASUS, MSI, Intel..."
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                className="flex-1 bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#d4ff00]"
              />
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingBrand ? 'Lưu' : 'Thêm'}
              </button>
              {editingBrand && (
                <button
                  type="button"
                  onClick={() => { setEditingBrand(null); setBrandName(''); }}
                  className="px-3 py-2 bg-[#222] hover:bg-[#333] border border-[#444] text-gray-300 rounded-xl text-xs"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>

          {/* Danh sách Brands */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Danh sách Thương hiệu ({brands.length})
            </h4>
            {loading ? (
              <div className="text-center py-6 text-gray-500 text-xs">Đang tải danh sách thương hiệu...</div>
            ) : brands.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">Chưa có thương hiệu nào.</div>
            ) : (
              <div className="space-y-2">
                {brands.map(b => (
                  <div key={b._id} className="flex items-center justify-between p-3 bg-[#1e1e2d] rounded-xl border border-[#333] text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{b.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'inactive' ? 'bg-gray-800 text-gray-400' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {b.status === 'inactive' ? 'Đã ẩn' : 'Hoạt động'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(b)}
                        className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white"
                        title="Sửa tên"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(b)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          b.status === 'inactive'
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                        }`}
                        title={b.status === 'inactive' ? 'Hiện thương hiệu' : 'Ẩn thương hiệu (Soft delete)'}
                      >
                        {b.status === 'inactive' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1e1e2d] border-t border-[#333] px-6 py-3 flex justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#444] text-gray-300 font-semibold rounded-xl text-xs">
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

export default BrandManagementModal;
