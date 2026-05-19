import React from 'react';

export default function ProgressCard({ title, value, subtitle, icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="rounded-2xl p-5 bg-white shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${colorMap[color] || colorMap.indigo}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-gray-800">{value}</span>
          {subtitle && <span className="text-sm font-medium text-gray-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
