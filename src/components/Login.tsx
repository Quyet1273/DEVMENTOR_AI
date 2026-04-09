// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'sonner';
// import { Loader2, LogIn } from 'lucide-react';

// export function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Gọi hàm login thật từ AuthContext
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // 1. Kiểm tra đầu vào cơ bản
//     if (!email || !password) {
//       toast.error('Vui lòng điền đầy đủ email và mật khẩu');
//       return;
//     }

//     setIsLoading(true);
    
//     try {
//       // 2. Thực hiện đăng nhập với Supabase
//       await login(email, password);
      
//       toast.success('Chào mừng bạn quay trở lại!');
      
//       // 3. Sau khi đăng nhập thành công, chuyển hướng về Dashboard
//       // Bạn có thể check thêm: nếu chưa xong onboarding thì về /onboarding
//       navigate('/dashboard');
      
//     } catch (error: any) {
//       // Bắt các lỗi từ Supabase (sai pass, email không tồn tại...)
//       console.error("Lỗi đăng nhập:", error.message);
      
//       let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
//       if (error.message === 'Invalid login credentials') {
//         errorMessage = 'Email hoặc mật khẩu không chính xác';
//       }
      
//       toast.error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center px-4 py-12">
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
//             <LogIn className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold mb-2">Đăng nhập</h1>
//           <p className="text-gray-600">Chào mừng trở lại DevMentor AI</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//               Email của bạn
//             </label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//               placeholder="example@email.com"
//               disabled={isLoading}
//             />
//           </div>

//           <div>
//             <div className="flex justify-between mb-2">
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Mật khẩu
//               </label>
//               <a href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</a>
//             </div>
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

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Đang xác thực...
//               </>
//             ) : (
//               'Đăng nhập ngay'
//             )}
//           </button>
//         </form>

//         <div className="mt-8 text-center text-sm text-gray-600">
//           Chưa có tài khoản?{' '}
//           <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
//             Tạo tài khoản mới
//           </Link>
//         </div>

//         <div className="mt-4 text-center">
//           <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
//             ← Về trang chủ
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }