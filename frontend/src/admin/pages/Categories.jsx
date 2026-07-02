import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchCategories, deleteCategory, fetchProducts } from '../services/adminService';
import CategoryFormModal from '../components/CategoryFormModal';

// ——— Component Dialog xác nhận xóa ———
const ConfirmDeleteDialog = ({ isOpen, categoryName, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-red-500/40 rounded-xl w-[90%] max-w-sm p-6 shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Xác nhận xóa</h3>
            <p className="text-xs text-gray-400 mt-0.5">Hành động này không thể hoàn tác</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
          Bạn có chắc muốn xóa danh mục <span className="font-semibold text-white">"{categoryName}"</span>?
          <br />
          <span className="text-yellow-400 text-xs mt-1 block">Lưu ý: Chỉ xóa được danh mục không còn sản phẩm nào.</span>
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-gray-300 border border-[#444] rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isLoading ? 'Đang xóa...' : 'Xóa danh mục'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // ——— Load danh mục từ API ———
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cats, products] = await Promise.all([
        fetchCategories(),
        fetch('http://localhost:3000/products').then(r => r.json()).then(d => d.data || []),
      ]);
      setCategories(cats);
      // Đếm số sản phẩm theo cat_id
      const counts = {};
      products.forEach((p) => {
        if (p.cat_id) {
          const catId = p.cat_id._id || p.cat_id;
          counts[catId] = (counts[catId] || 0) + 1;
        }
      });
      setProductCounts(counts);
    } catch (err) {
      toast.error('Không thể tải dữ liệu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadData(); // refresh danh sách
  };

  const handleDeleteClick = (cat) => {
    setDeleteDialog({ open: true, category: cat });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.category) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteDialog.category._id);
      toast.success(`Đã xóa danh mục "${deleteDialog.category.name}"`);
      setDeleteDialog({ open: false, category: null });
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Danh mục</h1>
          <p className="text-gray-400 text-sm">{categories.length} danh mục trong hệ thống</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(212,255,0,0.2)]"
        >
          <Plus className="w-5 h-5" /> Thêm Danh mục
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white transition-colors"
          />
        </div>
        <span className="text-sm text-gray-500">{filteredCategories.length} kết quả</span>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Hình ảnh</th>
              <th className="px-6 py-4 font-medium">Tên danh mục</th>
              <th className="px-6 py-4 font-medium">Đường dẫn (Slug)</th>
              <th className="px-6 py-4 font-medium">Số sản phẩm</th>
              <th className="px-6 py-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#d4ff00] mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                  {searchQuery ? 'Không tìm thấy danh mục phù hợp.' : 'Chưa có danh mục nào.'}
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat._id} className="hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-6 py-4">
                    {cat.image ? (
                      <img
                        src={getImageUrl(cat.image)}
                        alt={cat.name}
                        className="w-14 h-14 rounded-lg object-cover border border-[#333]"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-base">{cat.name}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">{cat._id?.slice(-8)}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-mono text-sm">/{cat.slug}</td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">
                      {productCounts[cat._id] || 0} sản phẩm
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-blue-400 transition-colors"
                        title="Sửa danh mục"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat)}
                        className="p-2 bg-[#222] hover:bg-red-500/20 border border-[#444] hover:border-red-500/50 rounded-md text-gray-300 hover:text-red-500 transition-colors"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSuccess={handleModalSuccess}
      />
      <ConfirmDeleteDialog
        isOpen={deleteDialog.open}
        categoryName={deleteDialog.category?.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ open: false, category: null })}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Categories;

