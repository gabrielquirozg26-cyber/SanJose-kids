import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import nivelesData from '../data/niveles.json';
import confetti from 'canvas-confetti';

// Colores reales para los gradientes (hex)
const GRADIENTES = {
  calido: 'linear-gradient(90deg, #fbbf24, #fcd34d)',
  naturaleza: 'linear-gradient(90deg, #34d399, #6ee7b7)',
  penitencial: 'linear-gradient(90deg, #818cf8, #a78bfa)',
  solemne: 'linear-gradient(90deg, #60a5fa, #7dd3fc)',
  regio: 'linear-gradient(90deg, #a78bfa, #c084fc)',
  fuego: 'linear-gradient(90deg, #fb923c, #f97316)',
  sagrado: 'linear-gradient(90deg, #22d3ee, #5eead4)',
  mariano: 'linear-gradient(90deg, #f472b6, #fb7185)',
  default: 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
};

const REINO_ESTILOS = {
  calido: { bg: 'from-amber-900/30 to-yellow-800/10', border: 'border-amber-400/40', shadow: 'shadow-amber-400/20', decoracion: '🌟', particula: '⭐', textColor: 'text-amber-200', glow: 'rgba(251,191,36,0.3)' },
  naturaleza: { bg: 'from-emerald-900/30 to-green-800/10', border: 'border-emerald-400/40', shadow: 'shadow-emerald-400/20', decoracion: '🌿', particula: '🍃', textColor: 'text-emerald-200', glow: 'rgba(74,222,128,0.3)' },
  penitencial: { bg: 'from-indigo-900/30 to-purple-800/10', border: 'border-indigo-400/40', shadow: 'shadow-indigo-400/20', decoracion: '🕊️', particula: '✨', textColor: 'text-indigo-200', glow: 'rgba(129,140,248,0.3)' },
  solemne: { bg: 'from-blue-900/30 to-sky-800/10', border: 'border-blue-400/40', shadow: 'shadow-blue-400/20', decoracion: '⛪', particula: '💙', textColor: 'text-blue-200', glow: 'rgba(59,130,246,0.3)' },
  regio: { bg: 'from-violet-900/30 to-purple-800/10', border: 'border-violet-400/40', shadow: 'shadow-violet-400/20', decoracion: '⚔️', particula: '👑', textColor: 'text-violet-200', glow: 'rgba(139,92,246,0.3)' },
  fuego: { bg: 'from-orange-900/30 to-red-800/10', border: 'border-orange-400/40', shadow: 'shadow-orange-400/20', decoracion: '🔥', particula: '💥', textColor: 'text-orange-200', glow: 'rgba(249,115,22,0.3)' },
  sagrado: { bg: 'from-cyan-900/30 to-teal-800/10', border: 'border-cyan-400/40', shadow: 'shadow-cyan-400/20', decoracion: '✨', particula: '💎', textColor: 'text-cyan-200', glow: 'rgba(34,211,238,0.3)' },
  mariano: { bg: 'from-pink-900/30 to-rose-800/10', border: 'border-pink-400/40', shadow: 'shadow-pink-400/20', decoracion: '🌹', particula: '🌸', textColor: 'text-pink-200', glow: 'rgba(244,114,182,0.3)' },
  default: { bg: 'from-gray-800/30 to-gray-900/20', border: 'border-white/10', shadow: 'shadow-white/5', decoracion: '📖', particula: '•', textColor: 'text-white/80', glow: 'rgba(255,255,255,0.1)' },
};

