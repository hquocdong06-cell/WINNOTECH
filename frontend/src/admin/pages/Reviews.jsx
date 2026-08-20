import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Star, MessageSquare, User, Package, Calendar, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchReviewsFilter, toggleReviewStatus, API_BASE } from '../services/adminService';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState('all');

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

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleStatus = async (review) => {
    const nextStatus = review.status === 'hidden' ? 'active' : 'hidden';
    try {
      await toggleReviewStatus(review._id, nextStatus);
      toast.success(nextStatus === 'hidden' ? 'Đã ẩn đánh giá khỏi giao diện' : 'Đã hiện lại đánh giá');
      setReviews(prev => prev.map(r => r._id === review._id ? { ...r, status: nextStatus } : r));
    } catch (err) {
      toast.error(err.message || 'Lỗi đổi trạng thái đánh giá');
    }
  };

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
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#222] border border-[#333] hover:bg-[#333] text-white font-medium rounded-xl transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Grid Thống kê điểm số */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <button
          onClick={() => setStarFilter('all')}
          className={`p-3 rounded-2xl border text-center transition-all ${
            starFilter === 'all' ? 'border-[#d4ff00] bg-[#d4ff00]/10' : 'border-[#333] bg-[#14141d] hover:bg-[#1a1a24]'
          }`}
        >
          <div className="text-xl font-bold text-white">{reviews.length}</div>
          <div className="text-xs text-gray-400 mt-1">Tất cả sao</div>
        </button>
        {[5, 4, 3, 2, 1].map((s) => {
          const count = reviews.filter(r => (r.star_number || 0) === s).length;
          return (
            <button
              key={s}
              onClick={() => setStarFilter(String(s))}
              className={`p-3 rounded-2xl border text-center transition-all ${
                starFilter === String(s) ? 'border-yellow-400 bg-yellow-400/10' : 'border-[#333] bg-[#14141d] hover:bg-[#1a1a24]'
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
      <div className="bg-[#14141d] border border-[#333] rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo khách hàng, tên sản phẩm, bình luận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e2d] border border-[#333] rounded-xl text-sm outline-none focus:border-[#d4ff00]"
          />
        </div>
        <select
          value={starFilter}
          onChange={(e) => setStarFilter(e.target.value)}
          className="bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] min-w-[180px]"
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
      <div className="bg-[#14141d] border border-[#333] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1e1e2d] text-gray-400 text-xs uppercase border-b border-[#333]">
              <tr>
                <th className="px-6 py-4 font-semibold">KHÁCH HÀNG</th>
                <th className="px-6 py-4 font-semibold">SẢN PHẨM</th>
                <th className="px-6 py-4 font-semibold">ĐÁNH GIÁ SAO</th>
                <th className="px-6 py-4 font-semibold">NỘI DUNG BÌNH LUẬN</th>
                <th className="px-6 py-4 font-semibold">TRẠNG THÁI</th>
                <th className="px-6 py-4 font-semibold text-right">NGÀY & HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Đang tải danh sách đánh giá...</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-[#1a1a24] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {getCustomerName(r)}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[220px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImage(r)}
                          alt="Sản phẩm"
                          className="w-10 h-10 object-cover rounded-lg border border-[#444] shrink-0"
                        />
                        <span className="font-bold text-gray-200 truncate">{getProductName(r)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < (r.star_number || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">({r.star_number || 0}/5)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 max-w-[320px] text-xs leading-relaxed">
                      {r.content ? (
                        <div className="bg-[#1e1e2d] p-2.5 rounded-xl border border-[#333]">
                          "{r.content}"
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Khách hàng không để lại nhận xét văn bản.</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.status === 'hidden' ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-green-500/10 text-green-400 border border-green-500/30'
                      }`}>
                        {r.status === 'hidden' ? 'Đã ẩn' : 'Hiển thị'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-gray-400 text-xs">{formatDate(r.createdAt)}</span>
                        <button
                          onClick={() => handleToggleStatus(r)}
                          className={`p-2 rounded-lg border transition-colors ${
                            r.status === 'hidden'
                              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                          }`}
                          title={r.status === 'hidden' ? 'Hiện lại đánh giá' : 'Ẩn đánh giá khỏi giao diện (Soft delete)'}
                        >
                          {r.status === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Chưa có đánh giá nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
