import { useRef, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../data/translations";
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
  const { language } = useLanguage();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const t =
    translations[language as keyof typeof translations]?.dashboard ||
    translations.vi.dashboard;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalXp: 0,
    level: 1,
    completedLessons: 0,
    streak: 0,
    weeklyData: [] as any[],
  });

  const bannerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const blobPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const { data: userData } = await supabase
          .from("users")
          .select("xp, level")
          .eq("id", user.id)
          .single();
        const { data: progress } = await supabase
          .from("user_progress")
          .select("completed_at, xp_earned")
          .eq("user_id", user.id)
          .eq("is_completed", true);

        const daysVi = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days = language === "vi" ? daysVi : daysEn;

        const last7Days = [...Array(7)]
          .map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
              fullDate: d.toDateString(),
              dayName: days[d.getDay()],
              xp: 0,
            };
          })
          .reverse();

        progress?.forEach((item) => {
          const itemDate = new Date(item.completed_at).toDateString();
          const dayMatch = last7Days.find((d) => d.fullDate === itemDate);
          if (dayMatch) dayMatch.xp += item.xp_earned || 0;
        });

        const calculateStreak = (prog: any[]) => {
          if (!prog.length) return 0;
          const uniqueDates = Array.from(
            new Set(prog.map((p) => new Date(p.completed_at).toDateString())),
          ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          let streak = 0,
            checkDate = new Date();
          for (let i = 0; i < uniqueDates.length; i++) {
            const d = new Date(uniqueDates[i]);
            const diff = Math.floor(
              (new Date(checkDate.toDateString()).getTime() - d.getTime()) /
                86400000,
            );
            if (diff === i || diff === i - 1) streak++;
            else break;
          }
          return streak;
        };

        setStats({
          totalXp: userData?.xp || 0,
          level: userData?.level || 1,
          completedLessons: progress?.length || 0,
          streak: calculateStreak(progress || []),
          weeklyData: last7Days.map((d) => ({ day: d.dayName, xp: d.xp })),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.id, language]);

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
      return () => {
        banner.removeEventListener("mousemove", handleMouseMove);
        cancelAnimationFrame(animationId);
      };
    }
  }, []);

  const skillsData = user?.interested_skills
    ? Object.entries(user.interested_skills).map(([skill, value]) => ({
        skill: skill.toUpperCase(),
        level: Number(value),
      }))
    : [];

  const recentActivities = [
    {
      id: 1,
      type: "completed",
      title: t.activities.lessonCompleted,
      time: t.activities.justNow,
      xp: 50,
    },
    {
      id: 2,
      type: "streak",
      title: t.activities.streakReached.replace(
        "{count}",
        stats.streak.toString(),
      ),
      time: t.activities.today,
      xp: 100,
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: language === "vi" ? "Tiếp tục lộ trình học" : "Continue roadmap",
      dueDate: t.activities.today,
      priority: "high",
    },
    {
      id: 2,
      title: language === "vi" ? "Làm bài tập củng cố" : "Practice exercises",
      dueDate: language === "vi" ? "Ngày mai" : "Tomorrow",
      priority: "medium",
    },
  ];

  const xpToNextLevel = 3000;
  const xpProgress = (stats.totalXp / xpToNextLevel) * 100;

  if (loading)
    return (
      <div className="p-8 font-mono" style={{ color: colors.text }}>
        {t.loading}
      </div>
    );

  return (
    <div className="p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* BANNER SECTION */}
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
            boxShadow: isDark
              ? "0 25px 50px rgba(0, 0, 0, 0.5)"
              : "0 15px 30px rgba(0,0,0,0.1)",
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
          `}</style>

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

          <div style={{ position: "relative", zIndex: 10 }}>
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
                {t.banner.welcome} <br />
                <span
                  style={{
                    background: "linear-gradient(to right, #60a5fa, #a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 15px rgba(96, 165, 250, 0.4))",
                  }}
                >
                  {user?.name || (language === "vi" ? "Học viên" : "Learner")}
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
                {t.banner.description}
              </p>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-8">
          <style>{`
            .tech-card { transition: all 0.3s ease; }
            .tech-card:hover { transform: translateY(-5px); }
          `}</style>

          {/* Card 1: Streak */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              color: "#f59e0b",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Flame
                className="w-8 h-8"
                style={{ filter: "drop-shadow(0 0 8px #f59e0b)" }}
              />
              <span
                className="text-3xl font-black"
                style={{ color: colors.text }}
              >
                {stats.streak}
              </span>
            </div>
            {/* Dùng t.stats.streak thay vì viết cứng System_Streak */}
            <p
              className="text-xs uppercase tracking-widest font-mono"
              style={{ color: colors.muted }}
            >
              {t.stats.streak}
            </p>
            <p className="text-[10px] text-amber-500/70 mt-1">
              status:{" "}
              {stats.streak > 0
                ? language === "vi"
                  ? "đang cháy"
                  : "active"
                : "standby"}
            </p>
          </div>

          {/* Card 2: Level */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              color: "#06b6d4",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Award
                className="w-8 h-8"
                style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }}
              />
              <span
                className="text-3xl font-black"
                style={{ color: colors.text }}
              >
                {stats.level}
              </span>
            </div>
            {/* Dùng t.stats.level thay vì viết cứng User_Authority */}
            <p
              className="text-xs uppercase tracking-widest font-mono"
              style={{ color: colors.muted }}
            >
              {t.stats.level}
            </p>
            <div className="mt-2">
              <div
                style={{ backgroundColor: colors.inputBg }}
                className="w-full rounded-full h-1 overflow-hidden"
              >
                <div
                  className="h-full transition-all duration-1000"
                  style={{
                    width: `${xpProgress}%`,
                    backgroundColor: "#06b6d4",
                    boxShadow: "0 0 10px #06b6d4",
                  }}
                />
              </div>
              <p
                className="text-[10px] mt-1 font-mono"
                style={{ color: colors.muted }}
              >
                XP: {stats.totalXp} / {xpToNextLevel}
              </p>
            </div>
          </div>

          {/* Card 3: Hours/Lessons */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              color: "#10b981",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Clock
                className="w-8 h-8"
                style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
              />
              <span
                className="text-3xl font-black font-sans"
                style={{ color: colors.text }}
              >
                {stats.completedLessons}
              </span>
            </div>
            {/* Dùng t.stats.lessons thay vì viết cứng Uptime_Total */}
            <p
              className="text-xs uppercase tracking-widest font-mono"
              style={{ color: colors.muted }}
            >
              {t.stats.lessons}
            </p>
            <p className="text-[10px] text-emerald-500/70 mt-1 font-mono">
              {language === "vi"
                ? "trạng thái: đã hoàn thành"
                : "status: completed"}
            </p>
          </div>

          {/* Card 4: Roadmap Progress */}
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              color: "#8b5cf6",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Target
                className="w-8 h-8"
                style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
              />
              <span
                className="text-3xl font-black font-sans"
                style={{ color: colors.text }}
              >
                {Math.min(100, Math.round((stats.completedLessons / 20) * 100))}
                %
              </span>
            </div>
            {/* Dùng t.stats.progress thay vì viết cứng Deployment_Progress */}
            <p
              className="text-xs uppercase tracking-widest font-mono"
              style={{ color: colors.muted }}
            >
              {t.stats.progress}
            </p>
            <p className="text-[10px] text-purple-500/70 mt-1 font-mono">
              {`status: ${stats.completedLessons}/20 ${language === "vi" ? "bài học" : "units"}`}
            </p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div
            className="tech-card rounded-2xl p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2
              className="font-bold mb-6 flex items-center justify-center gap-2 font-mono uppercase tracking-tighter"
              style={{ color: colors.text }}
            >
              <TrendingUp
                className="w-5 h-5"
                style={{ color: colors.primary }}
              />
              {t.charts.progressTitle}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.weeklyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={colors.primary}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={colors.divider}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: colors.muted,
                    fontSize: 12,
                    fontFamily: "monospace",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: colors.muted,
                    fontSize: 12,
                    fontFamily: "monospace",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.card,
                    borderRadius: "12px",
                    border: `1px solid ${colors.primary}`,
                    color: colors.text,
                  }}
                  itemStyle={{ color: colors.primary }}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke={colors.primary}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div
            className="tech-card rounded-2xl p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2
              className="font-bold mb-6 flex items-center justify-center gap-2 font-mono uppercase tracking-tighter"
              style={{ color: colors.text }}
            >
              <Award className="w-5 h-5" style={{ color: colors.secondary }} />
              {t.charts.skillsTitle}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsData}>
                <PolarGrid stroke={colors.divider} />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{
                    fill: colors.muted,
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />
                <Radar
                  name="Level"
                  dataKey="level"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.5}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.secondary}`,
                    borderRadius: "10px",
                    color: colors.text,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LOGS, QUEUE, RANK */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div
            className="lg:col-span-1 tech-card rounded-2xl p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2
              className="font-bold mb-6 flex items-center justify-center gap-2 font-mono uppercase tracking-tighter"
              style={{ color: colors.text }}
            >
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              {t.columns.history}
            </h2>
            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center gap-4 p-4 rounded-r-xl"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderLeft: `4px solid ${act.type === "completed" ? "#10b981" : "#3b82f6"}`,
                  }}
                >
                  <div className="flex-1">
                    <p
                      className="font-bold text-sm"
                      style={{ color: colors.text }}
                    >
                      {act.title}
                    </p>
                    <p
                      className="text-[10px] font-mono italic uppercase mt-1"
                      style={{ color: colors.primary, opacity: 0.8 }}
                    >
                      timestamp: {act.time}
                    </p>
                  </div>
                  <p
                    className="font-black font-mono text-xs"
                    style={{ color: colors.primary }}
                  >
                    +{act.xp}XP
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="tech-card rounded-2xl p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2
              className="font-bold flex items-center gap-2 mb-6 font-mono uppercase tracking-tighter"
              style={{ color: colors.text }}
            >
              <Calendar className="w-5 h-5 text-purple-500" />
              {t.columns.tasks}
            </h2>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 rounded-r-xl"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderLeft: `4px solid ${task.priority === "high" ? "#ef4444" : "#3b82f6"}`,
                  }}
                >
                  <div className="flex-1">
                    <p
                      style={{
                        color: colors.text,
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {task.title}
                    </p>
                    <p
                      style={{
                        color: colors.secondary,
                        opacity: 0.8,
                        fontSize: "9px",
                        fontFamily: "monospace",
                      }}
                    >
                      sched: {task.dueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="tech-card rounded-2xl p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2
              className="font-bold flex items-center gap-2 mb-6 font-mono uppercase tracking-tighter"
              style={{ color: colors.text }}
            >
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              {t.columns.ranking}
            </h2>
            <div className="space-y-4">
              {[
                { rank: 1, name: "Trần Anh", xp: "12,450" },
                { rank: 15, name: t.columns.you, xp: "10,200", isMe: true },
              ].map((top, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-r-xl"
                  style={{
                    backgroundColor: top.isMe
                      ? `${colors.primary}22`
                      : colors.inputBg,
                    borderLeft: `4px solid ${top.isMe ? colors.primary : "transparent"}`,
                  }}
                >
                  <span
                    className="font-mono text-[10px] w-4"
                    style={{ color: top.rank === 1 ? "#f59e0b" : colors.muted }}
                  >
                    #{top.rank}
                  </span>
                  <div className="flex-1">
                    <p
                      style={{
                        color: colors.text,
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      {top.name}
                    </p>
                    <p
                      className="font-mono text-[9px]"
                      style={{ color: "#10b981" }}
                    >
                      {top.xp} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
