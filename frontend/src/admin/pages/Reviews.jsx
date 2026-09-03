import React, { useState, useEffect, useCallback } from 'react';
import { Search, Star, MessageSquare, User, Package, Calendar, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchReviewsFilter, toggleReviewStatus, API_BASE } from '../services/adminService';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReviewsFilter({});
      setReviews(data);
    } catch (err) {
      setError(err.message || 'Lỗi kết nối server');
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleStatus = async (r) => {
    try {
      const newStatus = r.status === 'hidden' ? 'active' : 'hidden';
      await toggleReviewStatus(r._id, newStatus);
      toast.success(newStatus === 'hidden' ? 'Đã ẩn đánh giá' : 'Đã hiển thị đánh giá');
      setReviews((prev) =>
        prev.map((item) => (item._id === r._id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      toast.error(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);



  const getCustomerName = (r) => {
    try {
      return (
        r.id_oderitems?.order_id?.user_id?.name ||
        r.id_oderitems?.order_id?.user_id?.email ||
        r.id_oderitems?.order_id?.Name ||
        'Khách hàng vãng lai'
      );
    } catch {
      return 'Khách hàng vãng lai';
    }
  };

  const getProductName = (r) => {
    try {
      return r.id_oderitems?.variants_id?.p_id?.name || 'Sản phẩm WINNOTECH';
    } catch {
      return 'Sản phẩm WINNOTECH';
    }
  };

  const getProductImage = (r) => {
    try {
      const p = r.id_oderitems?.variants_id?.p_id;
      const img = p?.thumnail || p?.image || r.id_oderitems?.variants_id?.image;
      if (!img) return 'https://placehold.co/80';
      return img.startsWith('http') ? img : `${API_BASE}${img}`;
    } catch {
      return 'https://placehold.co/80';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filtered = reviews.filter((r) => {
    const matchSearch =
      search.trim() === '' ||
      getCustomerName(r).toLowerCase().includes(search.toLowerCase()) ||
      getProductName(r).toLowerCase().includes(search.toLowerCase()) ||
      (r.content || '').toLowerCase().includes(search.toLowerCase());

    const matchStar = starFilter === 'all' || (r.star_number || 0) === Number(starFilter);
    return matchSearch && matchStar;
  });

  const avgStar = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + (curr.star_number || 0), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Đánh Giá & Phản Hồi Sản Phẩm</h1>
          <p className="text-gray-400 text-sm">
            Tất cả bình luận đánh giá thực tế từ khách hàng — Điểm trung bình: <strong className="text-yellow-400">★ {avgStar} / 5</strong>
          </p>
        </div>
      </div>

      {/* Grid Thống kê điểm số */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <button
          onClick={() => setStarFilter('all')}
          className={`p-3 rounded-xl border text-center transition-all ${
            starFilter === 'all' ? 'border-[#d4ff00] bg-[#d4ff00]/10 text-[#d4ff00]' : 'border-[#262626] bg-[#141414] hover:bg-[#1a1a1a] text-white'
          }`}
        >
          <div className="text-xl font-bold">{reviews.length}</div>
          <div className="text-xs text-gray-400 mt-1">Tất cả sao</div>
        </button>
        {[5, 4, 3, 2, 1].map((s) => {
          const count = reviews.filter(r => (r.star_number || 0) === s).length;
          return (
            <button
              key={s}
              onClick={() => setStarFilter(String(s))}
              className={`p-3 rounded-xl border text-center transition-all ${
                starFilter === String(s) ? 'border-[#d4ff00] bg-[#d4ff00]/10' : 'border-[#262626] bg-[#141414] hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                {s} <Star className="w-4 h-4 fill-yellow-400" />
              </div>
              <div className="text-xs text-gray-400 mt-1">{count} đánh giá</div>
            </button>
          );
        })}
      </div>

      {/* Thanh tìm kiếm */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo khách hàng, tên sản phẩm, bình luận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1f1f1f] border border-[#333] rounded-lg text-xs outline-none focus:border-[#d4ff00] text-white placeholder-gray-400"
          />
        </div>
        <select
          value={starFilter}
          onChange={(e) => setStarFilter(e.target.value)}
          className="bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#d4ff00] min-w-[180px] text-white"
        >
          <option value="all">Tất cả mốc sao</option>
          <option value="5">5 Sao ⭐⭐⭐⭐⭐</option>
          <option value="4">4 Sao ⭐⭐⭐⭐</option>
          <option value="3">3 Sao ⭐⭐⭐</option>
          <option value="2">2 Sao ⭐⭐</option>
          <option value="1">1 Sao ⭐</option>
        </select>
      </div>

      {/* Bảng Đánh Giá */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1f1f1f] text-gray-400 uppercase border-b border-[#262626]">
              <tr>
                <th className="px-5 py-3.5 font-semibold whitespace-nowrap">KHÁCH HÀNG</th>
                <th className="px-5 py-3.5 font-semibold whitespace-nowrap">SẢN PHẨM</th>
                <th className="px-5 py-3.5 font-semibold whitespace-nowrap">ĐÁNH GIÁ SAO</th>
                <th className="px-5 py-3.5 font-semibold">NỘI DUNG BÌNH LUẬN</th>
                <th className="px-5 py-3.5 font-semibold whitespace-nowrap">TRẠNG THÁI</th>
                <th className="px-5 py-3.5 font-semibold whitespace-nowrap">NGÀY ĐÁNH GIÁ</th>
                <th className="px-5 py-3.5 font-semibold text-right whitespace-nowrap">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Đang tải danh sách đánh giá...</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {getCustomerName(r)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={getProductImage(r)}
                          alt="Sản phẩm"
                          className="w-9 h-9 object-cover rounded-lg border border-[#444] shrink-0"
                        />
                        <span className="font-bold text-gray-200 truncate">{getProductName(r)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < (r.star_number || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">({r.star_number || 0}/5)</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300 max-w-[300px] text-xs leading-relaxed">
                      {r.content ? (
                        <div className="bg-[#1a1a1a] p-2.5 rounded-lg border border-[#262626]">
                          "{r.content}"
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Khách hàng không để lại nhận xét văn bản.</span>
                      )}
                      {Array.isArray(r.images) && r.images.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {r.images.map((imgUrl, imgIdx) => {
                            const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${API_BASE}${imgUrl}`;
                            return (
                              <img
                                key={imgIdx}
                                src={fullUrl}
                                alt="Ảnh đánh giá"
                                onClick={() => setPreviewImage(fullUrl)}
                                className="w-10 h-10 object-cover rounded-lg border border-[#444] cursor-pointer hover:scale-105 transition-transform"
                              />
                            );
                          })}
                        </div>
                      )}
                    </td>
                    {/* Trạng thái - Chuẩn Ảnh 2 */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        r.status === 'hidden'
                          ? 'bg-gray-800 text-gray-400'
                          : 'bg-[#d4ff00]/10 text-[#d4ff00]'
                      }`}>
                        {r.status === 'hidden' ? 'Đã ẩn' : 'Hiển thị'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-400 text-xs font-mono">
                      {formatDate(r.createdAt)}
                    </td>
                    {/* Hành động - Chuẩn Ảnh 3 */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(r)}
                          className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                          title={r.status === 'hidden' ? 'Hiện đánh giá' : 'Ẩn đánh giá'}
                        >
                          {r.status === 'hidden' ? (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-[#d4ff00]" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Chưa có đánh giá nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Phóng to ảnh đánh giá" className="max-w-full max-h-[90vh] rounded-2xl border border-[#333] shadow-2xl" />
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 bg-[#d4ff00] text-black font-extrabold rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>

);
};

export default Reviews;
