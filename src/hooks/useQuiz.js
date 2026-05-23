import { useState, useEffect, useCallback } from 'react';
import { getWordsByDeckId, updateWordDifficulty as updateFirebaseWord } from '../services/wordService.js';
import { getDeckById } from '../services/deckService.js';
import { getWeightedRandomWords, updateWordDifficulty } from '../utils/spacedRepetition.js';
import { addStudySession } from '../services/sessionService.js';
import { useAuth } from '../context/AuthContext.jsx';

export const useQuiz = (deckId, settings = {}) => {
  const { user } = useAuth();
  const [words, setWords] = useState([]);
  const [quizWords, setQuizWords] = useState([]);
  const [deckName, setDeckName] = useState('สำรับทั่วไป');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);

  const { playMode = 'standard', timeLimit = 5 } = settings;
  const [lives, setLives] = useState(playMode === 'sudden-death' ? 3 : null);
  const [isGameOver, setIsGameOver] = useState(false);

  // โหลดคำศัพท์ทั้งหมดใน Decks (รองรับทั้ง Single Deck และ Multi-Decks ที่แยกด้วยจุลภาค)
  useEffect(() => {
    const loadWordsAndDeck = async () => {
      setLoading(true);
      try {
        if (!deckId) return;
        const ids = deckId.includes(',') ? deckId.split(',') : [deckId];
        
        let allWords = [];
        const deckNames = [];
        
        // ดึงชื่อสำรับทั้งหมด
        for (const id of ids) {
          try {
             const deck = await getDeckById(id);
             deckNames.push(deck.name || 'สำรับทั่วไป');
          } catch (deckErr) {
             console.warn('Could not fetch deck name for', id, deckErr);
          }
        }
        setDeckName(deckNames.join(' + ') || 'หลายสำรับ');

        // ดึงคำศัพท์ทั้งหมดพร้อมกันแบบ Concurrent (และใส่ tag deckId ดั้งเดิมของคำเพื่อเขียนข้อมูลถูกที่)
        const wordsPromises = ids.map(async (id) => {
          const data = await getWordsByDeckId(id);
          return data.map(word => ({ ...word, deckId: id }));
        });
        const wordsResults = await Promise.all(wordsPromises);
        allWords = wordsResults.flat();
        
        setWords(allWords);
        // เลือกมาทดสอบทีละเซ็ต หรือทั้งหมด (ค่าเริ่มต้นทั้งหมด แต่เรียงตาม weight)
        const selected = getWeightedRandomWords(allWords, allWords.length);
        setQuizWords(selected);
        setStats({ correct: 0, incorrect: 0, total: selected.length });
        
        // เริ่มจับเวลา
        setStartTime(Date.now());
        setLives(playMode === 'sudden-death' ? 3 : null);
        setIsGameOver(false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadWordsAndDeck();
  }, [deckId, playMode]);

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
    
    // บันทึกลง Firebase (คำศัพท์) - ใช้ deckId จริงของคำนั้นในการบันทึก เพื่อบันทึกข้อมูลถูกห้อง
    try {
      const targetDeckId = currentWord.deckId || deckId;
      await updateFirebaseWord(targetDeckId, currentWord.id, updatedWord.difficulty, isCorrect);
    } catch (err) {
      console.error('Failed to update word difficulty:', err);
    }

    // Sudden Death logic
    let triggerGameOver = false;
    if (playMode === 'sudden-death' && !isCorrect) {
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        triggerGameOver = true;
        setIsGameOver(true);
      }
    }

    // หากทำคำสุดท้ายเสร็จแล้ว หรือแพ้กะทันหัน ให้บันทึก Study Session
    if ((isLastWord || triggerGameOver) && user?.uid) {
      try {
        const durationSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
        await addStudySession(
          user.uid,
          deckId,
          deckName,
          isLastWord ? quizWords.length : currentIndex + 1,
          nextCorrect,
          durationSeconds
        );
      } catch (sessionErr) {
        console.error('Failed to save study session:', sessionErr);
      }
    }

    // ไปคำถัดไป
    if (!triggerGameOver) {
      nextWord();
    }
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
    setLives(playMode === 'sudden-death' ? 3 : null);
    setIsGameOver(false);
  }, [words, playMode]);

  return {
    currentWord,
    words: quizWords,
    index: currentIndex,
    revealed,
    setRevealed,
    stats,
    loading,
    lives,
    isGameOver,
    nextWord,
    handleSelfCheck,
    resetQuiz
  };
};
