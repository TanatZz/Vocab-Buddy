import { RotateCcw, Home, Award, Target, XCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function SummaryScreen({ stats, onRetry, onHome }) {
  const { isDarkMode } = useTheme();
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  
  let Icon = Award;
  let message = 'Excellent!';
  let color = 'text-primary';

  if (accuracy < 50) {
    message = 'Keep Practice!';
    color = 'text-red-400';
  } else if (accuracy < 80) {
    message = 'Good Job!';
    color = 'text-orange-400';
  }

  return (
    <div className={`min-h-[85vh] flex flex-col justify-center items-center p-8 text-center animate-fade-in transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#fafafa] text-slate-900'
    }`}>
      <div className={`mb-6 p-6 rounded-full transition-colors ${
        isDarkMode ? 'bg-slate-900 text-primary border border-slate-800' : `bg-slate-50 ${color}`
      }`}>
        <Icon size={64} className={isDarkMode ? color : ''} />
      </div>
      
      <h2 className={`text-3xl font-black mb-2 transition-colors ${
        isDarkMode ? 'text-white' : 'text-slate-900'
      }`}>{message}</h2>
      <p className={`font-bold uppercase tracking-widest text-xs mb-10 transition-colors ${
        isDarkMode ? 'text-slate-500' : 'text-slate-400'
      }`}>Quiz Completed</p>

      <div className={`rounded-[40px] p-10 border w-full max-w-sm mb-10 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 shadow-none' 
          : 'bg-white border-slate-50 shadow-2xl shadow-slate-200/50'
      }`}>
        <div className="mb-8">
          <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
            isDarkMode ? 'text-slate-500' : 'text-slate-300'
          }`}>Accuracy</div>
          <div className={`text-7xl font-black tracking-tighter ${color}`}>{accuracy}%</div>
        </div>

        <div className={`grid grid-cols-3 gap-2 pt-8 border-t ${
          isDarkMode ? 'border-slate-800/80' : 'border-slate-50'
        }`}>
          <div>
            <div className="flex justify-center text-green-500 mb-1"><CheckCircle2 size={16} /></div>
            <div className={`text-[10px] font-black uppercase mb-1 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-300'
            }`}>Correct</div>
            <div className={`text-xl font-black ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>{stats.correct}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex justify-center text-red-400 mb-1"><XCircle size={16} /></div>
            <div className={`text-[10px] font-black uppercase mb-1 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-300'
            }`}>Wrong</div>
            <div className={`text-xl font-black ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>{stats.incorrect}</div>
          </div>
          <div>
            <div className="flex justify-center text-slate-300 mb-1"><Target size={16} /></div>
            <div className={`text-[10px] font-black uppercase mb-1 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-300'
            }`}>Total</div>
            <div className={`text-xl font-black ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>{stats.total}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button 
          onClick={onRetry}
          className="w-full bg-primary text-white font-black py-5 rounded-3xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <RotateCcw size={20} />
          RETRY QUIZ
        </button>
        <button 
          onClick={onHome}
          className={`w-full font-black py-5 rounded-3xl transition active:scale-[0.98] flex items-center justify-center gap-3 text-sm ${
            isDarkMode 
              ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Home size={18} />
          BACK TO HOME
        </button>
      </div>
    </div>
  );
}
