// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'sonner';
// import { Loader2, UserPlus } from 'lucide-react';

// export function Register() {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Lấy hàm register thật từ Context
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!name || !email || !password || !confirmPassword) {
//       toast.error('Vui lòng điền đầy đủ thông tin');
//       return;
//     }

//     if (password !== confirmPassword) {
//       toast.error('Mật khẩu xác nhận không khớp');
//       return;
//     }

//     if (password.length < 6) {
//       toast.error('Mật khẩu phải có ít nhất 6 ký tự');
//       return;
//     }

//     setIsLoading(true);
    
//     try {
//       // 2. Gọi hàm register - Hàm này sẽ thực hiện 2 việc:
//       // - Tạo user trong Supabase Auth
//       // - Tạo bản ghi trong bảng 'users' 
//       await register(name, email, password);
      
//       toast.success('Đăng ký thành công!');
      
//       // 3. Chuyển hướng sang trang Onboarding để điền Goals và Interested Skills
//       navigate('/onboarding');
      
//     } catch (error: any) {
//       // Bắt lỗi thật từ Supabase (ví dụ: Email đã tồn tại)
//       console.error("Lỗi đăng ký:", error);
//       toast.error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center px-4 py-12">
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
//             <UserPlus className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold mb-2">Đăng ký</h1>
//           <p className="text-gray-600">Bắt đầu hành trình học tập của bạn</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
//               Họ và tên
//             </label>
//             <input
//               id="name"
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//               placeholder="Nguyễn Văn A"
//               disabled={isLoading}
//             />
//           </div>

//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//               placeholder="your.email@example.com"
//               disabled={isLoading}
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//               Mật khẩu
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//               placeholder="••••••••"
//               disabled={isLoading}
//             />
//           </div>

//           <div>
//             <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
//               Xác nhận mật khẩu
//             </label>
//             <input
//               id="confirmPassword"
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//               placeholder="••••••••"
//               disabled={isLoading}
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Đang xử lý...
//               </>
//             ) : (
//               'Đăng ký tài khoản'
//             )}
//           </button>
//         </form>

//         <div className="mt-6 text-center text-sm text-gray-600">
//           Đã có tài khoản?{' '}
//           <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
//             Đăng nhập ngay
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }