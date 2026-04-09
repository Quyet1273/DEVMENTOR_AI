import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { lessonService } from "../services/lessonService";
import { QuizComponent } from "./pages/QuizComponent";
import { Lesson, LessonSummary } from "../models/learning";
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

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [allLessons, setAllLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!user || !courseId) return;
      try {
        setLoading(true);
        const cId = parseInt(courseId);

        // 1. Lấy danh sách bài học của khóa
        const courseData = await lessonService.getCourseLessons(cId);

        // NẾU KHÓA TRỐNG (CHƯA CÓ BÀI NÀO)
        if (
          !courseData ||
          !courseData.lessons ||
          courseData.lessons.length === 0
        ) {
          toast.error("Khóa học này chưa có dữ liệu bài học!");
          setLesson(null);
          return;
        }

        let targetLessonId = null;

        // 2. Tìm bài học dở
        try {
          const continueRes = await lessonService.getContinueLesson(
            user.id,
            cId,
          );
          // Ép kiểu chặt chẽ: Chỉ lấy ID nếu API trả về số (bỏ qua object lỗi nếu có)
          if (
            continueRes &&
            (typeof continueRes === "number" || typeof continueRes === "string")
          ) {
            targetLessonId = parseInt(continueRes as any);
            if (isNaN(targetLessonId)) targetLessonId = null;
          }
        } catch (err) {
          console.log("Chưa có lịch sử học, bắt đầu từ bài 1");
        }

        // 3. Fallback lấy bài số 1
        if (!targetLessonId) {
          const sortedLessons = [...courseData.lessons].sort(
            (a, b) => a.order_num - b.order_num,
          );
          targetLessonId = sortedLessons[0].id;
        }

        // 4. Lấy nội dung chi tiết bài học
        const lessonData = await lessonService.getLessonContent(targetLessonId);
        if (!lessonData) throw new Error("Dữ liệu bài học bị rỗng");

        setLesson(lessonData);
        setCourseTitle(courseData.title);
        setAllLessons(courseData.lessons);
      } catch (e) {
        console.error("LỖI TẢI BÀI HỌC:", e);
        toast.error("Lỗi dữ liệu bài học!");
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [courseId, user]);
  const progressPercent =
    allLessons.length > 0
      ? Math.round(
          (allLessons.filter((l) => l.order_num <= (lesson?.order_num || 0))
            .length /
            allLessons.length) *
            100,
        )
      : 0;

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  if (!lesson)
    return <div className="p-10 text-center text-white">Dữ liệu trống.</div>;

  return (
    /* 1. THẰNG CHA BỌC NGOÀI: Ép màu nền tối (#0F172A) trùng với Sidebar Nav */
    <div className="h-screen w-full bg-[#0F172A] p-0 m-0">
      {/* 2. THẰNG CON BÊN TRONG: Màu trắng, bo góc trái 48px, thêm overflow-hidden */}
      <div
        className="h-full flex flex-col bg-white overflow-hidden"
        style={{
          borderTopLeftRadius: "28px",
          borderBottomRightRadius: "28px",
          boxShadow:
            "-10px 0 25px rgba(0,0,0,0.3)" /* Thêm bóng đổ để tách biệt hẳn với Sidebar */,
        }}
      >
        {/* HEADER: HIỂN THỊ TÊN KHÓA HỌC */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex flex-col gap-3 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-slate-100 rounded-full transition-all"
              >
                <ChevronLeft size={24} className="text-slate-600" />
              </button>
              <div>
                {/* <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">
                  Khóa học của tôi
                </p> */}
                <h1 className="text-orange-600 text-slate text-3xl leading-none">
                  {courseTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-yellow-400/10 px-5 py-2 rounded-full border border-yellow-400/20 shadow-sm">
              <Zap size={20} className="text-yellow-500" fill="currentColor" />
              <span className="font-bold text-yellow-700">
                {user?.xp || 0} XP
              </span>
            </div>
          </div>

          {/* Course Progress Bar */}
          <div className="w-full flex items-center gap-4">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-orange-600 text-slate">
              {progressPercent}%
            </span>
          </div>
        </header>

        {/* BODY - SIDEBAR LIST VÀ CONTENT AREA */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Bài học */}
          <aside className="w-80 bg-white flex flex-col border-r border-slate-100 shadow-sm overflow-hidden hidden lg:flex">
            <div className="p-6 border-b flex items-center justify-between bg-slate-50/30">
              <span className="font-black text-[11px] text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                <List size={14} /> Danh sách bài học
              </span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500">
                {allLessons.length} bài
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 relative">
              {/* STYLE CHỐNG LỖI TAILWIND - ĐẢM BẢO HOVER VÀ ACTIVE ĂN 100% */}
              <style>{`
                .my-lesson-item:hover:not(.is-active) {
                  background-color: #fff7ed !important; /* Rê chuột: Nền cam nhạt */
                  color: #2563eb !important; /* Rê chuột: Chữ xanh kiểu cũ */
                }
                .my-lesson-item:hover:not(.is-active) .my-lesson-num {
                  background-color: transparent !important; /* Rê chuột: Bỏ nền cục tròn */
                  color: #2563eb !important; /* Rê chuột: Số màu xanh kiểu cũ */
                }
              `}</style>

              {allLessons.map((l) => {
                const isActive = lesson.id === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={async () => {
                      setLoading(true);
                      const data = await lessonService.getLessonContent(l.id);
                      setLesson(data);
                      setShowQuiz(false);
                      setLoading(false);
                    }}
                    className={`my-lesson-item w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 ${
                      isActive ? "is-active shadow-lg" : "text-slate-600"
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: "#ea580c",
                            color: "#ffffff",
                            transform: "scale(1.02)",
                          }
                        : {}
                    }
                  >
                    <div
                      className="my-lesson-num flex items-center justify-center text-[11px] font-bold transition-colors"
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        backgroundColor: isActive ? "#ffffff" : "#f1f5f9",
                        color: isActive ? "#ea580c" : "inherit",
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

          {/* Vùng Content Chính - Sát Sidebar bài học */}
          <main className="flex-1 bg-[#1E293B] overflow-y-auto flex flex-col p-6 relative">
            {/* THẺ STYLE CHỐNG MÙ TAILWIND CHO VÙNG CONTENT */}
            <style>{`
              /* Đổi chữ in đậm trong Markdown sang màu Cam */
              .custom-prose strong { color: #ea580c !important; } 
              .custom-prose a { color: #ea580c !important; }
              
              /* Style cho nút LÀM KIỂM TRA */
              .btn-quiz-custom { 
                background-color: #ea580c !important; /* Cam đậm */
                box-shadow: 0 20px 40px rgba(234, 88, 12, 0.4) !important; /* Bóng đổ cam */
              }
              .btn-quiz-custom:hover { 
                background-color: #c2410c !important; /* Đậm hơn khi hover */
              }
            `}</style>

            {!showQuiz ? (
              <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                <div className="w-full mb-8 animate-in fade-in slide-in-from-left-6 duration-700">
                  {/* BADGE: INLINE CSS MÀU CAM */}
                  <span
                    className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase border tracking-widest"
                    style={{
                      backgroundColor: "rgba(234, 88, 12, 0.2)", // Nền cam trong suốt
                      color: "#fb923c", // Chữ cam sáng
                      borderColor: "rgba(249, 115, 22, 0.3)", // Viền cam
                    }}
                  >
                    Bài {lesson.order_num}
                  </span>
                  <h2
                    className="text-4xl md:text-5xl font-black mt-4 tracking-tighter leading-[1.1]"
                    style={{ color: "#ea580c" }} // Đổi màu tiêu đề thành cam đậm
                  >
                    {lesson.title}
                  </h2>
                </div>

                {/* Card nội dung Trắng tinh tế - ĐÃ ÉP DÀI RA VÀ ĐẨY NÚT XUỐNG ĐÁY */}
                <div
                  className="w-full bg-white relative overflow-hidden flex flex-col"
                  style={{
                    borderRadius: "48px",
                    padding: "64px",
                    boxShadow: "0 32px 64px rgba(0,0,0,0.15)",
                    marginBottom: "48px",
                    minHeight:
                      "65vh" /* ÉP THẺ DÀI RA TỐI THIỂU 65% CHIỀU CAO MÀN HÌNH */,
                  }}
                >
                  {/* VIỀN TRÊN CỦA CARD: MÀU CAM */}
                  <div
                    className="absolute top-0 left-0 w-full"
                    style={{ height: "12px", backgroundColor: "#ea580c" }}
                  />

                  {/* NỘI DUNG BÀI HỌC */}
                  <div className="custom-prose">
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  </div>

                  {/* VÍ DỤ CODE (NẾU CÓ) */}
                  {lesson.code_example && (
                    <div
                      className="overflow-hidden bg-[#0F172A]"
                      style={{
                        marginTop: "48px",
                        borderRadius: "24px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        className="flex items-center justify-between"
                        style={{
                          padding: "12px 24px",
                          borderBottom: "1px solid #1e293b",
                        }}
                      >
                        <div
                          className="flex items-center text-slate-500 font-mono text-[10px] uppercase"
                          style={{ gap: "8px" }}
                        >
                          <Code size={14} style={{ color: "#fb923c" }} /> Source
                          Code
                        </div>
                      </div>
                      <pre
                        className="text-blue-100 font-mono text-sm leading-8 overflow-x-auto"
                        style={{ padding: "32px" }}
                      >
                        <code>{lesson.code_example}</code>
                      </pre>
                    </div>
                  )}

                  {/* KHU VỰC NÚT BẤM - BỊ ĐẨY XUỐNG ĐÁY NHỜ margin-top: auto */}
                  {/* KHU VỰC NÚT BẤM - ĐÃ XỬ LÝ LOGIC CÓ/KHÔNG CÓ QUIZ */}
                  <div
                    className="flex justify-end"
                    style={{
                      paddingTop: "48px",
                      marginTop: "auto",
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
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
                              const data = await lessonService.getLessonContent(
                                nextLesson.id,
                              );
                              setLesson(data);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            } else {
                              toast.success("Bạn đã hoàn thành khóa học!");
                            }
                          } catch (e) {
                            toast.error("Lỗi lưu tiến độ");
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      className="btn-quiz-custom text-white font-black flex items-center transition-all hover:scale-[1.03] active:scale-95"
                      style={{
                        padding: "20px 48px",
                        borderRadius: "16px",
                        gap: "12px",
                      }}
                    >
                      {lesson.quizzes && lesson.quizzes.length > 0 ? (
                        <>
                          <Award size={24} /> LÀM KIỂM TRA (+{lesson.xp_reward}{" "}
                          XP)
                        </>
                      ) : (
                        <>
                          {/* ĐÃ ĐỔI ICON THUẬN CHIỀU VÀ BỎ XOAY */}
                          BÀI TIẾP THEO <ChevronRight size={24} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto py-10 px-6 w-full animate-in zoom-in-95 duration-300">
                <button
                  onClick={() => setShowQuiz(false)}
                  className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors"
                >
                  <ChevronLeft size={20} /> QUAY LẠI LÝ THUYẾT
                </button>
                <QuizComponent
                  questions={lesson.quizzes?.[0]?.quiz_questions || []}
                  lessonId={lesson.id}
                  userId={user!.id}
                  xpReward={lesson.xp_reward}
                  onFinished={async () => {
                    // 1. Tắt màn hình làm bài tập
                    setShowQuiz(false);

                    setLoading(true);
                    try {
                      // 2. GỌI LƯU TIẾN ĐỘ & CỘNG XP TRƯỚC KHI CHUYỂN BÀI
                      // Truyền lesson.xp_reward để nó cộng vào cột xp_earned trong DB
                      await lessonService.completeLesson(
                        user!.id,
                        lesson.id,
                        lesson.xp_reward,
                        true,
                      );

                      toast.success(
                        "Chúc mừng bạn! Đã lưu tiến độ và nhận XP.",
                      );

                      // 3. Tìm bài học tiếp theo trong danh sách
                      const currentIdx = allLessons.findIndex(
                        (l) => l.id === lesson.id,
                      );
                      const nextLesson = allLessons[currentIdx + 1];

                      if (nextLesson) {
                        const data = await lessonService.getLessonContent(
                          nextLesson.id,
                        );
                        setLesson(data);
                        // Cuộn lên đầu trang cho bài mới nhìn cho chuyên nghiệp
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        toast.success(
                          "Chúc mừng! Bạn đã hoàn thành khóa học này rồi!",
                        );
                      }
                    } catch (e) {
                      console.error(e);
                      toast.error("Lỗi khi lưu tiến độ học tập");
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
