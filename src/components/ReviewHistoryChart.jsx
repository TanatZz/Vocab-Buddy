import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Clock } from 'lucide-react';

export default function ReviewHistoryChart({ data, isDarkMode }) {
  const [metric, setMetric] = useState('reviews'); // 'reviews' or 'time'

  const hasData = data && data.some(d => d.reviewed > 0 || d.minutes > 0);

  if (!hasData) {
    return (
      <div className={`rounded-3xl p-10 border text-center transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/60 border-slate-800 text-slate-400' 
          : 'bg-slate-50 border-slate-100 text-slate-400'
      }`}>
        <p className="font-medium text-sm tracking-tight">ไม่มีประวัติการฝึกฝนในช่วง 7 วันที่ผ่านมา</p>
      </div>
    );
  }

  // กำหนดสีและค่าตาม Metric ที่เลือก
  const isReviews = metric === 'reviews';
  const dataKey = isReviews ? 'reviewed' : 'minutes';
  const label = isReviews ? 'คำศัพท์ที่ทบทวน' : 'นาทีที่ฝึกฝน';
  const Icon = isReviews ? BookOpen : Clock;
  const gradientColor = isReviews ? '#6366f1' : '#10b981'; // Indigo vs Emerald
  const strokeColor = isReviews ? '#4f46e5' : '#059669';

  return (
    <div className={`rounded-3xl p-6 border transition-all duration-300 shadow-sm ${
      isDarkMode 
        ? 'bg-slate-900/50 border-slate-800/80 hover:shadow-xl hover:shadow-black/20' 
        : 'bg-white border-slate-50 hover:shadow-xl hover:shadow-slate-200/50'
    }`}>
      {/* Chart Header with Toggle Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-xs font-black uppercase tracking-widest ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Activity log (Last 7 Days)
          </h3>
          <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            สถิติการฝึกฝนย้อนหลัง
          </p>
        </div>

        {/* Toggle Controls */}
        <div className={`flex p-1 rounded-2xl border transition-all duration-300 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/80 border-slate-100'
        }`}>
          <button
            onClick={() => setMetric('reviews')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              isReviews
                ? (isDarkMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-indigo-600 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <BookOpen size={14} />
            Reviews
          </button>
          <button
            onClick={() => setMetric('time')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              !isReviews
                ? (isDarkMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-emerald-600 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <Clock size={14} />
            Time
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={isDarkMode ? '#1e293b/40' : '#f1f5f9'} 
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: isDarkMode ? '#64748b' : '#94a3b8', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: isDarkMode ? '#64748b' : '#94a3b8', fontWeight: 600 }}
              allowDecimals={!isReviews}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: isDarkMode ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(241, 245, 249, 0.8)',
                borderRadius: '16px',
                boxShadow: isDarkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(148, 163, 184, 0.25)',
                backdropFilter: 'blur(8px)'
              }}
              labelStyle={{
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              itemStyle={{
                color: strokeColor,
                fontSize: '12px',
                fontWeight: '800'
              }}
              formatter={(value) => [`${value} ${isReviews ? 'คำ' : 'นาที'}`, label]}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#metricGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
