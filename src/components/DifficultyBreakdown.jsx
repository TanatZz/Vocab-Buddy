import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DifficultyBreakdown({ breakdown, isDarkMode }) {
  const hasData = breakdown && (breakdown.counts.easy > 0 || breakdown.counts.medium > 0 || breakdown.counts.hard > 0);

  if (!hasData) {
    return (
      <div className={`rounded-3xl p-10 border text-center transition-all duration-300 animate-pop ${
        isDarkMode 
          ? 'bg-slate-900/60 border-slate-800 text-slate-500' 
          : 'bg-slate-50 border-slate-100 text-slate-400'
      }`}>
        <p className="font-medium text-sm tracking-tight">ไม่มีข้อมูลสัดส่วนความยากง่าย</p>
      </div>
    );
  }

  const data = [
    { name: 'Easy', value: breakdown.counts.easy, color: '#10b981' }, // emerald-500
    { name: 'Medium', value: breakdown.counts.medium, color: '#3b82f6' }, // blue-500
    { name: 'Hard', value: breakdown.counts.hard, color: '#f87171' }, // red-400
  ];

  return (
    <div className={`rounded-3xl p-6 border transition-all duration-300 shadow-sm ${
      isDarkMode 
        ? 'bg-slate-900/50 border-slate-800/80 hover:shadow-xl hover:shadow-black/20 text-white' 
        : 'bg-white border-slate-50 hover:shadow-xl hover:shadow-slate-200/50'
    }`}>
      <h3 className={`text-xs font-black uppercase tracking-widest ${
        isDarkMode ? 'text-slate-500' : 'text-slate-400'
      }`}>
        Mastery breakdown
      </h3>
      
      <div className="flex items-center mt-4">
        {/* Chart Side */}
        <div className="h-[180px] w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: isDarkMode ? '1px solid rgba(51, 65, 85, 0.5)' : 'none', 
                  backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
                  boxShadow: isDarkMode ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)' 
                }}
                itemStyle={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  color: isDarkMode ? '#f8fafc' : '#0f172a'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Side */}
        <div className="w-1/2 pl-6 space-y-3">
          {data.map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className={`text-xs font-bold ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {item.name}
                </span>
              </div>
              <span className={`text-xs font-black ${
                isDarkMode ? 'text-slate-200' : 'text-slate-900'
              }`}>
                {item.value} words
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
