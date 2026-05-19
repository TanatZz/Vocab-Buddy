import { User, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserProfile() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white p-8 animate-fade-in">
      <header className="mb-10 pt-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile</h1>
        <p className="text-slate-500 mt-1 font-medium">จัดการบัญชีผู้ใช้ของคุณ</p>
      </header>

      <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 flex flex-col items-center mb-10">
        <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-full flex items-center justify-center text-primary mb-6">
          <User size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">{user?.displayName || 'User'}</h2>
        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
           <Mail size={12} />
           {user?.email}
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-5 bg-white border border-slate-50 rounded-3xl flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                 <ShieldCheck size={20} />
              </div>
              <span className="font-bold text-slate-700">Account Verified</span>
           </div>
           <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-500 font-black p-5 rounded-3xl hover:bg-red-100 transition active:scale-[0.98]"
        >
          <LogOut size={20} />
          LOGOUT
        </button>
      </div>
    </div>
  );
}
