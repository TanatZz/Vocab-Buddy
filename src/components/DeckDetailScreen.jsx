import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Plus, Download, Settings, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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

  const { delete: deleteDeckItem } = useDeleteDeck(() => {
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
      for (const wordData of wordsToImport) {
        const isDuplicate = words.some(w => w.word.toLowerCase() === wordData.word.toLowerCase());
        if (!isDuplicate) {
          await addWordItem(wordData);
        }
      }
      refreshWords();
    } catch (err) {
      console.error('Import failed:', err);
      throw new Error('เกิดข้อผิดพลาดในการนำเข้าข้อมูลบางส่วน', { cause: err });
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
    if (window.confirm('คุณต้องการลบ Deck นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      await deleteDeckItem(deckId);
    }
  };

  const handleDeleteWord = async (wordId) => {
    await deleteWordItem(deckId, wordId);
  };

  if (deckLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (deckError || !deck) {
    return (
      <div className="min-h-screen bg-white p-6 text-center">
        <p className="text-red-500 my-10 font-medium">{deckError || 'ไม่พบข้อมูล Deck'}</p>
        <button onClick={onBack} className="text-primary font-bold flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={18} /> กลับไปหน้าหลัก
        </button>
      </div>
    );
  }

  const totalWords = words.length;
  const correctCount = words.reduce((sum, word) => sum + (word.correctCount || 0), 0);
  const reviewCount = words.reduce((sum, word) => sum + (word.reviewCount || 0), 0);
  const accuracy = reviewCount > 0 ? Math.round((correctCount / reviewCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-white pb-24 animate-fade-in">
      {/* Navigation Header */}
      <header className="px-4 py-4 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-50">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-900 truncate flex-1">{deck.name}</h2>
        <button 
          onClick={handleDeleteDeck}
          className="p-2 text-slate-300 hover:text-red-500 transition"
          aria-label="Delete Deck"
        >
          <Trash2 size={20} />
        </button>
      </header>

      <div className="px-6 py-6">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{deck.name}</h1>
          {deck.description && <p className="text-slate-500 font-medium leading-relaxed">{deck.description}</p>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Words</div>
            <div className="text-xl font-black text-slate-900">{totalWords}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Correct</div>
            <div className="text-xl font-black text-green-600">{correctCount}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accuracy</div>
            <div className="text-xl font-black text-primary">{accuracy}%</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <button 
            onClick={() => onStartQuiz && onStartQuiz(deckId, { enableAudio, audioTiming })}
            disabled={totalWords === 0}
            className="w-full bg-primary text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg active:scale-95"
          >
            <Play size={20} fill="currentColor" />
            เริ่มฝึกฝนตอนนี้
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handleAddClick}
              className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-2xl hover:bg-slate-50 transition flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              <Plus size={18} /> เพิ่มคำ
            </button>
            <button 
              onClick={() => setIsQuickImportOpen(true)}
              className="flex-1 bg-slate-50 border border-slate-100 text-primary font-bold py-3.5 px-4 rounded-2xl hover:bg-primary/5 transition flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              <Download size={18} /> นำเข้าด่วน
            </button>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="mb-8 overflow-hidden">
          <button 
            onClick={() => setShowQuizSettings(!showQuizSettings)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${showQuizSettings ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <Settings size={18} />
              การตั้งค่าการทดสอบ
            </div>
            {showQuizSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {showQuizSettings && (
            <div className="mt-2 p-5 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-5 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">ออกเสียงอัตโนมัติ</div>
                  <div className="text-[11px] text-slate-400">ใช้ Text-to-Speech อ่านคำศัพท์</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={enableAudio} 
                    onChange={(e) => handleUpdateQuizSettings({ enableAudio: e.target.checked })} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {enableAudio && (
                <div className="pt-2 border-t border-slate-50">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">จังหวะการอ่าน</div>
                  <div className="flex p-1 bg-slate-50 rounded-xl">
                    <button 
                      onClick={() => handleUpdateQuizSettings({ audioTiming: 'before' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${audioTiming === 'before' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      ก่อนเฉลย
                    </button>
                    <button 
                      onClick={() => handleUpdateQuizSettings({ audioTiming: 'after' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${audioTiming === 'after' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">รายการคำศัพท์</h3>
             <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{totalWords} WORDS</span>
          </div>
          
          <div className="space-y-2">
            {wordsError && <p className="text-red-500 text-sm mb-3">{wordsError}</p>}
            
            <WordList 
              words={words}
              onEdit={handleEditClick}
              onDelete={handleDeleteWord}
              onAdd={handleAddClick}
            />
            
            {wordsLoading && (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>
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
