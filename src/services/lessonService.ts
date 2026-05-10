import { supabase } from "../lib/supabase";
import { aiService } from "./aiService";

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
// hàm lưu content bài học do AI tạo ra
async updateLessonContent(lessonId: number, content: string, codeExample: string) {
    const { error } = await supabase
      .from('lessons')
      .update({ 
        content: content, 
        code_example: codeExample 
      })
      .eq('id', lessonId);

    if (error) throw error;
    return true;
  },
  bulkGenerateLessons: async (courseId?: string) => {
    try {
      // 1. Tìm các bài học đang bị trống nội dung
      let query = supabase
        .from("lessons")
        .select("id, title, course_id, courses(title)")
        .is("content", null);

      // Nếu truyền courseId thì chỉ xử lý khóa học đó cho nhanh
      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data: emptyLessons, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      if (!emptyLessons || emptyLessons.length === 0) {
        return { success: true, message: "Không có bài học nào cần soạn nội dung!" };
      }

      console.log(`🚀 Mentor AI bắt đầu soạn ${emptyLessons.length} bài học...`);

      // 2. Chạy vòng lặp tuần tự (Sequential) để tránh bị AI khóa (Rate Limit)
      for (const [index, lesson] of emptyLessons.entries()) {
        try {
          console.log(`[${index + 1}/${emptyLessons.length}] Đang soạn: ${lesson.title}`);

          // Gọi AI để lấy nội dung bài giảng
          // Giả sử hàm generateLessonContent của ông nhận (title, courseTitle)
          const aiResult = await aiService.generateLessonContent(
            lesson.title, 
            (lesson.courses as any)?.[0]?.title || ""
          );

          if (aiResult) {
            // 3. Cập nhật thẳng vào Database
            const { error: updateError } = await supabase
              .from("lessons")
              .update({
                content: aiResult.content,
                code_example: aiResult.code_example,
                updated_at: new Date().toISOString()
              })
              .eq("id", lesson.id);

            if (updateError) throw updateError;
            console.log(`✅ Lưu thành công bài: ${lesson.title}`);
          }

          // Nghỉ 2 giây để API AI "thở"
          await new Promise((resolve) => setTimeout(resolve, 2000));

        } catch (lessonError) {
          console.error(`❌ Lỗi tại bài ${lesson.title}:`, lessonError);
          // Gặp lỗi bài này thì bỏ qua làm bài tiếp theo
          continue;
        }
      }

      return { success: true, message: `Đã hoàn thành soạn ${emptyLessons.length} bài học!` };
    } catch (error) {
      console.error("Lỗi Bulk Generate:", error);
      return { success: false, error };
    }
  }


};
