import React, { useState, useEffect, useMemo } from "react";
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
  const [users, setUsers] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null); // Lưu user đang được xem chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái đóng/mở modal
  const [lockedUsers, setLockedUsers] = useState<number[]>([]); // Lưu danh sách ID những đứa bị khóa
  const [dateRange, setDateRange] = useState({
    start: "2024-03-01",
    end: "2024-03-31",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all"); // THÊM DÒNG NÀY NÈ
  const colors = {
    bg: "#020617",
    card: "#0f172a",
    primary: "#22d3ee",
    secondary: "#a855f7",
    text: "#f8fafc",
    muted: "#64748b",
    border: "rgba(34, 211, 238, 0.1)",
  };

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
      // 1. Lọc theo search
      const matchesSearch =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Lọc theo Level
      const matchesLevel =
        filterLevel === "all" || u.level?.toString() === filterLevel;

      // 3. Lọc theo trạng thái hoàn thành
      let matchesStatus = true;
      if (filterStatus === "completed") {
        matchesStatus = u.completed_courses > 0; // Có ít nhất 1 khóa 100%
      } else if (filterStatus === "learning") {
        matchesStatus = u.completed_courses === 0; // Chưa xong khóa nào 100%
      }

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [users, searchTerm, filterLevel, filterStatus]);

  const exportExcel = () => {
    if (filteredUsers.length === 0) {
      alert("Không có dữ liệu phù hợp để xuất file!");
      return;
    }

    // Chuẩn bị dữ liệu: Thứ tự các key ở đây sẽ là thứ tự cột trong Excel
    const dataToExport = filteredUsers.map((u) => ({
      "Họ Tên": u.name,
      Email: u.email,
      "Cấp Độ": `Level ${u.level}`,
      "Kinh Nghiệm (XP)": u.xp,
      "Ngày Tham Gia": new Date(u.created_at).toLocaleDateString("vi-VN"),
      "Số Khóa Đang Học": u.total_courses,
      "Số Khóa Hoàn Thành": u.completed_courses,
      // CỘT TRẠNG THÁI CHUẨN ĐÂY
      "Trạng Thái Học Tập":
        u.completed_courses > 0 ? "Đã tốt nghiệp" : "Đang học",
      "Tình Trạng Tài Khoản": "Đang hoạt động",
      "Ngày Xuất Báo Cáo": new Date().toLocaleDateString("vi-VN"),
    }));

    // Tạo file Excel
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh Sách Học Viên");

    // Đặt tên file có ngày giờ cho uy tín
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Bao_Cao_Admin_DevMentor_${dateStr}.xlsx`);
  };

  // Cấu hình biểu đồ
  const chartConfig = {
    labels: trafficData.map((d) => d.date),
    datasets: [
      {
        label: "Lượt truy cập",
        data: trafficData.map((d) => d.views),
        fill: true,
        borderColor: colors.primary,
        backgroundColor: "rgba(34, 211, 238, 0.1)",
        tension: 0.4,
      },
    ],
  };
  // Mở modal xem chi tiết
  const handleViewDetail = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Đổi trạng thái Khóa/Mở (Toggle)
  const handleToggleLock = (userId: number) => {
    if (lockedUsers.includes(userId)) {
      setLockedUsers(lockedUsers.filter((id) => id !== userId)); // Mở khóa
    } else {
      setLockedUsers([...lockedUsers, userId]); // Khóa
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
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "30px",
        }}
      >
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
            color: colors.bg,
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
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
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BarChart3 size={20} color={colors.primary} /> Lượng truy cập
          </h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              style={{
                backgroundColor: colors.bg,
                color: "#fff",
                border: "1px solid #334155",
                padding: "5px 10px",
                borderRadius: "8px",
              }}
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              style={{
                backgroundColor: colors.bg,
                color: "#fff",
                border: "1px solid #334155",
                padding: "5px 10px",
                borderRadius: "8px",
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
              scales: {
                y: { grid: { color: "rgba(255,255,255,0.05)" } },
                x: { grid: { display: false } },
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
          {/* Ô Tìm Kiếm (Chiếm 40%) */}
          <div style={{ flex: 2, position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: colors.muted,
              }}
              size={18}
            />
            <input
              placeholder="Tìm tên, email..."
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                backgroundColor: colors.bg,
                border: "1px solid #1e293b",
                borderRadius: "10px",
                color: "#fff",
                outline: "none",
              }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lọc Level (Chiếm 30%) */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: colors.bg,
              border: "1px solid #1e293b",
              borderRadius: "10px",
              color: "#fff",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">Mọi cấp độ</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>

          {/* Lọc Hoàn Thành (Chiếm 30%) - Cái mày cần đây */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: colors.bg,
              border: "1px solid #1e293b",
              borderRadius: "10px",
              color: "#fff",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">Tất cả tiến độ</option>
            <option value="completed">Đã tốt nghiệp (100%)</option>
            <option value="learning">Đang học dở dang</option>
          </select>
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                textAlign: "left",
              }}
            >
              <th
                style={{
                  padding: "12px 15px",
                  color: colors.primary,
                  fontSize: "11px",
                  width: "25%",
                }}
              >
                TÊN HỌC VIÊN
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  color: colors.primary,
                  fontSize: "11px",
                  width: "15%",
                }}
              >
                EMAIL
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  color: colors.primary,
                  fontSize: "11px",
                  width: "12%",
                }}
              >
                LEVEL
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  color: colors.primary,
                  fontSize: "11px",
                  width: "15%",
                }}
              >
                NGÀY TẠO
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  color: colors.primary,
                  fontSize: "11px",
                  width: "15%",
                }}
              >
                TRẠNG THÁI
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  color: colors.primary,
                  fontSize: "11px",
                  width: "18%",
                }}
              >
                THAO TÁC
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
              >
                {/* 1. TÊN */}
                <td style={{ padding: "12px 15px" }}>
                  <div
                    style={{ fontWeight: 600, fontSize: "13px", color: "#fff" }}
                  >
                    {u.name}
                  </div>
                </td>

                {/* 2. EMAIL */}
                <td style={{ padding: "12px 15px" }}>
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: "12px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {u.email}
                  </div>
                </td>

                {/* 3. LEVEL */}
                <td style={{ padding: "12px 15px" }}>
                  <span
                    style={{
                      color: colors.secondary,
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    Lvl {u.level}
                  </span>
                </td>

                {/* 4. NGÀY TẠO (Mày bị thiếu thẻ td này nãy nè) */}
                <td style={{ padding: "12px 15px" }}>
                  <div style={{ color: colors.muted, fontSize: "12px" }}>
                    {new Date(u.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </td>

                {/* 5. TRẠNG THÁI */}
                <td style={{ padding: "12px 15px" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    {u.completed_courses > 0 ? (
                      <span
                        style={{
                          color: colors.primary,
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <CheckCircle size={12} /> Đã tốt nghiệp
                      </span>
                    ) : (
                      <span
                        style={{
                          color: colors.muted,
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            backgroundColor: colors.secondary,
                          }}
                        ></div>{" "}
                        Đang học
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#10b981",
                        opacity: 0.7,
                      }}
                    >
                      ● Hoạt động
                    </span>
                  </div>
                </td>

                {/* 6. THAO TÁC */}
                <td style={{ padding: "12px 15px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* NÚT XEM CHI TIẾT */}
                    <button
                      onClick={() => handleViewDetail(u)}
                      style={{
                        background: "none",
                        border: "none",
                        color: colors.primary,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                      }}
                    >
                      <Search size={14} /> Chi tiết
                    </button>

                    {/* NÚT KHÓA/MỞ TÀI KHOẢN */}
                    <button
                      onClick={() => handleToggleLock(u.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: lockedUsers.includes(u.id)
                          ? "#10b981"
                          : "#f43f5e",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                      }}
                    >
                      {lockedUsers.includes(u.id) ? (
                        <>
                          <Unlock size={14} /> Mở khóa
                        </>
                      ) : (
                        <>
                          <Lock size={14} /> Khóa TK
                        </>
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
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
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
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                right: "20px",
                top: "20px",
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              ×
            </button>

            <h2
              style={{
                color: colors.primary,
                marginBottom: "20px",
                borderBottom: `1px solid ${colors.border}`,
                paddingBottom: "10px",
              }}
            >
              Hồ Sơ Học Viên
            </h2>

            <div style={{ display: "grid", gap: "15px", fontSize: "14px" }}>
              <p>
                <strong>Họ tên:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Cấp độ:</strong> Level {selectedUser.level} (
                {selectedUser.xp} XP)
              </p>

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
                <ul style={{ margin: "5px 0", color: "#a855f7" }}>
                  <li>
                    {selectedUser.total_courses - selectedUser.completed_courses >
                    0
                      ? "Đang theo dõi các bài học mới"
                      : "Trống"}
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "10px",
                backgroundColor: colors.primary,
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ĐÓNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
