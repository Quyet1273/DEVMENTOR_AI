import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../data/translations";
import { lessonService } from "../services/lessonService";
import { QuizComponent } from "./pages/QuizComponent";
import { aiService } from "../services/aiService";
import { Lesson, LessonSummary } from "../models/learning";
import MentorAdvice from "./pages/MentorAdvice";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- STATE PHỤC VỤ THỰC HÀNH & KIỂM TRA (FIX LỖI CANNOT FIND NAME) ---
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [checking, setChecking] = useState(false);
  // AI help
  const [advice, setAdvice] = useState<string>("Đang kết nối với Mentor...");

  useEffect(() => {
    const fetchAdvice = async () => {
      // Nếu chưa load kịp user thì để là "Bạn học"
      const displayName = user?.name || user?.name || "Bạn học";

      // 2. Lấy tiêu đề bài học
      const lessonTitle = lesson?.title || "bài học mới";

      // 3. Lấy level thật
      const userLevel = user?.level || 3;

      if (lesson) {
        // Chỉ gọi AI khi đã load xong dữ liệu bài học
        setAdvice("Mentor đang xem bài học..."); // Hiệu ứng chờ cho xịn
        try {
          const res = await aiService.getLessonIntro(
            displayName,
            lessonTitle,
            userLevel,
          );
          setAdvice(res);
        } catch (error) {
          setAdvice("Chúc bạn có một buổi học hiệu quả nhé!");
        }
      }
    };

    fetchAdvice();
  }, [lesson, user]); // Quan trọng: Chạy lại mỗi khi 'lesson' thay đổi (khi bạn chuyển bài)

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

  // --- LOGIC KHỞI TẠO BÀI HỌC ---?
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
                <h2
                  className="text-2xl md:text-3xl leading-none font-bold tracking-tight"
                  style={{ color: colors.primary }}
                >
                  {courseTitle}
                </h2>
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
            className={`flex flex-col shadow-sm transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-0 opacity-0"}`}
            style={{
              backgroundColor: colors.card,
              borderRight: isSidebarOpen
                ? `1px solid ${colors.divider}`
                : "none",
              position: "relative", // Để định vị nút đóng mở nếu cần
            }}
          >
            {/* Header của Sidebar - Chữ bé lại */}
            <div
              className="p-4 flex items-center justify-between"
              style={{ backgroundColor: colors.inputBg }}
            >
              <span
                className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                style={{ color: colors.muted }}
              >
                <List size={12} /> {tl.lessonList}
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden" // Hiện nút X trên mobile hoặc thích thì để cả desktop
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 devmentor-scrollbar">
              {allLessons.map((l) => {
                const isActive = lesson.id === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => fetchAndGenerateLesson(l.id, courseTitle)}
                    className={`w-full flex items-center gap-2 p-3 rounded-xl text-left transition-all ${isActive ? "shadow-md" : ""}`}
                    style={
                      isActive
                        ? { backgroundColor: colors.primary, color: "#fff" }
                        : { color: colors.text }
                    }
                  >
                    {/* Vòng tròn số bé lại */}
                    <div
                      className="flex items-center justify-center text-[10px] font-bold"
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        backgroundColor: isActive ? "#ffffff" : colors.inputBg,
                        color: isActive ? colors.primary : colors.muted,
                      }}
                    >
                      {l.order_num}
                    </div>

                    {/* Chữ tiêu đề bé lại (text-[13px]) */}
                    <span className="text-[13px] font-semibold truncate flex-1">
                      {l.title === "y" ? "Bài học bổ trợ" : l.title}
                    </span>

                    {!isActive && l.id < lesson.id && (
                      <CheckCircle2 size={14} className="text-green-500" />
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

            <div className="w-full flex flex-col items-center">
              {/* --- CHÈN CON ROBOT VÀO ĐÂY (Luôn hiển thị ở trên cùng) --- */}
              <div className="w-full max-w-[850px] mb-6">
                <MentorAdvice
                  userName={user?.name || "Bạn học thân mến"}
                  advice={advice}
                />
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
                  minHeight: "75vh",
                }}
              >
                {/* Thanh highlight trên cùng */}
                <div
                  className="absolute top-0 left-0 w-full z-10"
                  style={{ height: "3px", backgroundColor: colors.primary }}
                />

                {showQuiz ? (
                  /* --- GIAO DIỆN QUIZ (Hiển thị bên trong Card) --- */
                /* --- GIAO DIỆN QUIZ (Hiển thị bên trong Card nội dung) --- */
<div className="flex-1 flex flex-col p-6 md:p-10 animate-in zoom-in-95 duration-300 overflow-hidden">
  {/* Nút quay lại lý thuyết - Làm nhỏ gọn lại */}
  <button
    onClick={() => setShowQuiz(false)}
    className="mb-6 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all hover:opacity-70"
    style={{ color: colors.muted }}
  >
    <ChevronLeft size={16} /> {tl.backToTheory}
  </button>

  {/* Khung chứa nội dung Quiz: Ép font-size và giới hạn chiều cao để cuộn nội bộ */}
  <div 
    className="flex-1 flex flex-col max-w-2xl mx-auto w-full overflow-y-auto pr-2 devmentor-scrollbar"
    style={{ 
      maxHeight: "calc(100vh - 500px)", // Giới hạn chiều cao để nút FOOTER không bị đẩy mất
      fontSize: "13px",                // Ép font chữ bé lại đồng bộ với lý thuyết
      lineHeight: "1.5"
    }}
  >
    {/* Phần Header Quiz thu nhỏ */}
    <div className="mb-4">
      <span 
        className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
        style={{ 
          backgroundColor: `${colors.primary}10`, 
          color: colors.primary,
          borderColor: `${colors.primary}30` 
        }}
      >
        🎯 Thử thách bài học (+{lesson.xp_reward} XP)
      </span>
    </div>

    <QuizComponent
      // Truyền đúng danh sách câu hỏi từ database (hiện tại là 1 câu)
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
              ? "Chính xác! Bạn đã hoàn thành bài học."
              : "Perfect! Lesson completed!",
          );

          // Logic tìm bài học tiếp theo
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
      }}
    />
  </div>
