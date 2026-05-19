import React, { useState } from 'react';

export default function QuickImportModal({ isOpen, onClose, onImport }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

        // รองรับตัวคั่นหลายแบบ: จุลภาค (,), Tab (\t), หรือขีดกลาง (-)
        let parts = [];
        if (line.includes('\t')) {
          parts = line.split('\t');
        } else if (line.includes(',')) {
          parts = line.split(',');
        } else if (line.includes(' - ')) {
          parts = line.split(' - ');
        } else {
          // ถ้าไม่มีตัวคั่นที่ชัดเจน ให้ลองใช้ space แรกเป็นตัวแบ่ง
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
        throw new Error('ไม่พบข้อมูลคำศัพท์ที่ถูกต้อง กรุณาใช้รูปแบบ: คำศัพท์, คำแปล');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-2 text-gray-800">นำเข้าด่วน (Quick Import)</h2>
        <p className="text-sm text-gray-500 mb-4">
          วางรายการคำศัพท์ที่คัดลอกมา (เช่นจาก Excel หรือแชท) <br/>
          รูปแบบ: <span className="font-mono bg-gray-100 px-1 rounded text-indigo-600">คำศัพท์, คำแปล</span> (หนึ่งคำต่อหนึ่งบรรทัด)
        </p>

        {error && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}

        <textarea 
          className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm mb-4"
          placeholder="Apple, แอปเปิ้ล&#10;Banana, กล้วย&#10;Cat, แมว"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        ></textarea>

        <div className="flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button 
            type="button"
            onClick={handleProcess}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                กำลังนำเข้า...
              </>
            ) : 'ยืนยันการนำเข้า'}
          </button>
        </div>
      </div>
    </div>
  );
}
