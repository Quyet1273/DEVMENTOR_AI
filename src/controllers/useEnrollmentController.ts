// import { useState } from 'react';
// import { enrollmentService, Enrollment } from '../services/enrollmentService';
// import { toast } from 'sonner';

// export const useEnrollmentController = () => {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   /**
//    * Logic Đăng ký khóa học dứt điểm
//    */
//   const enrollInCourse = async (userId: string, courseId: number): Promise<Enrollment | undefined> => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       // 1. Bước kiểm tra "Gatekeeper": Tránh đăng ký chồng chéo
//       const existing = await enrollmentService.checkEnrollment(userId, courseId);
      
//       if (existing) {
//         toast.info('Ông đã ghi danh khóa này rồi! Vào cày tiếp thôi.');
//         return existing;
//       }

//       // 2. Bước thực hiện: Gọi đúng hàm enrollUser đã thống nhất
//       const data = await enrollmentService.enrollUser(userId, courseId);
      
//       toast.success('🎉 Đăng ký thành công! Lộ trình đã được kích hoạt.');
//       return data;
      
//     } catch (err: any) {
//       const msg = err.message || 'Hệ thống đăng ký đang bận, ông giáo thử lại sau nhé!';
//       setError(msg);
//       toast.error(msg);
//       console.error("Lỗi EnrollmentController:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { enrollInCourse, loading, error };
// };