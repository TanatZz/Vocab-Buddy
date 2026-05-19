import React from 'react';

export default function WordListItem({ word, onEdit, onDelete }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500 flex justify-between items-center hover:bg-gray-50 transition">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-gray-800 text-lg">{word.word}</span>
          {word.pronunciation && (
            <span className="text-gray-400 text-sm">/{word.pronunciation}/</span>
          )}
        </div>
        <div className="text-gray-600">{word.meaning}</div>
        <div className="text-xs mt-2 flex gap-2">
          <span className={`px-2 py-0.5 rounded-md ${getDifficultyColor(word.difficulty)}`}>
            {word.difficulty || 'medium'}
          </span>
          <span className="text-gray-400 px-2 py-0.5 bg-gray-100 rounded-md">
            ทบทวนแล้ว {word.reviewCount || 0} ครั้ง
          </span>
        </div>
      </div>
      
      <div className="flex gap-2 ml-4">
        <button 
          onClick={() => onEdit(word)}
          className="p-2 text-gray-400 hover:text-indigo-600 transition hover:bg-indigo-50 rounded-lg"
          title="แก้ไข"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
        </button>
        <button 
          onClick={() => onDelete(word.id)}
          className="p-2 text-gray-400 hover:text-red-600 transition hover:bg-red-50 rounded-lg"
          title="ลบ"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
