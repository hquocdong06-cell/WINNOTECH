import React from 'react';
import { UploadCloud, X } from 'lucide-react';
import { mockCategories, mockBrands } from '../mockData';

const ProductFormModal = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-white">
        
        <div className="sticky top-0 bg-[#141414] border-b border-[#333] px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">
            {product ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột trái: Thông tin chính */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
                <h3 className="font-semibold text-[15px] mb-4">Thông tin cơ bản</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tên sản phẩm *</label>
                  <input type="text" defaultValue={product?.name} className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] focus:ring-1 focus:ring-[#d4ff00] outline-none transition-all" placeholder="Ví dụ: VGA ASUS TUF..." />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mô tả chi tiết</label>
                  <textarea rows="5" className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] focus:ring-1 focus:ring-[#d4ff00] outline-none transition-all" placeholder="Thông số kỹ thuật..."></textarea>
                </div>
              </div>

              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
                <h3 className="font-semibold text-[15px] mb-4">Ảnh sản phẩm</h3>
                
                {/* File Upload Zone */}
                <div className="border-2 border-dashed border-[#444] hover:border-[#d4ff00] transition-colors rounded-xl p-8 text-center bg-[#141414] cursor-pointer group">
                  <div className="w-16 h-16 bg-[#1e1e1e] group-hover:bg-[#d4ff00]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#d4ff00]" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Click để tải ảnh lên (Upload file)</p>
                  <p className="text-xs text-gray-500 mb-4">SVG, PNG, JPG hoặc GIF (Tối đa 5MB)</p>
                  <input type="file" className="hidden" />
                  <button className="px-4 py-2 bg-[#222] border border-[#444] rounded-md text-xs font-semibold hover:bg-[#333] transition-colors">
                    Chọn File
                  </button>
                </div>
              </div>

            </div>

            {/* Cột phải: Tổ chức & Định giá */}
            <div className="space-y-6">
              
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
                <h3 className="font-semibold text-[15px] mb-4">Trạng thái & Danh mục</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Trạng thái</label>
                  <select defaultValue={product?.status} className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white">
                    <option value="Active">Đang bán (Active)</option>
                    <option value="Draft">Bản nháp (Draft)</option>
                    <option value="Hidden">Đã ẩn (Hidden)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Danh mục</label>
                  <select defaultValue={product?.category} className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white">
                    <option value="">Chọn danh mục</option>
                    {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Thương hiệu</label>
                  <select defaultValue={product?.brand} className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white">
                    <option value="">Chọn thương hiệu</option>
                    {mockBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
                <h3 className="font-semibold text-[15px] mb-4">Giá bán mặc định</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Giá gốc (VNĐ)</label>
                  <input type="number" defaultValue={product?.price} className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Giá khuyến mãi (VNĐ)</label>
                  <input type="number" defaultValue={product?.salePrice} className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tồn kho</label>
                  <input type="number" defaultValue={product?.stock} className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white" />
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="border-t border-[#333] px-6 py-4 flex justify-end gap-3 bg-[#141414] rounded-b-xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-transparent border border-[#444] rounded-lg hover:bg-[#222] transition-colors">
            Hủy bỏ
          </button>
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-black bg-[#d4ff00] rounded-lg hover:bg-[#bce600] transition-colors">
            Lưu Sản phẩm
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductFormModal;
