import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import nivelesData from '../data/niveles.json';

// ── ESTILOS DE REINOS ────────────────────────────────────────────────────
const GRADIENTES = {
  calido: 'from-amber-500/30 via-yellow-500/20 to-amber-400/10',
  naturaleza: 'from-emerald-500/30 via-green-500/20 to-emerald-400/10',
  penitencial: 'from-indigo-500/30 via-purple-500/20 to-indigo-400/10',
  solemne: 'from-blue-500/30 via-sky-500/20 to-blue-400/10',
  regio: 'from-violet-500/30 via-purple-500/20 to-violet-400/10',
  fuego: 'from-orange-500/30 via-red-500/20 to-orange-400/10',
  sagrado: 'from-cyan-500/30 via-teal-500/20 to-cyan-400/10',
  mariano: 'from-pink-500/30 via-rose-500/20 to-pink-400/10',
  default: 'from-gray-500/20 via-slate-500/20 to-gray-400/10',
};

const REINO_ESTILOS = {
  calido: { bg: 'from-amber-900/40 to-yellow-800/20', border: 'border-amber-400/40', shadow: 'shadow-amber-400/20', decoracion: '🌟', particula: '⭐', textColor: 'text-amber-200', glow: 'rgba(251,191,36,0.2)' },
  naturaleza: { bg: 'from-emerald-900/40 to-green-800/20', border: 'border-emerald-400/40', shadow: 'shadow-emerald-400/20', decoracion: '🌿', particula: '🍃', textColor: 'text-emerald-200', glow: 'rgba(74,222,128,0.2)' },
  penitencial: { bg: 'from-indigo-900/40 to-purple-800/20', border: 'border-indigo-400/40', shadow: 'shadow-indigo-400/20', decoracion: '🕊️', particula: '✨', textColor: 'text-indigo-200', glow: 'rgba(129,140,248,0.2)' },
  solemne: { bg: 'from-blue-900/40 to-sky-800/20', border: 'border-blue-400/40', shadow: 'shadow-blue-400/20', decoracion: '⛪', particula: '💙', textColor: 'text-blue-200', glow: 'rgba(59,130,246,0.2)' },
  regio: { bg: 'from-violet-900/40 to-purple-800/20', border: 'border-violet-400/40', shadow: 'shadow-violet-400/20', decoracion: '⚔️', particula: '👑', textColor: 'text-violet-200', glow: 'rgba(139,92,246,0.2)' },
  fuego: { bg: 'from-orange-900/40 to-red-800/20', border: 'border-orange-400/40', shadow: 'shadow-orange-400/20', decoracion: '🔥', particula: '💥', textColor: 'text-orange-200', glow: 'rgba(249,115,22,0.2)' },
  sagrado: { bg: 'from-cyan-900/40 to-teal-800/20', border: 'border-cyan-400/40', shadow: 'shadow-cyan-400/20', decoracion: '✨', particula: '💎', textColor: 'text-cyan-200', glow: 'rgba(34,211,238,0.2)' },
  mariano: { bg: 'from-pink-900/40 to-rose-800/20', border: 'border-pink-400/40', shadow: 'shadow-pink-400/20', decoracion: '🌹', particula: '🌸', textColor: 'text-pink-200', glow: 'rgba(244,114,182,0.2)' },
  default: { bg: 'from-gray-800/40 to-gray-900/20', border: 'border-white/10', shadow: 'shadow-white/5', decoracion: '📖', particula: '•', textColor: 'text-white/80', glow: 'rgba(255,255,255,0.05)' },
};

