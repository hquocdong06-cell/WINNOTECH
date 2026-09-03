import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext();

export const ADMIN_THEME_KEY = 'winnotech_admin_theme';

export const AdminThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(ADMIN_THEME_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      // Kiểm tra xem cấu hình settings cũ có lưu darkMode không
      const adminSettings = localStorage.getItem('winnotech_admin_settings');
      if (adminSettings) {
        const parsed = JSON.parse(adminSettings);
        if (parsed.darkMode === false) return 'light';
      }
    } catch (e) {
      console.error('Error reading theme from localStorage:', e);
    }
    return 'dark'; // Mặc định là dark mode như giao diện hiện tại
  });

  const setTheme = (newTheme) => {
    const validTheme = newTheme === 'light' ? 'light' : 'dark';
    setThemeState(validTheme);
    try {
      localStorage.setItem(ADMIN_THEME_KEY, validTheme);
      // Đồng bộ với winnotech_admin_settings nếu có
      const adminSettings = localStorage.getItem('winnotech_admin_settings');
      if (adminSettings) {
        const parsed = JSON.parse(adminSettings);
        parsed.darkMode = validTheme === 'dark';
        localStorage.setItem('winnotech_admin_settings', JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('Error saving theme to localStorage:', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    // Sync class và attribute lên thẻ html để mọi selector đều ăn khớp
    document.documentElement.setAttribute('data-admin-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light', 'light-mode');
      document.documentElement.classList.remove('dark', 'dark-mode');
    } else {
      document.documentElement.classList.add('dark', 'dark-mode');
      document.documentElement.classList.remove('light', 'light-mode');
    }
  }, [theme]);

  return (
    <AdminThemeContext.Provider value={{ theme, isDark: theme === 'dark', isLight: theme === 'light', setTheme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};
