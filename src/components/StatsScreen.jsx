import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useStats } from '../hooks/useStats.js';
import ProgressCard from './ProgressCard.jsx';
import DifficultyBreakdown from './DifficultyBreakdown.jsx';

export default function StatsScreen() {
  const { user } = useAuth();
  const { stats, loading, error } = useStats(user?.uid);

  if (!user) {
    return <div className="p-8 text-center text-gray-500">กรุณาเข้าสู่ระบบเพื่อดูสถิติ</div>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return <div className="p-8 text-center text-red-500">{error || 'ไม่พบข้อมูลสถิติ'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold">📊 สถิติการเรียนรู้</h1>
        <p className="text-indigo-100 mt-1">ติดตามความก้าวหน้าของคุณ</p>
      </div>

      <div className="p-4 mt-2 space-y-4">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressCard 
            title="ความแม่นยำเฉลี่ย" 
            value={`${stats.accuracy}%`}
            icon="🎯"
            color="green"
          />
          <ProgressCard 
            title="คำศัพท์ที่เรียนแล้ว" 
            value={stats.learnedWords}
            subtitle={`/ ${stats.totalWords} คำ`}
            icon="📚"
            color="blue"
          />
          <ProgressCard 
            title="ทำแบบทดสอบติดต่อกัน" 
            value={`${stats.streak.current}`}
            subtitle="ครั้ง"
            icon="🔥"
            color="red"
          />
        </div>

        {/* Charts */}
        <DifficultyBreakdown breakdown={stats.breakdown} />

        {/* Top Words */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Hard Words */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                <span>📉</span> คำศัพท์ที่ควรทวนซ้ำ
             </h3>
             {stats.topHard.length === 0 ? (
               <p className="text-gray-500 text-sm">ยังไม่มีคำศัพท์ที่ตอบผิดบ่อย</p>
             ) : (
               <ul className="space-y-3">
                 {stats.topHard.map(w => (
                   <li key={w.id} className="flex justify-between items-center bg-red-50 px-3 py-2 rounded-lg">
                     <div>
                       <span className="font-bold text-gray-800">{w.word}</span>
                       <span className="text-sm text-gray-500 ml-2">{w.meaning}</span>
                     </div>
                     <span className="text-xs font-bold text-red-500 bg-white px-2 py-1 rounded-md">
                       ถูก {w.correctCount || 0}/{w.reviewCount || 0}
                     </span>
                   </li>
                 ))}
               </ul>
             )}
          </div>

          {/* Easy Words */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
                <span>📈</span> คำศัพท์ที่จำได้แม่น
             </h3>
             {stats.topEasy.length === 0 ? (
               <p className="text-gray-500 text-sm">ต้องทบทวนเพิ่มเพื่อให้ระบบจำสถิติ</p>
             ) : (
               <ul className="space-y-3">
                 {stats.topEasy.map(w => (
                   <li key={w.id} className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg">
                     <div>
                       <span className="font-bold text-gray-800">{w.word}</span>
                       <span className="text-sm text-gray-500 ml-2">{w.meaning}</span>
                     </div>
                     <span className="text-xs font-bold text-green-600 bg-white px-2 py-1 rounded-md">
                       แม่นยำ
                     </span>
                   </li>
                 ))}
               </ul>
             )}
          </div>

        </div>

      </div>
    </div>
  );
}
