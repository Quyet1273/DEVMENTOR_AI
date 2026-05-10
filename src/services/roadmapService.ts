import { supabase } from '../lib/supabase';

export interface Lesson {
  id: number;
  title: string;
  order_num: number;
}

export interface Module {
  id: number;
  title: string;
  order_num: number;
  lessons: Lesson[];
}

export const roadmapService = {
  async getFullRoadmap(courseId: number): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select(`
        id, 
        title, 
        order_num,
        lessons (
          id, 
          title, 
          order_num
        )
      `)
      .eq('course_id', courseId)
      .order('order_num', { ascending: true });

    if (error) throw error;
    
    return (data || []).map((mod: any) => ({
      ...mod,
      lessons: (mod.lessons || []).sort((a: any, b: any) => a.order_num - b.order_num)
    })) as Module[];
  },
  // Hàm lấy roadmap đã được AI phân tích (có summary và milestones)
  async getAIRoadmap(roadmapId: number) {
    const { data, error } = await supabase
      .from('ai_roadmaps')
      .select(`
        id,
        ai_summary,
        roadmap_milestones (
          id,
          title,
          description,
          order_index,
          milestone_lessons (
            ai_note,
            lessons (
              id,
              title,
              video_url,
              content
            )
          )
        )
      `)
      .eq('id', roadmapId)
      .single();

    if (error) throw error;

    // Chuẩn hóa lại dữ liệu để Frontend dễ map()
    return {
      summary: data.ai_summary,
      milestones: (data.roadmap_milestones || []).sort((a, b) => a.order_index - b.order_index)
    };
  },
};
  export const saveAIRoadmap = async (userId: string, courseId: number, aiData: any) => {
  try {
    // 1. Lưu vào bảng ai_roadmaps để lấy roadmap_id
    const { data: roadmap, error: roadmapError } = await supabase
      .from('ai_roadmaps')
      .insert([{ 
        user_id: userId, 
        course_id: courseId, 
        ai_summary: aiData.ai_summary 
      }])
      .select()
      .single();

    if (roadmapError) throw roadmapError;
    const roadmapId = roadmap.id;

    // 2. Duyệt qua từng Milestone trong JSON của AI
    for (const milestone of aiData.milestones) {
      const { data: createdMilestone, error: milestoneError } = await supabase
        .from('roadmap_milestones')
        .insert([{
          roadmap_id: roadmapId,
          title: milestone.title,
          description: milestone.description,
          order_index: milestone.order_index,
          status: 'pending'
        }])
        .select()
        .single();

      if (milestoneError) throw milestoneError;

      // 3. Lưu các bài học vào bảng trung gian milestone_lessons
      if (milestone.lessons && milestone.lessons.length > 0) {
        const milestoneLessons = milestone.lessons.map((l: any) => ({
          milestone_id: createdMilestone.id,
          lesson_id: l.lesson_id,
          ai_note: l.ai_note
        }));

        const { error: lessonsLinkError } = await supabase
          .from('milestone_lessons')
          .insert(milestoneLessons);

        if (lessonsLinkError) throw lessonsLinkError;
      }
    }

    return { success: true, roadmapId };
  } catch (error: any) {
    console.error("Lỗi lưu lộ trình:", error.message);
    return { success: false, error: error.message };
  }
};