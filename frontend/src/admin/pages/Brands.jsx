import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Search,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Package,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchAdminBrands,
  toggleAdminBrandStatus,
  fetchAdminProducts,
  API_BASE
} from '../services/adminService';
import BrandFormModal from '../components/BrandFormModal';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Load danh sách thương hiệu và đếm số sản phẩm
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [brandList, products] = await Promise.all([
        fetchAdminBrands(),
        fetchAdminProducts().catch(() => [])
      ]);

      setBrands(brandList || []);

      // Đếm số lượng sản phẩm theo brand_id
      const counts = {};
      (products || []).forEach((p) => {
        const bId = p.brand_id?._id || p.brand_id;
        if (bId) {
          counts[bId] = (counts[bId] || 0) + 1;
        }
      });
      setProductCounts(counts);
    } catch (err) {
      toast.error('Không thể tải danh sách thương hiệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Đổi trạng thái active / inactive
  const handleToggleStatus = async (brand) => {
    const nextStatus = brand.status === 'active' ? 'inactive' : 'active';
    const actionText = nextStatus === 'active' ? 'kích hoạt' : 'tạm ẩn';
    try {
      await toggleAdminBrandStatus(brand._id, nextStatus);
      toast.success(`Đã ${actionText} thương hiệu "${brand.name}"!`);
      setBrands((prev) =>
        prev.map((b) => (b._id === brand._id ? { ...b, status: nextStatus } : b))
      );
    } catch (err) {
      toast.error(err.message || 'Lỗi khi đổi trạng thái');
    }
  };

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  // Áp dụng tìm kiếm & lọc trạng thái
  const filteredBrands = brands.filter((b) => {
    const matchSearch =
      (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.slug || '').toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (b.status === 'active' || !b.status)) ||
      (statusFilter === 'inactive' && b.status === 'inactive');

    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Thương hiệu</h1>
          <p className="text-gray-400 text-sm">
            {brands.length} thương hiệu trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-black border border-[#D3FC00] text-[#D3FC00] font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(211,252,0,0.15)] hover:bg-[#D3FC00]/10 text-sm"
          >
            <Plus className="w-5 h-5" /> Thêm Thương hiệu
          </button>
        </div>
      </div>

      {/* Tìm kiếm & Lọc */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên thương hiệu, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white placeholder-gray-400 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1e1e1e] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm ẩn</option>
          </select>
          <span className="text-sm text-gray-500 whitespace-nowrap">{filteredBrands.length} kết quả</span>
        </div>
      </div>

      {/* Bảng Danh sách Thương hiệu */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] text-gray-400 border-b border-[#333] font-medium">
              <tr>
                <th className="px-6 py-4 font-medium">LOGO</th>
                <th className="px-6 py-4 font-medium">TÊN THƯƠNG HIỆU</th>
                <th className="px-6 py-4 font-medium">SL SẢN PHẨM</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">TRẠNG THÁI</th>
                <th className="px-6 py-4 font-medium text-right whitespace-nowrap">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#d4ff00] mb-2" />
                    <p className="text-sm">Đang tải danh sách thương hiệu...</p>
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy thương hiệu nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => {
                  const logoUrl = brand.logo || brand.image;
                  const fullLogo = logoUrl
                    ? logoUrl.startsWith('http')
                      ? logoUrl
                      : `${API_BASE}${logoUrl}`
                    : '';
                  const count = productCounts[brand._id] || 0;
                  const isActive = brand.status === 'active' || !brand.status;

                  return (
                    <tr key={brand._id} className="hover:bg-[#1e1e1e] transition-colors">
                      {/* Logo */}
                      <td className="px-6 py-4 w-24">
                        <div className="w-12 h-12 bg-white/5 border border-[#333] rounded-xl flex items-center justify-center p-1.5 overflow-hidden">
                          {fullLogo ? (
                            <img
                              src={fullLogo}
                              alt={brand.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-gray-500 font-bold text-xs uppercase">
                              {brand.name?.slice(0, 2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tên thương hiệu & Slug */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-base">{brand.name}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          slug: {brand.slug || '—'}
                        </div>
                      </td>

                      {/* Số lượng sản phẩm */}
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e1e1e] border border-[#333] text-gray-300 font-mono text-xs">
                          <Package className="w-3.5 h-3.5 text-[#d4ff00]" />
                          <span className="font-bold">{count}</span> sản phẩm
                        </div>
                      </td>

                      {/* Trạng thái (Click để đổi) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(brand)}
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[#d4ff00]/10 text-[#d4ff00] hover:bg-[#d4ff00]/20'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                          title="Click để đổi trạng thái"
                        >
                          {isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                        </button>
                      </td>

                      {/* Hành động: Chỉ Thêm, Sửa và Đổi status (KHÔNG CÓ NÚT XÓA) */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Nút Đổi trạng thái */}
                          <button
                            onClick={() => handleToggleStatus(brand)}
                            className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-yellow-400 transition-colors"
                            title={isActive ? 'Tạm ẩn thương hiệu' : 'Kích hoạt lại thương hiệu'}
                          >
                            {isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          {/* Nút Sửa */}
                          <button
                            onClick={() => handleOpenEdit(brand)}
                            className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-[#d4ff00] transition-colors"
                            title="Chỉnh sửa thông tin thương hiệu"
                          >
                            <Edit className="w-4 h-4" />
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
      </div>

      {/* Modal Thêm / Sửa Thương hiệu */}
      <BrandFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brand={editingBrand}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Brands;
