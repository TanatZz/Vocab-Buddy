import { Edit2, Trash2, Volume2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function WordListItem({ word, onEdit, onDelete }) {
  const { isDarkMode } = useTheme();

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case 'easy': 
        return isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-green-50 text-green-600';
      case 'hard': 
        return isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600';
      default: 
        return isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-600';
    }
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      // ใช้ภาษาของคำศัพท์แทนค่าตายตัว en-US
      const langMap = { en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', th: 'th-TH' };
      utterance.lang = langMap[word.language] || word.language || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`group p-5 rounded-3xl border transition-all animate-slide-up ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-800/80 hover:border-primary/30 hover:shadow-xl hover:shadow-black/20 text-white' 
        : 'bg-white border-slate-50 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 text-slate-900'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className={`font-black text-lg tracking-tight group-hover:text-primary transition-colors ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>{word.word}</h4>
            <button 
              onClick={handleSpeak}
              className={`p-1.5 transition-colors rounded-full ${
                isDarkMode ? 'text-slate-600 hover:text-primary hover:bg-slate-800' : 'text-slate-300 hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Volume2 size={14} />
            </button>
          </div>
          
          <p className={`text-sm font-medium leading-relaxed ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>{word.meaning}</p>
          
          <div className="flex items-center gap-3 mt-4">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getDifficultyStyles(word.difficulty)}`}>
              {word.difficulty || 'medium'}
            </span>
            <div className={`h-1 w-1 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {word.reviewCount || 0} REVIEWS
            </span>
          </div>
        </div>
        
        {/* ปุ่ม Edit/Delete แสดงเมื่อมีสิทธิ์แก้ไข (ไม่เป็นสำรับรวม) - ใช้ได้ทั้งบนมือถือและเดสก์ท็อป */}
        {onEdit && onDelete && (
          <div className="flex gap-1 ml-2 flex-shrink-0">
            <button 
              onClick={() => onEdit(word)}
              className={`p-2 transition-colors rounded-xl ${
                isDarkMode ? 'text-slate-500 hover:text-primary hover:bg-slate-800' : 'text-slate-300 hover:text-primary hover:bg-slate-50'
              }`}
              title="แก้ไข"
              aria-label="แก้ไขคำศัพท์"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={() => onDelete(word.id)}
              className={`p-2 transition-colors rounded-xl ${
                isDarkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/30' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
              }`}
              title="ลบ"
              aria-label="ลบคำศัพท์"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
