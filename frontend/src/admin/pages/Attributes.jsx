import React, { useState, useEffect, useCallback } from 'react';
import {
  SlidersHorizontal,
  Search,
  Plus,
  Edit,
  Eye,
  EyeOff,
  FolderTree,
  Tag,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchCategoryAttributes,
  createCategoryAttribute,
  updateCategoryAttribute,
  toggleCategoryAttributeStatus,
  fetchAttributes,
  createAttribute,
  updateAttribute,
  toggleAttributeStatus
} from '../services/adminService';

// Modal Thêm / Sửa Danh mục thuộc tính (categories_attribute)
const CategoryAttributeModal = ({ isOpen, onClose, editingItem, onSuccess }) => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
    } else {
      setName('');
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error('Vui lòng nhập tên danh mục thuộc tính!');
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        await updateCategoryAttribute(editingItem._id, { name: name.trim() });
        toast.success('Cập nhật danh mục thuộc tính thành công!');
      } else {
        await createCategoryAttribute({ name: name.trim() });
        toast.success('Thêm danh mục thuộc tính thành công!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Lỗi xử lý danh mục thuộc tính');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-xl w-[90%] max-w-md shadow-2xl text-white">
        <div className="border-b border-[#333] px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {editingItem ? 'Sửa Danh mục thuộc tính' : 'Thêm Danh mục thuộc tính mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#222] hover:bg-[#333] border border-[#444] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Tên danh mục thuộc tính <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Màu sắc, Dung lượng RAM, Socket CPU..."
              className="w-full bg-[#1e1e1e] border border-[#444] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white transition-colors"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-gray-300 border border-[#444] rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-black bg-[#d4ff00] hover:bg-[#bce600] rounded-lg transition-colors disabled:opacity-60"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingItem ? 'Lưu thay đổi' : 'Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Thêm / Sửa Thuộc tính (attribute_value)
const AttributeModal = ({ isOpen, onClose, editingItem, categories, defaultCategoryId, onSuccess }) => {
  const [value, setValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setValue(editingItem.value || '');
      setCategoryId(editingItem.id_categories_attribute?._id || editingItem.id_categories_attribute || '');
    } else {
      setValue('');
      setCategoryId(defaultCategoryId || (categories[0]?._id || ''));
    }
  }, [editingItem, isOpen, defaultCategoryId, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) {
      return toast.error('Vui lòng nhập giá trị thuộc tính!');
    }
    if (!categoryId) {
      return toast.error('Vui lòng chọn danh mục thuộc tính!');
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        await updateAttribute(editingItem._id, {
          value: value.trim(),
          id_categories_attribute: categoryId
        });
        toast.success('Cập nhật thuộc tính thành công!');
      } else {
        await createAttribute({
          value: value.trim(),
          id_categories_attribute: categoryId
        });
        toast.success('Thêm thuộc tính mới thành công!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Lỗi xử lý thuộc tính');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-xl w-[90%] max-w-md shadow-2xl text-white">
        <div className="border-b border-[#333] px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {editingItem ? 'Sửa Thuộc tính' : 'Thêm Thuộc tính mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#222] hover:bg-[#333] border border-[#444] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Danh mục thuộc tính <span className="text-red-400">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#444] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white transition-colors cursor-pointer"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.status === 'inactive' ? '(Đã ẩn)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Giá trị thuộc tính <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="VD: Đen, Trắng, 16GB, 1TB, AM5..."
              className="w-full bg-[#1e1e1e] border border-[#444] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white transition-colors"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-gray-300 border border-[#444] rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-black bg-[#d4ff00] hover:bg-[#bce600] rounded-lg transition-colors disabled:opacity-60"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingItem ? 'Lưu thay đổi' : 'Thêm thuộc tính'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Attributes = () => {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'values'
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Modals state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cats, attrs] = await Promise.all([
        fetchCategoryAttributes(),
        fetchAttributes()
      ]);
      setCategories(cats || []);
      setAttributes(attrs || []);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Xóa mềm / Đổi trạng thái danh mục thuộc tính
  const handleToggleCatStatus = async (cat) => {
    const nextStatus = cat.status === 'active' ? 'inactive' : 'active';
    const actionText = nextStatus === 'active' ? 'kích hoạt' : 'ẩn (xóa mềm)';
    try {
      await toggleCategoryAttributeStatus(cat._id, nextStatus);
      toast.success(`Đã ${actionText} danh mục "${cat.name}"!`);
      loadData();
    } catch (err) {
      toast.error('Lỗi: ' + err.message);
    }
  };

  // Xóa mềm / Đổi trạng thái thuộc tính
  const handleToggleAttrStatus = async (attr) => {
    const nextStatus = attr.status === 'active' ? 'inactive' : 'active';
    const actionText = nextStatus === 'active' ? 'kích hoạt' : 'ẩn (xóa mềm)';
    try {
      await toggleAttributeStatus(attr._id, nextStatus);
      toast.success(`Đã ${actionText} thuộc tính "${attr.value}"!`);
      loadData();
    } catch (err) {
      toast.error('Lỗi: ' + err.message);
    }
  };

  // Danh sách danh mục sau lọc
  const filteredCategories = categories.filter((c) => {
    const matchSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (c.status === 'active' || !c.status)) ||
      (statusFilter === 'inactive' && c.status === 'inactive');
    return matchSearch && matchStatus;
  });

  // Danh sách thuộc tính sau lọc
  const filteredAttributes = attributes.filter((a) => {
    const matchSearch =
      (a.value || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const aCatId = a.id_categories_attribute?._id || a.id_categories_attribute || a.category?._id || '';
    const matchCat = selectedCategoryFilter ? aCatId.toString() === selectedCategoryFilter.toString() : true;

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (a.status === 'active' || !a.status)) ||
      (statusFilter === 'inactive' && a.status === 'inactive');

    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2.5">
            <SlidersHorizontal className="w-8 h-8 text-[#d4ff00]" />
            Quản lý Thuộc tính & Danh mục thuộc tính
          </h1>
          <p className="text-gray-400 text-sm">
            Cấu hình theo ERD: Danh mục thuộc tính (categories_attribute) và Thuộc tính (attribute_value)
          </p>
        </div>

        {/* Nút thêm mới tương ứng theo tab */}
        {activeTab === 'categories' ? (
          <button
            onClick={() => { setEditingCategory(null); setIsCatModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-black border border-[#D3FC00] text-[#D3FC00] font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(211,252,0,0.15)] hover:bg-[#D3FC00]/10 text-xs"
          >
            <Plus className="w-4 h-4" /> Thêm Danh mục thuộc tính
          </button>
        ) : (
          <button
            onClick={() => { setEditingAttribute(null); setIsAttrModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-black border border-[#D3FC00] text-[#D3FC00] font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(211,252,0,0.15)] hover:bg-[#D3FC00]/10 text-xs"
          >
            <Plus className="w-4 h-4" /> Thêm Thuộc tính mới
          </button>
        )}
      </div>

      {/* Tabs chuyển đổi */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <button
          type="button"
          onClick={() => { setActiveTab('categories'); setSearchQuery(''); }}
          style={{ backgroundColor: activeTab === 'categories' ? 'rgba(211, 252, 0, 0.1)' : 'transparent' }}
          className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-lg transition-all border border-[#D3FC00] text-[#D3FC00] ${
            activeTab === 'categories'
              ? 'shadow-[0_0_15px_rgba(211,252,0,0.25)] opacity-100'
              : 'opacity-65 hover:opacity-100 hover:bg-[#D3FC00]/10 hover:shadow-[0_0_15px_rgba(211,252,0,0.15)]'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Danh mục thuộc tính ({categories.length})
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('values'); setSearchQuery(''); }}
          style={{ backgroundColor: activeTab === 'values' ? 'rgba(211, 252, 0, 0.1)' : 'transparent' }}
          className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-lg transition-all border border-[#D3FC00] text-[#D3FC00] ${
            activeTab === 'values'
              ? 'shadow-[0_0_15px_rgba(211,252,0,0.25)] opacity-100'
              : 'opacity-65 hover:opacity-100 hover:bg-[#D3FC00]/10 hover:shadow-[0_0_15px_rgba(211,252,0,0.15)]'
          }`}
        >
          <Tag className="w-4 h-4" />
          Thuộc tính chi tiết ({attributes.length})
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'categories' ? 'Tìm danh mục thuộc tính...' : 'Tìm giá trị hoặc danh mục thuộc tính...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#333] rounded-lg text-xs focus:border-[#d4ff00] outline-none text-white placeholder-gray-400 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Lọc theo danh mục thuộc tính (nếu ở tab thuộc tính) */}
          {activeTab === 'values' && (
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-xs focus:border-[#d4ff00] outline-none text-white cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Lọc trạng thái (Chỉ Xóa mềm / Hoạt động) */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-xs focus:border-[#d4ff00] outline-none text-white cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã ẩn (Xóa mềm)</option>
          </select>
        </div>
      </div>

      {/* Nội dung bảng tương ứng theo Tab */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#d4ff00] mx-auto mb-3" />
            <p className="text-gray-500 text-xs">Đang tải dữ liệu thuộc tính...</p>
          </div>
        ) : activeTab === 'categories' ? (
          /* ================= BẢNG DANH MỤC THUỘC TÍNH ================= */
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tên danh mục thuộc tính</th>
                  <th className="px-5 py-3 font-semibold">Số thuộc tính con</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      {searchQuery ? 'Không tìm thấy danh mục thuộc tính nào.' : 'Chưa có danh mục thuộc tính nào.'}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const isActive = cat.status === 'active' || !cat.status;
                    return (
                      <tr key={cat._id} className="hover:bg-[#1e1e1e] transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <FolderTree className="w-4 h-4 text-[#d4ff00]" />
                            <span>{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-300">
                          <span className="px-2.5 py-1 bg-[#222] border border-[#444] rounded text-[11px] font-mono">
                            {cat.attribute_count || 0} giá trị
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isActive
                                ? 'bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                          >
                            {isActive ? 'Đang hoạt động' : 'Đã ẩn (Xóa mềm)'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            {/* Thêm nhanh thuộc tính con cho danh mục này */}
                            <button
                              onClick={() => {
                                setEditingAttribute(null);
                                setIsAttrModalOpen(true);
                              }}
                              className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-[#d4ff00] transition-colors"
                              title="Thêm thuộc tính cho danh mục này"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            {/* Sửa */}
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setIsCatModalOpen(true);
                              }}
                              className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                              title="Sửa tên danh mục"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {/* Ẩn / Hiện (Xóa mềm) */}
                            <button
                              onClick={() => handleToggleCatStatus(cat)}
                              className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                              title={isActive ? 'Xóa mềm (Ẩn danh mục)' : 'Khôi phục danh mục'}
                            >
                              {isActive ? <Eye className="w-3.5 h-3.5 text-[#d4ff00]" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ================= BẢNG THUỘC TÍNH CHI TIẾT ================= */
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Giá trị thuộc tính</th>
                  <th className="px-5 py-3 font-semibold">Thuộc danh mục</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {filteredAttributes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      {searchQuery || selectedCategoryFilter
                        ? 'Không tìm thấy thuộc tính nào phù hợp.'
                        : 'Chưa có thuộc tính nào.'}
                    </td>
                  </tr>
                ) : (
                  filteredAttributes.map((attr) => {
                    const isActive = attr.status === 'active' || !attr.status;
                    return (
                      <tr key={attr._id} className="hover:bg-[#1e1e1e] transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#d4ff00]" />
                            <span>{attr.value}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-300">
                          <span className="px-2.5 py-1 bg-[#222] border border-[#444] rounded text-[11px]">
                            {attr.category?.name || attr.id_categories_attribute?.name || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isActive
                                ? 'bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                          >
                            {isActive ? 'Đang hoạt động' : 'Đã ẩn (Xóa mềm)'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            {/* Sửa */}
                            <button
                              onClick={() => {
                                setEditingAttribute(attr);
                                setIsAttrModalOpen(true);
                              }}
                              className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                              title="Sửa thuộc tính"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {/* Ẩn / Hiện (Xóa mềm) */}
                            <button
                              onClick={() => handleToggleAttrStatus(attr)}
                              className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                              title={isActive ? 'Xóa mềm (Ẩn thuộc tính)' : 'Khôi phục thuộc tính'}
                            >
                              {isActive ? <Eye className="w-3.5 h-3.5 text-[#d4ff00]" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CategoryAttributeModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        editingItem={editingCategory}
        onSuccess={loadData}
      />

      <AttributeModal
        isOpen={isAttrModalOpen}
        onClose={() => setIsAttrModalOpen(false)}
        editingItem={editingAttribute}
        categories={categories}
        defaultCategoryId={selectedCategoryFilter}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Attributes;
