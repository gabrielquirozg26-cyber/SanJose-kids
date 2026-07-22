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
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'diarias', 'semanales'

  const handleReclamar = async (grupo, id, recompensa) => {
    setReclamando(id);
    const ok = await reclamarMision(grupo, id, recompensa);
    setReclamando(null);
    if (ok) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 }, colors: ['#facc15', '#fff'] });
      showToast(`🎉 Recompensa de ${recompensa} monedas reclamada`, 'success');
    }
  };

  const handleCanjear = async (logroId) => {
    setCanjeando(logroId);
    const ok = await canjearLogro(logroId);
    setCanjeando(null);
    if (ok) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#a855f7', '#facc15'] });
      showToast('🏆 Título desbloqueado', 'success');
    }
  };

  const diarias = misionesState?.diarias || {};
  const semanales = misionesState?.semanales || {};

  // ── FILTRAR MISIONES ──
  const mostrarDiarias = filtro === 'todas' || filtro === 'diarias';
  const mostrarSemanales = filtro === 'todas' || filtro === 'semanales';

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/40 text-sm mt-4 animate-pulse">Cargando misiones...</p>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 space-y-6 sm:space-y-8 animate-slide-up">
      {/* ── ENCABEZADO ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-block px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 mb-2">
          <p className="text-[8px] sm:text-[9px] font-black text-yellow-400 uppercase tracking-[0.4em]">🎯 Desafíos</p>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">Misiones</h2>
        <p className="text-white/40 text-xs sm:text-sm mt-1">Completa desafíos diarios y semanales para ganar monedas</p>
      </motion.div>

      {/* ── FILTROS ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-1 sm:gap-2 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10"
      >
        {[
          { id: 'todas', label: '📋 Todas' },
          { id: 'diarias', label: '☀️ Diarias' },
          { id: 'semanales', label: '🌟 Semanales' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFiltro(t.id)}
            className={`flex-1 py-1.5 sm:py-2 rounded-full font-black text-[9px] sm:text-xs uppercase tracking-widest transition-all ${
              filtro === t.id 
                ? 'bg-yellow-400 text-blue-900 shadow-lg' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* ── LOGROS DE NIVEL ── */}
      {logrosPendientes && logrosPendientes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">🏆</span>
            <h3 className="text-white font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              Recompensas de nivel ({logrosPendientes.length})
            </h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {logrosPendientes.map(logro => {
              const titulo = titulosPorNivel?.find(t => t.id === logro.id);
              if (!titulo) return null;
              return (
                <motion.div 
                  key={logro.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-2xl p-3 sm:p-4 border border-purple-500/30 bg-purple-500/5 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
                      🎖️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-sm sm:text-base truncate">{titulo.nombre}</p>
                      <p className="text-white/40 text-[10px] sm:text-xs truncate">Completa el nivel para desbloquear este título</p>
                    </div>
                    <button
                      onClick={() => handleCanjear(logro.id)}
                      disabled={canjeando === logro.id}
                      className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-black text-[10px] sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shrink-0"
                    >
                      {canjeando === logro.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Canjear'
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── MISIONES DIARIAS ── */}
      {mostrarDiarias && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">☀️</span>
            <h3 className="text-white font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
              Diarias ({Object.keys(diarias).filter(k => diarias[k]?.progreso > 0).length}/{Object.keys(diarias).length})
            </h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {MISIONES_DIARIAS.map(def => {
              const mision = diarias[def.id];
              if (!mision) return null;
              const completada = mision.progreso >= def.meta;
              const reclamada = mision.reclamada;
              const porcentaje = Math.min((mision.progreso / def.meta) * 100, 100);
              const progresoMostrar = `${mision.progreso}/${def.meta}`;

              return (
                <motion.div 
                  key={def.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`glass-card rounded-2xl p-3 sm:p-4 border transition-all hover:scale-[1.01] ${
                    completada && !reclamada ? 'border-yellow-400/60 bg-yellow-400/10' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Icono */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-2xl sm:text-3xl shrink-0 ${
                      completada && !reclamada ? 'bg-yellow-400/20 border border-yellow-400/40' : 'bg-white/5 border border-white/10'
                    }`}>
                      {def.icono}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-sm sm:text-base truncate">{def.titulo}</p>
                      <p className="text-white/40 text-[10px] sm:text-xs truncate">{def.descripcion}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${porcentaje}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${
                              completada ? 'bg-gradient-to-r from-yellow-400 to-amber-400' : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                            }`}
                          />
                        </div>
                        <span className="text-white/40 text-[9px] sm:text-[10px] font-black min-w-[30px] text-right">
                          {progresoMostrar}
                        </span>
                      </div>
                    </div>

                    {/* Acción */}
                    <div className="text-right shrink-0">
                      <p className="text-yellow-400 font-black text-xs sm:text-sm">+{def.recompensa} 🪙</p>
                      {!reclamada && completada && (
                        <button
                          onClick={() => handleReclamar('diarias', def.id, def.recompensa)}
                          disabled={reclamando === def.id}
                          className="mt-1 px-3 sm:px-4 py-1 rounded-xl font-black text-[9px] sm:text-xs bg-yellow-400 text-blue-900 hover:scale-105 transition-all disabled:opacity-50"
                        >
                          {reclamando === def.id ? (
                            <div className="w-3 h-3 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            'Reclamar'
                          )}
                        </button>
                      )}
                      {reclamada && (
                        <p className="text-green-400 text-[9px] sm:text-[10px] font-black mt-1">✓ Reclamada</p>
                      )}
                    </div>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">🌟</span>
            <h3 className="text-white font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Semanales ({Object.keys(semanales).filter(k => semanales[k]?.progreso > 0).length}/{Object.keys(semanales).length})
            </h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {MISIONES_SEMANALES.map(def => {
              const mision = semanales[def.id];
              if (!mision) return null;
              const completada = mision.progreso >= def.meta;
              const reclamada = mision.reclamada;
              const porcentaje = Math.min((mision.progreso / def.meta) * 100, 100);
              const progresoMostrar = `${mision.progreso}/${def.meta}`;

              return (
                <motion.div 
                  key={def.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`glass-card rounded-2xl p-3 sm:p-4 border transition-all hover:scale-[1.01] ${
                    completada && !reclamada ? 'border-blue-400/60 bg-blue-400/10' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Icono */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-2xl sm:text-3xl shrink-0 ${
                      completada && !reclamada ? 'bg-blue-400/20 border border-blue-400/40' : 'bg-white/5 border border-white/10'
                    }`}>
                      {def.icono}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-sm sm:text-base truncate">{def.titulo}</p>
                      <p className="text-white/40 text-[10px] sm:text-xs truncate">{def.descripcion}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${porcentaje}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${
                              completada ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-purple-400 to-pink-400'
                            }`}
                          />
                        </div>
                        <span className="text-white/40 text-[9px] sm:text-[10px] font-black min-w-[30px] text-right">
                          {progresoMostrar}
                        </span>
                      </div>
                    </div>

                    {/* Acción */}
                    <div className="text-right shrink-0">
                      <p className="text-yellow-400 font-black text-xs sm:text-sm">+{def.recompensa} 🪙</p>
                      {!reclamada && completada && (
                        <button
                          onClick={() => handleReclamar('semanales', def.id, def.recompensa)}
                          disabled={reclamando === def.id}
                          className="mt-1 px-3 sm:px-4 py-1 rounded-xl font-black text-[9px] sm:text-xs bg-yellow-400 text-blue-900 hover:scale-105 transition-all disabled:opacity-50"
                        >
                          {reclamando === def.id ? (
                            <div className="w-3 h-3 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            'Reclamar'
                          )}
                        </button>
                      )}
                      {reclamada && (
                        <p className="text-green-400 text-[9px] sm:text-[10px] font-black mt-1">✓ Reclamada</p>
                      )}
                    </div>
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
          className="glass-card rounded-2xl p-6 sm:p-8 text-center border border-white/10"
        >
          <p className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎯</p>
          <p className="text-white font-black text-sm sm:text-base">¡No hay misiones activas!</p>
          <p className="text-white/40 text-xs sm:text-sm mt-1">Vuelve más tarde para nuevos desafíos</p>
          <div className="mt-3 sm:mt-4 inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
            <span className="text-yellow-400 text-[9px] sm:text-[10px] font-black">🚀 Sigue completando lecciones</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Misiones;