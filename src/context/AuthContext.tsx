import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "student" | "mentor" | "admin";
  current_level: string;
  level: number;
  xp: number;
  quizzes_passed?: number;
  streak: number;
  total_hours: number;
  goals: any;
  interested_skills?: Record<string, number>;
  skillProfile?: Record<string, number>;
  onboarding_completed: boolean;
  hearts: number;          
  last_heart_reset: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  verifyEmailCode: (email: string, token: string) => Promise<void>; // Định nghĩa hàm
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setIsVerified(!!authUser?.email_confirmed_at);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) console.log("Lỗi truy vấn: ", error.message);
      setUser(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hàm xác thực mã OTP
  const verifyEmailCode = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup', 
    });
    if (error) throw error;
    
    // Cập nhật lại profile sau khi xác nhận thành công
    if (data.user) {
      await fetchProfile(data.user.id);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          name: name,
          email: email,
          level: 1,
          current_level: "Beginner",
          xp: 0,
          streak: 0,
          total_hours: 0,
          role: "student",
          onboarding_completed: false,
          interested_skills: {},
          goals: [],
        },
      ]);
      if (profileError) throw profileError;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (userData: Partial<UserProfile>) => {
    if (!user) return;
    const { error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", user.id);
    if (error) throw error;
    setUser({ ...user, ...userData });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isVerified,
        verifyEmailCode, // Xuất hàm ra để giao diện có thể sử dụng
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
}