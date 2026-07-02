import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { createCategory, updateCategory, uploadImage } from '../services/adminService';

const CategoryFormModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [name, setName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!category;

  // Điền dữ liệu khi mở modal edit
  useEffect(() => {
    if (isOpen) {
      setName(category?.name || '');
      const imgUrl = category?.image || '';
      setUploadedImageUrl(imgUrl);
      setPreviewUrl(imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `http://localhost:3000${imgUrl}`) : '');
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview ngay lập tức
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload lên server
    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      setUploadedImageUrl(result.url);
      toast.success('Upload ảnh thành công!');
    } catch (err) {
      toast.error('Upload ảnh thất bại: ' + err.message);
      setPreviewUrl('');
      setUploadedImageUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: fileInputRef.current });
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên danh mục!');
      return;
    }
    setIsSaving(true);
    try {
      if (isEditing) {
        await updateCategory(category._id, { name: name.trim(), image: uploadedImageUrl });
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await createCategory({ name: name.trim(), image: uploadedImageUrl });
        toast.success('Tạo danh mục thành công!');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-xl w-[90%] max-w-lg shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-[#141414] border-b border-[#333] px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">{isEditing ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* Tên danh mục */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tên danh mục <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Card đồ họa (GPU)"
              className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] focus:ring-1 focus:ring-[#d4ff00]/30 outline-none text-white transition-all"
            />
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Hình ảnh danh mục</label>

            {/* Drop Zone */}
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-xl transition-all cursor-pointer group
                ${isUploading ? 'border-[#d4ff00]/60 bg-[#d4ff00]/5' : 'border-[#333] hover:border-[#d4ff00] bg-[#1a1a1a] hover:bg-[#d4ff00]/5'}
              `}
            >
              {previewUrl ? (
                <div className="p-4 flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-36 object-contain rounded-lg mb-3"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-[#d4ff00] text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang upload...</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 group-hover:text-[#d4ff00] transition-colors">
                      Click hoặc kéo thả để đổi ảnh
                    </span>
                  )}
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#222] group-hover:bg-[#d4ff00]/10 flex items-center justify-center mb-3 transition-colors">
                    {isUploading
                      ? <Loader2 className="w-7 h-7 text-[#d4ff00] animate-spin" />
                      : <UploadCloud className="w-7 h-7 text-gray-400 group-hover:text-[#d4ff00] transition-colors" />
                    }
                  </div>
                  <p className="text-sm font-medium text-white mb-1">
                    {isUploading ? 'Đang upload ảnh...' : 'Click để tải ảnh lên'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP tối đa 5MB</p>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {uploadedImageUrl && !isUploading && (
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                Ảnh đã được lưu trên server
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#333] px-6 py-4 flex justify-end gap-3 bg-[#141414] shrink-0">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-transparent border border-[#444] rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || isUploading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-black bg-[#d4ff00] rounded-lg hover:bg-[#bce600] transition-colors disabled:opacity-60"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Lưu thay đổi' : 'Tạo danh mục'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CategoryFormModal;
