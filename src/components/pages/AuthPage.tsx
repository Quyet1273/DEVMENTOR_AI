import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Github, Facebook, Linkedin } from 'lucide-react';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'register');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Chào mừng bạn quay lại!');
      } else {
        await register(name, email, password);
        toast.success('Đăng ký thành công!');
      }
      navigate('/onboarding');
    } catch (error: any) {
      toast.error(error.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  // --- INLINE STYLES (Đảm bảo độ chính xác tuyệt đối) ---
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
              <button style={mainBtnStyle}>{loading ? 'Creating...' : 'Sign Up'}</button>
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
              <button style={mainBtnStyle}>{loading ? 'Entering...' : 'Sign In'}</button>
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
            padding: '0 40px'
          }}
          animate={{ 
            left: isLogin ? '0%' : '50%',
            // Tạo hiệu ứng "Liquid" bằng cách thay đổi borderRadius động
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