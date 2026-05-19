export default function ProgressCard({ title, value, subtitle, icon: Icon, color = 'text-primary', bg = 'bg-primary/5', fullWidth = false }) {
  return (
    <div className={`rounded-3xl p-6 bg-white border border-slate-50 shadow-sm flex items-center gap-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all ${fullWidth ? 'w-full' : ''}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
          {subtitle && <span className="text-[10px] font-bold text-slate-300 uppercase">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
