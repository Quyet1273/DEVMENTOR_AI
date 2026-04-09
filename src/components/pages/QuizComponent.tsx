import React, { useState } from 'react';
import { QuizQuestion } from '../../models/learning';
import { lessonService } from '../../services/lessonService';
import { CheckCircle, XCircle, Zap, ArrowRight } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
  lessonId: number;
  userId: string;
  xpReward: number;
  onFinished: (totalXp: number) => void;
}
// Tiếp tục phần code export const QuizComponent...

export const QuizComponent: React.FC<QuizProps> = ({ questions, lessonId, userId, xpReward, onFinished }) => {
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
      // Khi làm xong câu cuối cùng
      const isPass = (correctCount / questions.length) >= 0.8;
      const finalXp = isPass ? xpReward : Math.floor(xpReward / 5);
      
      await lessonService.completeLesson(userId, lessonId, finalXp, isPass);
      onFinished(finalXp);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-medium text-slate-500">Câu hỏi {currentIdx + 1}/{questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full ${i <= currentIdx ? 'bg-blue-500' : 'bg-slate-100'}`} />
          ))}
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-6">{currentQuestion.question_text}</h3>

      <div className="grid gap-3">
        {currentQuestion.options.map((opt, i) => {
          const isCorrect = i === currentQuestion.correct_option_index;
          const isSelected = i === selectedIdx;
          
          let btnClass = "border-slate-200 hover:bg-slate-50";
          if (isAnswered) {
            if (isCorrect) btnClass = "border-green-500 bg-green-50 text-green-700";
            else if (isSelected) btnClass = "border-red-500 bg-red-50 text-red-700";
            else btnClass = "opacity-40 border-slate-100";
          } else if (isSelected) {
            btnClass = "border-blue-500 bg-blue-50 text-blue-700";
          }

          return (
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => setSelectedIdx(i)}
              className={`p-4 text-left border-2 rounded-xl font-medium transition-all flex justify-between items-center ${btnClass}`}
            >
              {opt}
              {isAnswered && isCorrect && <CheckCircle size={20} />}
              {isAnswered && isSelected && !isCorrect && <XCircle size={20} />}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-600 text-sm">
          💡 {currentQuestion.explanation}
        </div>
      )}

      <button
        disabled={selectedIdx === null}
        onClick={isAnswered ? handleNext : handleCheck}
        className="w-full mt-8 py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {isAnswered ? (currentIdx === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo') : 'Kiểm tra'}
        {isAnswered ? <ArrowRight size={20} /> : <Zap size={20} fill="currentColor" />}
      </button>
    </div>
  );
};