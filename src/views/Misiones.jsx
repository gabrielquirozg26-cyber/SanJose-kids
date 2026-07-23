// src/views/Misiones.jsx
import React, { useState } from 'react';
import { useMissions } from '../context/MissionsContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Misiones = () => {
  const { misionesState, reclamarMision, MISIONES_DIARIAS, MISIONES_SEMANALES, loading } = useMissions();
  const { logrosPendientes, canjearLogro, titulosPorNivel } = useGame();
  const { showToast } = useToast();
  
  const [reclamando, setReclamando] = useState(null);
  const [canjeando, setCanjeando] = useState(null);
  const [filtro, setFiltro] = useState('todas');

  // ── ANIMACIONES ──
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 350, damping: 25 }
    }
  };

  const handleReclamar = async (grupo, id, recompensa) => {
    setReclamando(id);
    const ok = await reclamarMision(grupo, id, recompensa);
    setReclamando(null);
    if (ok) {
      confetti({ 
        particleCount: 60, 
        spread: 50, 
        origin: { y: 0.6 }, 
        colors: ['#facc15', '#fff', '#3b82f6'] 
      });
      showToast(`🎉 +${recompensa} monedas reclamadas`, 'success');
    }
  };

  const handleCanjear = async (logroId) => {
    setCanjeando(logroId);
    const ok = await canjearLogro(logroId);
    setCanjeando(null);
    if (ok) {
      confetti({ 
        particleCount: 80, 
        spread: 60, 
        origin: { y: 0.6 }, 
        colors: ['#a855f7', '#facc15', '#fff'] 
      });
      showToast('🏆 Título desbloqueado', 'success');
    }
  };

  const diarias = misionesState?.diarias || {};
  const semanales = misionesState?.semanales || {};

  const mostrarDiarias = filtro === 'todas' || filtro === 'diarias';
  const mostrarSemanales = filtro === 'todas' || filtro === 'semanales';

  // ── CONTADORES ──
  const diariasCompletadas = Object.values(diarias).filter(m => m?.progreso > 0).length;
  const diariasReclamadas = Object.values(diarias).filter(m => m?.reclamada).length;
  const semanalesCompletadas = Object.values(semanales).filter(m => m?.progreso > 0).length;
  const semanalesReclamadas = Object.values(semanales).filter(m => m?.reclamada).length;

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/40 text-sm mt-4 animate-pulse">Cargando misiones...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-3 sm:py-6 space-y-4 sm:space-y-6 px-3 sm:px-4"
    >
      {/* ── ENCABEZADO ── */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-block px-3 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 mb-1.5">
          <p className="text-[8px] sm:text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em]">🎯 Desafíos</p>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter">Misiones</h2>
        <p className="text-white/40 text-[10px] sm:text-xs mt-0.5">Completa desafíos para ganar monedas</p>
      </motion.div>

      {/* ── FILTROS (ESPECTACULARES) ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-1 sm:gap-2 bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10 mx-0"
      >
        {[
          { id: 'todas', label: 'Todas', icon: '📋' },
          { id: 'diarias', label: 'Diarias', icon: '☀️' },
          { id: 'semanales', label: 'Semanales', icon: '🌟' },
        ].map(t => {
          const isActive = filtro === t.id;
          // Contador para el badge
          let count = 0;
          if (t.id === 'todas') {
            count = Object.values(diarias).filter(m => m?.progreso > 0).length + 
                    Object.values(semanales).filter(m => m?.progreso > 0).length;
          } else if (t.id === 'diarias') {
            count = Object.values(diarias).filter(m => m?.progreso > 0).length;
          } else {
            count = Object.values(semanales).filter(m => m?.progreso > 0).length;
          }

          return (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setFiltro(t.id)}
              className={`relative flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-full font-black text-[8px] sm:text-[10px] uppercase tracking-wider transition-all duration-300 ${
                isActive 
                  ? 'text-blue-900' 
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {/* Fondo activo con animación */}
              {isActive && (
                <motion.div
                  layoutId="filtroActivo"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 shadow-lg shadow-yellow-400/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              
              {/* Efecto de brillo en hover */}
              {!isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/0"
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  transition={{ duration: 0.2 }}
                />
              )}
              
              {/* Contenido */}
              <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5">
                <span className="text-[10px] sm:text-sm">{t.icon}</span>
                <span className={`${isActive ? 'text-blue-900' : 'text-white/70'}`}>
                  {t.label}
                </span>
                {/* Badge de conteo */}
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded-full font-black ${
                      isActive 
                        ? 'bg-blue-900/20 text-blue-900' 
                        : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {count}
                  </motion.span>
                )}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── LOGROS DE NIVEL ── */}
      {logrosPendientes && logrosPendientes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏆</span>
            <h3 className="text-white font-black text-[10px] sm:text-xs uppercase tracking-wider">
              Recompensas ({logrosPendientes.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {logrosPendientes.map((logro, index) => {
              const titulo = titulosPorNivel?.find(t => t.id === logro.id);
              if (!titulo) return null;
              return (
                <motion.div 
                  key={logro.id} 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ scale: 1.01 }}
                  className="glass-card rounded-xl p-2.5 sm:p-3 border border-purple-500/30 bg-purple-500/5 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-lg sm:text-xl shrink-0">
                    🎖️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-[10px] sm:text-sm truncate">{titulo.nombre}</p>
                    <p className="text-white/40 text-[8px] sm:text-[10px] truncate">Completa el nivel para desbloquear</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCanjear(logro.id)}
                    disabled={canjeando === logro.id}
                    className="px-2.5 sm:px-4 py-1 rounded-xl font-black text-[8px] sm:text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-all disabled:opacity-50 shrink-0"
                  >
                    {canjeando === logro.id ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Canjear'
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── MISIONES DIARIAS ── */}
      {mostrarDiarias && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">☀️</span>
              <h3 className="text-white font-black text-[10px] sm:text-xs uppercase tracking-wider">
                Diarias ({diariasReclamadas}/{Object.keys(diarias).length})
              </h3>
            </div>
            <span className="text-white/30 text-[8px] font-black">
              {diariasCompletadas} completadas
            </span>
          </div>
          
          <div className="space-y-1.5">
            {MISIONES_DIARIAS.map((def, index) => {
              const mision = diarias[def.id];
              if (!mision) return null;
              const completada = mision.progreso >= def.meta;
              const reclamada = mision.reclamada;
              const porcentaje = Math.min((mision.progreso / def.meta) * 100, 100);

              return (
                <motion.div 
                  key={def.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.04 }}
                  className={`glass-card rounded-xl p-2.5 sm:p-3 border transition-all ${
                    completada && !reclamada ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Icono */}
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl shrink-0 ${
                      completada && !reclamada ? 'bg-yellow-400/20 border border-yellow-400/40' : 'bg-white/5 border border-white/10'
                    }`}>
                      {def.icono}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-black text-white text-[10px] sm:text-sm truncate">{def.titulo}</p>
                        <p className="text-yellow-400 font-black text-[9px] sm:text-xs shrink-0">+{def.recompensa} 🪙</p>
                      </div>
                      <p className="text-white/40 text-[8px] sm:text-[10px] truncate">{def.descripcion}</p>
                      
                      {/* Barra de progreso */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${porcentaje}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full rounded-full ${
                              completada ? 'bg-gradient-to-r from-yellow-400 to-amber-400' : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                            }`}
                          />
                        </div>
                        <span className="text-white/30 text-[8px] font-black min-w-[20px] text-right">
                          {mision.progreso}/{def.meta}
                        </span>
                      </div>
                    </div>

                    {/* Botón Reclamar */}
                    {!reclamada && completada && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReclamar('diarias', def.id, def.recompensa)}
                        disabled={reclamando === def.id}
                        className="px-2.5 py-1 rounded-lg font-black text-[8px] bg-yellow-400 text-blue-900 transition-all disabled:opacity-50 shrink-0"
                      >
                        {reclamando === def.id ? (
                          <div className="w-3 h-3 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Reclamar'
                        )}
                      </motion.button>
                    )}
                    {reclamada && (
                      <span className="text-green-400 text-[8px] sm:text-[9px] font-black shrink-0">✓</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── MISIONES SEMANALES ── */}
      {mostrarSemanales && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <h3 className="text-white font-black text-[10px] sm:text-xs uppercase tracking-wider">
                Semanales ({semanalesReclamadas}/{Object.keys(semanales).length})
              </h3>
            </div>
            <span className="text-white/30 text-[8px] font-black">
              {semanalesCompletadas} completadas
            </span>
          </div>
          
          <div className="space-y-1.5">
            {MISIONES_SEMANALES.map((def, index) => {
              const mision = semanales[def.id];
              if (!mision) return null;
              const completada = mision.progreso >= def.meta;
              const reclamada = mision.reclamada;
              const porcentaje = Math.min((mision.progreso / def.meta) * 100, 100);

              return (
                <motion.div 
                  key={def.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.04 }}
                  className={`glass-card rounded-xl p-2.5 sm:p-3 border transition-all ${
                    completada && !reclamada ? 'border-blue-400/50 bg-blue-400/5' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Icono */}
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl shrink-0 ${
                      completada && !reclamada ? 'bg-blue-400/20 border border-blue-400/40' : 'bg-white/5 border border-white/10'
                    }`}>
                      {def.icono}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-black text-white text-[10px] sm:text-sm truncate">{def.titulo}</p>
                        <p className="text-yellow-400 font-black text-[9px] sm:text-xs shrink-0">+{def.recompensa} 🪙</p>
                      </div>
                      <p className="text-white/40 text-[8px] sm:text-[10px] truncate">{def.descripcion}</p>
                      
                      {/* Barra de progreso */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${porcentaje}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full rounded-full ${
                              completada ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-purple-400 to-pink-400'
                            }`}
                          />
                        </div>
                        <span className="text-white/30 text-[8px] font-black min-w-[20px] text-right">
                          {mision.progreso}/{def.meta}
                        </span>
                      </div>
                    </div>

                    {/* Botón Reclamar */}
                    {!reclamada && completada && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReclamar('semanales', def.id, def.recompensa)}
                        disabled={reclamando === def.id}
                        className="px-2.5 py-1 rounded-lg font-black text-[8px] bg-yellow-400 text-blue-900 transition-all disabled:opacity-50 shrink-0"
                      >
                        {reclamando === def.id ? (
                          <div className="w-3 h-3 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Reclamar'
                        )}
                      </motion.button>
                    )}
                    {reclamada && (
                      <span className="text-green-400 text-[8px] sm:text-[9px] font-black shrink-0">✓</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── MENSAJE VACÍO ── */}
      {logrosPendientes?.length === 0 && Object.keys(diarias).length === 0 && Object.keys(semanales).length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6 text-center border border-white/10"
        >
          <p className="text-4xl mb-2">🎯</p>
          <p className="text-white font-black text-sm">¡No hay misiones activas!</p>
          <p className="text-white/40 text-xs mt-1">Vuelve más tarde para nuevos desafíos</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Misiones;