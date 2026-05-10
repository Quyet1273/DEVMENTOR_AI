import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"; 
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { 
  Loader2, Play, Star, Users, PlayCircle, 
  BookOpen, Code, Video, ExternalLink 
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
              progress: item.progress_percent || 0 // Lấy tiến độ từ bảng enrollment
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
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <Loader2 className="animate-spin" style={{ color: colors.primary }} size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: colors.bg }}>
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase" style={{ color: colors.primary }}>
          KHÓA HỌC CỦA TÔI
        </h1>
        <p style={{ color: colors.muted }}>Tiếp tục hành trình DevMentor AI của ông nào!</p>
      </header>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-20 rounded-[20px] border border-dashed" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
          <p style={{ color: colors.muted }}>Ông chưa đăng ký khóa học nào. Qua trang Khóa học ngay đi!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
              className="group hover:-translate-y-1"
            >
              {/* HEADER: ICON & LEVEL */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${colors.primary}15`, border: `1px solid ${colors.primary}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} color={colors.primary} />
                </div>
                <span style={{ fontSize: '9px', fontWeight: 900, padding: '4px 10px', borderRadius: '4px', border: `1px solid ${colors.primary}`, color: colors.primary, textTransform: 'uppercase' }}>
                  {course.level || "Cơ bản"}
                </span>
              </div>

              {/* TITLE & DESCRIPTION */}
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.text, marginBottom: '12px', lineHeight: '1.4' }}>
                {course.title}
              </h3>
              <p style={{ fontSize: '13px', color: colors.muted, lineHeight: '1.6', marginBottom: '20px', flex: 1 }} className="line-clamp-2">
                {course.description}
              </p>

              {/* STATS & CATEGORY */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '10px', fontWeight: 'bold', color: colors.muted }}>
                <span style={{ backgroundColor: colors.inputBg, padding: '4px 8px', borderRadius: '4px', border: `1px solid ${colors.border}` }}>
                  #{course.category?.toUpperCase() || "PROGRAMMING"}
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span>⭐ 0</span>
                  <span>👥 0</span>
                </div>
              </div>

              {/* PROGRESS BAR (Thanh tiến độ thêm mới) */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900, color: colors.muted, marginBottom: '6px' }}>
                  <span className="uppercase">Tiến độ học</span>
                  <span style={{ color: colors.primary }}>{course.progress}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: colors.inputBg, borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${course.progress}%`, 
                      height: '100%', 
                      backgroundColor: colors.primary,
                      transition: 'width 1s ease-in-out'
                    }} 
                  />
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={() => navigate(`/learning/${course.id}`)}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary || colors.primary})`,
                  color: '#fff', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="hover:brightness-110 active:scale-95"
              >
                Tiếp tục học <Play size={14} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}