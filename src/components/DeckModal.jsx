import React, { useState } from 'react';

const GRADIENTS = [
  'bg-gradient-to-r from-blue-500 to-indigo-600',
  'bg-gradient-to-r from-emerald-500 to-teal-600',
  'bg-gradient-to-r from-orange-400 to-emerald-500',
  'bg-gradient-to-r from-rose-400 to-red-500',
  'bg-gradient-to-r from-fuchsia-500 to-pink-600',
  'bg-gradient-to-r from-violet-500 to-purple-600',
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'th', label: 'Thai' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
];

export default function DeckModal({ isOpen, onClose, onSave, initialDeck = null }) {
  const [name, setName] = useState(initialDeck?.name || '');
  const [description, setDescription] = useState(initialDeck?.description || '');
  const [language, setLanguage] = useState(initialDeck?.language || 'en');
  const [color, setColor] = useState(initialDeck?.color || GRADIENTS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณากรอกชื่อ Deck');
      return;
    }
    if (name.length > 100) {
      setError('ชื่อ Deck ต้องไม่เกิน 100 ตัวอักษร');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {initialDeck ? 'แก้ไข Deck' : 'สร้าง Deck ใหม่'}
        </h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ Deck <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="เช่น คำศัพท์ผลไม้, บทเรียนที่ 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
            <textarea 
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="อธิบายเพิ่มเติม (ไม่บังคับ)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">สีพื้นหลัง</label>
            <div className="flex gap-2 flex-wrap">
              {GRADIENTS.map(grad => (
                <button
                  key={grad}
                  type="button"
                  onClick={() => setColor(grad)}
                  className={`w-8 h-8 rounded-full ${grad} ${color === grad ? 'ring-4 ring-indigo-300 ring-offset-2' : ''}`}
                />
              ))}
            </div>
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
