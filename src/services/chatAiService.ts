import { supabase } from '@/lib/supabase'; 

/**
 * 3. LẤY DANH SÁCH CUỘC HỘI THOẠI (CHO SIDEBAR)
 * Lấy các tin nhắn của user, gom nhóm theo conversation_id
 */
export const fetchChatHistoryList = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('conversation_id, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Lọc lấy conversation_id duy nhất và tin nhắn mới nhất làm title
    const uniqueConversations: any[] = [];
    const seenIds = new Set();

    data?.forEach((msg) => {
      if (!seenIds.has(msg.conversation_id)) {
        seenIds.add(msg.conversation_id);
        uniqueConversations.push({
          conversation_id: msg.conversation_id,
          latest_message: msg.content, // Dùng làm tên hiển thị tạm ở Sidebar
          updated_at: msg.created_at
        });
      }
    });

    return uniqueConversations;
  } catch (error: any) {
    console.error("Lỗi lấy danh sách lịch sử:", error.message);
    return [];
  }
};

/**
 * 4. LẤY CHI TIẾT TIN NHẮN TRONG 1 CUỘC HỘI THOẠI
 * Khi click vào 1 item ở Sidebar thì gọi hàm này
 */
export const fetchChatMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }); // Sắp xếp cũ tới mới

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Lỗi lấy chi tiết chat:", error.message);
    return [];
  }
};

/**
 * 5. LƯU TIN NHẮN VÀO SUPABASE (QUAN TRỌNG)
 * Bạn phải gọi hàm này 2 lần trong component Chat của bạn:
 * Lần 1: Lưu câu hỏi của User
 * Lần 2: Lưu câu trả lời của AI (sau khi getAIResponse chạy xong)
 */
export const saveChatMessage = async (messageData: {
  user_id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  ai_model?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([messageData])
      .select();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Lỗi lưu tin nhắn:", error.message);
    return null;
  }
};