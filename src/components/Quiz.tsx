import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Heart,
  Flame,
  X,
  Loader2,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase"; // Đảm bảo đường dẫn này đúng với file cấu hình Supabase của bạn

// --- INTERFACES ---
interface Question {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

interface QuizResult {
  questionId: string | number;
  userAnswer: number;
  correct: boolean;
}

// BẢNG QUY ĐỔI TOPIC ID -> QUIZ_ID TRONG DATABASE
const topicToQuizId: Record<string, number> = {
  "html-css": 1,
  javascript: 2,
  react: 3,
  algorithms: 4,
};

export function Quiz() {
  const { user, updateUser } = useAuth();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  // --- STATE DỮ LIỆU TỪ DATABASE ---
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE ĐIỀU HƯỚNG ---
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // --- STATE GAMIFICATION (DUOLINGO) ---
  const [hearts, setHearts] = useState(5);
  const [combo, setCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // --- STATE LUỒNG CHƠI ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<
    "idle" | "correct" | "incorrect"
  >("idle");
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Danh sách các môn học hiển thị ở màn hình chính
  const topics = [
    { id: "html-css", name: "HTML & CSS", icon: "🎨", questions: 50 },
    { id: "javascript", name: "JavaScript", icon: "⚡", questions: 50 },
    { id: "react", name: "React", icon: "⚛️", questions: 50 },
    { id: "algorithms", name: "Algorithms", icon: "🧮", questions: 50 },
  ];

  // ==========================================
  // HÀM LẤY DỮ LIỆU TỪ SUPABASE
  // ==========================================
  const fetchQuestions = async (topicId: string) => {
    setIsLoading(true);
    const quizId = topicToQuizId[topicId];

    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        // .order('random()') // Lấy ngẫu nhiên nếu bạn có cấu hình RPC random trên Supabase
        .order("id", { ascending: true })
        .limit(10); // Lấy 10 câu mỗi lần chơi cho đỡ mệt, bạn có thể chỉnh sửa số này

      if (error) throw error;

      if (data && data.length > 0) {
        // Map dữ liệu từ Database sang định dạng Component cần
        const formattedQuestions: Question[] = data.map((q: any) => ({
          id: q.id,
          question: q.question_text,
          options: q.options,
          correctAnswer: q.correct_option_index,
          explanation: q.explanation,
          difficulty: q.difficulty || "medium",
        }));

        setCurrentQuestions(formattedQuestions);
        setSelectedTopic(topicId);
        resetGameState();
      } else {
        toast.error("Chưa có câu hỏi nào cho môn này!");
        setSelectedTopic(null);
      }
    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu: " + error.message);
      setSelectedTopic(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // CÁC HÀM XỬ LÝ LOGIC GAME
  // ==========================================
  const handleTopicSelect = (topicId: string) => {
    fetchQuestions(topicId);
  };

  const resetGameState = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerStatus("idle");
    setQuizResults([]);
    setQuizCompleted(false);
    setIsGameOver(false);
    setHearts(5);
    setCombo(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (answerStatus !== "idle") return; // Không cho phép đổi đáp án khi đã check
    setSelectedAnswer(answerIndex);
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];

// Hàm xử lý khi nhấn nút "KIỂM TRA"
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setAnswerStatus(isCorrect ? "correct" : "incorrect");

    setQuizResults((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer,
        correct: isCorrect,
      },
    ]);

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);

      // LƯU XP VÀO BẢNG USERS CỦA SUPABASE
      if (user) {
        let baseXp =
          currentQuestion.difficulty === "hard"
            ? 30
            : currentQuestion.difficulty === "medium"
              ? 20
              : 10;
        let finalXp = newCombo >= 3 ? baseXp * 2 : baseXp;

        updateUser({ xp: (user.xp || 0) + finalXp });

        if (newCombo >= 3 && newCombo % 3 === 0) {
          toast.success(`Combo ${newCombo}! Nhân đôi XP! 🔥`);
        }
      }

      // Tự động lướt câu sau 1.5s
      setTimeout(() => {
        handleNextQuestion();
      }, 1500);

    } else {
      setCombo(0); // Mất combo
      
      // TÍNH TOÁN VÀ TRỪ TIM THẬT TRONG DATABASE
      const currentHearts = user?.hearts !== undefined ? user.hearts : hearts;
      const newHearts = currentHearts - 1;
      
      setHearts(newHearts); // Cập nhật UI để trái tim nảy nảy

      if (user) {
        updateUser({ hearts: newHearts }); // Bắn thẳng số tim mới lên DB
      }

      // Hết tim thì Game Over
      if (newHearts <= 0) {
        setIsGameOver(true);
      }
    }
  };

