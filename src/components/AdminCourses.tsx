import { useState, useEffect, useMemo } from "react";
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  // Trạng thái chuyển sang trình quản lý nội dung (Chương/Bài học)
  const [selectedCourseForContent, setSelectedCourseForContent] =
    useState<Course | null>(null);

  const colors = {
    bg: "#020617",
    card: "#0f172a",
    primary: "#22d3ee",
    secondary: "#a855f7",
    danger: "#ef4444",
    border: "rgba(168, 85, 247, 0.2)",
  };

  // Khởi tạo form chuẩn tiếng Việt
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

  // Logic tự động lấy danh sách Category (Tool) từ dữ liệu courses
  const categories = useMemo(() => {
    const cats = courses.map((c) => c.category || "Khác");
    return ["all", ...Array.from(new Set(cats))];
  }, [courses]);

  // Logic lọc danh sách khóa học
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || course.category === filterCategory;
      const matchesDifficulty =
        filterDifficulty === "all" ||
        Number(course.difficulty) === Number(filterDifficulty);
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
    if (
      window.confirm(
        "CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này không? Hành động này không thể hoàn tác.",
      )
    ) {
      try {
        await courseService.deleteCourse(id);
        loadCourses();
      } catch (err) {
        alert("Lỗi: Không thể xóa khóa học này.");
      }
    }
  };

  // Hiển thị trình quản lý Chương và Bài học
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
        color: "#fff",
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
            <h1
              style={{
                color: "#fff",
                fontSize: "32px",
                fontWeight: 900,
                margin: 0,
              }}
            >
              Quản lý <span style={{ color: colors.primary }}>Khóa học</span>
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "5px" }}>
              Trạng thái hệ thống:{" "}
              {loading ? "Đang truy xuất dữ liệu..." : "Hoạt động bình thường"}
            </p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
            }}
            style={{
              backgroundColor: colors.primary,
              color: "#020617",
              border: "none",
              padding: "14px 28px",
              borderRadius: "12px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
            }}
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
            backgroundColor: "#0f172a",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
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
                color: "#64748b",
              }}
              size={20}
            />
            <input
              placeholder="Tìm kiếm tên khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
                padding: "14px 14px 14px 45px",
                borderRadius: "12px",
                color: "#fff",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Bộ lọc Tool (Category) */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Filter size={18} color={colors.primary} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
                padding: "14px",
                borderRadius: "12px",
                color: "#fff",
                outline: "none",
                cursor: "pointer",
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
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
                padding: "14px",
                borderRadius: "12px",
                color: "#fff",
                outline: "none",
                cursor: "pointer",
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
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "rgba(34, 211, 238, 0.05)",
                  color: colors.primary,
                }}
              >
                <th
                  style={{
                    padding: "20px",
                    fontSize: "13px",
                    fontWeight: "800",
                  }}
                >
                  THÔNG TIN KHÓA HỌC
                </th>
                <th style={{ fontSize: "13px", fontWeight: "800" }}>DANH MỤC</th>
                <th style={{ fontSize: "13px", fontWeight: "800" }}>ĐỘ KHÓ</th>
                <th
                  style={{
                    textAlign: "right",
                    paddingRight: "40px",
                    fontSize: "13px",
                    fontWeight: "800",
                  }}
                >
                  QUẢN TRỊ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr
                  key={course.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "0.2s",
                  }}
                >
                  <td style={{ padding: "20px" }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#fff",
                        fontSize: "16px",
                      }}
                    >
                      {course.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#475569",
                        marginTop: "4px",
                      }}
                    >
                      Mã khóa học: #{course.id}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        color: colors.secondary,
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {course.category}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        color:
                          Number(course.difficulty) === 1
                            ? "#10b981"
                            : Number(course.difficulty) === 2
                            ? "#facc15"
                            : "#ef4444",
                        fontSize: "11px",
                        fontWeight: "bold",
                        border: "1px solid currentColor",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        textTransform: "uppercase",
                      }}
                    >
                      {Number(course.difficulty) === 1
                        ? "Cơ bản"
                        : Number(course.difficulty) === 2
                        ? "Trung bình"
                        : "Nâng cao"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", paddingRight: "40px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "20px",
                      }}
                    >
                      <button
                        title="Quản lý nội dung chương và bài học"
                        onClick={() => setSelectedCourseForContent(course)}
                        style={{
                          background: "none",
                          border: "none",
                          color: colors.primary,
                          cursor: "pointer",
                        }}
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
                        style={{
                          background: "none",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        <Edit2 size={20} />
                      </button>

                      <button
                        title="Xóa khóa học"
                        onClick={() => handleDelete(course.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: colors.danger,
                          cursor: "pointer",
                        }}
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
            <div
              style={{ padding: "80px", textAlign: "center", color: "#475569" }}
            >
              <Activity
                size={60}
                style={{ marginBottom: "20px", opacity: 0.2 }}
              />
              <p style={{ fontSize: "16px" }}>
                Không tìm thấy kết quả nào phù hợp.
              </p>
            </div>
          )}
        </div>

        {/* MODAL CẬP NHẬT DỮ LIỆU */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(15px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.primary}`,
                borderRadius: "28px",
                padding: "40px",
                width: "100%",
                maxWidth: "550px",
                boxShadow: `0 0 50px ${colors.primary}25`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "35px",
                }}
              >
                <h2
                  style={{
                    color: "#fff",
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: "900",
                  }}
                >
                  {editingCourse ? "CẬP NHẬT THÔNG TIN" : "THIẾT LẬP KHÓA HỌC MỚI"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <X size={28} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "25px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      color: colors.primary,
                      fontWeight: "bold",
                      letterSpacing: "1px",
                    }}
                  >
                    TÊN KHÓA HỌC
                  </label>
                  <input
                    value={formData.title}
                    required
                    placeholder="Ví dụ: ReactJS thực chiến cho người mới..."
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "16px",
                      borderRadius: "12px",
                      color: "#fff",
                      outline: "none",
                      fontSize: "15px",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      color: colors.primary,
                      fontWeight: "bold",
                      letterSpacing: "1px",
                    }}
                  >
                    MÔ TẢ CHI TIẾT
                  </label>
                  <textarea
                    value={formData.description}
                    required
                    placeholder="Nhập nội dung tóm tắt của khóa học tại đây..."
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "16px",
                      borderRadius: "12px",
                      color: "#fff",
                      minHeight: "100px",
                      outline: "none",
                      resize: "none",
                      fontSize: "15px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "12px",
                        color: colors.primary,
                        fontWeight: "bold",
                      }}
                    >
                      MỨC ĐỘ
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficulty: Number(e.target.value) as any,
                        })
                      }
                      style={{
                        backgroundColor: "#020617",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "14px",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "14px",
                      }}
                    >
                      <option value={1}>Cơ bản</option>
                      <option value={2}>Trung bình</option>
                      <option value={3}>Nâng cao</option>
                    </select>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "12px",
                        color: colors.primary,
                        fontWeight: "bold",
                      }}
                    >
                      DANH MỤC
                    </label>
                    <input
                      value={formData.category}
                      placeholder="VD: Frontend"
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      style={{
                        backgroundColor: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "14px",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "14px",
                      }}
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
                    color: "#020617",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    boxShadow: `0 10px 20px ${colors.primary}33`,
                    fontSize: "16px",
                  }}
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