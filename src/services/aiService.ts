import Groq from "groq-sdk";

// Khởi tạo Groq
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});
export const aiService = {
  /**
   * 1. XỬ LÝ CHATBOX (Hàm cũ của ông)
   */
  getAIResponse: async (userPrompt: string, history: any[] = []) => {
    try {
      const messages = [
        {
          role: "system",
          content: `Bạn là DevMentor AI - Trợ lý học lập trình thân thiện.
          - Luôn gọi người dùng là 'Bạn học thân mến'.
          - Trả lời bằng Markdown, bôi đậm các từ khóa quan trọng.
          - Nếu có code, hãy để trong block code tương ứng.`,
        },
        ...history.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
        { role: "user", content: userPrompt },
      ];

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages as any,
        temperature: 0.8,
        max_tokens: 1024,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Lỗi AI Chat:", error);
      return "Có lỗi rồi bạn học ơi, thử lại sau nhé!";
    }
  },

  /**
   * 2. SOẠN BÀI GIẢNG CHI TIẾT (Hàm mới để phục vụ Bulk Generate)
   */
 generateLessonContent: async (lessonTitle: string, courseTitle: string) => {
  try {
    const prompt = `
      Bạn là chuyên gia đào tạo lập trình. Hãy soạn bài giảng chi tiết.
      Khóa học: ${courseTitle}
      Bài học: ${lessonTitle}

      YÊU CẦU BẮT BUỘC:
      1. Trả về DUY NHẤT một đối tượng JSON hợp lệ.
      2. KHÔNG được có văn bản thừa bên ngoài khối JSON.
      3. Cấu trúc JSON phải chính xác như sau:
      {
        "content": "Nội dung bài giảng chi tiết bằng Markdown...",
        "code_example": "Ví dụ code minh họa..."
      }
      4. Trong phần "content", hãy dùng các thẻ H2, H3, và các icon 💡, 🚀 để bài giảng sinh động.
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: "Bạn là một máy chủ trả về dữ liệu dưới dạng JSON thuần túy. Không giải thích, không chào hỏi." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Giảm temperature xuống để AI ít "sáng tạo" lung tung làm hỏng JSON
      response_format: { type: "json_object" }
    });

    const resContent = response.choices[0]?.message?.content;
    
    if (!resContent) return null;

    // Parse thử, nếu lỗi thì bắt lỗi để không làm sập app
    try {
      return JSON.parse(resContent);
    } catch (parseError) {
      console.error("Lỗi parse JSON từ AI:", resContent);
      return null;
    }
  } catch (error) {
    console.error("Lỗi gọi API Groq:", error);
    return null;
  }
}
};

export default aiService;

/**
 * 1. XỬ LÝ CHATBOX
 * Đã chuyển sang model Llama 3 và cập nhật biến gọi chuẩn
 */
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
 * 2. XỬ LÝ TẠO LỘ TRÌNH (JSON MODE)
 */
export const generateAIRoadmap = async (
  courseTitle: string,
  userContext: any,
  lessons: any[],
) => {
  try {
    const simplifiedLessons = lessons.map((l) => ({
      id: l.id,
      title: l.title,
      order_num: l.order_num,
    }));

    const prompt = `
      Nhiệm vụ: Bạn là chuyên gia sư phạm. Hãy chia danh sách bài học sau thành 3-5 chặng (milestones).
      Khóa học: ${courseTitle}
      Học viên: ${userContext?.full_name} , Trình độ: ${userContext?.current_level || "Beginner"}
      Danh sách bài học: ${JSON.stringify(simplifiedLessons)}

      YÊU CẦU TRẢ VỀ ĐỊNH DẠNG JSON DUY NHẤT:
      {
        "ai_summary": "Lời chào và đánh giá lộ trình",
        "milestones": [
          {
            "title": "Tên chặng",
            "description": "Mục tiêu chặng",
            "order_index": 1,
            "lessons": [
              { 
                "lesson_id": ID_thực_tế, 
                "ai_note": "Lời khuyên cho bài này" 
              }
            ]
          }
        ]
      }
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      // Groq hỗ trợ JSON Mode rất tốt
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Lỗi tạo Roadmap Groq:", error);
    return {
      ai_summary: "AI đang bận, Bạn dùng lộ trình mặc định nhé!",
      milestones: [],
    };
  }
};
/**
 * 3. TẠO NỘI DUNG BÀI HỌC TỰ ĐỘNG
 */
export const generateLessonContent = async (
  lessonTitle: string,
  courseTitle: string,
) => {
  try {
    const prompt = `
      Bạn là giảng viên chuyên nghiệp. Hãy viết nội dung chi tiết cho bài học: "${lessonTitle}" 
      thuộc khóa học: "${courseTitle}".
      
      Yêu cầu trả về định dạng JSON duy nhất:
      {
        "content": "Nội dung bài học bằng Markdown (có lý thuyết, giải thích chi tiết)",
        "code_example": "Ví dụ code minh họa chi tiết (nếu có)",
        "summary": "Tóm tắt bài học trong 3 câu"
      }
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("Lỗi tạo nội dung bài học:", error);
    return null;
  }
};
