import { ref, get, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from './firebase-config.js';

// Helper สำหรับการทำ Timeout
const withTimeout = (promise, timeoutMs = 20000) => { // เพิ่มเป็น 20 วินาที
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('การเชื่อมต่อใช้เวลานานเกินไป (Timeout) กรุณาเช็คอินเทอร์เน็ตหรือ URL ฐานข้อมูล')), timeoutMs)
    )
  ]);
};

// Fallback สำหรับ crypto.randomUUID
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * ดึงรายการ Decks ทั้งหมดของผู้ใช้
 */
export const getAllDecksForUser = async (userId) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const decksRef = ref(db, 'decks');
    // ใช้ query เพื่อกรองข้อมูลเฉพาะของตนเองจากฝั่ง Firebase Server
    const decksQuery = query(decksRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await withTimeout(get(decksQuery), 15000);
    
    const decks = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        decks.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
    }
    return decks;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูล:', error.message);
    if (error.message.includes('permission_denied')) {
        throw new Error('Permission Denied: กรุณาเช็ค Firebase Rules ว่าเป็น auth != null หรือยัง');
    }
    throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ' + error.message);
  }
};

/**
 * ดึงข้อมูล Deck ตาม ID
 * @param {string} deckId - Deck ID
 * @returns {Promise<Object>} Deck object
 */
export const getDeckById = async (deckId) => {
  if (!deckId) throw new Error('Deck ID is required');
  try {
    const deckRef = ref(db, `decks/${deckId}`);
    const snapshot = await withTimeout(get(deckRef), 5000);
    if (snapshot.exists()) {
      return { id: deckId, ...snapshot.val() };
    } else {
      throw new Error('ไม่พบ Deck นี้');
    }
  } catch (error) {
    console.error('Error getting deck:', error);
    throw new Error('ไม่สามารถดึงข้อมูล Deck ได้: ' + error.message);
  }
};

/**
 * สร้าง Deck ใหม่
 */
export const createDeck = async (userId, deckData) => {
  if (!userId) throw new Error('User ID is required');
  try {
    const deckId = generateId();
    const newDeckRef = ref(db, `decks/${deckId}`);
    const newDeck = {
      ...deckData,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount: 0
    };
    
    // หุ้มด้วย Timeout
    await withTimeout(set(newDeckRef, newDeck), 8000);
    return deckId;
  } catch (error) {
    console.error('Error creating deck:', error);
    if (error.message.includes('permission_denied')) {
        throw new Error('บันทึกข้อมูลไม่สำเร็จ: คุณไม่มีสิทธิ์เขียนข้อมูล (ตรวจสอบ Firebase Rules)');
    }
    throw new Error('ไม่สามารถสร้าง Deck ได้: ' + error.message);
  }
};

/**
 * อัปเดตข้อมูล Deck
 * @param {string} deckId - Deck ID
 * @param {Object} updates - ข้อมูลที่ต้องการอัปเดต
 * @returns {Promise<void>}
 */
export const updateDeck = async (deckId, updates) => {
  if (!deckId) throw new Error('Deck ID is required');
  try {
    const deckRef = ref(db, `decks/${deckId}`);
    await update(deckRef, { ...updates, updatedAt: Date.now() });
  } catch (error) {
    console.error('Error updating deck:', error);
    throw new Error('ไม่สามารถอัปเดต Deck ได้');
  }
};

/**
 * ลบ Deck
 * @param {string} deckId - Deck ID
 * @returns {Promise<void>}
 */
export const deleteDeck = async (deckId) => {
  if (!deckId) throw new Error('Deck ID is required');
  try {
    // ลบ Deck และ Words ที่เกี่ยวข้องพร้อมกัน
    const deckRef = ref(db, `decks/${deckId}`);
    const wordsRef = ref(db, `words/${deckId}`);
    await Promise.all([remove(deckRef), remove(wordsRef)]);
  } catch (error) {
    console.error('Error deleting deck:', error);
    throw new Error('ไม่สามารถลบ Deck ได้');
  }
};

/**
 * ดึงสถิติของ Deck (เช่น จำนวนคำที่จำได้/ไม่ได้)
 * @param {string} deckId - Deck ID
 * @returns {Promise<Object>} สถิติ
 */
export const getDeckStats = async (deckId) => {
    if (!deckId) throw new Error('Deck ID is required');
    try {
        const wordsRef = ref(db, `words/${deckId}`);
        const snapshot = await get(wordsRef);
        let stats = { total: 0, easy: 0, medium: 0, hard: 0 };
        if(snapshot.exists()) {
            snapshot.forEach(child => {
                const word = child.val();
                stats.total++;
                if(word.difficulty === 'easy') stats.easy++;
                else if(word.difficulty === 'medium') stats.medium++;
                else stats.hard++;
            });
        }
        return stats;
    } catch(error) {
        console.error('Error getting deck stats:', error);
        throw new Error('ไม่สามารถดึงสถิติของ Deck ได้');
    }
}