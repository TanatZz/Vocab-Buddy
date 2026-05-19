import { ref, get, set, update, remove } from 'firebase/database';
import { db } from './firebase-config.js';

// Fallback สำหรับ crypto.randomUUID
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * ดึงคำศัพท์ทั้งหมดใน Deck
 * @param {string} deckId - Deck ID
 * @returns {Promise<Object[]>} Array ของ Word objects
 */
export const getWordsByDeckId = async (deckId) => {
  if (!deckId) throw new Error('Deck ID is required');
  try {
    const wordsRef = ref(db, `words/${deckId}`);
    const snapshot = await get(wordsRef);
    if (snapshot.exists()) {
      const words = [];
      snapshot.forEach((childSnapshot) => {
        words.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      return words;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting words:', error);
    throw new Error('ไม่สามารถดึงข้อมูลคำศัพท์ได้: ' + error.message);
  }
};

/**
 * เพิ่มคำศัพท์ใหม่ใน Deck
 * @param {string} deckId - Deck ID
 * @param {Object} wordData - ข้อมูลคำศัพท์
 * @returns {Promise<string>} ID ของคำศัพท์ใหม่
 */
export const addWord = async (deckId, wordData) => {
  if (!deckId) throw new Error('Deck ID is required');
  try {
    const wordId = generateId();
    const wordRef = ref(db, `words/${deckId}/${wordId}`);
    const newWord = {
      createdAt: Date.now(),
      difficulty: 'medium',
      reviewCount: 0,
      correctCount: 0,
      streak: 0,
      ...wordData
    };
    await set(wordRef, newWord);
    
    // อัปเดต wordCount ใน Deck
    try {
        const deckRef = ref(db, `decks/${deckId}`);
        const deckSnapshot = await get(deckRef);
        if (deckSnapshot.exists()) {
            const currentCount = deckSnapshot.val().wordCount || 0;
            await update(deckRef, { wordCount: currentCount + 1 });
        }
    } catch (updateError) {
        console.warn('Could not update wordCount, but word was added:', updateError);
    }

    return wordId;
  } catch (error) {
    console.error('Error adding word:', error);
    throw new Error('ไม่สามารถเพิ่มคำศัพท์ได้: ' + error.message);
  }
};

/**
 * อัปเดตคำศัพท์
 * @param {string} deckId - Deck ID
 * @param {string} wordId - Word ID
 * @param {Object} updates - ข้อมูลที่ต้องการอัปเดต
 * @returns {Promise<void>}
 */
export const updateWord = async (deckId, wordId, updates) => {
  if (!deckId || !wordId) throw new Error('Deck ID and Word ID are required');
  try {
    const wordRef = ref(db, `words/${deckId}/${wordId}`);
    await update(wordRef, updates);
  } catch (error) {
    console.error('Error updating word:', error);
    throw new Error('ไม่สามารถอัปเดตคำศัพท์ได้');
  }
};

/**
 * ลบคำศัพท์
 * @param {string} deckId - Deck ID
 * @param {string} wordId - Word ID
 * @returns {Promise<void>}
 */
export const deleteWord = async (deckId, wordId) => {
  if (!deckId || !wordId) throw new Error('Deck ID and Word ID are required');
  try {
    const wordRef = ref(db, `words/${deckId}/${wordId}`);
    await remove(wordRef);

    // ลด wordCount ใน Deck
    const deckRef = ref(db, `decks/${deckId}`);
    const deckSnapshot = await get(deckRef);
    if (deckSnapshot.exists()) {
        const currentCount = deckSnapshot.val().wordCount || 0;
        if(currentCount > 0) {
            await update(deckRef, { wordCount: currentCount - 1 });
        }
    }
  } catch (error) {
    console.error('Error deleting word:', error);
    throw new Error('ไม่สามารถลบคำศัพท์ได้');
  }
};

/**
 * อัปเดตระดับความยากของคำศัพท์หลังจากการทดสอบ
 * @param {string} deckId - Deck ID
 * @param {string} wordId - Word ID
 * @param {string} difficulty - ความยาก (easy, medium, hard)
 * @param {boolean} isCorrect - ตอบถูกหรือไม่
 * @returns {Promise<void>}
 */
export const updateWordDifficulty = async (deckId, wordId, difficulty, isCorrect) => {
  if (!deckId || !wordId) throw new Error('Deck ID and Word ID are required');
  try {
    const wordRef = ref(db, `words/${deckId}/${wordId}`);
    const snapshot = await get(wordRef);
    
    if (snapshot.exists()) {
        const word = snapshot.val();
        let newStreak = isCorrect ? (word.streak || 0) + 1 : 0;
        let newCorrectCount = isCorrect ? (word.correctCount || 0) + 1 : (word.correctCount || 0);

        await update(wordRef, {
            difficulty,
            streak: newStreak,
            correctCount: newCorrectCount,
            reviewCount: (word.reviewCount || 0) + 1,
            lastReviewDate: Date.now()
        });
    } else {
        throw new Error('ไม่พบคำศัพท์นี้');
    }
  } catch (error) {
    console.error('Error updating word difficulty:', error);
    throw new Error('ไม่สามารถอัปเดตความยากของคำศัพท์ได้');
  }
};