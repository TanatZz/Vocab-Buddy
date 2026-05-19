import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, PlusCircle } from 'lucide-react';
import WordListItem from './WordListItem.jsx';

export default function WordList({ words, onEdit, onDelete, onAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, hard, easy

  const filteredAndSortedWords = useMemo(() => {
    let result = [...words];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(w => 
        w.word.toLowerCase().includes(term) || 
        w.meaning.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'oldest':
          return (a.createdAt || 0) - (b.createdAt || 0);
        case 'hard': {
          const difficultyRank = { 'hard': 3, 'medium': 2, 'easy': 1 };
          return (difficultyRank[b.difficulty || 'medium'] - difficultyRank[a.difficulty || 'medium']) || 
                 ((a.correctCount || 0) - (b.correctCount || 0));
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
    <div className="animate-fade-in">
      {words.length > 0 && (
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหา..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-9 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 focus:bg-white focus:outline-none appearance-none cursor-pointer transition-all"
            >
              <option value="newest">NEW</option>
              <option value="oldest">OLD</option>
              <option value="hard">HARD</option>
              <option value="easy">EASY</option>
            </select>
          </div>
        </div>
      )}

      {words.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200 animate-pop">
          <div className="bg-white w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="text-slate-200" size={24} />
          </div>
          <h3 className="text-md font-bold text-slate-800 mb-1">คลังคำศัพท์ว่างเปล่า</h3>
          <p className="text-slate-400 text-xs mb-6">เริ่มเพิ่มคำศัพท์เพื่อฝึกฝน</p>
          <button 
            onClick={onAdd}
            className="bg-white text-primary border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition active:scale-95"
          >
            + เพิ่มคำศัพท์
          </button>
        </div>
      ) : filteredAndSortedWords.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-medium animate-fade-in">
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
