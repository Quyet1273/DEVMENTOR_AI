// // src/controllers/useRoadmapController.ts
// import { useState, useEffect } from 'react';
// import { roadmapService, Module } from '../services/roadmapService';
// import { enrollmentService, Enrollment } from '../services/enrollmentService';

// export const useRoadmapController = (courseId: number, userId: string | undefined) => {
//   const [modules, setModules] = useState<Module[]>([]);
//   const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
//   const [loading, setLoading] = useState(true);

//   const fetchData = async () => {
//     if (!userId || !courseId) return;
//     try {
//       setLoading(true);
//       // Chạy song song lấy cấu trúc bài học và thông tin đăng ký của user
//       const [roadmapData, enrollData] = await Promise.all([
//         roadmapService.getFullRoadmap(courseId),
//         enrollmentService.checkEnrollment(userId, courseId)
//       ]);
      
//       setModules(roadmapData);
//       setEnrollment(enrollData);
//     } catch (error) {
//       console.error("Hệ thống lỗi:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [courseId, userId]);

//   return { modules, enrollment, loading, refresh: fetchData };
// };