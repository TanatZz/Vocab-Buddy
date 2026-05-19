import { Edit2, Trash2, Volume2 } from 'lucide-react';

export default function WordListItem({ word, onEdit, onDelete }) {
  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-50 text-green-600';
      case 'hard': return 'bg-red-50 text-red-600';
      default: return 'bg-amber-50 text-amber-600';
    }
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US'; // Default to English, could be dynamic
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="group bg-white p-5 rounded-3xl border border-slate-50 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all animate-slide-up">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-primary transition-colors">{word.word}</h4>
            <button 
              onClick={handleSpeak}
              className="p-1.5 text-slate-300 hover:text-primary transition-colors rounded-full hover:bg-primary/5"
            >
              <Volume2 size={14} />
            </button>
          </div>
          
          <p className="text-slate-500 text-sm font-medium leading-relaxed">{word.meaning}</p>
          
          <div className="flex items-center gap-3 mt-4">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getDifficultyStyles(word.difficulty)}`}>
              {word.difficulty || 'medium'}
            </span>
            <div className="h-1 w-1 bg-slate-200 rounded-full" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              {word.reviewCount || 0} REVIEWS
            </span>
          </div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(word)}
            className="p-2 text-slate-400 hover:text-primary transition-colors rounded-xl hover:bg-slate-50"
            title="แก้ไข"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => onDelete(word.id)}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
            title="ลบ"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
