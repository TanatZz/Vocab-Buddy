export default function QuizCard({ word, revealed, onReveal }) {
  return (
    <div 
      className="group bg-white rounded-[40px] p-10 min-h-[400px] flex flex-col justify-center items-center cursor-pointer shadow-2xl shadow-slate-200/50 border border-slate-50 transition-all duration-500 transform active:scale-[0.98] relative overflow-hidden"
      onClick={!revealed ? onReveal : undefined}
    >
      <div className="text-center z-10 w-full">
        {!revealed ? (
          <>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8">Meaning</div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4">{word.meaning}</h2>
            <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
               <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tap to reveal</span>
            </div>
          </>
        ) : (
          <div className="animate-pop w-full">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">The Word</div>
            <h2 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">{word.word}</h2>
            {word.pronunciation && (
              <p className="text-xl text-slate-400 font-bold mb-8">/{word.pronunciation}/</p>
            )}
            <div className="h-px w-12 bg-slate-100 mx-auto mb-8"></div>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">{word.meaning}</p>
          </div>
        )}
      </div>
      
      {/* Subtle background element */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/30 pointer-events-none" />
    </div>
  );
}
