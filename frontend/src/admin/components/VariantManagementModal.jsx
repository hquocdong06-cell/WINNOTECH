import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3000';

const VariantManagementModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form thêm mới biến thể
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    variant_name: '',
    sku: '',
    price: '',
    sale_price: '0',
    stock_quantity: '0',
    status: 'active'
  });

  // Load variants khi mở modal hoặc thay đổi sản phẩm
  useEffect(() => {
    if (isOpen && product) {
      fetchVariants();
      setShowAddForm(false);
    }
  }, [isOpen, product]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/products/${product._id}/variants`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setVariants(data.data || []);
      } else {
        toast.error(data.message || 'Lỗi tải danh sách biến thể');
      }
    } catch (err) {
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setVariants(prev => prev.map(v => v._id === id ? { ...v, [field]: value } : v));
  };

  const handleSaveVariant = async (variant) => {
    if (!variant.variant_name.trim()) return toast.error('Vui lòng nhập tên biến thể!');
    if (!variant.sku.trim()) return toast.error('Vui lòng nhập mã SKU!');
    if (variant.price === '' || isNaN(variant.price)) return toast.error('Vui lòng nhập giá gốc hợp lệ!');

    setSavingId(variant._id);
    try {
      const res = await fetch(`${API_URL}/admin/variants/${variant._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_name: variant.variant_name,
          sku: variant.sku,
          price: Number(variant.price),
          sale_price: Number(variant.sale_price) || 0,
          stock_quantity: Number(variant.stock_quantity) || 0,
          status: variant.status
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cập nhật biến thể thành công!');
        onSuccess?.(); // để load lại list sản phẩm bên ngoài
      } else {
        toast.error(data.message || 'Lỗi cập nhật biến thể');
      }
    } catch (err) {
      toast.error('Lỗi kết nối server');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa biến thể này?')) return;
    setDeletingId(variantId);
    try {
      const res = await fetch(`${API_URL}/admin/variants/${variantId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Xóa biến thể thành công!');
        setVariants(prev => prev.filter(v => v._id !== variantId));
        onSuccess?.();
      } else {
        toast.error(data.message || 'Lỗi khi xóa biến thể');
      }
    } catch (err) {
      toast.error('Lỗi kết nối server');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.variant_name.trim()) return toast.error('Vui lòng nhập tên biến thể!');
    if (!newVariant.sku.trim()) return toast.error('Vui lòng nhập mã SKU!');
    if (newVariant.price === '' || isNaN(newVariant.price)) return toast.error('Vui lòng nhập giá gốc!');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/products/${product._id}/variants`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_name: newVariant.variant_name,
          sku: newVariant.sku,
          price: Number(newVariant.price),
          sale_price: Number(newVariant.sale_price) || 0,
          stock_quantity: Number(newVariant.stock_quantity) || 0,
          status: newVariant.status
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Thêm biến thể mới thành công!');
        setVariants(prev => [...prev, data.data]);
        setShowAddForm(false);
        setNewVariant({
          variant_name: '',
          sku: '',
          price: '',
          sale_price: '0',
          stock_quantity: '0',
          status: 'active'
        });
        onSuccess?.();
      } else {
        toast.error(data.message || 'Lỗi thêm biến thể');
      }
    } catch (err) {
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-xl w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-white">

        <div className="sticky top-0 bg-[#141414] border-b border-[#333] px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-[#d4ff00]">Biến thể (Variants)</h2>
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
              <p className="text-xs text-gray-500 mt-0.5">{variants.length} biến thể hiện có</p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#222] border border-[#444] hover:border-[#d4ff00] hover:text-[#d4ff00] rounded-lg text-sm transition-colors text-white font-semibold"
            >
              <Plus className="w-4 h-4" /> {showAddForm ? 'Hủy' : 'Thêm biến thể mới'}
            </button>
          </div>

          {/* Form thêm mới */}
          {showAddForm && (
            <div className="bg-[#1e1e1e] border border-[#d4ff00]/40 rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-semibold text-[#d4ff00] uppercase tracking-wider">Thêm biến thể mới</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tên biến thể *</label>
                  <input 
                    type="text" 
                    placeholder="VD: Core i7, Đen, 16GB" 
                    value={newVariant.variant_name}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, variant_name: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#444] rounded px-3 py-2 text-sm focus:border-[#d4ff00] outline-none text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Mã SKU *</label>
                  <input 
                    type="text" 
                    placeholder="VD: CPU-I7-13700" 
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#444] rounded px-3 py-2 text-sm focus:border-[#d4ff00] outline-none text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Giá bán gốc (đ) *</label>
                  <input 
                    type="number" 
                    placeholder="VD: 5500000" 
                    value={newVariant.price}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#444] rounded px-3 py-2 text-sm focus:border-[#d4ff00] outline-none text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Giá khuyến mãi (đ)</label>
                  <input 
                    type="number" 
                    value={newVariant.sale_price}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, sale_price: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#444] rounded px-3 py-2 text-sm focus:border-[#d4ff00] outline-none text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Số lượng tồn kho</label>
                  <input 
                    type="number" 
                    value={newVariant.stock_quantity}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#444] rounded px-3 py-2 text-sm focus:border-[#d4ff00] outline-none text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Trạng thái</label>
                  <select 
                    value={newVariant.status}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#444] rounded px-3 py-2 text-sm focus:border-[#d4ff00] outline-none text-white"
                  >
                    <option value="active">Kích hoạt (Active)</option>
                    <option value="inactive">Tạm ẩn (Inactive)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white border border-[#444] rounded hover:bg-[#222]"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleAddVariant}
                  className="px-4 py-2 text-xs font-bold text-black bg-[#d4ff00] hover:bg-[#bce600] rounded"
                >
                  Tạo biến thể
                </button>
              </div>
            </div>
          )}

          <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
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
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin text-[#d4ff00] mx-auto mb-2" />
                        Đang tải danh sách biến thể...
                      </td>
                    </tr>
                  ) : variants.length > 0 ? (
                    variants.map((v) => (
                      <tr key={v._id} className="hover:bg-[#252525] transition-colors">
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={v.variant_name}
                            onChange={(e) => handleFieldChange(v._id, 'variant_name', e.target.value)}
                            className="w-full bg-[#141414] border border-[#444] rounded px-2 py-1.5 text-xs focus:border-[#d4ff00] outline-none text-white font-medium" 
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={v.sku}
                            onChange={(e) => handleFieldChange(v._id, 'sku', e.target.value)}
                            className="w-full bg-[#141414] border border-[#444] rounded px-2 py-1.5 text-xs focus:border-[#d4ff00] outline-none text-white" 
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="number" 
                            value={v.price}
                            onChange={(e) => handleFieldChange(v._id, 'price', e.target.value)}
                            className="w-24 bg-[#141414] border border-[#444] rounded px-2 py-1.5 text-xs focus:border-[#d4ff00] outline-none text-white text-[#d4ff00] font-semibold" 
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="number" 
                            value={v.sale_price}
                            onChange={(e) => handleFieldChange(v._id, 'sale_price', e.target.value)}
                            className="w-24 bg-[#141414] border border-[#444] rounded px-2 py-1.5 text-xs focus:border-[#d4ff00] outline-none text-white text-[#a8a8a8]" 
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="number" 
                            value={v.stock_quantity}
                            onChange={(e) => handleFieldChange(v._id, 'stock_quantity', e.target.value)}
                            className="w-20 bg-[#141414] border border-[#444] rounded px-2 py-1.5 text-xs focus:border-[#d4ff00] outline-none text-white text-center font-bold" 
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select 
                            value={v.status || 'active'}
                            onChange={(e) => handleFieldChange(v._id, 'status', e.target.value)}
                            className="bg-[#141414] border border-[#444] rounded px-2 py-1.5 text-xs focus:border-[#d4ff00] outline-none text-white"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Hidden</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => handleSaveVariant(v)}
                              disabled={savingId === v._id}
                              className="p-1.5 text-gray-400 hover:text-[#d4ff00] hover:bg-[#d4ff00]/10 rounded transition-colors"
                              title="Lưu thay đổi"
                            >
                              {savingId === v._id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#d4ff00]" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleDeleteVariant(v._id)}
                              disabled={deletingId === v._id}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              title="Xóa biến thể"
                            >
                              {deletingId === v._id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
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
          </div>

          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              💡 <span className="font-semibold text-white">Lưu ý:</span> Khi cập nhật số lượng tồn kho của biến thể ở đây, số lượng tồn kho hiển thị tại bảng danh mục sản phẩm phía admin và trang bán hàng phía khách hàng sẽ tự động đồng bộ hóa tương ứng theo thời gian thực.
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
