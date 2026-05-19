import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'th', label: 'Thai' },
];

export default function WordModal({ isOpen, onClose, onSave, initialWord = null }) {
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
      <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl animate-pop relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black mb-6 text-slate-900 tracking-tight">
          {initialWord ? 'Edit Word' : 'New Word'}
        </h2>
        
        {error && <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Word</label>
            <input 
              type="text" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all"
              placeholder="e.g. Resilience"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Meaning</label>
            <input 
              type="text" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all"
              placeholder="e.g. ความยืดหยุ่น"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pronunciation</label>
            <input 
              type="text" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all text-xs"
              placeholder="e.g. rɪˈzɪliəns"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Language</label>
            <select 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:outline-none appearance-none cursor-pointer transition-all"
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
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-xl shadow-slate-900/10 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'SAVING...' : 'SAVE WORD'}
          </button>
        </form>
      </div>
    </div>
  );
}
