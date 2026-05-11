import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Github, Facebook, Linkedin, Key } from 'lucide-react';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy thêm verifyEmailCode từ Context
  const { login, register, isVerified, verifyEmailCode } = useAuth(); 

  const [isWaitingVerification, setIsWaitingVerification] = useState(false);
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'register');
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState(''); // Thêm state lưu mã OTP

  // Xử lý Đăng nhập / Đăng ký
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        
        if (!isVerified) {
          setIsWaitingVerification(true);
          toast.info('Vui lòng xác thực email để đăng nhập.');
          setLoading(false);
          return; 
        }

        toast.success('Chào mừng bạn quay lại!');
        navigate('/onboarding');
      } else {
        await register(name, email, password);
        setIsWaitingVerification(true); 
        toast.success('Đăng ký thành công! Hãy kiểm tra email để lấy mã.');
      }
    } catch (error: any) {
      if (error.message?.includes('Email not confirmed')) {
          setIsWaitingVerification(true);
          toast.error('Vui lòng xác nhận email trước khi đăng nhập');
      } else {
          toast.error(error.message || 'Thao tác thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý nút Xác nhận mã OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      toast.error('Vui lòng nhập đủ mã xác nhận');
      return;
    }

    setLoading(true);
    try {
      await verifyEmailCode(email, otpCode);
      toast.success('Xác thực thành công!');
      setIsWaitingVerification(false);
      navigate('/onboarding');
    } catch (error: any) {
      toast.error(error.message || 'Mã xác nhận không đúng hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  // --- INLINE STYLES ---
  const glassStyles = {
    container: {
      position: 'relative' as const,
      width: '100%',
      maxWidth: '1000px',
      height: '600px',
      backgroundColor: '#fff',
      borderRadius: '40px',
      boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
      overflow: 'hidden',
      display: 'flex'
    },
    sidePanel: {
      position: 'absolute' as const,
      top: 0,
      width: '50%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 60px',
      transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    overlay: {
      background: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
      color: '#fff',
      zIndex: 100,
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f5f7] flex items-center justify-center p-4">
      <div style={glassStyles.container}>
        <AnimatePresence mode="wait">
          {isWaitingVerification ? (
            /* --- GIAO DIỆN NHẬP MÃ XÁC THỰC OTP --- */
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                textAlign: 'center'
              }}
            >
              <div style={{ 
                backgroundColor: '#f0f9ff', 
                padding: '24px', 
                borderRadius: '50%', 
                marginBottom: '24px',
                boxShadow: '0 10px 20px rgba(0, 180, 219, 0.1)' 
              }}>
                <Mail size={60} color="#0083b0" />
              </div>
              
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '16px' }}>
                Xác nhận Email
              </h1>
              
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '24px', maxWidth: '400px' }}>
                Chúng tôi đã gửi mã xác nhận đến <strong>{email}</strong>. 
                Vui lòng nhập mã gồm 6 chữ số vào ô bên dưới.
              </p>

              {/* Ô NHẬP MÃ OTP */}
              <div style={{ width: '100%', maxWidth: '300px', marginBottom: '32px' }}>
                <CustomInput 
                  icon={<Key size={18} />} 
                  placeholder="Nhập mã 6 chữ số" 
                  value={otpCode} 
                  onChange={setOtpCode}
                  type="text" 
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', width: '100%', justifyContent: 'center' }}>
                <button 
                  onClick={() => setIsWaitingVerification(false)}
                  style={{ ...ghostBtnStyle, color: '#0083b0', borderColor: '#0083b0', padding: '12px 30px' }}
                >
                  Quay lại
                </button>
                <button 
                  onClick={handleVerifyOtp} 
                  disabled={loading}
                  style={{ ...mainBtnStyle, width: 'auto', padding: '12px 40px', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Đang kiểm tra...' : 'Xác nhận mã'}
                </button>
              </div>
            </motion.div>
          ) : (
            /* --- GIAO DIỆN LOGIN/REGISTER --- */
            <motion.div key="auth-forms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', width: '100%', height: '100%' }}>
              
              {/* --- FORM ĐĂNG KÝ (Nằm bên trái) --- */}
              <div style={{
                ...glassStyles.sidePanel,
                left: 0,
                opacity: isLogin ? 0 : 1,
                zIndex: isLogin ? 1 : 2,
                pointerEvents: isLogin ? 'none' : 'all'
              }}>
                <form onSubmit={handleAuth} className="w-full">
                  <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#333' }}>
                    Create Account
                  </h1>
                  <div className="space-y-4">
                    <CustomInput icon={<User size={18}/>} placeholder="Name" value={name} onChange={setName} />
                    <CustomInput icon={<Mail size={18}/>} placeholder="Email" value={email} onChange={setEmail} />
                    <CustomInput icon={<Lock size={18}/>} placeholder="Password" type="password" value={password} onChange={setPassword} />
                    <button style={mainBtnStyle} disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
                  </div>
                  <SocialSection />
                </form>
              </div>

              {/* --- FORM ĐĂNG NHẬP (Nằm bên phải) --- */}
              <div style={{
                ...glassStyles.sidePanel,
                left: '50%',
                opacity: isLogin ? 1 : 0,
                zIndex: isLogin ? 2 : 1,
                pointerEvents: !isLogin ? 'none' : 'all'
              }}>
                <form onSubmit={handleAuth} className="w-full">
                  <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#333' }}>
                    Sign In
                  </h1>
                  <div className="space-y-4">
                    <CustomInput icon={<Mail size={18}/>} placeholder="Email" value={email} onChange={setEmail} />
                    <CustomInput icon={<Lock size={18}/>} placeholder="Password" type="password" value={password} onChange={setPassword} />
                    <p style={{ textAlign: 'right', fontSize: '13px', color: '#999', cursor: 'pointer' }}>Forgot password?</p>
                    <button style={mainBtnStyle} disabled={loading}>{loading ? 'Entering...' : 'Sign In'}</button>
                  </div>
                  <SocialSection />
                </form>
              </div>

              {/* --- OVERLAY TRƯỢT (PHẦN MÀU XANH) --- */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '50%',
                  height: '100%',
                  ...glassStyles.overlay,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '0 40px',
                  zIndex: 10
                }}
                animate={{ 
                  left: isLogin ? '0%' : '50%',
                  borderTopRightRadius: isLogin ? '150px' : '40px',
                  borderBottomRightRadius: isLogin ? '100px' : '40px',
                  borderTopLeftRadius: isLogin ? '40px' : '150px',
                  borderBottomLeftRadius: isLogin ? '40px' : '100px',
                }}
                transition={{ type: 'spring', stiffness: 70, damping: 15 }}
              >
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={isLogin ? 'login-view' : 'reg-view'}
                    initial={{ opacity: 0, x: isLogin ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isLogin ? 30 : -30 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
                      {isLogin ? 'Hello, Friend!' : 'Welcome Back!'}
                    </h2>
                    <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', opacity: 0.9 }}>
                      {isLogin 
                        ? "Enter your personal details and start journey with us" 
                        : "To keep connected with us please login with your personal info"}
                    </p>
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      style={ghostBtnStyle}
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- COMPONENTS PHỤ DÙNG INLINE CSS ---
function CustomInput({ icon, placeholder, value, onChange, type = "text" }: any) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#f0f2f5',
      padding: '14px 20px',
      borderRadius: '16px',
      gap: '12px',
      border: '1px solid transparent',
      transition: '0.3s'
    }}>
      <span style={{ color: '#aaa' }}>{icon}</span>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#333' }}
        required
      />
    </div>
  );
}

function SocialSection() {
  return (
    <div style={{ marginTop: '30px', textAlign: 'center' }}>
      <p style={{ fontSize: '12px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
        or use your social account
      </p>
      <div className="flex justify-center gap-4">
        <SocialBtn icon={<Github size={20}/>} />
        <SocialBtn icon={<Facebook size={20}/>} />
        <SocialBtn icon={<Linkedin size={20}/>} />
      </div>
    </div>
  );
}

function SocialBtn({ icon }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4, backgroundColor: '#f0f2f5' }}
      style={{
        padding: '12px',
        border: '1px solid #eee',
        borderRadius: '12px',
        cursor: 'pointer',
        color: '#555'
      }}
    >
      {icon}
    </motion.div>
  );
}

const mainBtnStyle = {
  width: '100%',
  backgroundColor: '#0083b0',
  color: '#fff',
  padding: '14px',
  borderRadius: '30px',
  fontWeight: 'bold',
  fontSize: '15px',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 10px 20px rgba(0, 131, 176, 0.2)',
  transition: '0.3s'
};

const ghostBtnStyle = {
  padding: '12px 50px',
  border: '2px solid #fff',
  backgroundColor: 'transparent',
  color: '#fff',
  borderRadius: '30px',
  fontWeight: 'bold',
  fontSize: '14px',
  cursor: 'pointer',
  transition: '0.3s'
};