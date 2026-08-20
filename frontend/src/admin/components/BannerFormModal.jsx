import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { createAdminBanner, updateAdminBanner, uploadImage } from '../services/adminService';
import { API_BASE } from '../../services/apiService';

const BannerFormModal = ({ isOpen, onClose, banner, onSuccess }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState(1);
  const [status, setStatus] = useState('active');
  const [link, setLink] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!banner;

  useEffect(() => {
    if (isOpen) {
      setName(banner?.name || '');
      setPosition(banner?.position !== undefined ? banner.position : 1);
      setStatus(banner?.status || 'active');
      setLink(banner?.link || '');
      const imgUrl = banner?.image || '';
      setUploadedImageUrl(imgUrl);
      setSelectedFile(null);
      setPreviewUrl(imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `${API_BASE}${imgUrl}`) : '');
    }
  }, [isOpen, banner]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Tải ảnh ngay lập tức thông qua upload helper
    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      setUploadedImageUrl(result.url);
      toast.success('Đã tải ảnh banner lên!');
    } catch (err) {
      toast.error('Lỗi upload ảnh: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.target.files?.[0] || e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: fileInputRef.current });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Vui lòng nhập tên banner!');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        position: Number(position) || 0,
        status,
        link: link.trim(),
        image: uploadedImageUrl,
      };

      let result;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('position', payload.position);
        formData.append('status', payload.status);
        formData.append('link', payload.link);
        formData.append('imageFile', selectedFile);
        if (uploadedImageUrl) formData.append('image', uploadedImageUrl);

        if (isEditing) {
          result = await updateAdminBanner(banner._id, formData);
        } else {
          result = await createAdminBanner(formData);
        }
      } else {
        if (isEditing) {
          result = await updateAdminBanner(banner._id, payload);
        } else {
          result = await createAdminBanner(payload);
        }
      }

      toast.success(result.message || (isEditing ? 'Cập nhật banner thành công!' : 'Tạo banner mới thành công!'));
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-xl w-[90%] max-w-lg shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#141414] border-b border-[#333] px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Tên banner */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tên Banner <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Banner Khuyến Mãi Hè 2026"
              className="w-full px-4 py-2.5 bg-[#1f1f1f] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4ff00] transition-colors"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Lưu ý: Tên banner không được trùng với banner đã có.</p>
          </div>

          {/* Vị trí hiển thị (Position) & Trạng thái (Status) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thứ tự vị trí (`position`) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="VD: 1"
                className="w-full px-4 py-2.5 bg-[#1f1f1f] border border-[#333] rounded-lg text-white focus:outline-none focus:border-[#d4ff00] transition-colors"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">Số nhỏ hơn sẽ xếp ưu tiên trước.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trạng thái hiển thị
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1f1f1f] border border-[#333] rounded-lg text-white focus:outline-none focus:border-[#d4ff00] transition-colors"
              >
                <option value="active">Active (Hiển thị)</option>
                <option value="hidden">Hidden (Ẩn)</option>
              </select>
            </div>
          </div>

          {/* Đường dẫn khi click (Link) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Đường dẫn liên kết (Link tùy chọn)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="VD: /products hoặc https://..."
              className="w-full px-4 py-2.5 bg-[#1f1f1f] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4ff00] transition-colors"
            />
          </div>

          {/* Upload ảnh Banner */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hình ảnh Banner
            </label>
            
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#333] hover:border-[#d4ff00]/60 rounded-xl p-4 text-center cursor-pointer bg-[#1a1a1a] transition-colors group relative overflow-hidden min-h-[140px] flex flex-col items-center justify-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative w-full h-36 rounded-lg overflow-hidden group">
                  <img 
                    src={previewUrl} 
                    alt="Banner Preview" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-xs text-[#d4ff00] font-semibold flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4" /> Thay đổi ảnh banner
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-[#d4ff00] animate-spin mb-2" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-500 group-hover:text-[#d4ff00] transition-colors mb-2" />
                  )}
                  <p className="text-sm font-medium text-gray-300">
                    Kéo thả hoặc <span className="text-[#d4ff00]">bấm vào đây</span> để chọn ảnh
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Hỗ trợ JPG, PNG, WEBP (Tối đa 10MB)</p>
                </div>
              )}
            </div>

            {/* Hoặc nhập trực tiếp URL ảnh */}
            <div className="mt-3">
              <input
                type="text"
                value={uploadedImageUrl}
                onChange={(e) => {
                  setUploadedImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                placeholder="Hoặc dán URL ảnh banner tại đây..."
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#d4ff00]"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#333] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#333] text-gray-300 hover:bg-[#222] transition-colors text-sm font-semibold"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-5 py-2.5 rounded-lg bg-[#d4ff00] text-black font-bold hover:bg-[#c0ea00] transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Lưu thay đổi' : 'Tạo Banner'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default BannerFormModal;
