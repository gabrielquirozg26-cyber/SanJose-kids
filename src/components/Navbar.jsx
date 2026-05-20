import React from 'react';
import { useGame } from '../context/GameContext';

const TABS = [
  { id: 'mapa',     icono: '🗺️', nombre: 'APRENDER'  },
  { id: 'ranking',  icono: '🏆', nombre: 'RANKING'   },
  { id: 'misiones', icono: '🎯', nombre: 'MISIONES'  },
  { id: 'tienda',   icono: '🛒', nombre: 'TIENDA'    },
  { id: 'perfil',   icono: '👤', nombre: 'PERFIL'    },
];

const Navbar = () => {
  const { activeTab, setActiveTab, misionesState } = useGame();

  // Cuenta misiones completadas sin reclamar para mostrar badge
  const pendientes = (() => {
    if (!misionesState) return 0;
    const d = misionesState.diarias   ?? {};
    const s = misionesState.semanales ?? {};
    const contarPendientes = (obj) =>
      Object.values(obj).filter(m => m.progreso >= (m.meta ?? 999) && !m.reclamada).length;
    return contarPendientes(d) + contarPendientes(s);
  })();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050b14]/90 backdrop-blur-md border-t border-white/5">
      <div className="flex justify-around items-center py-3 px-2 max-w-xl mx-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 relative
              ${activeTab === tab.id ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-70 scale-100'}`}
          >
            <div className={`text-2xl ${activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`}>
              {tab.icono}
            </div>

            <span className={`text-[9px] font-black tracking-tighter
              ${activeTab === tab.id ? 'text-yellow-400' : 'text-white/40'}`}>
              {tab.nombre}
            </span>

            {activeTab === tab.id && (
              <div className="w-5 h-0.5 bg-yellow-400 rounded-full" />
            )}

            {/* Badge de misiones pendientes */}
            {tab.id === 'misiones' && pendientes > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400
                flex items-center justify-center text-[9px] font-black text-blue-900">
                {pendientes}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
