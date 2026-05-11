import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { enrollmentService } from "../services/enrollmentService";
import { supabase } from "../lib/supabase";
// import { useCourseController } from "../controllers/useCourserController";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
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
  // đổi màu theo theme
  const { theme, colors } = useTheme(); // Lấy theme ('light'/'dark') và bảng màu colors
  const isDark = theme === "dark";

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

    // Nếu đã đăng ký, chuyển hướng vào trang học ngay
    if (isEnrolled) {
      navigate(`/learning/${course.id}`);
      return;
    }

    try {
      if (!user) {
        alert("Bạn cần đăng nhập để đăng ký khóa học!");
        return;
      }

      setIsEnrolling(course.id);

      // Thực hiện đăng ký dựa trên schema bảng course_enrollments
      const { error } = await supabase.from("course_enrollments").insert([
        {
          user_id: user.id, // Kiểu uuid
          course_id: course.id, // Kiểu int8 (số)
          // Các cột khác như enrolled_at, progress, is_completed
          // đều đã có giá trị mặc định (now(), 0, false) nên không cần truyền vào.
        },
      ]);

      if (error) throw error;

      // Cập nhật state để giao diện thay đổi ngay lập tức
      setEnrolledCourseIds((prev) => [...prev, course.id]);

      alert("Đăng ký khóa học thành công!");
      navigate(`/learning/${course.id}`);
    } catch (error: any) {
      // Xử lý lỗi trùng lặp đăng ký
      if (error.code === "23505") {
        setEnrolledCourseIds((prev) => [...prev, course.id]);
        navigate(`/learning/${course.id}`);
      } else {
        console.error("Lỗi đăng ký:", error);
        alert("Không thể đăng ký, vui lòng thử lại sau.");
      }
    } finally {
      setIsEnrolling(null);
    }
  };

  // 3. HIỆU ỨNG ANIMATION BANNER (DỌN DẸP TRÙNG LẶP)
  // useEffect(() => {
  //   const handleMouseMove = (e: MouseEvent) => {
  //     if (!bannerRef.current) return;
  //     const rect = bannerRef.current.getBoundingClientRect();
  //     mousePos.current = {
  //       x: e.clientX - rect.left,
  //       y: e.clientY - rect.top,
  //     };
  //   };

  //   const animate = () => {
  //     if (blobRef.current) {
  //       const speed = 0.15;
  //       blobPos.current.x += (mousePos.current.x - blobPos.current.x) * speed;
  //       blobPos.current.y += (mousePos.current.y - blobPos.current.y) * speed;
  //       blobRef.current.style.transform = `translate(${blobPos.current.x - 150}px, ${blobPos.current.y - 150}px)`;
  //     }
  //     requestAnimationFrame(animate);
  //   };

  //   const banner = bannerRef.current;
  //   if (banner) {
  //     banner.addEventListener("mousemove", handleMouseMove);
  //     const animationId = requestAnimationFrame(animate);
  //     return () => {
  //       banner.removeEventListener("mousemove", handleMouseMove);
  //       cancelAnimationFrame(animationId);
  //     };
  //   }
  // }, []);

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
        <header className="mb-16">
          <h2
            className="text-3xl font-black uppercase tracking-tighter"
            style={{ color: colors.primary }}
          >
            Khám phá khóa học
          </h2>
        </header>

        {/* <div className="max-w-7xl mx-auto w-full px-6 md:px-8">
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
                  // ĐỔI: Dùng màu card từ ThemeContext
                  backgroundColor: colors.card,
                  borderRadius: "24px",
                  padding: "28px",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  // ĐỔI: Border tự thích ứng theo theme
                  border:
                    isCardHovered === index
                      ? `1.5px solid ${item.color}`
                      : `1px solid ${colors.border}`,
                  // ĐỔI: Shadow thông minh (Dark mode sâu, Light mode nhẹ)
                  boxShadow:
                    isCardHovered === index
                      ? `0 0 30px ${item.color}40, inset 0 0 15px ${item.color}20`
                      : isDark
                        ? "0 10px 30px rgba(0, 0, 0, 0.5)"
                        : "0 10px 25px rgba(0, 0, 0, 0.05)",
                  transform:
                    isCardHovered === index
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
                      // ĐỔI: Chỉ đổ bóng icon khi ở Dark Mode để tránh bị lem màu ở nền sáng
                      filter: isDark
                        ? `drop-shadow(0 0 8px ${item.color})`
                        : "none",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "42px",
                      fontWeight: "900",
                      // ĐỔI: Chữ tự động chuyển Đen/Trắng theo theme
                      color: colors.text,
                      lineHeight: "1",
                      fontFamily: "system-ui",
                      textShadow: isDark
                        ? "0 0 15px rgba(255,255,255,0.2)"
                        : "none",
                    }}
                  >
                    {item.val}
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      // ĐỔI: Dùng màu muted (xám) của hệ thống
                      color: colors.muted,
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
                      filter: isDark
                        ? `drop-shadow(0 0 5px ${item.color}80)`
                        : "none",
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
        </div> */}

        <div
          className="grid md:grid-cols-3 gap-6 p-6 mb-8 rounded-xl"
          style={{
            // ĐỔI: Dùng màu card hệ thống
            backgroundColor: colors.card,
            // ĐỔI: Dùng màu primary của theme cho border
            border: `2px solid ${colors.primary}`,
            // ĐỔI: Shadow thông minh
            boxShadow: isDark
              ? `0 0 20px ${colors.primary}40`
              : "0 10px 25px rgba(0, 0, 0, 0.05)",
            transition: "all 0.3s ease",
          }}
        >
          {/* DANH MỤC */}
          <div className="flex flex-col">
            <label
              className="block text-sm font-bold mb-2 font-mono"
              style={{
                // ĐỔI: Chữ tự động Đen/Trắng
                color: colors.text,
                textShadow: isDark ? `0 0 10px ${colors.text}50` : "none",
              }}
            >
              DANH MỤC
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg outline-none cursor-pointer transition-all"
              style={{
                // ĐỔI: Dùng màu nền input động
                backgroundColor: colors.inputBg,
                border: `1px solid ${isDark ? colors.secondary : colors.border}`,
                color: colors.text,
              }}
            >
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  // ĐỔI: Màu nền option trong dropdown
                  style={{ backgroundColor: colors.card, color: colors.text }}
                >
                  {cat === "all" ? "Tất cả danh mục" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* CẤP ĐỘ */}
          <div className="flex flex-col">
            <label
              className="block text-sm font-bold mb-2 font-mono"
              style={{
                color: colors.text,
                textShadow: isDark ? `0 0 10px ${colors.text}50` : "none",
              }}
            >
              CẤP ĐỘ
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg outline-none cursor-pointer transition-all"
              style={{
                backgroundColor: colors.inputBg,
                border: `1px solid ${isDark ? colors.secondary : colors.border}`,
                color: colors.text,
              }}
            >
              {levels.map((lvl) => (
                <option
                  key={lvl}
                  value={lvl}
                  style={{ backgroundColor: colors.card, color: colors.text }}
                >
                  {lvl === "all" ? "Tất cả cấp độ" : getLevelLabel(lvl)}
                </option>
              ))}
            </select>
          </div>

          {/* CHECKBOX */}
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
                style={{ accentColor: colors.secondary }}
              />
              <span
                className="text-sm font-bold font-mono uppercase"
                style={{
                  color: colors.text,
                  textShadow: isDark ? `0 0 8px ${colors.text}40` : "none",
                }}
              >
                Chỉ hiện khóa đã đăng ký
              </span>
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            // Kiểm tra xem khóa này đã đăng ký chưa
            const isEnrolled = enrolledCourseIds.includes(course.id);

            return (
              <div
                key={course.id}
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  // ĐỔI: Dùng màu card hệ thống
                  backgroundColor: colors.card,
                  // ĐỔI: Ở Light Mode dùng border mờ, Dark Mode dùng border Primary
                  border: `2px solid ${isDark ? colors.primary + "40" : colors.border}`,
                  boxShadow: isDark
                    ? "0 0 15px rgba(34, 211, 238, 0.1)"
                    : "0 4px 12px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-8px) scale(1.01)";
                  e.currentTarget.style.boxShadow = isDark
                    ? `0 0 30px ${colors.primary}50`
                    : "0 15px 30px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 0 15px rgba(34, 211, 238, 0.1)"
                    : "0 4px 12px rgba(0, 0, 0, 0.05)";
                  e.currentTarget.style.borderColor = isDark
                    ? colors.primary + "40"
                    : colors.border;
                }}
              >
                {/* PHẦN ẢNH THUMBNAIL */}
                <div
                  className="relative h-48"
                  style={{ backgroundColor: colors.inputBg }}
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: isDark ? "0.7" : "0.9" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = isDark ? "0.7" : "0.9")
                    }
                  />
                  <span
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase"
                    style={{
                      backgroundColor: colors.secondary,
                      color: "#ffffff",
                      boxShadow: `0 0 10px ${colors.secondary}80`,
                      zIndex: 10,
                    }}
                  >
                    {getLevelLabel(course.level)}
                  </span>
                </div>

                {/* NỘI DUNG CARD */}
                <div className="p-6 flex flex-col grow">
                  <div className="mb-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded uppercase font-mono"
                      style={{
                        border: `1px solid ${colors.secondary}`,
                        color: colors.secondary,
                        backgroundColor: `${colors.secondary}15`,
                      }}
                    >
                      {course.category}
                    </span>
                  </div>

                  <h3
                    className="text-lg mb-2 line-clamp-1 font-bold font-mono uppercase transition-colors"
                    style={{
                      // ĐỔI: Chữ tự động Đen/Trắng
                      color: colors.text,
                      textShadow: isDark ? `0 0 10px ${colors.text}30` : "none",
                    }}
                  >
                    {course.title?.toUpperCase() || "UNNAMED COURSE"}
                  </h3>

                  <p
                    className="text-sm mb-4 line-clamp-2"
                    style={{ color: colors.muted }}
                  >
                    {course.description}
                  </p>

                  {/* ICONS & STATS */}
                  <div
                    className="flex items-center gap-4 text-xs mb-4 font-mono"
                    style={{ color: colors.primary }}
                  >
                    <span className="flex items-center gap-1">
                      <Star
                        className="w-4 h-4"
                        style={{ fill: colors.primary }}
                      />{" "}
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
                    style={{ color: colors.muted }}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{course.duration?.toUpperCase() || "N/A"}</span>
                  </div>

                  {/* NÚT ĐĂNG KÝ / HỌC TIẾP */}
                  <button
                    onClick={() =>
                      isEnrolled
                        ? navigate(`/learning/${course.id}`)
                        : handleEnrollClick(course)
                    }
                    disabled={isEnrolling !== null}
                    className="w-full mt-auto py-3 rounded-lg font-bold flex items-center justify-center gap-2 uppercase font-mono transition-all"
                    style={{
                      background:
                        isEnrolling === course.id
                          ? colors.inputBg
                          : isEnrolled
                            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                            : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                      color: "#ffffff",
                      boxShadow:
                        isEnrolling === course.id
                          ? "none"
                          : isEnrolled
                            ? "0 4px 15px rgba(16, 185, 129, 0.4)"
                            : `0 4px 15px ${colors.secondary}40`,
                      border:
                        isEnrolling === course.id
                          ? `1px solid ${colors.border}`
                          : "none",
                      cursor:
                        isEnrolling === course.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {isEnrolling === course.id ? (
                      <>
                        <div
                          className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                          style={{ borderColor: colors.primary }}
                        ></div>
                        <span style={{ color: colors.primary }}>
                          AI ĐANG THIẾT LẬP...
                        </span>
                      </>
                    ) : isEnrolled ? (
                      <>
                        <PlayCircle className="w-5 h-5" /> TIẾP TỤC HỌC
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-5 h-5" /> ĐĂNG KÝ NGAY
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
