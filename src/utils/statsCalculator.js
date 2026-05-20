/**
 * Utility functions for Vocab Buddy Statistics Calculation
 */

/**
 * คำนวณความแม่นยำ (เป็นเปอร์เซ็นต์)
 */
export const calculateAccuracy = (correct, total) => {
  if (!total || total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * คำนวณเวลาเฉลี่ยในการตอบแต่ละข้อ (วินาที/ข้อ)
 */
export const calculateAverageReviewTime = (sessions) => {
  if (!sessions || sessions.length === 0) return 0;
  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalReviews = sessions.reduce((acc, s) => acc + (s.reviewCount || 0), 0);
  if (totalReviews === 0) return 0;
  return Math.round(totalDuration / totalReviews);
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
  if (!words || words.length === 0) return { easy: 0, medium: 0, hard: 0, counts: { easy: 0, medium: 0, hard: 0 } };
  
  const counts = { easy: 0, medium: 0, hard: 0 };
  words.forEach(w => {
    if (w.difficulty === 'easy') counts.easy++;
    else if (w.difficulty === 'hard') counts.hard++;
    else counts.medium++;
  });

  const total = words.length;
  return {
    easy: Math.round((counts.easy / total) * 100) || 0,
    medium: Math.round((counts.medium / total) * 100) || 0,
    hard: Math.round((counts.hard / total) * 100) || 0,
    counts
  };
};

/**
 * จัดกลุ่มข้อมูล Local Date
 */
const getLocalDateString = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * คำนวณ Streak จริงของชีวิตผู้เรียน (คำนวณจากวันที่ทำข้อสอบต่อเนื่องกัน)
 * @param {Object[]} sessions - รายการ Study Session ทั้งหมด
 */
export const getStreak = (sessions) => {
  if (!sessions || sessions.length === 0) return { current: 0, max: 0 };
  
  // แปลง timestamp ของทุก session เป็นวันที่ YYYY-MM-DD
  const dates = sessions.map(s => getLocalDateString(s.timestamp));
  
  // กรองให้เหลือวันที่ไม่ซ้ำ และเรียงลำดับจากล่าสุดไปเก่าสุด
  const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  if (uniqueDates.length === 0) return { current: 0, max: 0 };
  
  const todayStr = getLocalDateString(Date.now());
  const yesterdayStr = getLocalDateString(Date.now() - 86400000);
  
  // ตรวจสอบว่าทบทวน ล่าสุด วันนี้ หรือ เมื่อวาน หรือไม่ (ถ้าไม่เลยคือ streak ขาด)
  const hasStudiedRecent = uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr;
  
  let currentStreak = 0;
  let maxStreak = 0;
  
  if (hasStudiedRecent) {
    currentStreak = 1;
    let idx = 0;
    
    // นับวันที่ทำติดกันถอยหลังไป
    while (idx < uniqueDates.length - 1) {
      const currentCheck = new Date(uniqueDates[idx]);
      const nextCheck = new Date(uniqueDates[idx + 1]);
      
      const diffTime = Math.abs(currentCheck - nextCheck);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        idx++;
      } else if (diffDays === 0) {
        // วันเดียวกัน ข้ามไปเช็คตัวถัดไป
        idx++;
      } else {
        break; // Streak ขาดช่วง
      }
    }
  }
  
  // คำนวณหา Max Streak (ประวัติศาสตร์สูงสุด)
  let tempStreak = 1;
  maxStreak = 1;
  
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentCheck = new Date(uniqueDates[i]);
    const nextCheck = new Date(uniqueDates[i + 1]);
    
    const diffTime = Math.abs(currentCheck - nextCheck);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    } else if (diffDays > 1) {
      tempStreak = 1; // ล้างค่านับใหม่
    }
  }
  
  return {
    current: currentStreak,
    max: Math.max(currentStreak, maxStreak)
  };
};

/**
 * ดึงข้อมูลการทบทวนย้อนหลัง 7 วัน สำหรับ Recharts
 * @param {Object[]} sessions - รายการ Study Session ทั้งหมด
 */
export const get7DayHistory = (sessions) => {
  const history = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // วนลูปสร้างข้อมูลย้อนหลัง 7 วัน (รวมวันนี้ด้วย)
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d.getTime());
    const label = `${d.getDate()} ${months[d.getMonth()]}`;
    
    // ค้นหา Sessions ในวันที่ตรวจสอบ
    const daySessions = (sessions || []).filter(s => getLocalDateString(s.timestamp) === dateStr);
    
    const reviewed = daySessions.reduce((acc, curr) => acc + (curr.reviewCount || 0), 0);
    const durationSeconds = daySessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    
    // แปลงเวลาเป็นนาที ปัดเศษทศนิยม 1 ตำแหน่ง
    const minutes = Math.round((durationSeconds / 60) * 10) / 10;
    
    history.push({
      date: label,
      reviewed,
      minutes
    });
  }
  
  return history;
};

/**
 * จำนวนคำที่เรียนแล้ว (เคยทบทวนอย่างน้อย 1 ครั้ง)
 */
export const getTotalLearned = (words) => {
  return words.filter(w => (w.reviewCount || 0) > 0).length;
};
