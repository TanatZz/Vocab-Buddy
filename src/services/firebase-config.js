import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

/**
 * Firebase Configuration Object
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ตรวจสอบความถูกต้องของ Config เบื้องต้น
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value || value === 'your-api-key' || value.includes('your-'))
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error('❌ Firebase Config ไม่สมบูรณ์: กรุณาตั้งค่า .env.local ให้ถูกต้อง', missingKeys);
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getDatabase(app);
export const auth = getAuth(app);

export default app;