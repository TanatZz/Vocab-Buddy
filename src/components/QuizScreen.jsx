import { useEffect, useState, useCallback } from 'react';
import { X, Volume2, Check, X as XIcon, Heart, Zap, RotateCcw, Home as HomeIcon } from 'lucide-react';
import { useQuiz } from '../hooks/useQuiz.js';
import { useTheme } from '../context/ThemeContext.jsx';
import QuizCard from './QuizCard.jsx';
import SummaryScreen from './SummaryScreen.jsx';

export default function QuizScreen({ deckId, settings = {}, onBack }) {
  const { isDarkMode } = useTheme();
  
  const { 
    enableAudio = true, 
    audioTiming = 'after', 
    playMode = 'standard', 
    timeLimit = 5,
    displayMode = 'word-to-meaning'
  } = settings;

  const {
    currentWord,
    words,
    index,
    revealed,
    setRevealed,
    stats,
    loading,
    lives,
    isGameOver,
    handleSelfCheck,
    resetQuiz
  } = useQuiz(deckId, settings);

  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const speak = (text, language = 'en-US') => {
    if (!window.speechSynthesis || !enableAudio) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // แปลงภาษาแบบย่อให้เป็นรหัสภาษาเต็มสำหรับออกเสียงอย่างถูกต้อง
    const langMap = { en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', th: 'th-TH' };
    utterance.lang = langMap[language] || language || 'en-US';
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (currentWord && enableAudio && audioTiming === 'before' && !revealed) {
      speak(currentWord.word, currentWord.language || 'en-US');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord, index, enableAudio, audioTiming]);

  const handleReveal = useCallback(() => {
    setRevealed(true);
    if (currentWord && enableAudio && audioTiming === 'after') {
      speak(currentWord.word, currentWord.language || 'en-US');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord, enableAudio, audioTiming]);

  // Timer Effect for Time Attack
  useEffect(() => {
    if (playMode !== 'time-attack' || revealed || isTimedOut || loading || !currentWord) return;

    setTimeLeft(timeLimit);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(interval);
          handleReveal();
          setIsTimedOut(true);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [index, revealed, playMode, timeLimit, loading, currentWord, isTimedOut, handleReveal]);

  // Reset timer state when word changes
  useEffect(() => {
    setIsTimedOut(false);
    setTimeLeft(timeLimit);
  }, [index, timeLimit]);

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isGameOver) {
    const accuracy = stats.correct + stats.incorrect > 0 
      ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100) 
      : 0;

    return (
      <div className={`min-h-[85vh] flex flex-col justify-center items-center p-8 text-center animate-fade-in transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#fafafa] text-slate-900'
      }`}>
        <div className={`mb-6 p-6 rounded-full transition-colors flex items-center justify-center animate-bounce ${
          isDarkMode ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-red-50 text-red-500'
        }`}>
          <Heart size={64} fill="#ef4444" className="text-red-500 animate-pulse" />
        </div>
        
        <h2 className="text-3xl font-black mb-2 text-red-500">GAME OVER</h2>
        <p className={`font-bold uppercase tracking-widest text-xs mb-10 transition-colors ${
          isDarkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>ท้าทายความจำขั้นสุด: หัวใจหมดเกลี้ยง!</p>

        <div className={`rounded-[40px] p-8 border w-full max-w-sm mb-10 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 shadow-none' 
            : 'bg-white border-slate-50 shadow-2xl shadow-slate-200/50'
        }`}>
          <div className="mb-6">
            <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>คำศัพท์ที่ทำได้</div>
            <div className="text-5xl font-black text-red-500">{stats.correct}</div>
          </div>

          <div className={`grid grid-cols-2 gap-4 pt-6 border-t ${
            isDarkMode ? 'border-slate-800/80' : 'border-slate-100'
          }`}>
            <div>
              <div className={`text-[10px] font-black uppercase mb-1 ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>ความแม่นยำ</div>
              <div className={`text-xl font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{accuracy}%</div>
            </div>
            <div>
              <div className={`text-[10px] font-black uppercase mb-1 ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>คำที่ทบทวนจริง</div>
              <div className={`text-xl font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{stats.correct + stats.incorrect}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button 
            onClick={resetQuiz}
            className="w-full bg-red-500 text-white font-black py-4 rounded-3xl shadow-xl shadow-red-500/20 hover:bg-red-650 transition active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <RotateCcw size={18} />
            เล่นใหม่อีกครั้ง
          </button>
          <button 
            onClick={onBack}
            className={`w-full font-black py-4 rounded-3xl transition active:scale-[0.98] flex items-center justify-center gap-3 text-sm ${
              isDarkMode 
                ? 'bg-slate-900 text-slate-350 hover:bg-slate-800 hover:text-white border border-slate-800/80' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100 shadow-sm'
            }`}
          >
            <HomeIcon size={16} />
            กลับสู่หน้ารายละเอียด
          </button>
        </div>
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

        {/* Heart display if in sudden-death mode */}
        {playMode === 'sudden-death' ? (
          <div className="flex gap-1.5 justify-center items-center">
            {[1, 2, 3].map((heartIndex) => {
              const active = heartIndex <= lives;
              return (
                <Heart
                  key={heartIndex}
                  size={20}
                  fill={active ? '#ef4444' : 'none'}
                  className={`transition-all duration-300 ${
                    active ? 'text-red-500 scale-100 animate-pulse' : 'text-slate-300 dark:text-slate-750 scale-90 opacity-40'
                  }`}
                />
              );
            })}
          </div>
        ) : (
          <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
            isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-400'
          }`}>
            Word {index + 1} of {words.length}
          </div>
        )}

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

      {/* Time Attack Timer Countdown Bar */}
      {playMode === 'time-attack' && !revealed && (
        <div className={`w-full h-1 transition-all duration-305 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div
            className={`h-1 transition-all duration-100 ease-linear ${
              timeLeft < 2 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
            }`}
            style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
          ></div>
        </div>
      )}

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
            displayMode={displayMode}
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
          ) : isTimedOut ? (
            <div className="w-full animate-slide-up flex flex-col items-center gap-3">
              <div className="text-red-500 font-extrabold text-sm uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                <Zap size={16} /> หมดเวลาแล้ว! (Time's Up)
              </div>
              <button 
                onClick={() => handleSelfCheck(false)}
                className="w-full bg-red-500 text-white font-black py-5 rounded-3xl text-lg hover:bg-red-650 active:scale-[0.98] transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <span>คำถัดไป</span>
              </button>
            </div>
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
