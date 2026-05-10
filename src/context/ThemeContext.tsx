import React, { createContext, useContext, useState, useEffect } from 'react';

// Khai báo các biến kiểu dữ liệu
type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (newTheme: Theme) => void;
  colors: any; // Chứa bộ màu động
}

// Khởi tạo Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Lấy theme từ localStorage (nếu có), mặc định là dark
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return (savedTheme as Theme) || 'dark';
  });

  // Mỗi khi đổi theme thì lưu lại và đổi màu nền của cả trang web luôn
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.body.style.backgroundColor = theme === 'dark' ? '#020617' : '#f1f5f9';
    document.body.style.color = theme === 'dark' ? '#f8fafc' : '#0f172a';
  }, [theme]);

  const toggleTheme = (newTheme: Theme) => setTheme(newTheme);

  const isDark = theme === 'dark';
  
  // TẤT CẢ MÃ MÀU CỦA HỆ THỐNG NẰM Ở ĐÂY
  const colors = {
    bg: isDark ? "#020617" : "#f1f5f9",
    card: isDark ? "#0f172a" : "#ffffff",
    primary: isDark ? "#22d3ee" : "#0284c7",
    secondary: isDark ? "#a855f7" : "#7e22ce", 
    border: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    text: isDark ? "#f8fafc" : "#0f172a",
    muted: "#64748b",
    inputBg: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc",
    inputBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.2)",
    divider: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook này để các file khác gọi ra dùng cho lẹ
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme phải được bọc trong ThemeProvider');
  return context;
};