const Mapa = () => {
  const { nivelActual, nivelesCompletados, vidas, iniciarLeccion } = useGame();
  const [unidades, setUnidades] = useState([]);
  const [efectoUnidad, setEfectoUnidad] = useState(null);
  const [estrellas] = useState(() => {
    const arr = [];
    for (let i = 0; i < 80; i++) {
      arr.push({ id: i, left: Math.random() * 100, top: Math.random() * 100, size: 1 + Math.random() * 3, delay: Math.random() * 5, duration: 2 + Math.random() * 4 });
    }
    return arr;
  });
  const [particulas, setParticulas] = useState([]);

  useEffect(() => {
    setUnidades(nivelesData.unidades);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (unidades.length === 0) return;
      const reino = unidades[Math.floor(Math.random() * unidades.length)];
      const estilo = REINO_ESTILOS[reino.tema] || REINO_ESTILOS.default;
      const id = Date.now() + Math.random();
      setParticulas(prev => [...prev, { id, left: Math.random() * 100, icono: estilo.particula, duracion: 5 + Math.random() * 5 }]);
      setTimeout(() => setParticulas(prev => prev.filter(p => p.id !== id)), 6000);
    }, 2000);
    return () => clearInterval(interval);
  }, [unidades]);

  const isUnidadDesbloqueada = (idx) => {
    if (idx === 0) return true;
    let acum = 0;
    for (let i = 0; i < idx; i++) acum += unidades[i]?.lecciones.length || 0;
    return nivelActual > acum;
  };

  const isLeccionCompletada = (id) => nivelesCompletados.includes(id);

  const handleIniciarLeccion = (leccion, uIdx, lIdx) => {
    if (vidas <= 0) return;
    if (!isUnidadDesbloqueada(uIdx)) return;
    if (lIdx > 0 && !isLeccionCompletada(unidades[uIdx].lecciones[lIdx - 1]?.id)) return;
    iniciarLeccion(leccion);
  };

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
      confetti({ particleCount: 300, spread: 150, origin: { y: 0.5 }, colors: ['#facc15', '#ffffff', '#a855f7'] });
      setTimeout(() => confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#facc15', '#ffffff'] }), 300);
      setTimeout(() => setEfectoUnidad(null), 3000);
    }
  }, [nivelesCompletados, unidades]);

  return (
    <div className="relative py-8 space-y-16 overflow-x-hidden">
      {/* Estrellas fijas */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {estrellas.map(star => (
          <div key={star.id} className="absolute rounded-full bg-white animate-twinkle"
            style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size, animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s`, opacity: 0.3 + Math.random() * 0.5 }} />
        ))}
      </div>
      {/* Partículas flotantes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particulas.map(p => (
          <div key={p.id} className="absolute text-lg animate-float-up" style={{ left: `${p.left}%`, top: '100%', animationDuration: `${p.duracion}s` }}>{p.icono}</div>
        ))}
      </div>

      {/* Encabezado */}
      <div className="relative z-10 text-center px-4">
        <div className="inline-block mb-2 px-4 py-1 rounded-full bg-yellow-400/20 backdrop-blur border border-yellow-400/40">
          <p className="text-[9px] font-black text-yellow-300 uppercase tracking-[0.5em]">Aventura espiritual</p>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter mt-2 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent animate-glow-text">Sendero de Luz</h1>
        <p className="text-white/40 text-sm mt-2 max-w-md mx-auto">Explora cada reino, completa lecciones y desbloquea la gloria celestial</p>
      </div>

      {vidas <= 0 && (
        <div className="relative z-10 glass-card rounded-2xl p-4 text-center border border-red-500/30 max-w-md mx-auto animate-pulse">
          <p className="text-red-400 font-black text-sm">❤️ Sin vidas — regresa en unas horas</p>
        </div>
      )}

      {unidades.map((unidad, uIdx) => {
        const desbloqueada = isUnidadDesbloqueada(uIdx);
        const estilo = REINO_ESTILOS[unidad.tema] || REINO_ESTILOS.default;
        const completadas = unidad.lecciones.filter(l => nivelesCompletados.includes(l.id)).length;
        const progreso = (completadas / unidad.lecciones.length) * 100;
        const gradiente = GRADIENTES[unidad.tema] || GRADIENTES.default;
        const reinoCompleto = completadas === unidad.lecciones.length;

        return (
          <div key={unidad.id} className={`relative z-10 mx-4 rounded-3xl p-6 transition-all duration-700 bg-gradient-to-br ${estilo.bg} border ${estilo.border} shadow-xl backdrop-blur-sm transform hover:scale-[1.01] ${desbloqueada ? 'opacity-100' : 'opacity-90'}`} style={{ boxShadow: `0 0 20px ${estilo.glow}` }}>
            {efectoUnidad === uIdx && <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/30 via-transparent to-transparent animate-pulse pointer-events-none" />}
            <div className="absolute -top-8 -right-8 text-7xl opacity-30 pointer-events-none animate-float">{estilo.decoracion}</div>
            <div className="absolute -bottom-6 -left-6 text-7xl opacity-20 pointer-events-none animate-float-delay">{estilo.decoracion}</div>

            <div className="flex items-center gap-4 mb-6 flex-wrap relative z-10">
              <div className="text-6xl drop-shadow-lg">{unidad.icono}</div>
              <div className="flex-1">
                <h2 className={`text-2xl font-black ${estilo.textColor} tracking-tighter`}>{unidad.nombre}</h2>
                <p className="text-white/50 text-sm">{unidad.subtitulo}</p>
              </div>
              {!desbloqueada && (
                <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <span className="text-white/70 text-xs font-black">Bloqueado</span>
                </div>
              )}
              {desbloqueada && reinoCompleto && (
                <div className="bg-green-500/30 backdrop-blur-sm rounded-full px-4 py-1.5 border border-green-400/60 animate-pulse">
                  <span className="text-green-300 text-sm font-black">✨ Reino completado ✨</span>
                </div>
              )}
            </div>

            {desbloqueada ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {unidad.lecciones.map((leccion, lIdx) => {
                    const completada = isLeccionCompletada(leccion.id);
                    const bloqueada = lIdx > 0 && !isLeccionCompletada(unidad.lecciones[lIdx - 1]?.id);
                    const disponible = !bloqueada;
                    return (
                      <button
                        key={leccion.id}
                        onClick={() => disponible && handleIniciarLeccion(leccion, uIdx, lIdx)}
                        disabled={!disponible || vidas <= 0}
                        className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                          completada
                            ? 'glass-card border-green-400/60 bg-green-500/15 shadow-green-400/30'
                            : disponible
                            ? 'glass-card border-white/20 hover:border-yellow-400/60 hover:shadow-yellow-400/30 hover:bg-white/10'
                            : 'glass-card border-white/5 opacity-40 cursor-not-allowed'
                        }`}
                        style={{ backdropFilter: 'blur(12px)', transition: 'all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1)' }}
                      >
                        <span className="text-5xl drop-shadow-md transition-transform duration-200 group-hover:scale-110">{leccion.icono}</span>
                        <p className="font-black text-base mt-3 text-center break-words max-w-[100px] leading-tight">{leccion.nombre}</p>
                        {completada && (
                          <div className="absolute -top-3 -right-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full w-7 h-7 flex items-center justify-center text-sm font-black shadow-lg animate-bounce">
                            ✓
                          </div>
                        )}
                        {!disponible && !completada && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl backdrop-blur-sm">
                            <span className="text-4xl drop-shadow-lg">🔒</span>
                          </div>
                        )}
                        {disponible && !completada && (
                          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
                              style={{ boxShadow: `inset 0 0 25px ${estilo.glow}, 0 0 15px ${estilo.glow}` }} />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Barra de progreso CORREGIDA */}
                <div className="mt-8">
                  <div className="flex justify-between items-center text-white/40 text-[10px] mb-2 font-mono">
                    <span className="flex items-center gap-1"><span className="text-yellow-400">✨</span> Progreso del reino</span>
                    <span className="font-black">{completadas} / {unidad.lecciones.length}</span>
                  </div>
                  <div className="h-3 bg-white/15 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progreso}%`, background: gradiente }} />
                  </div>
                  {progreso === 100 && (
                    <div className="text-center mt-2 text-yellow-400/80 text-[10px] font-black animate-pulse">
                      🌟 Reino completado - ¡Sigue adelante! 🌟
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-black/40 rounded-full backdrop-blur">
                  <span className="text-5xl animate-pulse">🔒</span>
                </div>
                <p className="text-white/40 text-sm mt-4 max-w-xs mx-auto">Completa el reino anterior para desbloquear esta tierra sagrada</p>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full mx-auto mt-4" />
              </div>
            )}
          </div>
        );
      })}

      <div className="relative z-10 text-center py-8">
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
        <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mt-4">Que la luz te guíe</p>
      </div>
    </div>
  );
};

export default Mapa;