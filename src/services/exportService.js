import { generateCSV } from '../utils/csvHandler.js';

/**
 * ส่งออกแบบ CSV
 */
export const exportAsCSV = (deck, words) => {
  return generateCSV(words);
};

/**
 * ส่งออกแบบ JSON
 */
export const exportAsJSON = (deck, words) => {
  const exportData = {
    deckInfo: {
      name: deck.name,
      description: deck.description,
      language: deck.language,
      exportDate: new Date().toISOString()
    },
    words: words.map(w => ({
      word: w.word,
      meaning: w.meaning,
      pronunciation: w.pronunciation,
      language: w.language,
      difficulty: w.difficulty,
      correctCount: w.correctCount || 0,
      reviewCount: w.reviewCount || 0
    }))
  };
  return JSON.stringify(exportData, null, 2);
};

/**
 * ดาวน์โหลดไฟล์
 */
export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
