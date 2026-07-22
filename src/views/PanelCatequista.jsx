// src/views/PanelCatequista.jsx
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ui/Toast';
import EstadisticasCatequista from '../components/catequista/EstadisticasCatequista';
import MiGrupoCatequista from '../components/catequista/MiGrupoCatequista';
import PerfilCatequista from '../components/catequista/PerfilCatequista';
import EvaluacionesCatequista from '../components/catequista/EvaluacionesCatequista';
import CatequistasGrupo from '../components/catequista/CatequistasGrupo';

const PanelCatequista = () => {
  const { nombre, grupo, rol } = useGame();
  const { cerrarSesion } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('estadisticas');
  const [menuAbierto, setMenuAbierto] = useState(false);

  const tabs = [
    { id: 'estadisticas', label: '📊 Estadísticas', icono: '📊' },
    { id: 'miGrupo', label: '👥 Mi Grupo', icono: '👥' },
    { id: 'catequistas', label: '👨‍🏫 Catequistas', icono: '👨‍🏫' },
    { id: 'evaluaciones', label: '📋 Evaluaciones', icono: '📋' },
    { id: 'perfil', label: '👤 Perfil', icono: '👤' },
  ];

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    showToast('👋 Hasta luego, catequista', 'info');
  };

  return (
    <div className="min-h-screen bg-[#080f1a] text-white font-sans pb-24">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400/50">
              <img src="/logo.jpg" alt="San JoseKids" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tighter">San JoseKids</h1>
              <p className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">
                {rol === 'coordinador' ? 'Coordinador' : 'Catequista'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-white">{nombre}</p>
              <p className="text-[8px] text-white/40 font-black uppercase tracking-widest">{grupo}</p>
            </div>
            <button
              onClick={handleCerrarSesion}
              className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all"
            >
              Salir
            </button>
          </div>
        </div>

        {/* ── NAVBAR (Desktop) ── */}
        <div className="max-w-6xl mx-auto px-4 pb-3 hidden sm:block">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  tab === t.id
                    ? 'bg-yellow-400 text-blue-900 shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── NAVBAR (Mobile) ── */}
        <div className="sm:hidden px-4 pb-3">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10"
          >
            <span className="font-black text-sm">
              {tabs.find(t => t.id === tab)?.label || 'Menú'}
            </span>
            <span className="text-white/40">{menuAbierto ? '▲' : '▼'}</span>
          </button>
          {menuAbierto && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 bg-white/5 rounded-xl p-1 border border-white/10"
            >
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setMenuAbierto(false); }}
                  className={`w-full px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all text-left ${
                    tab === t.id
                      ? 'bg-yellow-400 text-blue-900 shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </header>

      {/* ── CONTENIDO ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {tab === 'estadisticas' && (
            <motion.div
              key="estadisticas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EstadisticasCatequista />
            </motion.div>
          )}

          {tab === 'miGrupo' && (
            <motion.div
              key="miGrupo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MiGrupoCatequista />
            </motion.div>
          )}

          {tab === 'catequistas' && (
            <motion.div
              key="catequistas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CatequistasGrupo />
            </motion.div>
          )}

          {tab === 'evaluaciones' && (
            <motion.div
              key="evaluaciones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EvaluacionesCatequista />
            </motion.div>
          )}

          {tab === 'perfil' && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PerfilCatequista />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PanelCatequista;