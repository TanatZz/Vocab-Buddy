import React from 'react';
import { signIn } from '../services/authService.js';

export default function LoginScreen({ onSignUp }) {
  const [email, setEmail] = React.useState('test@example.com');
  const [password, setPassword] = React.useState('password123');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
      <h1 className="text-4xl font-bold mb-8">Vocab Buddy</h1>
      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4 bg-white p-6 rounded-2xl text-gray-800 shadow-xl">
        <h2 className="text-xl font-bold text-center mb-4">เข้าสู่ระบบ</h2>
        <input 
          type="email" 
          placeholder="อีเมล" 
          className="w-full p-3 border rounded-xl"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="รหัสผ่าน" 
          className="w-full p-3 border rounded-xl"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">Sign In</button>
        <div className="text-center mt-4">
          <button type="button" onClick={onSignUp} className="text-indigo-600 text-sm">สร้างบัญชีใหม่</button>
        </div>
      </form>
    </div>
  );
}
