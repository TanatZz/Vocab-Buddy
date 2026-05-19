import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDecksForUser } from '../hooks/useDeckManagement.js';
import { parseCSV, parseJSON, validateData, importWords } from '../services/importService.js';
import { getWordsByDeckId } from '../services/wordService.js';

export default function ImportScreen({ onBack }) {
  const { user } = useAuth();
  const { decks } = useDecksForUser(user?.uid);
  const fileInputRef = useRef(null);
  
  const [selectedDeck, setSelectedDeck] = useState('');
  const [strategy, setStrategy] = useState('skip');
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        let data = [];
        
        if (selectedFile.name.endsWith('.csv')) {
          data = parseCSV(text);
        } else if (selectedFile.name.endsWith('.json')) {
          data = parseJSON(text);
        } else {
          throw new Error('รองรับเฉพาะไฟล์ .csv และ .json เท่านั้น');
        }

        const validation = validateData(data);
        if (!validation.valid) {
          throw new Error(validation.errors.join('\n'));
        }

        setPreviewData(validation.validWords);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์:\n' + err.message);
        setFile(null);
        setPreviewData(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!selectedDeck || !previewData) return;

    setLoading(true);
    try {
      const existingWords = await getWordsByDeckId(selectedDeck);
      const { importedCount, skippedCount } = await importWords(selectedDeck, previewData, strategy, existingWords);
      
      setResult({ importedCount, skippedCount });
      setPreviewData(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการนำเข้า: ' + err.message);
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
        <h1 className="text-2xl font-bold text-gray-800">นำเข้าข้อมูล (Import)</h1>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6">
          <h3 className="font-bold mb-1">นำเข้าสำเร็จ! 🎉</h3>
          <p className="text-sm">เพิ่ม/อัปเดต: {result.importedCount} คำ</p>
          <p className="text-sm">ข้าม (คำซ้ำ): {result.skippedCount} คำ</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">เลือก Deck ปลายทาง</label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            value={selectedDeck}
            onChange={(e) => setSelectedDeck(e.target.value)}
          >
            <option value="">-- กรุณาเลือก --</option>
            {decks.map(deck => (
              <option key={deck.id} value={deck.id}>{deck.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">กรณีเจอคำศัพท์ซ้ำ</label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
          >
            <option value="skip">ข้าม (ไม่นำเข้าคำซ้ำ)</option>
            <option value="replace">เขียนทับ (อัปเดตข้อมูล)</option>
          </select>
        </div>

        <div className="mt-6 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition cursor-pointer" onClick={() => fileInputRef.current.click()}>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.json"
            className="hidden"
          />
          <div className="text-4xl mb-2">📄</div>
          <p className="font-medium text-gray-700">แตะเพื่อเลือกไฟล์ (.csv, .json)</p>
          <p className="text-sm text-gray-500 mt-1">{file ? file.name : 'หรือลากไฟล์มาวางที่นี่'}</p>
        </div>
      </div>

      {previewData && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2">ตัวอย่างข้อมูล ({previewData.length} คำ)</h3>
          <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
            {previewData.slice(0, 5).map((w, i) => (
              <div key={i} className="text-sm py-1 border-b border-gray-200 last:border-0 flex justify-between">
                <span className="font-bold text-indigo-600">{w.word}</span>
                <span className="text-gray-600">{w.meaning}</span>
              </div>
            ))}
            {previewData.length > 5 && <div className="text-center text-xs text-gray-400 mt-2">และอื่นๆ อีก {previewData.length - 5} คำ...</div>}
          </div>
          
          <button 
            onClick={handleImport}
            disabled={loading || !selectedDeck}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'กำลังนำเข้าข้อมูล...' : 'ยืนยันการนำเข้า'}
          </button>
        </div>
      )}
    </div>
  );
}
