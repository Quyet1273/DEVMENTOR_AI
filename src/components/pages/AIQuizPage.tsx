import React, { useState } from 'react';
import { aiService } from '../../services/aiService';
import { Brain, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function AIQuizPage({ lessonContent }: { lessonContent: string }) {
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const generateQuiz = async () => {
    setLoading(true); setQuiz(null); setSelected(null);
    const data = await aiService.generateQuiz(lessonContent);
    setQuiz(data);
    setLoading(false);
  };

  return (
    <div className="space-y-4 text-center">
      {!quiz && !loading && (
        <div className="py-10 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-cyan-500/50 transition-all" onClick={generateQuiz}>
          <Brain className="mx-auto mb-4 text-gray-600" size={48} />
          <span className="text-cyan-500 font-bold">NHẤN ĐỂ TẠO CÂU HỎI ÔN TẬP</span>
        </div>
      )}

      {loading && <Loader2 className="animate-spin mx-auto text-cyan-500 mt-10" size={32} />}

      {quiz && (
        <div className="text-left p-5 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="font-bold text-gray-200 mb-4">{quiz.question}</h4>
          <div className="space-y-2">
            {quiz.options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => setSelected(opt)}
                className={`w-full p-3 rounded-xl text-sm text-left transition-all border ${
                  selected === opt ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-white/5'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {selected && (
            <div className={`mt-4 p-4 rounded-xl text-xs ${selected === quiz.answer ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              <div className="flex items-center gap-2 font-bold mb-1 italic">
                {selected === quiz.answer ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
                {selected === quiz.answer ? 'Đúng rồi!' : `Sai rồi, đáp án là: ${quiz.answer}`}
              </div>
              <p className="mt-2 opacity-80">{quiz.explanation}</p>
              <button onClick={generateQuiz} className="mt-4 text-cyan-500 underline">Đổi câu khác</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}