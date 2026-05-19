import React, { useState, useEffect } from 'react';
import { useQuiz } from '../hooks/useQuiz.js';
import QuizCard from './QuizCard.jsx';
import SummaryScreen from './SummaryScreen.jsx';

export default function QuizScreen({ deckId, settings = {}, onComplete, onBack }) {
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

  // Get settings from props with defaults
  const { enableAudio = true, audioTiming = 'after' } = settings;

  const speak = (text, language = 'en-US') => {
    if (!window.speechSynthesis || !enableAudio) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  // พูดตอนเปลี่ยนคำ (สำหรับโหมด 'before')
  useEffect(() => {
    if (currentWord && enableAudio && audioTiming === 'before' && !revealed) {
      speak(currentWord.word, currentWord.language || 'en-US');
    }
  }, [currentWord, index, enableAudio, audioTiming]);

  const handleReveal = () => {
    setRevealed(true);
    if (currentWord && enableAudio && audioTiming === 'after') {
      speak(currentWord.word, currentWord.language || 'en-US');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // ถ้าทำครบทุกคำแล้ว
  if (index >= words.length && words.length > 0) {
    return <SummaryScreen stats={stats} onRetry={resetQuiz} onHome={onBack} />;
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 text-center flex flex-col justify-center">
        <p className="text-gray-500 mb-4">ไม่มีคำศัพท์ให้ทดสอบใน Deck นี้</p>
        <button onClick={onBack} className="text-indigo-600 font-medium">← กลับไปหน้าหลัก</button>
      </div>
    );
  }

  const progressPercent = ((index) / words.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Sticky */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 py-4 flex justify-between items-center shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
          คำที่ {index + 1} / {words.length}
        </div>
        <div className="flex gap-2 text-sm font-bold">
           <span className="text-green-500">✅ {stats.correct}</span>
           <span className="text-red-500">❌ {stats.incorrect}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1.5">
        <div 
          className="bg-indigo-600 h-1.5 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex-1 p-4 flex flex-col max-w-lg w-full mx-auto">
        <div className="flex-1 flex flex-col justify-center min-h-[400px] relative">
          {/* Re-listen button (visible even before reveal if audio is enabled) */}
          {enableAudio && (
            <button 
              onClick={() => speak(currentWord.word, currentWord.language || 'en-US')}
              className="absolute top-0 right-0 p-3 bg-white shadow-md rounded-full text-indigo-600 hover:bg-indigo-50 active:scale-90 transition-all z-10 border border-gray-100"
              title="ฟังอีกครั้ง"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
              </svg>
            </button>
          )}

          <QuizCard 
            word={currentWord} 
            revealed={revealed} 
            onReveal={handleReveal} 
          />
        </div>

        {/* Action Area */}
        <div className="mt-8 mb-6 h-32 flex items-center justify-center">
          {!revealed ? (
            <button 
              onClick={handleReveal}
              className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl text-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition"
            >
              ดูเฉลย
            </button>
          ) : (
            <div className="w-full">
              {enableAudio && (
                <button 
                  onClick={() => speak(currentWord.word, currentWord.language || 'en-US')}
                  className="w-full flex justify-center items-center gap-2 bg-blue-50 text-blue-600 font-bold py-3 rounded-xl mb-4 hover:bg-blue-100 active:scale-95 transition"
                >
                  <span>🔊</span> ฟังเสียงอีกครั้ง
                </button>
              )}
              
              <div className="flex gap-4">
                <button 
                  onClick={() => handleSelfCheck(false)}
                  className="flex-1 bg-red-100 text-red-600 font-bold py-5 rounded-2xl text-lg hover:bg-red-200 active:scale-95 transition shadow-sm border border-red-200"
                >
                  ✗ จำไม่ได้
                </button>
                <button 
                  onClick={() => handleSelfCheck(true)}
                  className="flex-1 bg-green-500 text-white font-bold py-5 rounded-2xl text-lg hover:bg-green-600 active:scale-95 transition shadow-sm border border-green-600"
                >
                  ✓ จำได้
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
