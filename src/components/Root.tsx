import { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';

export function Root() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const showSidebar = isAuthenticated && location.pathname !== '/onboarding';

  // Cấu hình kích thước và hiệu ứng chuyển động
  const sidebarWidth = isExpanded ? '260px' : '80px';
  const transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

  // Logic điều hướng (Redirects)
  if (!isPublicRoute && !isAuthenticated) return <Navigate to="/login" replace />;
  if (isAuthenticated && user && !user.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  if (isAuthenticated && isPublicRoute) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#020617', // Màu nền gốc của Sidebar (Midnight Navy)
      overflow: 'hidden'
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
          
          // CẬP NHẬT MÀU NỀN: Dùng Slate Navy phối Gradient để không bị tối đen quá
          background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)', 
          
          // Hiệu ứng Inset Dashboard: Bo góc cực mượt ở phía Sidebar
          borderTopLeftRadius: showSidebar ? '40px' : '0px',
          
          // Đổ bóng để tạo chiều sâu khối Main đè lên Sidebar
          boxShadow: showSidebar ? '-15px 0 45px rgba(0,0,0,0.4)' : 'none',
          
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