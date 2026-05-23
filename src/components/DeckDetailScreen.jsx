import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Plus, Database, Settings, Trash2, ChevronDown, ChevronUp, Zap, Clock, Heart } from 'lucide-react';
import { getDeckById, updateDeck } from '../services/deckService.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useWords, useAddWord, useUpdateWord, useDeleteWord } from '../hooks/useWordManagement.js';
import { useDeleteDeck } from '../hooks/useDeckManagement.js';
import WordModal from './WordModal.jsx';
import WordList from './WordList.jsx';
import DataManagementModal from './DataManagementModal.jsx';

export default function DeckDetailScreen({ deckId, onBack, onStartQuiz }) {
  const [deck, setDeck] = useState(null);
  const [deckLoading, setDeckLoading] = useState(true);
  const [deckError, setDeckError] = useState(null);
  const { isDarkMode } = useTheme();
  
  // Quiz Settings State
  const [enableAudio, setEnableAudio] = useState(true);
  const [audioTiming, setAudioTiming] = useState('after');
  const [playMode, setPlayMode] = useState('standard');
  const [timeLimit, setTimeLimit] = useState(5);
  const [displayMode, setDisplayMode] = useState('word-to-meaning');
  const [showQuizSettings, setShowQuizSettings] = useState(false);

  // Word Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  
  // Data Management Modal State
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

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

  const isCombinedDeck = deckId ? deckId.includes(',') : false;

  useEffect(() => {
    const fetchDeck = async () => {
      if (!deckId) return;
      setDeckLoading(true);
      try {
        if (isCombinedDeck) {
          const ids = deckId.split(',');
          const deckPromises = ids.map(id => getDeckById(id));
          const decksResults = await Promise.all(deckPromises);
          
          const combinedDeck = {
            id: deckId,
            name: decksResults.map(d => d.name).join(' + '),
            description: `สำรับคละพิเศษประกอบด้วย: ${decksResults.map(d => d.name).join(', ')}`,
            wordCount: decksResults.reduce((sum, d) => sum + (d.wordCount || 0), 0),
            color: 'bg-primary',
            quizSettings: decksResults[0]?.quizSettings || {
              enableAudio: true,
              audioTiming: 'after',
              playMode: 'standard',
              timeLimit: 5,
              displayMode: 'word-to-meaning'
            }
          };
          setDeck(combinedDeck);
          
          const qSettings = combinedDeck.quizSettings;
          setEnableAudio(qSettings.enableAudio ?? true);
          setAudioTiming(qSettings.audioTiming ?? 'after');
          setPlayMode(qSettings.playMode ?? 'standard');
          setTimeLimit(qSettings.timeLimit ?? 5);
          setDisplayMode(qSettings.displayMode ?? 'word-to-meaning');
        } else {
          const deckData = await getDeckById(deckId);
          setDeck(deckData);
          // Load settings from deck data if exist
          if (deckData.quizSettings) {
            setEnableAudio(deckData.quizSettings.enableAudio ?? true);
            setAudioTiming(deckData.quizSettings.audioTiming ?? 'after');
            setPlayMode(deckData.quizSettings.playMode ?? 'standard');
            setTimeLimit(deckData.quizSettings.timeLimit ?? 5);
            setDisplayMode(deckData.quizSettings.displayMode ?? 'word-to-meaning');
          }
        }
      } catch (err) {
        setDeckError(err.message);
      } finally {
        setDeckLoading(false);
      }
    };

    fetchDeck();
  }, [deckId, isCombinedDeck]);

  const handleUpdateQuizSettings = async (updates) => {
    const newSettings = {
      enableAudio: updates.enableAudio !== undefined ? updates.enableAudio : enableAudio,
      audioTiming: updates.audioTiming !== undefined ? updates.audioTiming : audioTiming,
      playMode: updates.playMode !== undefined ? updates.playMode : playMode,
      timeLimit: updates.timeLimit !== undefined ? updates.timeLimit : timeLimit,
      displayMode: updates.displayMode !== undefined ? updates.displayMode : displayMode
    };
    
    // Optimistic update
    if (updates.enableAudio !== undefined) setEnableAudio(updates.enableAudio);
    if (updates.audioTiming !== undefined) setAudioTiming(updates.audioTiming);
    if (updates.playMode !== undefined) setPlayMode(updates.playMode);
    if (updates.timeLimit !== undefined) setTimeLimit(updates.timeLimit);
    if (updates.displayMode !== undefined) setDisplayMode(updates.displayMode);

    try {
      if (!isCombinedDeck) {
        await updateDeck(deckId, { quizSettings: newSettings });
      }
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
      <div className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (deckError || !deck) {
    return (
      <div className={`min-h-screen p-6 text-center transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}>
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
    <div className={`min-h-screen pb-24 animate-fade-in transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
    }`}>
      {/* Navigation Header */}
      <header className={`px-4 py-4 flex items-center gap-4 sticky top-0 backdrop-blur-md z-10 border-b transition-colors ${
        isDarkMode ? 'bg-slate-950/80 border-slate-900 text-white' : 'bg-white/80 border-slate-100 text-slate-900'
      }`}>
        <button onClick={onBack} className={`p-2 rounded-full transition ${
          isDarkMode ? 'hover:bg-slate-900 text-slate-400' : 'hover:bg-slate-50 text-slate-600'
        }`}>
          <ArrowLeft size={24} />
        </button>
        <h2 className={`text-lg font-bold truncate flex-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{deck.name}</h2>
        {!isCombinedDeck && (
          <button 
            onClick={handleDeleteDeck}
            className={`p-2 transition ${isDarkMode ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`}
            aria-label="Delete Deck"
          >
            <Trash2 size={20} />
          </button>
        )}
      </header>

      <div className="px-6 py-6">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className={`text-3xl font-extrabold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{deck.name}</h1>
          {deck.description && <p className={`font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{deck.description}</p>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-100/50'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Words</div>
            <div className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{totalWords}</div>
          </div>
          <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-100/50'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Correct</div>
            <div className={`text-xl font-black ${isDarkMode ? 'text-emerald-400' : 'text-green-600'}`}>{correctCount}</div>
          </div>
          <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-100/50'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Accuracy</div>
            <div className={`text-xl font-black ${isDarkMode ? 'text-indigo-400' : 'text-primary'}`}>{accuracy}%</div>
          </div>
        </div>

        {/* Play Mode Selection */}
        <div className="mb-8">
          <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            โหมดการเล่น
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Standard Mode Card */}
            <button
              onClick={() => handleUpdateQuizSettings({ playMode: 'standard' })}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 active:scale-95 duration-200 ${
                playMode === 'standard'
                  ? isDarkMode
                    ? 'bg-slate-900 border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                    : 'bg-white border-primary text-primary shadow-lg shadow-primary/10'
                  : isDarkMode
                    ? 'bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${playMode === 'standard' ? 'bg-primary/15 text-primary' : 'bg-slate-500/10'}`}>
                <Clock size={16} />
              </div>
              <span className="text-[11px] font-black tracking-wide">ทั่วไป</span>
            </button>

            {/* Sudden Death Card */}
            <button
              onClick={() => handleUpdateQuizSettings({ playMode: 'sudden-death' })}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 active:scale-95 duration-200 ${
                playMode === 'sudden-death'
                  ? 'border-red-500 text-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : isDarkMode
                    ? 'bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${playMode === 'sudden-death' ? 'bg-red-500/15 text-red-500' : 'bg-slate-500/10'}`}>
                <Heart size={16} fill={playMode === 'sudden-death' ? 'currentColor' : 'none'} />
              </div>
              <span className="text-[11px] font-black tracking-wide">ท้าทาย</span>
            </button>

            {/* Time Attack Card */}
            <button
              onClick={() => handleUpdateQuizSettings({ playMode: 'time-attack' })}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 active:scale-95 duration-200 ${
                playMode === 'time-attack'
                  ? 'border-amber-500 text-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : isDarkMode
                    ? 'bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${playMode === 'time-attack' ? 'bg-amber-500/15 text-amber-500' : 'bg-slate-500/10'}`}>
                <Zap size={16} />
              </div>
              <span className="text-[11px] font-black tracking-wide">จำกัดเวลา</span>
            </button>
          </div>

          {/* Mode Descriptions */}
          <div className={`mt-3 p-3 rounded-2xl text-[11px] font-medium leading-relaxed border transition-all ${
            isDarkMode ? 'bg-slate-900/30 border-slate-900 text-slate-400' : 'bg-slate-50/50 border-slate-50 text-slate-500'
          }`}>
            {playMode === 'standard' && '🎯 ทบทวนคำศัพท์ตามน้ำหนักความยากง่ายด้วยระบบ Spaced Repetition'}
            {playMode === 'sudden-death' && '❤️ มี 3 หัวใจ ตอบผิด 3 ครั้งเกมโอเวอร์ทันที! กดดันและท้าทายความจำขั้นสุด'}
            {playMode === 'time-attack' && '⏳ ตอบคำศัพท์ภายใต้เวลาที่จำกัด หากหมดเวลาจะถือว่าผิดทันที'}
          </div>

          {/* Time Attack Timer Settings */}
          {playMode === 'time-attack' && (
            <div className="mt-3.5 animate-slide-up">
              <div className={`flex justify-between items-center p-3 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
              }`}>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>เวลาต่อข้อ:</span>
                <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                  {[3, 5, 10].map(seconds => (
                    <button
                      key={seconds}
                      onClick={() => handleUpdateQuizSettings({ timeLimit: seconds })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all ${
                        timeLimit === seconds
                          ? 'bg-amber-500 text-white shadow-sm'
                          : isDarkMode
                            ? 'text-slate-500 hover:text-slate-350'
                            : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {seconds}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <button 
            onClick={() => onStartQuiz && onStartQuiz(deckId, { enableAudio, audioTiming, playMode, timeLimit, displayMode })}
            disabled={totalWords === 0}
            className="w-full bg-primary text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg active:scale-95"
          >
            <Play size={20} fill="currentColor" />
            เริ่มฝึกฝนตอนนี้
          </button>
          
          {!isCombinedDeck && (
            <div className="flex gap-3">
              <button 
                onClick={handleAddClick}
                className={`flex-1 border font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 active:scale-95 text-sm ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Plus size={18} /> เพิ่มคำ
              </button>
              <button 
                onClick={() => setIsDataModalOpen(true)}
                className={`flex-1 border font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 active:scale-95 text-sm ${
                  isDarkMode 
                    ? 'bg-slate-900/40 border-slate-850 hover:bg-slate-800/40 text-indigo-400' 
                    : 'bg-slate-50 border-slate-100 text-primary hover:bg-primary/5'
                }`}
              >
                <Database size={18} /> จัดการข้อมูล
              </button>
            </div>
          )}
        </div>

        {/* Quiz Settings */}
        <div className="mb-8 overflow-hidden">
          <button 
            onClick={() => setShowQuizSettings(!showQuizSettings)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
              showQuizSettings 
                ? 'bg-slate-900 text-white border border-slate-800' 
                : isDarkMode 
                  ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800' 
                  : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <Settings size={18} />
              การตั้งค่าการทดสอบ
            </div>
            {showQuizSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {showQuizSettings && (
            <div className={`mt-2 p-5 rounded-2xl border shadow-xl transition-all space-y-5 animate-slide-up ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 shadow-black/35' 
                : 'bg-white border-slate-100 shadow-slate-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>ออกเสียงอัตโนมัติ</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>ใช้ Text-to-Speech อ่านคำศัพท์</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={enableAudio} 
                    onChange={(e) => handleUpdateQuizSettings({ enableAudio: e.target.checked })} 
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${
                    isDarkMode ? 'bg-slate-950' : 'bg-slate-200'
                  }`}></div>
                </label>
              </div>

              {enableAudio && (
                <div className={`pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>จังหวะการอ่าน</div>
                  <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                    <button 
                      onClick={() => handleUpdateQuizSettings({ audioTiming: 'before' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                        audioTiming === 'before' 
                          ? isDarkMode 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'bg-white text-primary shadow-sm' 
                          : isDarkMode 
                            ? 'text-slate-500 hover:text-slate-300' 
                            : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      ก่อนเฉลย
                    </button>
                    <button 
                      onClick={() => handleUpdateQuizSettings({ audioTiming: 'after' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                        audioTiming === 'after' 
                          ? isDarkMode 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'bg-white text-primary shadow-sm' 
                          : isDarkMode 
                            ? 'text-slate-500 hover:text-slate-300' 
                            : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      หลังเฉลย
                    </button>
                  </div>
                </div>
              )}

              {/* โหมดแสดงผลการทดสอบ (Word to Meaning / Meaning to Word) */}
              <div className={`pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                <div className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>โหมดการแสดงผล</div>
                <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                  <button 
                    onClick={() => handleUpdateQuizSettings({ displayMode: 'word-to-meaning' })}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      displayMode === 'word-to-meaning' 
                        ? isDarkMode 
                          ? 'bg-slate-900 text-white shadow-sm' 
                          : 'bg-white text-primary shadow-sm' 
                        : isDarkMode 
                          ? 'text-slate-500 hover:text-slate-300' 
                          : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    คำศัพท์ → แปลไทย
                  </button>
                  <button 
                    onClick={() => handleUpdateQuizSettings({ displayMode: 'meaning-to-word' })}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      displayMode === 'meaning-to-word' 
                        ? isDarkMode 
                          ? 'bg-slate-900 text-white shadow-sm' 
                          : 'bg-white text-primary shadow-sm' 
                        : isDarkMode 
                          ? 'text-slate-500 hover:text-slate-300' 
                          : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    แปลไทย → คำศัพท์
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Word List Area */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>รายการคำศัพท์</h3>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
               isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-500'
             }`}>{totalWords} WORDS</span>
          </div>
          
          <div className="space-y-2">
            {wordsError && <p className="text-red-500 text-sm mb-3">{wordsError}</p>}
            
            <WordList 
              words={words}
              onEdit={isCombinedDeck ? null : handleEditClick}
              onDelete={isCombinedDeck ? null : handleDeleteWord}
              onAdd={isCombinedDeck ? null : handleAddClick}
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

      {/* Data Management Modal (Quick Paste, File Import, Export) */}
      <DataManagementModal 
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        deckId={deckId}
        deck={deck}
        onImportSuccess={refreshWords}
      />
    </div>
  );
}
