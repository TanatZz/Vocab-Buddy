import React from 'react';
import { signUp } from '../services/authService.js';

export default function SignUpScreen({ onBack }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUp(email, password, name);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
      <h1 className="text-3xl font-bold mb-8">สร้างบัญชีใหม่</h1>
      <form onSubmit={handleSignUp} className="w-full max-w-xs space-y-4 bg-white p-6 rounded-2xl text-gray-800 shadow-xl">
        <input 
          type="text" placeholder="ชื่อผู้ใช้" className="w-full p-3 border rounded-xl"
          value={name} onChange={e => setName(e.target.value)}
        />
        <input 
          type="email" placeholder="อีเมล" className="w-full p-3 border rounded-xl"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="รหัสผ่าน (8 ตัวขึ้นไป)" className="w-full p-3 border rounded-xl"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">Create Account</button>
        <div className="text-center mt-4">
          <button type="button" onClick={onBack} className="text-indigo-600 text-sm">กลับไปหน้าล็อกอิน</button>
        </div>
      </form>
    </div>
  );
}
