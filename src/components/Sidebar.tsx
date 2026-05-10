import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext"; // Import context
import { translations } from "../data/translations"; // Import file dịch

import {
  LayoutDashboard,
  Map,
  GraduationCap,
  MessageSquare,
  ClipboardCheck,
  Mic,
  BookOpen,
  BarChart3,
  User,
  LogOut,
  Menu,
  Layers3,
} from "lucide-react";

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

export function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, colors } = useTheme();
  const { language } = useLanguage(); // Lấy ngôn ngữ đang chọn

  const isDark = theme === "dark";

  // Lấy bản dịch sidebar theo ngôn ngữ hiện tại
  const t =
    translations[language as keyof typeof translations]?.sidebar ||
    translations.vi.sidebar;

  const menuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: t.dashboard },
    { path: "/my-learning", icon: Map, label: t.lessons },
    { path: "/courses", icon: GraduationCap, label: t.courses },
    { path: "/chat", icon: MessageSquare, label: t.aiChat },
    { path: "/quiz", icon: ClipboardCheck, label: t.quiz },
    { path: "/mock-interview", icon: Mic, label: t.mockInterview },
    { path: "/resources", icon: BookOpen, label: t.resources },
    { path: "/manage-courses", icon: Layers3, label: t.manageCourses },
    { path: "/reports", icon: BarChart3, label: t.reports },
  ];

  const textStyle: React.CSSProperties = {
    opacity: isExpanded ? 1 : 0,
    display: isExpanded ? "block" : "none",
    transition: "opacity 0.3s ease",
    whiteSpace: "nowrap",
    color: colors.text,
  };

  const hoverBg = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";

  return (
    <div
      className="fixed left-0 top-0 h-screen z-50 flex flex-col"
      style={{
        width: isExpanded ? "260px" : "80px",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: colors.card,
        borderRight: `1px solid ${colors.border}`,
        backdropFilter: "blur(12px)",
        boxShadow: isDark
          ? "10px 0 30px rgba(0,0,0,0.5)"
          : "10px 0 30px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header - Brand */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ height: "80px", borderBottom: `1px solid ${colors.border}` }}
      >
        <div style={textStyle}>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: "900",
              // 1. Dùng backgroundImage thay vì background để tránh reset backgroundClip
              backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,

              // 2. Đảm bảo thuộc tính clip được ưu tiên
              WebkitBackgroundClip: "text",
              backgroundClip: "text",

              // 3. Làm trong suốt chữ để hiện nền
              WebkitTextFillColor: "transparent",
              color: "transparent",

              letterSpacing: "1px",
              display: "inline-block",
            }}
          >
            DEVMENTOR AI
          </h1>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl transition-all"
          style={{
            backgroundColor: hoverBg,
            color: colors.primary,
            marginLeft: isExpanded ? "auto" : "0px",
          }}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* User Section */}
      <div
        className="p-4 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div style={{ position: "relative" }}>
          <img
            src={
              user?.avatar ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            }
            className="w-11 h-11 rounded-full object-cover border-2"
            alt="Avatar"
            style={{
              borderColor: colors.primary,
              padding: "2px",
              minWidth: "44px",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "12px",
              height: "12px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              border: `2px solid ${colors.card}`,
            }}
          />
        </div>
        <div style={textStyle} className="min-w-0">
          <p
            style={{
              fontWeight: "700",
              fontSize: "0.9rem",
              margin: 0,
              color: colors.text,
            }}
          >
            {user?.name || t.student}
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: colors.primary,
              margin: 0,
              fontWeight: "900",
            }}
          >
            {t.level} {user?.level || 1}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden devmentor-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px 16px",
                borderRadius: "12px",
                textDecoration: "none",
                transition: "all 0.3s ease",
                background: isActive
                  ? `linear-gradient(135deg, ${colors.primary}22, ${colors.secondary}22)`
                  : "transparent",
                border: isActive
                  ? `1px solid ${colors.primary}44`
                  : "1px solid transparent",
                color: isActive ? colors.primary : colors.muted,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = hoverBg;
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <item.icon
                className="w-6 h-6 shrink-0"
                style={{
                  filter: isActive
                    ? `drop-shadow(0 0 8px ${colors.primary}66)`
                    : "none",
                }}
              />
              <span
                style={{
                  ...textStyle,
                  color: isActive
                    ? isDark
                      ? "#fff"
                      : colors.primary
                    : colors.muted,
                  fontWeight: isActive ? "800" : "600",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div
        className="p-3 space-y-2"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <Link
          to="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 16px",
            borderRadius: "12px",
            color:
              location.pathname === "/profile" ? colors.primary : colors.muted,
            transition: "all 0.3s",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== "/profile")
              e.currentTarget.style.backgroundColor = hoverBg;
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/profile")
              e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <User className="w-6 h-6 shrink-0" />
          <span style={{ ...textStyle, fontWeight: "600" }}>{t.profile}</span>
        </Link>

        <button
          onClick={logout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 16px",
            borderRadius: "12px",
            color: "#ef4444",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <LogOut className="w-6 h-6 shrink-0" />
          <span style={{ ...textStyle, fontWeight: "600", color: "#ef4444" }}>
            {t.logout}
          </span>
        </button>
      </div>
    </div>
  );
}
