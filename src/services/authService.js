import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase-config.js';

// แปลง Firebase Error Codes เป็นข้อความภาษาไทย
const mapAuthError = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use': return 'อีเมลนี้ถูกใช้งานแล้ว';
    case 'auth/invalid-email': return 'รูปแบบอีเมลไม่ถูกต้อง';
    case 'auth/operation-not-allowed': return 'ระบบไม่อนุญาตให้ใช้อีเมลนี้';
    case 'auth/weak-password': return 'รหัสผ่านอ่อนเกินไป (ต้องมีอย่างน้อย 6 ตัวอักษร)';
    case 'auth/user-disabled': return 'บัญชีผู้ใช้นี้ถูกระงับ';
    case 'auth/user-not-found': return 'ไม่พบบัญชีผู้ใช้นี้ในระบบ';
    case 'auth/wrong-password': return 'รหัสผ่านไม่ถูกต้อง';
    case 'auth/invalid-credential': return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    case 'auth/too-many-requests': return 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่';
    default: return `เกิดข้อผิดพลาดในการยืนยันตัวตน (${errorCode})`;
  }
};

/**
 * สมัครสมาชิกใหม่
 * @param {string} email 
 * @param {string} password 
 * @param {string} displayName 
 * @returns {Promise<Object>} User object
 */
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (displayName) {
      await firebaseUpdateProfile(user, { displayName });
    }
    return user;
  } catch (error) {
    throw new Error(mapAuthError(error.code));
  }
};

/**
 * เข้าสู่ระบบ
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User object
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(mapAuthError(error.code));
  }
};

/**
 * ออกจากระบบ
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการออกจากระบบ');
  }
};

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * อัปเดตข้อมูลผู้ใช้
 * @param {string} displayName 
 * @param {string|null} photoURL 
 * @returns {Promise<void>}
 */
export const updateProfile = async (displayName, photoURL = null) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('ไม่พบผู้ใช้งานปัจจุบัน');
    await firebaseUpdateProfile(user, { displayName, photoURL });
  } catch (error) {
    throw new Error('ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้');
  }
};

/**
 * ส่งอีเมลรีเซ็ตรหัสผ่าน
 * @param {string} email 
 * @returns {Promise<void>}
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(mapAuthError(error.code));
  }
};

/**
 * ติดตามการเปลี่ยนแปลงสถานะการเข้าสู่ระบบ
 * @param {Function} callback 
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};
