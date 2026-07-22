import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ── EFECTOS DE SONIDO ────────────────────────────────────────────────────
const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    switch (type) {
      case 'open':
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
        break;
        
      case 'reveal':
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.12 + 0.3);
          osc.type = 'sine';
          osc.start(audioCtx.currentTime + i * 0.12);
          osc.stop(audioCtx.currentTime + i * 0.12 + 0.3);
        });
        break;
        
      case 'legendary':
        const notes2 = [523, 659, 784, 1047, 1319];
        notes2.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.4);
          osc.type = 'square';
          osc.start(audioCtx.currentTime + i * 0.1);
          osc.stop(audioCtx.currentTime + i * 0.1 + 0.4);
        });
        break;
        
      case 'coin':
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
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

// ── CONFIGURACIÓN DE COFRES ─────────────────────────────────────────────
const COFRE_CONFIG = {
  madera: {
    nombre: 'Cofre de Madera',
    icono: '📦',
    color: 'from-amber-800/40 to-amber-600/20 border-amber-600/50',
    glow: 'shadow-amber-600/20',
    rareza: 'comun',
    mensaje: '¡Has encontrado un santo!',
  },
  plata: {
    nombre: 'Cofre de Plata',
    icono: '🎁',
    color: 'from-slate-400/40 to-slate-300/20 border-slate-400/50',
    glow: 'shadow-slate-400/20',
    rareza: 'raro',
    mensaje: '¡Un santo raro te ha bendecido!',
  },
  oro: {
    nombre: 'Cofre de Oro',
    icono: '🏆',
    color: 'from-yellow-400/40 to-amber-300/20 border-yellow-400/50',
    glow: 'shadow-yellow-400/30',
    rareza: 'legendario',
    mensaje: '✨ ¡Un santo legendario aparece! ✨',
  },
};

