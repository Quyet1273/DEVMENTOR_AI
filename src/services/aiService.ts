
import Groq from "groq-sdk";

// 1. Cấu hình Groq
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * HÀM HỖ TRỢ GỌI API (Internal Helper)
 */
async function callGroq(systemPrompt: string, userPrompt: string, history: any[] = [], isJson: boolean = false) {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: userPrompt },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2048,
      response_format: isJson ? { type: "json_object" } : undefined,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Lỗi AI Service:", error);
    return isJson ? "{}" : "Hệ thống AI đang bận, bạn đợi xíu nhé!";
  }
}
export const getAIResponse = async (userPrompt: string, history: any[]) => {
  try {
    const messages = [
      {
        role: "system",
        content: `Bạn là DevMentor AI - Trợ lý học lập trình thân thiện. 
        - Luôn gọi người dùng là 'Bạn học thân mến'.
        - Trả lời bằng Markdown, bôi đậm các từ khóa quan trọng.
        - Nếu có code, hãy để trong block code tương ứng (ví dụ: \`\`\`javascript).
        - Giọng văn chuyên nghiệp nhưng gần gũi.`,
      },
      ...history.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: userPrompt },
    ];

    // Đổi từ openai sang groq
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Model mạnh nhất hiện tại của Groq
      messages: messages as any,
      temperature: 0.8,
      max_tokens: 1024,
    });

    return (
      response.choices[0]?.message?.content ||
      "AI không đưa ra phản hồi, Bạn thử lại nhé!"
    );
  } catch (error: any) {
    console.error("Lỗi Groq Chat:", error);
    if (error.status === 429) {
      return "Hết lượt dùng (Rate Limit) trên Groq rồi, đợi một chút nhé!";
    }
    return `Lỗi hệ thống: ${error.message}`;
  }
};


/**
 * AI SERVICE - BỘ NÃO CỦA ỨNG DỤNG
 */
