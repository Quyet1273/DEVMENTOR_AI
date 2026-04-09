import { Link } from "react-router-dom";
import {
  BookOpen,
  Target,
  TrendingUp,
  MessageSquare,
  Award,
  Users,
} from "lucide-react";

export function Landing() {
  const features = [
    {
      icon: Target,
      title: "Lộ trình cá nhân hóa",
      description: "AI tạo roadmap phù hợp với mục tiêu và thời gian của bạn",
    },
    {
      icon: TrendingUp,
      title: "Theo dõi tiến độ",
      description: "Dashboard trực quan với biểu đồ phân tích kỹ năng",
    },
    {
      icon: MessageSquare,
      title: "AI Mentor 24/7",
      description: "Hỏi đáp, giải thích code, tạo bài tập mọi lúc mọi nơi",
    },
    {
      icon: Award,
      title: "Quiz & Đánh giá",
      description: "Kiểm tra kiến thức và xác định điểm yếu cần cải thiện",
    },
    {
      icon: Users,
      title: "Mock Interview",
      description: "Luyện phỏng vấn với AI, nhận feedback chi tiết",
    },
    {
      icon: BookOpen,
      title: "Kho tài nguyên",
      description: "Roadmap, tài liệu, video và bài tập thực hành",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">DevMentor AI</h1>
            <p className="text-xl mb-4 text-blue-100 max-w-2xl mx-auto">
              Trợ lý ảo đồng hành cùng sinh viên CNTT
            </p>
            <p className="text-lg mb-8 text-blue-200 max-w-2xl mx-auto">
              Học có hệ thống • Theo dõi tiến độ • Đánh giá năng lực • Luyện
              phỏng vấn
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                state={{ mode: "register" }} // Truyền trạng thái đăng ký
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Bắt đầu ngay
              </Link>
              <Link
                to="/login"
                state={{ mode: "login" }} // Truyền trạng thái đăng nhập
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors border border-blue-400 shadow-lg"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Tính năng nổi bật</h2>
          <p className="text-lg text-gray-600">
            Hệ thống hỗ trợ toàn diện cho hành trình học tập của bạn
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng bắt đầu học tập hiệu quả?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Tham gia cùng hàng nghìn sinh viên CNTT đang học tập có hệ thống
          </p>
          <Link
            to="/login"
            state={{ mode: "register" }}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2026 DevMentor AI. Dự án học tập - Demo Portfolio.</p>
        </div>
      </footer>
    </div>
  );
}
