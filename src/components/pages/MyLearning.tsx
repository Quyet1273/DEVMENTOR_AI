import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Loader2,
  Play,
  Star,
  Users,
  PlayCircle,
  BookOpen,
  Code,
  Video,
  ExternalLink,
} from "lucide-react";

export function MyLearning() {
  const { user } = useAuth();
  const { colors, theme } = useTheme(); // Lấy theme thay vì isDark
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolled = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // DÙNG LẠI LOGIC CHUẨN CỦA BẢN 1
        const { data, error } = await supabase
          .from("course_enrollments")
          .select("*, courses(*)")
          .eq("user_id", user.id);

        if (error) throw error;

        // Map dữ liệu đơn giản như bản 1 để đảm bảo hiện khóa học
        if (data) {
          const formatted = data
            .filter((item: any) => item.courses) // Chỉ lấy nếu có dữ liệu course đi kèm
            .map((item: any) => ({
              ...item.courses,
              progress: item.progress || 0, // Lấy tiến độ từ bảng enrollment
            }));
          setEnrolledCourses(formatted);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolled();
  }, [user]);

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <Loader2
          className="animate-spin"
          style={{ color: colors.primary }}
          size={40}
        />
      </div>
    );
  }

 return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: colors.bg }}>
      <header className="mb-16">
        <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: colors.primary }}>
          Khóa học của tôi
        </h2>
        <p style={{ color: colors.muted }}>Tiếp tục hành trình chinh phục kiến thức của bạn.</p>
      </header>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl" style={{ borderColor: colors.border }}>
          <p style={{ color: colors.muted }}>Bạn chưa đăng ký khóa học nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: colors.card,
                border: `2px solid ${isDark ? colors.primary + "40" : colors.border}`,
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                boxShadow: isDark ? "0 0 15px rgba(34, 211, 238, 0.1)" : "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.01)";
                e.currentTarget.style.boxShadow = isDark ? `0 0 30px ${colors.primary}50` : "0 15px 30px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.borderColor = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = isDark ? "0 0 15px rgba(34, 211, 238, 0.1)" : "0 4px 12px rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.borderColor = isDark ? colors.primary + "40" : colors.border;
              }}
            >
              {/* 1. ẢNH THUMBNAIL */}
              <div className="relative h-48" style={{ backgroundColor: colors.inputBg }}>
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <span
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase"
                  style={{
                    backgroundColor: colors.secondary,
                    color: "#ffffff",
                    boxShadow: `0 0 10px ${colors.secondary}80`,
                  }}
                >
                  {course.level}
                </span>
              </div>

              {/* 2. NỘI DUNG THÔNG TIN */}
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
                  className="text-lg mb-2 line-clamp-1 font-bold font-mono uppercase"
                  style={{ color: colors.text }}
                >
                  {course.title}
                </h3>

                <p className="text-sm mb-4 line-clamp-2" style={{ color: colors.muted }}>
                  {course.description}
                </p>

                {/* ICONS & THÔNG SỐ */}
                <div className="flex items-center gap-4 text-xs mb-4 font-mono" style={{ color: colors.primary }}>
                  <span className="flex items-center gap-1"><Star size={14} fill={colors.primary} /> {course.rating || 0}</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {course.students_enrolled || 0}</span>
                  <span className="flex items-center gap-1"><PlayCircle size={14} /> {course.total_lessons || 0} BÀI</span>
                </div>

                {/* THANH TIẾN ĐỘ (PROGRESS) */}
                <div className="mb-6">
                  <div className="flex justify-between text-[10px] mb-1 font-bold uppercase" style={{ color: colors.muted }}>
                    <span>Tiến độ học</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-500/20">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${course.progress}%`, 
                        backgroundColor: '#10b981',
                        boxShadow: '0 0 10px #10b98150'
                      }} 
                    />
                  </div>
                </div>

                {/* 3. NÚT TIẾP TỤC HỌC */}
                <button
                  onClick={() => navigate(`/learning/${course.id}`)}
                  className="w-full mt-auto py-3 rounded-lg font-bold flex items-center justify-center gap-2 uppercase font-mono transition-all"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                  }}
                >
                  <PlayCircle className="w-5 h-5" /> TIẾP TỤC HỌC
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
