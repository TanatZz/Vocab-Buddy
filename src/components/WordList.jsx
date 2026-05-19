import React, { useState, useMemo } from 'react';
import WordListItem from './WordListItem.jsx';

export default function WordList({ words, onEdit, onDelete, onAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, hard, easy

  const filteredAndSortedWords = useMemo(() => {
    let result = [...words];

    // การค้นหา
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(w => 
        w.word.toLowerCase().includes(term) || 
        w.meaning.toLowerCase().includes(term)
      );
    }

    // การเรียงลำดับ
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'oldest':
          return (a.createdAt || 0) - (b.createdAt || 0);
        case 'hard': {
          const difficultyRank = { 'hard': 3, 'medium': 2, 'easy': 1 };
          return (difficultyRank[b.difficulty || 'medium'] - difficultyRank[a.difficulty || 'medium']) || 
                 ((a.correctCount || 0) - (b.correctCount || 0)); // ผิดเยอะขึ้นก่อน
        }
        case 'easy': {
          const difficultyRank = { 'hard': 3, 'medium': 2, 'easy': 1 };
          return (difficultyRank[a.difficulty || 'medium'] - difficultyRank[b.difficulty || 'medium']);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [words, searchTerm, sortBy]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg font-semibold text-gray-800">รายการคำศัพท์ ({words.length})</h2>
        <button 
          onClick={onAdd}
          className="bg-white border border-indigo-200 text-indigo-700 font-semibold py-2 px-4 rounded-xl shadow-sm hover:bg-indigo-50 transition text-sm"
        >
          + เพิ่มคำศัพท์
        </button>
      </div>

      {words.length > 0 && (
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="ค้นหาคำศัพท์..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
          >
            <option value="newest">ใหม่สุด</option>
            <option value="oldest">เก่าสุด</option>
            <option value="hard">ยากไปง่าย</option>
            <option value="easy">ง่ายไปยาก</option>
          </select>
        </div>
      )}

      {words.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-3">✍️</div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">ยังไม่มีคำศัพท์</h3>
          <p className="text-gray-500 text-sm mb-4">เพิ่มคำศัพท์คำแรกของคุณใน Deck นี้</p>
          <button 
            onClick={onAdd}
            className="bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-200 transition"
          >
            + เพิ่มคำศัพท์ใหม่
          </button>
        </div>
      ) : filteredAndSortedWords.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          ไม่พบคำศัพท์ที่ค้นหา
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedWords.map((word) => (
            <WordListItem 
              key={word.id} 
              word={word} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
