import { useState } from 'react';
import { Plus, BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDecksForUser, useCreateDeck } from '../hooks/useDeckManagement.js';
import DeckModal from './DeckModal.jsx';

export default function DeckListScreen({ onDeckSelect }) {
  const { user } = useAuth();
  const { decks, loading, error, refresh } = useDecksForUser(user?.uid);
  const { create } = useCreateDeck(refresh);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateDeck = async (deckData) => {
    if (user) {
      await create(user.uid, deckData);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="px-6 pt-10 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vocab Buddy</h1>
        <p className="text-slate-500 mt-1 font-medium">ทบทวนคำศัพท์ของคุณให้แม่นยำ</p>
      </header>

      <div className="px-6">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 mb-6 rounded-2xl text-sm animate-fade-in">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">คลังคำศัพท์</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white p-2.5 rounded-full hover:bg-primary-dark shadow-lg shadow-primary/20 transition active:scale-95"
            aria-label="สร้าง Deck"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Loading State */}
        {loading && !decks.length && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && decks.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100 mt-4 animate-pop">
            <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มี Deck</h3>
            <p className="text-slate-500 mb-6 text-sm">เริ่มสร้างคลังคำศัพท์แรกของคุณ!</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-primary border border-slate-200 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition active:scale-95"
            >
              + สร้าง Deck ใหม่
            </button>
          </div>
        )}

        {/* Deck Grid */}
        <div className="grid grid-cols-1 gap-4 mt-2">
          {decks.map((deck) => (
            <div 
              key={deck.id}
              onClick={() => onDeckSelect && onDeckSelect(deck.id)}
              className="group bg-white border border-slate-100 rounded-3xl p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer active:scale-[0.98] animate-slide-up"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-primary/5 transition-colors">
                  <Layers className="text-slate-400 group-hover:text-primary transition-colors" size={24} />
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full text-xs font-bold text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <span>{deck.wordCount || 0} words</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{deck.name}</h3>
              {deck.description && <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{deck.description}</p>}
              
              <div className="mt-5 flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Start Practice</span>
                <Plus size={16} className="ml-1 rotate-45" />
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
