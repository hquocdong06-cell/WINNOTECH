import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Loader2, AlertTriangle, FileText, FolderOpen, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchPosts, fetchPostCategories, createPost, updatePost, deletePost, uploadImage, API_BASE } from '../services/adminService';

// ——— Component Dialog xác nhận xóa (Soft Delete) ———
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
            <h3 className="font-bold text-lg">Ẩn Bài Viết (Soft Delete)</h3>
            <p className="text-xs text-gray-400 mt-0.5">Bài viết sẽ chuyển sang trạng thái Ẩn</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
          Bạn có chắc muốn chuyển bài viết <span className="font-semibold text-white">"{postTitle}"</span> sang trạng thái Ẩn?
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
            {isLoading ? 'Đang ẩn...' : 'Ẩn bài viết'}
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
        image: post.image || post.thumnail || '',
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
                      src={formData.image.startsWith('http') ? formData.image : `${API_BASE}${formData.image}`} 
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

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('/src/')) return url;
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Title */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Bài viết</h1>
          <p className="text-gray-400 text-sm">Quản lý bài viết hướng dẫn cấu hình, tin tức công nghệ</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/post-categories"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#222] hover:bg-[#333] border border-[#444] text-white font-medium rounded-lg transition-colors text-sm"
          >
            <FolderOpen className="w-4 h-4 text-[#d4ff00]" /> Danh mục bài viết
          </Link>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-black border border-[#D3FC00] text-[#D3FC00] font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(211,252,0,0.15)] hover:bg-[#D3FC00]/10 text-sm"
          >
            <Plus className="w-5 h-5" /> Thêm bài viết
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white placeholder-gray-400 transition-colors"
          />
        </div>

        {/* Category & Results count */}
        <div className="flex items-center gap-3">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-[#1e1e1e] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white cursor-pointer"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500 whitespace-nowrap">{filteredPosts.length} kết quả</span>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#d4ff00]" />
            <p className="text-sm">Đang tải dữ liệu bài viết...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
            <FileText className="w-12 h-12 text-gray-600" />
            <p className="text-sm">Không tìm thấy bài viết nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400 font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium whitespace-nowrap w-24">HÌNH ẢNH</th>
                  <th className="px-6 py-4 font-medium min-w-[260px]">TIÊU ĐỀ BÀI VIẾT</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">DANH MỤC</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">TRẠNG THÁI</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">NGÀY ĐĂNG</th>
                  <th className="px-6 py-4 font-medium text-right whitespace-nowrap">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {filteredPosts.map(post => {
                  const postImg = post.thumnail || post.image;
                  const imgUrl = getImageUrl(postImg);

                  return (
                    <tr key={post._id} className="hover:bg-[#1e1e1e] transition-colors">
                      {/* Hình ảnh */}
                      <td className="px-6 py-4 whitespace-nowrap w-24">
                        <div className="w-20 h-14 bg-white/5 border border-[#333] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={post.tittle}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </td>

                      {/* Tiêu đề & Slug */}
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="font-bold text-white text-base leading-snug line-clamp-2" title={post.tittle}>
                          {post.tittle}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1 break-all">
                          {post.slug}
                        </div>
                      </td>

                      {/* Danh mục */}
                      <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                        <span className="inline-block bg-[#222] border border-[#333] px-3 py-1 rounded text-xs whitespace-nowrap font-medium">
                          {post.categories_post_id?.name || 'Chưa phân loại'}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          post.status === 'published'
                            ? 'bg-[#d4ff00]/10 text-[#d4ff00]'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {post.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                        </span>
                      </td>

                      {/* Ngày đăng */}
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap font-mono text-xs">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>

                      {/* Hành động */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditModal(post)}
                            className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-[#d4ff00] transition-colors"
                            title="Chỉnh sửa bài viết"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteDialog(post)}
                            className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-red-400 transition-colors"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
