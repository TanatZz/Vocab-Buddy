import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase-config.js';
import * as calc from '../utils/statsCalculator.js';

/**
 * ดึงสถิติภาพรวมของผู้ใช้ (ทุก Decks)
 */
export const useStats = (userId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllStats = async () => {
      if (!userId) {
        setStats(null);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // ดึง Decks ทั้งหมด
        const decksRef = ref(db, 'decks');
        const decksSnapshot = await get(decksRef);
        const userDecks = [];
        if (decksSnapshot.exists()) {
          decksSnapshot.forEach(child => {
             if(child.val().userId === userId) userDecks.push(child.key);
          });
        }

        // ดึง Words จากทุก Decks
        let allWords = [];
        for (const deckId of userDecks) {
            const wordsRef = ref(db, `words/${deckId}`);
            const wordsSnapshot = await get(wordsRef);
            if (wordsSnapshot.exists()) {
                wordsSnapshot.forEach(w => allWords.push({ id: w.key, ...w.val(), deckId }));
            }
        }

        let totalCorrect = 0;
        let totalReview = 0;
        allWords.forEach(w => {
            totalCorrect += (w.correctCount || 0);
            totalReview += (w.reviewCount || 0);
        });

        const newStats = {
          totalWords: allWords.length,
          learnedWords: calc.getTotalLearned(allWords),
          accuracy: calc.calculateAccuracy(totalCorrect, totalReview),
          breakdown: calc.getDifficultyBreakdown(allWords),
          topHard: calc.getTopHardWords(allWords, 5),
          topEasy: calc.getTopEasyWords(allWords, 5),
          streak: calc.getStreak(allWords),
          allWords
        };

        setStats(newStats);

      } catch (err) {
        setError('ไม่สามารถโหลดสถิติได้');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, [userId]);

  return { stats, loading, error };
};

/**
 * ดึงความแม่นยำราย Deck
 */
export const useAccuracy = (deckId) => {
    // สามารถประยุกต์ใช้เพื่อดึงเฉพาะ deck ที่ต้องการ
    return 0;
};
