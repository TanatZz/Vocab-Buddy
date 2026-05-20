import { useEffect } from 'react';
import { X, Volume2, Check, X as XIcon } from 'lucide-react';
import { useQuiz } from '../hooks/useQuiz.js';
import { useTheme } from '../context/ThemeContext.jsx';
import QuizCard from './QuizCard.jsx';
import SummaryScreen from './SummaryScreen.jsx';

export default function QuizScreen({ deckId, settings = {}, onBack }) {
  const { isDarkMode } = useTheme();
  const {
    currentWord,
    words,
    index,
    revealed,
    setRevealed,
    stats,
    loading,
    handleSelfCheck,
    resetQuiz
  } = useQuiz(deckId);

  const { enableAudio = true, audioTiming = 'after' } = settings;

  const speak = (text, language = 'en-US') => {
    if (!window.speechSynthesis || !enableAudio) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (currentWord && enableAudio && audioTiming === 'before' && !revealed) {
      speak(currentWord.word, currentWord.language || 'en-US');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord, index, enableAudio, audioTiming]);

  const handleReveal = () => {
    setRevealed(true);
    if (currentWord && enableAudio && audioTiming === 'after') {
      speak(currentWord.word, currentWord.language || 'en-US');
    }
  };

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (index >= words.length && words.length > 0) {
    return <SummaryScreen stats={stats} onRetry={resetQuiz} onHome={onBack} />;
  }

  if (words.length === 0) {
    return (
      <div className={`min-h-screen p-6 text-center flex flex-col justify-center animate-fade-in transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}>
        <p className={`mb-6 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ไม่มีคำศัพท์ให้ทดสอบใน Deck นี้</p>
        <button onClick={onBack} className="text-primary font-bold">← กลับไปหน้าหลัก</button>
      </div>
    );
  }

  const progressPercent = ((index) / words.length) * 100;

  return (
    <div className={`min-h-screen flex flex-col animate-fade-in transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Header Sticky */}
      <div className={`sticky top-0 backdrop-blur-md z-10 px-4 py-4 flex justify-between items-center border-b transition-colors ${
        isDarkMode ? 'bg-slate-950/80 border-slate-900' : 'bg-white/80 border-slate-100'
      }`}>
        <button onClick={onBack} className={`p-2 rounded-full transition ${
          isDarkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
        }`}>
          <X size={24} />
        </button>
        <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
          isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-400'
        }`}>
          Word {index + 1} of {words.length}
        </div>
        <div className="flex gap-4 text-xs font-black">
           <span className="text-green-500">✓ {stats.correct}</span>
           <span className="text-red-400">✗ {stats.incorrect}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
        <div 
          className="bg-primary h-1 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex-1 p-6 flex flex-col max-w-lg w-full mx-auto">
        <div className="flex-1 flex flex-col justify-center relative py-10">
          {enableAudio && (
            <button 
              onClick={() => speak(currentWord.word, currentWord.language || 'en-US')}
              className={`absolute top-4 right-0 p-4 rounded-2xl transition-all z-10 border ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-indigo-400 hover:bg-slate-800/80' 
                  : 'bg-white border-slate-50 text-primary hover:bg-primary hover:text-white shadow-xl shadow-slate-200/50'
              }`}
              title="ฟังอีกครั้ง"
            >
              <Volume2 size={24} />
            </button>
          )}

          <QuizCard 
            word={currentWord} 
            revealed={revealed} 
            onReveal={handleReveal} 
          />
        </div>

        {/* Action Area */}
        <div className="mt-8 mb-6 h-40 flex items-center justify-center">
          {!revealed ? (
            <button 
              onClick={handleReveal}
              className={`w-full font-black py-5 rounded-3xl text-xl active:scale-[0.98] transition-all shadow-2xl ${
                isDarkMode 
                  ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-white/5' 
                  : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20'
              }`}
            >
              REVEAL ANSWER
            </button>
          ) : (
            <div className="w-full animate-slide-up">
              <div className="flex gap-4">
                <button 
                  onClick={() => handleSelfCheck(false)}
                  className={`flex-1 font-black py-6 rounded-3xl text-lg active:scale-[0.98] transition-all flex flex-col items-center gap-1 shadow-xl ${
                    isDarkMode 
                      ? 'bg-slate-900 border border-slate-800 text-red-400 hover:bg-slate-800/50 shadow-black/10' 
                      : 'bg-white border border-red-100 text-red-500 hover:bg-red-50 shadow-red-500/5'
                  }`}
                >
                  <XIcon size={24} />
                  <span className="text-[10px] uppercase tracking-widest">Hard</span>
                </button>
                <button 
                  onClick={() => handleSelfCheck(true)}
                  className="flex-1 bg-primary text-white font-black py-6 rounded-3xl text-lg hover:bg-primary-dark active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex flex-col items-center gap-1"
                >
                  <Check size={24} />
                  <span className="text-[10px] uppercase tracking-widest">Got it</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
