import React from 'react';
import { X } from 'lucide-react';

const PromotionFormModal = ({ isOpen, onClose, promo }) => {
  if (!isOpen) return null;

  const isEditing = !!promo;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-xl w-[90%] max-w-lg shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#141414] border-b border-[#333] px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">{isEditing ? 'Cập nhật Khuyến mãi' : 'Tạo Khuyến mãi mới'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tên chương trình *</label>
            <input 
              type="text" 
              defaultValue={promo?.name || ''} 
              placeholder="VD: Hè Rực Rỡ"
              className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mã Code *</label>
              <input 
                type="text" 
                defaultValue={promo?.code || ''} 
                placeholder="VD: HELLO2024"
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white uppercase" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mức giảm giá *</label>
              <input 
                type="text" 
                defaultValue={promo?.discount || ''} 
                placeholder="VD: 10% hoặc 50k"
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ngày bắt đầu</label>
              <input 
                type="date" 
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ngày kết thúc</label>
              <input 
                type="date" 
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Trạng thái</label>
            <select className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white">
              <option value="Sắp diễn ra">Sắp diễn ra</option>
              <option value="Đang chạy">Đang chạy</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#333] px-6 py-4 flex justify-end gap-3 bg-[#141414] shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-transparent border border-[#444] rounded-lg hover:bg-[#222] transition-colors">
            Hủy bỏ
          </button>
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-black bg-[#d4ff00] rounded-lg hover:bg-[#bce600] transition-colors">
            {isEditing ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PromotionFormModal;
