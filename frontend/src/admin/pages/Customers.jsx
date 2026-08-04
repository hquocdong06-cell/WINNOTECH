import React from 'react';

const Customers = () => {
  const customers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'anv@gmail.com', orders: 5, spent: '45.000.000₫', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Trần Thị B', email: 'bt@gmail.com', orders: 2, spent: '12.500.000₫', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Lê Văn C', email: 'clv@gmail.com', orders: 12, spent: '156.000.000₫', avatar: 'https://i.pravatar.cc/150?u=3' },
  ];

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1 style={{ fontSize: '28px' }}>Quản lý khách hàng</h1>
      </div>

      <div className="content-card" style={{ padding: '0' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>KHÁCH HÀNG</th>
              <th>EMAIL</th>
              <th>SỐ ĐƠN</th>
              <th>TỔNG CHI TIÊU</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={c.avatar} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                </td>
                <td>{c.email}</td>
                <td>{c.orders} đơn hàng</td>
                <td style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{c.spent}</td>
                <td>
                  <div className="action-icons">
                    <button className="icon-btn edit" title="Sửa">✏️</button>
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

export default Customers;
