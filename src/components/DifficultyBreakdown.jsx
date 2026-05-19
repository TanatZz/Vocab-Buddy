import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DifficultyBreakdown({ breakdown }) {
  if (!breakdown || (breakdown.counts.easy === 0 && breakdown.counts.medium === 0 && breakdown.counts.hard === 0)) {
    return (
      <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 text-center animate-pop">
        <p className="text-slate-400 font-medium text-sm tracking-tight">ไม่มีข้อมูลสัดส่วนความยากง่าย</p>
      </div>
    );
  }

  const data = [
    { name: 'Easy', value: breakdown.counts.easy, color: '#10b981' }, // emerald-500
    { name: 'Medium', value: breakdown.counts.medium, color: '#2563eb' }, // primary
    { name: 'Hard', value: breakdown.counts.hard, color: '#f87171' }, // red-400
  ];

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all animate-slide-up">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Mastery breakdown</h3>
      
      <div className="flex items-center">
        <div className="h-[200px] w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 pl-6 space-y-4">
          {data.map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-slate-500">{item.name}</span>
              </div>
              <span className="text-xs font-black text-slate-900">{item.value} words</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
