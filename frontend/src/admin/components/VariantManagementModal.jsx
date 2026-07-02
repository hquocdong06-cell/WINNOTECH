import React from 'react';
import { Plus, X, Trash2 } from 'lucide-react';

const VariantManagementModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  // Variants từ API: { variant_name, sku, price, sale_price, stock_quantity, status }
  const variants = product.Variants || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-xl w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-white">

        <div className="sticky top-0 bg-[#141414] border-b border-[#333] px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold">Biến thể (Variants)</h2>
            <p className="text-sm text-gray-400 mt-1 line-clamp-1">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Danh sách biến thể</h3>
              <p className="text-xs text-gray-500 mt-0.5">{variants.length} biến thể</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#222] border border-[#444] hover:border-[#d4ff00] hover:text-[#d4ff00] rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> Thêm biến thể mới
            </button>
          </div>

          <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#222] border-b border-[#333] text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Tên biến thể</th>
                  <th className="px-4 py-3 font-medium">Mã SKU</th>
                  <th className="px-4 py-3 font-medium">Giá gốc</th>
                  <th className="px-4 py-3 font-medium">Giá KM</th>
                  <th className="px-4 py-3 font-medium">Tồn kho</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {variants.length > 0 ? (
                  variants.map((v, idx) => (
                    <tr key={v._id || idx} className="hover:bg-[#252525] transition-colors">
                      <td className="px-4 py-3">
                        <input type="text" defaultValue={v.variant_name}
                          className="w-full bg-[#141414] border border-[#444] rounded px-2 py-1.5 text-sm focus:border-[#d4ff00] outline-none text-white" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" defaultValue={v.sku}
                          className="w-28 bg-[#141414] border border-[#444] rounded px-2 py-1.5 text-sm focus:border-[#d4ff00] outline-none text-white" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{(v.price || 0).toLocaleString('vi-VN')}đ</div>
                      </td>
                      <td className="px-4 py-3">
                        {v.sale_price > 0 ? (
                          <div className="text-[#d4ff00] font-medium">{v.sale_price.toLocaleString('vi-VN')}đ</div>
                        ) : (
                          <span className="text-gray-500 text-xs">Không có</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          v.stock_quantity > 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {v.stock_quantity || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          v.status === 'active' ? 'bg-[#d4ff00]/10 text-[#d4ff00]' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {v.status === 'active' ? 'Active' : v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                      Sản phẩm này chưa có biến thể nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
            <p className="text-xs text-gray-500">
              💡 <span className="text-gray-400">Chức năng thêm/sửa/xóa biến thể qua API sẽ được hoàn thiện ở giai đoạn tiếp theo.</span>
            </p>
          </div>
        </div>

        <div className="border-t border-[#333] px-6 py-4 flex justify-end gap-3 bg-[#141414] rounded-b-xl">
          <button onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-transparent border border-[#444] rounded-lg hover:bg-[#222] transition-colors">
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

export default VariantManagementModal;
