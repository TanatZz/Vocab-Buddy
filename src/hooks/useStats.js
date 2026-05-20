import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase-config.js';
import * as calc from '../utils/statsCalculator.js';
import { getStudySessions } from '../services/sessionService.js';

/**
 * ดึงสถิติภาพรวมของผู้ใช้ (ทุก Decks) และประวัติ Session
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
        // 1. ดึงข้อมูล Decks ทั้งหมดของผู้ใช้
        const decksRef = ref(db, 'decks');
        const decksSnapshot = await get(decksRef);
        const userDecks = [];
        const userDeckIds = [];
        
        if (decksSnapshot.exists()) {
          decksSnapshot.forEach(child => {
             const deck = child.val();
             if (deck.userId === userId) {
               userDecks.push({ id: child.key, ...deck });
               userDeckIds.push(child.key);
             }
          });
        }

        // 2. ดึง Words จากทุก Decks
        let allWords = [];
        for (const deckId of userDeckIds) {
            const wordsRef = ref(db, `words/${deckId}`);
            const wordsSnapshot = await get(wordsRef);
            if (wordsSnapshot.exists()) {
                wordsSnapshot.forEach(w => {
                  allWords.push({ id: w.key, ...w.val(), deckId });
                });
            }
        }

        // 3. ดึง Study Sessions ประวัติการเรียนทั้งหมด
        const sessions = await getStudySessions(userId);

        // 4. คำนวณค่าสถิติ
        let totalCorrect = 0;
        let totalReview = 0;
        allWords.forEach(w => {
            totalCorrect += (w.correctCount || 0);
            totalReview += (w.reviewCount || 0);
        });

        // คำนวณเวลาทั้งหมดสะสม (วินาที)
        const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

        const newStats = {
          totalWords: allWords.length,
          learnedWords: calc.getTotalLearned(allWords),
          accuracy: calc.calculateAccuracy(totalCorrect, totalReview),
          breakdown: calc.getDifficultyBreakdown(allWords),
          topHard: calc.getTopHardWords(allWords, 5),
          topEasy: calc.getTopEasyWords(allWords, 5),
          streak: calc.getStreak(sessions), // Streak จริงจากประวัติการเรียน
          totalDuration, // เวลาสะสมในระบบ (วินาที)
          history7Days: calc.get7DayHistory(sessions), // ข้อมูลกราฟ 7 วัน
          allWords,
          sessions,
          decks: userDecks // รายชื่อสำรับเพื่อให้ฟิลเตอร์ได้ในหน้าสถิติ
        };

        setStats(newStats);
      } catch (err) {
        setError('ไม่สามารถโหลดสถิติได้');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, [userId]);

  return { stats, loading, error };
};

/**
 * ดึงความแม่นยำราย Deck (Fallback)
 */
export const useAccuracy = (deckId) => {
    return 0;
};
