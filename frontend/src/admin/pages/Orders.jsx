import React from 'react';

const Orders = () => {
  const orders = [
    { id: 'WIN123456', customer: 'Nguyễn Văn A', total: '18.490.000₫', status: 'Thành công', date: '20/05/2024' },
    { id: 'WIN123455', customer: 'Trần Thị B', total: '23.990.000₫', status: 'Đang xử lý', date: '20/05/2024' },
    { id: 'WIN123454', customer: 'Lê Văn C', total: '12.890.000₫', status: 'Thành công', date: '20/05/2024' },
    { id: 'WIN123453', customer: 'Phạm Thị D', total: '5.490.000₫', status: 'Đã hủy', date: '19/05/2024' },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Thành công': return 'status-success';
      case 'Đang xử lý': return 'status-warning';
      case 'Đã hủy': return 'status-danger';
      default: return '';
    }
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1 style={{ fontSize: '28px' }}>Quản lý đơn hàng</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" style={{ background: '#1e1e1e', color: '#fff', border: '1px solid #333' }}>Xuất báo cáo</button>
        </div>
      </div>

      <div className="filters-wrapper">
        <div className="header-search" style={{ flex: 1 }}>
          <i>🔍</i>
          <input type="text" placeholder="Tìm mã đơn, tên khách..." />
        </div>
        <select style={{ background: '#1e1e1e', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '10px' }}>
          <option>Tất cả trạng thái</option>
          <option>Thành công</option>
          <option>Đang xử lý</option>
          <option>Đã hủy</option>
        </select>
      </div>

      <div className="content-card" style={{ padding: '0' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>MÃ ĐƠN</th>
              <th>KHÁCH HÀNG</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY TẠO</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600 }}>#{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.total}</td>
                <td><span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></td>
                <td>{order.date}</td>
                <td>
                  <div className="action-icons">
                    <button className="icon-btn view">👁️</button>
                    <button className="icon-btn edit">✏️</button>
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

export default Orders;
