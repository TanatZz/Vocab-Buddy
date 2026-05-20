import { useState, useMemo } from 'react';
import { Target, BookOpen, Flame, TrendingDown, TrendingUp, Sun, Moon, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useStats } from '../hooks/useStats.js';
import ProgressCard from './ProgressCard.jsx';
import DifficultyBreakdown from './DifficultyBreakdown.jsx';
import ReviewHistoryChart from './ReviewHistoryChart.jsx';
import * as calc from '../utils/statsCalculator.js';

export default function StatsScreen() {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { stats, loading, error } = useStats(user?.uid);
  
  const [selectedDeckId, setSelectedDeckId] = useState('all');

  // จัดกลุ่มตัวแปรสีสำหรับ KPI Cards ให้เข้ากับแต่ละโหมด
  const kpiColors = {
    accuracy: {
      color: isDarkMode ? 'text-indigo-400' : 'text-indigo-600',
      bg: isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'
    },
    learned: {
      color: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
      bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
    },
    streak: {
      color: isDarkMode ? 'text-orange-400' : 'text-orange-500',
      bg: isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50'
    },
    time: {
      color: isDarkMode ? 'text-rose-400' : 'text-rose-500',
      bg: isDarkMode ? 'bg-rose-500/10' : 'bg-rose-50'
    }
  };

  // ทำการกรองและคำนวณสถิติสดๆ บนฟรอนต์เอนด์ (Reactive Filter) แยกราย Deck
  const filteredStats = useMemo(() => {
    if (!stats) return null;
    
    if (selectedDeckId === 'all') {
      return stats;
    }
    
    // กรองคำศัพท์เฉพาะ Deck ที่เลือก
    const filteredWords = stats.allWords.filter(w => w.deckId === selectedDeckId);
    
    // กรองประวัติเรียนเฉพาะ Deck ที่เลือก
    const filteredSessions = stats.sessions.filter(s => s.deckId === selectedDeckId);
    
    let totalCorrect = 0;
    let totalReview = 0;
    filteredWords.forEach(w => {
      totalCorrect += (w.correctCount || 0);
      totalReview += (w.reviewCount || 0);
    });
    
    const totalDuration = filteredSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    
    return {
      totalWords: filteredWords.length,
      learnedWords: calc.getTotalLearned(filteredWords),
      accuracy: calc.calculateAccuracy(totalCorrect, totalReview),
      breakdown: calc.getDifficultyBreakdown(filteredWords),
      topHard: calc.getTopHardWords(filteredWords, 5),
      topEasy: calc.getTopEasyWords(filteredWords, 5),
      streak: calc.getStreak(filteredSessions),
      totalDuration,
      history7Days: calc.get7DayHistory(filteredSessions),
      decks: stats.decks
    };
  }, [stats, selectedDeckId]);

  // ฟังก์ชันแปลงวินาทีเป็นฟอร์แมตชั่วโมง/นาที/วินาที ที่อ่านง่าย
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (!user) {
    return <div className="p-8 text-center text-slate-500 font-medium">Please login to view statistics.</div>;
  }

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !filteredStats) {
    return <div className="p-8 text-center text-red-500 font-medium">{error || 'สถิติไม่พร้อมใช้งาน'}</div>;
  }

  return (
    <div className={`min-h-screen pb-28 transition-colors duration-300 animate-fade-in ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/50 text-slate-900'
    }`}>
      {/* Header Panel */}
      <header className="px-6 pt-10 pb-6 flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight transition-colors ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Performance
          </h1>
          <p className={`text-sm mt-1 font-medium transition-colors ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            ติดตามความก้าวหน้าและการเรียนรู้
          </p>
        </div>

        {/* Toggle Dark/Light Mode */}
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

      {/* Main Container */}
      <div className="px-6 space-y-6">
        
        {/* Dropdown Filter By Deck */}
        <div className="relative w-full">
          <select
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className={`w-full appearance-none pl-5 pr-12 py-4 rounded-2xl font-bold border transition-all duration-300 outline-none cursor-pointer text-sm shadow-sm ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800/80 text-white focus:border-indigo-500' 
                : 'bg-white border-slate-100 text-slate-800 focus:border-primary'
            }`}
          >
            <option value="all">📚 สำรับทั้งหมด (All Decks)</option>
            {stats.decks && stats.decks.map(deck => (
              <option key={deck.id} value={deck.id}>
                🏷️ {deck.name} ({deck.wordCount || 0} คำ)
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <ChevronDown size={18} />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-4">
          <ProgressCard 
            title="Accuracy" 
            value={`${filteredStats.accuracy}%`}
            icon={Target}
            color={kpiColors.accuracy.color}
            bg={kpiColors.accuracy.bg}
            isDarkMode={isDarkMode}
          />
          <ProgressCard 
            title="Learned Words" 
            value={filteredStats.learnedWords}
            subtitle={`of ${filteredStats.totalWords}`}
            icon={BookOpen}
            color={kpiColors.learned.color}
            bg={kpiColors.learned.bg}
            isDarkMode={isDarkMode}
          />
          <ProgressCard 
            title="Study Streak" 
            value={`${filteredStats.streak.current} วัน`}
            subtitle={`สูงสุด ${filteredStats.streak.max} วัน`}
            icon={Flame}
            color={kpiColors.streak.color}
            bg={kpiColors.streak.bg}
            isDarkMode={isDarkMode}
          />
          <ProgressCard 
            title="Study Time" 
            value={formatDuration(filteredStats.totalDuration)}
            subtitle="ทบทวนสะสมทั้งหมด"
            icon={Clock}
            color={kpiColors.time.color}
            bg={kpiColors.time.bg}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* 7-Day Activity Chart */}
        <ReviewHistoryChart 
          data={filteredStats.history7Days} 
          isDarkMode={isDarkMode} 
        />

        {/* Difficulty Pie Chart */}
        <DifficultyBreakdown 
          breakdown={filteredStats.breakdown} 
          isDarkMode={isDarkMode} 
        />

        {/* Words Lists Section */}
        <div className="space-y-6">
          
          {/* Hard Words (Needs Review) */}
          <section className="space-y-3">
             <div className="flex items-center gap-2">
                <TrendingDown className={isDarkMode ? 'text-red-400' : 'text-red-500'} size={18} />
                <h3 className={`text-xs font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Needs Review (ยากมาก)
                </h3>
             </div>
             {filteredStats.topHard.length === 0 ? (
               <div className={`rounded-3xl p-6 text-center text-sm font-medium border transition-colors ${
                 isDarkMode 
                   ? 'bg-slate-900/30 border-slate-800/80 text-slate-500' 
                   : 'bg-slate-50 border-slate-100 text-slate-400'
               }`}>
                 ไม่มีสถิติคำศัพท์ที่ต้องปรับปรุงในตอนนี้
               </div>
             ) : (
               <div className="space-y-2">
                 {filteredStats.topHard.map(w => (
                   <div 
                     key={w.id} 
                     className={`flex justify-between items-center border p-4 rounded-2xl transition-all duration-300 shadow-sm ${
                       isDarkMode 
                         ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 text-white' 
                         : 'bg-white border-slate-50 hover:shadow-md text-slate-900'
                     }`}
                   >
                     <div>
                       <div className="font-bold">{w.word}</div>
                       <div className={`text-xs font-medium transition-colors ${
                         isDarkMode ? 'text-slate-500' : 'text-slate-400'
                       }`}>
                         {w.meaning}
                       </div>
                     </div>
                     <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${
                       isDarkMode ? 'text-red-400 bg-red-950/30' : 'text-red-500 bg-red-50'
                     }`}>
                       {Math.round((w.correctCount / w.reviewCount) * 100)}% ACC
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </section>

          {/* Mastered Words */}
          <section className="space-y-3">
             <div className="flex items-center gap-2">
                <TrendingUp className={isDarkMode ? 'text-emerald-400' : 'text-emerald-500'} size={18} />
                <h3 className={`text-xs font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Mastered (จำได้แม่น)
                </h3>
             </div>
             {filteredStats.topEasy.length === 0 ? (
               <div className={`rounded-3xl p-6 text-center text-sm font-medium border transition-colors ${
                 isDarkMode 
                   ? 'bg-slate-900/30 border-slate-800/80 text-slate-500' 
                   : 'bg-slate-50 border-slate-100 text-slate-400'
               }`}>
                 ฝึกฝนและทดสอบให้ได้คะแนนสูงเพื่อขึ้นหมวดนี้
               </div>
             ) : (
               <div className="space-y-2">
                 {filteredStats.topEasy.map(w => (
                   <div 
                     key={w.id} 
                     className={`flex justify-between items-center border p-4 rounded-2xl transition-all duration-300 shadow-sm ${
                       isDarkMode 
                         ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 text-white' 
                         : 'bg-white border-slate-50 hover:shadow-md text-slate-900'
                     }`}
                   >
                     <div>
                       <div className="font-bold">{w.word}</div>
                       <div className={`text-xs font-medium transition-colors ${
                         isDarkMode ? 'text-slate-500' : 'text-slate-400'
                       }`}>
                         {w.meaning}
                       </div>
                     </div>
                     <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${
                       isDarkMode ? 'text-emerald-400 bg-emerald-950/30' : 'text-emerald-600 bg-emerald-50'
                     }`}>
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
