import React from 'react';

const Reports = () => {
  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 style={{ fontSize: '28px' }}>Báo cáo thống kê</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select style={{ background: '#1e1e1e', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '10px' }}>
            <option>Tháng này</option>
            <option>Tháng trước</option>
            <option>Cả năm</option>
          </select>
          <button className="btn-primary">Xuất PDF</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Doanh thu thuần</h3>
          <div className="stat-value">1.840.450k</div>
          <div className="stat-trend trend-up">↑ 14% so với kỳ trước</div>
        </div>
        <div className="stat-card">
          <h3>Lợi nhuận gộp</h3>
          <div className="stat-value">325.000k</div>
          <div className="stat-trend trend-up">↑ 8% so với kỳ trước</div>
        </div>
        <div className="stat-card">
          <h3>Chi phí quảng cáo</h3>
          <div className="stat-value">45.000k</div>
          <div className="stat-trend trend-down">↓ 2% so với kỳ trước</div>
        </div>
      </div>

      <div className="content-card" style={{ height: '400px' }}>
        <h3>Biểu đồ tăng trưởng</h3>
        <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '40px 0 20px 0' }}>
          {[30, 45, 35, 60, 50, 75, 65, 80, 95, 85, 90, 100].map((h, i) => (
             <div key={i} style={{ width: '6%', height: `${h}%`, background: 'rgba(212, 255, 0, 0.2)', borderTop: '2px solid var(--accent-color)', position: 'relative' }}>
               <span style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#666' }}>T{i+1}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
