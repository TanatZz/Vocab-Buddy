import { useState, useEffect, useRef } from 'react';
import { X, FileText, Download, Clipboard, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { parseCSV, parseJSON, validateData, importWords } from '../services/importService.js';
import { getWordsByDeckId } from '../services/wordService.js';
import { exportAsCSV, exportAsJSON, downloadFile } from '../services/exportService.js';

export default function DataManagementModal({ isOpen, onClose, deckId, deck, onImportSuccess }) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'file-import' | 'export'
  const fileInputRef = useRef(null);

  // Tab 1: Paste Text State
  const [pasteText, setPasteText] = useState('');
  const [pasteLoading, setPasteLoading] = useState(false);
  const [pasteError, setPasteError] = useState('');

  // Tab 2: File Import State
  const [importFile, setImportFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [importStrategy, setImportStrategy] = useState('skip'); // 'skip' | 'replace'
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [importResult, setImportResult] = useState(null);

  // Tab 3: Export State
  const [exportFormat, setExportFormat] = useState('csv'); // 'csv' | 'json'
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      // Reset state on open
      setPasteText('');
      setPasteError('');
      setPasteLoading(false);
      setImportFile(null);
      setPreviewData(null);
      setFileError('');
      setImportResult(null);
      setExportLoading(false);
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Handlers for Tab 1: Quick Paste ---
  const handlePasteImport = async () => {
    if (!pasteText.trim()) {
      setPasteError('กรุณาวางข้อความก่อนกดยืนยัน');
      return;
    }

    setPasteLoading(true);
    setPasteError('');

    try {
      const lines = pasteText.trim().split('\n');
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
            language: deck?.language || 'en'
          });
        }
      });

      if (wordsToImport.length === 0) {
        throw new Error('ไม่พบข้อมูลคำศัพท์ที่ถูกต้อง');
      }

      const existingWords = await getWordsByDeckId(deckId);
      const { importedCount, skippedCount } = await importWords(deckId, wordsToImport, 'skip', existingWords);

      setPasteText('');
      setImportResult({ importedCount, skippedCount });
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setPasteError(err.message);
    } finally {
      setPasteLoading(false);
    }
  };

  // --- Handlers for Tab 2: File Import ---
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setImportFile(selectedFile);
    setFileError('');
    setImportResult(null);
    setPreviewData(null);

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
        if (!validation.valid && validation.validWords.length === 0) {
          throw new Error(validation.errors.join('\n'));
        }

        if (validation.errors.length > 0) {
          setFileError(`คำเตือน: พบข้อผิดพลาดในบางบรรทัด:\n${validation.errors.slice(0, 3).join('\n')}${validation.errors.length > 3 ? '\nและอื่นๆ...' : ''}`);
        }

        setPreviewData(validation.validWords);
      } catch (err) {
        setFileError('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message);
        setImportFile(null);
        setPreviewData(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleFileImportSubmit = async () => {
    if (!previewData || previewData.length === 0) return;

    setFileLoading(true);
    setFileError('');
    try {
      const existingWords = await getWordsByDeckId(deckId);
      const { importedCount, skippedCount } = await importWords(deckId, previewData, importStrategy, existingWords);

      setImportResult({ importedCount, skippedCount });
      setPreviewData(null);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setFileError('เกิดข้อผิดพลาดในการนำเข้า: ' + err.message);
    } finally {
      setFileLoading(false);
    }
  };

  // --- Handlers for Tab 3: Export ---
  const handleExportSubmit = async () => {
    setExportLoading(true);
    try {
      const words = await getWordsByDeckId(deckId);

      if (words.length === 0) {
        alert('Deck นี้ไม่มีคำศัพท์ให้ส่งออก');
        return;
      }

      let content, filename, mimeType;

      if (exportFormat === 'csv') {
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
      setExportLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className={`rounded-[40px] w-full max-w-lg animate-pop relative border transition-all duration-300 flex flex-col max-h-[90vh] overflow-hidden ${
        isDarkMode 
          ? 'bg-slate-950 border-slate-900 shadow-none text-slate-100' 
          : 'bg-white border-slate-50 shadow-2xl shadow-slate-200/50 text-slate-900'
      }`}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 transition-colors z-10 ${
            isDarkMode ? 'text-slate-600 hover:text-slate-400' : 'text-slate-300 hover:text-slate-500'
          }`}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-primary animate-pulse" size={24} />
            <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              จัดการข้อมูลสำรับ
            </h2>
          </div>
          <p className={`font-bold text-[10px] uppercase tracking-widest transition-colors ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            สำรับ: <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{deck?.name}</span>
          </p>
        </div>

        {/* Custom Tab Switcher */}
        <div className={`flex px-8 border-b ${isDarkMode ? 'border-slate-900' : 'border-slate-100'}`}>
          {[
            { id: 'paste', label: 'วางข้อความ', icon: Clipboard },
            { id: 'file-import', label: 'นำเข้าไฟล์', icon: Upload },
            { id: 'export', label: 'ส่งออกไฟล์', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setImportResult(null);
                  setPasteError('');
                  setFileError('');
                }}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-black text-xs uppercase tracking-wider transition-all relative ${
                  isActive 
                    ? 'border-primary text-primary' 
                    : isDarkMode 
                      ? 'border-transparent text-slate-500 hover:text-slate-350' 
                      : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-8 overflow-y-auto flex-1 max-h-[50vh]">
          {/* Result Alert (Shared among import states) */}
          {importResult && (
            <div className={`p-4 rounded-2xl mb-6 border flex gap-3 animate-fade-in ${
              isDarkMode 
                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                : 'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}>
              <Check size={20} className="shrink-0" />
              <div>
                <h4 className="font-black text-sm mb-1">ดำเนินการสำเร็จ! 🎉</h4>
                <p className="text-xs font-semibold">นำเข้า/อัปเดต: {importResult.importedCount} คำศัพท์</p>
                <p className="text-xs font-semibold">ข้ามคำซ้ำ: {importResult.skippedCount} คำศัพท์</p>
              </div>
            </div>
          )}

          {/* TAB 1: Paste Text */}
          {activeTab === 'paste' && (
            <div className="animate-slide-up flex flex-col">
              <p className={`font-medium text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                วางรายการคำศัพท์ลงในช่องด้านล่าง ระบบจะนำเข้าโดยอัตโนมัติ 
                <br />
                รูปแบบ: <span className="font-bold text-primary">คำศัพท์, คำแปล</span> (หนึ่งบรรทัดต่อคำ)
              </p>

              {pasteError && (
                <div className={`p-3 rounded-xl border flex gap-2 text-xs font-bold mb-4 ${
                  isDarkMode 
                    ? 'text-red-400 bg-red-950/20 border-red-900/30' 
                    : 'text-red-500 bg-red-50 border-red-100'
                }`}>
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{pasteError}</span>
                </div>
              )}

              <textarea 
                className={`w-full h-44 p-4 rounded-[20px] focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none font-mono text-xs mb-5 transition-all resize-none ${
                  isDarkMode 
                    ? 'bg-slate-900 border border-slate-800 text-white focus:bg-slate-950' 
                    : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white'
                }`}
                placeholder="Apple, แอปเปิ้ล&#10;Banana, กล้วย&#10;Cat, แมว"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                disabled={pasteLoading}
              ></textarea>

              <button 
                type="button"
                onClick={handlePasteImport}
                className={`w-full py-4 rounded-2xl font-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-sm ${
                  isDarkMode 
                    ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-white/5' 
                    : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10'
                }`}
                disabled={pasteLoading || !pasteText.trim()}
              >
                {pasteLoading ? (
                   <RefreshCw className="animate-spin" size={16} />
                ) : (
                   <Clipboard size={16} />
                )}
                นำเข้าข้อมูลคำศัพท์
              </button>
            </div>
          )}

          {/* TAB 2: File Import */}
          {activeTab === 'file-import' && (
            <div className="animate-slide-up flex flex-col">
              <p className={`font-medium text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                นำเข้าคำศัพท์ผ่านการอัปโหลดไฟล์ <span className="font-bold text-primary">.CSV</span> หรือ <span className="font-bold text-primary">.JSON</span>
              </p>

              {fileError && (
                <div className={`p-3 rounded-xl border flex gap-2 text-xs font-semibold mb-4 whitespace-pre-line ${
                  fileError.startsWith('คำเตือน') 
                    ? isDarkMode ? 'text-amber-400 bg-amber-950/20 border-amber-900/30' : 'text-amber-700 bg-amber-50 border-amber-100'
                    : isDarkMode ? 'text-red-400 bg-red-950/20 border-red-900/30' : 'text-red-500 bg-red-50 border-red-100'
                }`}>
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all mb-5 flex flex-col items-center justify-center gap-2 hover:scale-[1.01] ${
                  isDarkMode 
                    ? 'border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 text-slate-400' 
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50 text-slate-500'
                }`}
              >
                <Upload size={32} className="text-primary/70 animate-bounce mb-1" />
                <span className="font-black text-xs uppercase tracking-wide">
                  {importFile ? importFile.name : 'คลิกเพื่อเลือกไฟล์'}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : 'รองรับ .csv, .json'}
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept=".csv,.json"
                  className="hidden"
                />
              </div>

              {previewData && (
                <div className="animate-fade-in flex flex-col gap-4 mb-5">
                  <div className={`p-4 rounded-2xl border text-xs ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100 shadow-sm'
                  }`}>
                    <h5 className="font-black text-slate-500 uppercase tracking-widest mb-2 text-[9px]">
                      พรีวิวข้อมูลคำใหม่ ({previewData.length} คำ)
                    </h5>
                    <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[10px]">
                      {previewData.slice(0, 5).map((w, idx) => (
                        <div key={idx} className="flex justify-between border-b pb-0.5 last:border-0 border-slate-500/10">
                          <span className="font-bold text-primary">{w.word}</span>
                          <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>{w.meaning}</span>
                        </div>
                      ))}
                      {previewData.length > 5 && (
                        <div className="text-slate-500 text-center pt-1 font-sans font-bold">
                          และอีก {previewData.length - 5} คำ...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strategy Select */}
                  <div className="flex flex-col gap-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      นโยบายการจัดการคำซ้ำ
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'skip', label: 'ข้ามคำศัพท์ซ้ำ', desc: 'ไม่บันทึกซ้ำซ้อน' },
                        { id: 'replace', label: 'เขียนทับคำเดิม', desc: 'แทนที่คำอธิบายเดิม' }
                      ].map(option => (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => setImportStrategy(option.id)}
                          className={`p-3 rounded-2xl border text-left transition active:scale-95 duration-200 ${
                            importStrategy === option.id
                              ? 'border-primary text-primary bg-primary/5 shadow-sm'
                              : isDarkMode
                                ? 'bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-900'
                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-black block mb-0.5">{option.label}</span>
                          <span className="text-[9px] font-semibold text-slate-500 block leading-tight">{option.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="button"
                onClick={handleFileImportSubmit}
                className={`w-full py-4 rounded-2xl font-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-sm ${
                  isDarkMode 
                    ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-white/5' 
                    : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10'
                }`}
                disabled={fileLoading || !previewData}
              >
                {fileLoading ? (
                   <RefreshCw className="animate-spin" size={16} />
                ) : (
                   <Check size={16} />
                )}
                ยืนยันการนำเข้าไฟล์
              </button>
            </div>
          )}

          {/* TAB 3: Export */}
          {activeTab === 'export' && (
            <div className="animate-slide-up flex flex-col">
              <p className={`font-medium text-xs mb-5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                ส่งออกคำศัพท์ทั้งหมดในสำรับคำศัพท์นี้เพื่อบันทึกเก็บเป็นไฟล์สำรองข้อมูล (Backup) หรือนำไปประยุกต์ใช้งานในโปรแกรมอื่น เช่น Microsoft Excel
              </p>

              {/* Format Selection Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { id: 'csv', label: 'CSV Format', desc: 'สามารถใช้ใน Excel' },
                  { id: 'json', label: 'JSON Backup', desc: 'ข้อมูลดิบสากลสมบูรณ์' }
                ].map(format => (
                  <button
                    type="button"
                    key={format.id}
                    onClick={() => setExportFormat(format.id)}
                    className={`p-4 rounded-3xl border text-center transition flex flex-col items-center gap-1.5 active:scale-95 duration-200 ${
                      exportFormat === format.id
                        ? 'border-primary text-primary bg-primary/5 shadow-sm'
                        : isDarkMode
                          ? 'bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm font-black block">{format.label}</span>
                    <span className="text-[10px] font-semibold text-slate-500 block leading-tight">{format.desc}</span>
                  </button>
                ))}
              </div>

              <button 
                type="button"
                onClick={handleExportSubmit}
                className={`w-full py-4 rounded-2xl font-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-sm ${
                  isDarkMode 
                    ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-white/5' 
                    : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10'
                }`}
                disabled={exportLoading}
              >
                {exportLoading ? (
                   <RefreshCw className="animate-spin" size={16} />
                ) : (
                   <Download size={16} />
                )}
                ดาวน์โหลดไฟล์ส่งออก
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
