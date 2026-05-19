import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserProfile() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center mb-6 mt-10">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : '👤'}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{user?.displayName || 'ไม่ได้ตั้งชื่อ'}</h2>
        <p className="text-gray-500">{user?.email}</p>
      </div>

      <button 
        onClick={logout}
        className="w-full bg-red-100 text-red-600 font-bold p-4 rounded-xl hover:bg-red-200 transition"
      >
        ออกจากระบบ
      </button>
    </div>
  );
}
