import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export default function MyRoadmapBanner() {
  const { user } = useAuth();
 const { theme, colors } = useTheme(); // Lấy theme ('light'/'dark') và bảng màu colors
  const isDark = theme === "dark";
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMyRoadmap() {
      if (!user) return;
      // 1. Lấy lộ trình đang active của user
      const { data: roadmap } = await supabase
        .from('ai_roadmaps')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (roadmap) {
        // 2. Lấy các chặng của lộ trình đó
        const { data: steps } = await supabase
          .from('roadmap_milestones')
          .select('*')
          .eq('roadmap_id', roadmap.id)
          .order('order_index', { ascending: true });
        
        setMilestones(steps || []);
      }
    }
    fetchMyRoadmap();
  }, [user]);

  if (milestones.length === 0) return null; // Nếu chưa có lộ trình thì không hiện gì cả

  return (
    <div className="mb-12 p-6 rounded-[24px] border transition-all" 
         style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black uppercase tracking-tighter text-lg" style={{ color: colors.primary }}>
          Tiến độ lộ trình AI
        </h3>
        <button className="text-xs font-bold flex items-center gap-2 opacity-60 hover:opacity-100 transition-all">
          XEM CHI TIẾT <ArrowRight size={14} />
        </button>
      </div>

      {/* THANH LỘ TRÌNH NGANG */}
      <div className="relative flex items-center justify-between gap-2">
        {/* Đường kẻ mờ phía sau */}
        <div className="absolute left-0 right-0 h-1 top-1/2 -translate-y-1/2 bg-gray-500/10 z-0" />

        {milestones.map((step, index) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center group">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: step.status === 'completed' ? '#22c55e' : colors.primary,
                boxShadow: step.status === 'completed' ? '0 0 15px #22c55e30' : 'none'
              }}
            >
              {step.status === 'completed' ? (
                <CheckCircle2 size={20} className="text-green-500" />
              ) : (
                <span className="text-xs font-bold" style={{ color: colors.primary }}>{index + 1}</span>
              )}
            </div>
            
            {/* Tooltip hiện tên chặng khi hover */}
            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
              <span className="text-[10px] font-bold uppercase" style={{ color: colors.text }}>
                {step.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}