import { useState } from 'react';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { signUp } from '../services/authService.js';

export default function SignUpScreen({ onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, name);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white animate-fade-in">
      <div className="w-full max-w-sm">
        <button 
          onClick={onBack}
          className="mb-8 p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mb-12">
          <div className="bg-primary/5 w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-primary">
            <UserPlus size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Create Account</h1>
          <p className="text-slate-400 font-medium">เริ่มต้นการเดินทางของคุณ</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Full name" 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all"
              value={name} onChange={e => setName(e.target.value)}
              required
            />
          </div>
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
              placeholder="Password (8+ characters)" 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:outline-none transition-all"
              value={password} onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-2xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}
