import { useState } from 'react';
import { useTheme } from '../context/ThemeContext'; // <-- 1. IMPORT THEME
import {
  BookOpen,
  ExternalLink,
  Play,
  Code,
  FileText,
  Video,
  Search,
  Filter,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: 'roadmap' | 'documentation' | 'video' | 'project' | 'exercise';
  category: string;
  description: string;
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
}

export function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 2. LẤY MÀU TỪ HỆ THỐNG
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  const resourceTypes = [
    { id: 'all', name: 'Tất cả', icon: BookOpen },
    { id: 'roadmap', name: 'Roadmap', icon: FileText },
    { id: 'documentation', name: 'Tài liệu', icon: BookOpen },
    { id: 'video', name: 'Video', icon: Video },
    { id: 'project', name: 'Dự án mẫu', icon: Code },
    { id: 'exercise', name: 'Bài tập', icon: Play },
  ];

  const categories = ['all', 'HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Database', 'Algorithm'];

  const resources: Resource[] = [
    { id: '1', title: 'Frontend Developer Roadmap 2026', type: 'roadmap', category: 'HTML/CSS', description: 'Lộ trình chi tiết từ zero đến hero cho Frontend Developer', url: 'https://roadmap.sh/frontend', difficulty: 'beginner' },
    { id: '2', title: 'MDN Web Docs - HTML', type: 'documentation', category: 'HTML/CSS', description: 'Tài liệu chính thức và đầy đủ nhất về HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', difficulty: 'beginner' },
    { id: '3', title: 'JavaScript.info', type: 'documentation', category: 'JavaScript', description: 'Tutorial JavaScript hiện đại từ cơ bản đến nâng cao', url: 'https://javascript.info', difficulty: 'intermediate' },
    { id: '4', title: 'React Official Docs', type: 'documentation', category: 'React', description: 'Tài liệu chính thức của React với ví dụ tương tác', url: 'https://react.dev', difficulty: 'intermediate' },
    { id: '5', title: 'Flexbox Froggy', type: 'exercise', category: 'HTML/CSS', description: 'Game tương tác để học CSS Flexbox', url: 'https://flexboxfroggy.com', difficulty: 'beginner', duration: '30 phút' },
    { id: '6', title: 'Grid Garden', type: 'exercise', category: 'HTML/CSS', description: 'Game tương tác để học CSS Grid', url: 'https://cssgridgarden.com', difficulty: 'beginner', duration: '30 phút' },
    { id: '7', title: 'JavaScript30', type: 'project', category: 'JavaScript', description: '30 dự án JavaScript trong 30 ngày', url: 'https://javascript30.com', difficulty: 'intermediate', duration: '30 ngày' },
    { id: '8', title: 'Todo App với React', type: 'project', category: 'React', description: 'Xây dựng ứng dụng Todo đầy đủ với React Hooks', url: '#', difficulty: 'beginner', duration: '2-3 giờ' },
    { id: '12', title: 'MongoDB University', type: 'video', category: 'Database', description: 'Khóa học miễn phí về MongoDB từ chính hãng', url: 'https://university.mongodb.com', difficulty: 'beginner', duration: '10 giờ' },
    { id: '13', title: 'LeetCode - Algorithm', type: 'exercise', category: 'Algorithm', description: 'Nền tảng luyện tập thuật toán và cấu trúc dữ liệu', url: 'https://leetcode.com', difficulty: 'intermediate' },
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getDifficultyColor = (diff: string) => {
    if (diff === 'beginner') return '#10b981';
    if (diff === 'intermediate') return '#facc15';
    return '#ef4444';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg, padding: '40px', fontFamily: 'monospace', color: colors.text, transition: 'all 0.3s ease' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ borderLeft: `4px solid ${colors.primary}`, paddingLeft: '20px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: colors.text, textTransform: 'uppercase', letterSpacing: '2px' }}>
            Resource <span style={{ color: colors.primary }}>Archives</span>
          </h1>
          <p style={{ color: colors.muted, fontSize: '12px', fontWeight: 'bold' }}>HỆ THỐNG TRUY XUẤT TÀI LIỆU V1.0 // CLASSIFIED DATA</p>
        </div>

        {/* SEARCH & FILTERS BOX */}
        <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '32px', marginBottom: '40px', boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '32px' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: colors.muted }} size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tài nguyên (Title, Description...)"
              style={{ width: '100%', backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px 16px 16px 52px', color: colors.text, outline: 'none', transition: 'all 0.3s ease' }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>

          {/* Type Filters */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: colors.primary, fontWeight: 'bold', marginBottom: '12px', letterSpacing: '1px' }}>
              <Filter size={14} /> FILTER_BY_TYPE:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {resourceTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  style={{
                    padding: '10px 18px', borderRadius: '10px', border: '1px solid', 
                    borderColor: selectedType === type.id ? colors.primary : colors.border,
                    backgroundColor: selectedType === type.id ? `${colors.primary}22` : colors.inputBg,
                    color: selectedType === type.id ? colors.primary : colors.muted,
                    fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e) => { if(selectedType !== type.id) e.currentTarget.style.borderColor = colors.primary; }}
                  onMouseLeave={(e) => { if(selectedType !== type.id) e.currentTarget.style.borderColor = colors.border; }}
                >
                  <type.icon size={14} /> {type.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: colors.secondary, fontWeight: 'bold', marginBottom: '12px', letterSpacing: '1px' }}>
              <Filter size={14} /> FILTER_BY_CATEGORY:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid',
                    borderColor: selectedCategory === cat ? colors.secondary : colors.border,
                    backgroundColor: selectedCategory === cat ? `${colors.secondary}22` : colors.inputBg,
                    color: selectedCategory === cat ? colors.secondary : colors.muted,
                    fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { if(selectedCategory !== cat) e.currentTarget.style.borderColor = colors.secondary; }}
                  onMouseLeave={(e) => { if(selectedCategory !== cat) e.currentTarget.style.borderColor = colors.border; }}
                >
                  {cat === 'all' ? 'ALL_CATEGORIES' : cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredResources.map((res) => (
            <div
              key={res.id}
              style={{
                backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '24px',
                display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = colors.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = colors.border; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${colors.primary}15`, border: `1px solid ${colors.primary}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {res.type === 'video' ? <Video size={24} color={colors.primary} /> : res.type === 'project' ? <Code size={24} color={colors.primary} /> : <BookOpen size={24} color={colors.primary} />}
                </div>
                <span style={{ fontSize: '9px', fontWeight: 900, padding: '4px 10px', borderRadius: '4px', border: `1px solid ${getDifficultyColor(res.difficulty)}`, color: getDifficultyColor(res.difficulty), textTransform: 'uppercase' }}>
                  {res.difficulty}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.text, marginBottom: '12px', lineHeight: '1.4' }}>{res.title}</h3>
              <p style={{ fontSize: '13px', color: colors.muted, lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>{res.description}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '10px', fontWeight: 'bold', color: colors.muted }}>
                <span style={{ backgroundColor: colors.inputBg, padding: '4px 8px', borderRadius: '4px', border: `1px solid ${colors.border}` }}>#{res.category.toUpperCase()}</span>
                {res.duration && <span>⏱ {res.duration}</span>}
              </div>

              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                  color: '#fff', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
              >
                Access Resource <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredResources.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: colors.muted }}>
            <Search size={64} style={{ marginBottom: '20px', opacity: 0.2 }} />
            <p>NO DATA FOUND FOR CURRENT FILTERS</p>
          </div>
        )}

        {/* FOOTER SUGGESTION */}
        <div style={{ marginTop: '60px', padding: '40px', borderRadius: '24px', background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)`, border: `1px solid ${colors.border}`, textAlign: 'center', transition: 'all 0.3s ease' }}>
          <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>DATA_GAP_DETECTED?</h3>
          <p style={{ color: colors.muted, fontSize: '13px', marginBottom: '24px' }}>Không tìm thấy tài nguyên, hãy yêu cầu ngay tại Command Center.</p>
          <button 
            style={{ padding: '12px 32px', borderRadius: '10px', border: `1px solid ${colors.primary}`, backgroundColor: 'transparent', color: colors.primary, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.primary; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.primary; }}
          >
            REQUEST_NEW_DATA
          </button>
        </div>
      </div>
    </div>
  );
}