import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { enrollmentService } from "../services/enrollmentService";
import { supabase } from "../lib/supabase";
// import { useCourseController } from "../controllers/useCourserController";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  Star,
  Users,
  PlayCircle,
  Clock,
  BookOpen,
  Award,
  Zap,
} from "lucide-react";

export function Courses() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState<number | null>(null);
  // state này để lưu ID các khóa đã đăng ký
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  // --- STATE BỘ LỌC & UI ---
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState<number | null>(null);

  const bannerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const blobPos = useRef({ x: 0, y: 0 });

  const categories = ["all", "Frontend", "Backend", "Fullstack", "Tools"];
  const levels = ["all", "beginner", "intermediate", "advanced"];

  // 1. LẤY DỮ LIỆU KHÓA HỌC TRỰC TIẾP
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("is_active", true);
        if (error) throw error;
        setCourses(data || []);
      } catch (err) {
        console.error("Lỗi fetch courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);
  // 1.5 LẤY DANH SÁCH KHÓA HỌC ĐÃ ĐĂNG KÝ CỦA USER (DÙNG CHO BỘ LỌC & HIỂN THỊ)
  useEffect(() => {
    const fetchMyEnrollments = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("course_enrollments")
        .select("course_id")
        .eq("user_id", user.id);
      if (data) setEnrolledCourseIds(data.map((item) => item.course_id));
    };
    fetchMyEnrollments();
  }, [user]);
  // 2. XỬ LÝ ĐĂNG KÝ (ĐÃ FIX LỖI ĐIỀU HƯỚNG & TRÙNG LẶP)
  const handleEnrollClick = async (course: any) => {
    const isEnrolled = enrolledCourseIds.includes(course.id);

    // Nếu đã đăng ký rồi thì phi thẳng vào Roadmap luôn, không gọi AI nữa
    if (isEnrolled) {
      navigate(`/roadmap/${course.id}`);
      return;
    }

    try {
      if (!user) {
        alert("Quỳnh ơi, bạn cần đăng nhập để AI thiết lập lộ trình!");
        return;
      }

      setIsEnrolling(course.id);

      // Gọi service xử lý AI + DB
      const result = await enrollmentService.enrollWithAI(user.id, course);

      if (result.success) {
        // CẬP NHẬT STATE TỨC THÌ ĐỂ NÚT ĐỔI MÀU/CHỮ
        setEnrolledCourseIds((prev) => [...prev, course.id]);

        alert("AI đã thiết lập lộ trình riêng cho bạn!");
        navigate(`/roadmap/${course.id}`);
      }
    } catch (error: any) {
      // Xử lý khi có lỗi trùng lặp (đề phòng bấm nhanh 2 lần)
      if (
        error.code === "23505" ||
        error.message?.includes("unique_violation")
      ) {
        setEnrolledCourseIds((prev) => [...prev, course.id]); // Cập nhật lại state cho chuẩn
        navigate(`/roadmap/${course.id}`);
      } else {
        console.error("Lỗi đăng ký:", error);
        alert("Có chút trục trặc khi gọi AI, thử lại nhé!");
      }
    } finally {
      setIsEnrolling(null);
    }
  };

  // 3. HIỆU ỨNG ANIMATION BANNER (DỌN DẸP TRÙNG LẶP)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bannerRef.current) return;
      const rect = bannerRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
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

  // 4. LOGIC TÍNH TOÁN STATS & FILTER
  const stats = [
    {
      label: "System_Courses",
      val: courses.length,
      icon: <BookOpen size={35} />,
      color: "#f59e0b",
      status: "active_learning",
    },
    {
      label: "Total_Students",
      val: "1,284",
      icon: <Users size={35} />,
      color: "#06b6d4",
      status: "syncing_live",
    },
    {
      label: "Completed_Task",
      val: "856",
      icon: <Award size={35} />,
      color: "#10b981",
      status: "verified_ready",
    },
    {
      label: "System_XP",
      val: "12.5k",
      icon: <Zap size={35} />,
      color: "#a855f7",
      status: "level_up",
    },
  ];

  const getLevelLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "Cơ bản";
      case "intermediate":
        return "Trung bình";
      case "advanced":
        return "Nâng cao";
      default:
        return level;
    }
  };

  const filteredCourses = courses.filter((course) => {
    // 1. Lọc theo Danh mục
    const matchesCategory =
      selectedCategory === "all" || course.category === selectedCategory;

    // 2. Lọc theo Cấp độ
    const matchesLevel =
      selectedLevel === "all" ||
      course.level?.toLowerCase() === selectedLevel?.toLowerCase();

    // 3. Lọc theo Khóa đã đăng ký (PHẦN BẠN ĐANG THIẾU)
    // Nếu checkbox được tích (true), thì chỉ giữ lại những khóa có ID nằm trong danh sách đã đăng ký
    const matchesEnrolled =
      !showEnrolledOnly || enrolledCourseIds.includes(course.id);

    return matchesCategory && matchesLevel && matchesEnrolled;
  });

  if (loading)
    return (
      <div className="p-20 text-center font-mono text-cyan-500 uppercase animate-pulse">
        Đang kết nối Database...
      </div>
    );

  return (
    <div className="p-6 bg-[#020617] min-h-screen">
      {" "}
      {/* ---  BANNER KHÓA HỌC  --- */}
      <div className="max-w-7xl mx-auto">
        <div
          ref={bannerRef}
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "32px",
            width: "100%",
            padding: "80px 20px",
            backgroundColor: "#020617",
            border: "1px solid rgba(59, 130, 246, 0.2)",
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

          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)",
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
                "radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)",
              filter: "blur(50px)",
              pointerEvents: "none",
              zIndex: 0,
              willChange: "transform",
            }}
          />

          <div style={{ position: "relative", zIndex: 10 }}>
            <div className="flex gap-3 justify-center mb-6">
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  animation: "pro-dot-pulse 1.5s infinite ease-in-out",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#3b82f6",
                  animation: "pro-dot-pulse 1.5s infinite ease-in-out",
                  animationDelay: "0.2s",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#a855f7",
                  animation: "pro-dot-pulse 1.5s infinite ease-in-out",
                  animationDelay: "0.4s",
                }}
              />
            </div>

            <div style={{ color: "#ffffff" }}>
              <h1
                style={{
                  fontSize: "clamp(32px, 7vw, 60px)",
                  fontWeight: "900",
                  letterSpacing: "-0.05em",
                  lineHeight: "1.2",
                }}
              >
                <span
                  style={{
                    background:
                      "linear-gradient(to right, #22d3ee, #3b82f6, #a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 20px rgba(34, 211, 238, 0.4))",
                  }}
                >
                  KHÓA HỌC CHO SỰ NGHIỆP DEV CỦA BẠN
                </span>
              </h1>

              <div
                style={{
                  width: "150px",
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent, #22d3ee, transparent)",
                  margin: "25px auto",
                }}
              />

              <p
                style={{
                  fontFamily: "monospace",
                  color: "#94a3b8",
                  fontSize: "18px",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                Chinh phục đỉnh cao lập trình, làm chủ tương lai cùng AI
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-6 md:px-8">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            style={{
              marginTop: "60px",
              marginBottom: "50px",
              position: "relative",
              zIndex: 50,
            }}
          >
            {stats.map((item, index) => (
              <div
                key={index}
                onMouseEnter={() => setIsCardHovered(index)}
                onMouseLeave={() => setIsCardHovered(null)}
                style={{
                  backgroundColor: "#020617",
                  borderRadius: "24px",
                  padding: "28px",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  border:
                    isCardHovered && isCardHovered === index
                      ? `1.5px solid ${item.color}`
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow:
                    isCardHovered && isCardHovered === index
                      ? `0 0 30px ${item.color}40, inset 0 0 15px ${item.color}20`
                      : "0 10px 30px rgba(0, 0, 0, 0.5)",
                  transform:
                    isCardHovered && isCardHovered === index
                      ? "translateY(-10px)"
                      : "translateY(0)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "35px",
                  }}
                >
                  <div
                    style={{
                      color: item.color,
                      filter: `drop-shadow(0 0 8px ${item.color})`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "42px",
                      fontWeight: "900",
                      color: "#ffffff",
                      lineHeight: "1",
                      fontFamily: "system-ui",
                      textShadow: "0 0 15px rgba(255,255,255,0.2)",
                    }}
                  >
                    {item.val}
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      fontFamily: "monospace",
                      margin: "0",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      color: item.color,
                      fontSize: "14px",
                      fontWeight: "800",
                      marginTop: "6px",
                      filter: `drop-shadow(0 0 5px ${item.color}80)`,
                    }}
                  >
                    status:{" "}
                    <span
                      className="animate-pulse"
                      style={{ textDecoration: "underline" }}
                    >
                      {item.status}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="grid md:grid-cols-3 gap-6 p-6 mb-8 rounded-xl"
          style={{
            backgroundColor: "#000000",
            border: "2px solid #22d3ee",
            boxShadow: "0 0 20px rgba(34, 211, 238, 0.4)",
          }}
        >
          <div className="flex flex-col">
            <label
              className="block text-sm font-bold mb-2 font-mono"
              style={{
                color: "#ffffff",
                textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
              }}
            >
              DANH MỤC
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg outline-none cursor-pointer"
              style={{
                backgroundColor: "#111111",
                border: "1px solid #a855f7",
                color: "#ffffff",
              }}
            >
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  style={{ backgroundColor: "#000" }}
                >
                  {cat === "all" ? "Tất cả danh mục" : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              className="block text-sm font-bold mb-2 font-mono"
              style={{
                color: "#ffffff",
                textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
              }}
            >
              CẤP ĐỘ
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg outline-none cursor-pointer"
              style={{
                backgroundColor: "#111111",
                border: "1px solid #a855f7",
                color: "#ffffff",
              }}
            >
              {levels.map((lvl) => (
                <option
                  key={lvl}
                  value={lvl}
                  style={{ backgroundColor: "#000" }}
                >
                  {lvl === "all" ? "Tất cả cấp độ" : getLevelLabel(lvl)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div
              className="hidden md:block mb-2"
              style={{ height: "1.8rem" }}
            ></div>

            <label className="flex items-center gap-3 cursor-pointer h-10.5">
              <input
                type="checkbox"
                checked={showEnrolledOnly}
                onChange={(e) => setShowEnrolledOnly(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
                style={{ accentColor: "#a855f7" }}
              />
              <span
                className="text-sm font-bold font-mono uppercase"
                style={{
                  color: "#ffffff",
                  textShadow: "0 0 8px rgba(255, 255, 255, 0.6)",
                }}
              >
                Chỉ hiện khóa đã đăng ký
              </span>
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            // Kiểm tra xem khóa này Quỳnh đã đăng ký chưa
            const isEnrolled = enrolledCourseIds.includes(course.id);

            return (
              <div
                key={course.id}
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
              >
                <div
                  className="relative h-48"
                  style={{ backgroundColor: "#111" }}
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: "0.7" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = "0.7")
                    }
                  />
                  <span
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase"
                    style={{
                      backgroundColor: "#a855f7",
                      color: "#ffffff",
                      boxShadow: "0 0 15px #a855f7",
                      zIndex: 10,
                    }}
                  >
                    {getLevelLabel(course.level)}
                  </span>
                </div>

                <div className="p-6 flex flex-col grow">
                  <div className="mb-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded uppercase font-mono"
                      style={{
                        border: "1px solid #a855f7",
                        color: "#a855f7",
                        backgroundColor: "rgba(168, 85, 247, 0.1)",
                      }}
                    >
                      {course.category}
                    </span>
                  </div>

                  <h3
                    className="text-lg mb-2 line-clamp-1 font-bold font-mono uppercase transition-colors"
                    style={{
                      color: "#ffffff",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    {course.title?.toUpperCase() || "UNNAMED COURSE"}
                  </h3>

                  <p
                    className="text-sm mb-4 line-clamp-2"
                    style={{ color: "#94a3b8" }}
                  >
                    {course.description}
                  </p>

                  <div
                    className="flex items-center gap-4 text-xs mb-4 font-mono"
                    style={{ color: "#22d3ee" }}
                  >
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" style={{ fill: "#22d3ee" }} />{" "}
                      {course.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {course.students_enrolled}
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" /> {course.total_lessons}{" "}
                      BÀI
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-2 text-xs mb-6 font-mono"
                    style={{ color: "#64748b" }}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{course.duration?.toUpperCase() || "N/A"}</span>
                  </div>

                  <button
                    onClick={() =>
                      isEnrolled
                        ? navigate(`/roadmap/${course.id}`)
                        : handleEnrollClick(course)
                    }
                    disabled={isEnrolling !== null}
                    className="w-full mt-auto py-3 rounded-lg font-bold flex items-center justify-center gap-2 uppercase font-mono transition-all"
                    style={{
                      // Nếu đã đăng ký: Đổi sang Gradient Emerald (Xanh lá Cyber)
                      background:
                        isEnrolling === course.id
                          ? "#1a1a1a"
                          : isEnrolled
                            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                            : "linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)",
                      color: isEnrolling === course.id ? "#666" : "#ffffff",
                      boxShadow:
                        isEnrolling === course.id
                          ? "none"
                          : isEnrolled
                            ? "0 4px 15px rgba(16, 185, 129, 0.4)"
                            : "0 4px 15px rgba(168, 85, 247, 0.4)",
                      border:
                        isEnrolling === course.id ? "1px solid #333" : "none",
                      cursor:
                        isEnrolling === course.id ? "not-allowed" : "pointer",
                      pointerEvents: isEnrolling !== null ? "none" : "auto",
                    }}
                    onMouseEnter={(e) => {
                      if (isEnrolling === null) {
                        e.currentTarget.style.filter = "brightness(1.2)";
                        e.currentTarget.style.boxShadow = isEnrolled
                          ? "0 0 25px rgba(16, 185, 129, 0.6)"
                          : "0 0 25px rgba(34, 211, 238, 0.6)";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isEnrolling === null) {
                        e.currentTarget.style.filter = "brightness(1)";
                        e.currentTarget.style.boxShadow = isEnrolled
                          ? "0 4px 15px rgba(16, 185, 129, 0.4)"
                          : "0 4px 15px rgba(168, 85, 247, 0.4)";
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    {isEnrolling === course.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-cyan-500">
                          AI đang thiết lập...
                        </span>
                      </>
                    ) : isEnrolled ? (
                      <>
                        <PlayCircle className="w-5 h-5" /> Tiếp tục học
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-5 h-5" /> Đăng ký ngay
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // }
  //         {filteredCourses.length === 0 && (
  //           <div className="text-center py-12 text-gray-500">
  //             Không tìm thấy khóa học nào khớp với bộ lọc.
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  // Helper component cho Stats
  function StatCard({ icon, label, value, color }: any) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-3">
        <div
          className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    );
  }
}
