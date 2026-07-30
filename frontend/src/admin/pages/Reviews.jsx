import React, { useState, useEffect } from 'react';

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
      // POST /reviews/filter không truyền filter → lấy tất cả reviews
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

  // Helper lấy thông tin từ populated data
  const getCustomerName = (r) => {
    try {
      return r.id_oderitems?.order_id?.user_id?.name || r.id_oderitems?.order_id?.user_id?.email || 'N/A';
    } catch { return 'N/A'; }
  };

  const getProductName = (r) => {
    try {
      return r.id_oderitems?.variants_id?.p_id?.name || 'N/A';
    } catch { return 'N/A'; }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Lọc theo tên khách hoặc sản phẩm
  const filtered = reviews.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      getCustomerName(r).toLowerCase().includes(q) ||
      getProductName(r).toLowerCase().includes(q) ||
      (r.content || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="reviews-page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>Đánh giá sản phẩm</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Tìm theo khách hàng, sản phẩm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #333',
              background: '#1a1a2e',
              color: '#fff',
              fontSize: '13px',
              width: '260px',
            }}
          />
          <button
            onClick={fetchReviews}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#f59e0b',
              color: '#000',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Tổng số */}
      {!loading && !error && (
        <div style={{ marginBottom: '12px', color: '#aaa', fontSize: '13px' }}>
          Hiển thị <strong style={{ color: '#fff' }}>{filtered.length}</strong> / {reviews.length} đánh giá
        </div>
      )}

      <div className="content-card" style={{ padding: '0' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#aaa' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            Đang tải đánh giá...
          </div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#f87171' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
            {error}
            <br />
            <button onClick={fetchReviews} style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#aaa' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
            {search ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có đánh giá nào'}
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>KHÁCH HÀNG</th>
                <th>SẢN PHẨM</th>
                <th>ĐÁNH GIÁ</th>
                <th>BÌNH LUẬN</th>
                <th>NGÀY</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  <td>{getCustomerName(r)}</td>
                  <td style={{ fontWeight: 600, maxWidth: '180px' }}>{getProductName(r)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#ffc107' }}>{'★'.repeat(r.star_number || 0)}</span>
                    <span style={{ color: '#555' }}>{'★'.repeat(5 - (r.star_number || 0))}</span>
                    <span style={{ color: '#aaa', fontSize: '12px', marginLeft: '4px' }}>({r.star_number || 0}/5)</span>
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '13px', color: '#ccc' }}>{r.content || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap', color: '#aaa' }}>{formatDate(r.createdAt)}</td>
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
