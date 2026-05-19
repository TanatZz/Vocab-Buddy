/**
 * Utility functions for Spaced Repetition System (SRS)
 */

/**
 * Calculates difficulty based on correct ratio
 * @param {number} correctCount
 * @param {number} reviewCount
 * @returns {'easy' | 'medium' | 'hard'}
 */
export const calculateDifficulty = (correctCount = 0, reviewCount = 0) => {
  if (reviewCount === 0) return 'medium';
  const ratio = correctCount / reviewCount;
  if (ratio >= 0.8) return 'easy';
  if (ratio <= 0.5) return 'hard';
  return 'medium';
};

/**
 * Update word difficulty after a review
 * @param {Object} word
 * @param {boolean} isCorrect
 * @returns {Object} Updated word
 */
export const updateWordDifficulty = (word, isCorrect) => {
  const newReviewCount = (word.reviewCount || 0) + 1;
  const newCorrectCount = (word.correctCount || 0) + (isCorrect ? 1 : 0);
  const newDifficulty = calculateDifficulty(newCorrectCount, newReviewCount);
  const newStreak = isCorrect ? (word.streak || 0) + 1 : 0;

  return {
    ...word,
    reviewCount: newReviewCount,
    correctCount: newCorrectCount,
    difficulty: newDifficulty,
    streak: newStreak,
    lastReviewDate: Date.now()
  };
};

/**
 * Selects words using weighted random algorithm
 * Hard words have higher chance to appear
 * @param {Object[]} words
 * @param {number} count
 * @returns {Object[]}
 */
export const getWeightedRandomWords = (words, count = 1) => {
  if (!words || words.length === 0) return [];
  
  const selectedWords = [];
  // Make a copy so we can remove selected items to prevent duplicates
  let availableWords = [...words];

  for (let i = 0; i < count && availableWords.length > 0; i++) {
    const weights = availableWords.map(w => {
      if (w.difficulty === 'hard') return 3;
      if (w.difficulty === 'medium') return 2;
      return 1; // easy
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = availableWords.length - 1;

    for (let j = 0; j < availableWords.length; j++) {
      random -= weights[j];
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }

    selectedWords.push(availableWords[selectedIndex]);
    availableWords.splice(selectedIndex, 1);
  }

  return selectedWords;
};

export const getHardWords = (words) => {
  return words.filter(w => w.difficulty === 'hard');
};

export const getEasyWords = (words) => {
  return words.filter(w => w.difficulty === 'easy');
};

export const getStreak = (word) => {
  return word.streak || 0;
};
