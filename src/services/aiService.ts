import OpenAI from "openai";

// Lấy Key từ file .env (Phải bắt đầu bằng VITE_)
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true // Bắt buộc để chạy trực tiếp trên trình duyệt React
});

/**
 * 1. XỬ LÝ CHATBOX (GPT-3.5-TURBO)
 * Có nhớ lịch sử hội thoại và cá nhân hóa tên người dùng
 */
export const getAIResponse = async (userPrompt: string, history: any[]) => {
  try {
    const messages: any[] = [
      { 
        role: "system", 
        content: `Bạn là DevMentor AI - Trợ lý học lập trình thân thiện. 
        - Luôn gọi người dùng là  hoặc 'Bạn học thân mến'.
        - Trả lời bằng Markdown, bôi đậm các từ khóa quan trọng.
        - Nếu có code, hãy để trong block code tương ứng (ví dụ: \`\`\`javascript).
        - Giọng văn chuyên nghiệp nhưng gần gũi.`
      },
      // Map lịch sử chat từ giao diện sang format OpenAI
      ...history.map(m => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content
      })),
      { role: "user", content: userPrompt }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any,
      temperature: 0.8,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "AI không đưa ra phản hồi, Bạn thử lại nhé!";
  } catch (error: any) {
    console.error("Lỗi OpenAI Chat:", error);
    // Bắt lỗi hết tiền/hết hạn dùng
    if (error.status === 429) {
      return "Bạn ơi, tài khoản OpenAI hết lượt dùng (Quota) rồi, nạp thêm Credit hoặc check lại Key nhé!";
    }
    return `Lỗi hệ thống: ${error.message}`;
  }
};

/**
 * 2. XỬ LÝ TẠO LỘ TRÌNH (JSON MODE)
 * Dùng GPT để phân tích danh sách bài học và chia chặng (Milestones)
 */
export const generateAIRoadmap = async (courseTitle: string, userContext: any, lessons: any[]) => {
  try {
    const simplifiedLessons = lessons.map(l => ({
      id: l.id,
      title: l.title,
      order_num: l.order_num
    }));

    const prompt = `
      Nhiệm vụ: Bạn là chuyên gia sư phạm. Hãy chia danh sách bài học sau thành 3-5 chặng (milestones).
      Khóa học: ${courseTitle}
      Học viên: ${userContext?.name || 'Bạn học'}, Trình độ: ${userContext?.current_level || 'Beginner'}
      Danh sách bài học: ${JSON.stringify(simplifiedLessons)}

      YÊU CẦU TRẢ VỀ ĐỊNH DẠNG JSON DUY NHẤT:
      {
        "ai_summary": "Lời chào và đánh giá lộ trình",
        "milestones": [
          {
            "title": "Tên chặng",
            "description": "Mục tiêu chặng",
            "order_index": 1,
            "lesson_ids": [id_thực_tế],
            "ai_notes": { "id_thực_tế": "Lời khuyên bài học" }
          }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      // GPT-3.5 không hỗ trợ json_object mạnh như GPT-4 nên ta nhắc nó ở prompt
      temperature: 0.3, 
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);

  } catch (error) {
    console.error("Lỗi tạo Roadmap OpenAI:", error);
    return {
      ai_summary: "AI đang bận, Bạn dùng lộ trình mặc định nhé!",
      milestones: []
    };
  }
};