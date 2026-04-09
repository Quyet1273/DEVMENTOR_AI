import { supabase } from '../lib/supabase';
import { generateAIRoadmap } from './aiService';

export const enrollmentService = {
  async enrollWithAI(userId: string, course: any) {
    try {
      // 1. Đăng ký khóa học
      const { data: enrollment, error: enrollErr } = await supabase
        .from('course_enrollments')
        .insert([{ user_id: userId, course_id: course.id, progress: 0, is_completed: false }])
        .select().single();
      if (enrollErr) throw enrollErr;

      // 2. Lấy nguyên liệu cho AI
      const [lessonsRes, userRes] = await Promise.all([
        supabase.from('lessons').select('id, title').eq('course_id', course.id),
        supabase.from('users').select('current_level, goals').eq('id', userId).single()
      ]);

      if (lessonsRes.error || userRes.error) throw new Error("Không lấy được data bài học");

      // 3. Gọi AI tạo Roadmap
      const aiPlan = await generateAIRoadmap(course.title, userRes.data, lessonsRes.data);

      // 4. Lưu Roadmap vào DB
      const { data: roadmap, error: rdErr } = await supabase
        .from('ai_roadmaps')
        .insert({ user_id: userId, course_id: course.id, ai_summary: aiPlan.ai_summary })
        .select().single();
      if (rdErr) throw rdErr;

      // 5. Lưu Milestones
      for (const ms of aiPlan.milestones) {
        const { data: milestone, error: msErr } = await supabase
          .from('roadmap_milestones')
          .insert({ roadmap_id: roadmap.id, title: ms.title, description: ms.description, order_index: ms.order_index })
          .select().single();

        if (msErr) throw msErr;

        const mlData = ms.lesson_ids.map((lId: any) => ({
          milestone_id: milestone.id,
          lesson_id: lId,
          ai_note: ms.ai_notes[lId] || ""
        }));
        await supabase.from('milestone_lessons').insert(mlData);
      }

      return { success: true };
    } catch (error) {
      console.error("Lỗi Enrollment:", error);
      throw error;
    }
  }
};