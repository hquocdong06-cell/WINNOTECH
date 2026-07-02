import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Search, Settings2, Edit, Eye, EyeOff, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchProducts, fetchCategories, deleteProduct, toggleProductStatus } from '../services/adminService';
import ProductFormModal from '../components/ProductFormModal';
import VariantManagementModal from '../components/VariantManagementModal';

const ConfirmDeleteDialog = ({ isOpen, productName, onConfirm, onCancel, isLoading }) => {
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
          Bạn có chắc muốn xóa sản phẩm{' '}
          <span className="font-semibold text-white">"{productName}"</span>?
          <br />
          <span className="text-yellow-400 text-xs mt-1 block">
            Tất cả biến thể và ảnh của sản phẩm này cũng sẽ bị xóa.
          </span>
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-gray-300 border border-[#444] rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50">
            Hủy bỏ
          </button>
          <button onClick={onConfirm} disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isLoading ? 'Đang xóa...' : 'Xóa sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      toast.error('Không thể tải dữ liệu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const catId = p.cat_id?._id || p.cat_id || '';
      const matchCat = selectedCategory ? catId === selectedCategory : true;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'hidden' : 'active';
    try {
      await toggleProductStatus(product._id, newStatus);
      toast.success(newStatus === 'active' ? 'Đã hiện sản phẩm' : 'Đã ẩn sản phẩm');
      setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, status: newStatus } : p));
    } catch (err) {
      toast.error('Lỗi: ' + err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteDialog.product._id);
      toast.success(`Đã xóa sản phẩm "${deleteDialog.product.name}"`);
      setDeleteDialog({ open: false, product: null });
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getImageUrl = (product) => {
    const mainImg = product.AnhSP?.find((img) => img.is_main) || product.AnhSP?.[0];
    if (mainImg?.url) return mainImg.url.startsWith('http') ? mainImg.url : `http://localhost:3000${mainImg.url}`;
    if (product.thumnail) return product.thumnail.startsWith('http') ? product.thumnail : `http://localhost:3000${product.thumnail}`;
    return null;
  };

  const getDisplayPrice = (product) => {
    const v = product.Variants?.find((v) => v.variant_name === 'Mặc định') || product.Variants?.[0];
    return v ? { price: v.price || 0, salePrice: v.sale_price > 0 ? v.sale_price : null } : { price: 0, salePrice: null };
  };

  const getTotalStock = (product) => product.Variants?.reduce((s, v) => s + (v.stock_quantity || 0), 0) || 0;

  return (
    <div className="p-8 text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Sản phẩm</h1>
          <p className="text-gray-400 text-sm">{products.length} sản phẩm trong hệ thống</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setIsFormModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(212,255,0,0.2)]">
          <Plus className="w-5 h-5" /> Thêm Sản phẩm
        </button>
      </div>

      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white transition-colors" />
        </div>
        <div className="flex gap-4 items-center">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1e1e1e] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white">
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <span className="text-sm text-gray-500">{filteredProducts.length} kết quả</span>
        </div>
      </div>

      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Sản phẩm</th>
              <th className="px-6 py-4 font-medium">Danh mục</th>
              <th className="px-6 py-4 font-medium">Giá bán</th>
              <th className="px-6 py-4 font-medium">Tồn kho / Biến thể</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#d4ff00] mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                  {searchQuery || selectedCategory ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có sản phẩm nào.'}
                </td>
              </tr>
            ) : filteredProducts.map((product) => {
              const imgUrl = getImageUrl(product);
              const { price, salePrice } = getDisplayPrice(product);
              const isActive = product.status === 'active';
              return (
                <tr key={product._id} className="hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-[#333] shrink-0"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center shrink-0">
                          <span className="text-xs text-gray-500">N/A</span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold line-clamp-1">{product.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{product.brand_id?.name || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{product.cat_id?.name || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#d4ff00]">{(salePrice || price).toLocaleString('vi-VN')}đ</div>
                    {salePrice && <div className="text-xs text-gray-500 line-through">{price.toLocaleString('vi-VN')}đ</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-300">{getTotalStock(product)} trong kho</div>
                    <div className="text-xs text-gray-500 mt-1">{product.Variants?.length || 0} biến thể</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-[#d4ff00]/10 text-[#d4ff00]' : 'bg-gray-800 text-gray-400'}`}>
                      {isActive ? 'Đang bán' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingProduct(product); setIsVariantModalOpen(true); }}
                        className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-[#d4ff00] transition-colors" title="Quản lý biến thể">
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditingProduct(product); setIsFormModalOpen(true); }}
                        className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-blue-400 transition-colors" title="Sửa sản phẩm">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleStatus(product)}
                        className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-white transition-colors"
                        title={isActive ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}>
                        {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                      </button>
                      <button onClick={() => setDeleteDialog({ open: true, product })}
                        className="p-2 bg-[#222] hover:bg-red-500/20 border border-[#444] hover:border-red-500/50 rounded-md text-gray-300 hover:text-red-500 transition-colors" title="Xóa sản phẩm">
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

      <ProductFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}
        product={editingProduct} categories={categories} onSuccess={() => { setIsFormModalOpen(false); loadData(); }} />
      <VariantManagementModal isOpen={isVariantModalOpen} onClose={() => setIsVariantModalOpen(false)} product={editingProduct} />
      <ConfirmDeleteDialog isOpen={deleteDialog.open} productName={deleteDialog.product?.name}
        onConfirm={handleDeleteConfirm} onCancel={() => setDeleteDialog({ open: false, product: null })} isLoading={isDeleting} />
    </div>
  );
};

export default Products;
