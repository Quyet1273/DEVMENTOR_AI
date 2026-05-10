import { useState, useEffect } from 'react'; // Đã thêm useEffect vào đây
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { useTheme } from '../context/ThemeContext'; 

export function Root() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  // 2. Gọi Context lấy màu động ra
  const { theme, colors } = useTheme(); 
  const isDark = theme === 'dark';

  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const showSidebar = isAuthenticated && location.pathname !== '/onboarding';

  // --- LOGIC TỰ ĐỘNG CO SIDEBAR KHI HỌC BÀI ---
  useEffect(() => {
    // Nếu đường dẫn bắt đầu bằng /learning, tự động co sidebar (isExpanded = false)
    if (location.pathname.startsWith("/learning")) {
      setIsExpanded(false);
    } else {
      // Khi quay lại các trang khác, sidebar tự động mở rộng (isExpanded = true)
      setIsExpanded(true);
    }
  }, [location.pathname]); // Lắng nghe sự thay đổi của đường dẫn

  // Cấu hình kích thước và hiệu ứng chuyển động
  const sidebarWidth = isExpanded ? '260px' : '80px';
  const transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

  // Logic điều hướng (Redirects) - GIỮ NGUYÊN HOÀN TOÀN
  if (!isPublicRoute && !isAuthenticated) return <Navigate to="/login" replace />;
  if (isAuthenticated && user && !user.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  if (isAuthenticated && isPublicRoute) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: colors.bg, // <-- 3. Nền tổng đổi theo Theme (Sáng/Tối)
      overflow: 'hidden',
      transition: 'background-color 0.3s ease' // Thêm mượt
    }}>
      
      {/* Sidebar nhận props để đồng bộ với Root */}
      {showSidebar && (
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      )}

      {/* KHỐI NỘI DUNG CHÍNH (MAIN DASHBOARD) */}
      <main 
        style={{ 
          flex: 1,
          marginLeft: showSidebar ? sidebarWidth : '0px',
          transition: transition,
          
          // 4. MÀU NỀN ĐỘNG (Bỏ gradient fix cứng)
          // Nếu dark mode thì giữ nguyên gradient tối, nếu light mode thì nền sáng trơn
          background: isDark 
            ? 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)' 
            : colors.bg, // Nền sáng
          
          // Hiệu ứng Inset Dashboard: Bo góc cực mượt ở phía Sidebar
          borderTopLeftRadius: showSidebar ? '40px' : '0px',
          
          // Đổ bóng để tạo chiều sâu khối Main đè lên Sidebar
          boxShadow: showSidebar 
            ? (isDark ? '-15px 0 45px rgba(0,0,0,0.4)' : '-15px 0 45px rgba(0,0,0,0.05)') 
            : 'none',
          
          padding: '24px',
          minHeight: '100vh',
          marginTop: '0px',
          zIndex: 10,
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        {/* Render nội dung của Dashboard, Roadmap, v.v. */}
        <Outlet />
      </main>
    </div>
  );
}