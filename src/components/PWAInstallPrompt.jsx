import { useState, useEffect } from 'react';
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
    <div className="fixed bottom-24 left-6 right-6 bg-slate-900 text-white p-5 rounded-[30px] shadow-2xl shadow-slate-900/40 flex items-center justify-between z-50 animate-pop border border-slate-800">
      <div className="flex flex-col">
        <span className="font-black tracking-tight">Vocab Buddy</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Install for offline access</span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleDismiss}
          className="text-slate-500 hover:text-white text-xs font-bold"
        >
          LATER
        </button>
        <button 
          onClick={handleInstall}
          className="bg-primary text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-primary/20 active:scale-95 transition"
        >
          INSTALL
        </button>
      </div>
    </div>
  );
}
