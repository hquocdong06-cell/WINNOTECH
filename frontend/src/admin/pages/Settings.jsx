import React from 'react';

const Settings = () => {
  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 style={{ fontSize: '28px' }}>Cài đặt hệ thống</h1>
      </div>

      <div className="dashboard-grid">
        <div className="content-card">
          <h3 style={{ marginBottom: '20px' }}>Thông tin cửa hàng</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="filter-group">
              <label>Tên cửa hàng</label>
              <input type="text" defaultValue="WINNO TECH" />
            </div>
            <div className="filter-group">
              <label>Email liên hệ</label>
              <input type="email" defaultValue="support@winnotech.com" />
            </div>
            <div className="filter-group">
              <label>Số điện thoại</label>
              <input type="text" defaultValue="0123 456 789" />
            </div>
            <div className="filter-group">
              <label>Địa chỉ</label>
              <input type="text" defaultValue="123 Đường Công Nghệ, TP. HCM" />
            </div>
            <button className="btn-primary" style={{ marginTop: '10px' }}>Lưu thay đổi</button>
          </form>
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '20px' }}>Cấu hình giao diện</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Chế độ tối (Dark Mode)</span>
                <div style={{ width: '50px', height: '24px', background: 'var(--accent-color)', borderRadius: '12px', position: 'relative' }}>
                   <div style={{ width: '20px', height: '20px', background: '#000', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