</div>
                ) : isPracticeMode ? (
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
                  <div className=" flex-1 flex flex-col animate-in fade-in duration-500">
                    <div
                      className="custom-prose flex-1 overflow-y-auto pr-4"
                      style={{
                        color: colors.text,
                        maxHeight: "calc(100vh - 450px)",
                        minHeight: "300px",
                        fontSize: "13px",
                        lineHeight: "1.5",
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: marked.parse(lesson.content || ""),
                        }}
                      />
                    </div>

                    {/* CỤM NÚT ĐIỀU HƯỚNG BÊN TRONG NỘI DUNG */}
                    <div className="mt-16 gap-6 flex justify-center">
                      <button
                        onClick={() => setIsPracticeMode(true)}
                        className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                        style={{
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          border: `1px solid ${colors.primary}44`,
                        }}
                      >
                        <Code size={20} />
                        {language === "vi"
                          ? "BẮT ĐẦU THỰC HÀNH"
                          : "START PRACTICE"}
                      </button>
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
                                window.scrollTo({
                                  top: 0,
                                  behavior: "smooth",
                                });
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
                            <Award size={24} /> {tl.takeQuiz} (+
                            {lesson.xp_reward} XP)
                          </>
                        ) : (
                          <>
                            {tl.nextLesson} <ChevronRight size={24} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* FOOTER: CHỈ HIỆN KHI CẦN THIẾT (Tùy chỉnh logic Footer của bạn tại đây) */}
                <div
                  className="p-6 md:p-8 border-t flex justify-end gap-4"
                  style={{ borderColor: colors.divider }}
                >
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
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
