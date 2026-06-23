import React from 'react';

const Reviews = () => {
  const reviews = [
    { id: 1, customer: 'Nguyễn Văn A', product: 'RTX 4090', rating: 5, comment: 'Sản phẩm tuyệt vời, giao hàng nhanh!', date: '20/05/2024' },
    { id: 2, customer: 'Trần Thị B', product: 'i9-14900K', rating: 4, comment: 'Chip rất mạnh nhưng hơi nóng.', date: '18/05/2024' },
  ];

  return (
    <div className="reviews-page">
      <div className="page-header">
        <h1 style={{ fontSize: '28px' }}>Đánh giá sản phẩm</h1>
      </div>

      <div className="content-card" style={{ padding: '0' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>KHÁCH HÀNG</th>
              <th>SẢN PHẨM</th>
              <th>ĐÁNH GIÁ</th>
              <th>BÌNH LUẬN</th>
              <th>NGÀY</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.customer}</td>
                <td style={{ fontWeight: 600 }}>{r.product}</td>
                <td style={{ color: '#ffc107' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</td>
                <td style={{ maxWidth: '300px', fontSize: '13px' }}>{r.comment}</td>
                <td>{r.date}</td>
                <td>
                  <div className="action-icons">
                    <button className="icon-btn view" title="Duyệt">✅</button>
                    <button className="icon-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reviews;
