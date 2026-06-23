import React from 'react';

const Header = () => {
  return (
    <header className="admin-header">
      <div className="header-search">
        <i>🔍</i>
        <input type="text" placeholder="Tìm kiếm..." />
      </div>

      <div className="header-actions">
        <button className="action-btn">
          <i>🔔</i>
          <span className="badge">5</span>
        </button>
        <button className="action-btn">
          <i>🌙</i>
        </button>
        
        <div className="user-profile">
          <img 
            className="user-avatar" 
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2680&auto=format&fit=crop" 
            alt="Admin" 
          />
          <div className="user-info">
            <h5>Admin Winno</h5>
            <span>Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
