// src/components/leccion/PantallaVictoria.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { calcularPrecision, obtenerRango } from '../../utils/leccionHelpers';

// ── ESTRELLAS DE FONDO ──────────────────────────────────────────────────
const BackgroundStars = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const nuevasEstrellas = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
      opacity: 0.2 + Math.random() * 0.6,
    }));
    setStars(nuevasEstrellas);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, star.opacity, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
        />
      ))}
    </div>
  );
};

const PantallaVictoria = ({
  oracion,
  monedasGanadas,
  errores,
  totalVersos,
  escudosUsados,
  onVolverMapa,
}) => {
  const precision = calcularPrecision(totalVersos - errores, totalVersos);
  const rango = obtenerRango(precision);
  const esPerfecta = errores === 0 && totalVersos > 0;
  const [mostrarConfeti, setMostrarConfeti] = useState(false);

  // ── CONFETI Y EFECTOS ──
  useEffect(() => {
    // Vibrar
    try {
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100, 50, 200]);
      }
    } catch (e) {}

    // Confeti masivo
    const lanzarConfeti = () => {
      const colors = esPerfecta
        ? ['#facc15', '#ffffff', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f97316']
        : ['#facc15', '#ffffff', '#3b82f6', '#10b981', '#a855f7'];

      confetti({
        particleCount: esPerfecta ? 400 : 250,
        spread: 150,
        origin: { y: 0.3 },
        colors: colors,
        startVelocity: 30,
        ticks: 300,
      });

      setTimeout(() => {
        confetti({
          particleCount: esPerfecta ? 200 : 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#facc15', '#ffdd00', '#ffffff'],
        });
      }, 400);

      if (esPerfecta) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 120,
            origin: { y: 0.2 },
            colors: ['#facc15', '#ff6b6b', '#ffd93d', '#a855f7', '#4d96ff'],
            shapes: ['star', 'circle'],
          });
        }, 800);
      }
    };

    lanzarConfeti();
    setMostrarConfeti(true);
  }, [esPerfecta]);

  // ── ANIMACIONES ──
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 15,
        delay: 0.3,
      },
    },
  };

  const glowVariants = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── FONDO CON ESTRELLAS ── */}
      <BackgroundStars />

      {/* ── EFECTOS DE LUZ ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-400/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      {/* ── CONTENEDOR PRINCIPAL ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md z-10"
      >
        {/* Efecto de brillo exterior */}
        <div
          className={`absolute -inset-4 rounded-3xl blur-2xl ${
            esPerfecta
              ? 'bg-gradient-to-r from-yellow-400/30 via-pink-500/20 to-purple-500/30'
              : 'bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-yellow-400/20'
          } animate-pulse`}
        />

        <div className="relative glass-card rounded-3xl p-6 sm:p-8 border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* ── DECORACIONES INTERNAS ── */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/5 rounded-full blur-[80px]" />

          {/* ── ICONO CON GLOW ── */}
          <motion.div variants={iconVariants} className="flex justify-center mb-4">
            <div className="relative">
              <motion.div
                variants={glowVariants}
                initial="initial"
                animate="animate"
                className={`absolute -inset-4 rounded-full ${
                  esPerfecta
                    ? 'bg-gradient-to-r from-yellow-400/30 to-amber-400/30 blur-2xl'
                    : 'bg-yellow-400/20 blur-xl'
                }`}
              />
              <div
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full ${
                  esPerfecta
                    ? 'bg-gradient-to-br from-yellow-400/20 to-amber-400/20 border-2 border-yellow-400/60 shadow-[0_0_60px_rgba(250,204,21,0.3)]'
                    : 'bg-gradient-to-br from-yellow-400/10 to-amber-400/10 border-2 border-yellow-400/30 shadow-[0_0_40px_rgba(250,204,21,0.15)]'
                } flex items-center justify-center text-6xl sm:text-7xl`}
              >
                {oracion.icono || '🌟'}
              </div>

              {/* Badge de perfecto */}
              {esPerfecta && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-400 flex items-center justify-center shadow-lg shadow-yellow-400/50"
                >
                  <span className="text-lg">⭐</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ── TÍTULO ── */}
          <motion.div variants={itemVariants} className="text-center space-y-2">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
              🎉 Nivel completado
            </p>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tighter ${
                esPerfecta
                  ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent'
                  : 'text-white'
              }`}
            >
              {oracion.nombre}
            </h1>
          </motion.div>

          {/* ── RANGO ── */}
          <motion.div variants={itemVariants} className="flex justify-center mt-2">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border ${rango.bg} shadow-lg`}>
              <span className="text-xl">{rango.icono}</span>
              <span className={`font-black text-sm tracking-widest ${rango.color}`}>
                {rango.label}
              </span>
            </div>
          </motion.div>

          {/* ── STATS ── */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mt-4">
            <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-yellow-400/20 hover:border-yellow-400/40 transition-all">
              <motion.p
                className="text-2xl sm:text-3xl mb-1"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🪙
              </motion.p>
              <p className="text-yellow-400 font-black text-lg sm:text-xl">+{monedasGanadas}</p>
              <p className="text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5">
                Monedas
              </p>
            </div>

            <div
              className={`glass-card rounded-2xl p-3 sm:p-4 text-center border transition-all ${
                precision === 100
                  ? 'border-green-400/30 hover:border-green-400/60 bg-green-500/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <p className="text-2xl sm:text-3xl mb-1">{precision === 100 ? '💯' : '🎯'}</p>
              <p className={`font-black text-lg sm:text-xl ${precision === 100 ? 'text-green-400' : 'text-white'}`}>
                {precision}%
              </p>
              <p className="text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5">
                Precisión
              </p>
            </div>

            <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-white/10 hover:border-white/20 transition-all">
              <p className="text-2xl sm:text-3xl mb-1">📖</p>
              <p className="text-white font-black text-lg sm:text-xl">{totalVersos}</p>
              <p className="text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5">
                Versos
              </p>
            </div>
          </motion.div>

          {/* ── ESCUDOS USADOS ── */}
          {escudosUsados > 0 && (
            <motion.div
              variants={itemVariants}
              className="glass-card rounded-2xl p-3 sm:p-4 border border-yellow-400/20 bg-yellow-400/5 flex items-center gap-3"
            >
              <span className="text-2xl sm:text-3xl">🛡️</span>
              <div>
                <p className="text-yellow-400 font-black text-sm">Escudo de San Miguel</p>
                <p className="text-white/40 text-xs">
                  Absorbió {escudosUsados} error{escudosUsados > 1 ? 'es' : ''}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── BARRA DE PRECISIÓN ── */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-2xl p-4 border border-white/10 space-y-2"
          >
            <div className="flex justify-between items-center">
              <p className="text-[9px] sm:text-[10px] font-black text-white/50 uppercase tracking-widest">
                📊 Precisión total
              </p>
              <p
                className={`text-xs sm:text-sm font-black ${
                  precision === 100
                    ? 'text-green-400'
                    : precision >= 80
                    ? 'text-yellow-400'
                    : 'text-white/60'
                }`}
              >
                {totalVersos - errores}/{totalVersos} correctas
              </p>
            </div>
            <div className="h-2 sm:h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  precision === 100
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : precision >= 80
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${precision}%` }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* ── FRASE MOTIVACIONAL ── */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.p
              className="text-white/40 text-xs sm:text-sm italic px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {esPerfecta
                ? `✨ "${oracion.nombre}" grabada en tu corazón. ¡Sin errores! ✨`
                : precision >= 80
                ? `🔥 Casi memorizas toda la oración. ¡Sigue así! 🔥`
                : `📖 Cada práctica te acerca más a memorizar "${oracion.nombre}".`}
            </motion.p>
          </motion.div>

          {/* ── BOTÓN ── */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onVolverMapa}
              className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 text-blue-900 font-black text-base sm:text-lg uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <span>🗺️</span>
              Volver al Mapa
              <span>✨</span>
            </motion.button>
          </motion.div>

          {/* ── FOOTER ── */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-white/10 text-[8px] font-black uppercase tracking-[0.5em]">
              ✧ San JoseKids · Caminando en la fe ✧
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PantallaVictoria;