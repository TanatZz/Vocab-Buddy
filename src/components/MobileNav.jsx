import React from 'react';

export default function MobileNav({ currentScreen, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'คลังคำศัพท์', icon: '📚' },
    { id: 'stats', label: 'สถิติ', icon: '📊' },
    { id: 'profile', label: 'โปรไฟล์', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-[60px] flex justify-around items-center px-2 z-40 max-w-md mx-auto md:max-w-2xl shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map(item => {
        // active state includes sub-screens for home
        const isActive = currentScreen === item.id || 
                         (item.id === 'home' && ['deck-detail', 'quiz', 'summary'].includes(currentScreen));
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'}`}
          >
            <span className={`text-2xl mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