const obtenerEstiloReino = (tema) => REINO_ESTILOS[tema] || REINO_ESTILOS.default;

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
const Mapa = ({ onIniciarExamen }) => {
  const { 
    nivelActual, 
    nivelesCompletados, 
    vidas, 
    iniciarLeccion,
  } = useGame();
  
  const { showToast } = useToast();
  const [unidades, setUnidades] = useState([]);
  const [efectoUnidad, setEfectoUnidad] = useState(null);
  const [particulas, setParticulas] = useState([]);

  // ── ESTRELLAS DE FONDO ──
  const [estrellas] = useState(() => {
    const arr = [];
    for (let i = 0; i < 50; i++) {
      arr.push({ 
        id: i, 
        left: Math.random() * 100, 
        top: Math.random() * 100, 
        size: 1 + Math.random() * 2.5, 
        delay: Math.random() * 5, 
        duration: 2 + Math.random() * 4,
        opacity: 0.2 + Math.random() * 0.5
      });
    }
    return arr;
  });

  // ── CARGAR UNIDADES ──
  useEffect(() => {
    setUnidades(nivelesData.unidades);
  }, []);

  // ── PARTÍCULAS FLOTANTES (restauradas) ──
  useEffect(() => {
    if (unidades.length === 0) return;
    const interval = setInterval(() => {
      const reino = unidades[Math.floor(Math.random() * unidades.length)];
      const estilo = obtenerEstiloReino(reino.tema);
      const id = Date.now() + Math.random();
      setParticulas(prev => [...prev, { 
        id, 
        left: Math.random() * 100, 
        icono: estilo.particula, 
        duracion: 4 + Math.random() * 4 
      }]);
      setTimeout(() => setParticulas(prev => prev.filter(p => p.id !== id)), 6000);
    }, 3000);
    return () => clearInterval(interval);
  }, [unidades]);

  // ── EFECTO DE UNIDAD COMPLETADA ──
  useEffect(() => {
    if (unidades.length === 0) return;
    let completadasConsecutivas = 0;
    for (let i = 0; i < unidades.length; i++) {
      const todas = unidades[i].lecciones.every(l => nivelesCompletados.includes(l.id));
      if (todas) completadasConsecutivas++;
      else break;
    }
    const ultimaCompletada = completadasConsecutivas - 1;
    if (ultimaCompletada >= 0 && ultimaCompletada !== efectoUnidad) {
      setEfectoUnidad(ultimaCompletada);
      
      confetti({ 
        particleCount: 200, 
        spread: 120, 
        origin: { y: 0.5 }, 
        colors: ['#facc15', '#ffffff', '#a855f7', '#3b82f6', '#22c55e'] 
      });
      setTimeout(() => {
        confetti({ 
          particleCount: 150, 
          spread: 80, 
          origin: { y: 0.5 }, 
          colors: ['#facc15', '#ffffff'] 
        });
      }, 300);
      
      showToast('🌟 ¡Reino completado! Sigue adelante', 'success', 3000);
      setTimeout(() => setEfectoUnidad(null), 3500);
    }
  }, [nivelesCompletados, unidades]);

  // ── FUNCIONES ──
  const isUnidadDesbloqueada = (idx) => {
    if (idx === 0) return true;
    let acum = 0;
    for (let i = 0; i < idx; i++) {
      acum += unidades[i]?.lecciones.length || 0;
    }
    return nivelActual > acum;
  };

  const isLeccionCompletada = (id) => nivelesCompletados.includes(id);

  const handleIniciarLeccion = (leccion, uIdx, lIdx) => {
    if (vidas <= 0) {
      showToast('❤️ Sin vidas — regresa en unas horas', 'warning', 3000);
      return;
    }
    if (!isUnidadDesbloqueada(uIdx)) {
      showToast('🔒 Completa el reino anterior primero', 'warning', 2500);
      return;
    }
    if (lIdx > 0 && !isLeccionCompletada(unidades[uIdx].lecciones[lIdx - 1]?.id)) {
      showToast('🔒 Completa la lección anterior primero', 'warning', 2500);
      return;
    }
    iniciarLeccion(leccion);
  };

  const totalLecciones = unidades.reduce((acc, u) => acc + u.lecciones.length, 0);
  const progresoGlobal = (nivelesCompletados.length / totalLecciones) * 100;

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="relative py-4 sm:py-8 space-y-8 sm:space-y-16 overflow-x-hidden">
      {/* ── ESTRELLAS DE FONDO ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {estrellas.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              opacity: star.opacity
            }}
          />
        ))}
      </div>

      {/* ── PARTÍCULAS FLOTANTES ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particulas.map(p => (
          <motion.div
            key={p.id}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '-100%', opacity: [0, 0.8, 0] }}
            transition={{ duration: p.duracion, ease: 'linear' }}
            className="absolute text-lg sm:text-xl"
            style={{ left: `${p.left}%` }}
          >
            {p.icono}
          </motion.div>
        ))}
      </div>

      {/* ── ENCABEZADO ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center px-3 sm:px-4"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-block mb-2 px-4 py-1 rounded-full bg-yellow-400/20 backdrop-blur border border-yellow-400/40"
        >
          <p className="text-[8px] sm:text-[9px] font-black text-yellow-300 uppercase tracking-[0.4em]">Aventura espiritual</p>
        </motion.div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mt-2 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
          Sendero de Luz
        </h1>
        <p className="text-white/40 text-xs sm:text-sm mt-2 max-w-md mx-auto px-2">
          Explora cada reino, completa lecciones y desbloquea la gloria celestial
        </p>
        
        {/* Progreso general */}
        <div className="mt-3 sm:mt-4 max-w-xs mx-auto px-2">
          <div className="flex justify-between text-white/30 text-[8px] sm:text-[9px] font-black mb-1">
            <span>Progreso total</span>
            <span>{Math.round(progresoGlobal)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progresoGlobal}%` }}
              transition={{ duration: 1.5 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* ── SIN VIDAS ── */}
      {vidas <= 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 glass-card rounded-2xl p-4 text-center border border-red-500/30 max-w-sm mx-auto"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl animate-pulse">❤️</span>
            <div>
              <p className="text-red-400 font-black text-xs sm:text-sm">Sin vidas</p>
              <p className="text-white/40 text-[10px] sm:text-xs">Regresa en unas horas</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── REINOS ── */}
      {unidades.map((unidad, uIdx) => {
        const desbloqueada = isUnidadDesbloqueada(uIdx);
        const estilo = obtenerEstiloReino(unidad.tema);
        const completadas = unidad.lecciones.filter(l => nivelesCompletados.includes(l.id)).length;
        const progreso = (completadas / unidad.lecciones.length) * 100;
        const reinoCompleto = completadas === unidad.lecciones.length;

        return (
          <motion.div
            key={unidad.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: uIdx * 0.1, duration: 0.5 }}
            className={`relative z-10 mx-3 sm:mx-4 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-700 bg-gradient-to-br ${estilo.bg} border ${estilo.border} shadow-xl backdrop-blur-sm ${desbloqueada ? 'opacity-100' : 'opacity-80'}`}
            style={{ boxShadow: `0 0 20px ${estilo.glow}` }}
          >
            {/* Efecto de reino completado */}
            {efectoUnidad === uIdx && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-yellow-400/20 via-transparent to-transparent animate-pulse pointer-events-none"
              />
            )}

            {/* Decoraciones flotantes (más pequeñas en móvil) */}
            <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 text-5xl sm:text-7xl opacity-30 pointer-events-none animate-float">{estilo.decoracion}</div>
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 text-5xl sm:text-7xl opacity-20 pointer-events-none animate-float-delay">{estilo.decoracion}</div>

            {/* ── HEADER DEL REINO ── */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap relative z-10">
              <div className="text-4xl sm:text-6xl drop-shadow-lg">{unidad.icono}</div>
              <div className="flex-1 min-w-0">
                <h2 className={`text-lg sm:text-2xl font-black ${estilo.textColor} tracking-tighter truncate`}>
                  {unidad.nombre}
                </h2>
                <p className="text-white/40 text-xs sm:text-sm truncate">{unidad.subtitulo}</p>
              </div>
              {!desbloqueada && (
                <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                  <span className="text-base sm:text-xl">🔒</span>
                  <span className="text-white/70 text-[9px] sm:text-xs font-black">Bloqueado</span>
                </div>
              )}
              {desbloqueada && reinoCompleto && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-green-500/30 backdrop-blur-sm rounded-full px-3 py-1 border border-green-400/60"
                >
                  <span className="text-green-300 text-[10px] sm:text-sm font-black">✨ Completado</span>
                </motion.div>
              )}
            </div>

            {/* ── LECCIONES ── */}
            {desbloqueada ? (
              <>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4">
                  {unidad.lecciones.map((leccion, lIdx) => {
                    const completada = isLeccionCompletada(leccion.id);
                    const bloqueada = lIdx > 0 && !isLeccionCompletada(unidad.lecciones[lIdx - 1]?.id);
                    const disponible = !bloqueada;
                    const esExamen = leccion.tipo === 'examen';

                    return (
                      <motion.button
                        key={leccion.id}
                        onClick={() => {
                          if (esExamen) {
                            if (onIniciarExamen) onIniciarExamen(unidad.id, unidad.nombre);
                            return;
                          }
                          disponible && handleIniciarLeccion(leccion, uIdx, lIdx);
                        }}
                        disabled={!disponible || vidas <= 0}
                        whileHover={disponible && !esExamen ? { scale: 1.05, y: -2 } : {}}
                        whileTap={disponible ? { scale: 0.95 } : {}}
                        className={`group relative flex flex-col items-center justify-center p-2 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                          completada
                            ? 'glass-card border-green-400/60 bg-green-500/15'
                            : esExamen
                            ? 'glass-card border-purple-400/40 bg-purple-500/15 hover:border-purple-400/70'
                            : disponible
                            ? 'glass-card border-white/20 hover:border-yellow-400/60 hover:shadow-yellow-400/30 hover:bg-white/10'
                            : 'glass-card border-white/5 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-3xl sm:text-5xl drop-shadow-md transition-transform duration-200 group-hover:scale-110">
                          {esExamen ? '🎓' : leccion.icono}
                        </span>
                        <p className="font-black text-[9px] sm:text-sm mt-1 text-center break-words max-w-[60px] sm:max-w-[100px] leading-tight">
                          {esExamen ? `Examen` : leccion.nombre}
                        </p>
                        {completada && (
                          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center text-[8px] sm:text-xs font-black shadow-lg animate-bounce">
                            ✓
                          </div>
                        )}
                        {esExamen && !completada && (
                          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center text-[8px] sm:text-xs font-black shadow-lg">
                            📝
                          </div>
                        )}
                        {!disponible && !completada && !esExamen && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                            <span className="text-2xl sm:text-4xl drop-shadow-lg">🔒</span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* ── BARRA DE PROGRESO ── */}
                <div className="mt-4 sm:mt-6">
                  <div className="flex justify-between items-center text-white/40 text-[8px] sm:text-[9px] mb-1.5 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">✨</span> Progreso
                    </span>
                    <span className="font-black">{completadas} / {unidad.lecciones.length}</span>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-white/15 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progreso}%` }}
                      transition={{ duration: 1, delay: uIdx * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300"
                    />
                  </div>
                  {progreso === 100 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mt-1.5 text-yellow-400/80 text-[9px] sm:text-[10px] font-black animate-pulse"
                    >
                      🌟 ¡Reino completado! Sigue adelante 🌟
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-block p-3 sm:p-4 bg-black/40 rounded-full backdrop-blur">
                  <span className="text-3xl sm:text-5xl animate-pulse">🔒</span>
                </div>
                <p className="text-white/40 text-xs sm:text-sm mt-3 max-w-xs mx-auto px-2">
                  Completa el reino anterior para desbloquear esta tierra sagrada
                </p>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* ── FOOTER ── */}
      <div className="relative z-10 text-center py-4 sm:py-8 px-4">
        <div className="w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/20 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] mt-3 sm:mt-4"
        >
          ✨ Que la luz te guíe ✨
        </motion.p>
      </div>

      {/* ── ESTILOS ── */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 5s ease-in-out infinite;
        }
        @media (max-width: 380px) {
          .xs\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default Mapa;