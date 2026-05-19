import { Library, BarChart2, User } from 'lucide-react';

export default function MobileNav({ currentScreen, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Library', icon: Library },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="mobile-nav fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 h-[64px] flex justify-around items-center px-4 z-30 max-w-md mx-auto md:max-w-2xl safe-bottom transition-all duration-300">
      {navItems.map(item => {
        const Icon = item.icon;
        // active state includes sub-screens for home
        const isActive = currentScreen === item.id || 
                         (item.id === 'home' && ['deck-detail', 'quiz', 'summary'].includes(currentScreen));
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full animate-fade-in" />
            )}
            <Icon size={20} className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
