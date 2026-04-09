import Groq from "groq-sdk";

// Khởi tạo Groq
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

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
        - Giọng văn chuyên nghiệp nhưng gần gũi.`
      },
      ...history.map(m => ({
        role: (m.role === 'user' ? 'user' : 'assistant'),
        content: m.content
      })),
      { role: "user", content: userPrompt }
    ];

    // Đổi từ openai sang groq
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Model mạnh nhất hiện tại của Groq
      messages: messages as any,
      temperature: 0.8,
      max_tokens: 1024,
    });

    return response.choices[0]?.message?.content || "AI không đưa ra phản hồi, Bạn thử lại nhé!";
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
      Học viên: , Trình độ: ${userContext?.current_level || 'Beginner'}
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
      milestones: []
    };
  }
};