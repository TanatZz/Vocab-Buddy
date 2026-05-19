import React, { useState } from 'react';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'th', label: 'Thai' },
];

export default function WordModal({ isOpen, onClose, onSave, initialWord = null, deckId }) {
  const [word, setWord] = useState(initialWord?.word || '');
  const [meaning, setMeaning] = useState(initialWord?.meaning || '');
  const [pronunciation, setPronunciation] = useState(initialWord?.pronunciation || '');
  const [language, setLanguage] = useState(initialWord?.language || 'en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) {
      setError('กรุณากรอกคำศัพท์');
      return;
    }
    if (word.length > 100) {
      setError('คำศัพท์ต้องไม่เกิน 100 ตัวอักษร');
      return;
    }
    if (!meaning.trim()) {
      setError('กรุณากรอกคำแปล');
      return;
    }
    if (meaning.length > 200) {
      setError('คำแปลต้องไม่เกิน 200 ตัวอักษร');
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
      
      // Reset form if it's a new word to allow continuous adding
      if (!initialWord) {
        setWord('');
        setMeaning('');
        setPronunciation('');
        // Keep language the same
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {initialWord ? 'แก้ไขคำศัพท์' : 'เพิ่มคำศัพท์ใหม่'}
        </h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำศัพท์ <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="เช่น Apple"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำแปล (ภาษาไทย) <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="เช่น แอปเปิ้ล"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำอ่าน (ไม่บังคับ)</label>
            <input 
              type="text" 
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="เช่น แอพ-เปิ้ล หรือ ˈæpəl"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ภาษา</label>
            <select 
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
