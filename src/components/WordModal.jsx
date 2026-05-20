import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'th', label: 'Thai' },
];

export default function WordModal({ isOpen, onClose, onSave, initialWord = null }) {
  const { isDarkMode } = useTheme();
  const [word, setWord] = useState(initialWord?.word || '');
  const [meaning, setMeaning] = useState(initialWord?.meaning || '');
  const [pronunciation, setPronunciation] = useState(initialWord?.pronunciation || '');
  const [language, setLanguage] = useState(initialWord?.language || 'en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onSave({
        word: word.trim(),
        meaning: meaning.trim(),
        pronunciation: pronunciation.trim(),
        language
      });
      
      if (!initialWord) {
        setWord('');
        setMeaning('');
        setPronunciation('');
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกคำศัพท์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className={`rounded-[40px] p-8 w-full max-w-sm animate-pop relative border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-950 border-slate-900 shadow-none' 
          : 'bg-white border-slate-50 shadow-2xl shadow-slate-200/50'
      }`}>
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 transition-colors ${
            isDarkMode ? 'text-slate-600 hover:text-slate-400' : 'text-slate-300 hover:text-slate-500'
          }`}
        >
          <X size={20} />
        </button>

        <h2 className={`text-2xl font-black mb-6 tracking-tight ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          {initialWord ? 'Edit Word' : 'New Word'}
        </h2>
        
        {error && (
          <p className={`text-xs font-bold mb-4 p-3 rounded-xl border ${
            isDarkMode 
              ? 'text-red-400 bg-red-950/20 border-red-900/30' 
              : 'text-red-500 bg-red-50 border-red-100/50'
          }`}>{error}</p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Word</label>
            <input 
              type="text" 
              className={`w-full p-4 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-900 border border-slate-800 text-white focus:bg-slate-950' 
                  : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white'
              }`}
              placeholder="e.g. Resilience"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Meaning</label>
            <input 
              type="text" 
              className={`w-full p-4 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-900 border border-slate-800 text-white focus:bg-slate-950' 
                  : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white'
              }`}
              placeholder="e.g. ความยืดหยุ่น"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Pronunciation</label>
            <input 
              type="text" 
              className={`w-full p-4 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all text-xs ${
                isDarkMode 
                  ? 'bg-slate-900 border border-slate-800 text-white focus:bg-slate-950' 
                  : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white'
              }`}
              placeholder="e.g. rɪˈzɪliəns"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
            />
          </div>

          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Language</label>
            <select 
              className={`w-full p-4 rounded-2xl text-sm font-bold focus:outline-none appearance-none cursor-pointer transition-all ${
                isDarkMode 
                  ? 'bg-slate-900 border border-slate-800 text-slate-300 focus:bg-slate-950' 
                  : 'bg-slate-50 border border-slate-100 text-slate-700 focus:bg-white'
              }`}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-5 rounded-3xl font-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4 ${
              isDarkMode 
                ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-white/5' 
                : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10'
            }`}
          >
            {loading ? 'SAVING...' : 'SAVE WORD'}
          </button>
        </form>
      </div>
    </div>
  );
}
