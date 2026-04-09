import { useAuth } from '../context/AuthContext';
import { User, Mail, Target, Calendar, Edit, Award, Zap, Trophy, ShieldCheck, Settings, Users } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const colors = {
    bg: "#020617",
    card: "#0f172a",
    primary: "#22d3ee",
    secondary: "#a855f7",
    border: "rgba(34, 211, 238, 0.1)",
    text: "#f8fafc",
    muted: "#64748b"
  };

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100vh", color: colors.text, padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>HỒ SƠ <span style={{ color: isAdmin ? colors.secondary : colors.primary }}>{isAdmin ? 'QUẢN TRỊ' : 'CÁ NHÂN'}</span></h1>
          <button style={{ backgroundColor: isAdmin ? colors.secondary : colors.primary, color: colors.bg, border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
            <Edit size={18} /> Chỉnh sửa
          </button>
        </div>

        {/* MAIN CARD */}
        <div style={{ backgroundColor: colors.card, borderRadius: "24px", padding: "35px", border: `1px solid ${isAdmin ? colors.secondary : colors.primary}`, marginBottom: "25px", display: "flex", gap: "30px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <img
              src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
              alt={user?.name}
              style={{ width: "110px", height: "110px", borderRadius: "25px", border: `3px solid ${isAdmin ? colors.secondary : colors.primary}`, padding: "4px" }}
            />
            <div style={{ position: "absolute", bottom: "-8px", right: "-8px", backgroundColor: isAdmin ? colors.secondary : colors.primary, padding: "6px", borderRadius: "10px" }}>
              {isAdmin ? <Settings size={18} color="#fff" /> : <ShieldCheck size={18} color="#fff" />}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "30px", fontWeight: 900 }}>{user?.name}</h2>
              {isAdmin && <span style={{ fontSize: "11px", backgroundColor: "rgba(168, 85, 247, 0.2)", color: colors.secondary, padding: "3px 10px", borderRadius: "20px", border: `1px solid ${colors.secondary}` }}>HỆ THỐNG</span>}
            </div>
            <p style={{ color: isAdmin ? colors.secondary : colors.primary, fontWeight: 500 }}>{isAdmin ? 'Quản trị viên cao cấp' : 'Học viên tiềm năng'}</p>
            
            {/* CHỈ HIỆN LEVEL/XP NẾU KHÔNG PHẢI ADMIN */}
            {!isAdmin && (
              <div style={{ display: "flex", gap: "15px", marginTop: "18px" }}>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "8px 16px", borderRadius: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: colors.muted }}>LEVEL</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: colors.primary }}>{user?.level || 1}</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "8px 16px", borderRadius: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: colors.muted }}>KINH NGHIỆM</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: colors.secondary }}>{user?.xp || 0} XP</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INFO GRID */}
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr" : "1fr 1fr", gap: "25px" }}>
          
          <div style={{ backgroundColor: colors.card, padding: "25px", borderRadius: "20px", border: `1px solid ${colors.border}` }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 20px 0", fontSize: "17px", color: isAdmin ? colors.secondary : colors.primary }}>
              <Mail size={18} /> Thông tin liên hệ
            </h3>
            <div style={{ fontSize: "13px", color: colors.muted }}>Email đăng nhập:</div>
            <div style={{ fontSize: "16px", fontWeight: 500, marginTop: "5px" }}>{user?.email}</div>

            {isAdmin && (
              <>
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.05)", margin: "20px 0" }} />
                <h3 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 20px 0", fontSize: "17px", color: colors.secondary }}>
                  <Users size={18} /> Quyền hạn quản trị
                </h3>
                <ul style={{ color: colors.muted, fontSize: "14px", paddingLeft: "20px" }}>
                  <li>Toàn quyền quản lý người dùng</li>
                  <li>Xem báo cáo và xuất file Excel hệ thống</li>
                  <li>Quản lý nội dung và lộ trình học tập</li>
                </ul>
              </>
            )}
          </div>

          {/* CHỈ HIỆN KỸ NĂNG NẾU LÀ HỌC VIÊN */}
          {!isAdmin && (
            <div style={{ backgroundColor: colors.card, padding: "25px", borderRadius: "20px", border: `1px solid ${colors.border}` }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 20px 0", fontSize: "17px", color: colors.primary }}>
                <Trophy size={18} /> Kỹ năng chuyên môn
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {user?.skillProfile && Object.entries(user.skillProfile).map(([skill, value]) => (
                  <div key={skill}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
                      <span style={{ textTransform: "uppercase" }}>{skill}</span>
                      <span style={{ color: colors.primary, fontWeight: "bold" }}>{value as number}%</span>
                    </div>
                    <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ width: `${value}%`, height: "100%", backgroundColor: colors.primary }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}