// import { supabase } from '../lib/supabase';

// export interface Course {
//   id: number;
//   title: string;
//   description: string;
//   category: string;
//   level: string;
//   image_url?: string;
//   enrolled: boolean;
//   progress: number;
//   thumbnail: string;
//   rating: number;
//   students_enrolled: number;
//   total_lessons: number;
//   duration: string;
// }

// export const courseService = {
//   async getAllWithStatus(userId: string): Promise<Course[]> {
//     // Lấy danh sách khóa học
//     const { data: courses, error: cError } = await supabase
//       .from('courses')
//       .select('*')
//       .order('id', { ascending: true });

//     if (cError) throw cError;

//     // Lấy danh sách đã đăng ký của User
//     const { data: enrolls, error: eError } = await supabase
//       .from('course_enrollments')
//       .select('course_id, progress')
//       .eq('user_id', userId);

//     if (eError) throw eError;

//     // Trộn dữ liệu
//     return (courses || []).map(course => {
//       const match = enrolls?.find(e => e.course_id === course.id);
//       return {
//         ...course,
//         enrolled: !!match,
//         progress: match?.progress || 0
//       };
//     }) as Course[];
//   }
// };
import { supabase } from '../lib/supabase';

// --- 1. INTERFACES CHUẨN KHÍT DATABASE ---
export interface Course {
  id: number;
  title: string;
  description: string;
  instructor?: string;
  category: string;
  level: string;
  duration: string;
  total_lessons: number;
  estimated_hours?: number;
  thumbnail: string;
  video_intro?: string;
  skills?: any; // jsonb
  prerequisites?: any; // jsonb
  difficulty: number; // Trong DB của mày là int4 (1, 2, 3...)
  students_enrolled: number;
  rating: number;
  total_reviews?: number;
  is_published: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  enrolled?: boolean; 
  progress?: number;  
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order_num: number;
  total_lessons?: number;
  estimated_hours?: number;
  is_active: boolean;
  created_at?: string;
}

export interface Lesson {
  id: number;
  module_id: number;
  course_id: number;
  title: string;
  duration?: string;
  order_num: number;
  content: string;
  code_example?: string;
  video_url?: string;
  attachments?: any; // jsonb
  quiz?: any; // Dữ liệu câu hỏi (jsonb)
  xp_reward: number;
  is_active: boolean;
  created_at?: string;
}

// --- 2. TỔNG HỢP SERVICE ---
export const courseService = {
  // === KHÓA HỌC (COURSES) ===
  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase.from('courses').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data as Course[];
  },

  async getAllWithStatus(userId: string): Promise<Course[]> {
    const { data: courses, error: cError } = await supabase.from('courses').select('*').order('id', { ascending: true });
    if (cError) throw cError;
    const { data: enrolls, error: eError } = await supabase.from('course_enrollments').select('course_id, progress').eq('user_id', userId);
    if (eError) throw eError;
    return (courses || []).map(course => {
      const match = enrolls?.find(e => e.course_id === course.id);
      return { ...course, enrolled: !!match, progress: match?.progress || 0 };
    }) as Course[];
  },

async createCourse(courseData: Partial<Course>) {
    const payload = {
      // Những cái NOT NULL thì mình gán mặc định ở đây
      level: "Cơ bản",
      duration: "0 giờ",
      thumbnail: "https://placehold.co/600x400/0f172a/22d3ee?text=DevMentor+AI",
      difficulty: 1, 
      total_lessons: 0,
      students_enrolled: 0,
      rating: 5,
      is_active: true,
      is_published: false,
      // Những cái mày nhập từ Form sẽ đè lên các giá trị trên
      ...courseData
    };

    const { data, error } = await supabase.from('courses').insert([payload]).select();
    if (error) throw error;
    return data[0];
  },

async updateCourse(id: number, updates: any) {
    const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  async deleteCourse(id: number) {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // === CHƯƠNG HỌC (MODULES) ===
  async getModulesByCourse(courseId: number) {
    const { data, error } = await supabase.from("modules").select("*").eq("course_id", courseId).order("order_num", { ascending: true });
    if (error) throw error;
    return data as Module[];
  },

  async createModule(moduleData: Partial<Module>) {
    const payload = { is_active: true, ...moduleData };
    const { data, error } = await supabase.from("modules").insert([payload]).select();
    if (error) throw error;
    return data[0] as Module;
  },

  // === BÀI HỌC (LESSONS) ===
  async getLessonsByModule(moduleId: number) {
    const { data, error } = await supabase.from("lessons").select("*").eq("module_id", moduleId).order("order_num", { ascending: true });
    if (error) throw error;
    return data as Lesson[];
  },

  async createLesson(lessonData: Partial<Lesson>) {
    const payload = {
      xp_reward: 30,
      is_active: true,
      content: "",
      ...lessonData
    };
    const { data, error } = await supabase.from("lessons").insert([payload]).select();
    if (error) throw error;
    return data[0] as Lesson;
  },

  async updateLesson(id: number, updates: Partial<Lesson>) {
    const { data, error } = await supabase.from("lessons").update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  }
};

// Export thêm alias để các file cũ không bị lỗi import
export const curriculumService = courseService;