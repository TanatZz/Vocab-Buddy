import { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { signIn } from '../services/authService.js';

export default function LoginScreen({ onSignUp }) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="bg-primary/5 w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-primary">
            <LogIn size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Vocab Buddy</h1>
          <p className="text-slate-400 font-medium">เข้าสู่ระบบเพื่อเริ่มเรียนรู้</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all"
              value={email} onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all"
              value={password} onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-2xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
          
          <div className="text-center mt-8">
            <p className="text-slate-400 text-sm font-medium">
              ยังไม่มีบัญชี? 
              <button 
                type="button" 
                onClick={onSignUp} 
                className="text-primary font-black ml-2 hover:underline"
              >
                สร้างบัญชีใหม่
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
