import { useState } from 'react';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { signIn, sendPasswordReset } from '../services/authService.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function LoginScreen({ onSignUp }) {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      await sendPasswordReset(forgotEmail);
      setForgotSuccess(true);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const bg = isDarkMode ? 'bg-slate-950' : 'bg-white';
  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSub = isDarkMode ? 'text-slate-400' : 'text-slate-400';
  const inputClass = isDarkMode
    ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:bg-slate-950 focus:border-slate-700'
    : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white focus:border-primary/20';
  const btnMain = isDarkMode
    ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-white/5'
    : 'bg-slate-900 text-white hover:bg-black shadow-2xl shadow-slate-900/20';

  // --- Forgot Password View ---
  if (showForgot) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-8 animate-fade-in transition-colors duration-300 ${bg}`}>
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setShowForgot(false); setForgotSuccess(false); setForgotError(''); }}
            className={`mb-8 p-2 -ml-2 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ArrowLeft size={24} />
          </button>

          <div className="text-center mb-10">
            <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-primary/5 text-primary'}`}>
              <Mail size={40} />
            </div>
            <h1 className={`text-3xl font-black tracking-tighter mb-2 ${textMain}`}>ลืมรหัสผ่าน?</h1>
            <p className={`font-medium text-sm ${textSub}`}>กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
          </div>

          {forgotSuccess ? (
            <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
              <div className="text-2xl mb-2">✉️</div>
              <p className="font-bold text-sm">ส่งอีเมลสำเร็จแล้ว!</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน</p>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotError && (
                <p className={`text-xs font-bold p-3 rounded-xl border ${isDarkMode ? 'text-red-400 bg-red-950/20 border-red-900/30' : 'text-red-500 bg-red-50 border-red-100'}`}>
                  {forgotError}
                </p>
              )}
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} size={20} />
                <input
                  type="email"
                  placeholder="Email address"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all ${inputClass}`}
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className={`w-full py-5 rounded-2xl font-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4 ${btnMain}`}
              >
                {forgotLoading ? 'SENDING...' : 'ส่งลิงก์รีเซ็ต'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- Login View ---
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-8 animate-fade-in transition-colors duration-300 ${bg}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-primary/5 text-primary'}`}>
            <LogIn size={40} />
          </div>
          <h1 className={`text-4xl font-black tracking-tighter mb-2 ${textMain}`}>Vocab Buddy</h1>
          <p className={`font-medium ${textSub}`}>เข้าสู่ระบบเพื่อเริ่มเรียนรู้</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <p className={`text-xs font-bold p-3 rounded-xl border ${isDarkMode ? 'text-red-400 bg-red-950/20 border-red-900/30' : 'text-red-500 bg-red-50 border-red-100'}`}>
              {error}
            </p>
          )}
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
              placeholder="Password"
              className={`w-full pl-12 pr-4 py-4 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all ${inputClass}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => { setShowForgot(true); setForgotEmail(email); }}
              className={`text-xs font-bold hover:underline transition-colors ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
            >
              ลืมรหัสผ่าน?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black transition-all active:scale-[0.98] disabled:opacity-50 mt-2 ${btnMain}`}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>

          <div className="text-center mt-6">
            <p className={`text-sm font-medium ${textSub}`}>
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
