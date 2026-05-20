import { useState, useEffect, useCallback } from 'react';
import { getWordsByDeckId, updateWordDifficulty as updateFirebaseWord } from '../services/wordService.js';
import { getDeckById } from '../services/deckService.js';
import { getWeightedRandomWords, updateWordDifficulty } from '../utils/spacedRepetition.js';
import { addStudySession } from '../services/sessionService.js';
import { useAuth } from '../context/AuthContext.jsx';

export const useQuiz = (deckId) => {
  const { user } = useAuth();
  const [words, setWords] = useState([]);
  const [quizWords, setQuizWords] = useState([]);
  const [deckName, setDeckName] = useState('สำรับทั่วไป');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);

  // โหลดคำศัพท์ทั้งหมดใน Deck
  useEffect(() => {
    const loadWordsAndDeck = async () => {
      setLoading(true);
      try {
        // ดึงชื่อ Deck
        if (deckId) {
          try {
            const deck = await getDeckById(deckId);
            setDeckName(deck.name || 'สำรับทั่วไป');
          } catch (deckErr) {
            console.warn('Could not fetch deck name:', deckErr);
          }
        }

        // ดึงคำศัพท์
        const data = await getWordsByDeckId(deckId);
        setWords(data);
        // เลือกมาทดสอบทีละเซ็ต หรือทั้งหมด (ค่าเริ่มต้นทั้งหมด แต่เรียงตาม weight)
        const selected = getWeightedRandomWords(data, data.length);
        setQuizWords(selected);
        setStats({ correct: 0, incorrect: 0, total: selected.length });
        
        // เริ่มจับเวลา
        setStartTime(Date.now());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (deckId) loadWordsAndDeck();
  }, [deckId]);

  const currentWord = quizWords[currentIndex];

  const handleSelfCheck = async (isCorrect) => {
    if (!currentWord) return;
    
    const isLastWord = currentIndex === quizWords.length - 1;

    // อัปเดตสถิติสะสม
    const nextCorrect = stats.correct + (isCorrect ? 1 : 0);
    const nextIncorrect = stats.incorrect + (!isCorrect ? 1 : 0);
    
    setStats(prev => ({
      ...prev,
      correct: nextCorrect,
      incorrect: nextIncorrect
    }));

    // คำนวณความยากใหม่
    const updatedWord = updateWordDifficulty(currentWord, isCorrect);
    
    // บันทึกลง Firebase (คำศัพท์)
    try {
      await updateFirebaseWord(deckId, currentWord.id, updatedWord.difficulty, isCorrect);
    } catch (err) {
      console.error('Failed to update word difficulty:', err);
    }

    // หากทำคำสุดท้ายเสร็จแล้ว ให้บันทึก Study Session
    if (isLastWord && user?.uid) {
      try {
        const durationSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
        await addStudySession(
          user.uid,
          deckId,
          deckName,
          quizWords.length,
          nextCorrect,
          durationSeconds
        );
      } catch (sessionErr) {
        console.error('Failed to save study session:', sessionErr);
      }
    }

    // ไปคำถัดไป
    nextWord();
  };

  const nextWord = useCallback(() => {
    if (currentIndex < quizWords.length) {
      setCurrentIndex(prev => prev + 1);
      setRevealed(false);
    }
  }, [currentIndex, quizWords.length]);

  const resetQuiz = useCallback(() => {
    const selected = getWeightedRandomWords(words, words.length);
    setQuizWords(selected);
    setCurrentIndex(0);
    setRevealed(false);
    setStats({ correct: 0, incorrect: 0, total: selected.length });
    setStartTime(Date.now()); // เริ่มจับเวลาใหม่
  }, [words]);

  return {
    currentWord,
    words: quizWords,
    index: currentIndex,
    revealed,
    setRevealed,
    stats,
    loading,
    nextWord,
    handleSelfCheck,
    resetQuiz
  };
};
