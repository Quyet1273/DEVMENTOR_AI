import React, { useState } from 'react';
import { aiService } from '../../services/aiService';
import { FileText, Sparkles, Loader2 } from 'lucide-react';

export default function AISummaryPage({ lessonContent }: { lessonContent: string }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    const res = await aiService.summarizeLesson(lessonContent);
    setSummary(res);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-center">
        <FileText className="mx-auto mb-2 text-cyan-500" size={32} />
        <h4 className="text-sm font-bold text-gray-200">Tóm tắt thông minh</h4>
        <button 
          onClick={handleSummarize}
          disabled={loading || !lessonContent}
          className="mt-4 px-6 py-2 rounded-full bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-2 mx-auto"
        >
          {loading ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
          TÓM TẮT NGAY
        </button>
      </div>

      {summary && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 leading-relaxed animate-in fade-in">
           {summary.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
        </div>
      )}
    </div>
  );
}