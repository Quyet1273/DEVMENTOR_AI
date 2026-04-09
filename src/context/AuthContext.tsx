import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "student" | "mentor" | "admin"; // Cập nhật lại các Role chuẩn
  current_level: string;
  level: number;
  xp: number;
  streak: number;
  total_hours: number;
  goals: any;
  interested_skills?: Record<string, number>; // Cho trang Dashboard
  skillProfile?: Record<string, number>;
  onboarding_completed: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean; // Thêm biến này cho tiện check ở UI
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
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
          role: "student", // MẶC ĐỊNH LÀ STUDENT
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
        isAdmin: user?.role === "admin", // Trả về true nếu là admin
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
