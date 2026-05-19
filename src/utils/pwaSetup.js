// เก็บ event ไว้ใช้ตอนผู้ใช้กดปุ่ม
let deferredPrompt = null;

/**
 * เช็คว่าเบราว์เซอร์รองรับ Service Worker หรือไม่
 */
export const checkPWASupport = () => {
  return 'serviceWorker' in navigator;
};

/**
 * ลงทะเบียน Service Worker
 */
export const registerServiceWorker = async () => {
  if (checkPWASupport()) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      return registration;
    } catch (err) {
      console.log('ServiceWorker registration failed: ', err);
      throw err;
    }
  }
  return null;
};

/**
 * บันทึก event เมื่อเบราว์เซอร์พร้อมให้ติดตั้ง PWA
 */
export const initInstallPrompt = (setPromptAvailable) => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // ป้องกันไม่ให้เบราว์เซอร์แสดง popup อัตโนมัติ (ในบางเบราว์เซอร์)
    e.preventDefault();
    // เก็บ event ไว้ใช้เรียกตอนหลัง
    deferredPrompt = e;
    if (setPromptAvailable) {
      setPromptAvailable(true);
    }
  });

  window.addEventListener('appinstalled', () => {
    // ผู้ใช้ติดตั้งแล้ว เคลียร์ event
    deferredPrompt = null;
    console.log('PWA was installed');
    if (setPromptAvailable) {
      setPromptAvailable(false);
    }
  });
};

/**
 * เรียกแสดง Dialog ติดตั้ง PWA
 */
export const requestInstallPrompt = async () => {
  if (!deferredPrompt) {
    return false;
  }
  // แสดง prompt
  deferredPrompt.prompt();
  // รอผู้ใช้ตอบสนอง
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);
  // deferredPrompt ถูกใช้แล้ว จะใช้ซ้ำไม่ได้
  deferredPrompt = null;
  return outcome === 'accepted';
};

/**
 * เช็คว่าตอนนี้สามารถติดตั้งได้หรือไม่ (มี prompt เก็บไว้)
 */
export const canBeInstalled = () => {
  return !!deferredPrompt;
};
