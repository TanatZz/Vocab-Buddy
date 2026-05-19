/**
 * แปลงข้อมูลคำศัพท์เป็นรูปแบบ CSV
 * @param {Array} words - อาร์เรย์ของคำศัพท์
 * @returns {string} ข้อความในรูปแบบ CSV
 */
export const generateCSV = (words) => {
  if (!words || words.length === 0) return '';

  const headers = ['word', 'meaning', 'pronunciation', 'language', 'difficulty'];
  
  const csvRows = words.map(word => {
    return headers.map(header => {
      let val = word[header] || '';
      // เผื่อมีคอมม่าหรือเครื่องหมายคำพูดในข้อความ
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
  });

  return [headers.join(','), ...csvRows].join('\n');
};

/**
 * แปลงข้อความ CSV เป็นอาร์เรย์ของคำศัพท์
 * @param {string} csvText - ข้อความ CSV
 * @returns {Array} อาร์เรย์ของคำศัพท์
 */
export const parseCSV = (csvText) => {
  if (!csvText) return [];

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const words = [];

  // ไม่ได้ครอบคลุมการ parse CSV แบบซับซ้อน (ที่มี newline ใน quotes) แบบ 100%
  // ใช้ regex พื้นฐานเพื่อแยกคอมม่าที่ไม่เกี่ยวกับข้างใน quotes
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const wordObj = {};

    headers.forEach((header, index) => {
      if (currentline[index]) {
        let val = currentline[index].trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        wordObj[header] = val;
      }
    });

    if (wordObj.word && wordObj.meaning) {
        words.push({
            word: wordObj.word,
            meaning: wordObj.meaning,
            pronunciation: wordObj.pronunciation || '',
            language: wordObj.language || 'en',
            difficulty: wordObj.difficulty || 'medium',
        });
    }
  }

  return words;
};
