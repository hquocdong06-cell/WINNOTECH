import React, { createContext, useContext, useState, useEffect } from 'react';

const ClientThemeContext = createContext();

export const THEME_STORAGE_KEY = 'winnotech_client_theme';

export const ClientThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      // Nếu trước đó bị lưu 'light' do auto-detect hệ điều hành, reset ngay về 'dark'
      if (saved === 'light') {
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
        return 'dark';
      }
      if (saved === 'dark') {
        return 'dark';
      }
    } catch {
      // Bỏ qua lỗi truy cập localStorage
    }
    // Mặc định luôn là 'dark' cho WINNOTech Gaming Store
    return 'dark';
  });

  // Đồng bộ class và attribute lên <html> và <body>
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Đặt data-theme attribute
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-client-theme', theme);

    if (theme === 'light') {
      root.classList.add('light', 'light-mode');
      root.classList.remove('dark', 'dark-mode');
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    } else {
      root.classList.add('dark', 'dark-mode');
      root.classList.remove('light', 'light-mode');
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Bỏ qua
    }
  }, [theme]);

  // Lắng nghe sự kiện storage để đồng bộ giữa các tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  return (
    <ClientThemeContext.Provider value={{ theme, isDark, isLight, setTheme, toggleTheme }}>
      {children}
    </ClientThemeContext.Provider>
  );
};

export const useClientTheme = () => {
  const context = useContext(ClientThemeContext);
  if (!context) {
    throw new Error('useClientTheme must be used within a ClientThemeProvider');
  }
  return context;
};

export default ClientThemeContext;
