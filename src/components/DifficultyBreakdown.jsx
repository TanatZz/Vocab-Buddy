import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function DifficultyBreakdown({ breakdown }) {
  if (!breakdown || (breakdown.counts.easy === 0 && breakdown.counts.medium === 0 && breakdown.counts.hard === 0)) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-10">
        <p className="text-gray-500">ไม่มีข้อมูลสัดส่วนความยากง่าย</p>
      </div>
    );
  }

  const data = [
    { name: 'จำได้แม่น (Easy)', value: breakdown.counts.easy, color: '#22c55e' }, // green-500
    { name: 'กำลังทบทวน (Medium)', value: breakdown.counts.medium, color: '#eab308' }, // yellow-500
    { name: 'ต้องจำเพิ่ม (Hard)', value: breakdown.counts.hard, color: '#ef4444' }, // red-500
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">สัดส่วนความเชี่ยวชาญ</h3>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [`${value} คำ`, name]}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
