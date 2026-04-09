// import { useState, useEffect, useCallback } from 'react';
// import { courseService, Course } from '../services/courseService';
// import { enrollmentService } from '../services/enrollmentService';
// import { toast } from 'sonner';

// export const useCourseController = (user: any) => {
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchCourses = useCallback(async () => {
//     if (!user?.id) return;
//     try {
//       setLoading(true);
//       const data = await courseService.getAllWithStatus(user.id);
//       setCourses(data);
//     } catch (err: any) {
//       toast.error('Lỗi tải danh sách: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     fetchCourses();
//   }, [fetchCourses]);

//   const handleEnrollClick = async (courseId: number) => {
//     if (!user?.id) return toast.error('Vui lòng đăng nhập!');
//     try {
//       await enrollmentService.enrollUser(user.id, courseId);
//       toast.success('🎉 Đăng ký thành công!');
//       await fetchCourses(); // Tải lại để cập nhật nút bấm
//     } catch (err: any) {
//       toast.error('Đăng ký thất bại: ' + err.message);
//     }
//   };

//   return { courses, loading, handleEnrollClick };
// };