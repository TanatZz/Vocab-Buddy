import { useState, useEffect } from 'react';
import { X, FileText, Download } from 'lucide-react';

export default function QuickImportModal({ isOpen, onClose, onImport }) {
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
      <div className="bg-white rounded-[40px] p-8 w-full max-w-lg shadow-2xl animate-pop relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-2">
           <FileText className="text-primary" size={24} />
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Import</h2>
        </div>
        <p className="text-slate-400 font-medium text-xs mb-8">
          Format: <span className="font-black text-slate-600">Word, Meaning</span> (one per line)
        </p>

        {error && <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

        <textarea 
          className="w-full h-64 p-5 bg-slate-50 border border-slate-100 rounded-[30px] focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none font-mono text-xs mb-6 transition-all"
          placeholder="Apple, แอปเปิ้ล&#10;Banana, กล้วย&#10;Cat, แมว"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        ></textarea>

        <button 
          type="button"
          onClick={handleProcess}
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-xl shadow-slate-900/10 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
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
