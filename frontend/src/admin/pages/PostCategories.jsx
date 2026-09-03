import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  CheckCircle2,
  XCircle,
  UploadCloud,
  X,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchPostCategories,
  createPostCategory,
  updatePostCategory,
  togglePostCategoryStatus,
  deletePostCategory,
  fetchPosts,
  uploadImage,
  API_BASE
} from '../services/adminService';

// ——— Dialog xác nhận xóa danh mục ———
const ConfirmDeleteDialog = ({ isOpen, category, onConfirm, onCancel, isLoading }) => {
  if (!isOpen || !category) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#181824] border border-red-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Xác nhận xóa danh mục</h3>
            <p className="text-xs text-gray-400 mt-0.5">Hành động này sẽ xóa vĩnh viễn khỏi cơ sở dữ liệu</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
          Bạn có chắc chắn muốn xóa danh mục bài viết <span className="font-bold text-white">"{category.name}"</span>?
          <span className="block text-xs text-yellow-400/90 mt-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5">
            Lưu ý: Chỉ xóa được danh mục khi không còn bài viết nào thuộc danh mục này.
          </span>
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-gray-300 border border-[#444] rounded-xl hover:bg-[#252535] transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-900/30 disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isLoading ? 'Đang xóa...' : 'Xóa danh mục'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ——— Modal Thêm / Sửa Danh mục Bài viết ———
const PostCategoryFormModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState('active');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!category;

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^a-z0-9\s-]+)/g, '')
      .replace(/([\s-]+)/g, '-')
      .trim();
  };

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || '');
        setSlug(category.slug || '');
        setImage(category.image || '');
        setStatus(category.status || 'active');
        setPreviewUrl(category.image ? (category.image.startsWith('http') ? category.image : `${API_BASE}${category.image}`) : '');
      } else {
        setName('');
        setSlug('');
        setImage('');
        setStatus('active');
        setPreviewUrl('');
      }
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing || !slug) {
      setSlug(generateSlug(val));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Xem trước cục bộ
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Tải lên server
    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      setImage(res.url);
      toast.success('Tải ảnh danh mục thành công!');
    } catch (err) {
      toast.error('Lỗi khi tải ảnh: ' + err.message);
      setPreviewUrl('');
      setImage('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên danh mục!');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        image: image || '',
        status
      };

      if (isEditing) {
        await updatePostCategory(category._id, payload);
        toast.success(`Cập nhật danh mục "${name}" thành công!`);
      } else {
        await createPostCategory(payload);
        toast.success(`Tạo mới danh mục "${name}" thành công!`);
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu danh mục');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#14141f] border border-[#2d2d3d] rounded-2xl w-full max-w-lg shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1a1a27] border-b border-[#252535] px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/30 flex items-center justify-center text-[#d4ff00]">
              <FolderOpen className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Cập nhật Danh mục Bài viết' : 'Thêm Danh mục Bài viết mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252535] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Tên danh mục <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Tin tức công nghệ, Hướng dẫn build PC..."
              value={name}
              onChange={handleNameChange}
              className="w-full bg-[#1c1c2b] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#d4ff00] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Đường dẫn tĩnh (Slug)
            </label>
            <input
              type="text"
              placeholder="tin-tuc-cong-nghe"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[#1c1c2b] border border-[#333] rounded-xl px-4 py-2.5 text-sm font-mono text-gray-300 placeholder-gray-500 outline-none focus:border-[#d4ff00] transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1">Slug được tạo tự động từ tên danh mục, dùng cho URL bài viết.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Trạng thái hiển thị
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#1c1c2b] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#d4ff00]"
            >
              <option value="active">Hoạt động (Hiển thị cho người dùng)</option>
              <option value="inactive">Ẩn / Tắt (Không hiển thị ngoài web)</option>
            </select>
          </div>

          {/* Upload ảnh đại diện */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Ảnh đại diện danh mục (tùy chọn)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="post-category-image-file"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1f1f2e] border border-[#38384d] hover:bg-[#28283d] rounded-xl text-xs font-semibold text-gray-200 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#d4ff00]" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-[#d4ff00]" />
                )}
                {isUploading ? 'Đang tải lên...' : 'Chọn hoặc tải ảnh lên'}
              </button>

              {previewUrl && (
                <div className="relative group w-14 h-14 rounded-xl border border-[#444] overflow-hidden bg-black/40 shrink-0">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage('');
                      setPreviewUrl('');
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                    title="Xóa ảnh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[#252535]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-gray-300 border border-[#38384d] rounded-xl hover:bg-[#20202f] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-black bg-[#d4ff00] hover:bg-[#bce600] rounded-xl transition-colors shadow-lg shadow-[#d4ff00]/20 disabled:opacity-60"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ——— TRANG CHÍNH: QUẢN LÝ DANH MỤC BÀI VIẾT ———
const PostCategories = () => {
  const [categories, setCategories] = useState([]);
  const [postCounts, setPostCounts] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, posts] = await Promise.all([
        fetchPostCategories(),
        fetchPosts()
      ]);
      setCategories(cats);

      // Thống kê số lượng bài viết thuộc mỗi danh mục
      const counts = {};
      posts.forEach((p) => {
        if (p.categories_post_id) {
          const catId = p.categories_post_id._id || p.categories_post_id;
          counts[catId] = (counts[catId] || 0) + 1;
        }
      });
      setPostCounts(counts);
    } catch (err) {
      toast.error('Lỗi lấy danh sách danh mục bài viết: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (cat) => {
    const nextStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      await togglePostCategoryStatus(cat._id, nextStatus);
      toast.success(`Đã chuyển danh mục sang "${nextStatus === 'active' ? 'Hoạt động' : 'Ẩn'}"!`);
      loadData();
    } catch (err) {
      toast.error('Lỗi khi đổi trạng thái: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.category) return;
    setIsDeleting(true);
    try {
      const res = await deletePostCategory(deleteDialog.category._id);
      toast.success(res.message || 'Xóa danh mục thành công!');
      setDeleteDialog({ open: false, category: null });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa danh mục');
    } finally {
      setIsDeleting(false);
    }
  };

  // Lọc danh mục theo tìm kiếm và trạng thái
  const filteredCategories = categories.filter((c) => {
    const matchSearch =
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.slug || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPosts = Object.values(postCounts).reduce((a, b) => a + b, 0);
  const activeCount = categories.filter((c) => c.status === 'active').length;
  const inactiveCount = categories.filter((c) => c.status === 'inactive').length;

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link to="/admin/posts" className="hover:text-[#d4ff00] transition-colors flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Quản lý Bài viết
            </Link>
            <span>/</span>
            <span className="text-gray-200 font-semibold">Danh mục Bài viết</span>
          </div>
          <h1 className="text-3xl font-bold">Quản lý Danh mục Bài viết</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Quản lý các chuyên mục tin tức công nghệ, đánh giá và cẩm nang cấu hình
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/posts"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#222] hover:bg-[#333] border border-[#444] text-white font-medium rounded-lg transition-colors text-sm"
          >
            <FileText className="w-4 h-4 text-[#d4ff00]" /> Bài viết ({totalPosts})
          </Link>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-black border border-[#D3FC00] text-[#D3FC00] font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(211,252,0,0.15)] hover:bg-[#D3FC00]/10 text-sm"
          >
            <Plus className="w-5 h-5" /> Thêm danh mục
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#141414] border border-[#333] rounded-xl p-4.5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/30 flex items-center justify-center text-[#d4ff00]">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Tổng danh mục</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{categories.length}</div>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#333] rounded-xl p-4.5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/30 flex items-center justify-center text-[#d4ff00]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Đang hiển thị</div>
            <div className="text-2xl font-extrabold text-[#d4ff00] mt-0.5">{activeCount}</div>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#333] rounded-xl p-4.5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Đã ẩn / Tắt</div>
            <div className="text-2xl font-extrabold text-gray-300 mt-0.5">{inactiveCount}</div>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#333] rounded-xl p-4.5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Tổng bài viết</div>
            <div className="text-2xl font-extrabold text-blue-400 mt-0.5">{totalPosts}</div>
          </div>
        </div>
      </div>

      {/* Thanh Tìm kiếm & Bộ lọc */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên danh mục, đường dẫn slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm outline-none focus:border-[#d4ff00] text-white placeholder-gray-400 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1e1e1e] border border-[#333] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] min-w-[170px] text-white cursor-pointer"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã ẩn</option>
        </select>
      </div>

      {/* Bảng Danh sách Danh mục */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] text-gray-400 border-b border-[#333] font-medium">
              <tr>
                <th className="px-6 py-4 font-medium">ẢNH</th>
                <th className="px-6 py-4 font-medium">TÊN DANH MỤC</th>
                <th className="px-6 py-4 font-medium">SLUG (URL)</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap text-center">BÀI VIẾT</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">TRẠNG THÁI</th>
                <th className="px-6 py-4 font-medium text-right whitespace-nowrap">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#d4ff00]" />
                      <span>Đang tải danh mục bài viết...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => {
                  const count = postCounts[cat._id] || 0;
                  return (
                    <tr key={cat._id} className="hover:bg-[#1e1e1e] transition-colors">
                      {/* Ảnh */}
                      <td className="px-6 py-4">
                        {cat.image ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#333] bg-black/40 shrink-0">
                            <img
                              src={cat.image.startsWith('http') ? cat.image : `${API_BASE}${cat.image}`}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-[#333] bg-[#1a1a24] flex items-center justify-center text-gray-500 shrink-0">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>

                      {/* Tên */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-white hover:text-[#d4ff00] transition-colors text-base">
                          {cat.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          ID: {cat._id?.slice(-8)}
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-400 bg-[#1e1e1e] px-2.5 py-1 rounded-lg border border-[#333]">
                          /{cat.slug}
                        </span>
                      </td>

                      {/* Số lượng bài viết */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <Link
                          to={`/admin/posts`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-[#d4ff00] hover:bg-[#d4ff00]/20 transition-colors"
                          title="Xem các bài viết thuộc danh mục này"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {count} bài viết
                        </Link>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cat.status === 'active' ? (
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[#d4ff00]/10 text-[#d4ff00]">
                            Đang hiển thị
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400">
                            Đã ẩn / Tắt
                          </span>
                        )}
                      </td>

                      {/* Hành động */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(cat)}
                            className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-yellow-400 transition-colors"
                            title={cat.status === 'active' ? 'Ẩn danh mục' : 'Hiện danh mục'}
                          >
                            {cat.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-[#d4ff00] transition-colors"
                            title="Chỉnh sửa danh mục"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteDialog({ open: true, category: cat })}
                            className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-red-400 transition-colors"
                            title="Xóa danh mục"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy danh mục bài viết nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <PostCategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSuccess={() => {
          setIsModalOpen(false);
          loadData();
        }}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialog.open}
        category={deleteDialog.category}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, category: null })}
      />
    </div>
  );
};

export default PostCategories;
