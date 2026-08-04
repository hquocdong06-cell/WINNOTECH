import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Star, Trash2, EyeOff, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3000';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/reviews/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      } else {
        setError(data.message || 'Không thể tải đánh giá');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (r) => {
    try {
      return r.id_oderitems?.order_id?.user_id?.name || r.id_oderitems?.order_id?.user_id?.email || 'Khách hàng Ẩn danh';
    } catch { return 'Khách hàng Ẩn danh'; }
  };

  const getProductName = (r) => {
    try {
      return r.id_oderitems?.variants_id?.p_id?.name || 'Sản phẩm không xác định';
    } catch { return 'Sản phẩm không xác định'; }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filtered = reviews.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      getCustomerName(r).toLowerCase().includes(q) ||
      getProductName(r).toLowerCase().includes(q) ||
      (r.content || '').toLowerCase().includes(q)
    );
  });

  const handleDelete = (id) => {
    if(window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      // Simulate API call
      setReviews(prev => prev.filter(r => r._id !== id));
      toast.success('Đã xóa đánh giá thành công');
    }
  };

  const handleHide = (id) => {
    toast.info('Đã ẩn đánh giá này khỏi cửa hàng');
  };

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Đánh giá Sản phẩm</h1>
          <p className="text-gray-400 text-sm">Quản lý phản hồi và đánh giá từ khách hàng</p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#222] border border-[#333] hover:bg-[#333] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo khách hàng, sản phẩm, nội dung..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none text-white transition-colors"
          />
        </div>
        {!loading && !error && (
          <div className="text-sm text-gray-500">
            Hiển thị <strong className="text-white">{filtered.length}</strong> / {reviews.length} đánh giá
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#d4ff00]" />
            <p className="text-sm">Đang tải đánh giá...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-red-500 text-2xl">❌</span>
            </div>
            <p className="text-red-400 text-sm">{error}</p>
            <button 
              onClick={fetchReviews} 
              className="px-5 py-2 bg-[#d4ff00] text-black font-bold rounded-lg text-sm"
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
            <MessageSquare className="w-12 h-12 text-gray-600" />
            <p className="text-sm">{search ? 'Không tìm thấy đánh giá phù hợp' : 'Chưa có đánh giá nào'}</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">KHÁCH HÀNG</th>
                <th className="px-6 py-4 font-medium">SẢN PHẨM</th>
                <th className="px-6 py-4 font-medium">ĐÁNH GIÁ</th>
                <th className="px-6 py-4 font-medium">NỘI DUNG</th>
                <th className="px-6 py-4 font-medium">NGÀY ĐĂNG</th>
                <th className="px-6 py-4 font-medium text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {filtered.map((r) => (
                <tr key={r._id} className="hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    {getCustomerName(r)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-300 max-w-[200px] line-clamp-2">
                      {getProductName(r)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (r.star_number || 0) ? 'fill-current text-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs ml-1">({r.star_number || 0})</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400 max-w-[300px] line-clamp-2">
                      {r.content || <span className="text-gray-600 italic">Không có nội dung</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleHide(r._id)}
                        className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-yellow-400 transition-colors" 
                        title="Ẩn đánh giá"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(r._id)}
                        className="p-2 bg-[#222] hover:bg-red-500/20 border border-[#444] hover:border-red-500/50 rounded-md text-gray-300 hover:text-red-500 transition-colors" 
                        title="Xóa"
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
    </div>
  );
};

export default Reviews;
