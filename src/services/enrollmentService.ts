// import { supabase } from '../lib/supabase';
// import { generateAIRoadmap } from './aiService';

// export const enrollmentService = {
//   async enrollWithAI(userId: string, course: any) {
//     try {
//       // 1. Đăng ký khóa học
//       const { data: enrollment, error: enrollErr } = await supabase
//         .from('course_enrollments')
//         .insert([{ user_id: userId, course_id: course.id, progress: 0, is_completed: false }])
//         .select().single();
//       if (enrollErr) throw enrollErr;

//       // 2. Lấy nguyên liệu cho AI
//       const [lessonsRes, userRes] = await Promise.all([
//         supabase.from('lessons').select('id, title').eq('course_id', course.id),
//         supabase.from('users').select('current_level, goals').eq('id', userId).single()
//       ]);

//       if (lessonsRes.error || userRes.error) throw new Error("Không lấy được data bài học");

//       // 3. Gọi AI tạo Roadmap
//       const aiPlan = await generateAIRoadmap(course.title, userRes.data, lessonsRes.data);

//       // 4. Lưu Roadmap vào DB
//       const { data: roadmap, error: rdErr } = await supabase
//         .from('ai_roadmaps')
//         .insert({ user_id: userId, course_id: course.id, ai_summary: aiPlan.ai_summary })
//         .select().single();
//       if (rdErr) throw rdErr;

//       // 5. Lưu Milestones
//       for (const ms of aiPlan.milestones) {
//         const { data: milestone, error: msErr } = await supabase
//           .from('roadmap_milestones')
//           .insert({ roadmap_id: roadmap.id, title: ms.title, description: ms.description, order_index: ms.order_index })
//           .select().single();

//         if (msErr) throw msErr;

//         const mlData = ms.lesson_ids.map((lId: any) => ({
//           milestone_id: milestone.id,
//           lesson_id: lId,
//           ai_note: ms.ai_notes[lId] || ""
//         }));
//         await supabase.from('milestone_lessons').insert(mlData);
//       }

//       return { success: true };
//     } catch (error) {
//       console.error("Lỗi Enrollment:", error);
//       throw error;
//     }
//   }

// };
import { supabase } from '../lib/supabase';

// Giả lập hàm AI nếu sếp chưa viết xong aiService
const mockGenerateAI = async (title: string) => {
  return {
    ai_summary: `AI đã phân tích khóa học ${title} và tạo lộ trình tối ưu cho trình độ của sếp.`,
    milestones: [
      { title: "Nền tảng & Setup", description: "Chuẩn bị môi trường học tập.", order_index: 0, lesson_ids: [] },
      { title: "Core Logic", description: "Làm chủ kiến thức cốt lõi.", order_index: 1, lesson_ids: [] }
    ]
  };
};

export const enrollmentService = {
  async enrollWithAI(userId: string, course: any) {
    try {
      // 1. Đăng ký khóa học (Cập nhật đúng tên bảng và cột của sếp)
      const { error: enrollErr } = await supabase
        .from('course_enrollments')
        .insert([{ user_id: userId, course_id: course.id, status: 'active' }]);
      
      if (enrollErr && enrollErr.code !== '23505') throw enrollErr;

      // 2. Gọi AI tạo Roadmap (Dùng mock nếu chưa có service thật)
      const aiPlan = await mockGenerateAI(course.title);

      // 3. Lưu vào ai_roadmaps (Theo image_875072.jpg)
      const { data: roadmap, error: rdErr } = await supabase
        .from('ai_roadmaps')
        .insert({ 
          user_id: userId, 
          course_id: course.id, 
          ai_summary: aiPlan.ai_summary,
          is_active: true 
        })
        .select().single();

      if (rdErr) throw rdErr;

      // 4. Lưu Milestones (Theo image_874fd8.jpg)
      if (aiPlan.milestones && aiPlan.milestones.length > 0) {
        const milestonesData = aiPlan.milestones.map((ms: any) => ({
          roadmap_id: roadmap.id,
          title: ms.title,
          description: ms.description,
          order_index: ms.order_index,
          status: 'pending'
        }));

        await supabase.from('roadmap_milestones').insert(milestonesData);
      }

      return { success: true };
    } catch (error) {
      console.error("Lỗi Enrollment:", error);
      throw error;
    }
  }
};