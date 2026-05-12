import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { aiService } from '../services/aiService'; // <-- 1. IMPORT SERVICE AI
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
  Activity,
  Loader2 // <-- Dùng cho hiệu ứng loading
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
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // --- STATE AI NHẬN XÉT ---
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);

  const errorColor = '#ef4444';

  const roles = [
    { id: 'frontend', name: 'Frontend Developer', icon: '💻', description: 'HTML, CSS, JavaScript, React' },
    { id: 'backend', name: 'Backend Developer', icon: '⚙️', description: 'Node.js, APIs, Databases' },
    { id: 'fullstack', name: 'Fullstack Developer', icon: '🚀', description: 'Frontend + Backend' },
  ];

const interviewQuestions: Record<string, InterviewQuestion[]> = {
  frontend: [
    {
      id: 'fe-1',
      question: 'Giới thiệu bản thân và kinh nghiệm Frontend của bạn?',
      category: 'General',
      difficulty: 'easy',
      hints: ['Tên, học vấn', 'Kinh nghiệm với HTML/CSS/JS', 'Dự án đã làm'],
      goodAnswer: 'Giới thiệu ngắn gọn, highlight công nghệ trọng tâm, và kể về 1 dự án tâm đắc nhất.',
    },
    {
      id: 'fe-2',
      question: 'Bạn hiểu gì về Virtual DOM trong React?',
      category: 'Technical',
      difficulty: 'medium',
      hints: ['So sánh với Real DOM', 'Lợi ích performance', 'Reconciliation process'],
      goodAnswer: 'Virtual DOM là bản copy nhẹ của Real DOM. React dùng thuật toán diffing để chỉ cập nhật những phần thực sự thay đổi, giúp tăng hiệu năng đáng kể.',
    },
    {
      id: 'fe-3',
      question: 'Sự khác biệt giữa Flexbox và CSS Grid là gì?',
      category: 'Technical',
      difficulty: 'easy',
      hints: ['1D vs 2D layout', 'Trường hợp sử dụng', 'Khả năng căn chỉnh'],
      goodAnswer: 'Flexbox là layout 1 chiều (hàng hoặc cột), Grid là layout 2 chiều (cả hàng và cột). Dùng Flexbox cho các component nhỏ, Grid cho cấu trúc trang lớn.',
    },
    {
      id: 'fe-4',
      question: 'React Hooks là gì? Kể tên một số Hooks phổ biến bạn hay dùng?',
      category: 'Technical',
      difficulty: 'medium',
      hints: ['useState, useEffect', 'Quy tắc sử dụng hooks', 'Tại sao dùng hooks thay vì Class Component?'],
      goodAnswer: 'Hooks cho phép dùng state và các tính năng của React trong function component. Phổ biến có useState, useEffect, useContext, useMemo.',
    },
    {
      id: 'fe-5',
      question: 'Làm thế nào để tối ưu performance của một React app?',
      category: 'Performance',
      difficulty: 'hard',
      hints: ['Code splitting', 'Lazy loading', 'Memoization (useMemo, useCallback)', 'Optimize images'],
      goodAnswer: 'Sử dụng React.lazy, React.memo, tối ưu hóa kích thước ảnh, hạn chế re-render thừa bằng useMemo/useCallback và sử dụng pagination cho danh sách lớn.',
    },
    {
      id: 'fe-6',
      question: 'Bạn xử lý bất đồng bộ (Asynchronous) trong Javascript như thế nào?',
      category: 'Technical',
      difficulty: 'medium',
      hints: ['Promises', 'Async/Await', 'Callback hell', 'Error handling'],
      goodAnswer: 'Sử dụng Async/Await kết hợp với Try/Catch để code trông sạch sẽ và dễ xử lý lỗi hơn so với .then() hay callback truyền thống.',
    },
    {
      id: 'fe-7',
      question: 'Redux hoặc Zustand dùng để làm gì? Khi nào thì cần dùng chúng?',
      category: 'State Management',
      difficulty: 'medium',
      hints: ['Global state', 'Prop drilling', 'Dữ liệu dùng chung giữa nhiều trang'],
      goodAnswer: 'Dùng để quản lý trạng thái tập trung. Cần dùng khi app lớn, nhiều component ở xa nhau cần truy cập chung một nguồn dữ liệu mà không muốn truyền props qua nhiều lớp.',
    },
    {
      id: 'fe-8',
      question: 'SEO trong các ứng dụng Single Page App (SPA) được giải quyết như thế nào?',
      category: 'Technical',
      difficulty: 'hard',
      hints: ['Server Side Rendering (SSR)', 'Static Site Generation (SSG)', 'Next.js', 'Meta tags'],
      goodAnswer: 'Sử dụng các framework như Next.js để render phía server (SSR) hoặc tạo trang tĩnh (SSG), giúp crawler của Google đọc được nội dung dễ dàng hơn.',
    },
    {
      id: 'fe-9',
      question: 'Nếu bạn gặp một bug mà không tìm thấy hướng dẫn trên mạng, bạn sẽ làm gì?',
      category: 'Problem Solving',
      difficulty: 'medium',
      hints: ['Debug từng bước', 'Đọc source code', 'Hỏi đồng nghiệp/cộng đồng'],
      goodAnswer: 'Sử dụng debugger/console.log để cô lập lỗi, kiểm tra lại logic đầu vào, đọc kỹ tài liệu chính hãng và cuối cùng là đặt câu hỏi rõ ràng trên các diễn đàn chuyên môn.',
    },
    {
      id: 'fe-10',
      question: 'Tại sao bạn lại chọn theo đuổi mảng Frontend thay vì các mảng khác?',
      category: 'Behavioral',
      difficulty: 'easy',
      hints: ['Sự đam mê với UI/UX', 'Thích nhìn thấy kết quả ngay', 'Sự phát triển của hệ sinh thái JS'],
      goodAnswer: 'Thể hiện niềm đam mê với việc tạo ra trải nghiệm người dùng, khả năng tư duy thẩm mỹ và sự hứng thú với tốc độ phát triển của các công nghệ web hiện đại.',
    },
  ],

  backend: [
    {
      id: 'be-1',
      question: 'Giới thiệu bản thân và kinh nghiệm Backend của bạn?',
      category: 'General',
      difficulty: 'easy',
      hints: ['Ngôn ngữ (Node, Python, Java)', 'Database hay dùng', 'Hệ thống đã xây dựng'],
      goodAnswer: 'Tập trung vào tư duy xử lý dữ liệu, các ngôn ngữ backend đã dùng và cách bạn xây dựng kiến trúc server.',
    },
    {
      id: 'be-2',
      question: 'RESTful API là gì? Các HTTP Methods phổ biến?',
      category: 'Technical',
      difficulty: 'easy',
      hints: ['GET, POST, PUT, DELETE', 'Statelessness', 'Resource-based'],
      goodAnswer: 'REST là kiểu kiến trúc giao tiếp giữa client-server. Các method chính: GET (đọc), POST (tạo), PUT (cập nhật), DELETE (xóa).',
    },
    {
      id: 'be-3',
      question: 'Sự khác biệt giữa SQL và NoSQL là gì?',
      category: 'Database',
      difficulty: 'medium',
      hints: ['Cấu trúc bảng vs Document', 'Scalability', 'Tính nhất quán dữ liệu'],
      goodAnswer: 'SQL có cấu trúc chặt chẽ (bảng), phù hợp dữ liệu quan hệ. NoSQL linh hoạt (document, key-value), phù hợp cho dữ liệu lớn và mở rộng nhanh.',
    },
    {
      id: 'be-4',
      question: 'Authentication và Authorization khác nhau như thế nào?',
      category: 'Security',
      difficulty: 'medium',
      hints: ['Xác thực danh tính', 'Phân quyền truy cập', 'Login vs Permissions'],
      goodAnswer: 'Authentication là xác định "Bạn là ai" (Login). Authorization là xác định "Bạn có quyền làm gì" (Permissions).',
    },
    {
      id: 'be-5',
      question: 'JWT (JSON Web Token) hoạt động như thế nào?',
      category: 'Security',
      difficulty: 'medium',
      hints: ['Header, Payload, Signature', 'Stateless auth', 'Bearer token'],
      goodAnswer: 'Server tạo token mã hóa chứa thông tin user. Client lưu token và gửi kèm mỗi request. Server giải mã để xác thực mà không cần lưu session.',
    },
    {
      id: 'be-6',
      question: 'Middleware trong Express.js dùng để làm gì?',
      category: 'Technical',
      difficulty: 'medium',
      hints: ['Xử lý request trước khi đến route', 'Check auth', 'Logging', 'Error handling'],
      goodAnswer: 'Middleware là các hàm nằm giữa request và response, dùng để thực thi code, thay đổi request/response object hoặc kết thúc vòng đời request.',
    },
    {
      id: 'be-7',
      question: 'Làm thế nào để xử lý đồng thời (Concurrency) trong Node.js?',
      category: 'Technical',
      difficulty: 'hard',
      hints: ['Event Loop', 'Single-threaded', 'Non-blocking I/O', 'Worker threads'],
      goodAnswer: 'Node.js dùng Event Loop và Non-blocking I/O. Với các tác vụ nặng về CPU, có thể dùng Worker Threads hoặc Cluster mode.',
    },
    {
      id: 'be-8',
      question: 'Microservices là gì? So sánh với Monolithic kiến trúc?',
      category: 'Architecture',
      difficulty: 'hard',
      hints: ['Chia nhỏ hệ thống', 'Độc lập triển khai', 'Giao tiếp qua API/Message Queue'],
      goodAnswer: 'Monolith là một khối duy nhất. Microservices chia nhỏ app thành nhiều dịch vụ nhỏ độc lập, dễ mở rộng nhưng quản lý phức tạp hơn.',
    },
    {
      id: 'be-9',
      question: 'Bạn làm gì để bảo mật thông tin nhạy cảm (như password) trong database?',
      category: 'Security',
      difficulty: 'hard',
      hints: ['Hashing', 'Salting', 'Bcrypt/Argon2', 'Không bao giờ lưu text thuần'],
      goodAnswer: 'Sử dụng các thuật toán băm (hashing) mạnh như Bcrypt kèm theo Salt để chống tấn công cầu vồng (Rainbow table).',
    },
    {
      id: 'be-10',
      question: 'Giải thích khái niệm Index trong Database và tại sao nó quan trọng?',
      category: 'Database',
      difficulty: 'medium',
      hints: ['Tốc độ tìm kiếm', 'B-Tree', 'Đánh đổi dung lượng lưu trữ'],
      goodAnswer: 'Index giúp tăng tốc độ truy vấn dữ liệu (như mục lục sách). Tuy nhiên nó sẽ làm chậm quá trình ghi (Insert/Update) và tốn thêm bộ nhớ.',
    },
  ],

  fullstack: [
    {
      id: 'fs-1',
      question: 'Mô tả kiến trúc của một dự án Fullstack bạn từng thực hiện?',
      category: 'General',
      difficulty: 'medium',
      hints: ['Tech stack (MERN, PERN...)', 'Cách giao tiếp FE-BE', 'Deployment'],
      goodAnswer: 'Cần nêu rõ FE dùng gì, BE dùng gì, database nào và cách chúng kết nối qua REST hay GraphQL.',
    },
    {
      id: 'fs-2',
      question: 'CORS là gì và làm thế nào để khắc phục lỗi CORS?',
      category: 'Security',
      difficulty: 'medium',
      hints: ['Cross-Origin Resource Sharing', 'Browser security', 'Access-Control-Allow-Origin'],
      goodAnswer: 'CORS là cơ chế bảo mật của trình duyệt ngăn chặn FE gọi API ở domain khác. Khắc phục bằng cách cấu hình Allow-Origin trên Server.',
    },
    {
      id: 'fs-3',
      question: 'Sự khác biệt giữa Client-side Rendering (CSR) và Server-side Rendering (SSR)?',
      category: 'Architecture',
      difficulty: 'hard',
      hints: ['Performance', 'SEO', 'Next.js vs Plain React'],
      goodAnswer: 'CSR render tại trình duyệt (nhanh sau khi load), SSR render tại server (tốt cho SEO, hiển thị trang đầu nhanh hơn).',
    },
    {
      id: 'fs-4',
      question: 'Làm thế nào để quản lý phiên đăng nhập (Session) trên toàn bộ hệ thống?',
      category: 'Technical',
      difficulty: 'medium',
      hints: ['Cookies vs LocalStorage', 'JWT', 'Refresh Token'],
      goodAnswer: 'Dùng JWT lưu ở Cookie (HttpOnly) để bảo mật, kết hợp Refresh Token để duy trì trạng thái đăng nhập lâu dài.',
    },
    {
      id: 'fs-5',
      question: 'Bạn ưu tiên kiểm thử (Testing) phần nào trước: Frontend hay Backend?',
      category: 'Testing',
      difficulty: 'medium',
      hints: ['Unit test', 'Integration test', 'E2E test'],
      goodAnswer: 'Backend thường được ưu tiên (API/Logic) vì nó là nền tảng. Sau đó là các Unit test cho FE và cuối cùng là E2E test cho luồng chính.',
    },
    {
      id: 'fs-6',
      question: 'Docker dùng để làm gì trong quy trình phát triển Fullstack?',
      category: 'DevOps',
      difficulty: 'hard',
      hints: ['Containerization', 'Nhất quán môi trường', 'Dễ dàng triển khai'],
      goodAnswer: 'Docker đóng gói ứng dụng và môi trường chạy vào container, giúp app chạy giống hệt nhau trên máy dev, staging và production.',
    },
    {
      id: 'fs-7',
      question: 'Làm thế nào để xử lý việc tải ảnh/file lớn từ Frontend lên Backend hiệu quả?',
      category: 'Technical',
      difficulty: 'hard',
      hints: ['Multipart/form-data', 'Cloud storage (S3/Cloudinary)', 'Buffer vs Stream'],
      goodAnswer: 'Frontend gửi qua Form-data, Backend nhận và upload trực tiếp lên Cloud Storage như S3 thay vì lưu trực tiếp vào ổ cứng server.',
    },
    {
      id: 'fs-8',
      question: 'Web Vitals là gì và tại sao một Fullstack dev nên quan tâm?',
      category: 'Performance',
      difficulty: 'hard',
      hints: ['LCP, FID, CLS', 'Trải nghiệm người dùng', 'Xếp hạng Google'],
      goodAnswer: 'Là các chỉ số đo lường tốc độ load, tính tương tác và ổn định thị giác. Ảnh hưởng trực tiếp đến UX và SEO.',
    },
    {
      id: 'fs-9',
      question: 'Bạn xử lý xung đột dữ liệu (Conflict) khi nhiều người cùng sửa một bản ghi như thế nào?',
      category: 'Problem Solving',
      difficulty: 'hard',
      hints: ['Optimistic Locking', 'Pessimistic Locking', 'Last write wins'],
      goodAnswer: 'Có thể dùng Optimistic Locking (dùng version/timestamp) để kiểm tra dữ liệu có bị thay đổi bởi người khác trước khi lưu hay không.',
    },
    {
      id: 'fs-10',
      question: 'Mô tả quy trình CI/CD mà bạn biết hoặc đã từng áp dụng?',
      category: 'DevOps',
      difficulty: 'hard',
      hints: ['Github Actions', 'Tự động test', 'Tự động deploy'],
      goodAnswer: 'Khi push code lên Github, hệ thống tự động chạy test, nếu pass sẽ build docker image và deploy thẳng lên server/cloud.',
    },
  ],
};

  const currentQuestions = selectedRole ? interviewQuestions[selectedRole] || [] : [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // --- LOGIC XỬ LÝ PHỎNG VẤN ---

  const handleStartInterview = (roleId: string) => {
    setSelectedRole(roleId);
    setIsInterviewActive(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setInterviewCompleted(false);
    setShowFeedback(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) toast.info('🎤 Đang ghi âm...');
    else toast.info('⏸️ Dừng ghi âm');
  };

  // --- HÀM QUAN TRỌNG: AI CHẤM ĐIỂM ---
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Vui lòng nhập câu trả lời');
      return;
    }

    setIsEvaluating(true);
    try {
      // Gọi AI thực thụ từ Groq
      const aiResult = await aiService.evaluateInterviewAnswer(
        currentQuestion.question,
        currentAnswer,
        selectedRole || 'Developer'
      );

      setCurrentFeedback(aiResult);
      setShowFeedback(true);

      const answer: Answer = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        answer: currentAnswer,
        rating: aiResult.rating,
        feedback: aiResult.feedback,
      };

      setAnswers((prev) => [...prev, answer]);
    } catch (error) {
      toast.error("Lỗi khi kết nối với AI Mentor");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setCurrentAnswer('');
    setCurrentFeedback(null);

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

  // --- UI RENDER ---

  if (interviewCompleted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.bg, padding: '40px', fontFamily: 'monospace', color: colors.text }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <CheckCircle2 size={60} color={colors.primary} style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontWeight: 900 }}>KẾT QUẢ PHỎNG VẤN</h2>
          </div>
          <div style={{ backgroundColor: colors.card, border: `2px solid ${colors.primary}`, borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: colors.primary }}>ĐIỂM TRUNG BÌNH</p>
            <p style={{ fontSize: '48px', fontWeight: 900 }}>{averageRating.toFixed(1)}/5.0</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {answers.map((ans, idx) => (
              <div key={idx} style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ color: colors.primary }}>Câu {idx + 1}: {ans.question}</h4>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>"{ans.answer}"</p>
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: colors.inputBg, borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 'bold', color: colors.secondary }}>AI NHẬN XÉT (⭐ {ans.rating}/5):</p>
                  <p style={{ fontSize: '13px' }}>{ans.feedback}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleRestart} style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: colors.primary, color: '#fff', fontWeight: 900, marginTop: '32px', cursor: 'pointer', border: 'none' }}>
            THỬ LẠI LẦN NỮA
          </button>
        </div>
      </div>
    );
  }

  if (!isInterviewActive) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.bg, padding: '40px', color: colors.text }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontWeight: 900, marginBottom: '40px' }}>MOCK <span style={{ color: colors.primary }}>INTERVIEW AI</span></h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {roles.map((role) => (
              <button key={role.id} onClick={() => handleStartInterview(role.id)} style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '32px', textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{role.icon}</div>
                <h3 style={{ fontWeight: 'bold' }}>{role.name}</h3>
                <p style={{ fontSize: '12px', opacity: 0.6 }}>{role.description}</p>
                <div style={{ marginTop: '20px', color: colors.primary, fontWeight: 900 }}>BẮT ĐẦU NGAY</div>
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
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: colors.primary, fontWeight: 'bold', marginBottom: '8px' }}>
            <span>CÂU {currentQuestionIndex + 1} / {currentQuestions.length}</span>
            <span>{isRecording ? '• RECORDING...' : 'AI MENTOR READY'}</span>
          </div>
          <div style={{ height: '4px', backgroundColor: colors.inputBg, borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`, backgroundColor: colors.primary }} />
          </div>
        </div>

        {/* Question Card */}
        <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '40px' }}>
          <span style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: `${colors.primary}15`, color: colors.primary, fontSize: '10px', fontWeight: 'bold' }}>
            {currentQuestion?.category.toUpperCase()}
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px', marginBottom: '24px' }}>{currentQuestion?.question}</h2>

          {/* Hint box */}
          <div style={{ backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : '#fefce8', border: `1px solid #fef08a`, borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#eab308' }}>GỢI Ý:</p>
            <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '16px' }}>
              {currentQuestion?.hints.map((hint, i) => <li key={i}>{hint}</li>)}
            </ul>
          </div>

          {/* Text Area */}
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            disabled={showFeedback} // Khóa khi đang xem nhận xét
            placeholder="Gõ hoặc nói câu trả lời của bạn..."
            style={{ width: '100%', backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '12px', padding: '16px', color: colors.text, minHeight: '150px', marginBottom: '24px', outline: 'none' }}
          />

          {/* HIỂN THỊ NHẬN XÉT CỦA AI (MỚI THÊM) */}
          {showFeedback && currentFeedback && (
            <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '16px', backgroundColor: `${colors.primary}10`, border: `1px dashed ${colors.primary}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: colors.primary }}>AI MENTOR FEEDBACK</span>
                <span style={{ fontSize: '14px', fontWeight: 900 }}>⭐ {currentFeedback.rating}/5</span>
              </div>
              <p style={{ fontSize: '13px', marginBottom: '16px' }}>{currentFeedback.feedback}</p>
              <div style={{ padding: '12px', backgroundColor: colors.inputBg, borderRadius: '8px', fontSize: '12px' }}>
                <strong style={{ color: colors.secondary }}>CÂU TRẢ LỜI MẪU:</strong>
                <p style={{ marginTop: '4px', opacity: 0.8 }}>{currentFeedback.modelAnswer}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={toggleRecording} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: `1px solid ${colors.border}`, color: colors.text, cursor: 'pointer' }}>
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />} {isRecording ? 'STOP' : 'REC'}
            </button>

            <div style={{ flex: 1 }} />

            {!showFeedback ? (
              <button 
                onClick={handleSubmitAnswer} 
                disabled={!currentAnswer.trim() || isEvaluating} 
                style={{ padding: '10px 24px', borderRadius: '10px', backgroundColor: colors.primary, color: '#fff', fontWeight: 900, cursor: 'pointer', opacity: isEvaluating ? 0.5 : 1 }}
              >
                {isEvaluating ? <Loader2 className="animate-spin" size={18} /> : 'GỬI & CHẤM ĐIỂM'}
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion} 
                style={{ padding: '10px 24px', borderRadius: '10px', backgroundColor: colors.secondary, color: '#fff', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {currentQuestionIndex < currentQuestions.length - 1 ? 'CÂU TIẾP THEO' : 'XEM TỔNG KẾT'} <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}