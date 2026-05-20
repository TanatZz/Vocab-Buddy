import { useState, useMemo } from 'react';
import { Plus, BookOpen, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useDecksForUser, useCreateDeck } from '../hooks/useDeckManagement.js';
import DeckModal from './DeckModal.jsx';

export default function DeckListScreen({ onDeckSelect }) {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { decks, loading, error, refresh } = useDecksForUser(user?.uid);
  const { create } = useCreateDeck(refresh);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLang, setActiveLang] = useState('all');

  const handleCreateDeck = async (deckData) => {
    if (user) {
      await create(user.uid, deckData);
    }
  };

  // แถบตัวกรองภาษามินิมอล
  const LANG_FILTERS = [
    { value: 'all', label: 'ALL' },
    { value: 'en', label: 'EN' },
    { value: 'zh', label: 'ZH' },
    { value: 'ja', label: 'JA' },
    { value: 'th', label: 'TH' }
  ];

  // ฟังก์ชันจัดฟอร์แมตป้ายกำกับภาษา
  const getLanguageTag = (lang) => {
    switch (lang) {
      case 'en': return '🇬🇧 EN';
      case 'zh': return '🇨🇳 ZH';
      case 'ja': return '🇯🇵 JA';
      case 'th': return '🇹🇭 TH';
      default: return lang ? lang.toUpperCase() : 'EN';
    }
  };

  // กรองสำรับคำศัพท์ในฟรอนต์เอนด์ (Reactive Filter)
  const filteredDecks = useMemo(() => {
    if (!decks) return [];
    return decks.filter(deck => {
      const matchesSearch = deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (deck.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLang = activeLang === 'all' || deck.language === activeLang;
      return matchesSearch && matchesLang;
    });
  }, [decks, searchQuery, activeLang]);

  return (
    <div className={`min-h-screen pb-28 animate-fade-in transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#fafafa] text-slate-900'
    }`}>
      {/* Header Section */}
      <header className="px-6 pt-10 pb-6 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Vocab Buddy
            </h1>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-black tracking-widest uppercase">
              <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>STUDYSPACE</span>
              <span className={isDarkMode ? 'text-slate-600' : 'text-slate-300'}>/</span>
              <span className={isDarkMode ? 'text-slate-400 font-bold' : 'text-slate-500 font-bold'}>
                {user?.email || 'GUEST'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleDarkMode}
              className={`p-3.5 rounded-2xl transition duration-300 active:scale-95 flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-slate-900 text-amber-400 border border-slate-800 hover:bg-slate-800' 
                  : 'bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50 shadow-sm'
              }`}
              title={isDarkMode ? 'เปิดโหมดสว่าง' : 'เปิดโหมดมืด'}
              aria-label="สลับธีม"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* New Deck Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`p-3.5 rounded-2xl transition duration-300 active:scale-95 flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-white text-slate-950 hover:bg-slate-100' 
                  : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10'
              }`}
              aria-label="สร้าง Deck"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Minimal Search & Filter controls */}
        <div className="space-y-3.5">
          {/* Search Input */}
          <input 
            type="text"
            placeholder="ค้นหาสำรับคำศัพท์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-3.5 px-5 rounded-2xl text-sm font-bold placeholder-slate-300 focus:outline-none transition-all duration-300 shadow-sm ${
              isDarkMode 
                ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:border-slate-700' 
                : 'bg-white border border-slate-200/60 text-slate-900 placeholder-slate-300 focus:border-slate-900'
            }`}
          />
          
          {/* Language filters pill row */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LANG_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setActiveLang(f.value)}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all duration-300 ${
                  activeLang === f.value
                    ? isDarkMode 
                      ? 'bg-white text-slate-950 shadow-md shadow-white/5 border-transparent'
                      : 'bg-slate-900 text-white shadow-md shadow-slate-900/10 border-transparent'
                    : isDarkMode
                      ? 'bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-400'
                      : 'bg-white border border-slate-100 hover:border-slate-300 text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-6">
        {error && (
          <div className={`border p-4 mb-6 rounded-2xl text-sm animate-fade-in ${
            isDarkMode 
              ? 'bg-red-950/20 border-red-900/50 text-red-400' 
              : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-[10px] font-black uppercase tracking-widest ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {searchQuery || activeLang !== 'all' ? 'ผลลัพธ์การค้นหา' : 'คลังคำศัพท์ของคุณ'}
          </h2>
        </div>

        {/* Loading State */}
        {loading && !decks.length && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDecks.length === 0 && (
          <div className={`text-center py-16 rounded-[32px] border shadow-sm mt-2 animate-pop transition-all ${
            isDarkMode 
              ? 'bg-slate-900/40 border-slate-900/80' 
              : 'bg-white border-slate-100/70'
          }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800' 
                : 'bg-slate-50 border-slate-100'
            }`}>
              <BookOpen className={isDarkMode ? 'text-slate-700' : 'text-slate-300'} size={32} />
            </div>
            <h3 className={`text-lg font-black mb-1 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {searchQuery || activeLang !== 'all' ? 'ไม่พบสำรับคำศัพท์' : 'ยังไม่มีสำรับคำศัพท์'}
            </h3>
            <p className={`mb-6 text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {searchQuery || activeLang !== 'all' ? 'ลองปรับแต่งคีย์เวิร์ดหรือตัวกรองภาษาใหม่' : 'เริ่มสร้างคลังคำศัพท์และสำรับแรกของคุณ!'}
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`px-6 py-3 rounded-2xl font-black text-xs transition active:scale-95 shadow-md ${
                isDarkMode 
                  ? 'bg-white text-slate-950 hover:bg-slate-100' 
                  : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/5'
              }`}
            >
              + สร้าง Deck ใหม่
            </button>
          </div>
        )}

        {/* Deck Grid */}
        <div className="grid grid-cols-1 gap-4 mt-2">
          {filteredDecks.map((deck) => (
            <div 
              key={deck.id}
              onClick={() => onDeckSelect && onDeckSelect(deck.id)}
              className={`group border rounded-[32px] p-6 transition-all duration-300 cursor-pointer active:scale-[0.99] animate-slide-up flex flex-col justify-between ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800/80 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-slate-950/60' 
                  : 'bg-white border-slate-100/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100/50'
              }`}
            >
              <div>
                {/* Accent Color Dot + Metadata */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${deck.color || 'bg-slate-900'} animate-pulse`} />
                    <span className={`text-[10px] tracking-widest font-black uppercase ${
                      isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      ACTIVE DECK
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] tracking-widest font-black uppercase border px-2 py-0.5 rounded-lg ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-900 text-slate-500' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      {getLanguageTag(deck.language)}
                    </span>
                    <span className={`text-[10px] tracking-widest font-black uppercase px-2.5 py-0.5 rounded-lg ${
                      isDarkMode 
                        ? 'bg-slate-950 text-slate-400' 
                        : 'bg-slate-100/80 text-slate-500'
                    }`}>
                      {deck.wordCount || 0} WORDS
                    </span>
                  </div>
                </div>
                
                {/* Title */}
                <h3 className={`text-xl font-black tracking-tight transition-colors ${
                  isDarkMode 
                    ? 'text-white group-hover:text-slate-200' 
                    : 'text-slate-900 group-hover:text-slate-800'
                }`}>
                  {deck.name}
                </h3>
                
                {/* Description */}
                {deck.description && (
                  <p className={`text-xs font-medium leading-relaxed mt-2 line-clamp-2 ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {deck.description}
                  </p>
                )}
              </div>
              
              {/* Vercel-Style Start Button on Hover */}
              <div className={`mt-6 flex items-center justify-between text-[10px] font-black tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <span>START REVIEW</span>
                <span className="text-lg leading-none">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeckModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateDeck}
      />
    </div>
  );
}
