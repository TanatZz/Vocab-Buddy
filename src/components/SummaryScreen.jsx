import { RotateCcw, Home, Award, Target, XCircle, CheckCircle2 } from 'lucide-react';

export default function SummaryScreen({ stats, onRetry, onHome }) {
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
    <div className="min-h-[85vh] flex flex-col justify-center items-center p-8 text-center animate-fade-in">
      <div className={`mb-6 p-6 rounded-full bg-slate-50 ${color}`}>
        <Icon size={64} />
      </div>
      
      <h2 className="text-3xl font-black text-slate-900 mb-2">{message}</h2>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10">Quiz Completed</p>

      <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 w-full max-w-sm mb-10">
        <div className="mb-8">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Accuracy</div>
          <div className={`text-7xl font-black tracking-tighter ${color}`}>{accuracy}%</div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-8 border-t border-slate-50">
          <div>
            <div className="flex justify-center text-green-500 mb-1"><CheckCircle2 size={16} /></div>
            <div className="text-[10px] font-black text-slate-300 uppercase mb-1">Correct</div>
            <div className="text-xl font-black text-slate-800">{stats.correct}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex justify-center text-red-400 mb-1"><XCircle size={16} /></div>
            <div className="text-[10px] font-black text-slate-300 uppercase mb-1">Wrong</div>
            <div className="text-xl font-black text-slate-800">{stats.incorrect}</div>
          </div>
          <div>
            <div className="flex justify-center text-slate-300 mb-1"><Target size={16} /></div>
            <div className="text-[10px] font-black text-slate-300 uppercase mb-1">Total</div>
            <div className="text-xl font-black text-slate-800">{stats.total}</div>
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
          className="w-full bg-slate-100 text-slate-600 font-black py-5 rounded-3xl hover:bg-slate-200 transition active:scale-[0.98] flex items-center justify-center gap-3 text-sm"
        >
          <Home size={18} />
          BACK TO HOME
        </button>
      </div>
    </div>
  );
}
