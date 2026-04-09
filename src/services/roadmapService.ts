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
  }
};