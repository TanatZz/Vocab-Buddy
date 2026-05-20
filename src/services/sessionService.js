import { ref, get, set } from 'firebase/database';
import { db } from './firebase-config.js';

// Fallback for generating unique ID
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * บันทึกประวัติการทบทวน (Study Session) ลง Firebase และ LocalStorage
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @param {string} deckName - ชื่อสำรับ (เพื่อประหยัดการ fetch ข้อมูล Deck ในภายหลัง)
 * @param {number} reviewCount - จำนวนคำที่ทบทวน
 * @param {number} correctCount - จำนวนคำที่จำได้
 * @param {number} durationSeconds - เวลาที่ใช้ในการทบทวน (วินาที)
 * @returns {Promise<Object>} Session object
 */
export const addStudySession = async (userId, deckId, deckName, reviewCount, correctCount, durationSeconds) => {
  if (!userId) throw new Error('User ID is required');

  const sessionId = generateId();
  const session = {
    id: sessionId,
    deckId: deckId || 'all',
    deckName: deckName || 'สำรับทั่วไป',
    reviewCount: Number(reviewCount) || 0,
    correctCount: Number(correctCount) || 0,
    duration: Number(durationSeconds) || 0,
    timestamp: Date.now()
  };

  // 1. บันทึกลง LocalStorage เสมอ เพื่อการทำงานแบบ Offline
  try {
    const localKey = `vocab_buddy_sessions_${userId}`;
    const localData = localStorage.getItem(localKey);
    const sessions = localData ? JSON.parse(localData) : [];
    sessions.push(session);
    localStorage.setItem(localKey, JSON.stringify(sessions));
  } catch (localErr) {
    console.warn('LocalStorage error while saving session:', localErr);
  }

  // 2. บันทึกลง Firebase Realtime Database
  try {
    const sessionRef = ref(db, `studySessions/${userId}/${sessionId}`);
    await set(sessionRef, session);
  } catch (fbErr) {
    console.warn('Firebase error while saving session (offline mode active):', fbErr);
    // ไม่ throw error เพื่อไม่ให้ขัดขวางการทำงานของผู้ใช้ขณะ offline
  }

  return session;
};

/**
 * ดึงประวัติการทบทวนทั้งหมดของผู้ใช้
 * @param {string} userId - User ID
 * @returns {Promise<Object[]>} รายการประวัติการเรียนทั้งหมด เรียงตามวันเวลาจากล่าสุดไปเก่าสุด
 */
export const getStudySessions = async (userId) => {
  if (!userId) return [];

  const localKey = `vocab_buddy_sessions_${userId}`;
  let localSessions = [];

  // ดึงจาก LocalStorage ก่อนเป็นอันดับแรก
  try {
    const localData = localStorage.getItem(localKey);
    localSessions = localData ? JSON.parse(localData) : [];
  } catch (e) {
    console.error('Error reading sessions from localStorage:', e);
  }

  try {
    // ดึงจาก Firebase Database
    const sessionsRef = ref(db, `studySessions/${userId}`);
    const snapshot = await get(sessionsRef);

    if (snapshot.exists()) {
      const fbSessions = [];
      snapshot.forEach(child => {
        fbSessions.push({ id: child.key, ...child.val() });
      });

      // ซิงโครไนซ์: อัปโหลด Session ใน Local ที่ยังไม่มีบน Firebase
      const fbSessionIds = new Set(fbSessions.map(s => s.id));
      const unsynced = localSessions.filter(s => !fbSessionIds.has(s.id));

      if (unsynced.length > 0) {
        for (const s of unsynced) {
          try {
            const refForUpload = ref(db, `studySessions/${userId}/${s.id}`);
            await set(refForUpload, s);
            fbSessions.push(s);
          } catch (err) {
            console.warn('Failed to sync session to Firebase:', err);
          }
        }
      }

      // บันทึกกลับลง LocalStorage ให้เป็นก้อนเดียวกับ Firebase
      const sortedSessions = fbSessions.sort((a, b) => b.timestamp - a.timestamp);
      try {
        localStorage.setItem(localKey, JSON.stringify(sortedSessions));
      } catch (localSaveErr) {
        console.warn('Failed to update localStorage with synced sessions:', localSaveErr);
      }

      return sortedSessions;
    }
  } catch (fbErr) {
    console.warn('Firebase failed to fetch sessions. Falling back to local storage:', fbErr);
  }

  // คืนค่าจาก LocalStorage (เรียงลำดับตามความใหม่)
  return localSessions.sort((a, b) => b.timestamp - a.timestamp);
};
