import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchPosts, fetchPostCategories, createPost, updatePost, deletePost, uploadImage } from '../services/adminService';

// ——— Component Dialog xác nhận xóa ———
const ConfirmDeleteDialog = ({ isOpen, postTitle, onConfirm, onCancel, isLoading }) => {
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
          Bạn có chắc muốn xóa bài viết <span className="font-semibold text-white">"{postTitle}"</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-gray-300 border border-[#444] rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isLoading ? 'Đang xóa...' : 'Xóa bài viết'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ——— Component Modal Thêm / Sửa Bài Viết ———
const PostFormModal = ({ isOpen, onClose, onSuccess, post, categories }) => {
  const [formData, setFormData] = useState({
    tittle: '',
    slug: '',
    categories_post_id: '',
    status: 'draft',
    image: '',
    content: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        tittle: post.tittle || '',
        slug: post.slug || '',
        categories_post_id: post.categories_post_id?._id || post.categories_post_id || '',
        status: post.status || 'draft',
        image: post.image || '',
        content: post.content || ''
      });
    } else {
      setFormData({
        tittle: '',
        slug: '',
        categories_post_id: categories[0]?._id || '',
        status: 'draft',
        image: '',
        content: ''
      });
    }
  }, [post, categories]);

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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        image: result.url
      }));
      toast.success('Upload ảnh thành công!');
    } catch (err) {
      toast.error('Upload ảnh thất bại: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      tittle: val,
      slug: post ? prev.slug : generateSlug(val) // chỉ tự tạo slug khi là bài viết mới
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.tittle || !formData.slug || !formData.content) {
      toast.error('Vui lòng điền đầy đủ Tiêu đề, Slug và Nội dung!');
      return;
    }

    setIsSaving(true);
    try {
      if (post) {
        await updatePost(post._id, formData);
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await createPost(formData);
        toast.success('Tạo bài viết mới thành công!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu bài viết');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111] border border-[#222] rounded-xl w-full max-w-2xl text-white shadow-2xl my-8">
        <div className="p-6 border-b border-[#222] flex justify-between items-center">
          <h2 className="text-xl font-bold font-oswald text-yellow-400">
            {post ? 'CHỈNH SỬA BÀI VIẾT' : 'THÊM BÀI VIẾT MỚI'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold">✕</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Tiêu đề & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Tiêu đề bài viết <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.tittle}
                onChange={handleTitleChange}
                placeholder="Nhập tiêu đề"
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Slug đường dẫn <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="duong-dan-bai-viet"
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none text-white"
                required
              />
            </div>
          </div>

          {/* Danh mục & Trạng thái & Ảnh */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Danh mục bài viết</label>
              <select
                value={formData.categories_post_id}
                onChange={(e) => setFormData({ ...formData, categories_post_id: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none text-white"
              >
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none text-white"
              >
                <option value="draft">Nháp (Draft)</option>
                <option value="published">Xuất bản (Published)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Ảnh bài viết / Thumbnail</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="post-image-file"
                />
                <label
                  htmlFor="post-image-file"
                  className="bg-[#222] border border-[#333] hover:bg-[#333] text-white px-3 py-2 rounded text-xs cursor-pointer font-semibold transition flex items-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '📁 Chọn ảnh'}
                </label>
                {formData.image && (
                  <div className="relative w-10 h-10 border border-[#333] rounded overflow-hidden">
                    <img 
                      src={formData.image.startsWith('http') ? formData.image : `http://localhost:3000${formData.image}`} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nội dung soạn thảo */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Nội dung bài viết (Hỗ trợ định dạng HTML) <span className="text-red-500">*</span></label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Có thể sử dụng thẻ HTML để trang trí bài viết (VD: <p><b>Nội dung</b></p>...)"
              rows={8}
              className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-2 text-sm focus:border-yellow-400 outline-none font-mono text-white"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#333] rounded hover:bg-[#222] transition text-sm"
              disabled={isSaving}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-5 py-2 rounded transition text-sm flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {post ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ——— MAIN COMPONENT: POSTS ———
const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Delete modal state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, post: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allPosts, allCats] = await Promise.all([
        fetchPosts(),
        fetchPostCategories()
      ]);
      setPosts(allPosts);
      setCategories(allCats);
    } catch (err) {
      toast.error('Lỗi lấy dữ liệu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (post) => {
    setDeleteDialog({ open: true, post });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.post) return;
    setIsDeleting(true);
    try {
      await deletePost(deleteDialog.post._id);
      toast.success('Xóa bài viết thành công!');
      setDeleteDialog({ open: false, post: null });
      loadData();
    } catch (err) {
      toast.error('Lỗi khi xóa bài viết: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const titleMatch = post.tittle?.toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = selectedCat === 'all' || post.categories_post_id?._id === selectedCat;
    return titleMatch && catMatch;
  });

  return (
    <div className="admin-page text-white p-6">
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-oswald text-yellow-400">QUẢN LÝ BÀI VIẾT / BLOG</h1>
          <p className="text-gray-400 text-xs mt-1">Quản lý bài viết hướng dẫn cấu hình, tin tức công nghệ</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
        >
          <Plus className="w-4 h-4" /> Thêm bài viết
        </button>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-yellow-400 outline-none"
          />
        </div>

        {/* Category */}
        <div className="w-full sm:w-48">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
            <p className="text-sm">Đang tải dữ liệu bài viết...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
            <FileText className="w-12 h-12 text-gray-600" />
            <p className="text-sm">Không tìm thấy bài viết nào.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#1a1a1a]/50 text-gray-400 text-xs font-semibold uppercase">
                <th className="p-4">Tiêu đề bài viết</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày đăng</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => (
                <tr key={post._id} className="border-b border-[#222] hover:bg-[#1e1e1e]/20 transition-colors text-sm">
                  <td className="p-4 font-semibold text-white">
                    <div>{post.tittle}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{post.slug}</div>
                  </td>
                  <td className="p-4 text-gray-300">
                    <span className="bg-[#222] px-2.5 py-1 rounded text-xs">
                      {post.categories_post_id?.name || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      post.status === 'published'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {post.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : ''}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleOpenEditModal(post)}
                        className="p-1.5 bg-[#222] hover:bg-blue-600 hover:text-white rounded transition"
                        title="Chỉnh sửa bài viết"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteDialog(post)}
                        className="p-1.5 bg-[#222] hover:bg-red-600 hover:text-white rounded transition"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Form Modal */}
      <PostFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadData();
        }}
        post={editingPost}
        categories={categories}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={deleteDialog.open}
        postTitle={deleteDialog.post?.tittle || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, post: null })}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Posts;
