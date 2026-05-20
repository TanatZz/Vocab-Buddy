import { useTheme } from '../context/ThemeContext.jsx';

export default function QuizCard({ word, revealed, onReveal }) {
  const { isDarkMode } = useTheme();

  return (
    <div 
      className={`group rounded-[40px] p-10 min-h-[400px] flex flex-col justify-center items-center cursor-pointer border transition-all duration-500 transform active:scale-[0.98] relative overflow-hidden ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800/80 shadow-none' 
          : 'bg-white border-slate-50 shadow-2xl shadow-slate-200/50'
      }`}
      onClick={!revealed ? onReveal : undefined}
    >
      <div className="text-center z-10 w-full">
        {!revealed ? (
          <>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-300'
            }`}>Meaning</div>
            <h2 className={`text-4xl font-black leading-tight mb-4 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>{word.meaning}</h2>
            <div className={`mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
              isDarkMode ? 'bg-slate-950 border-slate-800/60' : 'bg-slate-50 border-slate-100'
            }`}>
               <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
               <span className={`text-[10px] font-black uppercase tracking-widest ${
                 isDarkMode ? 'text-slate-500' : 'text-slate-400'
               }`}>Tap to reveal</span>
            </div>
          </>
        ) : (
          <div className="animate-pop w-full">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">The Word</div>
            <h2 className={`text-6xl font-black mb-4 tracking-tighter ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>{word.word}</h2>
            {word.pronunciation && (
              <p className={`text-xl font-bold mb-8 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>/{word.pronunciation}/</p>
            )}
            <div className={`h-px w-12 mx-auto mb-8 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
            <p className={`text-xl font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{word.meaning}</p>
          </div>
        )}
      </div>
      
      {/* Subtle background element */}
      <div className={`absolute inset-0 pointer-events-none ${
        isDarkMode ? 'bg-gradient-to-b from-transparent to-slate-950/30' : 'bg-gradient-to-b from-transparent to-slate-50/30'
      }`} />
    </div>
  );
}
