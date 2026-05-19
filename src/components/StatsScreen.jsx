import { Target, BookOpen, Flame, TrendingDown, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useStats } from '../hooks/useStats.js';
import ProgressCard from './ProgressCard.jsx';
import DifficultyBreakdown from './DifficultyBreakdown.jsx';

export default function StatsScreen() {
  const { user } = useAuth();
  const { stats, loading, error } = useStats(user?.uid);

  if (!user) {
    return <div className="p-8 text-center text-slate-500 font-medium">Please login to view statistics.</div>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !stats) {
    return <div className="p-8 text-center text-red-500 font-medium">{error || 'สถิติไม่พร้อมใช้งาน'}</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-24 animate-fade-in">
      {/* Header */}
      <header className="px-6 pt-10 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance</h1>
        <p className="text-slate-500 mt-1 font-medium">ติดตามความก้าวหน้าของคุณ</p>
      </header>

      <div className="px-6 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <ProgressCard 
              title="Accuracy" 
              value={`${stats.accuracy}%`}
              icon={Target}
              color="text-primary"
              bg="bg-primary/5"
            />
            <ProgressCard 
              title="Learned" 
              value={stats.learnedWords}
              subtitle={`of ${stats.totalWords}`}
              icon={BookOpen}
              color="text-green-600"
              bg="bg-green-50"
            />
          </div>
          <ProgressCard 
            title="Current Streak" 
            value={`${stats.streak.current}`}
            subtitle="Practice sessions in a row"
            icon={Flame}
            color="text-orange-500"
            bg="bg-orange-50"
            fullWidth
          />
        </div>

        {/* Charts */}
        <DifficultyBreakdown breakdown={stats.breakdown} />

        {/* Top Words Section */}
        <div className="space-y-6">
          {/* Hard Words */}
          <section>
             <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="text-red-400" size={18} />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Needs Review</h3>
             </div>
             {stats.topHard.length === 0 ? (
               <div className="bg-slate-50 rounded-2xl p-6 text-center text-slate-400 text-sm font-medium">
                 ยังไม่มีข้อมูลคำศัพท์ที่ยาก
               </div>
             ) : (
               <div className="space-y-2">
                 {stats.topHard.map(w => (
                   <div key={w.id} className="flex justify-between items-center bg-white border border-slate-50 p-4 rounded-2xl shadow-sm">
                     <div>
                       <div className="font-bold text-slate-900">{w.word}</div>
                       <div className="text-xs text-slate-400 font-medium">{w.meaning}</div>
                     </div>
                     <div className="text-[10px] font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-lg uppercase">
                       {Math.round((w.correctCount / w.reviewCount) * 100)}% ACC
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </section>

          {/* Easy Words */}
          <section>
             <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-500" size={18} />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Mastered</h3>
             </div>
             {stats.topEasy.length === 0 ? (
               <div className="bg-slate-50 rounded-2xl p-6 text-center text-slate-400 text-sm font-medium">
                 ฝึกฝนเพิ่มขึ้นเพื่อบันทึกสถิติ
               </div>
             ) : (
               <div className="space-y-2">
                 {stats.topEasy.map(w => (
                   <div key={w.id} className="flex justify-between items-center bg-white border border-slate-50 p-4 rounded-2xl shadow-sm">
                     <div>
                       <div className="font-bold text-slate-900">{w.word}</div>
                       <div className="text-xs text-slate-400 font-medium">{w.meaning}</div>
                     </div>
                     <div className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg uppercase">
                       Mastered
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </section>
        </div>
      </div>
    </div>
  );
}
