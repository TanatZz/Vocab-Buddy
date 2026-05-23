import { useState } from 'react';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { signUp } from '../services/authService.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function SignUpScreen({ onBack }) {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bg = isDarkMode ? 'bg-slate-950' : 'bg-white';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSub = isDarkMode ? 'text-slate-400' : 'text-slate-400';
  const inputClass = isDarkMode
    ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:bg-slate-950 focus:border-slate-700'
    : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white focus:border-primary/20';
  const btnMain = isDarkMode
    ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-white/5'
    : 'bg-slate-900 text-white hover:bg-black shadow-2xl shadow-slate-900/20';

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-8 animate-fade-in transition-colors duration-300 ${bg}`}>
      <div className="w-full max-w-sm">
        <button
          onClick={onBack}
          className={`mb-8 p-2 -ml-2 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
          aria-label="กลับ"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mb-12">
          <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-primary/5 text-primary'}`}>
            <UserPlus size={40} />
          </div>
          <h1 className={`text-4xl font-black tracking-tighter mb-2 ${textMain}`}>Create Account</h1>
          <p className={`font-medium ${textSub}`}>เริ่มต้นการเดินทางของคุณ</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <p className={`text-xs font-bold p-3 rounded-xl border ${isDarkMode ? 'text-red-400 bg-red-950/20 border-red-900/30' : 'text-red-500 bg-red-50 border-red-100'}`}>
              {error}
            </p>
          )}
          <div className="relative group">
            <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} size={20} />
            <input
              type="text"
              placeholder="Full name"
              className={`w-full pl-12 pr-4 py-4 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all ${inputClass}`}
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="relative group">
            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} size={20} />
            <input
              type="email"
              placeholder="Email address"
              className={`w-full pl-12 pr-4 py-4 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all ${inputClass}`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative group">
            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} size={20} />
            <input
              type="password"
              placeholder="Password (8+ characters)"
              className={`w-full pl-12 pr-4 py-4 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all ${inputClass}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4 ${btnMain}`}
          >
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}
