import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Code, Server, Database, Bug, ArrowRight } from 'lucide-react';

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'frontend' | 'backend' | 'fullstack' | 'tester'>('frontend');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [duration, setDuration] = useState(3);
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: 'frontend' as const,
      name: 'Frontend Developer',
      icon: Code,
      description: 'HTML, CSS, JavaScript, React',
    },
    {
      id: 'backend' as const,
      name: 'Backend Developer',
      icon: Server,
      description: 'Node.js, APIs, Authentication',
    },
    {
      id: 'fullstack' as const,
      name: 'Fullstack Developer',
      icon: Database,
      description: 'Frontend + Backend + Database',
    },
    {
      id: 'tester' as const,
      name: 'QA/Tester',
      icon: Bug,
      description: 'Testing, Automation, Quality',
    },
  ];

const handleComplete = async () => {
  setIsLoading(true);
  try {
    await updateUser({
      role,
      onboarding_completed: true,
    });
    toast.success('Hoàn tất thiết lập!');
    navigate('/dashboard');
  } catch (error) {
    toast.error('Có lỗi xảy ra, vui lòng thử lại');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Bước {step} / 3
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((step / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Choose Role */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Mục tiêu nghề nghiệp của bạn?
            </h2>
            <p className="text-gray-600 mb-8">
              Chọn lộ trình phù hợp với mục tiêu của bạn
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    role === r.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <r.icon className={`w-10 h-10 mb-3 ${role === r.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-lg mb-1">{r.name}</h3>
                  <p className="text-sm text-gray-600">{r.description}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Tiếp tục
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Time Commitment */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Thời gian học mỗi ngày?
            </h2>
            <p className="text-gray-600 mb-8">
              Chúng tôi sẽ tạo lộ trình phù hợp với thời gian của bạn
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Số giờ học mỗi ngày: <span className="text-blue-600 font-semibold">{hoursPerDay}h</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1h</span>
                  <span>4h</span>
                  <span>8h</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Thời gian hoàn thành mục tiêu: <span className="text-blue-600 font-semibold">{duration} tháng</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 tháng</span>
                  <span>6 tháng</span>
                  <span>12 tháng</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Dự kiến:</span> Với {hoursPerDay} giờ/ngày, bạn sẽ học được khoảng {hoursPerDay * 30 * duration} giờ trong {duration} tháng
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Tiếp tục
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Xác nhận thông tin
            </h2>
            <p className="text-gray-600 mb-8">
              Kiểm tra lại thông tin trước khi bắt đầu
            </p>

            <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Mục tiêu nghề nghiệp</span>
                <span className="font-semibold">
                  {roles.find((r) => r.id === role)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Thời gian học mỗi ngày</span>
                <span className="font-semibold">{hoursPerDay} giờ</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Thời gian hoàn thành</span>
                <span className="font-semibold">{duration} tháng</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng thời gian học</span>
                <span className="font-semibold text-blue-600">
                  {hoursPerDay * 30 * duration} giờ
                </span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-6">
              <p className="text-sm text-green-800">
                ✨ Hệ thống sẽ tự động tạo lộ trình học cá nhân hóa dựa trên thông tin của bạn
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
