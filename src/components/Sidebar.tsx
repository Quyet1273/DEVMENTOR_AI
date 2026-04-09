import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Map, GraduationCap, MessageSquare, ClipboardCheck, Mic, BookOpen,BarChart3, User, LogOut, Menu, Layers3 } from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

export function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/roadmap', icon: Map, label: 'Bài học' },
    { path: '/courses', icon: GraduationCap, label: 'Khóa học' },
    { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { path: '/quiz', icon: ClipboardCheck, label: 'Quiz' },
    { path: '/mock-interview', icon: Mic, label: 'Mock Interview' },
    { path: '/resources', icon: BookOpen, label: 'Tài nguyên' },
    { path: '/manage-courses', icon: Layers3, label: 'Quản lý khóa học' },    
    { path: '/reports', icon: BarChart3, label: 'Thống kê' },

  ];

  const textStyle: React.CSSProperties = {
    opacity: isExpanded ? 1 : 0,
    display: isExpanded ? 'block' : 'none',
    transition: 'opacity 0.3s ease',
    whiteSpace: 'nowrap',
    color: '#f8fafc' // Slate-50
  };

  // Màu sắc chủ đạo của Midnight Matrix
  const colors = {
    bg: '#020617',         // Deep Navy
    glass: 'rgba(15, 23, 42, 0.8)', // Slate-900 Glass
    accent: '#3b82f6',     // Electric Blue
    neon: '#a855f7',       // Purple Neon
    border: 'rgba(255, 255, 255, 0.05)',
    hover: 'rgba(59, 130, 246, 0.1)'
  };

  return (
    <div className="fixed left-0 top-0 h-screen z-50 flex flex-col"
         style={{ 
           width: isExpanded ? '260px' : '80px', 
           transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
           backgroundColor: colors.bg,
           borderRight: `1px solid ${colors.border}`,
           backdropFilter: 'blur(12px)',
           boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
         }}>
      
      {/* Header - Brand */}
      <div className="p-4 flex items-center justify-between" 
           style={{ height: '80px', borderBottom: `1px solid ${colors.border}` }}>
        <div style={textStyle}>
          <h1 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '900', 
            background: `linear-gradient(to right, ${colors.accent}, ${colors.neon})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1px'
          }}>
            DEVMENTOR AI
          </h1>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="p-2 rounded-xl transition-all"
          style={{ backgroundColor: colors.hover, color: colors.accent, marginLeft: isExpanded ? 'auto' : '0px' }}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* User Section */}
      <div className="p-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ position: 'relative' }}>
          <img 
            src={user?.avatar} 
            className="w-11 h-11 rounded-full object-cover border-2" 
            style={{ borderColor: colors.accent, padding: '2px', minWidth: '44px' }} 
          />
          <div style={{ 
            position: 'absolute', bottom: 0, right: 0, 
            width: '12px', height: '12px', backgroundColor: '#10b981', 
            borderRadius: '50%', border: `2px solid ${colors.bg}` 
          }} />
        </div>
        <div style={textStyle} className="min-w-0">
          <p style={{ fontWeight: '700', fontSize: '0.9rem', margin: 0 }}>{user?.name}</p>
          <p style={{ fontSize: '0.75rem', color: colors.accent, margin: 0, fontWeight: '500' }}>LEVEL {user?.level}</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                background: isActive 
                  ? `linear-gradient(135deg, ${colors.accent}22, ${colors.neon}22)` 
                  : 'transparent',
                border: isActive ? `1px solid ${colors.accent}44` : '1px solid transparent',
                color: isActive ? colors.accent : '#94a3b8'
              }}
              onMouseEnter={(e) => {
                if(!isActive) e.currentTarget.style.backgroundColor = colors.hover;
              }}
              onMouseLeave={(e) => {
                if(!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" style={{ filter: isActive ? `drop-shadow(0 0 8px ${colors.accent})` : 'none' }} />
              <span style={{ ...textStyle, color: isActive ? '#fff' : '#94a3b8', fontWeight: isActive ? '700' : '500' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 space-y-2" style={{ borderTop: `1px solid ${colors.border}` }}>
        <Link 
          to="/profile" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            borderRadius: '12px',
            color: location.pathname === '/profile' ? colors.accent : '#94a3b8',
            transition: 'all 0.3s'
          }}
        >
          <User className="w-6 h-6 flex-shrink-0" />
          <span style={textStyle}>Hồ sơ cá nhân</span>
        </Link>
        
        <button 
          onClick={logout} 
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            borderRadius: '12px',
            color: '#ef4444',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut className="w-6 h-6 flex-shrink-0" />
          <span style={textStyle}>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}