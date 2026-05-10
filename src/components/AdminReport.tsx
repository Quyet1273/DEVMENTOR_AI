import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext"; // <-- 1. IMPORT THEME
import { statsService } from "../services/statsService";
import {
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  BarChart3,
  Lock,
  CheckCircle,
  Unlock,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export function AdminReport() {
  // 2. LẤY MÀU TỪ HỆ THỐNG
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const [users, setUsers] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [lockedUsers, setLockedUsers] = useState<number[]>([]); 
  const [dateRange, setDateRange] = useState({
    start: "2024-03-01",
    end: "2024-03-31",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  useEffect(() => {
    statsService.getDetailedUserStats().then(setUsers);
    handleFilterTraffic();
  }, []);

  const handleFilterTraffic = async () => {
    const data = await statsService.getTrafficStats(
      new Date(dateRange.start),
      new Date(dateRange.end),
    );
    setTrafficData(data);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        filterLevel === "all" || u.level?.toString() === filterLevel;

      let matchesStatus = true;
      if (filterStatus === "completed") {
        matchesStatus = u.completed_courses > 0; 
      } else if (filterStatus === "learning") {
        matchesStatus = u.completed_courses === 0; 
      }

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [users, searchTerm, filterLevel, filterStatus]);

  const exportExcel = () => {
    if (filteredUsers.length === 0) {
      alert("Không có dữ liệu phù hợp để xuất file!");
      return;
    }

    const dataToExport = filteredUsers.map((u) => ({
      "Họ Tên": u.name,
      Email: u.email,
      "Cấp Độ": `Level ${u.level}`,
      "Kinh Nghiệm (XP)": u.xp,
      "Ngày Tham Gia": new Date(u.created_at).toLocaleDateString("vi-VN"),
      "Số Khóa Đang Học": u.total_courses,
      "Số Khóa Hoàn Thành": u.completed_courses,
      "Trạng Thái Học Tập":
        u.completed_courses > 0 ? "Đã tốt nghiệp" : "Đang học",
      "Tình Trạng Tài Khoản": "Đang hoạt động",
      "Ngày Xuất Báo Cáo": new Date().toLocaleDateString("vi-VN"),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh Sách Học Viên");

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Bao_Cao_Admin_DevMentor_${dateStr}.xlsx`);
  };

  const chartConfig = {
    labels: trafficData.map((d) => d.date),
    datasets: [
      {
        label: "Lượt truy cập",
        data: trafficData.map((d) => d.views),
        fill: true,
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}22`,
        tension: 0.4,
      },
    ],
  };

  const handleViewDetail = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleToggleLock = (userId: number) => {
    if (lockedUsers.includes(userId)) {
      setLockedUsers(lockedUsers.filter((id) => id !== userId)); 
    } else {
      setLockedUsers([...lockedUsers, userId]); 
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        minHeight: "100vh",
        color: colors.text,
        padding: "40px",
        fontFamily: "'Inter', sans-serif",
        transition: "all 0.3s ease",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800 }}>
          THỐNG KÊ <span style={{ color: colors.primary }}>HỆ THỐNG</span>
        </h1>
        <button
          onClick={exportExcel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: colors.primary,
            color: isDark ? "#020617" : "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
        >
          <Download size={18} /> XUẤT EXCEL
        </button>
      </div>

      {/* BIỂU ĐỒ TRUY CẬP */}
      <div
        style={{
          backgroundColor: colors.card,
          padding: "25px",
          borderRadius: "20px",
          border: `1px solid ${colors.border}`,
          marginBottom: "30px",
          boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.05)",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.text }}>
            <BarChart3 size={20} color={colors.primary} /> Lượng truy cập
          </h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              style={{
                backgroundColor: colors.inputBg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                padding: "5px 10px",
                borderRadius: "8px",
                outline: "none",
              }}
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              style={{
                backgroundColor: colors.inputBg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                padding: "5px 10px",
                borderRadius: "8px",
                outline: "none",
              }}
            />
            <button
              onClick={handleFilterTraffic}
              style={{
                backgroundColor: colors.secondary,
                color: "#fff",
                border: "none",
                padding: "5px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Lọc
            </button>
          </div>
        </div>
        <div style={{ height: "300px" }}>
          <Line
            data={chartConfig}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { color: colors.text }
                }
              },
              scales: {
                y: { 
                  grid: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" },
                  ticks: { color: colors.muted }
                },
                x: { 
                  grid: { display: false },
                  ticks: { color: colors.muted }
                },
              },
            }}
          />
        </div>
      </div>

      {/* DANH SÁCH CHI TIẾT */}
      <div
        style={{
          backgroundColor: colors.card,
          borderRadius: "20px",
          border: `1px solid ${colors.border}`,
          overflow: "hidden",
          boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.05)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          {/* Ô Tìm Kiếm */}
          <div style={{ flex: 2, position: "relative" }}>
            <Search
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: colors.muted }}
              size={18}
            />
            <input
              placeholder="Tìm tên, email..."
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                backgroundColor: colors.inputBg,
                border: `1px solid ${colors.border}`,
                borderRadius: "10px",
                color: colors.text,
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
            />
          </div>

          {/* Lọc Level */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: "10px",
              color: colors.text,
              outline: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <option value="all">Mọi cấp độ</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>

          {/* Lọc Hoàn Thành */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: "10px",
              color: colors.text,
              outline: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <option value="all">Tất cả tiến độ</option>
            <option value="completed">Đã tốt nghiệp (100%)</option>
            <option value="learning">Đang học dở dang</option>
          </select>
        </div>
        
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ backgroundColor: isDark ? "rgba(255,255,255,0.02)" : colors.inputBg, textAlign: "left" }}>
              <th style={{ padding: "12px 15px", color: colors.primary, fontSize: "11px", width: "25%" }}>TÊN HỌC VIÊN</th>
              <th style={{ padding: "12px 15px", color: colors.primary, fontSize: "11px", width: "15%" }}>EMAIL</th>
              <th style={{ padding: "12px 15px", color: colors.primary, fontSize: "11px", width: "12%" }}>LEVEL</th>
              <th style={{ padding: "12px 15px", color: colors.primary, fontSize: "11px", width: "15%" }}>NGÀY TẠO</th>
              <th style={{ padding: "12px 15px", color: colors.primary, fontSize: "11px", width: "15%" }}>TRẠNG THÁI</th>
              <th style={{ padding: "12px 15px", color: colors.primary, fontSize: "11px", width: "18%" }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr 
                key={u.id} 
                style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`, transition: "0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <td style={{ padding: "12px 15px" }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: colors.text }}>
                    {u.name}
                  </div>
                </td>
                <td style={{ padding: "12px 15px" }}>
                  <div style={{ color: colors.muted, fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {u.email}
                  </div>
                </td>
                <td style={{ padding: "12px 15px" }}>
                  <span style={{ color: colors.secondary, fontWeight: "bold", fontSize: "12px" }}>
                    Lvl {u.level}
                  </span>
                </td>
                <td style={{ padding: "12px 15px" }}>
                  <div style={{ color: colors.muted, fontSize: "12px" }}>
                    {new Date(u.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </td>
                <td style={{ padding: "12px 15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {u.completed_courses > 0 ? (
                      <span style={{ color: colors.primary, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle size={12} /> Đã tốt nghiệp
                      </span>
                    ) : (
                      <span style={{ color: colors.muted, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: colors.secondary }}></div> Đang học
                      </span>
                    )}
                    <span style={{ fontSize: "9px", color: "#10b981", opacity: 0.7 }}>
                      ● Hoạt động
                    </span>
                  </div>
                </td>
                <td style={{ padding: "12px 15px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleViewDetail(u)}
                      style={{ background: "none", border: "none", color: colors.primary, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", transition: "0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.2)"}
                      onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
                    >
                      <Search size={14} /> Chi tiết
                    </button>
                    <button
                      onClick={() => handleToggleLock(u.id)}
                      style={{ background: "none", border: "none", color: lockedUsers.includes(u.id) ? "#10b981" : "#f43f5e", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", transition: "0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.2)"}
                      onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
                    >
                      {lockedUsers.includes(u.id) ? (
                        <><Unlock size={14} /> Mở khóa</>
                      ) : (
                        <><Lock size={14} /> Khóa TK</>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)", // Nền kính mờ đổi theo theme
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              backgroundColor: colors.card,
              padding: "30px",
              borderRadius: "20px",
              width: "500px",
              border: `1px solid ${colors.primary}`,
              position: "relative",
              boxShadow: `0 10px 40px ${colors.primary}33`,
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: "absolute", right: "20px", top: "20px", background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: "20px", transition: "0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}
            >
              ×
            </button>

            <h2 style={{ color: colors.primary, marginBottom: "20px", borderBottom: `1px solid ${colors.border}`, paddingBottom: "10px" }}>
              Hồ Sơ Học Viên
            </h2>

            <div style={{ display: "grid", gap: "15px", fontSize: "14px", color: colors.text }}>
              <p><strong>Họ tên:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Cấp độ:</strong> Level {selectedUser.level} ({selectedUser.xp} XP)</p>

              <div style={{ marginTop: "10px" }}>
                <strong style={{ color: colors.primary }}>
                  Khóa học đã hoàn thành ({selectedUser.completed_courses}):
                </strong>
                <ul style={{ margin: "5px 0", color: "#10b981" }}>
                  {selectedUser.completed_courses > 0 ? (
                    <li>Toàn bộ lộ trình cơ bản</li>
                  ) : (
                    <li>Chưa có khóa nào</li>
                  )}
                </ul>
              </div>

              <div>
                <strong style={{ color: colors.secondary }}>
                  Khóa học đang học:
                </strong>
                <ul style={{ margin: "5px 0", color: colors.secondary }}>
                  <li>
                    {selectedUser.total_courses - selectedUser.completed_courses > 0
                      ? "Đang theo dõi các bài học mới"
                      : "Trống"}
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              style={{ marginTop: "20px", width: "100%", padding: "12px", backgroundColor: colors.primary, color: isDark ? "#020617" : "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
            >
              ĐÓNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}