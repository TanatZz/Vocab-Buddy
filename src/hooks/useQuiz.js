import { useState, useEffect, useCallback } from 'react';
import { getWordsByDeckId, updateWordDifficulty as updateFirebaseWord } from '../services/wordService.js';
import { getWeightedRandomWords, updateWordDifficulty } from '../utils/spacedRepetition.js';

export const useQuiz = (deckId) => {
  const [words, setWords] = useState([]);
  const [quizWords, setQuizWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // โหลดคำศัพท์ทั้งหมดใน Deck
  useEffect(() => {
    const loadWords = async () => {
      setLoading(true);
      try {
        const data = await getWordsByDeckId(deckId);
        setWords(data);
        // เลือกมาทดสอบทีละเซ็ต หรือทั้งหมด (ค่าเริ่มต้นทั้งหมด แต่เรียงตาม weight)
        const selected = getWeightedRandomWords(data, data.length);
        setQuizWords(selected);
        setStats(s => ({ ...s, total: selected.length }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (deckId) loadWords();
  }, [deckId]);

  const currentWord = quizWords[currentIndex];

  const handleSelfCheck = async (isCorrect) => {
    if (!currentWord) return;
    
    // อัปเดตสถิติ
    setStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (!isCorrect ? 1 : 0)
    }));

    // คำนวณความยากใหม่
    const updatedWord = updateWordDifficulty(currentWord, isCorrect);
    
    // บันทึกลง Firebase
    try {
      await updateFirebaseWord(deckId, currentWord.id, updatedWord.difficulty, isCorrect);
    } catch (err) {
      console.error('Failed to update word difficulty:', err);
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
