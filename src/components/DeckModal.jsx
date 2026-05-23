import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const COLORS = [
  'bg-slate-900',
  'bg-primary',
  'bg-emerald-500',
  'bg-orange-400',
  'bg-red-400',
  'bg-violet-500',
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'th', label: 'Thai' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
];

export default function DeckModal({ isOpen, onClose, onSave, initialDeck = null }) {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState(initialDeck?.name || '');
  const [description, setDescription] = useState(initialDeck?.description || '');
  const [language, setLanguage] = useState(initialDeck?.language || 'en');
  const [color, setColor] = useState(initialDeck?.color || COLORS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state เมื่อ modal เปิดหรือ initialDeck เปลี่ยน (แก้ stale state bug)
  useEffect(() => {
    if (isOpen) {
      setName(initialDeck?.name || '');
      setDescription(initialDeck?.description || '');
      setLanguage(initialDeck?.language || 'en');
      setColor(initialDeck?.color || COLORS[0]);
      setError('');
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen, initialDeck]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณากรอกชื่อ Deck');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        language,
        color
      });
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
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
          {initialDeck ? 'Edit Deck' : 'New Deck'}
        </h2>
        
        {error && (
          <p className={`text-xs font-bold mb-4 p-3 rounded-xl border ${
            isDarkMode 
              ? 'text-red-400 bg-red-950/20 border-red-900/30' 
              : 'text-red-500 bg-red-50 border-red-100/50'
          }`}>{error}</p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Deck Name</label>
            <input 
              type="text" 
              className={`w-full p-4 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-900 border border-slate-800 text-white focus:bg-slate-950' 
                  : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white'
              }`}
              placeholder="e.g. Travel Vocabulary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Description</label>
            <textarea 
              className={`w-full p-4 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-900 border border-slate-800 text-white focus:bg-slate-950' 
                  : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white'
              }`}
              placeholder="What is this deck about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>Accent Color</label>
              <div className="flex gap-2 flex-wrap items-center h-full pb-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full ${c} ${color === c ? 'ring-4 ring-primary/10 ring-offset-2' : 'scale-90 opacity-60'}`}
                  />
                ))}
              </div>
            </div>
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
            {loading ? 'SAVING...' : 'SAVE DECK'}
          </button>
        </form>
      </div>
    </div>
  );
}
