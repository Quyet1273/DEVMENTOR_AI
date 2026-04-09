import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  XCircle,
  Award,
  // Clock,
  ArrowRight,
  RotateCcw,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizResult {
  questionId: string;
  userAnswer: number;
  correct: boolean;
}

export function Quiz() {
  const { user, updateUser } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // --- HỆ THỐNG MÀU HUD ---
  const colors = {
    bg: '#020617',
    card: '#0f172a',
    primary: '#22d3ee', // Cyan
    secondary: '#a855f7', // Purple
    text: '#d1d5db',
    border: 'rgba(168, 85, 247, 0.3)'
  };

  const topics = [
    { id: 'html-css', name: 'HTML & CSS', icon: '🎨', questions: 10 },
    { id: 'javascript', name: 'JavaScript', icon: '⚡', questions: 15 },
    { id: 'react', name: 'React', icon: '⚛️', questions: 12 },
    { id: 'algorithms', name: 'Algorithms', icon: '🧮', questions: 10 },
  ];

  // Mock quiz questions (GIỮ NGUYÊN DATA CỦA QUỲNH)
  const quizData: Record<string, Question[]> = {
    javascript: [
      {
        id: 'js-1',
        question: 'Kết quả của console.log(typeof null) là gì?',
        options: ['null', 'undefined', 'object', 'number'],
        correctAnswer: 2,
        explanation:
          'Đây là một bug lịch sử trong JavaScript. typeof null trả về "object" thay vì "null". Đây là một quirk nổi tiếng của JavaScript được giữ lại để tương thích ngược.',
        difficulty: 'medium',
      },
      {
        id: 'js-2',
        question: 'Closure trong JavaScript là gì?',
        options: [
          'Một cách để đóng browser',
          'Function có thể truy cập biến từ outer scope',
          'Một loại loop',
          'Một method của Array',
        ],
        correctAnswer: 1,
        explanation:
          'Closure là một function có thể truy cập và ghi nhớ biến từ phạm vi bên ngoài (outer scope) ngay cả sau khi outer function đã thực thi xong.',
        difficulty: 'medium',
      },
      {
        id: 'js-3',
        question: 'Sự khác biệt giữa == và === là gì?',
        options: [
          'Không có sự khác biệt',
          '== so sánh giá trị, === so sánh giá trị và kiểu dữ liệu',
          '=== nhanh hơn ==',
          '== cho string, === cho number',
        ],
        correctAnswer: 1,
        explanation:
          '== (loose equality) thực hiện type coercion trước khi so sánh. === (strict equality) so sánh cả giá trị và kiểu dữ liệu mà không có type coercion.',
        difficulty: 'easy',
      },
      {
        id: 'js-4',
        question: 'Promise trong JavaScript dùng để làm gì?',
        options: [
          'Lưu trữ dữ liệu',
          'Xử lý bất đồng bộ',
          'Tạo vòng lặp',
          'Định nghĩa biến',
        ],
        correctAnswer: 1,
        explanation:
          'Promise là một object đại diện cho việc hoàn thành (hoặc thất bại) của một async operation và giá trị kết quả của nó.',
        difficulty: 'medium',
      },
      {
        id: 'js-5',
        question: 'Kết quả của [1, 2, 3].map(x => x * 2) là gì?',
        options: ['[1, 2, 3]', '[2, 4, 6]', '[3, 5, 7]', 'undefined'],
        correctAnswer: 1,
        explanation:
          'Array.map() tạo một array mới bằng cách áp dụng function cho mỗi phần tử. Trong trường hợp này, mỗi số được nhân với 2.',
        difficulty: 'easy',
      },
    ],
    react: [
      {
        id: 'react-1',
        question: 'useState hook trả về gì?',
        options: [
          'Một giá trị',
          'Một function',
          'Một array gồm [state, setState]',
          'Một object',
        ],
        correctAnswer: 2,
        explanation:
          'useState trả về một array với 2 phần tử: giá trị state hiện tại và một function để update state đó.',
        difficulty: 'easy',
      },
      {
        id: 'react-2',
        question: 'useEffect chạy khi nào?',
        options: [
          'Trước khi component render',
          'Sau mỗi render',
          'Chỉ một lần',
          'Khi user click',
        ],
        correctAnswer: 1,
        explanation:
          'Mặc định, useEffect chạy sau mỗi render (cả lần đầu và các lần re-render). Có thể control bằng dependency array.',
        difficulty: 'medium',
      },
      {
        id: 'react-3',
        question: 'Props trong React là gì?',
        options: [
          'Properties để style component',
          'Dữ liệu truyền từ parent xuống child',
          'State của component',
          'Method của component',
        ],
        correctAnswer: 1,
        explanation:
          'Props (properties) là cách truyền dữ liệu từ parent component xuống child component. Props là read-only.',
        difficulty: 'easy',
      },
    ],
    'html-css': [
      {
        id: 'html-1',
        question: 'Thẻ nào dùng để tạo hyperlink?',
        options: ['<link>', '<a>', '<href>', '<url>'],
        correctAnswer: 1,
        explanation: 'Thẻ <a> (anchor) được sử dụng để tạo hyperlink trong HTML.',
        difficulty: 'easy',
      },
      {
        id: 'html-2',
        question: 'CSS Flexbox dùng thuộc tính nào để căn giữa?',
        options: [
          'center: true',
          'align-items: center',
          'middle: center',
          'position: center',
        ],
        correctAnswer: 1,
        explanation:
          'align-items: center sẽ căn giữa các flex items theo trục cross axis.',
        difficulty: 'medium',
      },
    ],
  };

  const currentQuestions = selectedTopic ? quizData[selectedTopic] || [] : [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizResults([]);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Vui lòng chọn một đáp án');
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setQuizResults((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer,
        correct: isCorrect,
      },
    ]);

    setShowResult(true);

    if (isCorrect && user) {
      const xpGain = currentQuestion.difficulty === 'hard' ? 30 : 
                     currentQuestion.difficulty === 'medium' ? 20 : 10;
      updateUser({ xp: user.xp + xpGain });
      toast.success(`Chính xác! +${xpGain} XP`);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setSelectedTopic(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizResults([]);
    setQuizCompleted(false);
  };

  const correctAnswers = quizResults.filter((r) => r.correct).length;
  const totalQuestions = quizResults.length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // --- RENDERING ZONE ---

  if (!selectedTopic) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.bg, padding: '32px', fontFamily: 'monospace', color: colors.text }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px', borderLeft: `4px solid ${colors.secondary}`, paddingLeft: '16px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>Quiz & Kiểm tra</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>HỆ THỐNG TRUY VẤN DỮ LIỆU KIẾN THỨC</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: '16px',
                  padding: '24px',
                  border: `1px solid ${colors.border}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{topic.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>{topic.name}</h3>
                <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>{topic.questions} câu hỏi</p>
                <span style={{ color: colors.primary, fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  BẮT ĐẦU <ArrowRight size={14} />
                </span>
              </button>
            ))}
          </div>

          {/* Stats HUD */}
          <div style={{ marginTop: '32px', backgroundColor: colors.card, borderRadius: '16px', padding: '24px', border: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Award size={18} color={colors.primary} /> THỐNG KÊ HỆ THỐNG
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
              <div><p style={{ fontSize: '20px', fontWeight: 900, color: colors.primary }}>24</p><p style={{ fontSize: '10px', color: '#475569' }}>QUIZ XONG</p></div>
              <div><p style={{ fontSize: '20px', fontWeight: 900, color: '#10b981' }}>87%</p><p style={{ fontSize: '10px', color: '#475569' }}>TỶ LỆ ĐÚNG</p></div>
              <div><p style={{ fontSize: '20px', fontWeight: 900, color: colors.secondary }}>1,250</p><p style={{ fontSize: '10px', color: '#475569' }}>XP KIẾM ĐƯỢC</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.bg, padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <div style={{ backgroundColor: colors.card, borderRadius: '24px', border: `2px solid ${colors.secondary}`, padding: '48px', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: score >= 60 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            {score >= 60 ? <CheckCircle2 size={40} color="#10b981" /> : <XCircle size={40} color="#ef4444" />}
          </div>
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>HOÀN THÀNH TRUY VẤN</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>{score >= 80 ? 'XUẤT SẮC! BẠN ĐÃ LÀM CHỦ KIẾN THỨC.' : 'CẦN TIẾP TỤC TỐI ƯU HÓA DỮ LIỆU.'}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}><p style={{ fontSize: '24px', fontWeight: 900, color: colors.primary }}>{score}%</p><p style={{ fontSize: '10px' }}>ĐIỂM</p></div>
            <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}><p style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>{correctAnswers}</p><p style={{ fontSize: '10px' }}>ĐÚNG</p></div>
            <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}><p style={{ fontSize: '24px', fontWeight: 900, color: '#ef4444' }}>{totalQuestions - correctAnswers}</p><p style={{ fontSize: '10px' }}>SAI</p></div>
          </div>

          <button onClick={handleRestart} style={{ padding: '12px 24px', background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`, border: 'none', borderRadius: '12px', color: colors.bg, fontWeight: 900, cursor: 'pointer' }}>LÀM QUIZ KHÁC</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg, padding: '32px', fontFamily: 'monospace', color: colors.text }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Progress HUD */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.primary, marginBottom: '8px', fontWeight: 'bold' }}>
            <span>CÂU {currentQuestionIndex + 1} / {currentQuestions.length}</span>
            <span>TOPIC: {selectedTopic?.toUpperCase()}</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: colors.primary, width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`, transition: '0.3s', boxShadow: `0 0 10px ${colors.primary}` }}></div>
          </div>
        </div>

        {/* Question Card */}
        <div style={{ backgroundColor: colors.card, borderRadius: '24px', border: `1px solid ${colors.border}`, padding: '40px' }}>
          <span style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.05)', color: colors.secondary, border: `1px solid ${colors.border}` }}>
            MỨC ĐỘ: {currentQuestion?.difficulty === 'hard' ? 'KHÓ' : currentQuestion?.difficulty === 'medium' ? 'TRUNG BÌNH' : 'DỄ'}
          </span>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: '24px 0 32px' }}>{currentQuestion?.question}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              let borderColor = 'rgba(255,255,255,0.1)';
              if (isSelected) borderColor = colors.primary;
              if (showCorrect) borderColor = '#10b981';
              if (showWrong) borderColor = '#ef4444';

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  style={{
                    padding: '16px 20px', borderRadius: '12px', border: `1px solid ${borderColor}`, textAlign: 'left', cursor: showResult ? 'default' : 'pointer', transition: '0.2s', backgroundColor: isSelected ? 'rgba(34, 211, 238, 0.05)' : 'transparent', color: isSelected ? '#fff' : colors.text, display: 'flex', alignItems: 'center', gap: '12px'
                  }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${borderColor}`, backgroundColor: (isSelected || showCorrect) ? borderColor : 'transparent' }}></div>
                  {option}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(34, 211, 238, 0.05)', border: `1px solid ${colors.primary}44`, marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: colors.primary, marginBottom: '4px' }}>PHÂN TÍCH DỮ LIỆU:</p>
              <p style={{ fontSize: '13px', lineHeight: '1.6' }}>{currentQuestion?.explanation}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={handleRestart} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#475569', cursor: 'pointer', fontWeight: 'bold' }}>THOÁT</button>

            {!showResult ? (
              <button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', backgroundColor: colors.primary, color: colors.bg, fontWeight: 900, cursor: 'pointer', opacity: selectedAnswer === null ? 0.3 : 1 }}>KIỂM TRA ĐÁP ÁN</button>
            ) : (
              <button onClick={handleNextQuestion} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`, color: colors.bg, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentQuestionIndex < currentQuestions.length - 1 ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ'} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}