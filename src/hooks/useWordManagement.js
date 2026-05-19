import { useState, useEffect, useCallback } from 'react';
import { getWordsByDeckId, addWord, updateWord, deleteWord } from '../services/wordService.js';

/**
 * Hook สำหรับดึงคำศัพท์ใน Deck
 * @param {string} deckId - Deck ID
 */
export const useWords = (deckId) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWords = useCallback(async () => {
    if (!deckId) {
      setWords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getWordsByDeckId(deckId);
      setWords(data);
      // LocalStorage Backup
      localStorage.setItem(`words_${deckId}`, JSON.stringify({
        lastSync: Date.now(),
        words: data
      }));
    } catch (err) {
      console.error(err);
      // Fallback to LocalStorage
      const cached = localStorage.getItem(`words_${deckId}`);
      if (cached) {
        setWords(JSON.parse(cached).words);
        setError('กำลังใช้งานโหมดออฟไลน์');
      } else {
        setError(err.message || 'ไม่สามารถดึงข้อมูลคำศัพท์ได้');
      }
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  return { words, loading, error, refresh: fetchWords };
};

/**
 * Hook สำหรับเพิ่มคำศัพท์ใหม่
 */
export const useAddWord = (deckId, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const add = async (wordData) => {
    setLoading(true);
    setError(null);
    try {
      const newWordId = await addWord(deckId, wordData);
      if (onSuccess) onSuccess(newWordId);
      return newWordId;
    } catch (err) {
      setError(err.message || 'เพิ่มคำศัพท์ไม่สำเร็จ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { add, loading, error };
};

/**
 * Hook สำหรับอัปเดตคำศัพท์
 */
export const useUpdateWord = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (deckId, wordId, updates) => {
    setLoading(true);
    setError(null);
    try {
      await updateWord(deckId, wordId, updates);
      if (onSuccess) onSuccess(wordId);
    } catch (err) {
      setError(err.message || 'อัปเดตคำศัพท์ไม่สำเร็จ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};

/**
 * Hook สำหรับลบคำศัพท์
 */
export const useDeleteWord = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (deckId, wordId) => {
    if (!window.confirm('คุณต้องการลบคำศัพท์นี้ใช่หรือไม่?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteWord(deckId, wordId);
      if (onSuccess) onSuccess(wordId);
    } catch (err) {
      setError(err.message || 'ลบคำศัพท์ไม่สำเร็จ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { delete: remove, loading, error };
};
