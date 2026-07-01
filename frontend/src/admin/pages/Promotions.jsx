import React from 'react';

const Promotions = () => {
  const promos = [
    { id: 1, name: 'Hè Rực Rỡ', code: 'HELLO2024', discount: '10%', start: '01/06/2024', end: '30/06/2024', status: 'Sắp diễn ra' },
    { id: 2, name: 'Khách hàng mới', code: 'NEWBIE', discount: '50k', start: '01/01/2024', end: '31/12/2024', status: 'Đang chạy' },
  ];

  return (
    <div className="promotions-page">
      <div className="page-header">
        <h1 style={{ fontSize: '28px' }}>Khuyến mãi & Mã giảm giá</h1>
        <button className="btn-primary"><span>+</span> Tạo mã mới</button>
      </div>

      <div className="content-card" style={{ padding: '0' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>TÊN CHƯƠNG TRÌNH</th>
              <th>MÃ CODE</th>
              <th>GIẢM GIÁ</th>
              <th>THỜI GIAN</th>
              <th>TRẠNG THÁI</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td><code style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', color: 'var(--accent-color)' }}>{p.code}</code></td>
                <td>{p.discount}</td>
                <td>{p.start} - {p.end}</td>
                <td><span className={`status-badge ${p.status === 'Đang chạy' ? 'status-success' : 'status-warning'}`}>{p.status}</span></td>
                <td>
                  <div className="action-icons">
                    <button className="icon-btn edit">✏️</button>
                    <button className="icon-btn toggle" title="Ẩn/Hiện">👁️</button>
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

export default Promotions;