export const aiService = {
  
  /**
   * 1. GIA SƯ ĐỒNG HÀNH (Socratic Tutor)
   * Sử dụng: Trong Sidebar trang học tập.
   * Logic: Đọc ai_note và lesson content để giải đáp gợi mở.
   */
  getChatResponse: async (params: {
    userPrompt: string,
    lessonTitle: string,
    lessonContent: string,
    aiNote: string,
    history: any[]
  }) => {
    const systemPrompt = `
      Bạn là DevMentor AI - Trợ lý học lập trình thông minh.
      NGỮ CẢNH BÀI HỌC HIỆN TẠI:
      - Bài học: ${params.lessonTitle}
      - Nội dung: ${params.lessonContent}
      - Ghi chú từ giảng viên (AI Note): ${params.aiNote}

      QUY TẮC:
      1. Socratic Method: Nếu sinh viên hỏi code, hãy gợi ý logic thay vì cho đáp án ngay.
      2. Tập trung: Chỉ trả lời kiến thức liên quan bài học hoặc lập trình.
      3. Thân thiện: Gọi sinh viên là "Bạn học thân mến".
      4. Markdown: Trình bày code và từ khóa rõ ràng.
    `;
    return await callGroq(systemPrompt, params.userPrompt, params.history);
  },

  /**
   * 2. TÓM TẮT BÀI HỌC (Smart Summary)
   * Sử dụng: Giúp sinh viên ôn tập nhanh ý chính.
   */
  summarizeLesson: async (lessonContent: string) => {
    const systemPrompt = `
      Bạn là chuyên gia tóm tắt bài giảng. 
      Nhiệm vụ: Trích xuất 3-5 ý chính quan trọng nhất từ nội dung bài học.
      Yêu cầu: Ngắn gọn, súc tích, định dạng gạch đầu dòng Markdown.
    `;
    return await callGroq(systemPrompt, lessonContent, []);
  },

  /**
   * 3. TẠO CÂU HỎI LUYỆN TẬP (Quiz Generator)
   * Sử dụng: Tự động tạo bài tập dựa trên bài vừa học.
   */
  generateQuiz: async (lessonContent: string) => {
    const systemPrompt = `
      Bạn là chuyên gia khảo thí. Dựa trên nội dung bài học, hãy tạo 1 câu hỏi trắc nghiệm.
      Trả về định dạng JSON duy nhất như sau:
      {
        "question": "Câu hỏi là gì?",
        "options": ["A", "B", "C", "D"],
        "answer": "Đáp án đúng",
        "explanation": "Giải thích tại sao đúng"
      }
    `;
    const response = await callGroq(systemPrompt, lessonContent, [], true);
    return JSON.parse(response);
  },

  /**
   * 4. LỜI CHÀO CHỦ ĐỘNG (Dashboard Greeting)
   * Sử dụng: Hiển thị ở trang chủ để khích lệ sinh viên.
   */
  getDashboardGreeting: async (userName: string, progress: number, lastLesson: string) => {
    const systemPrompt = `
      Bạn là người bạn đồng hành cổ vũ sinh viên.
      Thông tin: Sinh viên ${userName}, đã hoàn thành ${progress}% lộ trình, bài cuối là "${lastLesson}".
      Nhiệm vụ: Viết 1 câu chào mừng cực kỳ ngắn gọn (dưới 30 từ), mang tính động viên hoặc hài hước.
    `;
    return await callGroq(systemPrompt, "Hãy chào mình!", []);
  },

  /**
   * 5. GỢI Ý KHI BẾ TẮC (Stuck Intervention)
   * Sử dụng: Khi sinh viên làm sai Quiz nhiều lần hoặc ở lại bài quá lâu.
   */
  getStuckHint: async (lessonTitle: string, aiNote: string) => {
    const systemPrompt = `
      Sinh viên đang gặp khó khăn ở bài "${lessonTitle}".
      Ghi chú hỗ trợ: ${aiNote}
      Nhiệm vụ: Đưa ra 1 lời khuyên hoặc 1 mẹo nhỏ để họ vượt qua khó khăn này.
    `;
    return await callGroq(systemPrompt, "Mình đang bí quá, giúp mình với!", []);
  },
  /**
   * 6. LỜI KHUYÊN MỞ ĐẦU BÀI HỌC (Lesson Intro Advice)
   * Sử dụng: Hiển thị trong MentorAdvice Box ngay khi vào trang học.
   */
  getLessonIntro: async (userName: string, lessonTitle: string, userLevel: number) => {
    const systemPrompt = `
      Bạn là DevMentor AI. 
      Nhiệm vụ: Đưa ra 1 lời khuyên ngắn gọn (dưới 25 từ) để khích lệ sinh viên bắt đầu bài học.
      Thông tin: Sinh viên ${userName}, cấp độ ${userLevel}, bài học: "${lessonTitle}".
      Yêu cầu: Câu văn mang tính "đồng hành", chuyên nghiệp và liên quan đến IT.
    `;
    return await callGroq(systemPrompt, "Hãy cho mình một lời khuyên để bắt đầu bài học này!", []);
  },
// Thêm vào aiService.ts
evaluateInterviewAnswer: async (question: string, answer: string, role: string) => {
  const systemPrompt = `
    Bạn là một Senior Technical Interviewer chuyên tuyển dụng vị trí ${role}.
    Nhiệm vụ: Đánh giá câu trả lời phỏng vấn của ứng viên.
    
    Yêu cầu trả về định dạng JSON duy nhất như sau:
    {
      "rating": number (từ 1-5),
      "feedback": "Nhận xét ngắn gọn về ưu/nhược điểm",
      "modelAnswer": "Câu trả lời mẫu tối ưu nhất"
    }
    
    Quy tắc chấm điểm:
    - 1-2: Trả lời sai kiến thức hoặc quá sơ sài.
    - 3-4: Trả lời đúng ý chính nhưng thiếu ví dụ hoặc chưa sâu.
    - 5: Trả lời xuất sắc, đầy đủ kỹ thuật và thực tế.
  `;

  const userPrompt = `Câu hỏi: ${question}\nCâu trả lời của ứng viên: ${answer}`;
  
  // Gọi hàm callGroq đã viết ở các bước trước với tham số isJson = true
  const response = await callGroq(systemPrompt, userPrompt, [], true);
  try {
    return JSON.parse(response);
  } catch (e) {
    return { rating: 3, feedback: "Câu trả lời ổn, cần chi tiết hơn.", modelAnswer: "Chưa có mẫu." };
  }
}
  
};