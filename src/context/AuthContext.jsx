import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as logOut } from '../services/authService.js';

// สร้าง Context
const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  logout: async () => {}
});

/**
 * Provider สำหรับห่อหุ้มแอปพลิเคชัน
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ติดตามการเปลี่ยนแปลงสถานะผู้ใช้
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription เมื่อ component unmount
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await logOut();
      setUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, logout }}>
      {/* ซ่อนแอปจนกว่าจะโหลดสถานะ auth เสร็จสิ้น เพื่อป้องกันหน้ากระพริบ */}
      {!loading ? children : <div className="flex min-h-screen items-center justify-center">กำลังโหลด...</div>}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook สำหรับเรียกใช้งาน Auth Context
 * @returns {{user: Object|null, loading: boolean, error: string|null, logout: Function}}
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
