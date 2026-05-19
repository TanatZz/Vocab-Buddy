import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDecksForUser, useCreateDeck } from '../hooks/useDeckManagement.js';
import DeckModal from './DeckModal.jsx';

export default function DeckListScreen({ onDeckSelect }) {
  const { user } = useAuth();
  const { decks, loading, error, refresh } = useDecksForUser(user?.uid);
  const { create, loading: creating } = useCreateDeck(refresh);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateDeck = async (deckData) => {
    if (user) {
      await create(user.uid, deckData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold">คลังคำศัพท์ของฉัน</h1>
        <p className="text-indigo-100 mt-1">เลือก Deck เพื่อเริ่มทบทวนคำศัพท์</p>
      </div>

      <div className="p-4 mt-2">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-sm text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Decks ทั้งหมด</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm transition"
          >
            + สร้าง Deck
          </button>
        </div>

        {/* Loading State */}
        {loading && !decks.length && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && decks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 mt-4">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">ยังไม่มี Deck</h3>
            <p className="text-gray-500 mb-6 text-sm">เริ่มสร้างคลังคำศัพท์แรกของคุณได้เลย!</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-100 text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-200 transition"
            >
              + สร้าง Deck ใหม่
            </button>
          </div>
        )}

        {/* Deck Grid */}
        <div className="grid grid-cols-1 gap-3 mt-2">
          {decks.map((deck) => (
            <div 
              key={deck.id}
              onClick={() => onDeckSelect && onDeckSelect(deck.id)}
              className={`${deck.color || 'bg-gradient-to-r from-indigo-500 to-purple-600'} text-white rounded-2xl p-5 hover:shadow-lg transition cursor-pointer active:scale-95`}
            >
              <h3 className="text-xl font-bold mb-1">{deck.name}</h3>
              {deck.description && <p className="text-white/80 text-sm mb-3 line-clamp-1">{deck.description}</p>}
              
              <div className="flex items-center gap-2 mt-4 bg-white/20 px-3 py-1.5 rounded-lg w-fit text-sm font-medium">
                <span>🔤</span>
                <span>{deck.wordCount || 0} คำ</span>
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
