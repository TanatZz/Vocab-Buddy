import React, { useState, useEffect } from 'react';
import { getDeckById, updateDeck } from '../services/deckService.js';
import { useWords, useAddWord, useUpdateWord, useDeleteWord } from '../hooks/useWordManagement.js';
import { useDeleteDeck } from '../hooks/useDeckManagement.js';
import WordModal from './WordModal.jsx';
import WordList from './WordList.jsx';
import QuickImportModal from './QuickImportModal.jsx';

export default function DeckDetailScreen({ deckId, onBack, onStartQuiz }) {
  const [deck, setDeck] = useState(null);
  const [deckLoading, setDeckLoading] = useState(true);
  const [deckError, setDeckError] = useState(null);
  
  // Quiz Settings State
  const [enableAudio, setEnableAudio] = useState(true);
  const [audioTiming, setAudioTiming] = useState('after');
  const [showQuizSettings, setShowQuizSettings] = useState(false);

  // Word Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  
  // Quick Import State
  const [isQuickImportOpen, setIsQuickImportOpen] = useState(false);

  const { words, loading: wordsLoading, error: wordsError, refresh: refreshWords } = useWords(deckId);
  
  const { add: addWordItem } = useAddWord(deckId, () => {
    refreshWords();
  });

  const { update: updateWordItem } = useUpdateWord(() => {
    refreshWords();
    setIsModalOpen(false);
    setEditingWord(null);
  });

  const { delete: deleteWordItem } = useDeleteWord(() => {
    refreshWords();
  });

  const { delete: deleteDeckItem, loading: deleting } = useDeleteDeck(() => {
    onBack();
  });

  useEffect(() => {
    const fetchDeck = async () => {
      if (!deckId) return;
      setDeckLoading(true);
      try {
        const deckData = await getDeckById(deckId);
        setDeck(deckData);
        // Load settings from deck data if exist
        if (deckData.quizSettings) {
          setEnableAudio(deckData.quizSettings.enableAudio ?? true);
          setAudioTiming(deckData.quizSettings.audioTiming ?? 'after');
        }
      } catch (err) {
        setDeckError(err.message);
      } finally {
        setDeckLoading(false);
      }
    };

    fetchDeck();
  }, [deckId]);

  const handleUpdateQuizSettings = async (updates) => {
    const newSettings = {
      enableAudio: updates.enableAudio !== undefined ? updates.enableAudio : enableAudio,
      audioTiming: updates.audioTiming !== undefined ? updates.audioTiming : audioTiming
    };
    
    // Optimistic update
    if (updates.enableAudio !== undefined) setEnableAudio(updates.enableAudio);
    if (updates.audioTiming !== undefined) setAudioTiming(updates.audioTiming);

    try {
      await updateDeck(deckId, { quizSettings: newSettings });
    } catch (err) {
      console.error('Failed to save quiz settings:', err);
    }
  };

  const handleSaveWord = async (wordData) => {
    if (editingWord) {
      await updateWordItem(deckId, editingWord.id, wordData);
    } else {
      await addWordItem(wordData);
    }
  };

  const handleQuickImport = async (wordsToImport) => {
    try {
      // วนลูปเพิ่มคำศัพท์ทีละคำ
      for (const wordData of wordsToImport) {
        // ตรวจสอบคำซ้ำเบื้องต้น (Case insensitive)
        const isDuplicate = words.some(w => w.word.toLowerCase() === wordData.word.toLowerCase());
        if (!isDuplicate) {
          await addWordItem(wordData);
        }
      }
      refreshWords();
    } catch (err) {
      console.error('Import failed:', err);
      throw new Error('เกิดข้อผิดพลาดในการนำเข้าข้อมูลบางส่วน');
    }
  };

  const handleEditClick = (word) => {
    setEditingWord(word);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingWord(null);
    setIsModalOpen(true);
  };

  const handleDeleteDeck = async () => {
    await deleteDeckItem(deckId);
  };

  const handleDeleteWord = async (wordId) => {
    await deleteWordItem(deckId, wordId);
  };

  if (deckLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (deckError || !deck) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 text-center">
        <p className="text-red-500 my-10">{deckError || 'ไม่พบข้อมูล Deck'}</p>
        <button onClick={onBack} className="text-indigo-600 font-medium">← กลับไปหน้าหลัก</button>
      </div>
    );
  }

  // คำนวณสถิติคร่าวๆ
  const totalWords = words.length;
  const correctCount = words.reduce((sum, word) => sum + (word.correctCount || 0), 0);
  const reviewCount = words.reduce((sum, word) => sum + (word.reviewCount || 0), 0);
  const incorrectCount = reviewCount - correctCount;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className={`${deck.color || 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white p-6 rounded-b-3xl shadow-md relative`}>
        <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div className="mt-8">
          <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
          {deck.description && <p className="text-white/80">{deck.description}</p>}
        </div>
      </div>

      <div className="p-4 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">คำศัพท์ทั้งหมด</div>
            <div className="text-xl font-bold text-gray-800">{totalWords}</div>
          </div>
          <div className="text-center border-l border-r border-gray-100">
            <div className="text-xs text-green-500 mb-1">ตอบถูก</div>
            <div className="text-xl font-bold text-green-600">{correctCount}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-red-500 mb-1">ตอบผิด</div>
            <div className="text-xl font-bold text-red-600">{incorrectCount}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-4">
          <button 
            onClick={() => onStartQuiz && onStartQuiz(deckId, { enableAudio, audioTiming })}
            disabled={totalWords === 0}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            ▶️ เริ่มทดสอบ (Quiz)
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleAddClick}
              className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <span>+ เพิ่มทีละคำ</span>
            </button>
            <button 
              onClick={() => setIsQuickImportOpen(true)}
              className="flex-1 bg-white border border-indigo-200 text-indigo-600 font-semibold py-3 px-4 rounded-xl shadow-sm hover:bg-indigo-50 transition flex items-center justify-center gap-2"
            >
              <span>📥 นำเข้าด่วน (Bulk)</span>
            </button>
          </div>
        </div>

        {/* Quiz Settings Toggle */}
        <div className="mb-6">
          <button 
            onClick={() => setShowQuizSettings(!showQuizSettings)}
            className="w-full flex items-center justify-between p-3 bg-indigo-50 rounded-xl text-indigo-700 text-sm font-semibold border border-indigo-100"
          >
            <div className="flex items-center gap-2">
              <span>⚙️ ตั้งค่าการทดสอบ (Quiz Settings)</span>
            </div>
            <span>{showQuizSettings ? '▲' : '▼'}</span>
          </button>
          
          {showQuizSettings && (
            <div className="mt-2 p-4 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">เปิดเสียงอ่านอัตโนมัติ</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={enableAudio} 
                    onChange={(e) => handleUpdateQuizSettings({ enableAudio: e.target.checked })} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {enableAudio && (
                <div>
                  <span className="text-sm text-gray-600 block mb-2">ให้ออกเสียงเมื่อไหร่?</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateQuizSettings({ audioTiming: 'before' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition ${audioTiming === 'before' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                      ก่อนเฉลย
                    </button>
                    <button 
                      onClick={() => handleUpdateQuizSettings({ audioTiming: 'after' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition ${audioTiming === 'after' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                      หลังเฉลย
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Word List Area */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          {wordsError && <p className="text-red-500 text-sm mb-3">{wordsError}</p>}
          
          <WordList 
            words={words}
            onEdit={handleEditClick}
            onDelete={handleDeleteWord}
            onAdd={handleAddClick}
          />
          
          {wordsLoading && (
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>

        {/* Deck Settings */}
        <div className="mt-8 flex justify-center">
           <button 
             onClick={handleDeleteDeck}
             disabled={deleting}
             className="text-red-500 text-sm font-medium hover:text-red-600"
           >
             {deleting ? 'กำลังลบ...' : 'ลบ Deck นี้'}
           </button>
        </div>
      </div>

      {/* Word Modal */}
      <WordModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWord(null);
        }}
        onSave={handleSaveWord}
        initialWord={editingWord}
        deckId={deckId}
      />

      {/* Quick Import Modal */}
      <QuickImportModal 
        isOpen={isQuickImportOpen}
        onClose={() => setIsQuickImportOpen(false)}
        onImport={handleQuickImport}
      />
    </div>
  );
}
