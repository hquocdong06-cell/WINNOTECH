import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Loader2, Image as ImageIcon, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { createAdminBrand, updateAdminBrand, uploadImage, API_BASE } from '../services/adminService';

const toSlug = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const BrandFormModal = ({ isOpen, onClose, brand, onSuccess }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('active');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!brand;

  useEffect(() => {
    if (isOpen) {
      if (brand) {
        setName(brand.name || '');
        setSlug(brand.slug || '');
        setStatus(brand.status || 'active');
        const imgUrl = brand.logo || brand.image || '';
        setUploadedImageUrl(imgUrl);
        setPreviewUrl(imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `${API_BASE}${imgUrl}`) : '');
      } else {
        setName('');
        setSlug('');
        setStatus('active');
        setUploadedImageUrl('');
        setPreviewUrl('');
      }
    }
  }, [isOpen, brand]);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setName(val);
    if (!isEditing) {
      setSlug(toSlug(val));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      setUploadedImageUrl(result.url);
      toast.success('Upload logo thương hiệu thành công!');
    } catch (err) {
      toast.error('Upload ảnh thất bại: ' + err.message);
      setPreviewUrl('');
      setUploadedImageUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên thương hiệu!');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || toSlug(name.trim()),
        image: uploadedImageUrl,
        logo: uploadedImageUrl,
        status: status || 'active',
      };

      if (isEditing) {
        await updateAdminBrand(brand._id, payload);
        toast.success(`Cập nhật thương hiệu "${name}" thành công!`);
      } else {
        await createAdminBrand(payload);
        toast.success(`Tạo mới thương hiệu "${name}" thành công!`);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu thương hiệu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#14141d] border border-[#333] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1a1a24] border-b border-[#2b2b36] px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-[#d4ff00] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'Cập Nhật Thương Hiệu' : 'Thêm Thương Hiệu Mới'}
              </h3>
              <p className="text-xs text-gray-400">
                {isEditing ? 'Chỉnh sửa thông tin và trạng thái thương hiệu' : 'Tạo mới nhãn hàng / thương hiệu đối tác'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252533] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Tên thương hiệu */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Tên Thương Hiệu <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: ASUS, MSI, Corsair, Intel, AMD..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1e1e2d] border border-[#333] rounded-xl text-sm text-white outline-none focus:border-[#d4ff00] transition-colors"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Slug (Đường dẫn)
            </label>
            <input
              type="text"
              placeholder="vd: asus, msi, corsair..."
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1e1e2d] border border-[#333] rounded-xl text-sm text-gray-300 font-mono outline-none focus:border-[#d4ff00] transition-colors"
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Trạng Thái Hiển Thị
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1e1e2d] border border-[#333] rounded-xl text-sm text-white outline-none focus:border-[#d4ff00] transition-colors"
            >
              <option value="active">Đang hoạt động (Hiển thị trên hệ thống)</option>
              <option value="inactive">Tạm ẩn (Ngừng hiển thị)</option>
            </select>
          </div>

          {/* Logo / Ảnh thương hiệu */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Logo Thương Hiệu
            </label>

            {/* Dropzone Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#333] hover:border-[#d4ff00]/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#1a1a24] hover:bg-[#1f1f2e] transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {isUploading ? (
                <div className="flex items-center gap-2 text-[#d4ff00] py-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Đang tải ảnh lên...</span>
                </div>
              ) : previewUrl ? (
                <div className="relative group w-24 h-24 bg-white/5 rounded-xl border border-[#444] p-2 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Brand Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                    <span className="text-[11px] text-[#d4ff00]">Đổi ảnh</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-2 text-gray-400">
                  <UploadCloud className="w-7 h-7 text-gray-500" />
                  <span className="text-xs">Bấm để chọn file logo hoặc kéo thả vào đây</span>
                  <span className="text-[11px] text-gray-600">PNG, JPG, SVG, WebP (Khuyến khích nền trong suốt)</span>
                </div>
              )}
            </div>

            {/* Link ảnh URL trực tiếp */}
            <div className="mt-2.5">
              <input
                type="text"
                placeholder="Hoặc dán trực tiếp đường link ảnh logo (https://...)"
                value={uploadedImageUrl}
                onChange={(e) => {
                  setUploadedImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                className="w-full px-3 py-2 bg-[#1e1e2d] border border-[#333] rounded-lg text-xs text-white outline-none focus:border-[#d4ff00]"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 rounded-xl text-sm font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading || !name.trim()}
              className="px-5 py-2 bg-[#d4ff00] hover:bg-[#c2ea00] disabled:opacity-50 text-black font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
                </>
              ) : isEditing ? (
                'Lưu Thay Đổi'
              ) : (
                'Tạo Thương Hiệu'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandFormModal;
