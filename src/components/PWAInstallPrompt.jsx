import React, { useState, useEffect } from 'react';
import { initInstallPrompt, requestInstallPrompt } from '../utils/pwaSetup.js';

export default function PWAInstallPrompt() {
  const [isPromptAvailable, setIsPromptAvailable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้เคยปิด prompt ไปหรือยังใน session นี้
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // เริ่มดักจับ event 'beforeinstallprompt'
    initInstallPrompt(setIsPromptAvailable);
  }, []);

  const handleInstall = async () => {
    const installed = await requestInstallPrompt();
    if (installed) {
      setIsPromptAvailable(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  // ไม่แสดงถ้า ไม่มี prompt, ถูกปิดไปแล้ว หรือกำลังใช้เป็น PWA อยู่แล้ว (standalone)
  if (!isPromptAvailable || isDismissed || window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  // เฉพาะบนมือถือ
  if (window.innerWidth > 768) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between z-50 animate-fade-in border-2 border-indigo-400">
      <div className="flex flex-col">
        <span className="font-bold">Vocab Buddy</span>
        <span className="text-xs text-indigo-100">ติดตั้งแอปเพื่อใช้แบบออฟไลน์ได้</span>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleDismiss}
          className="text-indigo-200 hover:text-white text-sm"
        >
          ไว้ทีหลัง
        </button>
        <button 
          onClick={handleInstall}
          className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition"
        >
          ติดตั้งเลย
        </button>
      </div>
    </div>
  );
}
