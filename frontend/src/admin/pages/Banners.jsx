import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Eye, EyeOff, Loader2, Image as ImageIcon, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAdminBanners, toggleAdminBannerStatus, API_BASE } from '../services/adminService';
import BannerFormModal from '../components/BannerFormModal';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Load danh sách Banner từ Backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminBanners();
      // Sắp xếp tăng dần theo position (vị trí số)
      const sortedData = (data || []).sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0));
      setBanners(sortedData);
    } catch (err) {
      toast.error('Không thể tải danh sách banner: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mở modal thêm banner mới
  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  // Mở modal sửa banner
  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  // Xử lý sau khi lưu form thành công
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  // Nút Toggle Đổi trạng thái Luân phiên 1-click (Active <-> Hidden)
  const handleToggleStatus = async (banner) => {
    setTogglingId(banner._id);
    try {
      const result = await toggleAdminBannerStatus(banner._id);
      const newStatus = result.data?.status || (banner.status === 'active' ? 'hidden' : 'active');
      toast.success(newStatus === 'active' ? `Đã kích hoạt banner "${banner.name}"` : `Đã ẩn banner "${banner.name}"`);
      
      // Cập nhật state trực tiếp cho mượt mà
      setBanners(prev => prev.map(b => b._id === banner._id ? { ...b, status: newStatus } : b));
    } catch (err) {
      toast.error(err.message || 'Lỗi khi đổi trạng thái banner');
    } finally {
      setTogglingId(null);
    }
  };

  // Lọc banner theo ô tìm kiếm
  const filteredBanners = banners.filter((b) =>
    (b.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  const activeCount = banners.filter(b => b.status === 'active').length;
  const hiddenCount = banners.filter(b => b.status === 'hidden').length;

  return (
    <div className="p-8 text-white min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight flex items-center gap-3">
            Quản lý Banner
          </h1>
          <p className="text-gray-400 text-sm">
            Quản lý tất cả hình ảnh banner hiển thị trên website theo vị trí thứ tự số
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 bg-[#1f1f1f] border border-[#333] hover:border-[#d4ff00]/50 rounded-lg text-gray-300 hover:text-white transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] text-black font-bold rounded-lg hover:bg-[#c0ea00] transition-colors text-sm shadow-lg shadow-[#d4ff00]/10"
          >
            <Plus className="w-5 h-5" />
            Thêm Banner mới
          </button>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Tổng số Banner</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{banners.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#222] flex items-center justify-center text-gray-300">
            🖼️
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Đang Hiển Thị (Active)</p>
            <h3 className="text-2xl font-bold mt-1 text-[#d4ff00]">{activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#d4ff00]/10 flex items-center justify-center text-[#d4ff00]">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Đã Ẩn (Hidden)</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-400">{hiddenCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm banner theo tên..."
            className="w-full pl-10 pr-4 py-2 bg-[#1f1f1f] border border-[#333] rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#d4ff00]"
          />
        </div>
      </div>

      {/* Bảng danh sách Banner */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#d4ff00]" />
            <p className="text-sm">Đang tải danh sách banner...</p>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-semibold">Chưa có banner nào</p>
            <p className="text-xs text-gray-500 mt-1">Bấm nút "Thêm Banner mới" ở trên để bắt đầu thêm mới banner</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#1f1f1f] text-gray-400 uppercase text-xs border-b border-[#262626]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">STT / Vị trí (`position`)</th>
                  <th className="py-3.5 px-6 font-semibold">Hình ảnh Banner</th>
                  <th className="py-3.5 px-6 font-semibold">Tên Banner</th>
                  <th className="py-3.5 px-6 font-semibold">Liên kết</th>
                  <th className="py-3.5 px-6 font-semibold">Trạng thái</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredBanners.map((banner, index) => {
                  const imgUrl = getImageUrl(banner.image);
                  const isActive = banner.status === 'active';
                  const isToggling = togglingId === banner._id;

                  return (
                    <tr key={banner._id || index} className="hover:bg-[#1a1a1a] transition-colors">
                      
                      {/* Vị trí hiển thị (Position) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-[#222] border border-[#333] text-[#d4ff00] font-bold text-xs flex items-center justify-center shadow-inner">
                            #{banner.position !== undefined ? banner.position : index + 1}
                          </span>
                        </div>
                      </td>

                      {/* Ảnh Preview */}
                      <td className="py-4 px-6">
                        <div className="w-28 h-16 rounded-lg bg-[#1a1a1a] border border-[#333] overflow-hidden flex items-center justify-center shrink-0 relative group">
                          {imgUrl ? (
                            <img 
                              src={imgUrl} 
                              alt={banner.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                      </td>

                      {/* Tên Banner */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-base max-w-xs truncate">
                          {banner.name}
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono">
                          ID: {banner._id}
                        </span>
                      </td>

                      {/* Link */}
                      <td className="py-4 px-6">
                        {banner.link ? (
                          <a 
                            href={banner.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-[#d4ff00] hover:underline flex items-center gap-1 max-w-[160px] truncate"
                          >
                            <span>{banner.link}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-600 italic">Không có</span>
                        )}
                      </td>

                      {/* Trạng thái (Active / Hidden) */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(banner)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-gray-800'
                          }`}
                          title="Bấm vào đây để chuyển đổi trạng thái luân phiên"
                        >
                          {isToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isActive ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                          <span>{isActive ? 'Active (Hiển thị)' : 'Hidden (Ẩn)'}</span>
                        </button>
                      </td>

                      {/* Nút thao tác Sửa (Không có nút Xóa) */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(banner)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#222] hover:bg-[#333] text-gray-200 border border-[#333] hover:border-[#d4ff00]/40 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#d4ff00]" />
                            Chỉnh sửa
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

      {/* Modal Form Thêm / Sửa Banner */}
      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banner={editingBanner}
        onSuccess={handleModalSuccess}
      />

    </div>
  );
};

export default Banners;