const RAREZA_CONFIG = {
  comun: { color: 'border-slate-500/30 bg-slate-500/10 text-slate-300', label: 'Común' },
  raro: { color: 'border-blue-500/30 bg-blue-500/10 text-blue-300', label: 'Raro' },
  legendario: { color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300', label: 'Legendario' },
};

// ── COMPONENTE DE CARTA DE SANTO ────────────────────────────────────────
const CartaSanto = ({ santo, rarezaConfig, esNuevo, esLegendario, compensacion }) => {
  const [imagenCargada, setImagenCargada] = useState(false);
  const [errorImagen, setErrorImagen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3, rotateY: 90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        duration: 0.8,
        delay: 0.3
      }}
      className={`glass-card rounded-2xl p-4 sm:p-6 border-2 ${rarezaConfig.color} relative overflow-hidden`}
      style={{ perspective: 1000 }}
    >
      {/* Fondo decorativo para legendarios */}
      {esLegendario && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-amber-400/10" />
      )}

      {/* Efecto de brillo en borde */}
      {esLegendario && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-pulse" />
      )}

      <div className="flex flex-col items-center gap-3 relative z-10">
        {/* Imagen del santo (como carta del mundial) */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.5 }}
          className={`relative w-40 h-40 sm:w-56 sm:h-56 rounded-xl overflow-hidden border-2 ${
            esLegendario ? 'border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.3)]' : 'border-white/20'
          } bg-gradient-to-b from-gray-800 to-gray-900`}
        >
          {!imagenCargada && !errorImagen && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {errorImagen || !santo.imagen ? (
            <div className="w-full h-full flex items-center justify-center text-6xl sm:text-7xl">
              {santo.icono || '🙏'}
            </div>
          ) : (
            <img
              src={santo.imagen}
              alt={santo.nombre}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                imagenCargada ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImagenCargada(true)}
              onError={() => setErrorImagen(true)}
              loading="lazy"
            />
          )}

          {/* Efecto de brillo al cargar */}
          {imagenCargada && esLegendario && (
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 via-transparent to-transparent" />
          )}
        </motion.div>

        {/* Nombre y rareza */}
        <div className="text-center">
          <p className={`text-xl sm:text-2xl font-black ${rarezaConfig.color}`}>
            {santo.nombre}
          </p>
          <div className={`inline-block px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${rarezaConfig.color}`}>
            {santo.rareza}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-white/60 text-xs sm:text-sm text-center leading-relaxed max-w-xs">
          {santo.descripcion}
        </p>

        {/* Badge de nuevo/repetido */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            esNuevo 
              ? 'bg-green-500/20 border border-green-400/40 text-green-400' 
              : 'bg-yellow-500/20 border border-yellow-400/40 text-yellow-400'
          }`}
        >
          {esNuevo ? '🆕 ¡Nuevo!' : `🔄 Repetido · +${compensacion} 🪙`}
        </motion.div>
      </div>
    </motion.div>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
const CofreGracia = ({ tipoCofre, recompensa, onCerrar }) => {
  const [estado, setEstado] = useState('cerrado');
  const [mostrarSanto, setMostrarSanto] = useState(false);
  const [particulas, setParticulas] = useState([]);
  const [brilloIntensidad, setBrilloIntensidad] = useState(0);
  const containerRef = useRef(null);

  const config = COFRE_CONFIG[tipoCofre] || COFRE_CONFIG.madera;
  const rarezaConfig = RAREZA_CONFIG[recompensa?.santo?.rareza] || RAREZA_CONFIG.comun;
  const esNuevo = recompensa?.tipo === 'nuevo';
  const esRepetido = recompensa?.tipo === 'repetido';
  const esLegendario = recompensa?.santo?.rareza === 'legendario';

  // ── GENERAR PARTÍCULAS ──
  useEffect(() => {
    if (estado === 'abriendo') {
      const nuevasParticulas = [];
      const colores = esLegendario 
        ? ['#facc15', '#ffffff', '#ff8c00', '#ffdd00', '#ff6b6b', '#a855f7']
        : ['#facc15', '#ffffff', '#ff8c00', '#ffdd00', '#3b82f6'];
      
      for (let i = 0; i < (esLegendario ? 50 : 30); i++) {
        nuevasParticulas.push({
          id: i,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          size: 2 + Math.random() * (esLegendario ? 10 : 6),
          delay: Math.random() * 0.5,
          duration: 0.8 + Math.random() * 0.6,
          color: colores[Math.floor(Math.random() * colores.length)]
        });
      }
      setParticulas(nuevasParticulas);
    }
  }, [estado, esLegendario]);

  // ── EFECTO DE BRILLO ──
  useEffect(() => {
    if (estado === 'abriendo') {
      const interval = setInterval(() => {
        setBrilloIntensidad(prev => prev === 0 ? 1 : 0);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [estado]);

  // ── ANIMACIÓN DE APERTURA ──
  useEffect(() => {
    if (estado === 'cerrado') {
      const timer = setTimeout(() => {
        setEstado('abriendo');
        
        playSound('open');
        vibrate([50, 50, 50]);
        
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#facc15', '#ffffff', '#ff8c00', '#ffdd00']
        });
        
        setTimeout(() => {
          setEstado('abierto');
          setMostrarSanto(true);
          
          if (esLegendario) {
            playSound('legendary');
            vibrate([100, 50, 100, 50, 200]);
          } else {
            playSound('reveal');
            vibrate([80, 50, 80]);
          }
          
          if (esNuevo) {
            const intensity = esLegendario ? 400 : 250;
            const colors = esLegendario 
              ? ['#facc15', '#ffffff', '#ff8c00', '#ffdd00', '#ff6b6b', '#a855f7']
              : ['#facc15', '#ffffff', '#ff8c00', '#ffdd00'];
            
            confetti({
              particleCount: intensity,
              spread: 150,
              origin: { y: 0.3 },
              colors: colors
            });
            
            setTimeout(() => {
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#facc15', '#ffdd00', '#ffffff']
              });
            }, 300);
            
            if (esLegendario) {
              setTimeout(() => {
                confetti({
                  particleCount: 200,
                  spread: 130,
                  origin: { y: 0.2 },
                  colors: ['#facc15', '#ff6b6b', '#ffd93d', '#a855f7', '#4d96ff']
                });
              }, 600);
            }
          } else if (esRepetido) {
            playSound('coin');
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#facc15', '#ffdd00']
            });
          }
        }, 1200);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [estado, esLegendario, esNuevo, esRepetido]);

  // ── ANIMACIONES ──
  const cofreVariants = {
    cerrado: {
      scale: 1,
      rotateX: 0,
      transition: { duration: 0.5 }
    },
    abriendo: {
      scale: [1, 1.15, 1],
      rotateX: [0, -15, 0],
      transition: { duration: 0.8, times: [0, 0.5, 1] }
    },
    abierto: {
      scale: 1,
      rotateX: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md"
      >
        {/* Efecto de luz exterior */}
        <div 
          className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${config.color} blur-xl transition-opacity duration-300 ${
            estado === 'abriendo' ? 'opacity-70' : 'opacity-50'
          }`}
          style={{ 
            opacity: estado === 'abriendo' ? 0.5 + brilloIntensidad * 0.3 : 0.5,
            animation: estado === 'abriendo' ? 'pulse-glow 0.6s ease-in-out infinite alternate' : 'none'
          }}
        />

        <div className={`relative glass-card rounded-3xl p-6 sm:p-8 border-2 ${config.color} bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden`}>
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/5 rounded-full blur-[80px]" />

          {/* Partículas flotantes */}
          {estado === 'abriendo' && particulas.map((p, i) => (
            <motion.div
              key={p.id}
              custom={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -60 + Math.random() * 120],
                x: [0, -40 + Math.random() * 80],
              }}
              transition={{
                delay: i * 0.05,
                duration: 1.8 + Math.random() * 0.6,
                ease: 'easeOut'
              }}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`
              }}
            />
          ))}

          <div className="relative z-10 text-center space-y-5">
            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">
                Has recibido un
              </p>
              <h2 className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                {config.nombre}
              </h2>
            </motion.div>

            {/* Cofre */}
            <motion.div
              variants={cofreVariants}
              initial="cerrado"
              animate={estado}
              className="flex justify-center py-4"
              style={{ perspective: 800 }}
            >
              <div className="relative">
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/40 rounded-full blur-md" />
                
                <motion.div
                  className={`text-8xl sm:text-9xl drop-shadow-2xl transition-all duration-500 ${
                    estado === 'abriendo' ? 'scale-110' : ''
                  }`}
                  animate={{
                    rotateY: estado === 'abriendo' ? [0, 25, 0] : 0,
                    scale: estado === 'abierto' ? 1.1 : 1,
                    filter: estado === 'abriendo' ? 'brightness(1.3)' : 'brightness(1)'
                  }}
                  transition={{ duration: 0.8 }}
                >
                  {estado === 'abierto' ? '✨' : config.icono}
                </motion.div>

                {estado === 'abriendo' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 0.6, scale: 2 }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute inset-0 bg-yellow-400/30 rounded-full blur-3xl"
                  />
                )}
              </div>
            </motion.div>

            {/* Mensaje de apertura */}
            <AnimatePresence>
              {estado === 'abriendo' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-yellow-400 font-black text-sm animate-pulse"
                >
                  {esLegendario ? '✨ Abriendo cofre legendario...' : '🔓 Abriendo cofre...'}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Santo revelado (con imagen) */}
            <AnimatePresence>
              {mostrarSanto && recompensa?.santo && (
                <CartaSanto
                  santo={recompensa.santo}
                  rarezaConfig={rarezaConfig}
                  esNuevo={esNuevo}
                  esLegendario={esLegendario}
                  compensacion={recompensa.compensacion}
                />
              )}
            </AnimatePresence>

            {/* Botón cerrar */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: estado === 'abierto' ? 1 : 0.5 }}
              whileHover={estado === 'abierto' ? { scale: 1.05 } : {}}
              whileTap={estado === 'abierto' ? { scale: 0.95 } : {}}
              onClick={() => {
                if (estado === 'abierto') {
                  playSound('coin');
                  onCerrar();
                }
              }}
              className={`w-full py-3 sm:py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest transition-all ${
                estado === 'abierto'
                  ? `bg-gradient-to-r ${config.color} text-white hover:shadow-2xl shadow-xl`
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
              disabled={estado !== 'abierto'}
            >
              {estado === 'abierto' ? '✨ Continuar' : '⏳ Espera...'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes pulse-glow {
          0% { opacity: 0.5; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default CofreGracia;