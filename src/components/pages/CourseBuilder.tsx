import { useState, useEffect } from "react";
import { curriculumService, Module, Lesson } from "../../services/courseService";
import { ChevronLeft, Plus, FolderTree, FileText, X, Save, Target, Edit3, Trash2, Eye } from "lucide-react";

interface CourseBuilderProps {
  courseId: number;
  courseTitle: string;
  onBack: () => void;
}

export function CourseBuilder({ courseId, courseTitle, onBack }: CourseBuilderProps) {
  const [view, setView] = useState<'modules' | 'lessons' | 'content_editor'>('modules');
  const [loading, setLoading] = useState(false);
  
  // Dữ liệu tầng
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Modals
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);

  // Forms
  const [moduleForm, setModuleForm] = useState<any>({ title: "", description: "", order_num: 1, is_active: true });
  const [lessonForm, setLessonForm] = useState<any>({ title: "", content: "", xp_reward: 30, order_num: 1, is_active: true });

  const colors = {
    bg: "#020617",
    card: "#0f172a",
    primary: "#22d3ee",
    secondary: "#a855f7",
    danger: "#ef4444",
    border: "rgba(168, 85, 247, 0.2)",
  };

  useEffect(() => { loadModules(); }, [courseId]);

  const loadModules = async () => {
    setLoading(true);
    const data = await curriculumService.getModulesByCourse(courseId);
    setModules(data);
    setModuleForm({ ...moduleForm, order_num: data.length + 1 });
    setLoading(false);
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await curriculumService.createModule({ ...moduleForm, course_id: courseId });
      setShowModuleModal(false);
      setModuleForm({ title: "", description: "", order_num: modules.length + 2, is_active: true });
      loadModules();
    } catch (err) { alert("Lỗi lưu chương!"); }
  };

  const openLessonManager = async (module: Module) => {
    setSelectedModule(module);
    setLoading(true);
    const data = await curriculumService.getLessonsByModule(module.id);
    setLessons(data);
    setLessonForm({ ...lessonForm, order_num: data.length + 1 });
    setView('lessons');
    setLoading(false);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await curriculumService.createLesson({ ...lessonForm, course_id: courseId, module_id: selectedModule!.id });
      setShowLessonModal(false);
      loadLessons(selectedModule!.id);
    } catch (err) { alert("Lỗi lưu bài học!"); }
  };

  const loadLessons = async (moduleId: number) => {
    const data = await curriculumService.getLessonsByModule(moduleId);
    setLessons(data);
  };

  // --- HÀM LƯU NỘI DUNG VÀ QUIZ ---
  const handleSaveFullContent = async () => {
    if (!selectedLesson) return;
    try {
      setLoading(true);
      await (curriculumService as any).updateLesson(selectedLesson.id, {
        content: selectedLesson.content,
        quiz: selectedLesson.quiz,
        video_url: selectedLesson.video_url
      });
      alert("Đã cập nhật nội dung bài học và bộ câu hỏi!");
      setView('lessons');
    } catch (err) { alert("Lỗi cập nhật!"); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "40px", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif", color: "#fff" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
          <button onClick={onBack} style={{ background: "rgba(34, 211, 238, 0.1)", border: "none", color: colors.primary, padding: "10px", borderRadius: "12px", cursor: "pointer" }}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: "28px", margin: 0, fontWeight: 900 }}>{courseTitle}</h1>
            <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Cấu trúc nội dung khóa học & Trắc nghiệm</p>
          </div>
        </div>

        {/* BREADCRUMB */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px", fontSize: "14px", color: colors.primary }}>
          <span style={{ cursor: "pointer" }} onClick={() => setView('modules')}>Khóa học</span>
          {selectedModule && <span> / {selectedModule.title}</span>}
          {selectedLesson && view === 'content_editor' && <span> / {selectedLesson.title}</span>}
        </div>

        {/* --- TẦNG 1: DANH SÁCH CHƯƠNG --- */}
        {view === 'modules' && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "20px" }}>Danh sách Chương học ({modules.length})</h2>
              <button onClick={() => setShowModuleModal(true)} style={{ backgroundColor: colors.secondary, color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={20} /> THÊM CHƯƠNG MỚI
              </button>
            </div>
            {modules.map(mod => (
              <div key={mod.id} style={{ backgroundColor: colors.card, padding: "25px", borderRadius: "20px", border: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "20px" }}>
                  <FolderTree color={colors.secondary} size={30} />
                  <div>
                    <h3 style={{ margin: 0 }}>Chương {mod.order_num}: {mod.title}</h3>
                    <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>{mod.description || "Chưa có mô tả chi tiết cho chương này."}</p>
                  </div>
                </div>
                <button onClick={() => openLessonManager(mod)} style={{ background: colors.primary, color: colors.bg, border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>Quản lý bài học</button>
              </div>
            ))}
          </div>
        )}

        {/* --- TẦNG 2: DANH SÁCH BÀI HỌC --- */}
        {view === 'lessons' && selectedModule && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "20px" }}>Bài học trong: {selectedModule.title}</h2>
              <button onClick={() => setShowLessonModal(true)} style={{ backgroundColor: colors.primary, color: colors.bg, border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={20} /> THÊM BÀI HỌC MỚI
              </button>
            </div>
            {lessons.map(l => (
              <div key={l.id} style={{ backgroundColor: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <FileText size={20} color={colors.primary} />
                  <span>Bài {l.order_num}: {l.title}</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>| {l.xp_reward} XP</span>
                </div>
                <button onClick={() => { setSelectedLesson(l); setView('content_editor'); }} style={{ color: "#facc15", background: "none", border: "1px solid #facc15", padding: "5px 15px", borderRadius: "8px", cursor: "pointer" }}>Soạn nội dung & Trắc nghiệm</button>
              </div>
            ))}
          </div>
        )}

        {/* --- TẦNG 3: TRÌNH BIÊN TẬP NỘI DUNG & QUIZ (TO RÕ RÀNG) --- */}
        {view === 'content_editor' && selectedLesson && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", backgroundColor: colors.card, padding: "30px", borderRadius: "24px", border: `1px solid ${colors.primary}` }}>
            <div style={{ gridColumn: "1 / span 2", display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>Biên tập: {selectedLesson.title}</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                 <button onClick={() => setView('lessons')} style={{ padding: "10px 20px", borderRadius: "8px", background: "none", color: "#64748b", border: "1px solid #64748b" }}>Hủy bỏ</button>
                 <button onClick={handleSaveFullContent} style={{ padding: "10px 30px", borderRadius: "8px", background: colors.primary, color: colors.bg, fontWeight: "bold", border: "none" }}>LƯU THAY ĐỔI</button>
              </div>
            </div>

            {/* Bên trái: Nội dung bài học */}
            <div>
              <label style={{ display: "block", marginBottom: "10px", color: colors.primary, fontWeight: "bold" }}>Nội dung bài học (Markdown / HTML)</label>
              <textarea 
                value={selectedLesson.content}
                onChange={e => setSelectedLesson({ ...selectedLesson, content: e.target.value })}
                placeholder="Nhập kiến thức bài học tại đây..."
                style={{ width: "100%", height: "400px", backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", padding: "15px", fontFamily: "monospace", outline: "none" }}
              />
            </div>

            {/* Bên phải: Quiz Editor */}
            <div>
              <label style={{ display: "block", marginBottom: "10px", color: "#facc15", fontWeight: "bold" }}>Bộ câu hỏi Trắc nghiệm (JSON Format)</label>
              <textarea 
                value={typeof selectedLesson.quiz === 'string' ? selectedLesson.quiz : JSON.stringify(selectedLesson.quiz, null, 2)}
                onChange={e => {
                  try {
                    const val = JSON.parse(e.target.value);
                    setSelectedLesson({ ...selectedLesson, quiz: val });
                  } catch {
                    setSelectedLesson({ ...selectedLesson, quiz: e.target.value });
                  }
                }}
                style={{ width: "100%", height: "400px", backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#facc15", padding: "15px", fontFamily: "monospace", outline: "none" }}
              />
            </div>
          </div>
        )}

        {/* MODAL THÊM CHƯƠNG (TO RA) */}
        {showModuleModal && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: colors.card, padding: "40px", borderRadius: "24px", width: "500px", border: `1px solid ${colors.secondary}` }}>
              <h2 style={{ marginTop: 0 }}>Thêm Chương học mới</h2>
              <form onSubmit={handleModuleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <input placeholder="Tiêu đề chương" required value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} style={{ padding: "15px", borderRadius: "10px", backgroundColor: "#020617", border: "1px solid #1e293b", color: "#fff" }} />
                <textarea placeholder="Mô tả" value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} style={{ padding: "15px", borderRadius: "10px", backgroundColor: "#020617", border: "1px solid #1e293b", color: "#fff", height: "100px" }} />
                <input type="number" placeholder="Số thứ tự" value={moduleForm.order_num} onChange={e => setModuleForm({ ...moduleForm, order_num: e.target.value })} style={{ padding: "15px", borderRadius: "10px", backgroundColor: "#020617", border: "1px solid #1e293b", color: "#fff" }} />
                <button type="submit" style={{ padding: "15px", backgroundColor: colors.secondary, borderRadius: "10px", border: "none", color: "#fff", fontWeight: "bold" }}>XÁC NHẬN TẠO CHƯƠNG</button>
                <button type="button" onClick={() => setShowModuleModal(false)} style={{ color: "#64748b", background: "none", border: "none" }}>Hủy</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL THÊM BÀI HỌC (TO RA) */}
        {showLessonModal && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: colors.card, padding: "40px", borderRadius: "24px", width: "500px", border: `1px solid ${colors.primary}` }}>
              <h2 style={{ marginTop: 0 }}>Thêm Bài học mới</h2>
              <form onSubmit={handleLessonSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <input placeholder="Tiêu đề bài học" required value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} style={{ padding: "15px", borderRadius: "10px", backgroundColor: "#020617", border: "1px solid #1e293b", color: "#fff" }} />
                <input type="number" placeholder="XP thưởng" value={lessonForm.xp_reward} onChange={e => setLessonForm({ ...lessonForm, xp_reward: e.target.value })} style={{ padding: "15px", borderRadius: "10px", backgroundColor: "#020617", border: "1px solid #1e293b", color: "#fff" }} />
                <input type="number" placeholder="Số thứ tự" value={lessonForm.order_num} onChange={e => setLessonForm({ ...lessonForm, order_num: e.target.value })} style={{ padding: "15px", borderRadius: "10px", backgroundColor: "#020617", border: "1px solid #1e293b", color: "#fff" }} />
                <button type="submit" style={{ padding: "15px", backgroundColor: colors.primary, borderRadius: "10px", border: "none", color: colors.bg, fontWeight: "bold" }}>XÁC NHẬN TẠO BÀI HỌC</button>
                <button type="button" onClick={() => setShowLessonModal(false)} style={{ color: "#64748b", background: "none", border: "none" }}>Hủy</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}