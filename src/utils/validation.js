/**
 * ตรวจสอบรูปแบบอีเมล
 * @param {string} email
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateEmail = (email) => {
  if (!email) return { valid: false, error: 'กรุณากรอกอีเมล' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { valid: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' };
  return { valid: true, error: null };
};

/**
 * ตรวจสอบความปลอดภัยของรหัสผ่าน (ขั้นต่ำ 8 ตัวอักษร, มีตัวเลข, พิมพ์เล็ก, พิมพ์ใหญ่)
 * @param {string} password
 * @returns {{valid: boolean, error: string|null}}
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, error: 'กรุณากรอกรหัสผ่าน' };
  if (password.length < 8) return { valid: false, error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { valid: false, error: 'รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข' };
  }
  
  return { valid: true, error: null };
};

/**
 * ตรวจสอบชื่อผู้ใช้
 * @param {string} name
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateDisplayName = (name) => {
  if (!name || name.trim().length === 0) return { valid: false, error: 'กรุณากรอกชื่อผู้ใช้' };
  if (name.length < 2) return { valid: false, error: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร' };
  return { valid: true, error: null };
};
