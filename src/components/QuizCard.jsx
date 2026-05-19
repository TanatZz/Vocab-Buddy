import React from 'react';

export default function QuizCard({ word, revealed, onReveal }) {
  return (
    <div 
      className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-8 text-white min-h-[300px] flex flex-col justify-center items-center cursor-pointer shadow-lg transition-all duration-300 transform active:scale-95 relative overflow-hidden"
      onClick={!revealed ? onReveal : undefined}
    >
      {/* Background Decorative Circles */}
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-indigo-900/20 rounded-full blur-2xl"></div>

      <div className="text-center z-10 w-full">
        {!revealed ? (
          <>
            <h2 className="text-4xl font-bold mb-4">{word.meaning}</h2>
            <div className="text-indigo-100 bg-black/10 px-4 py-2 rounded-xl inline-block mt-4">
              ✍️ เขียนลงบนกระดาษของคุณ
            </div>
            <p className="text-sm text-white/60 mt-8 animate-pulse">แตะเพื่อดูเฉลย</p>
          </>
        ) : (
          <div className="animate-fade-in w-full">
            <h2 className="text-5xl font-extrabold mb-2 text-green-300">{word.word}</h2>
            {word.pronunciation && (
              <p className="text-xl text-white/80 mb-6">/{word.pronunciation}/</p>
            )}
            <div className="h-px w-full bg-white/20 my-6"></div>
            <p className="text-2xl">{word.meaning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
