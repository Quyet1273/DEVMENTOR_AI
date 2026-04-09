import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mic,
  MicOff,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  ChevronRight,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
  goodAnswer: string;
}

interface Answer {
  questionId: string;
  question: string;
  answer: string;
  rating: number;
  feedback: string;
}

export function MockInterview() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // --- HỆ THỐNG MÀU HUD (Đã thêm màu Error để fix lỗi báo đỏ) ---
  const colors = {
    bg: '#020617',
    card: '#0f172a',
    primary: '#22d3ee', // Cyan
    secondary: '#a855f7', // Purple
    text: '#d1d5db',
    border: 'rgba(168, 85, 247, 0.2)',
    error: '#ef4444' // Màu đỏ cho lỗi và khi ghi âm
  };

  const roles = [
    {
      id: 'frontend',
      name: 'Frontend Developer',
      icon: '💻',
      description: 'HTML, CSS, JavaScript, React',
    },
    {
      id: 'backend',
      name: 'Backend Developer',
      icon: '⚙️',
      description: 'Node.js, APIs, Databases',
    },
    {
      id: 'fullstack',
      name: 'Fullstack Developer',
      icon: '🚀',
      description: 'Frontend + Backend',
    },
  ];

  const interviewQuestions: Record<string, InterviewQuestion[]> = {
    frontend: [
      {
        id: 'fe-1',
        question: 'Giới thiệu bản thân và kinh nghiệm Frontend của bạn?',
        category: 'General',
        difficulty: 'easy',
        hints: ['Tên, học vấn', 'Kinh nghiệm với HTML/CSS/JS', 'Dự án đã làm'],
        goodAnswer:
          'Câu trả lời tốt nên bao gồm: giới thiệu ngắn gọn, highlight các công nghệ đã sử dụng, và 1-2 dự án cụ thể.',
      },
      {
        id: 'fe-2',
        question: 'Bạn hiểu gì về Virtual DOM trong React?',
        category: 'Technical',
        difficulty: 'medium',
        hints: [
          'So sánh với Real DOM',
          'Lợi ích về performance',
          'Reconciliation process',
        ],
        goodAnswer:
          'Virtual DOM là bản copy của Real DOM, React dùng diffing algorithm để chỉ update những phần thay đổi, giúp tối ưu performance.',
      },
      {
        id: 'fe-3',
        question: 'Làm thế nào để tối ưu performance của một React app?',
        category: 'Technical',
        difficulty: 'hard',
        hints: [
          'Code splitting',
          'Lazy loading',
          'Memoization',
          'Avoid unnecessary re-renders',
        ],
        goodAnswer:
          'Sử dụng React.memo, useMemo, useCallback, code splitting với React.lazy, tối ưu images, avoid inline functions trong render.',
      },
      {
        id: 'fe-4',
        question: 'Bạn debug lỗi trong code như thế nào?',
        category: 'Problem Solving',
        difficulty: 'medium',
        hints: ['Console.log', 'Browser DevTools', 'React DevTools', 'Systematic approach'],
        goodAnswer:
          'Sử dụng console.log, breakpoints trong DevTools, React DevTools để inspect state/props, đọc error messages cẩn thận.',
      },
      {
        id: 'fe-5',
        question: 'Tại sao bạn muốn làm việc tại công ty chúng tôi?',
        category: 'Behavioral',
        difficulty: 'medium',
        hints: ['Research về công ty', 'Align với goals', 'Cơ hội học hỏi'],
        goodAnswer:
          'Thể hiện sự tìm hiểu về công ty, align với văn hóa và giá trị, nhấn mạnh cơ hội phát triển và đóng góp.',
      },
    ],
    backend: [
      {
        id: 'be-1',
        question: 'Giới thiệu bản thân và kinh nghiệm Backend của bạn?',
        category: 'General',
        difficulty: 'easy',
        hints: ['Tên, học vấn', 'Kinh nghiệm với Node.js/APIs', 'Dự án đã làm'],
        goodAnswer:
          'Giới thiệu về background, công nghệ backend đã sử dụng, và dự án liên quan đến APIs/databases.',
      },
      {
        id: 'be-2',
        question: 'RESTful API là gì và các HTTP methods chính?',
        category: 'Technical',
        difficulty: 'medium',
        hints: ['GET, POST, PUT, DELETE', 'Stateless', 'Resource-based URLs'],
        goodAnswer:
          'REST là architectural style cho APIs. GET (đọc), POST (tạo), PUT (update), DELETE (xóa). Stateless và resource-based.',
      },
      {
        id: 'be-3',
        question: 'Làm thế nào để secure một API?',
        category: 'Technical',
        difficulty: 'hard',
        hints: ['Authentication', 'Authorization', 'Rate limiting', 'Input validation'],
        goodAnswer:
          'Sử dụng JWT/OAuth, HTTPS, input validation, rate limiting, CORS configuration, SQL injection prevention.',
      },
    ],
    fullstack: [
      {
        id: 'fs-1',
        question: 'Giới thiệu bản thân và kinh nghiệm Fullstack của bạn?',
        category: 'General',
        difficulty: 'easy',
        hints: ['Tên, học vấn', 'Kinh nghiệm Frontend + Backend', 'Full project'],
        goodAnswer:
          'Thể hiện kinh nghiệm cả frontend và backend, nhấn mạnh dự án fullstack hoàn chỉnh.',
      },
      {
        id: 'fs-2',
        question: 'Giải thích kiến trúc của một web application fullstack?',
        category: 'Technical',
        difficulty: 'medium',
        hints: ['Client-side', 'Server-side', 'Database', 'Communication'],
        goodAnswer:
          'Frontend (React/UI), Backend (Node.js/APIs), Database (SQL/NoSQL), RESTful/GraphQL communication.',
      },
    ],
  };

  const currentQuestions = selectedRole ? interviewQuestions[selectedRole] || [] : [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleStartInterview = (roleId: string) => {
    setSelectedRole(roleId);
    setIsInterviewActive(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setInterviewCompleted(false);
    toast.success('Phỏng vấn bắt đầu!');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info('🎤 Bắt đầu ghi âm... (Giả lập)');
    } else {
      toast.info('⏸️ Dừng ghi âm');
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) {
      toast.error('Vui lòng nhập câu trả lời');
      return;
    }

    const wordCount = currentAnswer.trim().split(/\s+/).length;
    let rating = 3;
    let feedback = '';

    if (wordCount < 20) {
      rating = 2;
      feedback = 'Câu trả lời hơi ngắn. Hãy cung cấp thêm chi tiết và ví dụ thực tế.';
    } else if (wordCount < 50) {
      rating = 3;
      feedback = 'Câu trả lời ổn. Bạn có thể cải thiện bằng cách thêm ví dụ thực tế.';
    } else if (wordCount < 100) {
      rating = 4;
      feedback = 'Câu trả lời tốt! Bạn đã giải thích khá chi tiết.';
    } else {
      rating = 5;
      feedback = 'Xuất sắc! Câu trả lời chi tiết và thể hiện hiểu biết sâu.';
    }

    const answer: Answer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer: currentAnswer,
      rating,
      feedback,
    };

    setAnswers((prev) => [...prev, answer]);
    setCurrentAnswer('');

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setInterviewCompleted(true);
      setIsInterviewActive(false);
    }
  };

  const handleRestart = () => {
    setSelectedRole(null);
    setIsInterviewActive(false);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setAnswers([]);
    setInterviewCompleted(false);
  };

  const averageRating = answers.length > 0 ? answers.reduce((sum, a) => sum + a.rating, 0) / answers.length : 0;

  // --- RENDERING ---

  if (interviewCompleted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.bg, padding: '40px', fontFamily: 'monospace', color: colors.text }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(34, 211, 238, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: `1px solid ${colors.primary}` }}>
              <CheckCircle2 size={40} color={colors.primary} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>HOÀN THÀNH PHỎNG VẤN</h2>
          </div>

          <div style={{ backgroundColor: colors.card, border: `2px solid ${colors.primary}`, borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: colors.primary, marginBottom: '8px' }}>DIỂM TRUNG BÌNH</p>
            <p style={{ fontSize: '48px', fontWeight: 900, margin: 0, color: '#fff' }}>{averageRating.toFixed(1)}/5.0</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {answers.map((ans, idx) => (
              <div key={idx} style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ color: colors.primary, marginBottom: '12px' }}>Câu {idx + 1}: {ans.question}</h4>
                <p style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '16px', color: '#94a3b8' }}>"{ans.answer}"</p>
                <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 'bold', color: colors.secondary }}>NHẬN XÉT:</p>
                  <p style={{ fontSize: '13px' }}>{ans.feedback}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={handleRestart} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.primary}`, backgroundColor: colors.card, color: '#fff', fontWeight: 900, cursor: 'pointer', marginTop: '32px' }}>LUYỆN TẬP LẠI</button>
        </div>
      </div>
    );
  }

  if (!isInterviewActive) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.bg, padding: '40px', fontFamily: 'monospace', color: colors.text }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ borderLeft: `4px solid ${colors.primary}`, paddingLeft: '20px', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#fff' }}>MOCK <span style={{ color: colors.primary }}>INTERVIEW</span></h1>
            <p style={{ color: '#475569', fontSize: '12px' }}>HỆ THỐNG GIẢ LẬP PHỎNG VẤN V1.0</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {roles.map((role) => (
              <button key={role.id} onClick={() => handleStartInterview(role.id)} style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '32px', textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{role.icon}</div>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{role.name}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 20px' }}>{role.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.primary, fontSize: '11px', fontWeight: 900 }}>BẮT ĐẦU <Play size={14} /></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg, padding: '40px', fontFamily: 'monospace', color: colors.text }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: isRecording ? colors.error : colors.primary, fontWeight: 'bold', marginBottom: '8px' }}>
            <span>CÂU {currentQuestionIndex + 1} / {currentQuestions.length}</span>
            <span>{isRecording ? '• RECORDING...' : 'SYSTEM READY'}</span>
          </div>
          <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`, backgroundColor: colors.primary, boxShadow: `0 0 10px ${colors.primary}` }} />
          </div>
        </div>

        <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '40px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <span style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: 'rgba(34, 211, 238, 0.1)', color: colors.primary, fontSize: '10px', fontWeight: 'bold' }}>{currentQuestion?.category.toUpperCase()}</span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: '24px', lineHeight: '1.5' }}>{currentQuestion?.question}</h2>

          <div style={{ backgroundColor: 'rgba(250, 204, 21, 0.03)', border: '1px solid rgba(250, 204, 21, 0.1)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#facc15', marginBottom: '4px' }}>GỢI Ý:</p>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#a1a1aa' }}>
              {currentQuestion?.hints.map((hint, i) => <li key={i}>{hint}</li>)}
            </ul>
          </div>

          <textarea value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Nhập câu trả lời..." style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', color: '#fff', outline: 'none', resize: 'none', minHeight: '150px', marginBottom: '24px' }} />

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={toggleRecording} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: isRecording ? colors.error : '#fff', cursor: 'pointer' }}>
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />} {isRecording ? 'STOP' : 'REC'}
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={handleRestart} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}>ABORT</button>
            <button onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: colors.primary, color: colors.bg, fontWeight: 900, cursor: 'pointer', opacity: !currentAnswer.trim() ? 0.3 : 1 }}>
              {currentQuestionIndex < currentQuestions.length - 1 ? 'NEXT' : 'FINISH'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}