  // Hàm xử lý khi nhấn nút "TIẾP TỤC"
  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswerStatus("idle");
    } else {
      // HOÀN THÀNH BÀI QUIZ
      setQuizCompleted(true);

      // Tính điểm và cộng vào cột quizzes_passed
      const correctAnswersCount = quizResults.filter((r) => r.correct).length;
      const scorePercentage = Math.round(
        (correctAnswersCount / currentQuestions.length) * 100,
      );

      // Nếu user đạt trên 60%, cộng 1 vào bài đã qua
      if (scorePercentage >= 60 && user) {
        updateUser({ quizzes_passed: (user.quizzes_passed || 0) + 1 });
        toast.success("Chúc mừng bạn đã vượt qua bài kiểm tra! 🎉");
      }
    }
  };

  const handleQuit = () => {
    setSelectedTopic(null);
    setCurrentQuestions([]);
  };

  // Tính toán kết quả
  const correctAnswers = quizResults.filter((r) => r.correct).length;
  const totalQuestions = quizResults.length;
  const score =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  // ==========================================
  // RENDER GIAO DIỆN
  // ==========================================

  // --- MÀN HÌNH LOADING ---
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: colors.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: colors.primary,
        }}
      >
        <Loader2
          className="animate-spin"
          size={48}
          style={{ marginBottom: "16px" }}
        />
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            fontFamily: "monospace",
          }}
        >
          Đang nạp dữ liệu từ máy chủ...
        </h2>
      </div>
    );
  }

  // --- MÀN HÌNH 1: CHỌN TOPIC ---
  if (!selectedTopic) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: colors.bg,
          padding: "32px",
          fontFamily: "monospace",
          color: colors.text,
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div
            style={{
              marginBottom: "32px",
              borderLeft: `4px solid ${colors.secondary}`,
              paddingLeft: "16px",
            }}
          >
            <h1
              style={{
                fontSize: "30px",
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              Quiz & Kiểm tra
            </h1>
            <p style={{ color: colors.muted, fontSize: "14px" }}>
              HỆ THỐNG TRUY VẤN DỮ LIỆU KIẾN THỨC
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                style={{
                  backgroundColor: colors.card,
                  padding: "24px",
                  borderRadius: "16px",
                  border: `2px solid ${colors.border}`,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "0.2s",
                  boxShadow: isDark ? "none" : "0 4px 6px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>
                  {topic.icon}
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: colors.text,
                    marginBottom: "8px",
                  }}
                >
                  {topic.name}
                </h3>
                <p style={{ fontSize: "12px", color: colors.muted }}>
                  Kho dữ liệu: {topic.questions} câu hỏi
                </p>
              </button>
            ))}
          </div>

          {/* Bảng thống kê cá nhân */}
          {user && (
            <div
              style={{
                marginTop: "40px",
                backgroundColor: colors.card,
                borderRadius: "16px",
                padding: "24px",
                border: `1px solid ${colors.border}`,
              }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: colors.text,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <Award size={18} color={colors.primary} /> THÀNH TÍCH CỦA BẠN
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                  textAlign: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      color: "#10b981",
                    }}
                  >
                    {user.quizzes_passed || 0}
                  </p>
                  <p style={{ fontSize: "12px", color: colors.muted }}>
                    BÀI ĐÃ QUA
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      color: colors.secondary,
                    }}
                  >
                    {user.xp || 0}
                  </p>
                  <p style={{ fontSize: "12px", color: colors.muted }}>
                    XP HIỆN TẠI
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH 2: GAME OVER ---
  if (isGameOver) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          minHeight: "100vh",
          backgroundColor: colors.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <XCircle
            size={80}
            color="#ef4444"
            style={{ margin: "0 auto 24px" }}
          />
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: colors.text,
              marginBottom: "16px",
            }}
          >
            Hết sinh mệnh!
          </h2>
          <p
            style={{
              color: colors.muted,
              marginBottom: "32px",
              lineHeight: "1.6",
            }}
          >
            Bạn đã mắc quá nhiều sai lầm. Đừng nản chí, hãy xốc lại tinh thần và
            thử lại nhé!
          </p>
          <button
            onClick={() => fetchQuestions(selectedTopic)}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: colors.primary,
              color: "#fff",
              fontSize: "18px",
              fontWeight: "bold",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 4px 0 ${colors.secondary}`,
              transition: "0.2s",
            }}
            onMouseDown={(e: any) =>
              (e.currentTarget.style.transform = "translateY(4px)")
            }
            onMouseUp={(e: any) =>
              (e.currentTarget.style.transform = "translateY(0)")

            }
            onMouseLeave={(e: any) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            THỬ LẠI TỪ ĐẦU
          </button>{" "}
          <button
            onClick={handleQuit}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "transparent",
              color: colors.muted,
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              marginTop: "16px",
            }}
          >
            BỎ CUỘC
          </button>
        </div>
      </motion.div>
    );
  }

  // --- MÀN HÌNH 3: HOÀN THÀNH ---
  if (quizCompleted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: colors.bg,
          padding: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            backgroundColor: colors.card,
            borderRadius: "24px",
            border: `2px solid ${colors.border}`,
            padding: "48px",
            maxWidth: "600px",
            width: "100%",
            textAlign: "center",
            boxShadow: `0 10px 30px rgba(0,0,0,0.1)`,
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor:
                score >= 60
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            {score >= 60 ? (
              <CheckCircle2 size={40} color="#10b981" />
            ) : (
              <XCircle size={40} color="#ef4444" />
            )}
          </div>
          <h2
            style={{
              color: colors.text,
              fontSize: "28px",
              fontWeight: 900,
              marginBottom: "8px",
            }}
          >
            {score >= 60 ? "BÀI HỌC HOÀN TẤT!" : "CẦN NỖ LỰC HƠN!"}
          </h2>
          <p style={{ color: colors.muted, marginBottom: "32px" }}>
            Bạn trả lời chính xác {correctAnswers} trên tổng số {totalQuestions}{" "}
            câu hỏi ({score}%).
          </p>

          <button
            onClick={handleQuit}
            style={{
              padding: "16px 32px",
              width: "100%",
              backgroundColor: score >= 60 ? "#10b981" : colors.primary,
              borderRadius: "16px",
              color: "#fff",
              fontWeight: 900,
              border: "none",
              cursor: "pointer",
              boxShadow: `0 4px 0 ${score >= 60 ? "#059669" : colors.secondary}`,
              fontSize: "18px",
            }}
          >
            TIẾP TỤC HÀNH TRÌNH
          </button>
        </div>
      </div>
    );
  }

  // Nếu không có câu hỏi nào (Đề phòng lỗi render)
  if (!currentQuestion) return null;

  // --- MÀN HÌNH 4: IN-GAME (DUOLINGO UI) ---
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
        color: colors.text,
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
          flex: 1,
          padding: "24px 24px 140px",
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <button
            onClick={handleQuit}
            style={{
              background: "none",
              border: "none",
              color: colors.muted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={28} />
          </button>

          {/* Thanh Tiến Độ */}
          <div
            style={{
              flex: 1,
              height: "16px",
              backgroundColor: colors.inputBg,
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#10b981",
                width: `${(currentQuestionIndex / currentQuestions.length) * 100}%`,
                transition: "width 0.5s ease-out",
                borderRadius: "8px",
              }}
            ></div>
          </div>

          {/* Chỉ số Lửa và Tim */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            <motion.div
              animate={{ scale: combo > 0 ? [1, 1.2, 1] : 1 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: combo > 0 ? "#f97316" : colors.muted,
              }}
            >
              <Flame size={24} fill={combo > 0 ? "#f97316" : "none"} /> {combo}
            </motion.div>
            <motion.div
              key={hearts}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#ef4444",
              }}
            >
              <Heart size={24} fill="#ef4444" /> {hearts}
            </motion.div>
          </div>
        </div>

        {/* NỘI DUNG CÂU HỎI TỪ DB */}
        <div style={{ marginBottom: "24px" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor:
                currentQuestion.difficulty === "hard"
                  ? "#fee2e2"
                  : currentQuestion.difficulty === "medium"
                    ? "#fef3c7"
                    : "#d1fae5",
              color:
                currentQuestion.difficulty === "hard"
                  ? "#ef4444"
                  : currentQuestion.difficulty === "medium"
                    ? "#f59e0b"
                    : "#10b981",
            }}
          >
            {currentQuestion.difficulty.toUpperCase()}
          </span>
        </div>

        <h2
          style={{
            fontSize: "24px",
            fontWeight: 900,
            color: colors.text,
            marginBottom: "32px",
            lineHeight: "1.5",
          }}
        >
          {currentQuestion.question}
        </h2>

        {/* CÁC ĐÁP ÁN BẬT NẢY */}
        <div style={{ display: "grid", gap: "16px" }}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            let borderColor = isDark ? "#333" : "#e5e7eb";
            let bgColor = "transparent";
            if (isSelected) {
              borderColor = colors.primary;
              bgColor = `${colors.primary}15`;
            }

            return (
              <motion.button
                key={index}
                whileHover={answerStatus === "idle" ? { y: -2 } : {}}
                whileTap={answerStatus === "idle" ? { scale: 0.98 } : {}}
                onClick={() => handleAnswerSelect(index)}
                disabled={answerStatus !== "idle"}
                style={{
                  padding: "20px 24px",
                  borderRadius: "16px",
                  border: `2px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  textAlign: "left",
                  cursor: answerStatus === "idle" ? "pointer" : "default",
                  fontSize: "16px",
                  fontWeight: isSelected ? "bold" : "normal",
                  color: isSelected ? colors.primary : colors.text,
                  boxShadow: isSelected
                    ? `0 4px 0 ${colors.primary}`
                    : `0 4px 0 ${isDark ? "#333" : "#e5e7eb"}`,
                  transition: "background-color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: `2px solid ${borderColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                {option}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 200 }}
          animate={{ y: 0 }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "24px",
            backgroundColor:
              answerStatus === "correct"
                ? isDark
                  ? "#064e3b"
                  : "#d1fae5"
                : answerStatus === "incorrect"
                  ? isDark
                    ? "#7f1d1d"
                    : "#fee2e2"
                  : colors.bg,
            borderTop: `2px solid ${answerStatus === "idle" ? colors.border : "transparent"}`,
            display: "flex",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div style={{ flex: 1 }}>
              {answerStatus === "correct" && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <h3
                    style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      color: isDark ? "#34d399" : "#059669",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle2
                      fill="currentColor"
                      color={isDark ? "#064e3b" : "#d1fae5"}
                      size={32}
                    />{" "}
                    Tuyệt vời!
                  </h3>
                </motion.div>
              )}
              {answerStatus === "incorrect" && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <h3
                    style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      color: isDark ? "#f87171" : "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <XCircle
                      fill="currentColor"
                      color={isDark ? "#7f1d1d" : "#fee2e2"}
                      size={32}
                    />{" "}
                    Rất tiếc, đáp án là:
                  </h3>
                  <p
                    style={{
                      color: isDark ? "#fecaca" : "#991b1b",
                      fontSize: "16px",
                    }}
                  >
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </div>

            <button
              onClick={
                answerStatus === "idle"
                  ? handleSubmitAnswer
                  : handleNextQuestion
              }
              disabled={answerStatus === "idle" && selectedAnswer === null}
              style={{
                padding: "16px 40px",
                borderRadius: "16px",
                fontSize: "18px",
                fontWeight: 900,
                cursor:
                  answerStatus === "idle" && selectedAnswer === null
                    ? "not-allowed"
                    : "pointer",
                border: "none",
                minWidth: "180px",
                color: "#fff",
                backgroundColor:
                  answerStatus === "correct"
                    ? "#10b981"
                    : answerStatus === "incorrect"
                      ? "#ef4444"
                      : selectedAnswer !== null
                        ? colors.primary
                        : colors.inputBg,
                boxShadow: `0 4px 0 ${answerStatus === "correct" ? "#059669" : answerStatus === "incorrect" ? "#b91c1c" : selectedAnswer !== null ? colors.secondary : "transparent"}`,
                transform: "translateY(-4px)",
                transition: "all 0.1s",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 4px 0 ...`;
              }}
            >
              {answerStatus === "idle" ? "KIỂM TRA" : "TIẾP TỤC"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
