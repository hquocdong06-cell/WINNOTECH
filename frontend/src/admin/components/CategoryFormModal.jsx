import React from 'react';
import { X, Upload, ImageIcon } from 'lucide-react';

const CategoryFormModal = ({ isOpen, onClose, category }) => {
  if (!isOpen) return null;

  const isEditing = !!category;

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
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tên danh mục *</label>
            <input 
              type="text" 
              defaultValue={category?.name || ''} 
              placeholder="VD: Card đồ họa (GPU)"
              className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white" 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Đường dẫn (Slug)</label>
            <input 
              type="text" 
              defaultValue={category?.slug || ''} 
              placeholder="gpu"
              className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white" 
            />
            <p className="text-xs text-gray-500 mt-1">Để trống để tự động tạo từ tên danh mục.</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Hình ảnh</label>
            <div className="border-2 border-dashed border-[#333] rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-[#d4ff00] hover:text-[#d4ff00] transition-colors cursor-pointer group bg-[#1a1a1a]">
              {category?.image ? (
                 <img src={category.image} alt="Preview" className="h-32 object-contain mb-4 rounded" />
              ) : (
                <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-[#d4ff00]" />
              )}
              <span className="text-sm font-medium">Click để tải ảnh lên</span>
              <span className="text-xs text-gray-600 mt-1">PNG, JPG tối đa 2MB</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#333] px-6 py-4 flex justify-end gap-3 bg-[#141414] shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-transparent border border-[#444] rounded-lg hover:bg-[#222] transition-colors">
            Hủy bỏ
          </button>
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-black bg-[#d4ff00] rounded-lg hover:bg-[#bce600] transition-colors">
            {isEditing ? 'Lưu thay đổi' : 'Tạo danh mục'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CategoryFormModal;
