import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE as API_URL } from '../../services/apiService';
import { fetchCategoryAttributes, fetchAttributes } from '../services/adminService';

const VariantManagementModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  // Danh mục thuộc tính & giá trị thuộc tính
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [editingAttrVariantId, setEditingAttrVariantId] = useState(null);

  // Form thêm mới biến thể
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    variant_name: '',
    sku: '',
    price: '',
    sale_price: '0',
    stock_quantity: '0',
    status: 'active',
    attribute_value_ids: []
  });

  // Load variants và thuộc tính khi mở modal hoặc thay đổi sản phẩm
  useEffect(() => {
    if (isOpen && product) {
      fetchVariants();
      loadAttributesData();
    }
  }, [isOpen, product]);

  const loadAttributesData = async () => {
    try {
      const [cats, attrs] = await Promise.all([
        fetchCategoryAttributes({ status: 'active' }),
        fetchAttributes({ status: 'active' })
      ]);
      setCategoryAttributes(cats || []);
      setAllAttributes(attrs || []);
    } catch (err) {
      console.error('Lỗi tải danh mục thuộc tính:', err);
    }
  };

  const attributesByCategory = useMemo(() => {
    const map = {};
    (categoryAttributes || []).forEach(cat => {
      map[cat._id] = [];
    });
    (allAttributes || []).forEach(attr => {
      const catId = typeof attr.id_categories_attribute === 'object'
        ? attr.id_categories_attribute?._id
        : attr.id_categories_attribute;
      if (catId && map[catId]) {
        map[catId].push(attr);
      }
    });
    return map;
  }, [categoryAttributes, allAttributes]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/products/${product._id}/variants`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        const loadedVariants = data.data || [];
        setVariants(loadedVariants);
        // Nếu chưa có biến thể thì hiển thị ngay form thêm biến thể
        if (loadedVariants.length === 0) {
          setShowAddForm(true);
        } else {
          setShowAddForm(false);
        }
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

  // Chọn thuộc tính cho biến thể mới
  const handleSelectNewVariantAttr = (categoryId, attrValueId) => {
    setNewVariant(prev => {
      const categoryValues = attributesByCategory[categoryId] || [];
      const catValIds = categoryValues.map(a => a._id.toString());
      // Lọc bỏ các thuộc tính cũ thuộc cùng danh mục
      const filtered = (prev.attribute_value_ids || []).filter(id => !catValIds.includes(id.toString()));
      if (attrValueId) {
        filtered.push(attrValueId);
      }
      return { ...prev, attribute_value_ids: filtered };
    });
  };

  // Chọn thuộc tính cho biến thể đang sửa
  const handleSelectVariantAttr = (variantId, categoryId, attrValueId) => {
    setVariants(prev => prev.map(v => {
      if (v._id !== variantId) return v;
      const categoryValues = attributesByCategory[categoryId] || [];
      const catValIds = categoryValues.map(a => a._id.toString());
      const currentIds = (v.attribute_value_ids || []).map(id => id.toString());
      const filtered = currentIds.filter(id => !catValIds.includes(id));
      if (attrValueId) {
        filtered.push(attrValueId);
      }

      // Cập nhật lại danh sách display attributes cho giao diện
      const updatedDisplayAttrs = [];
      filtered.forEach(valId => {
        const matchedAttr = allAttributes.find(a => a._id.toString() === valId);
        if (matchedAttr) {
          const cat = categoryAttributes.find(c => c._id.toString() === categoryId);
          updatedDisplayAttrs.push({
            category_name: matchedAttr.id_categories_attribute?.name || cat?.name || 'Thuộc tính',
            value: matchedAttr.value,
            value_id: valId
          });
        }
      });

      return {
        ...v,
        attribute_value_ids: filtered,
        attributes: updatedDisplayAttrs
      };
    }));
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
          status: variant.status,
          attribute_value_ids: variant.attribute_value_ids || []
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cập nhật biến thể thành công!');
        fetchVariants();
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
          status: newVariant.status,
          attribute_value_ids: newVariant.attribute_value_ids || []
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Thêm biến thể mới thành công!');
        fetchVariants();
        setShowAddForm(false);
        setNewVariant({
          variant_name: '',
          sku: '',
          price: '',
          sale_price: '0',
          stock_quantity: '0',
          status: 'active',
          attribute_value_ids: []
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
          <button
            onClick={onClose}
            className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4" />
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
              className="flex items-center gap-2 px-4 py-2 bg-black border border-[#D3FC00] text-[#D3FC00] font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(211,252,0,0.15)] hover:bg-[#D3FC00]/10 text-sm"
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

              {/* Chọn thuộc tính biến thể (theo ERD) */}
              {categoryAttributes.length > 0 && (
                <div className="pt-2 border-t border-[#333]">
                  <label className="block text-xs text-gray-400 mb-2 font-medium">
                    Gán thuộc tính biến thể (Màu sắc, Dung lượng, Bộ nhớ,...):
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categoryAttributes.map(cat => {
                      const values = attributesByCategory[cat._id] || [];
                      const selectedValId = (newVariant.attribute_value_ids || []).find(id => 
                        values.some(v => v._id.toString() === id.toString())
                      ) || '';

                      return (
                        <div key={cat._id} className="bg-[#141414] p-2.5 rounded border border-[#333]">
                          <span className="block text-xs text-gray-400 mb-1 font-semibold">{cat.name}:</span>
                          <select
                            value={selectedValId}
                            onChange={(e) => handleSelectNewVariantAttr(cat._id, e.target.value)}
                            className="w-full bg-[#1e1e1e] border border-[#444] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#d4ff00]"
                          >
                            <option value="">-- Không chọn --</option>
                            {values.map(val => (
                              <option key={val._id} value={val._id}>
                                {val.value}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                    <th className="px-4 py-3 font-medium">Tên biến thể & Thuộc tính</th>
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
                    variants.map((v) => {
                      const isAttrOpen = editingAttrVariantId === v._id;

                      return (
                        <React.Fragment key={v._id}>
                          <tr className="hover:bg-[#252525] transition-colors">
                            <td className="px-4 py-2">
                              <input 
                                type="text" 
                                value={v.variant_name}
                                onChange={(e) => handleFieldChange(v._id, 'variant_name', e.target.value)}
                                className="w-full bg-[#141414] border border-[#444] rounded px-2 py-1.5 text-xs focus:border-[#d4ff00] outline-none text-white font-medium" 
                              />
                              {/* Hiển thị các tag thuộc tính */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {v.attributes && v.attributes.length > 0 ? (
                                  v.attributes.map((att, idx) => (
                                    <span 
                                      key={idx} 
                                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-[#141414] border border-[#444] text-[#d4ff00]"
                                    >
                                      {att.category_name ? `${att.category_name}: ` : ''}{att.value}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-gray-500">Chưa gắn thuộc tính</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setEditingAttrVariantId(isAttrOpen ? null : v._id)}
                                  style={{ backgroundColor: 'transparent' }}
                                  className="ml-1.5 px-2 py-0.5 text-[11px] font-bold inline-flex items-center gap-1 rounded-lg border border-[#D3FC00] text-[#D3FC00] bg-transparent hover:bg-[#D3FC00]/10 shadow-[0_0_10px_rgba(211,252,0,0.15)] transition-all cursor-pointer"
                                >
                                  {isAttrOpen ? 'Thu gọn' : 'Chỉnh thuộc tính'}
                                  {isAttrOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </div>
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
                              <div className="flex justify-end">
                                <button 
                                  onClick={() => handleSaveVariant(v)}
                                  disabled={savingId === v._id}
                                  className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                                  title="Lưu thay đổi"
                                >
                                  {savingId === v._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-[#d4ff00]" />
                                  ) : (
                                    <Save className="w-4 h-4 text-[#d4ff00]" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Bảng chọn thuộc tính khi mở rộng hàng biến thể */}
                          {isAttrOpen && (
                            <tr className="bg-[#181818]">
                              <td colSpan="7" className="px-4 py-3 border-b border-[#333]">
                                <div className="text-xs text-gray-300 font-semibold mb-2">
                                  Chọn giá trị thuộc tính cho biến thể:
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {categoryAttributes.map(cat => {
                                    const values = attributesByCategory[cat._id] || [];
                                    const currentValId = (v.attribute_value_ids || []).find(id =>
                                      values.some(val => val._id.toString() === id.toString())
                                    ) || '';

                                    return (
                                      <div key={cat._id} className="bg-[#141414] p-2 rounded border border-[#333]">
                                        <span className="block text-[11px] text-gray-400 mb-1">{cat.name}:</span>
                                        <select
                                          value={currentValId}
                                          onChange={(e) => handleSelectVariantAttr(v._id, cat._id, e.target.value)}
                                          className="w-full bg-[#1e1e1e] border border-[#444] rounded px-2 py-1 text-xs text-white outline-none focus:border-[#d4ff00]"
                                        >
                                          <option value="">-- Trống --</option>
                                          {values.map(val => (
                                            <option key={val._id} value={val._id}>
                                              {val.value}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="text-[11px] text-gray-400 mt-2">
                                  * Nhớ ấn biểu tượng <b>Lưu</b> (Save) ở cột thao tác để cập nhật thuộc tính vào cơ sở dữ liệu.
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
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
        </div>

        <div className="border-t border-[#333] px-6 py-4 flex justify-end gap-3 bg-[#141414] rounded-b-xl">
          <button onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-[#222] border border-[#444] rounded-lg hover:bg-[#333] transition-colors">
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

export default VariantManagementModal;
