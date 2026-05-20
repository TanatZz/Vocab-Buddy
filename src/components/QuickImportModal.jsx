import { useState, useEffect } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function QuickImportModal({ isOpen, onClose, onImport }) {
  const { isDarkMode } = useTheme();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProcess = async () => {
    if (!text.trim()) {
      setError('กรุณาวางข้อความก่อนกดยืนยัน');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const lines = text.trim().split('\n');
      const wordsToImport = [];

      lines.forEach((line) => {
        if (!line.trim()) return;

        let parts = [];
        if (line.includes('\t')) {
          parts = line.split('\t');
        } else if (line.includes(',')) {
          parts = line.split(',');
        } else if (line.includes(' - ')) {
          parts = line.split(' - ');
        } else {
          const trimmedLine = line.trim();
          const firstSpace = trimmedLine.indexOf(' ');
          if (firstSpace !== -1) {
            parts = [trimmedLine.substring(0, firstSpace), trimmedLine.substring(firstSpace + 1)];
          } else {
            parts = [trimmedLine];
          }
        }

        const word = parts[0]?.trim();
        const meaning = parts[1]?.trim();

        if (word && meaning) {
          wordsToImport.push({
            word,
            meaning,
            pronunciation: parts[2]?.trim() || '',
            language: 'en'
          });
        }
      });

      if (wordsToImport.length === 0) {
        throw new Error('ไม่พบข้อมูลคำศัพท์ที่ถูกต้อง');
      }

      await onImport(wordsToImport);
      setText('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className={`rounded-[40px] p-8 w-full max-w-lg animate-pop relative border transition-all duration-300 ${
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

        <div className="flex items-center gap-3 mb-2">
           <FileText className="text-primary" size={24} />
           <h2 className={`text-2xl font-black tracking-tight ${
             isDarkMode ? 'text-white' : 'text-slate-900'
           }`}>Bulk Import</h2>
        </div>
        <p className={`font-medium text-xs mb-8 transition-colors ${
          isDarkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Format: <span className={`font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Word, Meaning</span> (one per line)
        </p>

        {error && (
          <p className={`text-xs font-bold mb-4 p-3 rounded-xl border ${
            isDarkMode 
              ? 'text-red-400 bg-red-950/20 border-red-900/30' 
              : 'text-red-500 bg-red-50 border-red-100/50'
          }`}>{error}</p>
        )}

        <textarea 
          className={`w-full h-64 p-5 rounded-[30px] focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none font-mono text-xs mb-6 transition-all ${
            isDarkMode 
              ? 'bg-slate-900 border border-slate-800 text-white focus:bg-slate-950' 
              : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white'
          }`}
          placeholder="Apple, แอปเปิ้ล&#10;Banana, กล้วย&#10;Cat, แมว"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        ></textarea>

        <button 
          type="button"
          onClick={handleProcess}
          className={`w-full py-5 rounded-3xl font-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 ${
            isDarkMode 
              ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-white/5' 
              : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10'
          }`}
          disabled={loading}
        >
          {loading ? (
             <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
          ) : (
             <Download size={20} />
          )}
          IMPORT WORDS
        </button>
      </div>
    </div>
  );
}
