import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Settings2,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Award,
  ArrowUpDown,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAdminProducts, fetchCategories, deleteProduct, toggleProductStatus, API_BASE } from '../services/adminService';
import ProductFormModal from '../components/ProductFormModal';
import VariantManagementModal from '../components/VariantManagementModal';
import BrandManagementModal from '../components/BrandManagementModal';

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
            <h3 className="font-bold text-lg">Xác nhận xóa (Soft Delete)</h3>
            <p className="text-xs text-gray-400 mt-0.5">Sản phẩm sẽ chuyển sang trạng thái Ẩn</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
          Bạn có chắc muốn ẩn sản phẩm{' '}
          <span className="font-semibold text-white">"{productName}"</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-gray-300 border border-[#444] rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50">
            Hủy bỏ
          </button>
          <button onClick={onConfirm} disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isLoading ? 'Đang ẩn...' : 'Ẩn sản phẩm'}
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
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock'
  const [stockSort, setStockSort] = useState('none'); // 'none' | 'desc' | 'asc'

  // State Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset về trang 1 khi filter hoặc tìm kiếm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, stockFilter, stockSort]);

  const getTotalStock = (product) => product.Variants?.reduce((s, v) => s + (v.stock_quantity || 0), 0) || 0;

  // Kiểm tra nếu có ít nhất 1 biến thể có số lượng < 10 (hàng sắp hết)
  const hasLowStockVariant = (product) => {
    if (product.Variants && product.Variants.length > 0) {
      return product.Variants.some((v) => Number(v.stock_quantity || 0) < 10);
    }
    return Number(product.stock_quantity || 0) < 10;
  };

  // Hàng tồn: tất cả biến thể có số lượng >= 10
  const isHealthyInStock = (product) => {
    if (product.Variants && product.Variants.length > 0) {
      return product.Variants.every((v) => Number(v.stock_quantity || 0) >= 10);
    }
    return Number(product.stock_quantity || 0) >= 10;
  };

  // Thông báo nhỏ hiển thị bên dưới
  const getLowStockNotice = (product) => {
    if (!product.Variants || product.Variants.length === 0) {
      return Number(product.stock_quantity || 0) < 10 ? 'Sắp hết hàng' : null;
    }
    const lowCount = product.Variants.filter((v) => Number(v.stock_quantity || 0) < 10).length;
    if (lowCount === 0) return null;
    if (product.Variants.length === 1) return 'Sắp hết hàng';
    if (lowCount === product.Variants.length) return 'Tất cả biến thể sắp hết';
    return 'Có biến thể sắp hết';
  };

  const handleToggleStockSort = () => {
    setStockSort((prev) => {
      if (prev === 'none') return 'desc';
      if (prev === 'desc') return 'asc';
      return 'none';
    });
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([fetchAdminProducts(), fetchCategories()]);
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
    let result = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const catId = p.cat_id?._id || p.cat_id || '';
      const matchCat = selectedCategory ? catId === selectedCategory : true;

      let matchStock = true;
      if (stockFilter === 'in_stock') {
        matchStock = isHealthyInStock(p);
      } else if (stockFilter === 'low_stock') {
        matchStock = hasLowStockVariant(p);
      }

      return matchSearch && matchCat && matchStock;
    });

    // Sắp xếp:
    // "hàng tồn sẽ hiển thị các sản phẩm mà biến thể của nó có số lượng lớn hơn 10 sắp xếp từ cao đến thấp"
    if (stockFilter === 'in_stock') {
      result = [...result].sort((a, b) => getTotalStock(b) - getTotalStock(a));
    } else if (stockFilter === 'low_stock') {
      result = [...result].sort((a, b) => getTotalStock(a) - getTotalStock(b));
    } else if (stockSort === 'desc') {
      result = [...result].sort((a, b) => getTotalStock(b) - getTotalStock(a));
    } else if (stockSort === 'asc') {
      result = [...result].sort((a, b) => getTotalStock(a) - getTotalStock(b));
    }

    return result;
  }, [products, searchQuery, selectedCategory, stockFilter, stockSort]);

  // Logic Phân Trang
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safePage, pageSize]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, safePage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

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
      toast.success(`Đã ẩn sản phẩm "${deleteDialog.product.name}"`);
      setDeleteDialog({ open: false, product: null });
      loadData();
    } catch (err) {
      toast.error('Lỗi: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getImageUrl = (product) => {
    const mainImg = product.AnhSP?.find((img) => img.is_main) || product.AnhSP?.[0];
    if (mainImg?.url) return mainImg.url.startsWith('http') ? mainImg.url : `${API_BASE}${mainImg.url}`;
    if (product.thumnail) return product.thumnail.startsWith('http') ? product.thumnail : `${API_BASE}${product.thumnail}`;
    return null;
  };

  const getDisplayPrice = (product) => {
    const v = product.Variants?.find((v) => v.variant_name === 'Mặc định') || product.Variants?.[0];
    return v ? { price: v.price || 0, salePrice: v.sale_price > 0 ? v.sale_price : null } : { price: 0, salePrice: null };
  };

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Sản phẩm</h1>
          <p className="text-gray-400 text-sm">{products.length} sản phẩm trong hệ thống</p>
        </div>
        {/* Nút Thêm Sản phẩm */}
        <button
          onClick={() => { setEditingProduct(null); setIsFormModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-black border border-[#D3FC00] text-[#D3FC00] font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(211,252,0,0.15)] hover:bg-[#D3FC00]/10"
        >
          <Plus className="w-5 h-5" /> Thêm Sản phẩm
        </button>
      </div>

      <div className="bg-[#141414] border border-[#333] rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#333] rounded-lg text-xs focus:border-[#d4ff00] outline-none text-white placeholder-gray-400 transition-colors" />
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Bộ lọc tồn kho */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-xs focus:border-[#d4ff00] outline-none text-white cursor-pointer"
          >
            <option value="all">Tất cả sản phẩm ({products.length})</option>
            <option value="in_stock">Hàng tồn</option>
            <option value="low_stock">Hàng sắp hết</option>
          </select>

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-xs focus:border-[#d4ff00] outline-none text-white cursor-pointer">
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <span className="text-xs text-gray-500 whitespace-nowrap">{filteredProducts.length} kết quả</span>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-3.5 py-3 font-semibold whitespace-nowrap">Sản phẩm</th>
                <th className="px-3.5 py-3 font-semibold whitespace-nowrap">Danh mục</th>
                <th className="px-3.5 py-3 font-semibold whitespace-nowrap">Giá bán</th>
                <th
                  className="px-3.5 py-3 font-semibold whitespace-nowrap cursor-pointer hover:text-white select-none transition-colors"
                  onClick={handleToggleStockSort}
                  title="Bấm để đổi sắp xếp tồn kho: Cao → Thấp / Thấp → Cao"
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>Tồn kho / Biến thể</span>
                    {stockSort === 'desc' ? (
                      <ArrowDownWideNarrow className="w-4 h-4 text-[#d4ff00]" />
                    ) : stockSort === 'asc' ? (
                      <ArrowUpWideNarrow className="w-4 h-4 text-blue-400" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </div>
                </th>
                <th className="px-3.5 py-3 font-semibold whitespace-nowrap">Trạng thái</th>
                <th className="px-3.5 py-3 font-semibold text-right whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d4ff00] mx-auto mb-3" />
                    <p className="text-gray-500 text-xs">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || selectedCategory ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có sản phẩm nào.'}
                  </td>
                </tr>
              ) : paginatedProducts.map((product) => {
                const imgUrl = getImageUrl(product);
                const { price, salePrice } = getDisplayPrice(product);
                const isActive = product.status === 'active';
                return (
                  <tr key={product._id} className="hover:bg-[#1e1e1e] transition-colors">
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-3">
                        {imgUrl ? (
                          <img src={imgUrl} alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-[#333] shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-gray-500">N/A</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold max-w-[180px] truncate text-xs" title={product.name}>{product.name}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{product.brand_id?.name || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-gray-300 text-xs whitespace-nowrap">{product.cat_id?.name || '—'}</td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="font-bold text-[#d4ff00] text-xs">{(salePrice || price).toLocaleString('vi-VN')}₫</span>
                        {salePrice && <span className="text-[11px] text-gray-500 line-through">{price.toLocaleString('vi-VN')}₫</span>}
                      </div>
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
                        <span className="text-gray-300 font-medium">{getTotalStock(product)} trong kho</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-[11px] text-gray-400">{product.Variants?.length || 0} biến thể</span>
                      </div>
                      {getLowStockNotice(product) && (
                        <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5 font-medium whitespace-nowrap">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{getLowStockNotice(product)}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${isActive ? 'bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                        {isActive ? 'Đang bán' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5 whitespace-nowrap">
                        <button onClick={() => { setEditingProduct(product); setIsVariantModalOpen(true); }}
                          className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-[#d4ff00] transition-colors" title="Quản lý biến thể">
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditingProduct(product); setIsFormModalOpen(true); }}
                          className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors" title="Sửa sản phẩm">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleToggleStatus(product)}
                          className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                          title={isActive ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}>
                          {isActive ? <Eye className="w-3.5 h-3.5 text-[#d4ff00]" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Thanh Phân Trang (Pagination Controls) */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="bg-[#191919] border-t border-[#333] px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Thông tin số lượng & Chọn dòng / trang */}
            <div className="flex items-center gap-4 text-gray-400">
              <span>
                Hiển thị <strong className="text-white">{(safePage - 1) * pageSize + 1}</strong> - <strong className="text-white">{Math.min(safePage * pageSize, filteredProducts.length)}</strong> trên tổng số <strong className="text-[#d4ff00]">{filteredProducts.length.toLocaleString('vi-VN')}</strong> sản phẩm
              </span>

              <div className="flex items-center gap-2">
                <span>Hiển thị:</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#1f1f1f] border border-[#333] rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-[#d4ff00] cursor-pointer"
                >
                  <option value={15}>15 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
              </div>
            </div>

            {/* Các nút chuyển trang */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white hover:border-[#d4ff00] disabled:opacity-30 disabled:hover:border-[#333] disabled:cursor-not-allowed transition-colors"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white hover:border-[#d4ff00] disabled:opacity-30 disabled:hover:border-[#333] disabled:cursor-not-allowed transition-colors"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNumbers.map(pageNum => (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg font-bold transition-all ${
                    safePage === pageNum
                      ? 'bg-[#d4ff00] text-black shadow-md shadow-[#d4ff00]/20'
                      : 'bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white hover:border-[#555]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white hover:border-[#d4ff00] disabled:opacity-30 disabled:hover:border-[#333] disabled:cursor-not-allowed transition-colors"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white hover:border-[#d4ff00] disabled:opacity-30 disabled:hover:border-[#333] disabled:cursor-not-allowed transition-colors"
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ProductFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}
        product={editingProduct} categories={categories} onSuccess={() => { setIsFormModalOpen(false); loadData(); }} />
      <VariantManagementModal isOpen={isVariantModalOpen} onClose={() => setIsVariantModalOpen(false)} product={editingProduct} onSuccess={loadData} />
      <BrandManagementModal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} onSuccess={loadData} />
      <ConfirmDeleteDialog isOpen={deleteDialog.open} productName={deleteDialog.product?.name}
        onConfirm={handleDeleteConfirm} onCancel={() => setDeleteDialog({ open: false, product: null })} isLoading={isDeleting} />
    </div>
  );
};

export default Products;
