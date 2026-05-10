import React, { useState } from 'react';
import { QuizQuestion } from '../../models/learning';
import { lessonService } from '../../services/lessonService';
import { useTheme } from '../../context/ThemeContext'; // 1. Import Theme
import { CheckCircle, XCircle, Zap, ArrowRight } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
  lessonId: number;
  userId: string;
  xpReward: number;
  onFinished: (totalXp: number) => void;
}

export const QuizComponent: React.FC<QuizProps> = ({ questions, lessonId, userId, xpReward, onFinished }) => {
  const { colors, theme } = useTheme(); // 2. Lấy bộ màu
  const isDark = theme === 'dark';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = questions[currentIdx];

  const handleCheck = () => {
    if (selectedIdx === currentQuestion.correct_option_index) {
      setCorrectCount(prev => prev + 1);
    }
    setIsAnswered(true);
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      const isPass = (correctCount / questions.length) >= 0.8;
      const finalXp = isPass ? xpReward : Math.floor(xpReward / 5);
      await lessonService.completeLesson(userId, lessonId, finalXp, isPass);
      onFinished(finalXp);
    }
  };

  return (
    // Thay bg-white bằng colors.card
    <div className="p-6 rounded-2xl border transition-all duration-300" 
         style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-medium" style={{ color: colors.muted }}>
          Câu hỏi {currentIdx + 1}/{questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className="h-1.5 w-6 rounded-full transition-all" 
                 style={{ backgroundColor: i <= currentIdx ? colors.primary : colors.inputBg }} />
          ))}
        </div>
      </div>

      {/* CHỮ CÂU HỎI: Ép màu colors.text */}
      <h3 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
        {currentQuestion.question_text}
      </h3>

      <div className="grid gap-3">
        {currentQuestion.options.map((opt, i) => {
          const isCorrect = i === currentQuestion.correct_option_index;
          const isSelected = i === selectedIdx;
          
          // Logic màu sắc dynamic
          let dynamicStyle: React.CSSProperties = {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
            color: colors.text
          };

          if (isAnswered) {
            if (isCorrect) {
              dynamicStyle = { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981', color: '#10b981' };
            } else if (isSelected) {
              dynamicStyle = { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#ef4444' };
            } else {
              dynamicStyle = { ...dynamicStyle, opacity: 0.4 };
            }
          } else if (isSelected) {
            dynamicStyle = { backgroundColor: `${colors.primary}22`, borderColor: colors.primary, color: colors.primary };
          }

          return (
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => setSelectedIdx(i)}
              className="p-4 text-left border-2 rounded-xl font-medium transition-all flex justify-between items-center"
              style={dynamicStyle}
            >
              {opt}
              {isAnswered && isCorrect && <CheckCircle size={20} />}
              {isAnswered && isSelected && !isCorrect && <XCircle size={20} />}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-6 p-4 rounded-xl border italic text-sm" 
             style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.muted }}>
          💡 {currentQuestion.explanation}
        </div>
      )}

      <button
        disabled={selectedIdx === null}
        onClick={isAnswered ? handleNext : handleCheck}
        className="w-full mt-8 py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        style={{ 
          backgroundColor: colors.primary,
          boxShadow: `0 4px 14px ${colors.primary}44` 
        }}
      >
        {isAnswered ? (currentIdx === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo') : 'Kiểm tra'}
        {isAnswered ? <ArrowRight size={20} /> : <Zap size={20} fill="currentColor" />}
      </button>
    </div>
  );
};