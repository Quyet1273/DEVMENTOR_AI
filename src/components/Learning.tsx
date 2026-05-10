import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../data/translations";
import { lessonService } from "../services/lessonService";
import { QuizComponent } from "./pages/QuizComponent";
import { generateLessonContent } from "../services/aiService";
import { Lesson, LessonSummary } from "../models/learning";
import Editor from "@monaco-editor/react";
import { marked } from "marked";
import {
  BookOpen,
  ChevronLeft,
  Award,
  Loader2,
  Zap,
  CheckCircle2,
  List,
  Code,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export function Learning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 2. LẤY MÀU TỪ HỆ THỐNG VÀ NGÔN NGỮ
  const { theme, colors } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";

  const tl =
    translations[language as keyof typeof translations]?.learning ||
    translations.vi.learning;

  // --- CÁC STATE CƠ BẢN ---
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [allLessons, setAllLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  // --- STATE PHỤC VỤ THỰC HÀNH & KIỂM TRA (FIX LỖI CANNOT FIND NAME) ---
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [checking, setChecking] = useState(false);

  // --- HÀM KIỂM TRA CODE BẰNG AI (FIX LỖI CANNOT FIND NAME) ---
  const handleCheckCode = async () => {
    if (!editorCode.trim()) {
      toast.error(
        language === "vi"
          ? "Bạn chưa nhập code kìa!"
          : "Please enter some code!",
      );
      return;
    }

    setChecking(true);
    try {
      // Giả lập logic Mentor AI kiểm tra code
      // Sau này bạn có thể gọi API của gemini/openai tại đây
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        language === "vi"
          ? "🤖 Mentor AI: Code chạy tốt đấy! Kết quả ở khung Preview đã chuẩn rồi."
          : "🤖 AI Mentor: Great job! The code works perfectly in the preview.",
      );
    } catch (e) {
      toast.error("Lỗi khi kiểm tra code");
    } finally {
      setChecking(false);
    }
  };

  // --- LOGIC KHỞI TẠO BÀI HỌC ---
  useEffect(() => {
    const init = async () => {
      if (!user || !courseId) return;
      try {
        setLoading(true);
        const cId = parseInt(courseId);
        console.log("🚀 Bắt đầu tải khóa học ID:", cId);

        const courseData = await lessonService.getCourseLessons(cId);
        if (!courseData?.lessons?.length) {
          setLesson(null);
          return;
        }

        // Xác định bài học cần hiển thị
        let targetLessonId = null;
        const continueRes = await lessonService
          .getContinueLesson(user.id, cId)
          .catch(() => null);
        targetLessonId = continueRes
          ? parseInt(continueRes as any)
          : courseData.lessons.sort((a, b) => a.order_num - b.order_num)[0].id;

        console.log("📖 Đang lấy nội dung bài học ID:", targetLessonId);
        let lessonData = await lessonService.getLessonContent(targetLessonId);

        // --- LOGIC KIỂM TRA VÀ GỌI AI ---
        const isContentEmpty =
          !lessonData?.content || lessonData.content.trim().length < 10;

        if (isContentEmpty && lessonData) {
          console.log("🤖 Nội dung trống! Đang nhờ AI soạn bài...");
          toast.info(
            language === "vi"
              ? "🤖 Mentor AI đang soạn bài giảng..."
              : "🤖 AI is drafting your lesson...",
          );

          const aiGenerated = await generateLessonContent(
            lessonData.title,
            courseData.title,
          );

          if (aiGenerated) {
            console.log("✅ AI đã soạn xong, đang lưu vào DB...");
            await lessonService.updateLessonContent(
              targetLessonId,
              aiGenerated.content_markdown,
              aiGenerated.code_snippet,
            );

            lessonData.content = aiGenerated.content_markdown;
            lessonData.code_example = aiGenerated.code_snippet;
            toast.success(
              language === "vi"
                ? "✨ Bài giảng đã sẵn sàng!"
                : "✨ Lesson is ready!",
            );
          }
        }

        // Cập nhật các thông tin bài học
        setLesson(lessonData);
        setCourseTitle(courseData.title);
        setAllLessons(courseData.lessons);

        // --- ĐỒNG BỘ CODE VÀO EDITOR VÀ RESET CHẾ ĐỘ HỌC ---
        setEditorCode(lessonData?.code_example || "");
        setIsPracticeMode(false);
      } catch (e) {
        console.error("❌ LỖI HỆ THỐNG:", e);
        toast.error(tl.saveError);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [courseId, user?.id, language]);

  // --- HÀM CHUYỂN BÀI HỌC KHI CLICK SIDEBAR ---
  const fetchAndGenerateLesson = async (
    lessonId: number,
    courseTitle: string,
  ) => {
    setLoading(true);
    try {
      let data = await lessonService.getLessonContent(lessonId);

      // Nếu bài học trống -> Gọi AI soạn bài
      if (!data?.content || data.content.trim().length < 10) {
        toast.info("🤖 Mentor AI đang soạn bài...");
        const aiResult = await generateLessonContent(data.title, courseTitle);

        if (aiResult) {
          await lessonService.updateLessonContent(
            lessonId,
            aiResult.content_markdown,
            aiResult.code_snippet,
          );
          data.content = aiResult.content_markdown;
          data.code_example = aiResult.code_snippet;
        }
      }

      setLesson(data);
      // Cập nhật code mẫu cho bài mới và quay về tab lý thuyết
      setEditorCode(data?.code_example || "");
      setIsPracticeMode(false);
    } catch (err) {
      toast.error("Không thể tải bài học");
    } finally {
      setLoading(false);
    }
  };

  const progressPercent =
    allLessons.length > 0
      ? Math.round(
          (allLessons.filter((l) => l.order_num <= (lesson?.order_num || 0))
            .length /
            allLessons.length) *
            100,
        )
      : 0;

  // --- HIỂN THỊ LOADING ---
  if (loading)
    return (
      <div
        className="h-screen flex items-center justify-center transition-colors"
        style={{ backgroundColor: colors.bg }}
      >
        <Loader2
          className="animate-spin"
          style={{ color: colors.primary }}
          size={40}
        />
      </div>
    );

  // --- HIỂN THỊ KHI DỮ LIỆU TRỐNG ---
  if (!lesson)
    return (
      <div className="p-10 text-center" style={{ color: colors.text }}>
        Dữ liệu trống.
      </div>
    );
  // Tiếp tục với đoạn return UI của bạn...

  return (
    /* 1. THẰNG CHA BỌC NGOÀI: Màu nền tổng của app */
    <div
      className="h-screen w-full p-0 m-0 transition-colors duration-300"
      style={{ backgroundColor: colors.bg }}
    >
      {/* 2. THẰNG CON BÊN TRONG: Bo góc, đổ bóng tách biệt Sidebar hệ thống */}
      <div
        className="h-full flex flex-col overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: "28px",
          borderBottomRightRadius: "28px",
          boxShadow: isDark
            ? "-10px 0 25px rgba(0,0,0,0.5)"
            : "-10px 0 25px rgba(0,0,0,0.05)",
        }}
      >
        {/* HEADER: HIỂN THỊ TÊN KHÓA HỌC & PROGRESS */}
        <header
          className="px-8 py-4 flex flex-col gap-3 z-20 transition-colors"
          style={{
            backgroundColor: colors.card,
            borderBottom: `1px solid ${colors.divider}`,
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-full transition-all hover:opacity-80"
                style={{ color: colors.muted, backgroundColor: colors.inputBg }}
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1
                  className="text-2xl md:text-3xl leading-none font-bold tracking-tight"
                  style={{ color: colors.primary }}
                >
                  {courseTitle}
                </h1>
              </div>
            </div>

            <div
              className="flex items-center gap-3 px-5 py-2 rounded-full border shadow-sm"
              style={{
                backgroundColor: "rgba(234, 179, 8, 0.1)",
                borderColor: "rgba(234, 179, 8, 0.2)",
              }}
            >
              <Zap size={20} className="text-yellow-500" fill="currentColor" />
              <span className="font-bold text-yellow-600">
                {user?.xp || 0} XP
              </span>
            </div>
          </div>

          {/* Course Progress Bar */}
          <div className="w-full flex items-center gap-4">
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.inputBg }}
            >
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: colors.primary,
                  boxShadow: `0 0 10px ${colors.primary}66`,
                }}
              />
            </div>
            <span
              className="text-[10px] font-bold"
              style={{ color: colors.primary }}
            >
              {progressPercent}%
            </span>
          </div>
        </header>

        {/* BODY - SIDEBAR DANH SÁCH & VÙNG NỘI DUNG */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar danh sách bài học */}
          <aside
            className="w-80 flex flex-col shadow-sm overflow-hidden hidden lg:flex transition-colors"
            style={{
              backgroundColor: colors.card,
              borderRight: `1px solid ${colors.divider}`,
            }}
          >
            <div
              className="p-6 flex items-center justify-between"
              style={{
                borderBottom: `1px solid ${colors.divider}`,
                backgroundColor: colors.inputBg,
              }}
            >
              <span
                className="font-black text-[11px] uppercase tracking-tighter flex items-center gap-2"
                style={{ color: colors.muted }}
              >
                <List size={14} /> {tl.lessonList}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-bold"
                style={{ backgroundColor: colors.card, color: colors.muted }}
              >
                {allLessons.length} {tl.lessons}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 relative devmentor-scrollbar">
              <style>{`
                .my-lesson-item:hover:not(.is-active) {
                  background-color: ${colors.primary}15 !important; 
                  color: ${colors.primary} !important; 
                }
                .my-lesson-item:hover:not(.is-active) .my-lesson-num {
                  background-color: transparent !important; 
                  color: ${colors.primary} !important; 
                }
              `}</style>

              {allLessons.map((l) => {
                const isActive = lesson.id === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => fetchAndGenerateLesson(l.id, courseTitle)}
                    className={`my-lesson-item w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 ${isActive ? "is-active shadow-lg" : ""}`}
                    style={
                      isActive
                        ? {
                            backgroundColor: colors.primary,
                            color: "#ffffff",
                            transform: "scale(1.02)",
                          }
                        : { color: colors.text }
                    }
                  >
                    <div
                      className="my-lesson-num flex items-center justify-center text-[11px] font-bold transition-colors"
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        backgroundColor: isActive ? "#ffffff" : colors.inputBg,
                        color: isActive ? colors.primary : colors.muted,
                      }}
                    >
                      {l.order_num}
                    </div>
                    <span className="text-sm font-bold truncate flex-1 transition-transform">
                      {l.title}
                    </span>
                    {!isActive && l.id < lesson.id && (
                      <CheckCircle2 size={16} className="text-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* VÙNG NỘI DUNG CHÍNH (MAIN CONTENT) */}
          <main
            className="flex-1 overflow-hidden flex flex-col p-4 md:p-8 relative transition-colors"
            style={{ backgroundColor: isDark ? "rgba(0,0,0,0.2)" : colors.bg }}
          >
            <style>{`
              /* Định dạng nội dung bài học chuyên nghiệp */
              .custom-prose { 
                color: ${colors.text}; 
                font-size: 1.1rem; 
                line-height: 1.8;   /* Giãn dòng rộng rãi */
                max-width: 850px;  /* Giới hạn độ rộng để mắt không bị mỏi */
                margin: 0 auto;    /* Căn giữa đống chữ */
                width: 100%;
              }
              .custom-prose h1, .custom-prose h2, .custom-prose h3 { 
                color: ${colors.primary}; 
                margin-top: 2.5rem; 
                margin-bottom: 1.25rem; 
                font-weight: 800; 
                line-height: 1.2;
              }
              .custom-prose p { margin-bottom: 1.5rem; opacity: 0.9; }
              .custom-prose strong { color: ${colors.primary} !important; font-weight: 700; } 
              .custom-prose code { 
                background-color: ${colors.inputBg}; 
                padding: 2px 6px; 
                border-radius: 4px; 
                color: ${colors.secondary}; 
                font-family: monospace;
              }
              
              /* Nút bấm tổng quát */
              .btn-action-custom { 
                background-color: ${colors.primary} !important; 
                box-shadow: 0 10px 30px ${colors.primary}44 !important; 
              }
            `}</style>

            {!showQuiz ? (
              <div className="w-full flex flex-col items-center">
                {/* TIÊU ĐỀ BÀI HỌC */}
                <div className="w-full max-w-[850px] mb-8 animate-in fade-in slide-in-from-left-6 duration-700">
                  <span
                    className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase border tracking-widest"
                    style={{
                      backgroundColor: `${colors.primary}22`,
                      color: colors.primary,
                      borderColor: `${colors.primary}44`,
                    }}
                  >
                    {tl.lessonLabel} {lesson.order_num}
                  </span>
                  <h2
                    className="text-4xl md:text-5xl font-black mt-4 tracking-tighter leading-tight"
                    style={{ color: colors.primary }}
                  >
                    {lesson.title}
                  </h2>
                </div>

                {/* KHỐI NỘI DUNG TRẮNG (CARD) */}
                <div
                  className="w-full relative overflow-hidden flex flex-col transition-all duration-500"
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: "32px",
                    boxShadow: isDark
                      ? "0 20px 50px rgba(0,0,0,0.3)"
                      : "0 20px 50px rgba(0,0,0,0.05)",
                    marginBottom: "40px",
                    minHeight: "75vh",
                  }}
                >
                  {/* Thanh highlight trên cùng */}
                  <div
                    className="absolute top-0 left-0 w-full z-10"
                    style={{ height: "3px", backgroundColor: colors.primary }}
                  />

                  {isPracticeMode ? (
                    /* --- GIAO DIỆN THỰC HÀNH: EDITOR + PREVIEW --- */
                    <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
                      <div
                        className="p-4 flex justify-between items-center border-b"
                        style={{ borderColor: colors.divider }}
                      >
                        <button
                          onClick={() => setIsPracticeMode(false)}
                          className="text-xs font-bold flex items-center gap-2 hover:opacity-70"
                          style={{ color: colors.muted }}
                        >
                          <ChevronLeft size={14} /> {tl.backToTheory}
                        </button>
                        <div className="flex items-center gap-2">
                          <Code size={14} style={{ color: colors.primary }} />
                          <span
                            className="text-[10px] font-black uppercase tracking-widest"
                            style={{ color: colors.primary }}
                          >
                            Live Code Workspace
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black/5">
                        {/* TRÁI: EDITOR GÕ CODE */}
                        <div
                          className="flex-1 border-r relative"
                          style={{ borderColor: colors.divider }}
                        >
                          <Editor
                            height="100%"
                            defaultLanguage="html"
                            theme={isDark ? "vs-dark" : "light"}
                            value={editorCode}
                            onChange={(value) => setEditorCode(value || "")}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 16,
                              padding: { top: 20 },
                              roundedSelection: true,
                              wordWrap: "on",
                              automaticLayout: true,
                            }}
                          />
                        </div>

                        {/* PHẢI: LIVE PREVIEW KẾT QUẢ */}
                        <div className="flex-1 bg-white relative">
                          <div className="absolute top-2 right-4 z-10 text-[9px] font-black text-slate-300 pointer-events-none uppercase tracking-widest">
                            Preview
                          </div>
                          <iframe
                            title="preview"
                            srcDoc={editorCode}
                            className="w-full h-full border-none"
                            sandbox="allow-scripts"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* --- GIAO DIỆN LÝ THUYẾT: NỘI DUNG MARKDOWN --- */
                    <div className="p-10 md:p-20 flex-1 flex flex-col animate-in fade-in duration-500">
                      <div className="custom-prose flex-1">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: marked.parse(lesson.content || ""),
                          }}
                        />
                      </div>

                      {/* Nút mồi thực hành */}
                      <div className="mt-16 flex justify-center">
                        <button
                          onClick={() => setIsPracticeMode(true)}
                          className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                          style={{
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                            border: `1px solid ${colors.primary}44`,
                          }}
                        >
                          <Code size={20} />{" "}
                          {language === "vi"
                            ? "BẮT ĐẦU THỰC HÀNH"
                            : "START PRACTICE"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FOOTER: CHỨA CÁC NÚT ĐIỀU HƯỚNG CỐ ĐỊNH */}
                  <div
                    className="p-6 md:p-8 border-t flex justify-end gap-4"
                    style={{ borderColor: colors.divider }}
                  >
                    {/* NÚT KIỂM TRA: CHỈ HIỆN KHI ĐANG CODE */}
                    {isPracticeMode && (
                      <button
                        onClick={handleCheckCode}
                        disabled={checking}
                        className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-xs md:text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 border shadow-sm"
                        style={{
                          backgroundColor: isDark
                            ? "rgba(255,255,255,0.03)"
                            : "#f8fafc",
                          color: colors.primary,
                          borderColor: `${colors.primary}44`,
                        }}
                      >
                        {checking ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Zap size={18} className="text-yellow-500" />
                        )}
                        {language === "vi" ? "KIỂM TRA BẰNG AI" : "AI CHECK"}
                      </button>
                    )}

                    {/* NÚT BÀI TIẾP THEO / LÀM QUIZ */}
                    <button
                      onClick={async () => {
                        const hasQuiz =
                          lesson.quizzes && lesson.quizzes.length > 0;
                        if (hasQuiz) {
                          setShowQuiz(true);
                        } else {
                          setLoading(true);
                          try {
                            await lessonService.completeLesson(
                              user!.id,
                              lesson.id,
                              lesson.xp_reward,
                              true,
                            );
                            const currentIdx = allLessons.findIndex(
                              (l) => l.id === lesson.id,
                            );
                            const nextLesson = allLessons[currentIdx + 1];
                            if (nextLesson) {
                              fetchAndGenerateLesson(
                                nextLesson.id,
                                courseTitle,
                              );
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            } else {
                              toast.success(tl.completedCourse);
                            }
                          } catch (e) {
                            toast.error(tl.saveError);
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      className="btn-action-custom text-white font-black flex items-center px-10 md:px-14 py-4 md:py-5 rounded-xl md:rounded-2xl gap-3 transition-all hover:scale-[1.03] active:scale-95 shadow-xl"
                    >
                      {lesson.quizzes && lesson.quizzes.length > 0 ? (
                        <>
                          <Award size={24} /> {tl.takeQuiz} (+{lesson.xp_reward}{" "}
                          XP)
                        </>
                      ) : (
                        <>
                          {tl.nextLesson} <ChevronRight size={24} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* GIAO DIỆN QUIZ (Độc lập với card lý thuyết) */
              <div className="max-w-2xl mx-auto py-10 px-6 w-full animate-in zoom-in-95 duration-300">
                <button
                  onClick={() => setShowQuiz(false)}
                  className="mb-8 flex items-center gap-2 font-bold transition-colors hover:opacity-70"
                  style={{ color: colors.muted }}
                >
                  <ChevronLeft size={20} /> {tl.backToTheory}
                </button>
                <QuizComponent
                  questions={lesson.quizzes?.[0]?.quiz_questions || []}
                  lessonId={lesson.id}
                  userId={user!.id}
                  xpReward={lesson.xp_reward}
                  onFinished={async () => {
                    setShowQuiz(false);
                    setLoading(true);
                    try {
                      await lessonService.completeLesson(
                        user!.id,
                        lesson.id,
                        lesson.xp_reward,
                        true,
                      );
                      toast.success(
                        language === "vi"
                          ? "Chúc mừng bạn đã hoàn thành!"
                          : "Lesson completed!",
                      );
                      const currentIdx = allLessons.findIndex(
                        (l) => l.id === lesson.id,
                      );
                      const nextLesson = allLessons[currentIdx + 1];
                      if (nextLesson)
                        fetchAndGenerateLesson(nextLesson.id, courseTitle);
                      else toast.success(tl.completedCourse);
                    } catch (e) {
                      toast.error(tl.saveError);
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
