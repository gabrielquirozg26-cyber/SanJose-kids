import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const MEDALLAS = ['🥇', '🥈', '🥉'];

const renderAvatar = (avatar, size = 'w-8 h-8', textSize = 'text-base') => {
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');
  if (esImagen) {
    return (
      <img 
        src={avatar} 
        alt="Avatar" 
        className="w-full h-full object-cover rounded-full"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `<span class="${textSize}">😇</span>`;
        }}
      />
    );
  }
  return <span className={textSize}>{avatar || '😇'}</span>;
};

const COLORS = [
  'border-amber-400/30 from-amber-500/10',
  'border-slate-400/30 from-slate-500/10',
  'border-rose-400/30 from-rose-500/10',
  'border-emerald-400/30 from-emerald-500/10',
  'border-indigo-400/30 from-indigo-500/10',
];

const RankingGrupos = ({ onCambiarModo }) => {
  const { obtenerRankingGrupos } = useGame();
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    obtenerRankingGrupos()
      .then(setGrupos)
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
        <p className="text-white/40 text-sm mt-4 font-black animate-pulse">Cargando grupos...</p>
      </div>
    );
  }

  if (!grupos.length) {
    return (
      <div className="glass-card p-8 text-center border border-white/10">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-white font-black">No hay grupos aún</p>
        <p className="text-white/40 text-xs mt-1">Comienza la catequesis</p>
      </div>
    );
  }

  const maxMonedas = grupos[0]?.monedasTotal || 1;

  return (
    <div className="py-6 space-y-6 animate-slide-up">
      {/* === BOTONES DE NAVEGACIÓN MEJORADOS === */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-1 flex gap-1 border border-white/10"
      >
        <button 
          onClick={() => onCambiarModo?.('grupo')} 
          className="flex-1 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white/70 hover:bg-white/10 hover:text-white"
        >
          🏠 Mi grupo
        </button>
        <button 
          onClick={() => onCambiarModo?.('global')} 
          className="flex-1 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white/70 hover:bg-white/10 hover:text-white"
        >
          🌍 Global
        </button>
        <button 
          className="flex-1 py-2 rounded-2xl font-black text-xs uppercase tracking-widest bg-yellow-400 text-blue-900 shadow-lg"
        >
          📊 Grupos
        </button>
      </motion.div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-block px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 mb-3">
          <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.5em]">🏆 Competencia</p>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tighter">Ranking de Grupos</h2>
        <p className="text-white/40 text-xs mt-1">{grupos.length} grupos · {grupos.reduce((acc, g) => acc + g.estudiantes.length, 0)} catequistas</p>
      </motion.div>

      {/* Lista de grupos */}
      <div className="space-y-5">
        {grupos.map((grupo, idx) => {
          const expandido = expandidos[grupo.nombre];
          const mostrando = expandido ? grupo.estudiantes : grupo.top3;
          const medalla = idx < 3 ? MEDALLAS[idx] : `#${idx + 1}`;
          const porcentaje = Math.min((grupo.monedasTotal / maxMonedas) * 100, 100);
          const colorClass = COLORS[idx % COLORS.length];

          return (
            <motion.div
              key={grupo.nombre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`glass-card rounded-3xl border ${colorClass} bg-gradient-to-br overflow-hidden transition-all hover:shadow-xl hover:scale-[1.01]`}
            >
              {/* Header del grupo */}
              <div className="p-5 pb-3 border-b border-white/10">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl drop-shadow-lg">{medalla}</span>
                    <div>
                      <h3 className="text-2xl font-black text-white">{grupo.nombre}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-yellow-400 font-black text-sm">
                          🏆 {grupo.monedasTotal.toLocaleString()}
                        </span>
                        <span className="text-white/30 text-[10px] font-black">·</span>
                        <span className="text-white/40 text-[10px]">
                          👥 {grupo.estudiantes.length} miembros
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setExpandidos(prev => ({ ...prev, [grupo.nombre]: !prev[grupo.nombre] }))} 
                    className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-[10px] font-black uppercase hover:bg-white/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    {expandido ? '▲ Ver menos' : '▼ Ver líderes'}
                  </button>
                </div>

                {/* Barra de progreso */}
                <div className="mt-3">
                  <div className="flex justify-between text-white/30 text-[9px] font-black mb-1">
                    <span>Progreso</span>
                    <span>{Math.round(porcentaje)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentaje}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.3)]"
                    />
                  </div>
                </div>
              </div>

              {/* Lista de miembros */}
              <AnimatePresence mode="wait">
                <div className="p-4 space-y-2">
                  {mostrando.map((user, i) => (
                    <motion.div
                      key={user.uid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="w-8 text-center">
                        {i < 3 ? (
                          <span className="text-xl">{MEDALLAS[i]}</span>
                        ) : (
                          <span className="text-white/30 text-[10px] font-black">#{i + 1}</span>
                        )}
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                        {renderAvatar(user.avatar, 'w-9 h-9', 'text-base')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-white truncate">{user.nombre}</p>
                        <p className="text-white/30 text-[9px]">
                          Nivel {user.nivelActual} · Racha {user.racha}🔥
                        </p>
                      </div>
                      <div className="bg-black/20 px-2.5 py-1 rounded-full shrink-0">
                        <span className="text-yellow-400 font-black text-sm">
                          🪙 {user.monedas.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  
                  {!expandido && grupo.estudiantes.length > 3 && (
                    <button 
                      onClick={() => setExpandidos(prev => ({ ...prev, [grupo.nombre]: true }))} 
                      className="w-full text-center py-2 text-white/30 text-[10px] font-black uppercase hover:text-yellow-400 transition-colors group flex items-center justify-center gap-1"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">+</span>
                      {grupo.estudiantes.length - 3} más
                    </button>
                  )}
                </div>
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.5em]">
          🏅 El grupo con más monedas gana
        </p>
      </div>
    </div>
  );
};

export default RankingGrupos;