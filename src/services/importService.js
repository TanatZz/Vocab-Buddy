import { parseCSV as parseCSVUtil } from '../utils/csvHandler.js';
import { addWord, updateWord } from './wordService.js';

export const parseCSV = (csvText) => {
  return parseCSVUtil(csvText);
};

export const parseJSON = (jsonText) => {
  try {
    const data = JSON.parse(jsonText);
    return data.words || data; // รองรับทั้งแบบที่ export ออกไปและแบบ array ธรรมดา
  } catch (error) {
    throw new Error('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
  }
};

export const validateData = (data) => {
  if (!Array.isArray(data)) {
    return { valid: false, errors: ['ข้อมูลต้องเป็นรูปแบบรายการ (Array)'] };
  }

  const errors = [];
  const validWords = [];

  data.forEach((item, index) => {
    if (!item.word || !item.meaning) {
      errors.push(`แถวที่ ${index + 1}: ขาดคำศัพท์หรือคำแปล`);
    } else {
      validWords.push(item);
    }
  });

  return { 
    valid: errors.length === 0, 
    errors,
    validWords
  };
};

/**
 * นำเข้าข้อมูลคำศัพท์
 * @param {string} deckId 
 * @param {Array} words 
 * @param {string} strategy 'skip' (ข้ามคำซ้ำ) หรือ 'replace' (เขียนทับ)
 * @param {Array} existingWords คำศัพท์ที่มีอยู่แล้วใน Deck
 */
export const importWords = async (deckId, words, strategy, existingWords = []) => {
  let importedCount = 0;
  let skippedCount = 0;

  for (const newWord of words) {
    const existing = existingWords.find(w => w.word.toLowerCase() === newWord.word.toLowerCase());

    if (existing) {
      if (strategy === 'replace') {
        await updateWord(deckId, existing.id, newWord);
        importedCount++;
      } else {
        // strategy === 'skip'
        skippedCount++;
      }
    } else {
      // คำใหม่
      await addWord(deckId, newWord);
      importedCount++;
    }
  }

  return { importedCount, skippedCount };
};
