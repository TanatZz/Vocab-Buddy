/**
 * คำนวณความแม่นยำ (เป็นเปอร์เซ็นต์)
 */
export const calculateAccuracy = (correct, total) => {
  if (!total || total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * คำนวณเวลาเฉลี่ยในการทบทวน (ถ้ามีข้อมูล)
 */
export const calculateAverageReviewTime = (words) => {
  // ฟีเจอร์นี้อาจต้องเก็บเวลาในการตอบแต่ละข้อเพิ่มเติม ตอนนี้ return 0 ไว้ก่อน
  return 0;
};

/**
 * ดึงคำศัพท์ที่ยากที่สุดเรียงตามจำนวนที่ตอบผิด
 */
export const getTopHardWords = (words, limit = 5) => {
  return [...words]
    .filter(w => w.difficulty === 'hard' || (w.reviewCount > 0 && (w.correctCount || 0) / w.reviewCount <= 0.5))
    .sort((a, b) => {
      // เรียงจากอัตราการตอบถูกน้อยสุดไปมากสุด
      const ratioA = (a.correctCount || 0) / (a.reviewCount || 1);
      const ratioB = (b.correctCount || 0) / (b.reviewCount || 1);
      return ratioA - ratioB;
    })
    .slice(0, limit);
};

/**
 * ดึงคำศัพท์ที่ง่ายที่สุด
 */
export const getTopEasyWords = (words, limit = 5) => {
  return [...words]
    .filter(w => w.difficulty === 'easy' || (w.reviewCount > 0 && (w.correctCount || 0) / w.reviewCount >= 0.8))
    .sort((a, b) => {
      // เรียงจากจำนวนที่ตอบถูกมากสุด
      return (b.correctCount || 0) - (a.correctCount || 0);
    })
    .slice(0, limit);
};

/**
 * สัดส่วนความยากง่าย
 */
export const getDifficultyBreakdown = (words) => {
  if (!words || words.length === 0) return { easy: 0, medium: 0, hard: 0 };
  
  const counts = { easy: 0, medium: 0, hard: 0 };
  words.forEach(w => {
    if (w.difficulty === 'easy') counts.easy++;
    else if (w.difficulty === 'hard') counts.hard++;
    else counts.medium++;
  });

  const total = words.length;
  return {
    easy: Math.round((counts.easy / total) * 100),
    medium: Math.round((counts.medium / total) * 100),
    hard: Math.round((counts.hard / total) * 100),
    counts
  };
};

/**
 * คำนวณ Streak (จำนวนวันที่ทำแบบทดสอบติดกัน - ต้องมีประวัติการเข้าใช้งาน)
 * ตอนนี้คำนวณจาก streak ของคำศัพท์ที่มีค่ามากที่สุด
 */
export const getStreak = (words) => {
  if (!words || words.length === 0) return { current: 0, max: 0 };
  
  // หาสถิติ streak ที่ยาวที่สุดที่เคยทำได้ของแต่ละคำ
  const maxStreak = Math.max(...words.map(w => w.streak || 0));
  return { current: maxStreak, max: maxStreak }; // TODO: คำนวณ Daily streak ในอนาคต
};

/**
 * จำนวนคำที่เรียนแล้ว (เคยทบทวนอย่างน้อย 1 ครั้ง)
 */
export const getTotalLearned = (words) => {
  return words.filter(w => (w.reviewCount || 0) > 0).length;
};
