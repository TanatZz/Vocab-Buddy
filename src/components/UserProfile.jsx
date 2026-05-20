import { User, LogOut, Mail, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className={`min-h-screen p-8 animate-fade-in transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#fafafa] text-slate-900'
    }`}>
      <header className="mb-10 pt-4 flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Profile</h1>
          <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>จัดการบัญชีผู้ใช้ของคุณ</p>
        </div>

        {/* Global Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className={`p-3 rounded-2xl border transition-all duration-300 active:scale-95 shadow-sm ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800/80 shadow-lg shadow-black/20' 
              : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
          }`}
          title={isDarkMode ? 'เปิดโหมดสว่าง' : 'เปิดโหมดมืด'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className={`rounded-[40px] p-8 border flex flex-col items-center mb-10 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-100/70 shadow-sm'
      }`}>
        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-primary mb-6 transition-all ${
          isDarkMode 
            ? 'bg-slate-950 border border-slate-800' 
            : 'bg-white shadow-xl shadow-slate-200/50'
        }`}>
          <User size={48} />
        </div>
        <h2 className={`text-2xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.displayName || 'User'}</h2>
        <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${
          isDarkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>
           <Mail size={12} />
           {user?.email}
        </div>
      </div>

      <div className="space-y-3">
        <div className={`p-5 border rounded-3xl flex items-center justify-between shadow-sm transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-50'
        }`}>
           <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-500'
              }`}>
                 <ShieldCheck size={20} />
              </div>
              <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Account Verified</span>
           </div>
           <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>

        <button 
          onClick={logout}
          className={`w-full flex items-center justify-center gap-3 font-black p-5 rounded-3xl transition active:scale-[0.98] ${
            isDarkMode 
              ? 'bg-red-950/20 text-red-400 hover:bg-red-950/45 border border-red-900/30' 
              : 'bg-red-50 text-red-500 hover:bg-red-100'
          }`}
        >
          <LogOut size={20} />
          LOGOUT
        </button>
      </div>
    </div>
  );
}
