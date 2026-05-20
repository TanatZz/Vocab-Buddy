export default function ProgressCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'text-primary', 
  bg = 'bg-primary/5', 
  fullWidth = false,
  isDarkMode = false
}) {
  return (
    <div className={`rounded-3xl p-6 border transition-all duration-300 flex items-center gap-5 ${
      isDarkMode 
        ? 'bg-slate-900/50 border-slate-800/80 hover:shadow-xl hover:shadow-black/20' 
        : 'bg-white border-slate-50 hover:shadow-xl hover:shadow-slate-200/50 shadow-sm'
    } ${fullWidth ? 'w-full' : ''}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${
          isDarkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {title}
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-black tracking-tight transition-colors ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {value}
          </span>
          {subtitle && (
            <span className={`text-[10px] font-bold uppercase transition-colors ${
              isDarkMode ? 'text-slate-600' : 'text-slate-300'
            }`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
