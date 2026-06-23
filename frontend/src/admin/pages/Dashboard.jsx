import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>TỔNG DOANH THU</h3>
            <div className="stat-icon">💰</div>
          </div>
          <div className="stat-value">2.450.000.000₫</div>
          <div className="stat-trend trend-up">↑ 12.5%<span>so với tháng trước</span></div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>TỔNG ĐƠN HÀNG</h3>
            <div className="stat-icon">📦</div>
          </div>
          <div className="stat-value">1.256</div>
          <div className="stat-trend trend-up">↑ 8.3%<span>so với tháng trước</span></div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>KHÁCH HÀNG</h3>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-value">3.452</div>
          <div className="stat-trend trend-up">↑ 15.7%<span>so với tháng trước</span></div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>SẢN PHẨM</h3>
            <div className="stat-icon">🎮</div>
          </div>
          <div className="stat-value">245</div>
          <div className="stat-trend trend-up">↑ 5.2%<span>so với tháng trước</span></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="content-card">
          <div className="card-title">
            <span>DOANH THU 12 THÁNG</span>
            <select style={{ background: '#1e1e1e', color: '#fff', border: '1px solid #333', padding: '5px', borderRadius: '5px' }}>
              <option>Năm nay</option>
            </select>
          </div>
          <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 0' }}>
             {/* Simulated Chart Bars */}
             {[40, 60, 45, 70, 55, 85, 65, 95, 75, 80, 70, 90].map((h, i) => (
               <div key={i} style={{ width: '6%', height: `${h}%`, background: 'linear-gradient(to top, rgba(212, 255, 0, 0.1), #d4ff00)', borderRadius: '4px' }}></div>
             ))}
          </div>
        </div>

        <div className="content-card">
          <div className="card-title">ĐƠN HÀNG THEO TRẠNG THÁI</div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '20px solid #d4ff00', borderTopColor: '#ffc107', borderLeftColor: '#ff4d4d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>1.256</span>
              <span style={{ fontSize: '10px', color: '#a0a0a0' }}>Tổng đơn</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '10px', height: '10px', background: '#d4ff00', borderRadius: '2px' }}></span> Thành công: 685 (54.5%)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '10px', height: '10px', background: '#ffc107', borderRadius: '2px' }}></span> Đang xử lý: 412 (32.8%)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '10px', height: '10px', background: '#ff4d4d', borderRadius: '2px' }}></span> Hủy: 159 (12.7%)</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="content-card">
          <div className="card-title">ĐƠN HÀNG GẦN ĐÂY</div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>MÃ ĐƠN</th>
                <th>KHÁCH HÀNG</th>
                <th>TỔNG TIỀN</th>
                <th>TRẠNG THÁI</th>
                <th>NGÀY TẠO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#WIN123456</td>
                <td>Nguyễn Văn A</td>
                <td>18.490.000₫</td>
                <td><span className="status-badge status-success">Thành công</span></td>
                <td>20/05/2024 14:30</td>
              </tr>
              <tr>
                <td>#WIN123455</td>
                <td>Trần Thị B</td>
                <td>23.990.000₫</td>
                <td><span className="status-badge status-warning">Đang xử lý</span></td>
                <td>20/05/2024 13:15</td>
              </tr>
              <tr>
                <td>#WIN123454</td>
                <td>Lê Văn C</td>
                <td>12.890.000₫</td>
                <td><span className="status-badge status-success">Thành công</span></td>
                <td>20/05/2024 11:22</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="content-card">
          <div className="card-title">SẢN PHẨM BÁN CHẠY</div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>SẢN PHẨM</th>
                <th>ĐÃ BÁN</th>
                <th>DOANH THU</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img className="product-img" src="https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop" alt="GPU" />
                  <span>RTX 4090 24GB</span>
                </td>
                <td>156</td>
                <td style={{ fontWeight: 600 }}>166.890k</td>
              </tr>
              <tr>
                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img className="product-img" src="https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=2670&auto=format&fit=crop" alt="CPU" />
                  <span>Intel Core i9-14900K</span>
                </td>
                <td>142</td>
                <td style={{ fontWeight: 600 }}>121.580k</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
