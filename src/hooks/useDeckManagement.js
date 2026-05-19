import { useState, useEffect, useCallback } from 'react';
import { getAllDecksForUser, createDeck, updateDeck, deleteDeck } from '../services/deckService.js';

/**
 * Hook สำหรับดึงข้อมูล Decks ทั้งหมดของ User
 * @param {string} userId - User ID
 */
export const useDecksForUser = (userId) => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDecks = useCallback(async () => {
    if (!userId) {
      setDecks([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await getAllDecksForUser(userId);
      setDecks(data);
      // LocalStorage Backup
      localStorage.setItem(`decks_${userId}`, JSON.stringify({
        lastSync: Date.now(),
        decks: data
      }));
    } catch (err) {
      console.error(err);
      // Fallback to LocalStorage
      const cached = localStorage.getItem(`decks_${userId}`);
      if (cached) {
        setDecks(JSON.parse(cached).decks);
        setError('กำลังใช้งานโหมดออฟไลน์');
      } else {
        setError(err.message || 'ไม่สามารถดึงข้อมูล Deck ได้');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  return { decks, loading, error, refresh: fetchDecks };
};

/**
 * Hook สำหรับดึงข้อมูล Decks (Alias สำหรับ useDecksForUser เพื่อความสะดวก)
 */
export const useDecks = (userId) => {
  return useDecksForUser(userId);
};

/**
 * Hook สำหรับสร้าง Deck ใหม่
 */
export const useCreateDeck = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (userId, deckData) => {
    setLoading(true);
    setError(null);
    try {
      const newDeckId = await createDeck(userId, deckData);
      if (onSuccess) onSuccess(newDeckId);
      return newDeckId;
    } catch (err) {
      setError(err.message || 'สร้าง Deck ไม่สำเร็จ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

/**
 * Hook สำหรับอัปเดต Deck
 */
export const useUpdateDeck = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (deckId, updates) => {
    setLoading(true);
    setError(null);
    try {
      await updateDeck(deckId, updates);
      if (onSuccess) onSuccess(deckId);
    } catch (err) {
      setError(err.message || 'อัปเดต Deck ไม่สำเร็จ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};

/**
 * Hook สำหรับลบ Deck
 */
export const useDeleteDeck = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (deckId) => {
    if (!window.confirm('คุณต้องการลบ Deck นี้ใช่หรือไม่? คำศัพท์ทั้งหมดใน Deck จะถูกลบด้วย')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await deleteDeck(deckId);
      if (onSuccess) onSuccess(deckId);
    } catch (err) {
      setError(err.message || 'ลบ Deck ไม่สำเร็จ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { delete: remove, loading, error };
};
