import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalCompleted: number;
  completionRate: number;
  courseData: any[];
}

export const statsService = {
  // Hàm 1: Thống kê tổng quan và tất cả khóa học
  async getAdminDashboardStats(): Promise<DashboardStats> {
    const { data: allCourses } = await supabase.from('courses').select('*');
    const { count: totalStudents } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
    const { data: enrollments } = await supabase.from('course_enrollments').select('*, users!inner(role)').eq('users.role', 'student');

    const completedEnrollments = enrollments?.filter(e => e.progress === 100) || [];
    
    return {
      totalCourses: allCourses?.length || 0,
      totalStudents: totalStudents || 0,
      totalCompleted: completedEnrollments.length,
      completionRate: totalStudents ? Math.round((completedEnrollments.length / totalStudents) * 100) : 0,
      courseData: allCourses || []
    };
  },

  // Hàm 2: Lấy danh sách chi tiết User (Cái mày đang bị thiếu nè)
  async getDetailedUserStats() {
    const { data, error } = await supabase
      .from('users')
      .select(`id, name, email, xp, level, created_at, role, course_enrollments(progress)`)
      .eq('role', 'student');

    if (error) throw error;
    return data.map(u => ({
      ...u,
      total_courses: u.course_enrollments?.length || 0,
      completed_courses: u.course_enrollments?.filter((e: any) => e.progress === 100).length || 0
    }));
  },

  // Hàm 3: Giả lập dữ liệu traffic cho biểu đồ
  async getTrafficStats(startDate: Date, endDate: Date) {
    const days = [];
    let curr = new Date(startDate);
    while (curr <= endDate) {
      days.push({
        date: curr.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        views: Math.floor(Math.random() * 800) + 200
      });
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  }
};