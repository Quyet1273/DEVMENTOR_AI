import { supabase } from "../lib/supabase";

export const lessonService = {
  // 1. Lấy nội dung chi tiết bài học + Quiz
  async getLessonContent(lessonId: number) {
    const { data, error } = await supabase
      .from("lessons")
      .select(
        `
        *,
        quizzes (
          id,
          title,
          quiz_questions (
            id,
            question_text,
            options,
            correct_option_index,
            explanation
          )
        )
      `,
      )
      .eq("id", lessonId)
      .single();

    if (error) throw error;
    return data;
  },

  // 2. Lấy thông tin khóa học và danh sách bài học (Cho Sidebar)
  async getCourseLessons(courseId: number) {
    const { data: course } = await supabase
      .from("courses")
      .select("title")
      .eq("id", courseId)
      .single();

    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, title, order_num")
      .eq("course_id", courseId)
      .order("order_num", { ascending: true });

    return {
      title: course?.title || "Khóa học",
      lessons: lessons || [],
    };
  },

  // 3. Lấy bài học cần học tiếp theo
 // HÀM QUAN TRỌNG ĐỂ KHÔNG BỊ QUAY LẠI BÀI 1
async getContinueLesson(userId: string, courseId: number) {
  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      lesson_id,
      lessons!inner(course_id)
    `)
    .eq('user_id', userId)
    .eq('lessons.course_id', courseId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0].lesson_id;
},

  // 4. Đồng bộ vị trí học khi click chọn bài trên Sidebar
  async syncCurrentLocation(
    userId: string,
    courseId: number,
    lessonId: number,
  ) {
    await supabase
      .from("course_enrollments")
      .update({ current_lesson_id: lessonId })
      .eq("user_id", userId)
      .eq("course_id", courseId);
  },

  // 5. Hoàn thành bài, cộng XP & Level
async completeLesson(userId: string, lessonId: number, earnedXp: number = 0, isPass: boolean = true) {
  try {
    // 1. Update bảng users (XP tổng)
    const { data: user } = await supabase.from('users').select('xp').eq('id', userId).single();
    const newXp = (user?.xp || 0) + earnedXp;
    await supabase.from('users').update({ xp: newXp, level: Math.floor(newXp / 1000) + 1 }).eq('id', userId);

    // 2. Update bảng user_progress (Lưu tiến độ bài học)
    // Dùng upsert để nếu học lại bài đó thì nó chỉ cập nhật thời gian hoàn thành
    await supabase.from('user_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: new Date().toISOString(),
      xp_earned: earnedXp
    }, { onConflict: 'user_id,lesson_id' });

    // 3. Update bảng quiz_attempts (Lịch sử làm quiz)
    if (earnedXp > 0) {
      await supabase.from('quiz_attempts').insert({
        user_id: userId,
        lesson_id: lessonId,
        xp_awarded: earnedXp, // Đúng tên cột trong ảnh của mày
        is_correct: isPass,
        attempt_number: 1,
        time_spent: 0,
        selected_answer: 0, 
        correct_answer: 0
      });
    }
    return { success: true };
  } catch (e) {
    console.error("Lỗi lưu:", e);
    return { success: false };
  }
},


};
