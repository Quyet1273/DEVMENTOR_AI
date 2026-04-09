import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  ChevronRight,
  Target,
  Sparkles,
  ChevronDown,
  Circle,
} from "lucide-react";

export function Roadmap() {
  const { id: courseId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(
    new Set(),
  );

  const bannerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const blobPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        if (!courseId) {
          const { data, error } = await supabase
            .from("course_enrollments")
            .select("*, courses(*)")
            .eq("user_id", user.id);
          if (error) throw error;
          setMyEnrollments(data || []);
        } else {
          const { data: enroll } = await supabase
            .from("course_enrollments")
            .select("*, courses(title)")
            .eq("user_id", user.id)
            .eq("course_id", courseId)
            .maybeSingle();

          if (!enroll) {
            setErrorStatus("Chưa đăng ký khóa này!");
            return;
          }
          setEnrollment(enroll);

          const { data: aiData } = await supabase
            .from("ai_roadmaps")
            .select(
              `
              id, ai_summary, 
              roadmap_milestones (
                id, title, description, order_index,
                milestone_lessons (ai_note, lessons (id, title))
              )
            `,
            )
            .eq("course_id", courseId)
            .eq("user_id", user.id)
            .single();

          if (aiData) {
            aiData.roadmap_milestones.sort(
              (a: any, b: any) => a.order_index - b.order_index,
            );
            setRoadmap(aiData);
            if (aiData.roadmap_milestones.length > 0) {
              setExpandedMilestones(
                new Set([aiData.roadmap_milestones[0].id.toString()]),
              );
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        setErrorStatus("Hệ thống chưa tìm thấy dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, user]);

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

  const toggleMilestone = (id: string) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading)
    return (
      <div className="p-20 text-center font-mono text-cyan-400">
        ĐANG ĐỒNG BỘ DỮ LIỆU...
      </div>
    );

  return (
    <div className="p-6 bg-[#020617] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* --- FIX BANNER: CHUẨN THEO image_e8c147.jpg --- */}
        <div
          ref={bannerRef}
          className="mb-10"
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
              0%, 100% { transform: scale(1); opacity: 0.3; filter: blur(1px); }
              50% { transform: scale(1.4); opacity: 1; filter: blur(0px); box-shadow: 0 0 15px currentColor; }
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

          {/* Scanline hiệu ứng HUD */}
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

          {/* Blob chuột */}
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
            {/* Terminal Dots */}
            <div className="flex gap-3 justify-center mb-10">
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"
                style={{ animation: "pro-dot-pulse 1.5s infinite" }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#eab308]"
                style={{
                  animation: "pro-dot-pulse 1.5s infinite",
                  animationDelay: "0.2s",
                }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"
                style={{
                  animation: "pro-dot-pulse 1.5s infinite",
                  animationDelay: "0.4s",
                }}
              />
            </div>

            {/* Title: KHÓA HỌC CỦA TÔI */}
            <h1
              style={{
                fontSize: "clamp(32px, 8vw, 72px)",
                fontWeight: "900",
                color: "#ffffff",
                letterSpacing: "-1px",
                textTransform: "uppercase",
              }}
            >
              {courseId ? "LỘ TRÌNH HỌC" : "KHÓA HỌC CỦA TÔI"}
            </h1>

            {/* Subtext HUD */}
            <p className="mt-8 font-mono text-sm" style={{ color: "#94a3b8" }}>
              <span style={{ color: "#60a5fa" }}>{`>> `}</span>
              Chào mừng{" "}
              <span style={{ color: "#a855f7", fontWeight: "bold" }}>
                {user?.name || "Nguyễn Văn Quyết"}
              </span>{" "}
              trở lại hành trình!
            </p>
          </div>
        </div>

        {!courseId ? (
          /* SECTION 2: DANH SÁCH KHÓA HỌC (CYAN NEON STYLE) */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {myEnrollments.map((item) => (
              <div
                key={item.id}
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: "#000000",
                  border: "2px solid #22d3ee",
                  boxShadow: "0 0 15px rgba(34, 211, 238, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-8px) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(34, 211, 238, 0.5)";
                  e.currentTarget.style.borderColor = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 0 15px rgba(34, 211, 238, 0.2)";
                  e.currentTarget.style.borderColor = "#22d3ee";
                }}
                onClick={() => navigate(`/roadmap/${item.course_id}`)}
              >
                <div
                  className="relative h-48"
                  style={{ backgroundColor: "#111" }}
                >
                  <img
                    src={item.courses?.thumbnail}
                    alt=""
                    className="w-full h-full object-cover opacity-70"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase bg-[#a855f7] text-white shadow-[0_0_15px_#a855f7]">
                    {item.progress}% HOÀN THÀNH
                  </span>
                </div>
                <div className="p-6 flex flex-col grow">
                  <h3
                    className="text-lg mb-4 font-bold font-mono uppercase text-white"
                    style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
                  >
                    {item.courses?.title}
                  </h3>
                  <div className="w-full bg-gray-900 h-2 rounded-full mb-8 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn chặn sự kiện click lan ra thẻ cha
                      // Điều hướng thẳng tới trang học với ID khóa học thực tế
                      navigate(`/learning/${item.course_id}`);
                    }}
                    className="w-full mt-auto py-3 rounded-lg font-bold flex items-center justify-center gap-2 uppercase font-mono transition-all bg-linear-to-r from-[#22d3ee] to-[#a855f7] shadow-[0_4px_15px_rgba(168,85,247,0.4)] hover:brightness-110 active:scale-95"
                    style={{ color: "rgba(255, 255, 255, 1)" }} // Đổi màu chữ sang trắng cho rõ trên nền gradient
                  >
                    TIẾP TỤC HÀNH TRÌNH <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* SECTION 3: CHI TIẾT LỘ TRÌNH (ĐỒNG BỘ STYLE NEON) */
          <div className="space-y-8">
            <div className="p-8 rounded-4xl border-2 border-[#22d3ee] bg-black shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold flex items-center gap-3 text-white font-mono uppercase">
                  <Target className="w-6 h-6 text-cyan-400" /> Tiến độ hiện tại
                </h2>
                <span
                  className="text-4xl font-black text-cyan-400"
                  style={{ textShadow: "0 0 10px #22d3ee" }}
                >
                  {enrollment?.progress || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-900 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 shadow-[0_0_15px_#22d3ee]"
                  style={{ width: `${enrollment?.progress || 0}%` }}
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl border-l-4 border-[#a855f7] bg-[#111] shadow-lg">
              <p className="text-[#a855f7] font-bold text-xs uppercase mb-2 flex items-center gap-2">
                <Sparkles size={14} /> Chiến thuật AI Mentor:
              </p>
              <p className="text-gray-400 italic text-sm leading-relaxed">
                "{roadmap?.ai_summary}"
              </p>
            </div>

            <div className="space-y-6">
              {roadmap?.roadmap_milestones.map((ms: any) => {
                const isExpanded = expandedMilestones.has(ms.id.toString());
                return (
                  <div
                    key={ms.id}
                    className="rounded-3xl border border-[#22d3ee]/30 bg-black/50 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleMilestone(ms.id.toString())}
                      className="w-full p-8 flex items-center gap-8 hover:bg-white/5 transition-all text-left"
                    >
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black border-2 border-[#a855f7] text-[#a855f7] bg-[#a855f7]/10">
                        {ms.order_index}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-white uppercase font-mono">
                          {ms.title}
                        </h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                          {ms.milestone_lessons?.length || 0} BÀI HỌC AI THIẾT
                          KẾ
                        </p>
                      </div>
                      <ChevronDown
                        className={`transition-transform ${isExpanded ? "rotate-180 text-cyan-400" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-8 pb-8 space-y-4">
                        {ms.milestone_lessons?.map((ml: any) => (
                          <div
                            key={ml.lessons.id}
                            className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 flex flex-col gap-3 group hover:border-[#22d3ee]/50 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <Circle className="w-5 h-5 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                              <h4 className="text-sm font-bold text-white uppercase font-mono">
                                {ml.lessons.title}
                              </h4>
                            </div>
                            {ml.ai_note && (
                              <div className="ml-9 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-cyan-400/80 italic">
                                🤖 AI Note: {ml.ai_note}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
