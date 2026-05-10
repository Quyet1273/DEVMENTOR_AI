import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext"; // <-- 1. IMPORT THEME
import { courseService, Course } from "../services/courseService";
import {
  Plus,
  Edit2,
  Trash2,
  Layers3,
  Save,
  X,
  Activity,
  Search,
  Filter,
} from "lucide-react";
import { CourseBuilder } from "./pages/CourseBuilder";

export function AdminCourses() {
  // 2. LẤY MÀU TỪ HỆ THỐNG
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const dangerColor = "#ef4444"; // Giữ màu đỏ báo lỗi/xóa

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  const [selectedCourseForContent, setSelectedCourseForContent] = useState<Course | null>(null);

  const initialFormState: Partial<Course> = {
    title: "",
    description: "",
    category: "Lập trình",
    difficulty: 1 as any,
    is_active: true,
    is_published: false,
    thumbnail: "",
    level: "Cơ bản",
    duration: "10 giờ",
    students_enrolled: 0,
    rating: 5,
    total_lessons: 0,
  };

  const [formData, setFormData] = useState<Partial<Course>>(initialFormState);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = courses.map((c) => c.category || "Khác");
    return ["all", ...Array.from(new Set(cats))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || course.category === filterCategory;
      const matchesDifficulty = filterDifficulty === "all" || Number(course.difficulty) === Number(filterDifficulty);
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [courses, searchTerm, filterCategory, filterDifficulty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse?.id) {
        await courseService.updateCourse(editingCourse.id, formData);
      } else {
        await courseService.createCourse(formData);
      }
      handleCloseModal();
      loadCourses();
    } catch (err) {
      alert("Lỗi khi lưu dữ liệu! Kiểm tra lại kết nối.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setFormData(initialFormState);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này không? Hành động này không thể hoàn tác.")) {
      try {
        await courseService.deleteCourse(id);
        loadCourses();
      } catch (err) {
        alert("Lỗi: Không thể xóa khóa học này.");
      }
    }
  };

  if (selectedCourseForContent) {
    return (
      <CourseBuilder
        courseId={selectedCourseForContent.id}
        courseTitle={selectedCourseForContent.title}
        onBack={() => setSelectedCourseForContent(null)}
      />
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: colors.bg,
        minHeight: "100vh",
        fontFamily: "sans-serif",
        color: colors.text,
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* TIÊU ĐỀ CHÍNH */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
            borderLeft: `5px solid ${colors.primary}`,
            paddingLeft: "20px",
          }}
        >
          <div>
            <h1 style={{ color: colors.text, fontSize: "32px", fontWeight: 900, margin: 0 }}>
              Quản lý <span style={{ color: colors.primary }}>Khóa học</span>
            </h1>
            <p style={{ color: colors.muted, fontSize: "14px", marginTop: "5px" }}>
              Trạng thái hệ thống: {loading ? "Đang truy xuất dữ liệu..." : "Hoạt động bình thường"}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: colors.primary,
              color: isDark ? "#020617" : "#fff",
              border: "none",
              padding: "14px 28px",
              borderRadius: "12px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
          >
            <Plus size={20} /> TẠO KHÓA HỌC MỚI
          </button>
        </div>

        {/* --- THANH TÌM KIẾM & BỘ LỌC (TOOLBAR) --- */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "30px",
            backgroundColor: colors.card,
            padding: "20px",
            borderRadius: "16px",
            border: `1px solid ${colors.border}`,
            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.05)",
            transition: "all 0.3s ease",
          }}
        >
          {/* Ô Tìm kiếm tên */}
          <div style={{ flex: 2, position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                color: colors.muted,
              }}
              size={20}
            />
            <input
              placeholder="Tìm kiếm tên khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                padding: "14px 14px 14px 45px",
                borderRadius: "12px",
                color: colors.text,
                outline: "none",
                fontSize: "14px",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.inputBorder}
            />
          </div>

          {/* Bộ lọc Tool (Category) */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
            <Filter size={18} color={colors.primary} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                padding: "14px",
                borderRadius: "12px",
                color: colors.text,
                outline: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <option value="all">Tất cả Tool</option>
              {categories
                .filter((c) => c !== "all")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Bộ lọc Mức độ */}
          <div style={{ flex: 1 }}>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                padding: "14px",
                borderRadius: "12px",
                color: colors.text,
                outline: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <option value="all">Mọi mức độ</option>
              <option value={1}>Cơ bản</option>
              <option value={2}>Trung bình</option>
              <option value={3}>Nâng cao</option>
            </select>
          </div>
        </div>

        {/* BẢNG HỆ THỐNG */}
        <div
          style={{
            backgroundColor: colors.card,
            borderRadius: "24px",
            border: `1px solid ${colors.border}`,
            overflow: "hidden",
            boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.5)" : "0 10px 30px rgba(0,0,0,0.05)",
            transition: "all 0.3s ease",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: isDark ? "rgba(34, 211, 238, 0.05)" : colors.inputBg, color: colors.primary }}>
                <th style={{ padding: "20px", fontSize: "13px", fontWeight: "800" }}>THÔNG TIN KHÓA HỌC</th>
                <th style={{ fontSize: "13px", fontWeight: "800" }}>DANH MỤC</th>
                <th style={{ fontSize: "13px", fontWeight: "800" }}>ĐỘ KHÓ</th>
                <th style={{ textAlign: "right", paddingRight: "40px", fontSize: "13px", fontWeight: "800" }}>QUẢN TRỊ</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr
                  key={course.id}
                  style={{ borderBottom: `1px solid ${colors.divider}`, transition: "0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={{ padding: "20px" }}>
                    <div style={{ fontWeight: "bold", color: colors.text, fontSize: "16px" }}>
                      {course.title}
                    </div>
                    <div style={{ fontSize: "12px", color: colors.muted, marginTop: "4px" }}>
                      Mã khóa học: #{course.id}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: colors.secondary, fontSize: "13px", fontWeight: "600" }}>
                      {course.category}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        color: Number(course.difficulty) === 1 ? "#10b981" : Number(course.difficulty) === 2 ? "#facc15" : dangerColor,
                        fontSize: "11px",
                        fontWeight: "bold",
                        border: "1px solid currentColor",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        textTransform: "uppercase",
                        backgroundColor: Number(course.difficulty) === 1 ? "rgba(16, 185, 129, 0.1)" : Number(course.difficulty) === 2 ? "rgba(250, 204, 21, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      }}
                    >
                      {Number(course.difficulty) === 1 ? "Cơ bản" : Number(course.difficulty) === 2 ? "Trung bình" : "Nâng cao"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", paddingRight: "40px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px" }}>
                      <button
                        title="Quản lý nội dung chương và bài học"
                        onClick={() => setSelectedCourseForContent(course)}
                        style={{ background: "none", border: "none", color: colors.primary, cursor: "pointer", transition: "0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        <Layers3 size={22} />
                      </button>

                      <button
                        title="Sửa thông tin cơ bản"
                        onClick={() => {
                          setEditingCourse(course);
                          setFormData(course);
                          setShowModal(true);
                        }}
                        style={{ background: "none", border: "none", color: colors.text, cursor: "pointer", transition: "0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                        onMouseLeave={(e) => e.currentTarget.style.color = colors.text}
                      >
                        <Edit2 size={20} />
                      </button>

                      <button
                        title="Xóa khóa học"
                        onClick={() => handleDelete(course.id)}
                        style={{ background: "none", border: "none", color: dangerColor, cursor: "pointer", transition: "0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCourses.length === 0 && !loading && (
            <div style={{ padding: "80px", textAlign: "center", color: colors.muted }}>
              <Activity size={60} style={{ marginBottom: "20px", opacity: 0.2 }} />
              <p style={{ fontSize: "16px" }}>Không tìm thấy kết quả nào phù hợp.</p>
            </div>
          )}
        </div>

        {/* MODAL CẬP NHẬT DỮ LIỆU */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: isDark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)", // Backdrop thay đổi theo theme
              backdropFilter: "blur(15px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.primary}55`,
                borderRadius: "28px",
                padding: "40px",
                width: "100%",
                maxWidth: "550px",
                boxShadow: `0 0 50px ${colors.primary}25`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "35px" }}>
                <h2 style={{ color: colors.text, margin: 0, fontSize: "24px", fontWeight: "900" }}>
                  {editingCourse ? "CẬP NHẬT THÔNG TIN" : "THIẾT LẬP KHÓA HỌC MỚI"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  style={{ background: "none", border: "none", color: colors.muted, cursor: "pointer", transition: "0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = dangerColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}
                >
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ fontSize: "12px", color: colors.primary, fontWeight: "bold", letterSpacing: "1px" }}>
                    TÊN KHÓA HỌC
                  </label>
                  <input
                    value={formData.title}
                    required
                    placeholder="Ví dụ: ReactJS thực chiến cho người mới..."
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.inputBorder}`,
                      padding: "16px",
                      borderRadius: "12px",
                      color: colors.text,
                      outline: "none",
                      fontSize: "15px",
                      transition: "0.3s"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = colors.inputBorder}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ fontSize: "12px", color: colors.primary, fontWeight: "bold", letterSpacing: "1px" }}>
                    MÔ TẢ CHI TIẾT
                  </label>
                  <textarea
                    value={formData.description}
                    required
                    placeholder="Nhập nội dung tóm tắt của khóa học tại đây..."
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.inputBorder}`,
                      padding: "16px",
                      borderRadius: "12px",
                      color: colors.text,
                      minHeight: "100px",
                      outline: "none",
                      resize: "none",
                      fontSize: "15px",
                      transition: "0.3s"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = colors.inputBorder}
                  />
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "12px", color: colors.primary, fontWeight: "bold" }}>
                      MỨC ĐỘ
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) as any })}
                      style={{
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                        padding: "14px",
                        borderRadius: "12px",
                        color: colors.text,
                        fontSize: "14px",
                        outline: "none",
                        cursor: "pointer",
                        transition: "0.3s"
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                      onBlur={(e) => e.currentTarget.style.borderColor = colors.inputBorder}
                    >
                      <option value={1}>Cơ bản</option>
                      <option value={2}>Trung bình</option>
                      <option value={3}>Nâng cao</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "12px", color: colors.primary, fontWeight: "bold" }}>
                      DANH MỤC
                    </label>
                    <input
                      value={formData.category}
                      placeholder="VD: Frontend"
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                        padding: "14px",
                        borderRadius: "12px",
                        color: colors.text,
                        fontSize: "14px",
                        outline: "none",
                        transition: "0.3s"
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                      onBlur={(e) => e.currentTarget.style.borderColor = colors.inputBorder}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: "15px",
                    padding: "20px",
                    backgroundColor: colors.primary,
                    borderRadius: "15px",
                    border: "none",
                    fontWeight: "900",
                    cursor: "pointer",
                    color: isDark ? "#020617" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    boxShadow: `0 10px 20px ${colors.primary}33`,
                    fontSize: "16px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
                >
                  <Save size={22} /> LƯU THAY ĐỔI HỆ THỐNG
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}