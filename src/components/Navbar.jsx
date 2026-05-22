import React from 'react';
import { useGame } from '../context/GameContext';

const Navbar = () => {
  const { activeTab, setActiveTab } = useGame();

  const tabs = [
    { id: 'mapa', icono: '🗺️', label: 'Mapa' },
    { id: 'album', icono: '📖', label: 'Álbum' },
    { id: 'tienda', icono: '🛒', label: 'Tienda' },
    { id: 'ranking', icono: '🏆', label: 'Ranking' },
    { id: 'misiones', icono: '⭐', label: 'Misiones' },
    { id: 'perfil', icono: '👤', label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-2xl border-t border-white/10 shadow-2xl">
      <div className="max-w-xl mx-auto px-1 py-1.5 sm:py-2">
        <div className="flex justify-between items-center gap-0.5 sm:gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1.5 sm:py-2 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-t from-yellow-400/20 to-transparent text-yellow-300 scale-105' 
                    : 'text-white/40 hover:text-white/70 active:scale-95'
                  }`}
              >
                <span className="text-xl sm:text-2xl mb-0.5 drop-shadow-lg transition-transform duration-200 group-hover:scale-110">
                  {tab.icono}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                  isActive ? 'text-yellow-300' : 'text-white/50'
                }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;