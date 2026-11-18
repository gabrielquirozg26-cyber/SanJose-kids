// src/views/Mapa.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion';
import './Mapa.css';
import GuiaLuz from '../components/GuiaLuz';
import { PersonajeLeccion } from '../components/leccion/CompaneroLeccion';
import confetti from 'canvas-confetti';
import nivelesData from '../data/niveles.json';
import { esReinoDesbloqueado } from '../utils/progreso';

// ── SONIDOS ──────────────────────────────────────────────────────────────
const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    switch (type) {
      case 'reino_completado':
        oscillator.frequency.setValueAtTime(523, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(659, audioCtx.currentTime + 0.1);
        oscillator.frequency.linearRampToValueAtTime(784, audioCtx.currentTime + 0.2);
        oscillator.frequency.linearRampToValueAtTime(1047, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
        break;
      default:
        break;
    }
    audioCtx.resume();
  } catch (e) {}
};

// ── VIBRACIÓN ────────────────────────────────────────────────────────────
const vibrate = (pattern) => {
  try {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  } catch (e) {}
};

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

// ── COMPONENTE DE PARTÍCULAS ────────────────────────────────────────────
const BackgroundParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const nuevas = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 5,
      opacity: 0.1 + Math.random() * 0.4,
      color: ['#facc15', '#a855f7', '#3b82f6', '#ec4899', '#22c55e', '#f97316'][
        Math.floor(Math.random() * 6)
      ],
    }));
    setParticles(nuevas);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, p.opacity, 0],
            x: [p.x, p.x + (Math.random() - 0.5) * 15, p.x],
            y: [p.y, p.y + (Math.random() - 0.5) * 15, p.y],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}30`,
          }}
        />
      ))}
    </div>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
const Mapa = ({ onIniciarExamen }) => {
  const {
    nivelesCompletados,
    vidas,
    iniciarLeccion,
    examenesAprobados,
  } = useGame();

  const reducedMotion = useReducedMotion();
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
        opacity: 0.2 + Math.random() * 0.5,
      });
    }
    return arr;
  });

  // ── CARGAR UNIDADES ──
  useEffect(() => {
    setUnidades(nivelesData.unidades);
  }, []);

  // ── PARTÍCULAS FLOTANTES ──
  useEffect(() => {
    if (unidades.length === 0 || reducedMotion) return;
    const interval = setInterval(() => {
      const reino = unidades[Math.floor(Math.random() * unidades.length)];
      const estilo = obtenerEstiloReino(reino.tema);
      const id = Date.now() + Math.random();
      setParticulas(prev => [...prev, {
        id,
        left: Math.random() * 100,
        icono: estilo.particula,
        duracion: 4 + Math.random() * 4,
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

      // Sonido y vibración
      playSound('reino_completado');
      vibrate([100, 50, 100]);

      if (!reducedMotion) confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#facc15', '#ffffff', '#a855f7', '#3b82f6', '#22c55e'],
      });
      setTimeout(() => {
        if (!reducedMotion) confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#facc15', '#ffffff'],
        });
      }, 300);

      showToast('🌟 ¡Reino completado! Sigue adelante', 'success', 3000);
      setTimeout(() => setEfectoUnidad(null), 3500);
    }
  }, [nivelesCompletados, unidades]);

  // ── FUNCIONES ──
  const isUnidadDesbloqueada = (idx) =>
    esReinoDesbloqueado(unidades, idx, nivelesCompletados);

  const isLeccionCompletada = (id) => nivelesCompletados.includes(id);

  const handleIniciarLeccion = async (leccion, uIdx, lIdx) => {
    if (vidas <= 0) {
      showToast('❤️ Sin vidas — regresa en unas horas', 'warning', 3000);
      return;
    }
    if (!isUnidadDesbloqueada(uIdx)) {
      showToast(`Completa el reino ${unidades[uIdx-1].nombre} para continuar.`, 'warning', 4000);
      return;
    }
    if (lIdx > 0 && !isLeccionCompletada(unidades[uIdx].lecciones[lIdx - 1]?.id)) {
      showToast(`Completa ${unidades[uIdx].lecciones[lIdx-1].nombre} para continuar.`, 'warning', 4000);
      return;
    }
    try {
      const iniciada = await iniciarLeccion(leccion);
      if (!iniciada) showToast('Espera a que termine de abrirse la lección.', 'info');
    } catch (error) {
      showToast(error.message || 'No se pudo abrir la lección. Revisa tu conexión.', 'warning', 4000);
    }
  };

  const totalLecciones = unidades.reduce((acc, u) => acc + u.lecciones.length, 0);
  const progresoGlobal = totalLecciones ? Math.min(100, nivelesCompletados.length / totalLecciones * 100) : 0;
  const siguiente = unidades.flatMap((u, uIdx) => u.lecciones.map((leccion, lIdx) => ({leccion, uIdx, lIdx}))).find(({leccion,uIdx,lIdx}) => !isLeccionCompletada(leccion.id) && isUnidadDesbloqueada(uIdx) && (lIdx === 0 || isLeccionCompletada(unidades[uIdx].lecciones[lIdx-1].id)));
  const etiqueta = nombre => nombre.replace(/\b(Del|De|La|Las|Los|El|Y)\b/g, palabra => palabra.toLowerCase());
  const abrir = (leccion,uIdx,lIdx) => {
    if (leccion.tipo === 'examen' && vidas > 0 && isUnidadDesbloqueada(uIdx) && (lIdx === 0 || isLeccionCompletada(unidades[uIdx].lecciones[lIdx-1].id))) { onIniciarExamen?.(unidades[uIdx].id, unidades[uIdx].nombre); return; }
    handleIniciarLeccion(leccion,uIdx,lIdx);
  };

  // ── ANIMACIONES ──
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="mapa-sendero">
        {/* ── PARTÍCULAS DE FONDO ── */}
        {!reducedMotion && <BackgroundParticles />}

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

        <motion.header
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mapa-portada"
        >
          <div className="mapa-portada-contenido">
            <p className="mapa-portada-etiqueta">🧭 Tu mapa de aventuras</p>
            <h1>Sendero de Luz</h1>
            <p>¡Hola, aventurero! Aprende, explora y descubre los tesoros de cada reino.</p>
          </div>
          <div className="mapa-guia"><GuiaLuz /><p>¡Un paso más, una luz más!</p></div>
          <div className="mapa-resumen">
            <div className="mapa-progreso-texto">
              <span>Progreso total</span>
              <strong>{Math.round(progresoGlobal)}%</strong>
            </div>
            <div className="mapa-barra" role="progressbar" aria-label="Progreso total" aria-valuenow={Math.round(progresoGlobal)}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progresoGlobal}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            {siguiente && (
              <div className="mapa-resumen-siguiente">
                <p>Próxima actividad <strong>{etiqueta(siguiente.leccion.nombre)}</strong></p>
                <button type="button" className="mapa-continuar" onClick={() => {
                  const {leccion,uIdx,lIdx}=siguiente;
                  const boton=document.getElementById('mapa-'+leccion.id);
                  boton?.scrollIntoView({behavior:reducedMotion ? 'instant' : 'smooth',block:'center'});
                  boton?.focus({preventScroll:true});
                  window.setTimeout(() => abrir(leccion,uIdx,lIdx),reducedMotion ? 0 : 500);
                }}>¡Continuar! <span aria-hidden="true">→</span></button>
              </div>
            )}
          </div>
        </motion.header>

        <AnimatePresence>
          {vidas <= 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mapa-aviso"
              role="status"
            >
              <span aria-hidden="true">♥</span>
              <p><strong>Sin vidas</strong> Regresa en unas horas para continuar.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="mapa-recorrido" aria-labelledby="mapa-reinos">
          <div className="mapa-recorrido-titulo">
            <h2 id="mapa-reinos">Los reinos</h2>
            <span>{unidades.length} reinos · {totalLecciones} actividades</span>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mapa-ruta"
          >
            {unidades.map((unidad, uIdx) => {
              const desbloqueada = isUnidadDesbloqueada(uIdx);
              const completadas = unidad.lecciones.filter(l => nivelesCompletados.includes(l.id)).length;
              const progreso = (completadas / unidad.lecciones.length) * 100;
              const reinoCompleto = completadas === unidad.lecciones.length;

              return (
                <motion.section
                  key={unidad.id}
                  variants={itemVariants}
                  className={`mapa-reino ${!desbloqueada ? 'mapa-reino-locked' : ''}`}
                  data-tema={unidad.tema}
                  aria-labelledby={`mapa-reino-${unidad.id}`}
                >
                  <span className="mapa-hito" aria-hidden="true">{uIdx + 1}</span>

                  {efectoUnidad === uIdx && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mapa-celebracion animate-pulse"
                    />
                  )}

                  <header className="mapa-reino-header">
                    <span className="mapa-reino-icono" aria-hidden="true">{unidad.icono}</span>
                    <div>
                      <h3 id={`mapa-reino-${unidad.id}`}>{unidad.nombre}</h3>
                      <p>{unidad.subtitulo}</p>
                    </div>
                    {!desbloqueada && <span className="mapa-estado">Bloqueado</span>}
                    {desbloqueada && reinoCompleto && <span className="mapa-estado mapa-estado-completo">✓ Completado</span>}
                    {desbloqueada && <span className="mapa-companero-reino" aria-hidden="true"><PersonajeLeccion personaje={uIdx % 3 === 0 ? 'angel' : uIdx % 3 === 1 ? 'francisco' : 'lucy'}/></span>}
                  </header>

                  {desbloqueada ? (
                    <div className="mapa-reino-contenido">
                      <div className="mapa-reino-progreso">
                        <div className="mapa-progreso-texto">
                          <span>Progreso del reino</span>
                          <strong>{completadas} / {unidad.lecciones.length}</strong>
                        </div>
                        <div className="mapa-barra" role="progressbar" aria-label={`Progreso de ${unidad.nombre}`} aria-valuenow={Math.round(progreso)}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progreso}%` }}
                            transition={{ duration: 1, delay: uIdx * 0.05 }}
                          />
                        </div>
                      </div>
                      <div className="mapa-actividades">
                        {unidad.lecciones.map((leccion, lIdx) => {
                          const completada = isLeccionCompletada(leccion.id);
                          const bloqueada = lIdx > 0 && !isLeccionCompletada(unidad.lecciones[lIdx - 1]?.id);
                          const disponible = !bloqueada;
                          const actual = siguiente?.leccion.id === leccion.id;
                          const esExamen = leccion.tipo === 'examen';

                          return (
                            <motion.button
                              key={leccion.id}
                              type="button"
                              whileHover={disponible && !esExamen ? { y: -3 } : {}}
                              whileTap={disponible ? { scale: 0.98 } : {}}
                              id={'mapa-'+leccion.id}
                              aria-current={actual ? 'step' : undefined}
                              aria-label={etiqueta(leccion.nombre) + (bloqueada ? ', bloqueada' : '') + (completada ? ', completada' : '')}
                              onClick={() => abrir(leccion,uIdx,lIdx)}
                              className={`mapa-leccion ${actual ? 'is-current' : ''} ${completada ? 'is-complete' : ''} ${!disponible && !completada ? 'is-locked' : ''} ${esExamen ? 'is-exam' : ''}`}
                            >
                              <span className="mapa-leccion-icono" aria-hidden="true">{esExamen ? '🎓' : leccion.icono}</span>
                              <span className="mapa-leccion-texto">
                                <span className="mapa-leccion-estado">
                                  {actual ? 'Siguiente' : completada ? 'Completada' : bloqueada ? 'Bloqueada' : 'Disponible'}
                                </span>
                                <span className="mapa-lesson-label">{etiqueta(leccion.nombre)}</span>
                              </span>
                              <span className="mapa-leccion-indicador" aria-hidden="true">
                                {completada ? '✓' : bloqueada ? <span className="mapa-candado" /> : '→'}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                      <button type="button" className="mapa-examen" onClick={() => {
                        if (!reinoCompleto) { showToast('Completa todas las lecciones de este reino para abrir su examen.', 'warning'); return; }
                        if (vidas <= 0) { showToast('Recupera vidas antes de comenzar el examen.', 'warning'); return; }
                        onIniciarExamen?.(unidad.id, unidad.nombre);
                      }}>
                        <span aria-hidden="true">🎓</span>
                        <span>{examenesAprobados.includes(unidad.id) ? '✓ Examen aprobado · Practicar' : reinoCompleto ? 'Comenzar examen del reino' : 'Examen · Completa las lecciones para desbloquear'}</span>
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="mapa-locked-message" onClick={() => showToast(`Completa ${unidades[uIdx-1].nombre} para continuar.`, "warning", 4000)}>
                      <span className="mapa-candado" aria-hidden="true" />
                      <span>Completa <strong>{unidades[uIdx-1]?.nombre}</strong> para desbloquear este reino.</span>
                    </button>
                  )}
                </motion.section>
              );
            })}
          </motion.div>
        </section>
      </div>
    </MotionConfig>
  );
};

export default Mapa;
