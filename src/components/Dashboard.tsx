import { useRef, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Target,
  Flame,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalXp: 0,
    level: 1,
    completedLessons: 0,
    streak: 0,
    weeklyData: [] as any[],
  });

  // Refs cho hiệu ứng Cursor Trail trong Banner
  const bannerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const blobPos = useRef({ x: 0, y: 0 });

  // 1. Logic Fetch dữ liệu thực từ Database
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const { data: userData } = await supabase.from("users").select("xp, level").eq("id", user.id).single();
        const { data: progress } = await supabase.from("user_progress").select("completed_at, xp_earned").eq("user_id", user.id).eq("is_completed", true);

        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return { fullDate: d.toDateString(), dayName: days[d.getDay()], xp: 0 };
        }).reverse();

        progress?.forEach((item) => {
          const itemDate = new Date(item.completed_at).toDateString();
          const dayMatch = last7Days.find((d) => d.fullDate === itemDate);
          if (dayMatch) dayMatch.xp += item.xp_earned || 0;
        });

        const calculateStreak = (prog: any[]) => {
          if (!prog.length) return 0;
          const uniqueDates = Array.from(new Set(prog.map(p => new Date(p.completed_at).toDateString())))
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          let streak = 0, checkDate = new Date();
          for (let i = 0; i < uniqueDates.length; i++) {
            const d = new Date(uniqueDates[i]);
            const diff = Math.floor((new Date(checkDate.toDateString()).getTime() - d.getTime()) / 86400000);
            if (diff === i || diff === i - 1) streak++; else break;
          }
          return streak;
        };

        setStats({
          totalXp: userData?.xp || 0,
          level: userData?.level || 1,
          completedLessons: progress?.length || 0,
          streak: calculateStreak(progress || []),
          weeklyData: last7Days.map(d => ({ day: d.dayName, xp: d.xp })),
        });
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchDashboardData();
  }, [user?.id]);

  // 2. Logic hiệu ứng Cursor Trail
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bannerRef.current) return;
      const rect = bannerRef.current.getBoundingClientRect();
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const animate = () => {
      if (blobRef.current) {
        const speed = 0.15;
        blobPos.current.x += (mousePos.current.x - blobPos.current.x) * speed;
        blobPos.current.y += (mousePos.current.y - blobPos.current.y) * speed;
        blobRef.current.style.transform = `translate(${blobPos.current.x - 150}px, ${blobPos.current.y - 150}px)`;
      }
      requestAnimationFrame(animate);
    };
    const banner = bannerRef.current;
    if (banner) {
      banner.addEventListener("mousemove", handleMouseMove);
      const animationId = requestAnimationFrame(animate);
      return () => { banner.removeEventListener("mousemove", handleMouseMove); cancelAnimationFrame(animationId); };
    }
  }, []);

  // Mock data cho các phần chưa có trong DB để giữ UI không bị trống/lỗi
  const skillsData = user?.interested_skills
  ? Object.entries(user.interested_skills).map(([skill, value]) => ({
      skill: skill.toUpperCase(),
      level: Number(value),
    }))
  : [];
  const recentActivities = [
    { id: 1, type: "completed", title: "Hoàn thành bài học mới", time: "Vừa xong", xp: 50 },
    { id: 2, type: "streak", title: `Đạt streak ${stats.streak} ngày!`, time: "Hôm nay", xp: 100 }
  ];
  const upcomingTasks = [
    { id: 1, title: "Tiếp tục lộ trình học", dueDate: "Hôm nay", priority: "high" },
    { id: 2, title: "Làm bài tập củng cố", dueDate: "Ngày mai", priority: "medium" }
  ];

  const xpToNextLevel = 3000;
  const xpProgress = (stats.totalXp / xpToNextLevel) * 100;

  if (loading) return <div className="p-8 text-white font-mono"> Đang tải dữ liệu...</div>;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* SECTION 1: PRO TECH BANNER */}
        <div
          ref={bannerRef}
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "32px",
            width: "100%",
            padding: "100px 20px",
            backgroundColor: "#020617",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            cursor: "crosshair",
          }}
        >
          <style>{`
            @keyframes moveGrid { from { background-position: 0 0; } to { background-position: 0 45px; } }
            @keyframes scanline { 0% { top: -100%; } 100% { top: 200%; } }
            @keyframes pro-dot-pulse {
              0%, 100% { transform: scale(1); opacity: 0.3; filter: blur(1px); box-shadow: none; }
              50% { transform: scale(1.4); opacity: 1; filter: blur(0px); box-shadow: 0 0 15px currentColor; }
            }
              @keyframes name-glow-pulse {
              0%, 100% { 
                filter: drop-shadow(0 0 15px rgba(96, 165, 250, 0.5)) drop-shadow(0 0 30px rgba(168, 85, 247, 0.3));
                opacity: 0.9;
              }
              50% { 
                filter: drop-shadow(0 0 25px rgba(96, 165, 250, 0.8)) drop-shadow(0 0 50px rgba(168, 85, 247, 0.6));
                opacity: 1;
              }
            }
              /* Hiệu ứng nghệ cho Log Item */
            .log-item-artistic {
              position: relative;
              overflow: hidden;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .log-item-artistic:hover {
              /* Gradient nghệ thuật: Chạy từ màu brand sang trong suốt */
              background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0) 100%) !important;
              transform: translateX(8px); /* Nhích nhẹ sang phải kiểu terminal */
              box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.05);
            }

            /* Hiệu ứng chữ sáng lên khi hover */
            .log-item-artistic:hover .log-title {
              color: #ffffff !important;
              text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            }

            .log-item-artistic:hover .log-xp {
              transform: scale(1.1);
              filter: drop-shadow(0 0 8px currentColor);
            }
          `}</style>

          {/* Lớp lưới Grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)",
              backgroundSize: "45px 45px",
              animation: "moveGrid 3s linear infinite",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Hiệu ứng Blob theo chuột */}
          <div
            ref={blobRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(168, 85, 247, 0.2) 40%, transparent 70%)",
              filter: "blur(40px)",
              pointerEvents: "none",
              zIndex: 0,
              willChange: "transform",
            }}
          />

          {/* Scanline */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "20%",
              pointerEvents: "none",
              zIndex: 2,
              background:
                "linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.05), transparent)",
              animation: "scanline 6s linear infinite",
            }}
          />

          {/* Nội dung Banner */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  color: "#ef4444",
                  animation: "pro-dot-pulse 1.5s infinite ease-in-out",
                  animationDelay: "0s",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#eab308",
                  color: "#eab308",
                  animation: "pro-dot-pulse 1.5s infinite ease-in-out",
                  animationDelay: "0.2s",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  color: "#22c55e",
                  animation: "pro-dot-pulse 1.5s infinite ease-in-out",
                  animationDelay: "0.4s",
                }}
              />
            </div>

            <div style={{ color: "#ffffff" }}>
              <h1
                style={{
                  fontSize: "clamp(32px, 8vw, 64px)",
                  fontWeight: "900",
                  margin: "10px 0",
                  lineHeight: "1.1",
                  letterSpacing: "-2px",
                }}
              >
                Xin chào, <br />
                <span
                  style={{
                    background: "linear-gradient(to right, #60a5fa, #a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 15px rgba(96, 165, 250, 0.4))",
                  }}
                >
                  {user?.name || "Học viên"}
                </span>{" "}
                ! 👋
              </h1>
              <div
                style={{
                  width: "100px",
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent, #3b82f6, transparent)",
                  margin: "20px auto",
                }}
              />
              <p
                style={{
                  fontFamily: "monospace",
                  color: "#94a3b8",
                  fontSize: "16px",
                  maxWidth: "500px",
                  margin: "0 auto",
                  lineHeight: "1.6",
                }}
              >
                <span style={{ color: "#60a5fa" }}>{`>> `}</span>
                Chào mừng trở lại! Hãy tiếp tục hành trình học tập và chinh phục
                những dòng code mới.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-8">
          {/* CSS để tạo hiệu ứng Hover phát sáng */}
          <style>{`
            .tech-card {
              transition: all 0.3s ease;
              background: #0f172a !important; /* Màu Slate 900 chuyên nghiệp */
              border: 1px solid rgba(255, 255, 255, 0.05) !important;
            }
            .tech-card:hover {
              transform: translateY(-5px);
              border-color: currentColor !important;
              box-shadow: 0 10px 30px -10px currentColor;
            }
            `}</style>

          {/* Card 1: Streak - Màu Cam Amber (Hệ năng lượng) */}
       {/* Card 1: Streak - Đã đổ stats.streak thực tế */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{ color: "#f59e0b" }}
          >
            <div className="flex items-center justify-between mb-4">
              <Flame
                className="w-8 h-8"
                style={{ filter: "drop-shadow(0 0 8px #f59e0b)" }}
              />
              <span className="text-3xl font-black text-white">
                {stats.streak}
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-gray-400">
              System_Streak
            </p>
            <p className="text-[10px] text-amber-500/70 mt-1">
              status: {stats.streak > 0 ? 'active_burning' : 'standby'}
            </p>
          </div>

         {/* Card 2: Level - Đã đổ stats thực tế */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{ color: "#06b6d4" }}
          >
            <div className="flex items-center justify-between mb-4">
              <Award
                className="w-8 h-8"
                style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }}
              />
              <span className="text-3xl font-black text-white">
                {stats.level}
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-gray-400">
              User_Authority
            </p>

            {/* SỬA: Giảm mt-4 xuống mt-2 để kéo cả cụm lên */}
            <div className="mt-2">
              <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full transition-all duration-1000"
                  style={{
                    width: `${xpProgress}%`,
                    backgroundColor: "#06b6d4",
                    boxShadow: "0 0 10px #06b6d4",
                  }}
                />
              </div>
              {/* SỬA: Giảm mt-2 xuống mt-1 để dòng XP ngang hàng với status card khác */}
              <p className="text-[10px] text-gray-500 mt-1 font-mono ">
                XP: {stats.totalXp} / {xpToNextLevel}
              </p>
            </div>
          </div>

        {/* Card 3: Hours - Đã đổ stats.completedLessons thực tế */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              color: "#10b981",
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Clock
                className="w-8 h-8"
                style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
              />
              <span
                className="text-3xl font-black text-white"
                style={{ fontFamily: "sans-serif" }}
              >
                {stats.completedLessons}
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-gray-400">
              Uptime_Total
            </p>
            <p className="text-[10px] text-emerald-500/70 mt-1 font-mono">{`status: >_compiled_units`}</p>
          </div>

        {/* Card 4: Roadmap - Đã đổ dữ liệu phần trăm thực tế */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              color: "#8b5cf6",
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Target
                className="w-8 h-8"
                style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
              />
              <span
                className="text-3xl font-black text-white"
                style={{ fontFamily: "sans-serif" }}
              >
                {Math.min(100, Math.round((stats.completedLessons / 20) * 100))}%
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-gray-400">
              Deployment_Progress
            </p>
            <p className="text-[10px] text-purple-500/70 mt-1 font-mono">
              {`status: ${stats.completedLessons}/20_compiled`}
            </p>
          </div>
        </div>

        {/* SECTION 3: CHARTS & TASKS */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
         {/* Chart 1: Tiến độ 7 ngày - Đã fix dataKey đổ XP thực */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <h2 className="font-bold mb-6 flex items-center justify-center gap-2 text-white font-mono uppercase tracking-tighter">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Tiến độ học tập 7 ngày qua
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.weeklyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#1e293b"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                    fontFamily: "monospace",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                    fontFamily: "monospace",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "1px solid #3b82f6",
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#60a5fa" }}
                />
                <Area
                  type="monotone"
                  dataKey="xp" // SỬA CHỖ NÀY: Từ hours thành xp
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

       {/* Chart 2: Phân tích kỹ năng - Đã đổ skillsData thực tế */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <h2 className="font-bold mb-6 flex items-center justify-center gap-2 text-white font-mono uppercase tracking-tighter">
              <Award className="w-5 h-5 text-purple-500" />
              Phân tích kỹ năng
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsData}>
                {/* Lưới Radar màu tối mờ ảo */}
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />
                <Radar
                  name="Level"
                  dataKey="level"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.5}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #a855f7",
                    borderRadius: "10px",
                  }}
                  itemStyle={{ color: "#d8b4fe" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 4: RECENT & TASKS */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* CỘT 1: SYSTEM LOGS (Đã nâng cấp Độ tương phản & Nghệ thuật) */}
          <div
            className="lg:col-span-1 tech-card rounded-2xl p-6"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <h2 className="font-bold mb-6 flex items-center justify-center gap-2 text-white font-mono uppercase tracking-tighter">
              <CheckCircle2
                className="w-5 h-5 text-blue-500"
                style={{ filter: "drop-shadow(0 0 5px #3b82f6)" }}
              />
              <span style={{ opacity: 0.9 }}>Lịch sử hoạt động</span>
            </h2>

            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="log-item-artistic flex items-center gap-4 p-4 rounded-r-xl group"
                  style={{
                    background: "rgba(30, 41, 59, 0.3)",
                    borderLeft: `4px solid ${activity.type === "completed" ? "#10b981" : "#3b82f6"}`,
                    cursor: "pointer",
                  }}
                >
                  <div className="flex-1">
                    {/* TIÊU ĐỀ: ÉP MÀU TRẮNG TUYỆT ĐỐI ĐỂ KHÔNG BỊ CHÌM */}
                    <p
                      className="log-title font-bold text-sm transition-colors duration-300"
                      style={{
                        color: "#ffffff",
                        textShadow: "0 0 10px rgba(255,255,255,0.1)",
                      }}
                    >
                      {activity.title}
                    </p>

                    {/* SUBTEXT: DÙNG CYAN SÁNG HƠN MỘT CHÚT (70% OPACITY) ĐỂ DỄ ĐỌC */}
                    <p
                      className="text-[10px] font-mono italic uppercase tracking-widest mt-1"
                      style={{ color: "rgba(103, 232, 249, 0.7)" }}
                    >
                      {`timestamp: ${activity.time}`}
                    </p>
                  </div>

                  <div className="text-right">
                    {/* XP: DÙNG BLUE-400 SÁNG ĐỂ TẠO ĐIỂM NHẤN */}
                    <p
                      className="log-xp font-black font-mono text-xs transition-all duration-300"
                      style={{ color: "#60a5fa" }}
                    >
                      {`+${activity.xp}XP`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Decor nhẹ dưới đáy cho nghệ */}
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-blue-500/40"></div>
                <div className="w-8 h-1 rounded-full bg-blue-500/20"></div>
              </div>
              {/* <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Auto_Refresh: ON</span> */}
            </div>
          </div>

          {/* CỘT 2: TASK QUEUE (Đã đồng bộ Form & Hover với Cột 1) */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold flex items-center justify-center gap-2 text-white font-mono uppercase tracking-tighter">
                <Calendar
                  className="w-5 h-5 text-purple-500"
                  style={{ filter: "drop-shadow(0 0 5px #a855f7)" }}
                />
                <span style={{ color: "#ffffff", opacity: 0.9 }}>Nhiệm vụ</span>
              </h2>
              <Link
                to="/roadmap"
                className="text-[10px] text-purple-400 font-black hover:text-purple-300 tracking-widest font-mono"
              >
                Tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 rounded-r-xl transition-all duration-300 group"
                  style={{
                    background: "rgba(30, 41, 59, 0.3)",
                    // Border trái theo màu Priority: High (Đỏ), Medium (Xanh), Low (Tím)
                    borderLeft: `4px solid ${
                      task.priority === "high"
                        ? "#ef4444"
                        : task.priority === "medium"
                          ? "#3b82f6"
                          : "#a855f7"
                    }`,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  // Hiệu ứng Hover Gradient Tím (đặc trưng của Task Queue)
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(90deg, rgba(168, 85, 247, 0.15) 0%, rgba(15, 23, 42, 0) 100%)";
                    e.currentTarget.style.transform = "translateX(8px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(30, 41, 59, 0.3)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div className="flex-1">
                    {/* TIÊU ĐỀ: Fix màu trắng Slate-50 giống Cột 1 */}
                    <p
                      style={{
                        color: "#f8fafc",
                        fontWeight: "bold",
                        fontSize: "13px",
                        marginBottom: "4px",
                      }}
                    >
                      {task.title}
                    </p>

                    {/* SUBTEXT: Màu Cyan HUD mờ ảo */}
                    <p
                      style={{
                        color: "#67e8f9",
                        opacity: 0.5,
                        fontSize: "9px",
                        fontFamily: "monospace",
                        fontStyle: "italic",
                        textTransform: "uppercase",
                      }}
                    >
                      {`sched: ${task.dueDate}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        color:
                          task.priority === "high"
                            ? "#ef4444"
                            : task.priority === "medium"
                              ? "#3b82f6"
                              : "#a855f7",
                        border: `1px solid ${task.priority === "high" ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
                        filter: "drop-shadow(0 0 2px currentColor)",
                      }}
                      className="text-[9px] px-2 py-0.5 rounded font-black font-mono"
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Decor chân trang đồng bộ với Cột 1 */}
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center opacity-30">
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                <div className="w-6 h-1 rounded-full bg-purple-500/50"></div>
              </div>
              <span className="text-[8px] font-mono text-white tracking-[0.2em]">
                QUEUE: STABLE
              </span>
            </div>
          </div>
          {/* CỘT 3: TOP RANK (Đã đồng bộ Form & Hover Emerald nghệ thuật) */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold flex items-center gap-2 text-white font-mono uppercase tracking-tighter">
                <TrendingUp
                  className="w-5 h-5 text-emerald-400"
                  style={{ filter: "drop-shadow(0 0 5px #10b981)" }}
                />
                <span style={{ color: "#ffffff", opacity: 0.9 }}>
                  Xếp hạng{" "}
                </span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  rank: 1,
                  name: "Trần Anh Tuấn",
                  xp: "12,450",
                  avatar: "https://i.pravatar.cc/150?u=1",
                },
                {
                  rank: 2,
                  name: "Bùi Quỳnh",
                  xp: "10,200",
                  avatar: "https://i.pravatar.cc/150?u=2",
                },
                {
                  rank: 3,
                  name: "Lê Minh",
                  xp: "8,900",
                  avatar: "https://i.pravatar.cc/150?u=3",
                },
                {
                  rank: 15,
                  name: user?.name || "Nguyễn Văn Quyết",
                  xp: user?.xp || "0",
                  isMe: true,
                },
              ].map((top, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-r-xl transition-all duration-300 group"
                  style={{
                    background: top.isMe
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgba(30, 41, 59, 0.3)",
                    borderLeft: `4px solid ${top.rank === 1 ? "#f59e0b" : top.isMe ? "#3b82f6" : "transparent"}`,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    border: top.isMe
                      ? "1px solid rgba(59, 130, 246, 0.2)"
                      : "none",
                  }}
                  // Hiệu ứng Hover Gradient Emerald (Xanh lá - màu của sự tăng trưởng)
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0) 100%)";
                    e.currentTarget.style.transform = "translateX(8px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = top.isMe
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgba(30, 41, 59, 0.3)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {/* Số thứ hạng font Mono */}
                  <span
                    className={`font-mono text-[10px] w-4 ${
                      top.rank === 1
                        ? "text-yellow-400"
                        : top.rank === 2
                          ? "text-gray-300"
                          : top.rank === 3
                            ? "text-orange-400"
                            : "text-gray-500"
                    }`}
                    style={{
                      textShadow:
                        top.rank <= 3 ? "0 0 5px currentColor" : "none",
                    }}
                  >
                    #{top.rank}
                  </span>

                  {/* Avatar với viền mỏng */}
                  <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-slate-800 flex-shrink-0">
                    <img
                      src={
                        top.avatar ||
                        `https://ui-avatars.com/api/?name=${top.name}&background=0f172a&color=fff`
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* TÊN: Fix màu Slate-50 rực rỡ */}
                    <p
                      className="truncate"
                      style={{
                        color: "#f8fafc",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      {top.name}{" "}
                      {top.isMe && (
                        <span className="text-[9px] text-blue-400 ml-1">
                          (Bạn)
                        </span>
                      )}
                    </p>
                    {/* XP: Dùng màu Emerald mờ đúng vibe Ranking */}
                    <p
                      className="font-mono"
                      style={{
                        color: "#10b981",
                        opacity: 0.7,
                        fontSize: "9px",
                      }}
                    >
                      {top.xp} XP
                    </p>
                  </div>

                  {/* Huy hiệu nhỏ cho Top 1 */}
                  {top.rank === 1 && (
                    <Award
                      className="w-4 h-4 text-yellow-400"
                      style={{ filter: "drop-shadow(0 0 5px #f59e0b)" }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Button Footer đồng bộ style CLI */}
            <button className="w-full mt-6 py-2 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-black tracking-widest hover:bg-emerald-500/10 transition-all uppercase font-mono">
              Generate_Ranking_Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
