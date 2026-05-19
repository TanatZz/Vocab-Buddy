import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDecksForUser } from '../hooks/useDeckManagement.js';
import { getWordsByDeckId } from '../services/wordService.js';
import { exportAsCSV, exportAsJSON, downloadFile } from '../services/exportService.js';

export default function ExportScreen({ onBack }) {
  const { user } = useAuth();
  const { decks } = useDecksForUser(user?.uid);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!selectedDeck) {
      alert('กรุณาเลือก Deck ที่ต้องการส่งออก');
      return;
    }

    setLoading(true);
    try {
      const deck = decks.find(d => d.id === selectedDeck);
      const words = await getWordsByDeckId(selectedDeck);

      if (words.length === 0) {
        alert('Deck นี้ไม่มีคำศัพท์');
        setLoading(false);
        return;
      }

      let content, filename, mimeType;

      if (format === 'csv') {
        content = exportAsCSV(deck, words);
        filename = `${deck.name.replace(/\s+/g, '_')}_export.csv`;
        mimeType = 'text/csv;charset=utf-8;';
      } else {
        content = exportAsJSON(deck, words);
        filename = `${deck.name.replace(/\s+/g, '_')}_export.json`;
        mimeType = 'application/json';
      }

      downloadFile(content, filename, mimeType);

    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการส่งออก: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-500 hover:text-indigo-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">ส่งออกข้อมูล (Export)</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">เลือก Deck</label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            value={selectedDeck}
            onChange={(e) => setSelectedDeck(e.target.value)}
          >
            <option value="">-- กรุณาเลือก --</option>
            {decks.map(deck => (
              <option key={deck.id} value={deck.id}>{deck.name} ({deck.wordCount || 0} คำ)</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบไฟล์</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" name="format" value="csv" 
                checked={format === 'csv'} 
                onChange={(e) => setFormat(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>CSV (เปิดใน Excel ได้)</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" name="format" value="json" 
                checked={format === 'json'} 
                onChange={(e) => setFormat(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>JSON (สำหรับ Backup)</span>
            </label>
          </div>
        </div>

        <button 
          onClick={handleExport}
          disabled={loading || !selectedDeck}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'กำลังประมวลผล...' : 'ดาวน์โหลดไฟล์'}
        </button>
      </div>
    </div>
  );
}
